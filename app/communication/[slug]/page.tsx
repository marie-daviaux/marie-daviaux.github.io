import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CommunicationProjectPage } from "@/components/communication-project";
import { getPortfolioProjects } from "@/lib/portfolio-data";
import { getDictionary } from "@/i18n/dictionaries";

const messages = getDictionary();

export const dynamicParams = false;

export async function generateStaticParams() {
  const projects = await getPortfolioProjects("communication");
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const projects = await getPortfolioProjects("communication");
  const project = projects.find((item) => item.slug === slug);

  if (!project) {
    return {};
  }

  return {
    title: `${project.title} — ${messages.brand.name}`,
    description: project.paragraphs.join(" "),
  };
}

export default async function CommunicationProjectRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const projects = await getPortfolioProjects("communication");
  const projectIndex = projects.findIndex((project) => project.slug === slug);

  if (projectIndex === -1) {
    notFound();
  }

  return <CommunicationProjectPage projectIndex={projectIndex} projects={projects} />;
}
