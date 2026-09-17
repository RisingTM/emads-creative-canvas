import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ImagePlus, Lock, Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getAdminStatus, getPortfolio, lockPortfolio, savePortfolio, unlockPortfolio, uploadPortfolioImage } from "@/lib/portfolio.functions";
import type { PortfolioContent } from "@/lib/portfolio.types";

export const Route = createFileRoute("/settings")({
  loader: async () => ({ status: await getAdminStatus(), portfolio: await getPortfolio() }),
  head: () => ({ meta: [
    { title: "Portfolio Settings — Emad Mashali" },
    { name: "description", content: "Private portfolio content and image settings." },
    { property: "og:title", content: "Portfolio Settings — Emad Mashali" },
    { property: "og:description", content: "Private portfolio content and image settings." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex,nofollow" },
  ] }),
  component: SettingsPage,
});

const slots = [
  ["portrait", "Portrait"], ["carco", "Carco project"], ["lineFollower", "Line-follower robot"],
  ["obstacleAvoiding", "Obstacle-avoiding robot"], ["events", "Events"],
] as const;

function SettingsPage() {
  const initial = Route.useLoaderData();
  const navigate = useNavigate();
  const unlock = useServerFn(unlockPortfolio);
  const save = useServerFn(savePortfolio);
  const upload = useServerFn(uploadPortfolioImage);
  const lock = useServerFn(lockPortfolio);
  const [unlocked, setUnlocked] = useState(initial.status.unlocked);
  const [password, setPassword] = useState("");
  const [content, setContent] = useState<PortfolioContent>(initial.portfolio.content);
  const [message, setMessage] = useState("");

  async function handleUnlock(event: React.FormEvent) {
    event.preventDefault();
    const result = await unlock({ data: { password } });
    if (result.ok) { setUnlocked(true); setMessage(""); } else setMessage("Incorrect password");
  }

  async function handleImage(slot: typeof slots[number][0], file?: File) {
    if (!file) return;
    setMessage("Uploading image…");
    const dataUrl = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
    await upload({ data: { slot, dataUrl, fileName: file.name } });
    setMessage("Image updated");
  }

  if (!unlocked) return <main className="grid min-h-screen place-items-center bg-ink px-5 text-paper"><form onSubmit={handleUnlock} className="w-full max-w-sm border border-paper/20 p-7"><Lock className="mb-7"/><p className="section-index text-paper/50">Private access</p><h1 className="mt-3 font-display text-4xl">Portfolio settings</h1><label className="mt-8 block text-xs uppercase tracking-widest" htmlFor="password">Password</label><input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 h-12 w-full border border-paper/25 bg-transparent px-3 outline-none focus:border-accent" autoFocus/><Button variant="paper" className="mt-4 w-full" type="submit">Unlock</Button>{message && <p className="mt-3 text-sm text-accent">{message}</p>}<Link to="/" className="mt-6 inline-flex items-center gap-2 text-sm text-paper/60"><ArrowLeft/> Back to portfolio</Link></form></main>;

  return <main className="min-h-screen bg-background px-5 py-8 text-foreground lg:px-8"><div className="mx-auto max-w-5xl"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6"><div><p className="section-index">Private editor</p><h1 className="font-display text-4xl">Portfolio settings</h1></div><div className="flex gap-2"><Button variant="outline" asChild><Link to="/"><ArrowLeft/> Portfolio</Link></Button><Button variant="outline" onClick={async () => { await lock(); setUnlocked(false); }}><Lock/> Lock</Button></div></div>
    <section className="py-10"><h2 className="font-display text-3xl">Images</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{slots.map(([slot,label]) => <label key={slot} className="flex cursor-pointer items-center gap-3 border border-border bg-card p-4 text-sm hover:bg-muted"><ImagePlus/><span>{label}</span><input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => handleImage(slot, e.target.files?.[0])}/></label>)}</div></section>
    <section className="border-t border-border py-10"><h2 className="font-display text-3xl">Main text</h2><div className="mt-6 grid gap-5"><TextField label="Name" value={content.name} onChange={(name) => setContent({...content,name})}/><TextField label="Headline" value={content.headline} onChange={(headline) => setContent({...content,headline})}/><TextArea label="Introduction" value={content.intro.join("\n\n")} onChange={(value) => setContent({...content,intro:value.split(/\n\s*\n/)})}/><TextArea label="About" value={content.about.join("\n\n")} onChange={(value) => setContent({...content,about:value.split(/\n\s*\n/)})}/><TextField label="Email" value={content.email} onChange={(email) => setContent({...content,email})}/><TextField label="LinkedIn URL" value={content.linkedin} onChange={(linkedin) => setContent({...content,linkedin})}/></div></section>
    <section className="border-t border-border py-10"><h2 className="font-display text-3xl">Projects</h2><div className="mt-6 space-y-8">{content.projects.map((project,index) => <div key={index} className="grid gap-4 border-l-2 border-accent pl-5"><TextField label="Project title" value={project.title} onChange={(title) => setContent({...content,projects:content.projects.map((p,i)=>i===index?{...p,title}:p)})}/><TextArea label="Description" value={project.description} onChange={(description) => setContent({...content,projects:content.projects.map((p,i)=>i===index?{...p,description}:p)})}/><TextField label="Project link" value={project.link} onChange={(link) => setContent({...content,projects:content.projects.map((p,i)=>i===index?{...p,link}:p)})}/></div>)}</div></section>
    <div className="sticky bottom-4 flex items-center justify-between border border-border bg-background/95 p-4 shadow-lg backdrop-blur"><span className="text-sm text-muted-foreground">{message}</span><Button onClick={async () => { setMessage("Saving…"); await save({data:{content}}); setMessage("Changes saved"); await navigate({to:"/"}); }}><Save/> Save changes</Button></div>
  </div></main>;
}

function TextField({label,value,onChange}:{label:string;value:string;onChange:(value:string)=>void}) { return <label className="grid gap-2 text-xs uppercase tracking-widest">{label}<input value={value} onChange={(e)=>onChange(e.target.value)} className="h-11 border border-input bg-background px-3 text-sm normal-case tracking-normal outline-none focus:border-foreground"/></label>; }
function TextArea({label,value,onChange}:{label:string;value:string;onChange:(value:string)=>void}) { return <label className="grid gap-2 text-xs uppercase tracking-widest">{label}<textarea value={value} onChange={(e)=>onChange(e.target.value)} rows={5} className="border border-input bg-background p-3 text-sm normal-case tracking-normal outline-none focus:border-foreground"/></label>; }