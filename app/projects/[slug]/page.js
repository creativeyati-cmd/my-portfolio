import Link from "next/link";
import { notFound } from "next/navigation";

import GlassNav from "@/components/GlassNav";
import ProjectVideoFrame from "@/components/ProjectVideoFrame";
import { getProjectBySlug, getSiteSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const [project, settings] = await Promise.all([
    getProjectBySlug(slug),
    getSiteSettings(),
  ]);

  if (!project) notFound();

  return (
    <main className="min-h-screen bg-[#f7f4ee] py-24 text-[#111]">
      <GlassNav currentPath="/projects" labels={settings} />

      <div className="editorial-shell editorial-hero space-y-10">
        <header className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-black/45">
              {settings.siteTitle}
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
              href="/"
              className="inline-flex items-center rounded-full border border-black/12 px-5 py-3 text-sm font-medium text-black/72"
            >
              {settings.projectBackHomeLabel}
            </Link>
            <a
              href={`mailto:${settings.contactEmail}`}
              className="inline-flex items-center rounded-full bg-black px-5 py-3 text-sm font-medium text-white"
            >
              {settings.projectContactCtaLabel}
            </a>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
          <div className="overflow-hidden">
            <div className="aspect-video bg-[#ddd7ce]">
              <ProjectVideoFrame
                project={project}
                emptyLabel={settings.noVideoLabel}
              />
            </div>
          </div>

          <aside className="p-6 sm:p-7">
            <p className="text-[11px] uppercase tracking-[0.22em] text-black/45">
              {settings.projectOverviewLabel}
            </p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-black/68">
              <p>{project.shortDescription}</p>
              <p>{project.longDescription}</p>
            </div>

            <dl className="mt-8 grid gap-5 text-sm text-black/72">
              <div>
                <dt className="text-[11px] uppercase tracking-[0.18em] text-black/42">
                  Type
                </dt>
                <dd className="mt-1">{project.type}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.18em] text-black/42">
                  Year
                </dt>
                <dd className="mt-1">{project.year}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.18em] text-black/42">
                  Role
                </dt>
                <dd className="mt-1">{project.role || "Add role in admin"}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.18em] text-black/42">
                  Tools
                </dt>
                <dd className="mt-1">{project.tools || "Add tools in admin"}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.18em] text-black/42">
                  Client
                </dt>
                <dd className="mt-1">
                  {project.clientName || "Add client in admin"}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.18em] text-black/42">
                  Credits
                </dt>
                <dd className="mt-1">
                  {project.credits || "Add project credits in admin"}
                </dd>
              </div>
            </dl>
          </aside>
        </section>
      </div>
    </main>
  );
}
