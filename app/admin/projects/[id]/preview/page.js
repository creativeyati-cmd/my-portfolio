import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import GlassNav from "@/components/GlassNav";
import ProjectVideoFrame from "@/components/ProjectVideoFrame";
import { requireAdmin } from "@/lib/auth";
import { getProjectById, getSiteSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminProjectPreviewPage({ params }) {
  await requireAdmin();
  const { id } = await params;
  const [project, settings] = await Promise.all([
    getProjectById(Number(id)),
    getSiteSettings(),
  ]);

  if (!project) notFound();
  if (project.status === "published") {
    redirect(`/projects/${project.slug}`);
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] py-24 text-[#111]">
      <GlassNav currentPath="/projects" labels={settings} />

      <div className="editorial-shell editorial-hero space-y-10">
        <header className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-black/45">
              Draft preview
            </p>
            <h1 className="mt-5 font-['PP_Neue_Montreal'] text-[clamp(3.25rem,6vw,5.5rem)] leading-[0.97] tracking-[-0.03em] text-[#12110f]">
              {project.title}
            </h1>
          </div>
          <div className="lg:pt-3">
            <div className="mb-6 flex justify-start lg:justify-end">
              <span aria-hidden="true" className="editorial-accent-square" />
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/admin/projects/${project.id}/edit`}
                className="inline-flex items-center rounded-full border border-black/12 px-5 py-3 text-sm font-medium text-black/72"
              >
                Back to editor
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
          <div className="overflow-hidden">
            <div className="aspect-video bg-[#ddd7ce]">
              <ProjectVideoFrame project={project} emptyLabel={settings.noVideoLabel} />
            </div>
          </div>

          <aside className="p-6 sm:p-7">
            <p className="text-[11px] uppercase tracking-[0.22em] text-black/45">
              Preview
            </p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-black/68">
              <p>{project.shortDescription}</p>
              <p>{project.longDescription}</p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
