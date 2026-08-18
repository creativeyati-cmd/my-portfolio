import { DEFAULT_PROJECTS } from "@/lib/default-portfolio";

export const PROJECTS = DEFAULT_PROJECTS.map((project) => ({
  file: project.posterPath,
  name: project.title,
  type: project.type,
  year: project.year,
}));

export const IMAGE_FILES = PROJECTS.map((p) => p.file);
