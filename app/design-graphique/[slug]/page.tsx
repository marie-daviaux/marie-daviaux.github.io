import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GraphicDesignProjectPage } from "@/components/graphic-design-project";
import {
  getGraphicDesignProject,
  graphicDesignProjects,
} from "@/lib/graphic-design-projects";
import { getDictionary } from "@/i18n/dictionaries";

const messages = getDictionary();

export function generateStaticParams() {
  return graphicDesignProjects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const projectIndex = graphicDesignProjects.findIndex((project) => project.slug === slug);

  if (projectIndex === -1) {
    return {};
  }

  const project = messages.graphicDesign.projects[projectIndex];
  return {
    title: `${project.subtitle} — ${messages.brand.name}`,
    description: project.paragraphs.join(" "),
  };
}

export default async function GraphicDesignProjectRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getGraphicDesignProject(slug);

  if (!project) {
    notFound();
  }

  const projectIndex = graphicDesignProjects.findIndex((item) => item.slug === slug);
  return <GraphicDesignProjectPage projectIndex={projectIndex} />;
}
