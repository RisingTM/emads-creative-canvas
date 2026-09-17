export type Project = {
  title: string;
  category: string;
  tools: string;
  description: string;
  work: string[];
  outcome: string;
  linkLabel: string;
  link: string;
};

export type Experience = { title: string; subtitle: string; body: string };

export type PortfolioContent = {
  name: string;
  headline: string;
  intro: string[];
  about: string[];
  projects: Project[];
  experience: Experience[];
  skills: Record<string, string[]>;
  certifications: string[];
  learning: string[];
  learningNote: string;
  email: string;
  linkedin: string;
};

export type PortfolioImages = Record<string, string>;

export type PortfolioData = {
  content: PortfolioContent;
  images: PortfolioImages;
  updatedAt: string;
};