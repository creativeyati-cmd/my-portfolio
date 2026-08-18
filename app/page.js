import Carousel from "@/components/Carousel";
import { getSiteSettings, listProjects } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [projects, siteSettings] = await Promise.all([
    listProjects(),
    getSiteSettings(),
  ]);

  return <Carousel projects={projects} siteSettings={siteSettings} />;
}
