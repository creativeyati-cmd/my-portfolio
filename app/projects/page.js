import GlassNav from "@/components/GlassNav";
import { getSiteSettings, listCategories, listProjects } from "@/lib/db";

import ProjectsEditorialClient from "./projects-editorial-client";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [settings, projects, serviceCategories] = await Promise.all([
    getSiteSettings(),
    listProjects(),
    listCategories({ includeServices: true }),
  ]);

  return (
    <main className="min-h-screen bg-[#f7f4ee] py-24 text-[#141311]">
      <GlassNav currentPath="/projects" labels={settings} serviceCategories={serviceCategories} />
      <ProjectsEditorialClient projects={projects} settings={settings} />
    </main>
  );
}
