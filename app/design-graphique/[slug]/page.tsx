import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GraphicDesignProjectPage } from "@/components/graphic-design-project";
import { getPortfolioProjects } from "@/lib/portfolio-data";
import { getDictionary } from "@/i18n/dictionaries";

const messages = getDictionary();

export const dynamicParams = false;

export async function generateStaticParams() {
  const projects = await getPortfolioProjects("design-graphique");
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const projects = await getPortfolioProjects("design-graphique");
  const project = projects.find((item) => item.slug === slug);

  if (!project) {
    return {};
  }

  return {
    title: `${project.title} — ${messages.brand.name}`,
    description: project.paragraphs.join(" "),
  };
}

export default async function GraphicDesignProjectRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const projects = await getPortfolioProjects("design-graphique");
  const projectIndex = projects.findIndex((project) => project.slug === slug);

  if (projectIndex === -1) {
    notFound();
  }

  return <GraphicDesignProjectPage projectIndex={projectIndex} projects={projects} />;
}
