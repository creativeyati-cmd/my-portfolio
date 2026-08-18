"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

function eyebrow(label) {
  return (
    <p className="text-[10px] uppercase tracking-[0.28em] text-black/42 sm:text-[11px]">
      {label}
    </p>
  );
}

function projectCaption(project) {
  return project.shortDescription || `${project.title} presented as a focused visual case study.`;
}

function formatIndex(value) {
  return String(value + 1).padStart(2, "0");
}

function ProjectFigure({
  project,
  index,
  className = "",
  imageClassName = "",
  label,
  hoveredSlug,
  setHoveredSlug,
  registerImage,
}) {
  const dimmed = hoveredSlug && hoveredSlug !== project.slug;

  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`group block transition duration-500 ${dimmed ? "opacity-30" : "opacity-100"} ${className}`.trim()}
      onMouseEnter={() => setHoveredSlug(project.slug)}
      onMouseLeave={() => setHoveredSlug(null)}
    >
      <div className="relative overflow-hidden bg-[#ddd7ce]">
        {project.posterPath ? (
          <div
            ref={(node) => registerImage(project.slug, node)}
            className={`h-full w-full bg-cover bg-center transition duration-700 ease-out group-hover:scale-[1.025] ${imageClassName}`.trim()}
            style={{ backgroundImage: `url("${project.posterPath}")` }}
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center font-['Satoshi'] text-sm text-black/45 ${imageClassName}`.trim()}>
            No poster yet
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4 sm:p-5">
          <span className="font-['Geist'] text-[10px] uppercase tracking-[0.26em] text-white/82 mix-blend-difference">
            {formatIndex(index)}
          </span>
          <span className="translate-y-2 text-sm text-white/0 transition duration-500 group-hover:translate-y-0 group-hover:text-white/82 mix-blend-difference">
            -&gt;
          </span>
        </div>

        {label ? (
          <div className="pointer-events-none absolute bottom-4 left-4 translate-y-2 rounded-full border border-white/18 px-3 py-1 font-['Satoshi'] text-[10px] uppercase tracking-[0.22em] text-white/0 transition duration-500 group-hover:translate-y-0 group-hover:text-white/84 mix-blend-difference sm:bottom-5 sm:left-5">
            {label}
          </div>
        ) : null}
      </div>

      <div className="pt-4">
        <p className="font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-black/42 sm:text-[11px]">
          {project.type} / {project.year}
        </p>
        <h2 className="mt-2 inline-block border-b border-black/0 font-['PP_Neue_Montreal'] text-[2rem] leading-[0.96] tracking-[-0.06em] text-[#12110f] transition duration-500 group-hover:border-black/70 group-hover:pr-1 sm:text-[2.6rem]">
          {project.title}
        </h2>
        <p className="mt-3 max-w-[32rem] font-['Satoshi'] text-sm leading-7 text-black/62 sm:text-[15px]">
          {projectCaption(project)}
        </p>
      </div>
    </Link>
  );
}

function PulseStat({ value, label }) {
  return (
    <div className="border-t border-black/10 pt-4">
      <p className="font-['PP_Neue_Montreal'] text-[3.2rem] leading-none tracking-[-0.08em] text-[#12110f] sm:text-[4.5rem]">
        {value}
      </p>
      <p className="mt-2 font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-black/42">
        {label}
      </p>
    </div>
  );
}

export default function ProjectsEditorialClient({ projects, settings }) {
  const [hoveredSlug, setHoveredSlug] = useState(null);
  const imageRefs = useRef(new Map());
  const hasProjects = projects.length > 0;
  const featured = projects[0];
  const portrait = projects[1];
  const wide = projects[2];
  const offset = projects[3];
  const textLead = projects[4];
  const extra = projects[5];
  const remainder = projects.slice(6);

  const registerImage = (slug, node) => {
    if (!slug) return;
    if (node) {
      imageRefs.current.set(slug, node);
    } else {
      imageRefs.current.delete(slug);
    }
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
        const shift = (0.5 - progress) * 26;
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

  if (!hasProjects) {
    return (
      <div className="editorial-shell editorial-hero">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.65fr)]">
          <div>
            {eyebrow(settings.navProjectsLabel || "Projects")}
            <h1 className="mt-5 editorial-page-title max-w-[8ch]">
              Selected projects
              <span className="block">arrive here.</span>
            </h1>
            <p className="mt-10 editorial-support-copy max-w-md">
              Once projects are published from the admin, this page becomes the
              exhibition wall for the portfolio.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <>
      <div className="editorial-shell editorial-hero">
        <section className="grid gap-12 xl:grid-cols-[minmax(0,0.92fr)_minmax(260px,0.4fr)] xl:items-start">
          <div>
            {eyebrow(settings.navProjectsLabel || "Projects")}
            <h1 className="mt-5 editorial-page-title max-w-[9ch]">
              <span className="block">Selected projects</span>
              <span className="block">and image</span>
              <span className="block">worlds.</span>
            </h1>
            <p className="mt-10 editorial-support-copy max-w-[26rem]">
              A tightly edited sequence of brand stories, visual systems, and
              motion-led campaign pieces shaped with a quiet art-direction lens.
            </p>
          </div>

          <div className="self-start pt-2 xl:pt-3">
            <div className="mb-6 flex justify-start xl:justify-end">
              <span aria-hidden="true" className="editorial-accent-square" />
            </div>
            {eyebrow("Portfolio pulse")}
            <div className="mt-6 space-y-6">
              <PulseStat value={String(projects.length).padStart(2, "0")} label="Published works" />
              <PulseStat
                value={String(
                  projects.filter((project) => project.videoUrl || project.videoPath).length,
                ).padStart(2, "0")}
                label="Motion-led entries"
              />
              <PulseStat
                value={String(new Set(projects.map((project) => project.type)).size).padStart(2, "0")}
                label="Project categories"
              />
            </div>
          </div>
        </section>

        <section className="mt-16 sm:mt-20">
          {eyebrow("Curated selection")}
          <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-12 lg:gap-y-16">
            {featured ? (
              <ProjectFigure
                project={featured}
                index={0}
                label="Featured"
                hoveredSlug={hoveredSlug}
                setHoveredSlug={setHoveredSlug}
                registerImage={registerImage}
                className="md:col-span-8"
                imageClassName="aspect-[16/11]"
              />
            ) : null}

            {portrait ? (
              <ProjectFigure
                project={portrait}
                index={1}
                label="Portrait study"
                hoveredSlug={hoveredSlug}
                setHoveredSlug={setHoveredSlug}
                registerImage={registerImage}
                className="md:col-span-4"
                imageClassName="aspect-[4/5] md:min-h-[34rem]"
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
                className="md:col-span-7 md:self-start"
                imageClassName="aspect-[16/10]"
              />
            ) : null}

            <aside className="border-t border-black/10 pt-4 md:col-span-5 md:self-end">
              {eyebrow("Project index")}
              <div className="mt-5 space-y-3">
                {projects.slice(0, 6).map((project, index) => (
                  <Link
                    key={project.slug}
                    href={`/projects/${project.slug}`}
                    className={`flex items-baseline justify-between gap-4 border-b border-black/6 py-2 transition ${
                      hoveredSlug && hoveredSlug !== project.slug
                        ? "opacity-35"
                        : "opacity-100 hover:opacity-100"
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

      <section className="relative left-1/2 mt-24 w-screen -translate-x-1/2 overflow-hidden bg-[#131210] py-18 text-[#f6f2ea]">
        <div className="editorial-shell">
          {eyebrow("Intermission")}
          <div className="mt-5 overflow-hidden">
            <div className="editorial-marquee whitespace-nowrap font-['PP_Neue_Montreal'] text-[3.2rem] leading-none tracking-[-0.08em] sm:text-[4.8rem] lg:text-[6.8rem]">
              Every frame is a decision. Every frame is a decision. Every frame is a decision.
            </div>
          </div>
        </div>
      </section>

      <div className="editorial-shell">
        <section className="mt-16 sm:mt-20">
          {eyebrow("Second movement")}
          <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-12 lg:gap-y-16">
            {offset ? (
              <ProjectFigure
                project={offset}
                index={3}
                label="Offset"
                hoveredSlug={hoveredSlug}
                setHoveredSlug={setHoveredSlug}
                registerImage={registerImage}
                className="md:col-span-5 md:col-start-2"
                imageClassName="aspect-[5/6]"
              />
            ) : null}

            {textLead ? (
              <Link
                href={`/projects/${textLead.slug}`}
                className={`border-t border-black/10 pt-4 transition duration-500 md:col-span-3 ${
                  hoveredSlug && hoveredSlug !== textLead.slug ? "opacity-30" : "opacity-100"
                }`}
                onMouseEnter={() => setHoveredSlug(textLead.slug)}
                onMouseLeave={() => setHoveredSlug(null)}
              >
                {eyebrow("Text study")}
                <div className="mt-5">
                  <span className="font-['Geist'] text-[10px] uppercase tracking-[0.24em] text-black/38">
                    {formatIndex(4)}
                  </span>
                  <h2 className="mt-3 inline-block border-b border-black/0 font-['PP_Neue_Montreal'] text-[2.4rem] leading-[0.94] tracking-[-0.07em] text-[#12110f] transition duration-500 hover:border-black/70 hover:pr-1">
                    {textLead.title}
                  </h2>
                  <p className="mt-4 font-['Satoshi'] text-sm leading-7 text-black/62">
                    {projectCaption(textLead)}
                  </p>
                </div>
              </Link>
            ) : null}

            {extra ? (
              <ProjectFigure
                project={extra}
                index={5}
                label="Motion detail"
                hoveredSlug={hoveredSlug}
                setHoveredSlug={setHoveredSlug}
                registerImage={registerImage}
                className="md:col-span-4 md:self-end"
                imageClassName="aspect-[16/10]"
              />
            ) : null}

            {remainder.map((project, index) => (
              <ProjectFigure
                key={project.slug}
                project={project}
                index={index + 6}
                hoveredSlug={hoveredSlug}
                setHoveredSlug={setHoveredSlug}
                registerImage={registerImage}
                className="md:col-span-6 xl:col-span-4"
                imageClassName={
                  index % 3 === 0
                    ? "aspect-[4/5]"
                    : index % 3 === 1
                      ? "aspect-[16/11]"
                      : "aspect-[5/4]"
                }
              />
            ))}
          </div>
        </section>
      </div>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-5 left-5 z-20 inline-flex h-14 w-14 items-center justify-center rounded-full border border-black/12 bg-[#f7f4ee]/92 font-['Geist'] text-[11px] uppercase tracking-[0.18em] text-[#12110f] shadow-[0_18px_40px_rgba(0,0,0,0.08)] backdrop-blur"
        aria-label="Back to top"
      >
        <span className="flex items-center gap-1">
          <span className="text-[#9b6a38]">*</span>
          IO
        </span>
      </button>
    </>
  );
}
