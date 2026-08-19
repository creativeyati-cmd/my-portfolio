import "server-only";

import fs from "node:fs/promises";
import path from "node:path";

import {
  DEFAULT_PROJECTS,
  DEFAULT_SERVICE_CATEGORIES,
  DEFAULT_SITE_SETTINGS,
} from "./default-portfolio";
import { hashPassword, verifyPassword } from "./security";

function resolveStoragePath(target, fallback) {
  const raw = target?.trim();
  if (!raw) return fallback;
  return path.isAbsolute(raw)
    ? raw
    : path.join(/* turbopackIgnore: true */ process.cwd(), raw);
}

function defaultDataDir() {
  if (process.env.VERCEL === "1") {
    return path.join("/tmp", "portfolio-data");
  }

  return path.join(process.cwd(), "data");
}

const DATA_DIR = resolveStoragePath(process.env.PORTFOLIO_DATA_DIR, defaultDataDir());
const DB_PATH = resolveStoragePath(
  process.env.PORTFOLIO_DB_PATH,
  path.join(DATA_DIR, "portfolio-fallback.json"),
);
const PROJECT_STATUSES = new Set(["draft", "published", "archived"]);
const CATEGORY_STATUSES = new Set(["active", "archived"]);
const SERVICE_STATUSES = new Set(["active", "archived"]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function slugify(value, fallback = "item") {
  return String(value || fallback)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function now() {
  return new Date().toISOString();
}

function normalizeProjectStatus(value, fallback = "draft") {
  return PROJECT_STATUSES.has(value) ? value : fallback;
}

function normalizeCategoryStatus(value, fallback = "active") {
  return CATEGORY_STATUSES.has(value) ? value : fallback;
}

function normalizeServiceStatus(value, fallback = "active") {
  return SERVICE_STATUSES.has(value) ? value : fallback;
}

function createSeedState() {
  let nextCategoryId = 1;
  let nextServiceId = 1;
  let nextProjectId = 1;

  const categories = [];
  const services = [];

  for (const category of DEFAULT_SERVICE_CATEGORIES) {
    const categoryId = nextCategoryId++;
    const createdAt = now();

    categories.push({
      id: categoryId,
      slug: slugify(category.slug || category.name, `category-${categoryId}`),
      name: category.name,
      description: category.description || "",
      color: category.color || "",
      icon: category.icon || "",
      displayOrder: Number(category.displayOrder || 0),
      status: normalizeCategoryStatus(category.status, "active"),
      createdAt,
      updatedAt: createdAt,
    });

    for (const service of category.services || []) {
      const serviceId = nextServiceId++;
      services.push({
        id: serviceId,
        categoryId,
        slug: slugify(service.slug || service.name, `service-${serviceId}`),
        name: service.name,
        description: service.description || "",
        idealFor: service.idealFor || "",
        deliverables: service.deliverables || "",
        cta: service.cta || "",
        displayOrder: Number(service.displayOrder || 0),
        status: normalizeServiceStatus(service.status, "active"),
        createdAt,
        updatedAt: createdAt,
      });
    }
  }

  const projects = DEFAULT_PROJECTS.map((project) => {
    const id = nextProjectId++;
    const timestamp = now();
    return {
      id,
      slug: slugify(project.slug || project.title, `project-${id}`),
      title: project.title,
      type: project.type || "",
      categoryId: project.categoryId || null,
      year: project.year || "",
      posterPath: project.posterPath || "",
      videoPath: project.videoPath || "",
      videoUrl: project.videoUrl || "",
      shortDescription: project.shortDescription || "",
      longDescription: project.longDescription || "",
      role: project.role || "",
      tools: project.tools || "",
      clientName: project.clientName || "",
      credits: project.credits || "",
      published: Boolean(project.published),
      status: normalizeProjectStatus(project.status, project.published ? "published" : "draft"),
      featured: Boolean(project.featured),
      viewCount: Number(project.viewCount || 0),
      publishedAt: project.published ? timestamp : "",
      sortOrder: Number(project.sortOrder || 0),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  });

  return {
    users: [],
    siteSettings: {
      ...DEFAULT_SITE_SETTINGS,
      bookingEnabled: Boolean(DEFAULT_SITE_SETTINGS.bookingEnabled),
    },
    projects,
    categories,
    services,
    activityLogs: [],
    counters: {
      user: 1,
      project: nextProjectId,
      category: nextCategoryId,
      service: nextServiceId,
      activity: 1,
    },
  };
}

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(/* turbopackIgnore: true */ DB_PATH);
  } catch {
    await fs.writeFile(
      /* turbopackIgnore: true */ DB_PATH,
      JSON.stringify(createSeedState(), null, 2),
      "utf8",
    );
  }
}

async function readState() {
  await ensureDataFile();
  const raw = await fs.readFile(/* turbopackIgnore: true */ DB_PATH, "utf8");
  return JSON.parse(raw);
}

async function writeState(state) {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(
    /* turbopackIgnore: true */ DB_PATH,
    JSON.stringify(state, null, 2),
    "utf8",
  );
}

async function withState(mutator) {
  const state = await readState();
  const nextState = await mutator(state);
  await writeState(nextState);
  return nextState;
}

function mergeSiteSettings(value = {}) {
  return {
    ...DEFAULT_SITE_SETTINGS,
    ...value,
    bookingEnabled: Boolean(value.bookingEnabled),
  };
}

async function ensureAdminSeed() {
  const username = (process.env.ADMIN_USERNAME || "admin").trim();
  const email = (process.env.ADMIN_EMAIL || "").trim();
  const displayName = (process.env.ADMIN_DISPLAY_NAME || "Admin").trim();
  const password = process.env.ADMIN_PASSWORD || "changeme123";

  await withState((state) => {
    const next = clone(state);
    next.siteSettings = mergeSiteSettings(next.siteSettings);

    if (!next.users.length) {
      if (
        process.env.NODE_ENV === "production" &&
        (!process.env.ADMIN_PASSWORD || password === "changeme123")
      ) {
        console.warn(
          "ADMIN_PASSWORD is missing or insecure in production. Seeding a temporary fallback admin user in JSON storage.",
        );
      }

      const timestamp = now();
      next.users.push({
        id: next.counters.user++,
        username,
        passwordHash: hashPassword(password),
        displayName,
        email,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    } else {
      next.users = next.users.map((user) =>
        user.username === username
          ? {
              ...user,
              email: user.email || email,
              displayName: user.displayName || displayName,
            }
          : user,
      );
    }

    return next;
  });
}

function withCategoryServices(state, category, { includeServices = false } = {}) {
  const analytics = {
    servicesCount: state.services.filter((service) => service.categoryId === category.id).length,
    projectCount: state.projects.filter((project) => project.categoryId === category.id).length,
    inquiryCount: null,
    avgTimeSpent: null,
  };

  return {
    ...category,
    analytics,
    services: includeServices
      ? state.services
          .filter((service) => service.categoryId === category.id)
          .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name))
      : [],
  };
}

function sortCategories(items) {
  return [...items].sort(
    (a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name),
  );
}

function sortServices(items) {
  return [...items].sort(
    (a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name),
  );
}

function sortProjects(items) {
  return [...items].sort(
    (a, b) => a.sortOrder - b.sortOrder || new Date(b.updatedAt) - new Date(a.updatedAt),
  );
}

export async function getSiteSettings() {
  await ensureAdminSeed();
  const state = await readState();
  return mergeSiteSettings(state.siteSettings);
}

export async function listServices({ includeArchived = false } = {}) {
  await ensureAdminSeed();
  const state = await readState();
  const categories = new Map(state.categories.map((category) => [category.id, category]));

  return sortServices(
    state.services
      .filter((service) => includeArchived || service.status !== "archived")
      .map((service) => ({
        ...service,
        categoryName: categories.get(service.categoryId)?.name || "",
      })),
  );
}

export async function listCategories({ includeServices = false, includeArchived = false } = {}) {
  await ensureAdminSeed();
  const state = await readState();

  return sortCategories(
    state.categories
      .filter((category) => includeArchived || category.status !== "archived")
      .map((category) => withCategoryServices(state, category, { includeServices })),
  );
}

export async function getCategoryById(id) {
  const categories = await listCategories({ includeServices: true, includeArchived: true });
  return categories.find((category) => category.id === Number(id)) || null;
}

export async function getServiceById(id) {
  const services = await listServices({ includeArchived: true });
  return services.find((service) => service.id === Number(id)) || null;
}

export async function updateSiteSettings(input) {
  await ensureAdminSeed();
  await withState((state) => {
    const next = clone(state);
    next.siteSettings = {
      ...mergeSiteSettings(next.siteSettings),
      ...input,
      bookingEnabled: Boolean(input.bookingEnabled),
    };
    return next;
  });
}

export async function saveCategory(input) {
  await ensureAdminSeed();
  let saved = null;

  await withState((state) => {
    const next = clone(state);
    const id = Number(input.id || 0);
    const timestamp = now();
    const record = {
      slug: slugify(input.slug || input.name, "category"),
      name: String(input.name || "").trim(),
      description: String(input.description || "").trim(),
      color: String(input.color || "").trim(),
      icon: String(input.icon || "").trim(),
      displayOrder: Number(input.displayOrder || 0),
      status: normalizeCategoryStatus(String(input.status || "active"), "active"),
      updatedAt: timestamp,
    };

    if (id) {
      next.categories = next.categories.map((category) =>
        category.id === id ? { ...category, ...record } : category,
      );
      saved = next.categories.find((category) => category.id === id) || null;
    } else {
      saved = {
        id: next.counters.category++,
        createdAt: timestamp,
        ...record,
      };
      next.categories.push(saved);
    }

    return next;
  });

  return saved;
}

export async function saveService(input) {
  await ensureAdminSeed();
  const categoryId = Number(input.categoryId || 0);
  if (!categoryId) {
    throw new Error("A service category is required.");
  }

  let saved = null;

  await withState((state) => {
    const next = clone(state);
    const id = Number(input.id || 0);
    const timestamp = now();
    const record = {
      categoryId,
      slug: slugify(input.slug || input.name, "service"),
      name: String(input.name || "").trim(),
      description: String(input.description || "").trim(),
      idealFor: String(input.idealFor || "").trim(),
      deliverables: String(input.deliverables || "").trim(),
      cta: String(input.cta || "").trim(),
      displayOrder: Number(input.displayOrder || 0),
      status: normalizeServiceStatus(String(input.status || "active"), "active"),
      updatedAt: timestamp,
    };

    if (id) {
      next.services = next.services.map((service) =>
        service.id === id ? { ...service, ...record } : service,
      );
      saved = next.services.find((service) => service.id === id) || null;
    } else {
      saved = {
        id: next.counters.service++,
        createdAt: timestamp,
        ...record,
      };
      next.services.push(saved);
    }

    return next;
  });

  return saved;
}

export async function deleteService(id) {
  await ensureAdminSeed();
  let removed = null;

  await withState((state) => {
    const next = clone(state);
    const numericId = Number(id);
    removed = next.services.find((service) => service.id === numericId) || null;
    next.services = next.services.filter((service) => service.id !== numericId);
    return next;
  });

  return removed;
}

export async function deleteCategory(id, replacementCategoryId = null) {
  await ensureAdminSeed();
  let removed = null;
  const categoryId = Number(id);
  const replacementId = replacementCategoryId ? Number(replacementCategoryId) : null;

  await withState((state) => {
    const next = clone(state);
    removed = withCategoryServices(
      next,
      next.categories.find((category) => category.id === categoryId) || {},
      { includeServices: true },
    );
    next.categories = next.categories.filter((category) => category.id !== categoryId);

    if (replacementId) {
      next.services = next.services.map((service) =>
        service.categoryId === categoryId ? { ...service, categoryId: replacementId } : service,
      );
      next.projects = next.projects.map((project) =>
        project.categoryId === categoryId ? { ...project, categoryId: replacementId } : project,
      );
    } else {
      next.services = next.services.filter((service) => service.categoryId !== categoryId);
      next.projects = next.projects.map((project) =>
        project.categoryId === categoryId ? { ...project, categoryId: null } : project,
      );
    }

    return next;
  });

  return removed;
}

export async function bulkUpdateCategoryStatus(ids, status) {
  await ensureAdminSeed();
  const normalized = normalizeCategoryStatus(String(status || "active"), "active");
  const targetIds = new Set((ids || []).map((value) => Number(value)).filter(Boolean));
  let count = 0;

  await withState((state) => {
    const next = clone(state);
    next.categories = next.categories.map((category) => {
      if (!targetIds.has(category.id)) return category;
      count += 1;
      return { ...category, status: normalized, updatedAt: now() };
    });
    return next;
  });

  return count;
}

export async function getCategoryAnalytics() {
  const [categories, services] = await Promise.all([
    listCategories({ includeServices: true, includeArchived: true }),
    listServices({ includeArchived: true }),
  ]);

  return {
    categories,
    services,
  };
}

export async function listProjects({ includeDrafts = false } = {}) {
  await ensureAdminSeed();
  const state = await readState();
  const categories = new Map(state.categories.map((category) => [category.id, category]));

  return sortProjects(
    state.projects
      .filter((project) =>
        includeDrafts ? true : project.status === "published" && project.published,
      )
      .map((project) => ({
        ...project,
        categoryName: project.categoryId ? categories.get(project.categoryId)?.name || "" : "",
      })),
  );
}

export async function getProjectById(id) {
  const projects = await listProjects({ includeDrafts: true });
  return projects.find((project) => project.id === Number(id)) || null;
}

export async function getProjectBySlug(slug) {
  await ensureAdminSeed();
  const state = await readState();
  const match = state.projects.find(
    (project) => project.slug === String(slug) && project.status === "published" && project.published,
  );
  if (!match) return null;

  await withState((current) => {
    const next = clone(current);
    next.projects = next.projects.map((project) =>
      project.slug === String(slug)
        ? { ...project, viewCount: Number(project.viewCount || 0) + 1, updatedAt: project.updatedAt }
        : project,
    );
    return next;
  });

  return { ...match, viewCount: Number(match.viewCount || 0) + 1 };
}

export async function getProjectTypes() {
  const projects = await listProjects({ includeDrafts: true });
  return [...new Set(projects.map((project) => project.type).filter(Boolean))].sort();
}

export async function getProjectStats() {
  const projects = await listProjects({ includeDrafts: true });
  return {
    total: projects.length,
    published: projects.filter((project) => project.status === "published").length,
    draft: projects.filter((project) => project.status === "draft").length,
    archived: projects.filter((project) => project.status === "archived").length,
  };
}

export async function saveProject(input) {
  await ensureAdminSeed();
  let saved = null;

  await withState((state) => {
    const next = clone(state);
    const id = Number(input.id || 0);
    const timestamp = now();
    const status = normalizeProjectStatus(
      String(input.status || (input.published ? "published" : "draft")),
      "draft",
    );
    const record = {
      slug: slugify(input.slug || input.title, "project"),
      title: String(input.title || "").trim(),
      type: String(input.type || "").trim(),
      categoryId: input.categoryId ? Number(input.categoryId) : null,
      year: String(input.year || "").trim(),
      posterPath: String(input.posterPath || "").trim(),
      videoPath: String(input.videoPath || "").trim(),
      videoUrl: String(input.videoUrl || "").trim(),
      shortDescription: String(input.shortDescription || "").trim(),
      longDescription: String(input.longDescription || "").trim(),
      role: String(input.role || "").trim(),
      tools: String(input.tools || "").trim(),
      clientName: String(input.clientName || "").trim(),
      credits: String(input.credits || "").trim(),
      published: status === "published" || Boolean(input.published),
      status,
      featured: Boolean(input.featured),
      publishedAt:
        status === "published"
          ? String(input.publishDate || "")
            ? new Date(String(input.publishDate)).toISOString()
            : timestamp
          : "",
      sortOrder: Number(input.sortOrder || 0),
      updatedAt: timestamp,
    };

    if (id) {
      next.projects = next.projects.map((project) =>
        project.id === id
          ? {
              ...project,
              ...record,
              viewCount: Number(project.viewCount || 0),
              publishedAt: record.publishedAt || project.publishedAt || "",
            }
          : project,
      );
      saved = next.projects.find((project) => project.id === id) || null;
    } else {
      saved = {
        id: next.counters.project++,
        createdAt: timestamp,
        viewCount: 0,
        ...record,
      };
      next.projects.push(saved);
    }

    return next;
  });

  return saved;
}

export async function updateProjectStatus(id, status) {
  await ensureAdminSeed();
  let saved = null;

  await withState((state) => {
    const next = clone(state);
    const numericId = Number(id);
    const normalized = normalizeProjectStatus(String(status || "draft"), "draft");

    next.projects = next.projects.map((project) => {
      if (project.id !== numericId) return project;
      saved = {
        ...project,
        status: normalized,
        published: normalized === "published",
        publishedAt:
          normalized === "published" ? project.publishedAt || now() : project.publishedAt || "",
        updatedAt: now(),
      };
      return saved;
    });

    return next;
  });

  return saved;
}

export async function duplicateProject(id) {
  const current = await getProjectById(id);
  if (!current) return null;

  return saveProject({
    ...current,
    id: null,
    slug: `${current.slug}-copy-${Date.now()}`,
    title: `${current.title} Copy`,
    status: "draft",
    published: false,
    publishDate: "",
  });
}

export async function deleteProject(id) {
  await ensureAdminSeed();
  await withState((state) => {
    const next = clone(state);
    const numericId = Number(id);
    next.projects = next.projects.filter((project) => project.id !== numericId);
    return next;
  });
}

export async function createActivity(input) {
  await ensureAdminSeed();
  let created = null;

  await withState((state) => {
    const next = clone(state);
    created = {
      id: next.counters.activity++,
      title: String(input.title || "").trim(),
      description: String(input.description || "").trim(),
      href: String(input.href || "").trim(),
      createdAt: now(),
    };
    next.activityLogs.unshift(created);
    next.activityLogs = next.activityLogs.slice(0, 100);
    return next;
  });

  return created;
}

export async function listActivities(limit = 10) {
  await ensureAdminSeed();
  const state = await readState();
  return [...state.activityLogs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, Number(limit || 10));
}

export async function getAdminAccount(username) {
  await ensureAdminSeed();
  const state = await readState();
  const user = state.users.find((item) => item.username === username);
  return user
    ? {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    : null;
}

export async function updateAdminAccount(input) {
  await ensureAdminSeed();
  const state = await readState();
  const current = state.users.find((user) => user.username === input.username);

  if (!current) {
    return { ok: false, error: "Admin account not found." };
  }

  if (input.newPassword && !verifyPassword(input.currentPassword, current.passwordHash)) {
    return { ok: false, error: "Current password is incorrect." };
  }

  await withState((base) => {
    const next = clone(base);
    next.users = next.users.map((user) =>
      user.username !== input.username
        ? user
        : {
            ...user,
            displayName: String(input.displayName || "").trim() || user.displayName,
            email: String(input.email || "").trim(),
            passwordHash: input.newPassword
              ? hashPassword(String(input.newPassword))
              : user.passwordHash,
            updatedAt: now(),
          },
    );
    return next;
  });

  return { ok: true };
}

export async function authenticateAdmin(identifier, password) {
  await ensureAdminSeed();
  const state = await readState();
  const needle = String(identifier || "").trim().toLowerCase();
  const user = state.users.find(
    (item) =>
      item.username.toLowerCase() === needle ||
      (item.email && item.email.toLowerCase() === needle),
  );

  if (!user) return null;
  if (!verifyPassword(String(password || ""), user.passwordHash)) return null;

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    email: user.email,
  };
}
