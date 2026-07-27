import { notFound } from "next/navigation";
import { getPhantomProject, phantomProjects } from "../../phantom-data";
import ProjectClient from "./project-client";

export function generateStaticParams() {
  return phantomProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = getPhantomProject(slug);
  if (!project) return {};
  return {
    title: `${project.title} | sammuelXU`,
    description: project.summary
  };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const project = getPhantomProject(slug);
  if (!project) notFound();
  return <ProjectClient project={project} />;
}
