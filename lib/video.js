function normalizeAssetUrl(value) {
  if (!value) return "";
  if (/^(https?:)?\/\//i.test(value) || value.startsWith("data:")) return value;
  return value.startsWith("/") ? value : `/${value}`;
}

function isDirectVideo(url) {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url || "");
}

function youtubeId(url) {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&#?/]+)/i,
  );
  return match?.[1] || "";
}

function vimeoId(url) {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  return match?.[1] || "";
}

export function getProjectVideoSource(project, { autoplay = false } = {}) {
  const fileUrl = normalizeAssetUrl(project?.videoPath);
  const url = normalizeAssetUrl(project?.videoUrl);
  const src = fileUrl || url;
  if (!src) return null;

  if (fileUrl || isDirectVideo(src)) {
    return {
      kind: "video",
      src,
      poster: normalizeAssetUrl(project?.posterPath),
    };
  }

  const yt = youtubeId(src);
  if (yt) {
    return {
      kind: "iframe",
      src: `https://www.youtube.com/embed/${yt}?rel=0&modestbranding=1${autoplay ? "&autoplay=1" : ""}`,
    };
  }

  const vimeo = vimeoId(src);
  if (vimeo) {
    return {
      kind: "iframe",
      src: `https://player.vimeo.com/video/${vimeo}${autoplay ? "?autoplay=1" : ""}`,
    };
  }

  return {
    kind: "iframe",
    src,
  };
}

export function getProjectPoster(project) {
  return normalizeAssetUrl(project?.posterPath);
}
