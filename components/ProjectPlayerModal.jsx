import Link from "next/link";

import ProjectVideoFrame from "./ProjectVideoFrame";

export default function ProjectPlayerModal({ project, labels, onClose }) {
  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-30 bg-black/70 px-4 py-5 backdrop-blur-sm sm:px-8 sm:py-6"
      onClick={onClose}
    >
      <div className="mx-auto flex min-h-full max-w-6xl items-center justify-center">
        <div
          className="grid w-full overflow-hidden rounded-[30px] bg-[#f6f1ea] shadow-[0_35px_140px_rgba(0,0,0,0.28)] lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="aspect-video bg-[#ddd7ce]">
            <ProjectVideoFrame
              project={project}
              autoplay
              emptyLabel={labels?.noVideoLabel}
            />
          </div>

          <div className="flex flex-col justify-between gap-6 p-5 sm:gap-8 sm:p-8">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-black/45">
                    {labels?.selectedProjectLabel || "Selected project"}
                  </p>
                  <h2 className="mt-3 text-2xl font-medium tracking-[-0.05em] text-black sm:text-3xl">
                    {project.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-black/12 px-3 py-1 text-xs uppercase tracking-[0.16em] text-black/58"
                >
                  {labels?.projectModalCloseLabel || "Close"}
                </button>
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-black/45">
                {project.type} · {project.year}
              </p>
              <p className="mt-5 text-sm leading-7 text-black/66">
                {project.shortDescription || project.longDescription}
              </p>
              {project.credits ? (
                <p className="mt-5 text-sm leading-7 text-black/52">
                  {project.credits}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={`/projects/${project.slug}`}
                className="inline-flex items-center justify-center rounded-full bg-black px-5 py-3 text-sm font-medium text-white"
              >
                {labels?.ctaLabel || "See more"}
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-full border border-black/12 px-5 py-3 text-sm font-medium text-black/72"
              >
                {labels?.projectModalBackLabel || "Back to carousel"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
