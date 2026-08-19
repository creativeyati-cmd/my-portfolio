import Link from "next/link";
import { notFound } from "next/navigation";

import GlassNav from "@/components/GlassNav";
import ProjectVideoFrame from "@/components/ProjectVideoFrame";
import { getProjectBySlug, getSiteSettings, listProjects } from "@/lib/db";
import { buildCaseStudySections } from "@/lib/editorial";

export const dynamic = "force-dynamic";

function eyebrow(label) {
  return (
    <p className="text-[10px] uppercase tracking-[0.28em] text-black/40 sm:text-[11px]">
      {label}
    </p>
  );
}

function splitInline(value) {
  return String(value || "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const [project, settings, allProjects] = await Promise.all([
    getProjectBySlug(slug),
    getSiteSettings(),
    listProjects(),
  ]);

  if (!project) notFound();

  const sections = buildCaseStudySections(project);
  const currentIndex = allProjects.findIndex((item) => item.slug === project.slug);
  const nextProject =
    currentIndex >= 0 && allProjects.length > 1
      ? allProjects[(currentIndex + 1) % allProjects.length]
      : null;
  const relatedProjects = allProjects
    .filter((item) => item.slug !== project.slug)
    .filter((item) => item.type === project.type || item.year === project.year)
    .slice(0, 2);
  const deliverables = splitInline(project.tools);
  const credits = splitInline(project.credits);
  const hasSummary = Boolean(String(project.longDescription || "").trim());
  const hasPoster = Boolean(project.posterPath);
  const hasSupportingMaterial = hasPoster || hasSummary || credits.length > 0;
  const overviewItems = [
    project.role
      ? {
          label: "Role",
          value: project.role,
        }
      : null,
    project.clientName
      ? {
          label: "Client",
          value: project.clientName,
        }
      : null,
    deliverables.length
      ? {
          label: "Deliverables",
          value: deliverables.join(", "),
        }
      : null,
  ].filter(Boolean);

  return (
    <main className="min-h-screen bg-[#f5f2ec] pb-20 pt-24 text-[#171512] sm:pb-24">
      <GlassNav currentPath="/projects" labels={settings} />

      <div className="editorial-shell editorial-hero">
        <header className="editorial-grid items-start gap-y-10">
          <div className="col-span-12 xl:col-span-7">
            <p className="font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-black/40">
              {project.type} / {project.year}
            </p>
            <h1 className="mt-4 font-['PP_Neue_Montreal'] text-[clamp(3.2rem,6vw,6rem)] leading-[0.94] tracking-[-0.06em] text-[#171512]">
              {project.title}
            </h1>
            <p className="mt-7 max-w-[38rem] font-['Satoshi'] text-[1.04rem] leading-8 text-black/64 sm:text-[1.08rem]">
              {project.shortDescription}
            </p>
          </div>

          <div className="col-span-12 xl:col-span-5 xl:pl-8">
            <div className="mb-6 flex justify-start xl:justify-end">
              <span aria-hidden="true" className="editorial-accent-square" />
            </div>
            {overviewItems.length ? (
              <div className="grid gap-5 border-t border-black/10 pt-5 text-sm leading-7 text-black/66">
                {overviewItems.map((item) => (
                  <div key={item.label}>
                    <p className="font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-black/40">
                      {item.label}
                    </p>
                    <p className="mt-2 font-['Satoshi'] text-base">{item.value}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </header>

        <section className="mt-12 overflow-hidden bg-[#ddd7ce]">
          <div className="aspect-[16/9]">
            <ProjectVideoFrame project={project} emptyLabel={settings.noVideoLabel} />
          </div>
        </section>

        <section className="mt-16 editorial-grid gap-y-10 border-t border-black/10 pt-8">
          <div className="col-span-12 xl:col-span-4">
            {eyebrow(settings.projectOverviewLabel || "Case study")}
            <h2 className="mt-4 font-['PP_Neue_Montreal'] text-[clamp(2.7rem,4.6vw,4.4rem)] leading-[0.95] tracking-[-0.06em] text-[#171512]">
              Story sequence.
            </h2>
          </div>

          <div className="col-span-12 xl:col-span-8">
            <div className="space-y-10">
              {sections.map((section, index) => (
                <article
                  key={section.label}
                  className="grid gap-5 border-t border-black/8 pt-5 md:grid-cols-[80px_minmax(0,1fr)]"
                >
                  <span className="font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-black/38">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-black/40">
                      {section.label}
                    </p>
                    <p className="mt-3 font-['Satoshi'] text-base leading-8 text-black/64">
                      {section.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-16 editorial-grid gap-y-10 border-t border-black/10 pt-8">
          {hasSupportingMaterial ? (
            <div className="col-span-12 xl:col-span-7">
              {eyebrow("Supporting material")}
              <div className="mt-5 grid gap-6 md:grid-cols-2">
                {hasPoster ? (
                  <div className="aspect-[4/5] overflow-hidden bg-[#ddd7ce]">
                    <div
                      className="h-full w-full bg-cover bg-center"
                      style={{ backgroundImage: `url("${project.posterPath}")` }}
                    />
                  </div>
                ) : null}
                <div
                  className={[
                    "space-y-6",
                    hasPoster ? "border-t border-black/8 pt-5 md:border-t-0 md:pt-0" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {hasSummary ? (
                    <div>
                      <p className="font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-black/40">
                        Summary
                      </p>
                      <p className="mt-3 font-['Satoshi'] text-base leading-8 text-black/64">
                        {project.longDescription}
                      </p>
                    </div>
                  ) : null}
                  {credits.length ? (
                    <div>
                      <p className="font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-black/40">
                        Credits
                      </p>
                      <div className="mt-3 flex flex-wrap gap-3">
                        {credits.map((item) => (
                          <span key={item} className="editorial-chip">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          <aside className={`col-span-12 ${hasSupportingMaterial ? "xl:col-span-5 xl:pl-8" : "xl:col-span-12"}`}>
            {eyebrow("Related stories")}
            <div className="mt-5 space-y-4">
              {relatedProjects.length ? (
                relatedProjects.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/projects/${item.slug}`}
                    className="block border-t border-black/8 pt-4"
                  >
                    <p className="font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-black/40">
                      {item.type} / {item.year}
                    </p>
                    <h3 className="mt-2 font-['PP_Neue_Montreal'] text-[2rem] leading-[0.96] tracking-[-0.06em] text-[#171512]">
                      {item.title}
                    </h3>
                    <p className="mt-3 font-['Satoshi'] text-base leading-8 text-black/62">
                      {item.shortDescription}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="border-t border-black/8 pt-4 font-['Satoshi'] text-base leading-8 text-black/62">
                  Publish more projects to create a related-story rail here.
                </p>
              )}
            </div>
          </aside>
        </section>

        {nextProject ? (
          <section className="mt-16 border-t border-black/10 pt-8">
            {eyebrow("Next project")}
            <Link
              href={`/projects/${nextProject.slug}`}
              className="mt-5 block max-w-[42rem]"
            >
              <p className="font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-black/40">
                {nextProject.type} / {nextProject.year}
              </p>
              <h2 className="mt-3 font-['PP_Neue_Montreal'] text-[clamp(2.8rem,5vw,4.8rem)] leading-[0.95] tracking-[-0.06em] text-[#171512]">
                {nextProject.title}
              </h2>
              <p className="mt-4 font-['Satoshi'] text-base leading-8 text-black/62">
                Continue into the next story.
              </p>
            </Link>
          </section>
        ) : null}
      </div>
    </main>
  );
}
