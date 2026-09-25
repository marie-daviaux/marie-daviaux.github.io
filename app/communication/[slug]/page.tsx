import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CommunicationProjectPage } from "@/components/communication-project";
import {
  communicationProjects,
  getCommunicationProject,
} from "@/lib/communication-projects";
import { getDictionary } from "@/i18n/dictionaries";

const messages = getDictionary();

export function generateStaticParams() {
  return communicationProjects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const projectIndex = communicationProjects.findIndex((project) => project.slug === slug);

  if (projectIndex === -1) {
    return {};
  }

  const project = messages.communication.projects[projectIndex];
  return {
    title: `${project.subtitle} — ${messages.brand.name}`,
    description: project.paragraphs.join(" "),
  };
}

export default async function CommunicationProjectRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getCommunicationProject(slug);

  if (!project) {
    notFound();
  }

  const projectIndex = communicationProjects.findIndex((item) => item.slug === slug);
  return <CommunicationProjectPage projectIndex={projectIndex} />;
}
