import Link from "next/link";

import GlassNav from "@/components/GlassNav";
import { getSiteSettings, listCategories, listProjects } from "@/lib/db";
import { buildRoleLines, splitList } from "@/lib/editorial";

export const dynamic = "force-dynamic";

function eyebrow(label) {
  return (
    <p className="text-[10px] uppercase tracking-[0.28em] text-black/40 sm:text-[11px]">
      {label}
    </p>
  );
}

function Stat({ value, label }) {
  return (
    <div className="border-t border-black/10 pt-4">
      <p className="font-['PP_Neue_Montreal'] text-[3.15rem] leading-none tracking-[-0.08em] text-[#171512] sm:text-[4.4rem]">
        {value}
      </p>
      <p className="mt-2 font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-black/40">
        {label}
      </p>
    </div>
  );
}

function projectCaption(project) {
  return (
    project.shortDescription ||
    `${project.title} is ready to hold the project's art direction, motion, and campaign story.`
  );
}

function ProjectCard({ project, index, className = "", imageClassName = "" }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`group block transition duration-500 ${className}`.trim()}
    >
      <div className="relative overflow-hidden bg-[#ddd7ce]">
        {project.posterPath ? (
          <div
            className={`h-full w-full bg-cover bg-center transition duration-700 ease-out group-hover:scale-[1.03] ${imageClassName}`.trim()}
            style={{ backgroundImage: `url("${project.posterPath}")` }}
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center font-['Satoshi'] text-sm text-black/42 ${imageClassName}`.trim()}
          >
            No cover uploaded yet
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4 sm:p-5">
          <span className="font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-white/84 mix-blend-difference">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="translate-y-2 text-[11px] uppercase tracking-[0.22em] text-white/0 transition duration-500 group-hover:translate-y-0 group-hover:text-white/80 mix-blend-difference">
            View story
          </span>
        </div>
      </div>

      <div className="pt-4">
        <p className="font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-black/40 sm:text-[11px]">
          {project.type} / {project.year}
        </p>
        <h2 className="mt-2 inline-block border-b border-black/0 font-['PP_Neue_Montreal'] text-[2rem] leading-[0.96] tracking-[-0.06em] text-[#171512] transition duration-500 group-hover:border-black/60 group-hover:translate-x-1 sm:text-[2.6rem]">
          {project.title}
        </h2>
        <p className="mt-3 font-['Satoshi'] text-base leading-8 text-black/62">
          {projectCaption(project)}
        </p>
      </div>
    </Link>
  );
}

export default async function Page() {
  const [projects, siteSettings, serviceCategories] = await Promise.all([
    listProjects(),
    getSiteSettings(),
    listCategories({ includeServices: true }),
  ]);

  const roleLines = buildRoleLines(siteSettings.aboutBody || siteSettings.introSubheading || "");
  const openTo = splitList(siteSettings.openToList);
  const skills = splitList(siteSettings.skillsList);
  const activeCategories = serviceCategories.filter((category) => category.status === "active");
  const services = activeCategories.flatMap((category) => category.services || []);
  const featuredProjects = projects.filter((project) => project.featured).slice(0, 3);
  const marqueeText =
    siteSettings.marqueeText ||
    "Story first. Visual systems. Motion that keeps people watching.";
  const yearValues = projects
    .map((project) => Number(project.year))
    .filter((value) => Number.isFinite(value))
    .sort((left, right) => left - right);
  const yearRange =
    yearValues.length > 1
      ? `${yearValues[0]}-${yearValues[yearValues.length - 1]}`
      : yearValues[0]
        ? String(yearValues[0])
        : "Now";

  return (
    <main className="min-h-screen bg-[#f5f2ec] pb-20 pt-24 text-[#171512] sm:pb-24">
      <GlassNav currentPath="/" labels={siteSettings} />

      <div className="editorial-shell editorial-hero">
        <section className="editorial-grid items-start gap-y-12">
          <div className="col-span-12 xl:col-span-7">
            {eyebrow(siteSettings.aboutTitle || "Profile")}
            <h1 className="mt-5 editorial-brand-name">{siteSettings.aboutPageTitle}</h1>
            <div className="mt-8 editorial-role-title max-w-[12ch]">
              {roleLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </div>
            <p className="mt-8 max-w-[34rem] font-['Satoshi'] text-[1.05rem] leading-8 text-black/64 sm:text-[1.08rem]">
              {siteSettings.aboutPageLead}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {siteSettings.profileAvailability ? (
                <span className="editorial-chip">
                  {siteSettings.availabilityLabel}: {siteSettings.profileAvailability}
                </span>
              ) : null}
              {siteSettings.location ? (
                <span className="editorial-chip">
                  {siteSettings.locationLabel}: {siteSettings.location}
                </span>
              ) : null}
            </div>
          </div>

          <div className="col-span-12 xl:col-span-5 xl:pl-8">
            <div className="mb-6 flex justify-start xl:justify-end">
              <span aria-hidden="true" className="editorial-accent-square" />
            </div>
            {eyebrow("Profile pulse")}
            <div className="mt-6 space-y-5">
              <Stat value={String(projects.length).padStart(2, "0")} label="Published projects" />
              <Stat value={String(services.length).padStart(2, "0")} label="Core services" />
              <Stat value={String(skills.length).padStart(2, "0")} label="Practice areas" />
              <Stat value={yearRange} label="Project span" />
            </div>
          </div>
        </section>

        <section className="mt-18 editorial-grid gap-y-10 border-t border-black/10 pt-8">
          <div className="col-span-12 xl:col-span-7">
            {eyebrow(siteSettings.aboutNotesTitle || "Perspective")}
            <p className="mt-5 max-w-[44rem] font-['Satoshi'] text-[1.02rem] leading-9 text-black/66 sm:text-[1.12rem]">
              {siteSettings.aboutNotesBody}
            </p>
          </div>

          <aside className="col-span-12 xl:col-span-5 xl:pl-8">
            {eyebrow(siteSettings.contactHeading || "Contact")}
            <div className="mt-5 space-y-3 font-['Satoshi'] text-base leading-8 text-black/66">
              <p>{siteSettings.contactEmail}</p>
              {siteSettings.contactPhone ? <p>{siteSettings.contactPhone}</p> : null}
              {siteSettings.location ? <p>{siteSettings.location}</p> : null}
            </div>
            <div className="mt-6">
              <a
                href={`mailto:${siteSettings.contactEmail}`}
                className="inline-flex border-b border-black/55 pb-1 font-['Satoshi'] text-[11px] uppercase tracking-[0.2em] text-black/78"
              >
                {siteSettings.navContactCtaLabel || "Start a conversation"}
              </a>
            </div>
          </aside>
        </section>
      </div>

      <section className="relative left-1/2 mt-22 w-screen -translate-x-1/2 overflow-hidden bg-[#131210] py-16 text-[#f5f2ec] sm:py-18">
        <div className="editorial-shell">
          {eyebrow("Intermission")}
          <div className="mt-5 overflow-hidden">
            <div className="editorial-marquee whitespace-nowrap font-['PP_Neue_Montreal'] text-[2.8rem] leading-none tracking-[-0.08em] sm:text-[4.2rem] lg:text-[5.8rem]">
              {`${marqueeText} ${marqueeText} ${marqueeText}`}
            </div>
          </div>
        </div>
      </section>

      <div className="editorial-shell">
        <section className="mt-16 sm:mt-20">
          <div className="editorial-grid items-end gap-y-8">
            <div className="col-span-12 xl:col-span-7">
              {eyebrow(siteSettings.introHeading || "Selected work")}
              <h2 className="mt-4 font-['PP_Neue_Montreal'] text-[clamp(3rem,5.8vw,5.9rem)] leading-[0.94] tracking-[-0.06em] text-[#171512]">
                Featured image-led stories.
              </h2>
            </div>
            <div className="col-span-12 xl:col-span-5 xl:pl-8">
              <p className="font-['Satoshi'] text-base leading-8 text-black/62">
                A concise selection of recent campaign, editing, and visual storytelling work, arranged as a deliberate editorial sequence.
              </p>
            </div>
          </div>

          <div className="mt-8 editorial-grid gap-y-14">
            {featuredProjects[0] ? (
              <ProjectCard
                project={featuredProjects[0]}
                index={0}
                className="col-span-12 xl:col-span-8"
                imageClassName="aspect-[16/10]"
              />
            ) : null}
            {featuredProjects[1] ? (
              <ProjectCard
                project={featuredProjects[1]}
                index={1}
                className="col-span-12 xl:col-span-4"
                imageClassName="aspect-[4/5] xl:min-h-[37rem]"
              />
            ) : null}
            {featuredProjects[2] ? (
              <ProjectCard
                project={featuredProjects[2]}
                index={2}
                className="col-span-12 xl:col-span-7 xl:col-start-2"
                imageClassName="aspect-[16/10]"
              />
            ) : null}
            <aside className="col-span-12 xl:col-span-3 xl:self-end">
              {eyebrow("Project archive")}
              <div className="mt-4 space-y-3 border-t border-black/10 pt-4">
                {projects.slice(0, 6).map((project, index) => (
                  <Link
                    key={project.slug}
                    href={`/projects/${project.slug}`}
                    className="flex items-baseline justify-between gap-3 border-b border-black/6 py-2"
                  >
                    <span className="font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-black/38">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 font-['Satoshi'] text-sm text-black/76">
                      {project.title}
                    </span>
                    <span className="font-['Geist'] text-[10px] uppercase tracking-[0.2em] text-black/38">
                      {project.year}
                    </span>
                  </Link>
                ))}
              </div>
              <div className="mt-6">
                <Link href="/projects" className="inline-flex border-b border-black/55 pb-1 font-['Satoshi'] text-[11px] uppercase tracking-[0.2em] text-black/78">
                  View full archive
                </Link>
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-16 border-t border-black/10 pt-8 sm:mt-20">
          <div className="editorial-grid gap-y-8">
            <div className="col-span-12 xl:col-span-4">
              {eyebrow(siteSettings.servicesTitle || "Capabilities")}
              <h2 className="mt-4 font-['PP_Neue_Montreal'] text-[clamp(2.8rem,4.8vw,4.5rem)] leading-[0.95] tracking-[-0.06em] text-[#171512]">
                Modular service index.
              </h2>
            </div>

            <div className="col-span-12 xl:col-span-8">
              <div className="space-y-0">
                {services.slice(0, 4).map((service, index) => (
                  <details key={service.id || service.slug} className="group border-t border-black/8 py-6 first:border-t-0">
                    <summary className="grid cursor-pointer list-none gap-4 md:grid-cols-[72px_minmax(0,1fr)_minmax(220px,0.72fr)]">
                      <span className="font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-black/38">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="font-['PP_Neue_Montreal'] text-[2rem] leading-[0.95] tracking-[-0.06em] text-[#171512] sm:text-[2.5rem]">
                          {service.name}
                        </h3>
                        <p className="mt-3 font-['Satoshi'] text-base leading-8 text-black/62">
                          {service.description}
                        </p>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <span className="font-['Satoshi'] text-sm uppercase tracking-[0.18em] text-black/46">
                          Expand
                        </span>
                        <span className="text-black/42 transition group-open:rotate-45">+</span>
                      </div>
                    </summary>
                    <div className="mt-5 grid gap-6 border-t border-black/8 pt-5 md:grid-cols-2">
                      <div>
                        <p className="font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-black/40">
                          {siteSettings.serviceIdealForLabel}
                        </p>
                        <p className="mt-2 font-['Satoshi'] text-base leading-8 text-black/62">
                          {service.idealFor}
                        </p>
                      </div>
                      <div>
                        <p className="font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-black/40">
                          {siteSettings.serviceDeliverablesLabel}
                        </p>
                        <p className="mt-2 font-['Satoshi'] text-base leading-8 text-black/62">
                          {service.deliverables}
                        </p>
                      </div>
                    </div>
                  </details>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {openTo.slice(0, 4).map((item) => (
                  <span key={item} className="editorial-chip">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
