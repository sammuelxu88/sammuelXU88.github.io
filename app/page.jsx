import ProjectWall from "./project-wall";
import { phantomProjects } from "./phantom-data";

export default function HomePage() {
  return (
    <main className="home-page">
      <ProjectWall projects={phantomProjects} />
    </main>
  );
}
