"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export default function PortfolioIndex({ projects, groupedProjects, categories }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [preview, setPreview] = useState(projects[0]);

  const years = Object.keys(groupedProjects).sort((a, b) => Number(b) - Number(a));
  const filteredGroups = useMemo(() => {
    return years.map((year) => ({
      year,
      projects: groupedProjects[year].filter((project) => activeCategory === "All" || project.category === activeCategory)
    })).filter((group) => group.projects.length);
  }, [activeCategory, groupedProjects, years]);

  return (
    <section className="project-section" id="projects" aria-label="All projects">
      <div className="section-title">
        <div>
          <p className="eyebrow">All projects</p>
          <h2>{projects.length} projects</h2>
        </div>
        <div className="filters" aria-label="Project filters">
          {["All", ...categories].map((category) => (
            <button
              key={category}
              className={activeCategory === category ? "is-active" : ""}
              onClick={() => setActiveCategory(category)}
              type="button"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="index-layout">
        <div className="project-list">
          {filteredGroups.map((group) => (
            <div className="year-group" key={group.year}>
              <div className="year-label">{group.year}</div>
              <div className="rows">
                {group.projects.map((project, index) => (
                  <Link
                    className="project-row"
                    href={`/projects/${project.slug}`}
                    key={project.slug}
                    onMouseEnter={() => setPreview(project)}
                  >
                    <span className="row-index">{String(index + 1).padStart(2, "0")}</span>
                    <span className="row-title">
                      {project.title}
                      <small>{project.titleCn}</small>
                    </span>
                    <span className="row-tags">{project.services.slice(0, 3).join(" · ")}</span>
                    <span className="row-client">{project.client}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <aside className="preview-panel" aria-label="Project preview">
          <div className="preview-media">
            <img src={preview.cover} alt={`${preview.title} preview`} />
          </div>
          <p>{preview.category}</p>
          <h3>{preview.title}</h3>
          <span>{preview.summary}</span>
        </aside>
      </div>
    </section>
  );
}
