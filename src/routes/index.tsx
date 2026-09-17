import { createFileRoute } from "@tanstack/react-router";
import { PortfolioPage } from "@/components/portfolio-page";
import { getPortfolio } from "@/lib/portfolio.functions";

// No head() here: the home route inherits title/description/og/twitter from
// __root.tsx, and ships no og:image so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  loader: () => getPortfolio(),
  head: () => ({ meta: [
    { title: "Emad Mashali — UI/UX & Engineering Portfolio" },
    { name: "description", content: "Portfolio of Emad Tamer Mashali, a Computer and Communication Engineering student and UI/UX designer." },
    { property: "og:title", content: "Emad Mashali — UI/UX & Engineering Portfolio" },
    { property: "og:description", content: "Selected UI/UX, web development, and embedded systems work by Emad Mashali." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  return <PortfolioPage data={Route.useLoaderData()} />;
}
