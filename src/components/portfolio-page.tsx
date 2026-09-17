import { ArrowDown, ArrowUpRight, Code2, Cpu, ExternalLink, Mail, Menu, Settings, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import type { PortfolioData } from "@/lib/portfolio.types";

const imageSlots = ["carco", "lineFollower", "obstacleAvoiding"];

function Placeholder({ label, className = "" }: { label: string; className?: string }) {
  return <div className={`grid place-items-center bg-placeholder text-placeholder-foreground ${className}`}><span className="font-display text-2xl">{label}</span></div>;
}

export function PortfolioPage({ data }: { data: PortfolioData }) {
  const { content, images } = data;
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <a href="#top" className="font-display text-xl">EM</a>
          <nav className="hidden items-center gap-7 text-xs uppercase tracking-widest md:flex">
            {[["About","about"],["Projects","projects"],["Experience","experience"],["Skills","skills"],["Contact","contact"]].map(([label,id]) => <a key={id} href={`#${id}`} className="transition-opacity hover:opacity-50">{label}</a>)}
          </nav>
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon" title="Settings"><Link to="/settings"><Settings /></Link></Button>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">{menuOpen ? <X /> : <Menu />}</Button>
          </div>
        </div>
        {menuOpen && <nav className="grid gap-4 border-t border-border bg-background px-5 py-5 text-sm uppercase md:hidden">{[["About","about"],["Projects","projects"],["Experience","experience"],["Skills","skills"],["Contact","contact"]].map(([label,id]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}</a>)}</nav>}
      </header>

      <section id="top" className="relative min-h-[94svh] bg-ink pt-16 text-paper">
        <div className="mx-auto grid min-h-[calc(94svh-4rem)] max-w-7xl items-center gap-10 px-5 py-12 lg:grid-cols-[1.1fr_.9fr] lg:px-8">
          <div className="relative z-10 pt-6">
            <p className="mb-5 text-xs uppercase tracking-[.28em] text-paper/60">Portfolio · 2026</p>
            <h1 className="max-w-4xl font-display text-6xl leading-[.9] sm:text-7xl lg:text-8xl">{content.name}</h1>
            <p className="mt-8 max-w-xl text-base leading-7 text-paper/70 sm:text-lg">{content.headline}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild variant="paper"><a href="#projects">View selected work <ArrowDown /></a></Button>
              <Button asChild variant="paperOutline"><a href={`mailto:${content.email}`}>Get in touch <Mail /></a></Button>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-lg lg:ml-auto">
            <div className="absolute -left-5 top-10 h-[82%] w-[86%] border border-paper/25" />
            {images["portrait"] ? <img src={images["portrait"]} alt="Emad Tamer Mashali" className="relative ml-auto aspect-[4/5] w-[88%] object-cover grayscale" /> : <Placeholder label="PORTRAIT" className="relative ml-auto aspect-[4/5] w-[88%]" />}
            <div className="absolute -bottom-5 -left-2 bg-accent px-5 py-4 text-ink"><p className="text-xs uppercase tracking-widest">Based in Egypt</p><p className="font-display text-2xl">Design × Engineering</p></div>
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto grid max-w-7xl gap-10 px-5 py-24 lg:grid-cols-[.45fr_1fr] lg:px-8 lg:py-32">
        <div><p className="section-index">01 / About</p><h2 className="section-title">Curious by<br/><em>design.</em></h2></div>
        <div className="grid gap-10 sm:grid-cols-2">
          <div className="space-y-5 text-lg leading-8">{content.intro.map((p) => <p key={p}>{p}</p>)}</div>
          <div className="border-l border-border pl-6 text-sm leading-7 text-muted-foreground">{content.about.map((p) => <p className="mb-4" key={p}>{p}</p>)}</div>
        </div>
      </section>

      <section id="projects" className="bg-ink py-24 text-paper lg:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <p className="section-index text-paper/50">02 / Selected projects</p>
          <h2 className="section-title mb-16">Ideas made<br/><em>tangible.</em></h2>
          <div className="space-y-24">
            {content.projects.map((project, index) => {
              const image = images[imageSlots[index] ?? ""];
              return <article key={project.title} className={`grid items-center gap-8 lg:grid-cols-2 ${index % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}>
                <div className="relative">
                  {image ? <img src={image} alt={`${project.title} project`} className="aspect-[4/3] w-full object-cover" /> : <Placeholder label={`PROJECT 0${index + 1}`} className="aspect-[4/3] w-full" />}
                  <span className="absolute -bottom-4 right-5 bg-accent px-4 py-2 text-xs uppercase tracking-widest text-ink">{project.category}</span>
                </div>
                <div className="lg:px-8"><span className="text-xs uppercase tracking-widest text-paper/45">{project.tools}</span><h3 className="mt-4 font-display text-4xl sm:text-5xl">{project.title}</h3><p className="mt-5 max-w-xl leading-7 text-paper/65">{project.description}</p><ul className="mt-6 grid gap-2 text-sm text-paper/80 sm:grid-cols-2">{project.work.slice(0,6).map((item) => <li key={item} className="flex gap-2"><span className="text-accent">—</span>{item}</li>)}</ul><p className="mt-6 border-l border-accent pl-4 text-sm leading-6 text-paper/60">{project.outcome}</p>{project.link && <Button asChild variant="paperOutline" className="mt-7"><a href={project.link} target="_blank" rel="noreferrer">{project.linkLabel}<ExternalLink /></a></Button>}</div>
              </article>;
            })}
          </div>
        </div>
      </section>

      <section id="experience" className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-[.45fr_1fr]"><div><p className="section-index">03 / Experience</p><h2 className="section-title">Learning by<br/><em>doing.</em></h2></div><div className="divide-y divide-border border-y border-border">{content.experience.map((item, i) => <article key={item.title} className="grid gap-4 py-8 sm:grid-cols-[3rem_1fr_1.2fr]"><span className="font-display text-2xl text-muted-foreground">0{i+1}</span><div><h3 className="font-display text-2xl">{item.title}</h3><p className="mt-2 text-xs uppercase tracking-widest text-accent-strong">{item.subtitle}</p></div><p className="text-sm leading-7 text-muted-foreground">{item.body}</p></article>)}</div></div>
      </section>

      <section id="skills" className="border-y border-border bg-wash py-24 lg:py-32"><div className="mx-auto max-w-7xl px-5 lg:px-8"><p className="section-index">04 / Capabilities</p><h2 className="section-title mb-14">A growing<br/><em>toolkit.</em></h2><div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">{Object.entries(content.skills).map(([group, skills], i) => <div key={group} className="bg-wash p-7"><div className="mb-8 flex items-center justify-between"><h3 className="font-display text-2xl">{group}</h3>{i === 0 ? <Sparkles /> : i === 1 ? <Code2 /> : <Cpu />}</div><div className="flex flex-wrap gap-2">{skills.map((skill) => <span key={skill} className="border border-border bg-background px-3 py-1.5 text-xs">{skill}</span>)}</div></div>)}</div></div></section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-24 lg:grid-cols-2 lg:px-8 lg:py-32"><div><p className="section-index">05 / Credentials</p><h2 className="section-title">Always<br/><em>learning.</em></h2><p className="mt-7 max-w-md leading-7 text-muted-foreground">{content.learningNote}</p><div className="mt-8 flex flex-wrap gap-2">{content.learning.map((item) => <span key={item} className="bg-ink px-3 py-2 text-xs text-paper">{item}</span>)}</div></div><ol className="divide-y divide-border border-t border-border">{content.certifications.map((item, i) => <li key={item} className="flex gap-5 py-4 text-sm leading-6"><span className="font-display text-muted-foreground">{String(i+1).padStart(2,"0")}</span>{item}</li>)}</ol></section>

      <footer id="contact" className="bg-ink px-5 py-20 text-paper lg:px-8 lg:py-28"><div className="mx-auto max-w-7xl"><p className="section-index text-paper/50">06 / Contact</p><div className="mt-10 flex flex-col justify-between gap-12 lg:flex-row lg:items-end"><div><h2 className="font-display text-5xl leading-none sm:text-7xl">Let’s build<br/><em>something useful.</em></h2><a href={`mailto:${content.email}`} className="mt-8 inline-flex items-center gap-2 border-b border-accent pb-2 text-sm">{content.email}<ArrowUpRight /></a></div><a href={content.linkedin} target="_blank" rel="noreferrer" className="group flex items-center gap-4 font-display text-3xl">LinkedIn <span className="grid size-12 place-items-center border border-paper/30 transition-colors group-hover:bg-paper group-hover:text-ink"><ArrowUpRight /></span></a></div><div className="mt-20 flex justify-between border-t border-paper/15 pt-5 text-xs text-paper/40"><span>© 2026 Emad Tamer Mashali</span><a href="#top">Back to top</a></div></div></footer>
    </main>
  );
}