import { createHash, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { z } from "zod";
import type { PortfolioContent, PortfolioData, PortfolioImages } from "./portfolio.types";
import type { Json } from "@/integrations/supabase/types";

type AdminSession = { portfolioAdmin?: boolean };

function sessionConfig() {
  return {
    password: process.env["PORTFOLIO_SESSION_SECRET"]!,
    name: "emad-portfolio-admin",
    maxAge: 60 * 60 * 8,
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  };
}

async function requireAdmin() {
  const session = await useSession<AdminSession>(sessionConfig());
  if (!session.data.portfolioAdmin) throw new Error("Settings access required");
  return session;
}

function passwordMatches(input: string, expected: string) {
  const left = createHash("sha256").update(input).digest();
  const right = createHash("sha256").update(expected).digest();
  return timingSafeEqual(left, right);
}

export const unlockPortfolio = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ password: z.string().min(1).max(200) }).parse(data))
  .handler(async ({ data }) => {
    const expected = process.env["PORTFOLIO_ADMIN_PASSWORD"];
    if (!expected || !passwordMatches(data.password, expected)) return { ok: false as const };
    const session = await useSession<AdminSession>(sessionConfig());
    await session.update({ portfolioAdmin: true });
    return { ok: true as const };
  });

export const getAdminStatus = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<AdminSession>(sessionConfig());
  return { unlocked: session.data.portfolioAdmin === true };
});

export const lockPortfolio = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<AdminSession>(sessionConfig());
  await session.clear();
  return { ok: true };
});

export const getPortfolio = createServerFn({ method: "GET" }).handler(async (): Promise<PortfolioData> => {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
  const { data, error } = await client.from("portfolio_content").select("content,images,updated_at").eq("id", "main").single();
  if (error) throw new Error("Portfolio content is unavailable");
  const imagePaths = data.images as PortfolioImages;
  const resolved: PortfolioImages = {};
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  for (const [slot, path] of Object.entries(imagePaths)) {
    if (!path) { resolved[slot] = ""; continue; }
    const { data: signed } = await supabaseAdmin.storage.from("portfolio-images").createSignedUrl(path, 3600);
    resolved[slot] = signed?.signedUrl ?? "";
  }
  return { content: data.content as PortfolioContent, images: resolved, updatedAt: data.updated_at };
});

export const savePortfolio = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ content: z.record(z.unknown()) }).parse(data))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("portfolio_content").update({ content: data.content as Json }).eq("id", "main");
    if (error) throw new Error("Could not save the portfolio");
    return { ok: true };
  });

export const uploadPortfolioImage = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ slot: z.enum(["portrait", "carco", "lineFollower", "obstacleAvoiding", "events"]), dataUrl: z.string(), fileName: z.string().max(150) }).parse(data))
  .handler(async ({ data }) => {
    await requireAdmin();
    const match = data.dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
    if (!match || !match[1] || !match[2]) throw new Error("Choose a JPG, PNG, or WebP image");
    const buffer = Buffer.from(match[2], "base64");
    if (buffer.length > 10 * 1024 * 1024) throw new Error("Image must be under 10MB");
    const extension = match[1].split("/")[1] === "jpeg" ? "jpg" : match[1].split("/")[1];
    const path = `${data.slot}.${extension}`;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: uploadError } = await supabaseAdmin.storage.from("portfolio-images").upload(path, buffer, { contentType: match[1], upsert: true });
    if (uploadError) throw new Error("Could not upload this image");
    const { data: row, error: readError } = await supabaseAdmin.from("portfolio_content").select("images").eq("id", "main").single();
    if (readError) throw new Error("Could not update this image");
    const images = { ...(row.images as PortfolioImages), [data.slot]: path };
    const { error: updateError } = await supabaseAdmin.from("portfolio_content").update({ images }).eq("id", "main");
    if (updateError) throw new Error("Could not update this image");
    return { ok: true };
  });