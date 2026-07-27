import projects from "@/content/projects.json";

export function getProjects() {
  return [...projects].sort((a, b) => Number(b.year) - Number(a.year));
}

export function getProject(slug) {
  return projects.find((project) => project.slug === slug);
}

export function getGroupedProjects() {
  return getProjects().reduce((groups, project) => {
    if (!groups[project.year]) groups[project.year] = [];
    groups[project.year].push(project);
    return groups;
  }, {});
}

export function getCategories() {
  return [...new Set(projects.map((project) => project.category))];
}
