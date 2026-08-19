"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

function eyebrow(label) {
  return (
    <p className="text-[10px] uppercase tracking-[0.28em] text-black/40 sm:text-[11px]">
      {label}
    </p>
  );
}

function projectCaption(project) {
  return (
    project.shortDescription ||
    `${project.title} is presented as a focused visual case study ready for a fuller story.`
  );
}

function formatIndex(value) {
  return String(value + 1).padStart(2, "0");
}

function ProjectFigure({
  project,
  index,
  className = "",
  imageClassName = "",
  label = "View story",
  hoveredSlug,
  setHoveredSlug,
  registerImage,
}) {
  const dimmed = hoveredSlug && hoveredSlug !== project.slug;

  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`group block transition duration-500 ${dimmed ? "opacity-35" : "opacity-100"} ${className}`.trim()}
      onMouseEnter={() => setHoveredSlug(project.slug)}
      onMouseLeave={() => setHoveredSlug(null)}
    >
      <div className="relative overflow-hidden bg-[#ddd7ce]">
        {project.posterPath ? (
          <div
            ref={(node) => registerImage(project.slug, node)}
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
            {formatIndex(index)}
          </span>
          <span className="translate-y-2 text-[11px] uppercase tracking-[0.22em] text-white/0 transition duration-500 group-hover:translate-y-0 group-hover:text-white/82 mix-blend-difference">
            {label}
          </span>
        </div>
      </div>

      <div className="pt-4">
        <p className="font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-black/40 sm:text-[11px]">
          {project.type} / {project.year}
        </p>
        <h2 className="mt-2 inline-block border-b border-black/0 font-['PP_Neue_Montreal'] text-[2rem] leading-[0.96] tracking-[-0.06em] text-[#171512] transition duration-500 group-hover:border-black/60 group-hover:translate-x-1 sm:text-[2.55rem]">
          {project.title}
        </h2>
        <p className="mt-3 font-['Satoshi'] text-base leading-8 text-black/62">
          {projectCaption(project)}
        </p>
      </div>
    </Link>
  );
}

function PulseStat({ value, label }) {
  return (
    <div className="border-t border-black/10 pt-4">
      <p className="font-['PP_Neue_Montreal'] text-[3.15rem] leading-none tracking-[-0.08em] text-[#171512] sm:text-[4.3rem]">
        {value}
      </p>
      <p className="mt-2 font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-black/40">
        {label}
      </p>
    </div>
  );
}

