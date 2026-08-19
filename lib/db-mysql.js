import "server-only";

import mysql from "mysql2/promise";

import {
  DEFAULT_PROJECTS,
  DEFAULT_SERVICE_CATEGORIES,
  DEFAULT_SITE_SETTINGS,
} from "./default-portfolio";
import { hashPassword, verifyPassword } from "./security";

const DATABASE_URL = process.env.DATABASE_URL?.trim();

const PROJECT_STATUSES = new Set(["draft", "published", "archived"]);
const CATEGORY_STATUSES = new Set(["active", "archived"]);
const SERVICE_STATUSES = new Set(["active", "archived"]);
const SAFE_TABLES = new Set(["projects", "categories", "services"]);

const SITE_SETTINGS_FIELDS = [
  ["site_title", "siteTitle"],
  ["logo_path", "logoPath"],
  ["logo_alt", "logoAlt"],
  ["site_description", "siteDescription"],
  ["intro_heading", "introHeading"],
  ["intro_subheading", "introSubheading"],
  ["nav_home_label", "navHomeLabel"],
  ["nav_services_label", "navServicesLabel"],
  ["nav_projects_label", "navProjectsLabel"],
  ["nav_about_label", "navAboutLabel"],
  ["nav_contact_label", "navContactLabel"],
  ["nav_contact_cta_label", "navContactCtaLabel"],
  ["selected_project_label", "selectedProjectLabel"],
  ["play_video_label", "playVideoLabel"],
  ["project_overview_label", "projectOverviewLabel"],
  ["project_back_home_label", "projectBackHomeLabel"],
  ["project_contact_cta_label", "projectContactCtaLabel"],
  ["project_modal_close_label", "projectModalCloseLabel"],
  ["project_modal_back_label", "projectModalBackLabel"],
  ["no_video_label", "noVideoLabel"],
  ["about_title", "aboutTitle"],
  ["about_body", "aboutBody"],
  ["about_page_title", "aboutPageTitle"],
  ["about_page_lead", "aboutPageLead"],
  ["about_notes_title", "aboutNotesTitle"],
  ["about_notes_body", "aboutNotesBody"],
  ["availability_label", "availabilityLabel"],
  ["profile_availability", "profileAvailability"],
  ["services_title", "servicesTitle"],
  ["service_ideal_for_label", "serviceIdealForLabel"],
  ["service_deliverables_label", "serviceDeliverablesLabel"],
  ["service_one_name", "serviceOneName"],
  ["service_one_description", "serviceOneDescription"],
  ["service_one_ideal_for", "serviceOneIdealFor"],
  ["service_one_deliverables", "serviceOneDeliverables"],
  ["service_one_cta", "serviceOneCta"],
  ["service_two_name", "serviceTwoName"],
  ["service_two_description", "serviceTwoDescription"],
  ["service_two_ideal_for", "serviceTwoIdealFor"],
  ["service_two_deliverables", "serviceTwoDeliverables"],
  ["service_two_cta", "serviceTwoCta"],
  ["service_three_name", "serviceThreeName"],
  ["service_three_description", "serviceThreeDescription"],
  ["service_three_ideal_for", "serviceThreeIdealFor"],
  ["service_three_deliverables", "serviceThreeDeliverables"],
  ["service_three_cta", "serviceThreeCta"],
  ["skills_title", "skillsTitle"],
  ["skills_list", "skillsList"],
  ["open_to_title", "openToTitle"],
  ["open_to_list", "openToList"],
  ["contact_heading", "contactHeading"],
  ["contact_page_title", "contactPageTitle"],
  ["contact_page_lead", "contactPageLead"],
  ["contact_email", "contactEmail"],
  ["contact_phone", "contactPhone"],
  ["whatsapp", "whatsapp"],
  ["location", "location"],
  ["email_label", "emailLabel"],
  ["phone_label", "phoneLabel"],
  ["whatsapp_label", "whatsappLabel"],
  ["location_label", "locationLabel"],
  ["socials_label", "socialsLabel"],
  ["instagram_url", "instagramUrl"],
  ["linkedin_url", "linkedinUrl"],
  ["youtube_url", "youtubeUrl"],
  ["cta_label", "ctaLabel"],
  ["portfolio_url", "portfolioUrl"],
  ["default_language", "defaultLanguage"],
  ["timezone", "timezone"],
  ["booking_enabled", "bookingEnabled"],
  ["booking_cta", "bookingCta"],
  ["booking_url", "bookingUrl"],
  ["seo_title", "seoTitle"],
  ["meta_description", "metaDescription"],
  ["tracking_id", "trackingId"],
];

const SITE_SETTINGS_DEFAULTS = Object.fromEntries(
  SITE_SETTINGS_FIELDS.map(([, key]) => [key, DEFAULT_SITE_SETTINGS[key]]),
);

function normalizeTimestamp(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function withDefault(value, fallback) {
  return value === undefined || value === null || value === "" ? fallback : value;
}

function normalizeMySqlUrl(raw) {
  return String(raw || "").replace(/@tcp\(([^)]+)\)/i, "@$1");
}

