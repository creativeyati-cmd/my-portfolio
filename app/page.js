import Carousel from "@/components/Carousel";
import { getSiteSettings, listCategories, listProjects } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [projects, siteSettings, serviceCategories] = await Promise.all([
    listProjects(),
    getSiteSettings(),
    listCategories({ includeServices: true }),
  ]);

  return (
    <Carousel
      projects={projects}
      siteSettings={siteSettings}
      serviceCategories={serviceCategories}
    />
  );
}