export default function ProjectsEditorialClient({ projects, settings }) {
  const [hoveredSlug, setHoveredSlug] = useState(null);
  const [activeType, setActiveType] = useState("All");
  const imageRefs = useRef(new Map());
  const types = useMemo(
    () => ["All", ...new Set(projects.map((project) => project.type).filter(Boolean))],
    [projects],
  );
  const filteredProjects = useMemo(
    () =>
      activeType === "All"
        ? projects
        : projects.filter((project) => project.type === activeType),
    [activeType, projects],
  );
  const featured = filteredProjects[0];
  const portrait = filteredProjects[1];
  const wide = filteredProjects[2];
  const archiveLead = filteredProjects[3];
  const archive = filteredProjects.slice(4);
  const yearValues = filteredProjects
    .map((project) => Number(project.year))
    .filter((value) => Number.isFinite(value))
    .sort((left, right) => left - right);
  const yearRange =
    yearValues.length > 1
      ? `${yearValues[0]}-${yearValues[yearValues.length - 1]}`
      : yearValues[0]
        ? String(yearValues[0])
        : "Now";

  const registerImage = (slug, node) => {
    if (!slug) return;
    if (node) imageRefs.current.set(slug, node);
    else imageRefs.current.delete(slug);
  };

  useEffect(() => {
    let frame = 0;

    const paint = () => {
      const viewport = window.innerHeight;

      imageRefs.current.forEach((node) => {
        const rect = node.parentElement?.getBoundingClientRect();
        if (!rect) return;

        const progress = Math.min(
          1,
          Math.max(0, (viewport - rect.top) / (viewport + rect.height)),
        );
        const scale = 1.1 - progress * 0.08;
        const shift = (0.5 - progress) * 22;
        node.style.transform = `translate3d(0, ${shift}px, 0) scale(${scale})`;
      });
    };

    const requestPaint = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(paint);
    };

    requestPaint();
    window.addEventListener("scroll", requestPaint, { passive: true });
    window.addEventListener("resize", requestPaint);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestPaint);
      window.removeEventListener("resize", requestPaint);
    };
  }, []);

  if (!filteredProjects.length) {
    return (
      <div className="editorial-shell editorial-hero">
        <section className="editorial-grid gap-y-8">
          <div className="col-span-12 xl:col-span-7">
            {eyebrow(settings.navProjectsLabel || "Projects")}
            <h1 className="mt-5 editorial-page-title">No published projects yet.</h1>
            <p className="mt-8 max-w-[30rem] font-['Satoshi'] text-base leading-8 text-black/62">
              Publish a project from the admin to populate the archive.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <>
      <div className="editorial-shell editorial-hero">
        <section className="editorial-grid items-start gap-y-12">
          <div className="col-span-12 xl:col-span-7">
            {eyebrow(settings.navProjectsLabel || "Projects")}
            <h1 className="mt-5 editorial-page-title">
              A curated archive of campaign and image-led stories.
            </h1>
            <p className="mt-8 max-w-[31rem] font-['Satoshi'] text-base leading-8 text-black/62">
              Filter the archive by project type, move through the featured sequence,
              and open each story as a full case-study page.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-black/10 pt-4">
              {types.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActiveType(type)}
                  className={`border-b pb-1 font-['Satoshi'] text-[11px] uppercase tracking-[0.2em] transition ${
                    activeType === type
                      ? "border-black/62 text-black/84"
                      : "border-black/0 text-black/42 hover:border-black/25 hover:text-black/72"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-12 xl:col-span-5 xl:pl-8">
            <div className="mb-6 flex justify-start xl:justify-end">
              <span aria-hidden="true" className="editorial-accent-square" />
            </div>
            {eyebrow("Project index")}
            <div className="mt-6 space-y-5">
              <PulseStat value={String(filteredProjects.length).padStart(2, "0")} label="Archive entries" />
              <PulseStat
                value={String(new Set(filteredProjects.map((project) => project.type)).size).padStart(2, "0")}
                label="Project types"
              />
              <PulseStat value={yearRange} label="Years in view" />
            </div>
          </div>
        </section>

        <section className="mt-16 sm:mt-20">
          {eyebrow("Featured work")}
          <div className="mt-6 editorial-grid gap-y-16">
            {featured ? (
              <ProjectFigure
                project={featured}
                index={0}
                label="Featured"
                hoveredSlug={hoveredSlug}
                setHoveredSlug={setHoveredSlug}
                registerImage={registerImage}
                className="col-span-12 xl:col-span-8"
                imageClassName="aspect-[16/10]"
              />
            ) : null}

            {portrait ? (
              <ProjectFigure
                project={portrait}
                index={1}
                label="Secondary"
                hoveredSlug={hoveredSlug}
                setHoveredSlug={setHoveredSlug}
                registerImage={registerImage}
                className="col-span-12 xl:col-span-4"
                imageClassName="aspect-[4/5] xl:min-h-[36rem]"
              />
            ) : null}

            {wide ? (
              <ProjectFigure
                project={wide}
                index={2}
                label="Wide frame"
                hoveredSlug={hoveredSlug}
                setHoveredSlug={setHoveredSlug}
                registerImage={registerImage}
                className="col-span-12 xl:col-span-7 xl:col-start-1"
                imageClassName="aspect-[16/10]"
              />
            ) : null}

            <aside className="col-span-12 xl:col-span-5 xl:self-end xl:pl-8">
              {eyebrow("Compact archive")}
              <div className="mt-4 space-y-3 border-t border-black/10 pt-4">
                {filteredProjects.slice(0, 6).map((project, index) => (
                  <Link
                    key={project.slug}
                    href={`/projects/${project.slug}`}
                    className={`flex items-baseline justify-between gap-4 border-b border-black/6 py-2 transition ${
                      hoveredSlug && hoveredSlug !== project.slug ? "opacity-35" : "opacity-100"
                    }`}
                    onMouseEnter={() => setHoveredSlug(project.slug)}
                    onMouseLeave={() => setHoveredSlug(null)}
                  >
                    <span className="font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-black/38">
                      {formatIndex(index)}
                    </span>
                    <span className="flex-1 font-['Satoshi'] text-sm text-black/76">
                      {project.title}
                    </span>
                    <span className="font-['Geist'] text-[10px] uppercase tracking-[0.22em] text-black/38">
                      {project.year}
                    </span>
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        </section>
      </div>

      <section className="relative left-1/2 mt-22 w-screen -translate-x-1/2 overflow-hidden bg-[#131210] py-16 text-[#f5f2ec] sm:py-18">
        <div className="editorial-shell">
          {eyebrow("Intermission")}
          <div className="mt-5 overflow-hidden">
            <div className="editorial-marquee whitespace-nowrap font-['PP_Neue_Montreal'] text-[2.8rem] leading-none tracking-[-0.08em] sm:text-[4.2rem] lg:text-[5.8rem]">
              Every frame is a decision. Every frame is a decision. Every frame is a decision.
            </div>
          </div>
        </div>
      </section>

      <div className="editorial-shell">
        <section className="mt-16 sm:mt-20">
          {eyebrow("Project archive")}
          <div className="mt-6 editorial-grid gap-y-16">
            {archiveLead ? (
              <ProjectFigure
                project={archiveLead}
                index={3}
                label="Archive lead"
                hoveredSlug={hoveredSlug}
                setHoveredSlug={setHoveredSlug}
                registerImage={registerImage}
                className="col-span-12 xl:col-span-5 xl:col-start-2"
                imageClassName="aspect-[5/6]"
              />
            ) : null}

            {archive.map((project, index) => (
              <ProjectFigure
                key={project.slug}
                project={project}
                index={index + 4}
                hoveredSlug={hoveredSlug}
                setHoveredSlug={setHoveredSlug}
                registerImage={registerImage}
                className="col-span-12 md:col-span-6 xl:col-span-4"
                imageClassName={
                  index % 3 === 0
                    ? "aspect-[16/11]"
                    : index % 3 === 1
                      ? "aspect-[4/5]"
                      : "aspect-[5/4]"
                }
              />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
