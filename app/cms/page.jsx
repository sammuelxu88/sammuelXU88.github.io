import CmsClient from "./cms-client";
import { phantomProjects } from "../phantom-data";

export const metadata = {
  title: "CMS | sammuelXU",
  description: "Front-end protected portfolio content manager."
};

export default function CmsPage() {
  return <CmsClient projects={phantomProjects} />;
}