function getPoolConfig() {
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is required for the MySQL storage driver.");
  }

  const parsed = new URL(normalizeMySqlUrl(DATABASE_URL));
  if (parsed.protocol !== "mysql:") {
    throw new Error("DATABASE_URL must use the mysql:// scheme for the MySQL storage driver.");
  }

  return {
    host: parsed.hostname,
    port: Number(parsed.port || 3306),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: decodeURIComponent(parsed.pathname.replace(/^\//, "")),
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    charset: "utf8mb4",
  };
}

function getPool() {
  if (!globalThis.__portfolioMySqlPool) {
    globalThis.__portfolioMySqlPool = mysql.createPool(getPoolConfig());
  }

  return globalThis.__portfolioMySqlPool;
}

async function query(text, params = []) {
  const [rows] = await getPool().execute(text, params);
  return rows;
}

async function one(text, params = []) {
  const rows = await query(text, params);
  return Array.isArray(rows) ? rows[0] || null : null;
}

async function many(text, params = []) {
  const rows = await query(text, params);
  return Array.isArray(rows) ? rows : [];
}

function sanitizeSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function normalizeStatus(value, fallback = "draft") {
  return PROJECT_STATUSES.has(value) ? value : fallback;
}

function normalizeCategoryStatus(value, fallback = "active") {
  return CATEGORY_STATUSES.has(value) ? value : fallback;
}

function normalizeServiceStatus(value, fallback = "active") {
  return SERVICE_STATUSES.has(value) ? value : fallback;
}

function toProject(row) {
  if (!row) return null;

  const status = PROJECT_STATUSES.has(row.status)
    ? row.status
    : row.published
      ? "published"
      : "draft";

  return {
    id: Number(row.id),
    slug: row.slug,
    title: row.title,
    type: row.type,
    categoryId: row.category_id ? Number(row.category_id) : null,
    year: row.year,
    posterPath: row.poster_path,
    videoPath: row.video_path,
    videoUrl: row.video_url,
    shortDescription: row.short_description,
    longDescription: row.long_description,
    role: row.role,
    tools: row.tools,
    clientName: row.client_name,
    credits: row.credits,
    published: status === "published",
    status,
    featured: Boolean(row.featured),
    viewCount: Number(row.view_count || 0),
    publishedAt: normalizeTimestamp(row.published_at),
    sortOrder: Number(row.sort_order || 0),
    createdAt: normalizeTimestamp(row.created_at),
    updatedAt: normalizeTimestamp(row.updated_at),
  };
}

function toService(row) {
  if (!row) return null;

  return {
    id: Number(row.id),
    categoryId: Number(row.category_id),
    slug: row.slug,
    name: row.name,
    description: row.description,
    idealFor: row.ideal_for,
    deliverables: row.deliverables,
    cta: row.cta,
    displayOrder: Number(row.display_order || 0),
    status: normalizeServiceStatus(row.status),
    createdAt: normalizeTimestamp(row.created_at),
    updatedAt: normalizeTimestamp(row.updated_at),
  };
}

function toCategory(row, services = [], analytics = null) {
  if (!row) return null;

  return {
    id: Number(row.id),
    slug: row.slug,
    name: row.name,
    description: row.description,
    color: row.color,
    icon: row.icon,
    displayOrder: Number(row.display_order || 0),
    status: normalizeCategoryStatus(row.status),
    services,
    analytics,
    createdAt: normalizeTimestamp(row.created_at),
    updatedAt: normalizeTimestamp(row.updated_at),
  };
}

function toSettings(row) {
  const settings = {};

  for (const [column, key] of SITE_SETTINGS_FIELDS) {
    if (key === "bookingEnabled") {
      settings[key] = Boolean(row?.[column]);
      continue;
    }

    settings[key] = withDefault(row?.[column], SITE_SETTINGS_DEFAULTS[key]);
  }

  settings.updatedAt = normalizeTimestamp(row?.updated_at);
  return settings;
}

async function ensureColumns(table, defs) {
  for (const [name, def] of defs) {
    const row = await one(
      `
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
          AND COLUMN_NAME = ?
      `,
      [table, name],
    );

    if (!row) {
      await query(`ALTER TABLE ${table} ADD COLUMN ${name} ${def}`);
    }
  }
}

async function createTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(191) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      email VARCHAR(191) NOT NULL DEFAULT '',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id INT NOT NULL PRIMARY KEY,
      site_title TEXT NOT NULL,
      logo_path TEXT NOT NULL,
      logo_alt TEXT NOT NULL,
      site_description TEXT NOT NULL,
      intro_heading TEXT NOT NULL,
      intro_subheading TEXT NOT NULL,
      nav_home_label TEXT NOT NULL,
      nav_services_label TEXT NOT NULL,
      nav_projects_label TEXT NOT NULL,
      nav_about_label TEXT NOT NULL,
      nav_contact_label TEXT NOT NULL,
      nav_contact_cta_label TEXT NOT NULL,
      selected_project_label TEXT NOT NULL,
      play_video_label TEXT NOT NULL,
      project_overview_label TEXT NOT NULL,
      project_back_home_label TEXT NOT NULL,
      project_contact_cta_label TEXT NOT NULL,
      project_modal_close_label TEXT NOT NULL,
      project_modal_back_label TEXT NOT NULL,
      no_video_label TEXT NOT NULL,
      about_title TEXT NOT NULL,
      about_body TEXT NOT NULL,
      about_page_title TEXT NOT NULL,
      about_page_lead TEXT NOT NULL,
      about_notes_title TEXT NOT NULL,
      about_notes_body TEXT NOT NULL,
      availability_label TEXT NOT NULL,
      profile_availability TEXT NOT NULL,
      services_title TEXT NOT NULL,
      service_ideal_for_label TEXT NOT NULL,
      service_deliverables_label TEXT NOT NULL,
      service_one_name TEXT NOT NULL,
      service_one_description TEXT NOT NULL,
      service_one_ideal_for TEXT NOT NULL,
      service_one_deliverables TEXT NOT NULL,
      service_one_cta TEXT NOT NULL,
      service_two_name TEXT NOT NULL,
      service_two_description TEXT NOT NULL,
      service_two_ideal_for TEXT NOT NULL,
      service_two_deliverables TEXT NOT NULL,
      service_two_cta TEXT NOT NULL,
      service_three_name TEXT NOT NULL,
      service_three_description TEXT NOT NULL,
      service_three_ideal_for TEXT NOT NULL,
      service_three_deliverables TEXT NOT NULL,
      service_three_cta TEXT NOT NULL,
      skills_title TEXT NOT NULL,
      skills_list TEXT NOT NULL,
      open_to_title TEXT NOT NULL,
      open_to_list TEXT NOT NULL,
      contact_heading TEXT NOT NULL,
      contact_page_title TEXT NOT NULL,
      contact_page_lead TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      location TEXT NOT NULL,
      email_label TEXT NOT NULL,
      phone_label TEXT NOT NULL,
      whatsapp_label TEXT NOT NULL,
      location_label TEXT NOT NULL,
      socials_label TEXT NOT NULL,
      instagram_url TEXT NOT NULL,
      linkedin_url TEXT NOT NULL,
      youtube_url TEXT NOT NULL,
      cta_label TEXT NOT NULL,
      portfolio_url TEXT NOT NULL,
      default_language TEXT NOT NULL,
      timezone TEXT NOT NULL,
      booking_enabled TINYINT(1) NOT NULL DEFAULT 0,
      booking_cta TEXT NOT NULL,
      booking_url TEXT NOT NULL,
      seo_title TEXT NOT NULL,
      meta_description TEXT NOT NULL,
      tracking_id TEXT NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(191) NOT NULL UNIQUE,
      name VARCHAR(191) NOT NULL,
      description TEXT NOT NULL,
      color VARCHAR(64) NOT NULL,
      icon VARCHAR(128) NOT NULL,
      display_order INT NOT NULL DEFAULT 0,
      status VARCHAR(32) NOT NULL DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS services (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      category_id INT NOT NULL,
      slug VARCHAR(191) NOT NULL UNIQUE,
      name VARCHAR(191) NOT NULL,
      description TEXT NOT NULL,
      ideal_for TEXT NOT NULL,
      deliverables TEXT NOT NULL,
      cta TEXT NOT NULL,
      display_order INT NOT NULL DEFAULT 0,
      status VARCHAR(32) NOT NULL DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_services_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
        ON DELETE CASCADE
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS projects (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(191) NOT NULL UNIQUE,
      title VARCHAR(191) NOT NULL,
      type VARCHAR(191) NOT NULL,
      category_id INT NULL,
      year VARCHAR(32) NOT NULL,
      poster_path TEXT NOT NULL,
      video_path TEXT NOT NULL,
      video_url TEXT NOT NULL,
      short_description TEXT NOT NULL,
      long_description TEXT NOT NULL,
      role TEXT NOT NULL,
      tools TEXT NOT NULL,
      client_name TEXT NOT NULL,
      credits TEXT NOT NULL,
      published TINYINT(1) NOT NULL DEFAULT 1,
      status VARCHAR(32) NOT NULL DEFAULT 'published',
      featured TINYINT(1) NOT NULL DEFAULT 0,
      view_count INT NOT NULL DEFAULT 0,
      published_at DATETIME NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_projects_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
        ON DELETE SET NULL
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      href TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function ensureUsersColumns() {
  await ensureColumns("users", [
    ["display_name", "TEXT NOT NULL DEFAULT ''"],
    ["email", "VARCHAR(191) NOT NULL DEFAULT ''"],
  ]);
}

async function ensureSiteSettingsColumns() {
  await ensureColumns("site_settings", [
    ["logo_path", "TEXT NOT NULL DEFAULT ''"],
    ["logo_alt", "TEXT NOT NULL DEFAULT ''"],
    ["nav_home_label", "TEXT NOT NULL"],
    ["nav_services_label", "TEXT NOT NULL"],
    ["nav_projects_label", "TEXT NOT NULL"],
    ["nav_about_label", "TEXT NOT NULL"],
    ["nav_contact_label", "TEXT NOT NULL"],
    ["nav_contact_cta_label", "TEXT NOT NULL"],
    ["selected_project_label", "TEXT NOT NULL"],
    ["play_video_label", "TEXT NOT NULL"],
    ["project_overview_label", "TEXT NOT NULL"],
    ["project_back_home_label", "TEXT NOT NULL"],
    ["project_contact_cta_label", "TEXT NOT NULL"],
    ["project_modal_close_label", "TEXT NOT NULL"],
    ["project_modal_back_label", "TEXT NOT NULL"],
    ["no_video_label", "TEXT NOT NULL"],
    ["about_page_title", "TEXT NOT NULL"],
    ["about_page_lead", "TEXT NOT NULL"],
    ["about_notes_title", "TEXT NOT NULL"],
    ["about_notes_body", "TEXT NOT NULL"],
    ["availability_label", "TEXT NOT NULL"],
    ["profile_availability", "TEXT NOT NULL"],
    ["services_title", "TEXT NOT NULL"],
    ["service_ideal_for_label", "TEXT NOT NULL"],
    ["service_deliverables_label", "TEXT NOT NULL"],
    ["service_one_name", "TEXT NOT NULL"],
    ["service_one_description", "TEXT NOT NULL"],
    ["service_one_ideal_for", "TEXT NOT NULL"],
    ["service_one_deliverables", "TEXT NOT NULL"],
    ["service_one_cta", "TEXT NOT NULL"],
    ["service_two_name", "TEXT NOT NULL"],
    ["service_two_description", "TEXT NOT NULL"],
    ["service_two_ideal_for", "TEXT NOT NULL"],
    ["service_two_deliverables", "TEXT NOT NULL"],
    ["service_two_cta", "TEXT NOT NULL"],
    ["service_three_name", "TEXT NOT NULL"],
    ["service_three_description", "TEXT NOT NULL"],
    ["service_three_ideal_for", "TEXT NOT NULL"],
    ["service_three_deliverables", "TEXT NOT NULL"],
    ["service_three_cta", "TEXT NOT NULL"],
    ["skills_title", "TEXT NOT NULL"],
    ["skills_list", "TEXT NOT NULL"],
    ["open_to_title", "TEXT NOT NULL"],
    ["open_to_list", "TEXT NOT NULL"],
    ["contact_page_title", "TEXT NOT NULL"],
    ["contact_page_lead", "TEXT NOT NULL"],
    ["email_label", "TEXT NOT NULL"],
    ["phone_label", "TEXT NOT NULL"],
    ["whatsapp_label", "TEXT NOT NULL"],
    ["location_label", "TEXT NOT NULL"],
    ["socials_label", "TEXT NOT NULL"],
    ["portfolio_url", "TEXT NOT NULL"],
    ["default_language", "TEXT NOT NULL"],
    ["timezone", "TEXT NOT NULL"],
    ["booking_enabled", "TINYINT(1) NOT NULL DEFAULT 0"],
    ["booking_cta", "TEXT NOT NULL"],
    ["booking_url", "TEXT NOT NULL"],
    ["seo_title", "TEXT NOT NULL"],
    ["meta_description", "TEXT NOT NULL"],
    ["tracking_id", "TEXT NOT NULL"],
  ]);
}

async function ensureProjectsColumns() {
  await ensureColumns("projects", [
    ["status", "VARCHAR(32) NOT NULL DEFAULT 'published'"],
    ["category_id", "INT NULL"],
    ["featured", "TINYINT(1) NOT NULL DEFAULT 0"],
    ["view_count", "INT NOT NULL DEFAULT 0"],
    ["published_at", "DATETIME NULL"],
  ]);

  await query(`
    UPDATE projects
    SET status = CASE
      WHEN status IS NULL OR status = '' THEN CASE WHEN published = 1 THEN 'published' ELSE 'draft' END
      ELSE status
    END
  `);
}

async function ensureCategoriesColumns() {
  await ensureColumns("categories", [
    ["description", "TEXT NOT NULL"],
    ["color", "VARCHAR(64) NOT NULL"],
    ["icon", "VARCHAR(128) NOT NULL"],
    ["display_order", "INT NOT NULL DEFAULT 0"],
    ["status", "VARCHAR(32) NOT NULL DEFAULT 'active'"],
  ]);
}

async function ensureServicesColumns() {
  await ensureColumns("services", [
    ["description", "TEXT NOT NULL"],
    ["ideal_for", "TEXT NOT NULL"],
    ["deliverables", "TEXT NOT NULL"],
    ["cta", "TEXT NOT NULL"],
    ["display_order", "INT NOT NULL DEFAULT 0"],
    ["status", "VARCHAR(32) NOT NULL DEFAULT 'active'"],
  ]);
}

async function seedUsers() {
  const row = await one("SELECT COUNT(*) AS count FROM users");
  if (Number(row?.count || 0) > 0) return;

  const username = process.env.ADMIN_USERNAME || "admin";
  const email = process.env.ADMIN_EMAIL?.trim() || "";
  const displayName = process.env.ADMIN_DISPLAY_NAME?.trim() || "Admin";
  const password = process.env.ADMIN_PASSWORD || "changeme123";
  if (
    process.env.NODE_ENV === "production" &&
    (!process.env.ADMIN_PASSWORD || password === "changeme123")
  ) {
    console.warn(
      "ADMIN_PASSWORD is missing or insecure in production. Skipping initial admin seed until secure runtime variables are configured.",
    );
    return;
  }

  await query(
    `
      INSERT INTO users (username, password_hash, display_name, email, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
    [username, hashPassword(password), displayName, email],
  );
}

function buildSiteSettingsPayload(input) {
  const values = {};

  for (const [, key] of SITE_SETTINGS_FIELDS) {
    if (key === "bookingEnabled") {
      values[key] = input[key] ? 1 : 0;
      continue;
    }

    if (key === "whatsapp" || key === "instagramUrl" || key === "linkedinUrl" || key === "youtubeUrl") {
      values[key] = input[key]?.trim() || "";
      continue;
    }

    values[key] = input[key]?.trim() || SITE_SETTINGS_DEFAULTS[key];
  }

  return values;
}

async function seedSiteSettings() {
  const row = await one("SELECT id FROM site_settings WHERE id = 1");
  if (row) return;

  const values = buildSiteSettingsPayload(DEFAULT_SITE_SETTINGS);
  const columns = SITE_SETTINGS_FIELDS.map(([column]) => column);
  const keys = SITE_SETTINGS_FIELDS.map(([, key]) => key);
  const placeholders = columns.map(() => "?").join(", ");

  await query(
    `
      INSERT INTO site_settings (
        id,
        ${columns.join(", ")},
        updated_at
      ) VALUES (
        1,
        ${placeholders},
        CURRENT_TIMESTAMP
      )
    `,
    keys.map((key) => values[key]),
  );
}

async function seedProjects() {
  const row = await one("SELECT COUNT(*) AS count FROM projects");
  if (Number(row?.count || 0) > 0) return;

  for (const project of DEFAULT_PROJECTS) {
    await query(
      `
        INSERT INTO projects (
          slug,
          title,
          type,
          category_id,
          year,
          poster_path,
          video_path,
          video_url,
          short_description,
          long_description,
          role,
          tools,
          client_name,
          credits,
          published,
          status,
          featured,
          view_count,
          published_at,
          sort_order,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `,
      [
        project.slug,
        project.title,
        project.type,
        project.categoryId,
        project.year,
        project.posterPath,
        project.videoPath,
        project.videoUrl,
        project.shortDescription,
        project.longDescription,
        project.role,
        project.tools,
        project.clientName,
        project.credits,
        project.published ? 1 : 0,
        project.status || (project.published ? "published" : "draft"),
        project.featured ? 1 : 0,
        project.viewCount || 0,
        project.published ? new Date().toISOString().slice(0, 19).replace("T", " ") : null,
        project.sortOrder,
      ],
    );
  }
}

async function seedCategoriesAndServices() {
  const row = await one("SELECT COUNT(*) AS count FROM categories");
  if (Number(row?.count || 0) > 0) return;

  for (const category of DEFAULT_SERVICE_CATEGORIES) {
    const result = await query(
      `
        INSERT INTO categories (
          slug,
          name,
          description,
          color,
          icon,
          display_order,
          status,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `,
      [
        sanitizeSlug(category.name),
        category.name,
        category.description || "",
        category.color || "",
        category.icon || "",
        category.displayOrder || 0,
        CATEGORY_STATUSES.has(category.status) ? category.status : "active",
      ],
    );

    const categoryId = Number(result.insertId);

    for (const service of category.services || []) {
      await query(
        `
          INSERT INTO services (
            category_id,
            slug,
            name,
            description,
            ideal_for,
            deliverables,
            cta,
            display_order,
            status,
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `,
        [
          categoryId,
          sanitizeSlug(service.name),
          service.name,
          service.description || "",
          service.idealFor || "",
          service.deliverables || "",
          service.cta || "",
          service.displayOrder || 0,
          SERVICE_STATUSES.has(service.status) ? service.status : "active",
        ],
      );
    }
  }
}

async function initialize() {
  if (!globalThis.__portfolioMySqlInitPromise) {
    globalThis.__portfolioMySqlInitPromise = (async () => {
      await createTables();
      await ensureUsersColumns();
      await ensureSiteSettingsColumns();
      await ensureProjectsColumns();
      await ensureCategoriesColumns();
      await ensureServicesColumns();
      await seedUsers();
      await seedSiteSettings();
      await seedProjects();
      await seedCategoriesAndServices();
      return getPool();
    })();
  }

  return globalThis.__portfolioMySqlInitPromise;
}

async function uniqueTableSlug(table, baseSlug, excludeId) {
  if (!SAFE_TABLES.has(table)) {
    throw new Error(`Unsupported slug table: ${table}`);
  }

  const stem = sanitizeSlug(baseSlug) || `${table}-${Date.now()}`;
  let slug = stem;
  let index = 1;

  while (true) {
    const row = excludeId
      ? await one(`SELECT id FROM ${table} WHERE slug = ? AND id != ?`, [slug, excludeId])
      : await one(`SELECT id FROM ${table} WHERE slug = ?`, [slug]);

    if (!row) return slug;
    index += 1;
    slug = `${stem}-${index}`;
  }
}

async function uniqueSlug(baseSlug, excludeId) {
  return uniqueTableSlug("projects", baseSlug, excludeId);
}

export async function getSiteSettings() {
  await initialize();
  const row = await one("SELECT * FROM site_settings WHERE id = 1");
  return row ? toSettings(row) : { ...DEFAULT_SITE_SETTINGS };
}

export async function listServices({
  includeArchived = false,
  categoryId = null,
} = {}) {
  await initialize();
  const filters = [];
  const params = [];

  if (!includeArchived) {
    filters.push("status = 'active'");
  }

  if (categoryId) {
    filters.push("category_id = ?");
    params.push(Number(categoryId));
  }

  const rows = await many(
    `
      SELECT *
      FROM services
      ${filters.length ? `WHERE ${filters.join(" AND ")}` : ""}
      ORDER BY display_order ASC, LOWER(name) ASC, id ASC
    `,
    params,
  );

  return rows.map(toService);
}

export async function listCategories({
  includeArchived = false,
  includeServices = false,
  includeAnalytics = false,
} = {}) {
  await initialize();
  const rows = await many(
    `
      SELECT *
      FROM categories
      ${includeArchived ? "" : "WHERE status = 'active'"}
      ORDER BY display_order ASC, LOWER(name) ASC, id ASC
    `,
  );

  const services =
    includeServices || includeAnalytics ? await listServices({ includeArchived: true }) : [];

  const categories = [];
  for (const row of rows) {
    const categoryServices =
      includeServices || includeAnalytics
        ? services.filter((service) => service.categoryId === Number(row.id))
        : [];

    let analytics = null;
    if (includeAnalytics) {
      const projectCount = await one(
        "SELECT COUNT(*) AS count FROM projects WHERE category_id = ?",
        [Number(row.id)],
      );

      analytics = {
        servicesCount: categoryServices.length,
        activeServicesCount: categoryServices.filter((service) => service.status === "active")
          .length,
        inquiryCount: null,
        projectCount: Number(projectCount?.count || 0),
        avgTimeSpent: null,
      };
    }

    categories.push(toCategory(row, categoryServices, analytics));
  }

  return categories;
}

export async function getCategoryById(id, options = {}) {
  await initialize();
  const row = await one("SELECT * FROM categories WHERE id = ?", [Number(id)]);
  if (!row) return null;

  const services = options.includeServices
    ? await listServices({ includeArchived: true, categoryId: id })
    : [];

  let analytics = null;
  if (options.includeAnalytics) {
    const projectCount = await one(
      "SELECT COUNT(*) AS count FROM projects WHERE category_id = ?",
      [Number(id)],
    );

    analytics = {
      servicesCount: services.length,
      activeServicesCount: services.filter((service) => service.status === "active").length,
      inquiryCount: null,
      projectCount: Number(projectCount?.count || 0),
      avgTimeSpent: null,
    };
  }

  return toCategory(row, services, analytics);
}

export async function getServiceById(id) {
  await initialize();
  const row = await one("SELECT * FROM services WHERE id = ?", [Number(id)]);
  return toService(row);
}

export async function updateSiteSettings(input) {
  await initialize();
  const values = buildSiteSettingsPayload(input);
  const updates = SITE_SETTINGS_FIELDS.map(([column]) => `${column} = ?`).join(",\n        ");
  const params = SITE_SETTINGS_FIELDS.map(([, key]) => values[key]);

  await query(
    `
      UPDATE site_settings
      SET
        ${updates},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `,
    params,
  );

  return getSiteSettings();
}

export async function saveCategory(input) {
  await initialize();
  const categoryId = input.id ? Number(input.id) : null;
  const current = categoryId ? await getCategoryById(categoryId) : null;
  const name = input.name?.trim() || "Untitled category";
  const values = {
    slug: await uniqueTableSlug("categories", input.slug || name, categoryId),
    name,
    description: input.description?.trim() || "",
    color: input.color?.trim() || "",
    icon: input.icon?.trim() || "",
    displayOrder: Number.isFinite(Number(input.displayOrder)) ? Number(input.displayOrder) : 0,
    status: normalizeCategoryStatus(input.status, current?.status || "active"),
  };

  if (categoryId) {
    await query(
      `
        UPDATE categories
        SET
          slug = ?,
          name = ?,
          description = ?,
          color = ?,
          icon = ?,
          display_order = ?,
          status = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [
        values.slug,
        values.name,
        values.description,
        values.color,
        values.icon,
        values.displayOrder,
        values.status,
        categoryId,
      ],
    );

    return getCategoryById(categoryId, { includeServices: true, includeAnalytics: true });
  }

  const result = await query(
    `
      INSERT INTO categories (
        slug,
        name,
        description,
        color,
        icon,
        display_order,
        status,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
    [
      values.slug,
      values.name,
      values.description,
      values.color,
      values.icon,
      values.displayOrder,
      values.status,
    ],
  );

  return getCategoryById(result.insertId, {
    includeServices: true,
    includeAnalytics: true,
  });
}

export async function saveService(input) {
  await initialize();
  const serviceId = input.id ? Number(input.id) : null;
  const current = serviceId ? await getServiceById(serviceId) : null;
  const name = input.name?.trim() || "Untitled service";
  const values = {
    categoryId: Number(input.categoryId) || current?.categoryId || null,
    slug: await uniqueTableSlug("services", input.slug || name, serviceId),
    name,
    description: input.description?.trim() || "",
    idealFor: input.idealFor?.trim() || "",
    deliverables: input.deliverables?.trim() || "",
    cta: input.cta?.trim() || "",
    displayOrder: Number.isFinite(Number(input.displayOrder)) ? Number(input.displayOrder) : 0,
    status: normalizeServiceStatus(input.status, current?.status || "active"),
  };

  if (!values.categoryId) {
    throw new Error("A service category is required.");
  }

  if (serviceId) {
    await query(
      `
        UPDATE services
        SET
          category_id = ?,
          slug = ?,
          name = ?,
          description = ?,
          ideal_for = ?,
          deliverables = ?,
          cta = ?,
          display_order = ?,
          status = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [
        values.categoryId,
        values.slug,
        values.name,
        values.description,
        values.idealFor,
        values.deliverables,
        values.cta,
        values.displayOrder,
        values.status,
        serviceId,
      ],
    );

    return getServiceById(serviceId);
  }

  const result = await query(
    `
      INSERT INTO services (
        category_id,
        slug,
        name,
        description,
        ideal_for,
        deliverables,
        cta,
        display_order,
        status,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
    [
      values.categoryId,
      values.slug,
      values.name,
      values.description,
      values.idealFor,
      values.deliverables,
      values.cta,
      values.displayOrder,
      values.status,
    ],
  );

  return getServiceById(result.insertId);
}

export async function deleteService(id) {
  await initialize();
  const current = await getServiceById(id);
  if (!current) return null;

  await query("DELETE FROM services WHERE id = ?", [Number(id)]);
  return current;
}

export async function deleteCategory(id, replacementCategoryId = null) {
  await initialize();
  const categoryId = Number(id);
  const current = await getCategoryById(categoryId, { includeServices: true });
  if (!current) return null;

  const replacementId = replacementCategoryId ? Number(replacementCategoryId) : null;
  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();

    if (replacementId && replacementId !== categoryId) {
      await connection.execute(
        `
          UPDATE services
          SET category_id = ?, updated_at = CURRENT_TIMESTAMP
          WHERE category_id = ?
        `,
        [replacementId, categoryId],
      );

      await connection.execute(
        `
          UPDATE projects
          SET category_id = ?, updated_at = CURRENT_TIMESTAMP
          WHERE category_id = ?
        `,
        [replacementId, categoryId],
      );
    } else {
      await connection.execute("DELETE FROM services WHERE category_id = ?", [categoryId]);

      await connection.execute(
        `
          UPDATE projects
          SET category_id = NULL, updated_at = CURRENT_TIMESTAMP
          WHERE category_id = ?
        `,
        [categoryId],
      );
    }

    await connection.execute("DELETE FROM categories WHERE id = ?", [categoryId]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return current;
}

export async function bulkUpdateCategoryStatus(ids, status) {
  await initialize();
  const validIds = ids.map((id) => Number(id)).filter(Boolean);
  const nextStatus = normalizeCategoryStatus(status);
  if (!validIds.length) return 0;

  const placeholders = validIds.map(() => "?").join(", ");
  const result = await query(
    `
      UPDATE categories
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id IN (${placeholders})
    `,
    [nextStatus, ...validIds],
  );

  return Number(result.affectedRows || 0);
}

export async function getCategoryAnalytics() {
  const categories = await listCategories({
    includeArchived: true,
    includeServices: true,
    includeAnalytics: true,
  });
  const services = await listServices({ includeArchived: true });

  return {
    categories,
    services: services.map((service) => {
      const category = categories.find((item) => item.id === service.categoryId);

      return {
        ...service,
        categoryName: category?.name || "Unassigned",
        inquiryCount: null,
        projectsCompleted: null,
        avgTimeSpent: null,
        lastInquiry: null,
      };
    }),
  };
}

export async function listProjects({ includeDrafts = false } = {}) {
  await initialize();
  const rows = await many(
    `
      SELECT *
      FROM projects
      ${includeDrafts ? "" : "WHERE status = 'published'"}
      ORDER BY sort_order ASC, updated_at DESC, id ASC
    `,
  );

  return rows.map(toProject);
}

export async function getProjectById(id) {
  await initialize();
  const row = await one("SELECT * FROM projects WHERE id = ?", [Number(id)]);
  return toProject(row);
}

export async function getProjectBySlug(slug, { includeDrafts = false } = {}) {
  await initialize();
  const row = await one(
    `
      SELECT *
      FROM projects
      WHERE slug = ?
      ${includeDrafts ? "" : "AND status = 'published'"}
    `,
    [slug],
  );

  return toProject(row);
}

export async function getProjectTypes() {
  const projects = await listProjects({ includeDrafts: true });
  return [...new Set(projects.map((project) => project.type).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export async function getProjectStats() {
  const projects = await listProjects({ includeDrafts: true });
  const published = projects.filter((project) => project.status === "published").length;
  const draft = projects.filter((project) => project.status === "draft").length;
  const archived = projects.filter((project) => project.status === "archived").length;

  return {
    total: projects.length,
    published,
    draft,
    archived,
    featured: projects.filter((project) => project.featured).length,
  };
}

export async function saveProject(input) {
  await initialize();
  const projectId = input.id ? Number(input.id) : null;
  const current = projectId ? await getProjectById(projectId) : null;
  const title = input.title?.trim() || "Untitled project";
  const status = normalizeStatus(input.status, current?.status || "draft");
  const publishedAt =
    status === "published"
      ? input.publishDate || current?.publishedAt || new Date().toISOString()
      : null;

  const values = {
    slug: await uniqueSlug(input.slug || title, projectId),
    title,
    type: input.type?.trim() || current?.type || "Project",
    categoryId: input.categoryId ? Number(input.categoryId) : null,
    year: input.year?.trim() || current?.year || String(new Date().getFullYear()),
    posterPath: input.posterPath?.trim() || current?.posterPath || "",
    videoPath: input.videoPath?.trim() || current?.videoPath || "",
    videoUrl: input.videoUrl?.trim() || "",
    shortDescription: input.shortDescription?.trim() || "",
    longDescription: input.longDescription?.trim() || "",
    role: input.role?.trim() || "",
    tools: input.tools?.trim() || "",
    clientName: input.clientName?.trim() || "",
    credits: input.credits?.trim() || "",
    published: status === "published" ? 1 : 0,
    status,
    featured: input.featured ? 1 : 0,
    publishedAt: publishedAt
      ? new Date(publishedAt).toISOString().slice(0, 19).replace("T", " ")
      : null,
    sortOrder: Number.isFinite(Number(input.sortOrder))
      ? Number(input.sortOrder)
      : current?.sortOrder || 0,
  };

  if (projectId) {
    await query(
      `
        UPDATE projects
        SET
          slug = ?,
          title = ?,
          type = ?,
          category_id = ?,
          year = ?,
          poster_path = ?,
          video_path = ?,
          video_url = ?,
          short_description = ?,
          long_description = ?,
          role = ?,
          tools = ?,
          client_name = ?,
          credits = ?,
          published = ?,
          status = ?,
          featured = ?,
          published_at = ?,
          sort_order = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [
        values.slug,
        values.title,
        values.type,
        values.categoryId,
        values.year,
        values.posterPath,
        values.videoPath,
        values.videoUrl,
        values.shortDescription,
        values.longDescription,
        values.role,
        values.tools,
        values.clientName,
        values.credits,
        values.published,
        values.status,
        values.featured,
        values.publishedAt,
        values.sortOrder,
        projectId,
      ],
    );

    return getProjectById(projectId);
  }

  const result = await query(
    `
      INSERT INTO projects (
        slug,
        title,
        type,
        category_id,
        year,
        poster_path,
        video_path,
        video_url,
        short_description,
        long_description,
        role,
        tools,
        client_name,
        credits,
        published,
        status,
        featured,
        view_count,
        published_at,
        sort_order,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, CURRENT_TIMESTAMP)
    `,
    [
      values.slug,
      values.title,
      values.type,
      values.categoryId,
      values.year,
      values.posterPath,
      values.videoPath,
      values.videoUrl,
      values.shortDescription,
      values.longDescription,
      values.role,
      values.tools,
      values.clientName,
      values.credits,
      values.published,
      values.status,
      values.featured,
      values.publishedAt,
      values.sortOrder,
    ],
  );

  return getProjectById(result.insertId);
}

export async function updateProjectStatus(id, status) {
  await initialize();
  const current = await getProjectById(id);
  if (!current) return null;

  const nextStatus = normalizeStatus(status, current.status);
  const publishedAt =
    nextStatus === "published"
      ? current.publishedAt || new Date().toISOString()
      : null;

  await query(
    `
      UPDATE projects
      SET
        status = ?,
        published = ?,
        published_at = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [
      nextStatus,
      nextStatus === "published" ? 1 : 0,
      publishedAt ? new Date(publishedAt).toISOString().slice(0, 19).replace("T", " ") : null,
      Number(id),
    ],
  );

  return getProjectById(Number(id));
}

export async function duplicateProject(id) {
  await initialize();
  const current = await getProjectById(id);
  if (!current) return null;

  const copyTitle = `${current.title} Copy`;
  const slug = await uniqueSlug(`${current.slug}-copy`);
  const result = await query(
    `
      INSERT INTO projects (
        slug,
        title,
        type,
        category_id,
        year,
        poster_path,
        video_path,
        video_url,
        short_description,
        long_description,
        role,
        tools,
        client_name,
        credits,
        published,
        status,
        featured,
        view_count,
        published_at,
        sort_order,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'draft', 0, 0, NULL, ?, CURRENT_TIMESTAMP)
    `,
    [
      slug,
      copyTitle,
      current.type,
      current.categoryId,
      current.year,
      current.posterPath,
      current.videoPath,
      current.videoUrl,
      current.shortDescription,
      current.longDescription,
      current.role,
      current.tools,
      current.clientName,
      current.credits,
      current.sortOrder + 1,
    ],
  );

  return getProjectById(result.insertId);
}

export async function deleteProject(id) {
  await initialize();
  await query("DELETE FROM projects WHERE id = ?", [Number(id)]);
}

export async function createActivity({ title, description = "", href = "" }) {
  await initialize();
  await query(
    `
      INSERT INTO activity_logs (title, description, href, created_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `,
    [title, description, href],
  );
}

export async function listActivities(limit = 8) {
  await initialize();
  const rows = await many(
    `
      SELECT *
      FROM activity_logs
      ORDER BY created_at DESC, id DESC
      LIMIT ?
    `,
    [Number(limit)],
  );

  return rows.map((row) => ({
    id: Number(row.id),
    title: row.title,
    description: row.description,
    href: row.href,
    createdAt: normalizeTimestamp(row.created_at),
  }));
}

export async function getAdminAccount(username) {
  await initialize();
  const row = await one(
    "SELECT id, username, display_name, email, created_at, updated_at FROM users WHERE username = ?",
    [username],
  );

  if (!row) return null;

  return {
    id: Number(row.id),
    username: row.username,
    displayName: row.display_name || row.username,
    email: row.email || "",
    createdAt: normalizeTimestamp(row.created_at),
    updatedAt: normalizeTimestamp(row.updated_at),
  };
}

export async function updateAdminAccount({
  username,
  displayName,
  email,
  currentPassword,
  newPassword,
}) {
  await initialize();
  const row = await one("SELECT * FROM users WHERE username = ?", [username]);
  if (!row) {
    return { ok: false, error: "Account not found." };
  }

  if (newPassword) {
    if (!verifyPassword(currentPassword || "", row.password_hash)) {
      return { ok: false, error: "Current password is incorrect." };
    }

    await query(
      `
        UPDATE users
        SET
          display_name = ?,
          email = ?,
          password_hash = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [
        displayName?.trim() || row.display_name || row.username,
        email?.trim() || "",
        hashPassword(newPassword),
        Number(row.id),
      ],
    );

    return { ok: true };
  }

  await query(
    `
      UPDATE users
      SET
        display_name = ?,
        email = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [displayName?.trim() || row.display_name || row.username, email?.trim() || "", Number(row.id)],
  );

  return { ok: true };
}

export async function authenticateAdmin(identifier, password) {
  await initialize();
  const value = identifier?.trim();
  const row = await one("SELECT * FROM users WHERE username = ? OR email = ?", [value, value]);
  if (!row) return null;
  if (!verifyPassword(password, row.password_hash)) return null;

  return {
    id: Number(row.id),
    username: row.username,
    displayName: row.display_name || row.username,
    email: row.email || "",
  };
}
