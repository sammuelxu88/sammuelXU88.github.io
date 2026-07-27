import portfolioProjects from "../content/projects.json";

export const phantomProjects = portfolioProjects.map((project) => ({
  ...project,
  title: project.titleCn || project.title,
  titleCn: project.titleCn || project.title,
  category: project.category || "视觉设计",
  zone: project.zone || project.category || "视觉设计",
  region: project.region || "视觉设计",
  tags: project.tags?.length ? project.tags : ["视觉设计"],
  services: project.services?.length ? project.services : project.tags || ["视觉设计"],
  alt: project.alt || `${project.titleCn || project.title} 首页封面`,
  summary: project.summaryCn || project.summary,
  description: project.descriptionCn || project.description
}));

export const featureFilters = [...new Set(phantomProjects.map((project) => project.category))];
export const partnerFilters = [...new Set(phantomProjects.map((project) => project.client))];

export function getPhantomProject(slug) {
  return phantomProjects.find((project) => project.slug === slug);
}

export function groupedByYear(projects = phantomProjects) {
  return projects.reduce((groups, project) => {
    if (!groups[project.year]) groups[project.year] = [];
    groups[project.year].push(project);
    return groups;
  }, {});
}
