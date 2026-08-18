import { getProjectPoster, getProjectVideoSource } from "@/lib/video";

export default function ProjectVideoFrame({
  project,
  autoplay = false,
  className = "",
  emptyLabel = "No video added yet",
}) {
  const source = getProjectVideoSource(project, { autoplay });
  const poster = getProjectPoster(project);

  if (!source) {
    return poster ? (
      <img
        src={poster}
        alt={project.title}
        className={`h-full w-full object-cover ${className}`.trim()}
      />
    ) : (
      <div
        className={`flex h-full w-full items-center justify-center bg-black/6 text-sm text-black/50 ${className}`.trim()}
      >
        {emptyLabel}
      </div>
    );
  }

  if (source.kind === "video") {
    return (
      <video
        src={source.src}
        poster={source.poster || poster || undefined}
        controls
        autoPlay={autoplay}
        playsInline
        className={`h-full w-full object-cover ${className}`.trim()}
      />
    );
  }

  return (
    <iframe
      src={source.src}
      title={`${project.title} video`}
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      className={`h-full w-full border-0 ${className}`.trim()}
    />
  );
}
