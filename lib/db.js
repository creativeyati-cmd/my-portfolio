import "server-only";

import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import { DEFAULT_PROJECTS, DEFAULT_SITE_SETTINGS } from "./default-portfolio";
import { hashPassword, verifyPassword } from "./security";

function resolveStoragePath(target, fallback) {
  const raw = target?.trim();
  if (!raw) return fallback;
  return path.isAbsolute(raw)
    ? raw
    : path.join(/* turbopackIgnore: true */ process.cwd(), raw);
}

const DATA_DIR = resolveStoragePath(
  process.env.PORTFOLIO_DATA_DIR,
  path.join(process.cwd(), "data"),
);
const DB_PATH = resolveStoragePath(
  process.env.PORTFOLIO_DB_PATH,
  path.join(DATA_DIR, "portfolio.sqlite"),
);
const PROJECT_STATUSES = new Set(["draft", "published", "archived"]);

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function createTables(db) {
  db.exec(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      site_title TEXT NOT NULL,
      site_description TEXT NOT NULL,
      intro_heading TEXT NOT NULL,
      intro_subheading TEXT NOT NULL,
      nav_home_label TEXT NOT NULL DEFAULT '',
      nav_projects_label TEXT NOT NULL DEFAULT '',
      nav_about_label TEXT NOT NULL DEFAULT '',
      nav_contact_label TEXT NOT NULL DEFAULT '',
      selected_project_label TEXT NOT NULL DEFAULT '',
      play_video_label TEXT NOT NULL DEFAULT '',
      project_overview_label TEXT NOT NULL DEFAULT '',
      project_back_home_label TEXT NOT NULL DEFAULT '',
      project_contact_cta_label TEXT NOT NULL DEFAULT '',
      project_modal_close_label TEXT NOT NULL DEFAULT '',
      project_modal_back_label TEXT NOT NULL DEFAULT '',
      no_video_label TEXT NOT NULL DEFAULT '',
      about_title TEXT NOT NULL,
      about_body TEXT NOT NULL,
      about_page_title TEXT NOT NULL DEFAULT '',
      about_page_lead TEXT NOT NULL DEFAULT '',
      about_notes_title TEXT NOT NULL DEFAULT '',
      about_notes_body TEXT NOT NULL DEFAULT '',
      availability_label TEXT NOT NULL DEFAULT '',
      profile_availability TEXT NOT NULL DEFAULT '',
      services_title TEXT NOT NULL DEFAULT '',
      service_ideal_for_label TEXT NOT NULL DEFAULT '',
      service_deliverables_label TEXT NOT NULL DEFAULT '',
      service_one_name TEXT NOT NULL DEFAULT '',
      service_one_description TEXT NOT NULL DEFAULT '',
      service_one_ideal_for TEXT NOT NULL DEFAULT '',
      service_one_deliverables TEXT NOT NULL DEFAULT '',
      service_one_cta TEXT NOT NULL DEFAULT '',
      service_two_name TEXT NOT NULL DEFAULT '',
      service_two_description TEXT NOT NULL DEFAULT '',
      service_two_ideal_for TEXT NOT NULL DEFAULT '',
      service_two_deliverables TEXT NOT NULL DEFAULT '',
      service_two_cta TEXT NOT NULL DEFAULT '',
      service_three_name TEXT NOT NULL DEFAULT '',
      service_three_description TEXT NOT NULL DEFAULT '',
      service_three_ideal_for TEXT NOT NULL DEFAULT '',
      service_three_deliverables TEXT NOT NULL DEFAULT '',
      service_three_cta TEXT NOT NULL DEFAULT '',
      skills_title TEXT NOT NULL DEFAULT '',
      skills_list TEXT NOT NULL DEFAULT '',
      open_to_title TEXT NOT NULL DEFAULT '',
      open_to_list TEXT NOT NULL DEFAULT '',
      contact_heading TEXT NOT NULL,
      contact_page_title TEXT NOT NULL DEFAULT '',
      contact_page_lead TEXT NOT NULL DEFAULT '',
      contact_email TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      location TEXT NOT NULL,
      email_label TEXT NOT NULL DEFAULT '',
      phone_label TEXT NOT NULL DEFAULT '',
      whatsapp_label TEXT NOT NULL DEFAULT '',
      location_label TEXT NOT NULL DEFAULT '',
      socials_label TEXT NOT NULL DEFAULT '',
      instagram_url TEXT NOT NULL,
      linkedin_url TEXT NOT NULL,
      youtube_url TEXT NOT NULL,
      cta_label TEXT NOT NULL,
      portfolio_url TEXT NOT NULL DEFAULT '',
      default_language TEXT NOT NULL DEFAULT '',
      timezone TEXT NOT NULL DEFAULT '',
      booking_enabled INTEGER NOT NULL DEFAULT 0,
      booking_cta TEXT NOT NULL DEFAULT '',
      booking_url TEXT NOT NULL DEFAULT '',
      seo_title TEXT NOT NULL DEFAULT '',
      meta_description TEXT NOT NULL DEFAULT '',
      tracking_id TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      year TEXT NOT NULL,
      poster_path TEXT NOT NULL DEFAULT '',
      video_path TEXT NOT NULL DEFAULT '',
      video_url TEXT NOT NULL DEFAULT '',
      short_description TEXT NOT NULL DEFAULT '',
      long_description TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT '',
      tools TEXT NOT NULL DEFAULT '',
      client_name TEXT NOT NULL DEFAULT '',
      credits TEXT NOT NULL DEFAULT '',
      published INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'published',
      featured INTEGER NOT NULL DEFAULT 0,
      view_count INTEGER NOT NULL DEFAULT 0,
      published_at TEXT DEFAULT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      href TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function ensureColumns(db, table, defs) {
  const columns = new Set(
    db.prepare(`PRAGMA table_info(${table})`).all().map((row) => row.name),
  );

  for (const [name, def] of defs) {
    if (!columns.has(name)) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${def}`);
    }
  }
}

function ensureUsersColumns(db) {
  ensureColumns(db, "users", [
    ["display_name", "TEXT NOT NULL DEFAULT ''"],
    ["email", "TEXT NOT NULL DEFAULT ''"],
  ]);
}

function ensureSiteSettingsColumns(db) {
  ensureColumns(db, "site_settings", [
    ["nav_home_label", "TEXT NOT NULL DEFAULT ''"],
    ["nav_projects_label", "TEXT NOT NULL DEFAULT ''"],
    ["nav_about_label", "TEXT NOT NULL DEFAULT ''"],
    ["nav_contact_label", "TEXT NOT NULL DEFAULT ''"],
    ["selected_project_label", "TEXT NOT NULL DEFAULT ''"],
    ["play_video_label", "TEXT NOT NULL DEFAULT ''"],
    ["project_overview_label", "TEXT NOT NULL DEFAULT ''"],
    ["project_back_home_label", "TEXT NOT NULL DEFAULT ''"],
    ["project_contact_cta_label", "TEXT NOT NULL DEFAULT ''"],
    ["project_modal_close_label", "TEXT NOT NULL DEFAULT ''"],
    ["project_modal_back_label", "TEXT NOT NULL DEFAULT ''"],
    ["no_video_label", "TEXT NOT NULL DEFAULT ''"],
    ["about_page_title", "TEXT NOT NULL DEFAULT ''"],
    ["about_page_lead", "TEXT NOT NULL DEFAULT ''"],
    ["about_notes_title", "TEXT NOT NULL DEFAULT ''"],
    ["about_notes_body", "TEXT NOT NULL DEFAULT ''"],
    ["availability_label", "TEXT NOT NULL DEFAULT ''"],
    ["profile_availability", "TEXT NOT NULL DEFAULT ''"],
    ["services_title", "TEXT NOT NULL DEFAULT ''"],
    ["service_ideal_for_label", "TEXT NOT NULL DEFAULT ''"],
    ["service_deliverables_label", "TEXT NOT NULL DEFAULT ''"],
    ["service_one_name", "TEXT NOT NULL DEFAULT ''"],
    ["service_one_description", "TEXT NOT NULL DEFAULT ''"],
    ["service_one_ideal_for", "TEXT NOT NULL DEFAULT ''"],
    ["service_one_deliverables", "TEXT NOT NULL DEFAULT ''"],
    ["service_one_cta", "TEXT NOT NULL DEFAULT ''"],
    ["service_two_name", "TEXT NOT NULL DEFAULT ''"],
    ["service_two_description", "TEXT NOT NULL DEFAULT ''"],
    ["service_two_ideal_for", "TEXT NOT NULL DEFAULT ''"],
    ["service_two_deliverables", "TEXT NOT NULL DEFAULT ''"],
    ["service_two_cta", "TEXT NOT NULL DEFAULT ''"],
    ["service_three_name", "TEXT NOT NULL DEFAULT ''"],
    ["service_three_description", "TEXT NOT NULL DEFAULT ''"],
    ["service_three_ideal_for", "TEXT NOT NULL DEFAULT ''"],
    ["service_three_deliverables", "TEXT NOT NULL DEFAULT ''"],
    ["service_three_cta", "TEXT NOT NULL DEFAULT ''"],
    ["skills_title", "TEXT NOT NULL DEFAULT ''"],
    ["skills_list", "TEXT NOT NULL DEFAULT ''"],
    ["open_to_title", "TEXT NOT NULL DEFAULT ''"],
    ["open_to_list", "TEXT NOT NULL DEFAULT ''"],
    ["contact_page_title", "TEXT NOT NULL DEFAULT ''"],
    ["contact_page_lead", "TEXT NOT NULL DEFAULT ''"],
    ["email_label", "TEXT NOT NULL DEFAULT ''"],
    ["phone_label", "TEXT NOT NULL DEFAULT ''"],
    ["whatsapp_label", "TEXT NOT NULL DEFAULT ''"],
    ["location_label", "TEXT NOT NULL DEFAULT ''"],
    ["socials_label", "TEXT NOT NULL DEFAULT ''"],
    ["portfolio_url", "TEXT NOT NULL DEFAULT ''"],
    ["default_language", "TEXT NOT NULL DEFAULT ''"],
    ["timezone", "TEXT NOT NULL DEFAULT ''"],
    ["booking_enabled", "INTEGER NOT NULL DEFAULT 0"],
    ["booking_cta", "TEXT NOT NULL DEFAULT ''"],
    ["booking_url", "TEXT NOT NULL DEFAULT ''"],
    ["seo_title", "TEXT NOT NULL DEFAULT ''"],
    ["meta_description", "TEXT NOT NULL DEFAULT ''"],
    ["tracking_id", "TEXT NOT NULL DEFAULT ''"],
  ]);
}

function ensureProjectsColumns(db) {
  ensureColumns(db, "projects", [
    ["status", "TEXT NOT NULL DEFAULT 'published'"],
    ["featured", "INTEGER NOT NULL DEFAULT 0"],
    ["view_count", "INTEGER NOT NULL DEFAULT 0"],
    ["published_at", "TEXT DEFAULT NULL"],
  ]);

  db.exec(`
    UPDATE projects
    SET status = CASE
      WHEN status IS NULL OR status = '' THEN CASE WHEN published = 1 THEN 'published' ELSE 'draft' END
      ELSE status
    END
  `);
}

function seedUsers(db) {
  const count = db.prepare("SELECT COUNT(*) AS count FROM users").get().count;
  if (count > 0) return;

  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "changeme123";
  if (
    process.env.NODE_ENV === "production" &&
    (!process.env.ADMIN_PASSWORD || password === "changeme123")
  ) {
    throw new Error(
      "ADMIN_PASSWORD must be set to a secure value in production before starting the server.",
    );
  }

  db.prepare(
    `
      INSERT INTO users (username, password_hash, display_name, email, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
  ).run(username, hashPassword(password), "Admin", "");
}

function seedSiteSettings(db) {
  const row = db.prepare("SELECT id FROM site_settings WHERE id = 1").get();
  if (row) return;

  db.prepare(
    `
      INSERT INTO site_settings (
        id,
        site_title,
        site_description,
        intro_heading,
        intro_subheading,
        nav_home_label,
        nav_projects_label,
        nav_about_label,
        nav_contact_label,
        selected_project_label,
        play_video_label,
        project_overview_label,
        project_back_home_label,
        project_contact_cta_label,
        project_modal_close_label,
        project_modal_back_label,
        no_video_label,
        about_title,
        about_body,
        about_page_title,
        about_page_lead,
        about_notes_title,
        about_notes_body,
        availability_label,
        profile_availability,
        services_title,
        service_ideal_for_label,
        service_deliverables_label,
        service_one_name,
        service_one_description,
        service_one_ideal_for,
        service_one_deliverables,
        service_one_cta,
        service_two_name,
        service_two_description,
        service_two_ideal_for,
        service_two_deliverables,
        service_two_cta,
        service_three_name,
        service_three_description,
        service_three_ideal_for,
        service_three_deliverables,
        service_three_cta,
        skills_title,
        skills_list,
        open_to_title,
        open_to_list,
        contact_heading,
        contact_page_title,
        contact_page_lead,
        contact_email,
        contact_phone,
        whatsapp,
        location,
        email_label,
        phone_label,
        whatsapp_label,
        location_label,
        socials_label,
        instagram_url,
        linkedin_url,
        youtube_url,
        cta_label,
        portfolio_url,
        default_language,
        timezone,
        booking_enabled,
        booking_cta,
        booking_url,
        seo_title,
        meta_description,
        tracking_id,
        updated_at
      ) VALUES (
        1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP
      )
    `,
  ).run(
    DEFAULT_SITE_SETTINGS.siteTitle,
    DEFAULT_SITE_SETTINGS.siteDescription,
    DEFAULT_SITE_SETTINGS.introHeading,
    DEFAULT_SITE_SETTINGS.introSubheading,
    DEFAULT_SITE_SETTINGS.navHomeLabel,
    DEFAULT_SITE_SETTINGS.navProjectsLabel,
    DEFAULT_SITE_SETTINGS.navAboutLabel,
    DEFAULT_SITE_SETTINGS.navContactLabel,
    DEFAULT_SITE_SETTINGS.selectedProjectLabel,
    DEFAULT_SITE_SETTINGS.playVideoLabel,
    DEFAULT_SITE_SETTINGS.projectOverviewLabel,
    DEFAULT_SITE_SETTINGS.projectBackHomeLabel,
    DEFAULT_SITE_SETTINGS.projectContactCtaLabel,
    DEFAULT_SITE_SETTINGS.projectModalCloseLabel,
    DEFAULT_SITE_SETTINGS.projectModalBackLabel,
    DEFAULT_SITE_SETTINGS.noVideoLabel,
    DEFAULT_SITE_SETTINGS.aboutTitle,
    DEFAULT_SITE_SETTINGS.aboutBody,
    DEFAULT_SITE_SETTINGS.aboutPageTitle,
    DEFAULT_SITE_SETTINGS.aboutPageLead,
    DEFAULT_SITE_SETTINGS.aboutNotesTitle,
    DEFAULT_SITE_SETTINGS.aboutNotesBody,
    DEFAULT_SITE_SETTINGS.availabilityLabel,
    DEFAULT_SITE_SETTINGS.profileAvailability,
    DEFAULT_SITE_SETTINGS.servicesTitle,
    DEFAULT_SITE_SETTINGS.serviceIdealForLabel,
    DEFAULT_SITE_SETTINGS.serviceDeliverablesLabel,
    DEFAULT_SITE_SETTINGS.serviceOneName,
    DEFAULT_SITE_SETTINGS.serviceOneDescription,
    DEFAULT_SITE_SETTINGS.serviceOneIdealFor,
    DEFAULT_SITE_SETTINGS.serviceOneDeliverables,
    DEFAULT_SITE_SETTINGS.serviceOneCta,
    DEFAULT_SITE_SETTINGS.serviceTwoName,
    DEFAULT_SITE_SETTINGS.serviceTwoDescription,
    DEFAULT_SITE_SETTINGS.serviceTwoIdealFor,
    DEFAULT_SITE_SETTINGS.serviceTwoDeliverables,
    DEFAULT_SITE_SETTINGS.serviceTwoCta,
    DEFAULT_SITE_SETTINGS.serviceThreeName,
    DEFAULT_SITE_SETTINGS.serviceThreeDescription,
    DEFAULT_SITE_SETTINGS.serviceThreeIdealFor,
    DEFAULT_SITE_SETTINGS.serviceThreeDeliverables,
    DEFAULT_SITE_SETTINGS.serviceThreeCta,
    DEFAULT_SITE_SETTINGS.skillsTitle,
    DEFAULT_SITE_SETTINGS.skillsList,
    DEFAULT_SITE_SETTINGS.openToTitle,
    DEFAULT_SITE_SETTINGS.openToList,
    DEFAULT_SITE_SETTINGS.contactHeading,
    DEFAULT_SITE_SETTINGS.contactPageTitle,
    DEFAULT_SITE_SETTINGS.contactPageLead,
    DEFAULT_SITE_SETTINGS.contactEmail,
    DEFAULT_SITE_SETTINGS.contactPhone,
    DEFAULT_SITE_SETTINGS.whatsapp,
    DEFAULT_SITE_SETTINGS.location,
    DEFAULT_SITE_SETTINGS.emailLabel,
    DEFAULT_SITE_SETTINGS.phoneLabel,
    DEFAULT_SITE_SETTINGS.whatsappLabel,
    DEFAULT_SITE_SETTINGS.locationLabel,
    DEFAULT_SITE_SETTINGS.socialsLabel,
    DEFAULT_SITE_SETTINGS.instagramUrl,
    DEFAULT_SITE_SETTINGS.linkedinUrl,
    DEFAULT_SITE_SETTINGS.youtubeUrl,
    DEFAULT_SITE_SETTINGS.ctaLabel,
    DEFAULT_SITE_SETTINGS.portfolioUrl,
    DEFAULT_SITE_SETTINGS.defaultLanguage,
    DEFAULT_SITE_SETTINGS.timezone,
    DEFAULT_SITE_SETTINGS.bookingEnabled ? 1 : 0,
    DEFAULT_SITE_SETTINGS.bookingCta,
    DEFAULT_SITE_SETTINGS.bookingUrl,
    DEFAULT_SITE_SETTINGS.seoTitle,
    DEFAULT_SITE_SETTINGS.metaDescription,
    DEFAULT_SITE_SETTINGS.trackingId,
  );
}

function seedProjects(db) {
  const count = db.prepare("SELECT COUNT(*) AS count FROM projects").get().count;
  if (count > 0) return;

  const insert = db.prepare(
    `
      INSERT INTO projects (
        slug,
        title,
        type,
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
  );

  for (const project of DEFAULT_PROJECTS) {
    insert.run(
      project.slug,
      project.title,
      project.type,
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
      project.published ? new Date().toISOString() : null,
      project.sortOrder,
    );
  }
}

function withDefault(value, fallback) {
  return value === undefined || value === null || value === "" ? fallback : value;
}

function toProject(row) {
  if (!row) return null;
  const status = PROJECT_STATUSES.has(row.status)
    ? row.status
    : row.published
      ? "published"
      : "draft";

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    type: row.type,
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
    publishedAt: row.published_at || null,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toSettings(row) {
  return {
    siteTitle: withDefault(row.site_title, DEFAULT_SITE_SETTINGS.siteTitle),
    siteDescription: withDefault(row.site_description, DEFAULT_SITE_SETTINGS.siteDescription),
    introHeading: withDefault(row.intro_heading, DEFAULT_SITE_SETTINGS.introHeading),
    introSubheading: withDefault(row.intro_subheading, DEFAULT_SITE_SETTINGS.introSubheading),
    navHomeLabel: withDefault(row.nav_home_label, DEFAULT_SITE_SETTINGS.navHomeLabel),
    navProjectsLabel: withDefault(row.nav_projects_label, DEFAULT_SITE_SETTINGS.navProjectsLabel),
    navAboutLabel: withDefault(row.nav_about_label, DEFAULT_SITE_SETTINGS.navAboutLabel),
    navContactLabel: withDefault(row.nav_contact_label, DEFAULT_SITE_SETTINGS.navContactLabel),
    selectedProjectLabel: withDefault(row.selected_project_label, DEFAULT_SITE_SETTINGS.selectedProjectLabel),
    playVideoLabel: withDefault(row.play_video_label, DEFAULT_SITE_SETTINGS.playVideoLabel),
    projectOverviewLabel: withDefault(row.project_overview_label, DEFAULT_SITE_SETTINGS.projectOverviewLabel),
    projectBackHomeLabel: withDefault(row.project_back_home_label, DEFAULT_SITE_SETTINGS.projectBackHomeLabel),
    projectContactCtaLabel: withDefault(row.project_contact_cta_label, DEFAULT_SITE_SETTINGS.projectContactCtaLabel),
    projectModalCloseLabel: withDefault(row.project_modal_close_label, DEFAULT_SITE_SETTINGS.projectModalCloseLabel),
    projectModalBackLabel: withDefault(row.project_modal_back_label, DEFAULT_SITE_SETTINGS.projectModalBackLabel),
    noVideoLabel: withDefault(row.no_video_label, DEFAULT_SITE_SETTINGS.noVideoLabel),
    aboutTitle: withDefault(row.about_title, DEFAULT_SITE_SETTINGS.aboutTitle),
    aboutBody: withDefault(row.about_body, DEFAULT_SITE_SETTINGS.aboutBody),
    aboutPageTitle: withDefault(row.about_page_title, DEFAULT_SITE_SETTINGS.aboutPageTitle),
    aboutPageLead: withDefault(row.about_page_lead, DEFAULT_SITE_SETTINGS.aboutPageLead),
    aboutNotesTitle: withDefault(row.about_notes_title, DEFAULT_SITE_SETTINGS.aboutNotesTitle),
    aboutNotesBody: withDefault(row.about_notes_body, DEFAULT_SITE_SETTINGS.aboutNotesBody),
    availabilityLabel: withDefault(row.availability_label, DEFAULT_SITE_SETTINGS.availabilityLabel),
    profileAvailability: withDefault(row.profile_availability, DEFAULT_SITE_SETTINGS.profileAvailability),
    servicesTitle: withDefault(row.services_title, DEFAULT_SITE_SETTINGS.servicesTitle),
    serviceIdealForLabel: withDefault(row.service_ideal_for_label, DEFAULT_SITE_SETTINGS.serviceIdealForLabel),
    serviceDeliverablesLabel: withDefault(row.service_deliverables_label, DEFAULT_SITE_SETTINGS.serviceDeliverablesLabel),
    serviceOneName: withDefault(row.service_one_name, DEFAULT_SITE_SETTINGS.serviceOneName),
    serviceOneDescription: withDefault(row.service_one_description, DEFAULT_SITE_SETTINGS.serviceOneDescription),
    serviceOneIdealFor: withDefault(row.service_one_ideal_for, DEFAULT_SITE_SETTINGS.serviceOneIdealFor),
    serviceOneDeliverables: withDefault(row.service_one_deliverables, DEFAULT_SITE_SETTINGS.serviceOneDeliverables),
    serviceOneCta: withDefault(row.service_one_cta, DEFAULT_SITE_SETTINGS.serviceOneCta),
    serviceTwoName: withDefault(row.service_two_name, DEFAULT_SITE_SETTINGS.serviceTwoName),
    serviceTwoDescription: withDefault(row.service_two_description, DEFAULT_SITE_SETTINGS.serviceTwoDescription),
    serviceTwoIdealFor: withDefault(row.service_two_ideal_for, DEFAULT_SITE_SETTINGS.serviceTwoIdealFor),
    serviceTwoDeliverables: withDefault(row.service_two_deliverables, DEFAULT_SITE_SETTINGS.serviceTwoDeliverables),
    serviceTwoCta: withDefault(row.service_two_cta, DEFAULT_SITE_SETTINGS.serviceTwoCta),
    serviceThreeName: withDefault(row.service_three_name, DEFAULT_SITE_SETTINGS.serviceThreeName),
    serviceThreeDescription: withDefault(row.service_three_description, DEFAULT_SITE_SETTINGS.serviceThreeDescription),
    serviceThreeIdealFor: withDefault(row.service_three_ideal_for, DEFAULT_SITE_SETTINGS.serviceThreeIdealFor),
    serviceThreeDeliverables: withDefault(row.service_three_deliverables, DEFAULT_SITE_SETTINGS.serviceThreeDeliverables),
    serviceThreeCta: withDefault(row.service_three_cta, DEFAULT_SITE_SETTINGS.serviceThreeCta),
    skillsTitle: withDefault(row.skills_title, DEFAULT_SITE_SETTINGS.skillsTitle),
    skillsList: withDefault(row.skills_list, DEFAULT_SITE_SETTINGS.skillsList),
    openToTitle: withDefault(row.open_to_title, DEFAULT_SITE_SETTINGS.openToTitle),
    openToList: withDefault(row.open_to_list, DEFAULT_SITE_SETTINGS.openToList),
    contactHeading: withDefault(row.contact_heading, DEFAULT_SITE_SETTINGS.contactHeading),
    contactPageTitle: withDefault(row.contact_page_title, DEFAULT_SITE_SETTINGS.contactPageTitle),
    contactPageLead: withDefault(row.contact_page_lead, DEFAULT_SITE_SETTINGS.contactPageLead),
    contactEmail: withDefault(row.contact_email, DEFAULT_SITE_SETTINGS.contactEmail),
    contactPhone: withDefault(row.contact_phone, DEFAULT_SITE_SETTINGS.contactPhone),
    whatsapp: withDefault(row.whatsapp, DEFAULT_SITE_SETTINGS.whatsapp),
    location: withDefault(row.location, DEFAULT_SITE_SETTINGS.location),
    emailLabel: withDefault(row.email_label, DEFAULT_SITE_SETTINGS.emailLabel),
    phoneLabel: withDefault(row.phone_label, DEFAULT_SITE_SETTINGS.phoneLabel),
    whatsappLabel: withDefault(row.whatsapp_label, DEFAULT_SITE_SETTINGS.whatsappLabel),
    locationLabel: withDefault(row.location_label, DEFAULT_SITE_SETTINGS.locationLabel),
    socialsLabel: withDefault(row.socials_label, DEFAULT_SITE_SETTINGS.socialsLabel),
    instagramUrl: withDefault(row.instagram_url, DEFAULT_SITE_SETTINGS.instagramUrl),
    linkedinUrl: withDefault(row.linkedin_url, DEFAULT_SITE_SETTINGS.linkedinUrl),
    youtubeUrl: withDefault(row.youtube_url, DEFAULT_SITE_SETTINGS.youtubeUrl),
    ctaLabel: withDefault(row.cta_label, DEFAULT_SITE_SETTINGS.ctaLabel),
    portfolioUrl: withDefault(row.portfolio_url, DEFAULT_SITE_SETTINGS.portfolioUrl),
    defaultLanguage: withDefault(row.default_language, DEFAULT_SITE_SETTINGS.defaultLanguage),
    timezone: withDefault(row.timezone, DEFAULT_SITE_SETTINGS.timezone),
    bookingEnabled: Boolean(row.booking_enabled),
    bookingCta: withDefault(row.booking_cta, DEFAULT_SITE_SETTINGS.bookingCta),
    bookingUrl: withDefault(row.booking_url, DEFAULT_SITE_SETTINGS.bookingUrl),
    seoTitle: withDefault(row.seo_title, DEFAULT_SITE_SETTINGS.seoTitle),
    metaDescription: withDefault(row.meta_description, DEFAULT_SITE_SETTINGS.metaDescription),
    trackingId: withDefault(row.tracking_id, DEFAULT_SITE_SETTINGS.trackingId),
    updatedAt: row.updated_at,
  };
}

function sanitizeSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function uniqueSlug(db, baseSlug, excludeId) {
  const stem = sanitizeSlug(baseSlug) || `project-${Date.now()}`;
  let slug = stem;
  let index = 1;
  const query = excludeId
    ? db.prepare("SELECT id FROM projects WHERE slug = ? AND id != ?")
    : db.prepare("SELECT id FROM projects WHERE slug = ?");

  while (true) {
    const row = excludeId ? query.get(slug, excludeId) : query.get(slug);
    if (!row) return slug;
    index += 1;
    slug = `${stem}-${index}`;
  }
}

function normalizeStatus(value, fallback = "draft") {
  return PROJECT_STATUSES.has(value) ? value : fallback;
}

function getDbInstance() {
  if (!globalThis.__portfolioDb) {
    ensureDataDir();
    globalThis.__portfolioDb = new DatabaseSync(DB_PATH);
  }

  const db = globalThis.__portfolioDb;
  createTables(db);
  ensureUsersColumns(db);
  ensureSiteSettingsColumns(db);
  ensureProjectsColumns(db);
  seedUsers(db);
  seedSiteSettings(db);
  seedProjects(db);

  return db;
}

export function getSiteSettings() {
  const db = getDbInstance();
  const row = db.prepare("SELECT * FROM site_settings WHERE id = 1").get();
  return row ? toSettings(row) : { ...DEFAULT_SITE_SETTINGS };
}

export function updateSiteSettings(input) {
  const db = getDbInstance();
  const values = {
    siteTitle: input.siteTitle?.trim() || DEFAULT_SITE_SETTINGS.siteTitle,
    siteDescription: input.siteDescription?.trim() || DEFAULT_SITE_SETTINGS.siteDescription,
    introHeading: input.introHeading?.trim() || DEFAULT_SITE_SETTINGS.introHeading,
    introSubheading: input.introSubheading?.trim() || DEFAULT_SITE_SETTINGS.introSubheading,
    navHomeLabel: input.navHomeLabel?.trim() || DEFAULT_SITE_SETTINGS.navHomeLabel,
    navProjectsLabel: input.navProjectsLabel?.trim() || DEFAULT_SITE_SETTINGS.navProjectsLabel,
    navAboutLabel: input.navAboutLabel?.trim() || DEFAULT_SITE_SETTINGS.navAboutLabel,
    navContactLabel: input.navContactLabel?.trim() || DEFAULT_SITE_SETTINGS.navContactLabel,
    selectedProjectLabel: input.selectedProjectLabel?.trim() || DEFAULT_SITE_SETTINGS.selectedProjectLabel,
    playVideoLabel: input.playVideoLabel?.trim() || DEFAULT_SITE_SETTINGS.playVideoLabel,
    projectOverviewLabel: input.projectOverviewLabel?.trim() || DEFAULT_SITE_SETTINGS.projectOverviewLabel,
    projectBackHomeLabel: input.projectBackHomeLabel?.trim() || DEFAULT_SITE_SETTINGS.projectBackHomeLabel,
    projectContactCtaLabel: input.projectContactCtaLabel?.trim() || DEFAULT_SITE_SETTINGS.projectContactCtaLabel,
    projectModalCloseLabel: input.projectModalCloseLabel?.trim() || DEFAULT_SITE_SETTINGS.projectModalCloseLabel,
    projectModalBackLabel: input.projectModalBackLabel?.trim() || DEFAULT_SITE_SETTINGS.projectModalBackLabel,
    noVideoLabel: input.noVideoLabel?.trim() || DEFAULT_SITE_SETTINGS.noVideoLabel,
    aboutTitle: input.aboutTitle?.trim() || DEFAULT_SITE_SETTINGS.aboutTitle,
    aboutBody: input.aboutBody?.trim() || DEFAULT_SITE_SETTINGS.aboutBody,
    aboutPageTitle: input.aboutPageTitle?.trim() || DEFAULT_SITE_SETTINGS.aboutPageTitle,
    aboutPageLead: input.aboutPageLead?.trim() || DEFAULT_SITE_SETTINGS.aboutPageLead,
    aboutNotesTitle: input.aboutNotesTitle?.trim() || DEFAULT_SITE_SETTINGS.aboutNotesTitle,
    aboutNotesBody: input.aboutNotesBody?.trim() || DEFAULT_SITE_SETTINGS.aboutNotesBody,
    availabilityLabel: input.availabilityLabel?.trim() || DEFAULT_SITE_SETTINGS.availabilityLabel,
    profileAvailability: input.profileAvailability?.trim() || DEFAULT_SITE_SETTINGS.profileAvailability,
    servicesTitle: input.servicesTitle?.trim() || DEFAULT_SITE_SETTINGS.servicesTitle,
    serviceIdealForLabel: input.serviceIdealForLabel?.trim() || DEFAULT_SITE_SETTINGS.serviceIdealForLabel,
    serviceDeliverablesLabel: input.serviceDeliverablesLabel?.trim() || DEFAULT_SITE_SETTINGS.serviceDeliverablesLabel,
    serviceOneName: input.serviceOneName?.trim() || DEFAULT_SITE_SETTINGS.serviceOneName,
    serviceOneDescription: input.serviceOneDescription?.trim() || DEFAULT_SITE_SETTINGS.serviceOneDescription,
    serviceOneIdealFor: input.serviceOneIdealFor?.trim() || DEFAULT_SITE_SETTINGS.serviceOneIdealFor,
    serviceOneDeliverables: input.serviceOneDeliverables?.trim() || DEFAULT_SITE_SETTINGS.serviceOneDeliverables,
    serviceOneCta: input.serviceOneCta?.trim() || DEFAULT_SITE_SETTINGS.serviceOneCta,
    serviceTwoName: input.serviceTwoName?.trim() || DEFAULT_SITE_SETTINGS.serviceTwoName,
    serviceTwoDescription: input.serviceTwoDescription?.trim() || DEFAULT_SITE_SETTINGS.serviceTwoDescription,
    serviceTwoIdealFor: input.serviceTwoIdealFor?.trim() || DEFAULT_SITE_SETTINGS.serviceTwoIdealFor,
    serviceTwoDeliverables: input.serviceTwoDeliverables?.trim() || DEFAULT_SITE_SETTINGS.serviceTwoDeliverables,
    serviceTwoCta: input.serviceTwoCta?.trim() || DEFAULT_SITE_SETTINGS.serviceTwoCta,
    serviceThreeName: input.serviceThreeName?.trim() || DEFAULT_SITE_SETTINGS.serviceThreeName,
    serviceThreeDescription: input.serviceThreeDescription?.trim() || DEFAULT_SITE_SETTINGS.serviceThreeDescription,
    serviceThreeIdealFor: input.serviceThreeIdealFor?.trim() || DEFAULT_SITE_SETTINGS.serviceThreeIdealFor,
    serviceThreeDeliverables: input.serviceThreeDeliverables?.trim() || DEFAULT_SITE_SETTINGS.serviceThreeDeliverables,
    serviceThreeCta: input.serviceThreeCta?.trim() || DEFAULT_SITE_SETTINGS.serviceThreeCta,
    skillsTitle: input.skillsTitle?.trim() || DEFAULT_SITE_SETTINGS.skillsTitle,
    skillsList: input.skillsList?.trim() || DEFAULT_SITE_SETTINGS.skillsList,
    openToTitle: input.openToTitle?.trim() || DEFAULT_SITE_SETTINGS.openToTitle,
    openToList: input.openToList?.trim() || DEFAULT_SITE_SETTINGS.openToList,
    contactHeading: input.contactHeading?.trim() || DEFAULT_SITE_SETTINGS.contactHeading,
    contactPageTitle: input.contactPageTitle?.trim() || DEFAULT_SITE_SETTINGS.contactPageTitle,
    contactPageLead: input.contactPageLead?.trim() || DEFAULT_SITE_SETTINGS.contactPageLead,
    contactEmail: input.contactEmail?.trim() || DEFAULT_SITE_SETTINGS.contactEmail,
    contactPhone: input.contactPhone?.trim() || DEFAULT_SITE_SETTINGS.contactPhone,
    whatsapp: input.whatsapp?.trim() || "",
    location: input.location?.trim() || DEFAULT_SITE_SETTINGS.location,
    emailLabel: input.emailLabel?.trim() || DEFAULT_SITE_SETTINGS.emailLabel,
    phoneLabel: input.phoneLabel?.trim() || DEFAULT_SITE_SETTINGS.phoneLabel,
    whatsappLabel: input.whatsappLabel?.trim() || DEFAULT_SITE_SETTINGS.whatsappLabel,
    locationLabel: input.locationLabel?.trim() || DEFAULT_SITE_SETTINGS.locationLabel,
    socialsLabel: input.socialsLabel?.trim() || DEFAULT_SITE_SETTINGS.socialsLabel,
    instagramUrl: input.instagramUrl?.trim() || "",
    linkedinUrl: input.linkedinUrl?.trim() || "",
    youtubeUrl: input.youtubeUrl?.trim() || "",
    ctaLabel: input.ctaLabel?.trim() || DEFAULT_SITE_SETTINGS.ctaLabel,
    portfolioUrl: input.portfolioUrl?.trim() || DEFAULT_SITE_SETTINGS.portfolioUrl,
    defaultLanguage: input.defaultLanguage?.trim() || DEFAULT_SITE_SETTINGS.defaultLanguage,
    timezone: input.timezone?.trim() || DEFAULT_SITE_SETTINGS.timezone,
    bookingEnabled: input.bookingEnabled ? 1 : 0,
    bookingCta: input.bookingCta?.trim() || DEFAULT_SITE_SETTINGS.bookingCta,
    bookingUrl: input.bookingUrl?.trim() || DEFAULT_SITE_SETTINGS.bookingUrl,
    seoTitle: input.seoTitle?.trim() || DEFAULT_SITE_SETTINGS.seoTitle,
    metaDescription: input.metaDescription?.trim() || DEFAULT_SITE_SETTINGS.metaDescription,
    trackingId: input.trackingId?.trim() || DEFAULT_SITE_SETTINGS.trackingId,
  };

  db.prepare(
    `
      UPDATE site_settings
      SET
        site_title = ?,
        site_description = ?,
        intro_heading = ?,
        intro_subheading = ?,
        nav_home_label = ?,
        nav_projects_label = ?,
        nav_about_label = ?,
        nav_contact_label = ?,
        selected_project_label = ?,
        play_video_label = ?,
        project_overview_label = ?,
        project_back_home_label = ?,
        project_contact_cta_label = ?,
        project_modal_close_label = ?,
        project_modal_back_label = ?,
        no_video_label = ?,
        about_title = ?,
        about_body = ?,
        about_page_title = ?,
        about_page_lead = ?,
        about_notes_title = ?,
        about_notes_body = ?,
        availability_label = ?,
        profile_availability = ?,
        services_title = ?,
        service_ideal_for_label = ?,
        service_deliverables_label = ?,
        service_one_name = ?,
        service_one_description = ?,
        service_one_ideal_for = ?,
        service_one_deliverables = ?,
        service_one_cta = ?,
        service_two_name = ?,
        service_two_description = ?,
        service_two_ideal_for = ?,
        service_two_deliverables = ?,
        service_two_cta = ?,
        service_three_name = ?,
        service_three_description = ?,
        service_three_ideal_for = ?,
        service_three_deliverables = ?,
        service_three_cta = ?,
        skills_title = ?,
        skills_list = ?,
        open_to_title = ?,
        open_to_list = ?,
        contact_heading = ?,
        contact_page_title = ?,
        contact_page_lead = ?,
        contact_email = ?,
        contact_phone = ?,
        whatsapp = ?,
        location = ?,
        email_label = ?,
        phone_label = ?,
        whatsapp_label = ?,
        location_label = ?,
        socials_label = ?,
        instagram_url = ?,
        linkedin_url = ?,
        youtube_url = ?,
        cta_label = ?,
        portfolio_url = ?,
        default_language = ?,
        timezone = ?,
        booking_enabled = ?,
        booking_cta = ?,
        booking_url = ?,
        seo_title = ?,
        meta_description = ?,
        tracking_id = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `,
  ).run(
    values.siteTitle,
    values.siteDescription,
    values.introHeading,
    values.introSubheading,
    values.navHomeLabel,
    values.navProjectsLabel,
    values.navAboutLabel,
    values.navContactLabel,
    values.selectedProjectLabel,
    values.playVideoLabel,
    values.projectOverviewLabel,
    values.projectBackHomeLabel,
    values.projectContactCtaLabel,
    values.projectModalCloseLabel,
    values.projectModalBackLabel,
    values.noVideoLabel,
    values.aboutTitle,
    values.aboutBody,
    values.aboutPageTitle,
    values.aboutPageLead,
    values.aboutNotesTitle,
    values.aboutNotesBody,
    values.availabilityLabel,
    values.profileAvailability,
    values.servicesTitle,
    values.serviceIdealForLabel,
    values.serviceDeliverablesLabel,
    values.serviceOneName,
    values.serviceOneDescription,
    values.serviceOneIdealFor,
    values.serviceOneDeliverables,
    values.serviceOneCta,
    values.serviceTwoName,
    values.serviceTwoDescription,
    values.serviceTwoIdealFor,
    values.serviceTwoDeliverables,
    values.serviceTwoCta,
    values.serviceThreeName,
    values.serviceThreeDescription,
    values.serviceThreeIdealFor,
    values.serviceThreeDeliverables,
    values.serviceThreeCta,
    values.skillsTitle,
    values.skillsList,
    values.openToTitle,
    values.openToList,
    values.contactHeading,
    values.contactPageTitle,
    values.contactPageLead,
    values.contactEmail,
    values.contactPhone,
    values.whatsapp,
    values.location,
    values.emailLabel,
    values.phoneLabel,
    values.whatsappLabel,
    values.locationLabel,
    values.socialsLabel,
    values.instagramUrl,
    values.linkedinUrl,
    values.youtubeUrl,
    values.ctaLabel,
    values.portfolioUrl,
    values.defaultLanguage,
    values.timezone,
    values.bookingEnabled,
    values.bookingCta,
    values.bookingUrl,
    values.seoTitle,
    values.metaDescription,
    values.trackingId,
  );

  return getSiteSettings();
}

export function listProjects({ includeDrafts = false } = {}) {
  const db = getDbInstance();
  const rows = db
    .prepare(
      `
        SELECT *
        FROM projects
        ${includeDrafts ? "" : "WHERE status = 'published'"}
        ORDER BY sort_order ASC, updated_at DESC, id ASC
      `,
    )
    .all();
  return rows.map(toProject);
}

export function getProjectById(id) {
  const db = getDbInstance();
  const row = db.prepare("SELECT * FROM projects WHERE id = ?").get(id);
  return toProject(row);
}

export function getProjectBySlug(slug, { includeDrafts = false } = {}) {
  const db = getDbInstance();
  const row = db
    .prepare(
      `
        SELECT *
        FROM projects
        WHERE slug = ?
        ${includeDrafts ? "" : "AND status = 'published'"}
      `,
    )
    .get(slug);
  return toProject(row);
}

export function getProjectTypes() {
  const projects = listProjects({ includeDrafts: true });
  return [...new Set(projects.map((project) => project.type).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b),
  );
}

export function getProjectStats() {
  const projects = listProjects({ includeDrafts: true });
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

export function saveProject(input) {
  const db = getDbInstance();
  const projectId = input.id ? Number(input.id) : null;
  const current = projectId ? getProjectById(projectId) : null;
  const title = input.title?.trim() || "Untitled project";
  const slug = uniqueSlug(db, input.slug || title, projectId);
  const status = normalizeStatus(
    input.status || (input.published ? "published" : current?.status || "draft"),
    current?.status || "draft",
  );
  const publishedAt =
    status === "published"
      ? input.publishDate?.trim() || current?.publishedAt || new Date().toISOString()
      : null;

  const values = {
    slug,
    title,
    type: input.type?.trim() || "Project",
    year: input.year?.trim() || "2026",
    posterPath: input.posterPath?.trim() || "",
    videoPath: input.videoPath?.trim() || "",
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
    publishedAt,
    sortOrder: Number.isFinite(Number(input.sortOrder)) ? Number(input.sortOrder) : 0,
  };

  if (projectId) {
    db.prepare(
      `
        UPDATE projects
        SET
          slug = ?,
          title = ?,
          type = ?,
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
    ).run(
      values.slug,
      values.title,
      values.type,
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
    );

    return getProjectById(projectId);
  }

  const result = db.prepare(
    `
      INSERT INTO projects (
        slug,
        title,
        type,
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, CURRENT_TIMESTAMP)
    `,
  ).run(
    values.slug,
    values.title,
    values.type,
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
  );

  return getProjectById(result.lastInsertRowid);
}

export function updateProjectStatus(id, status) {
  const db = getDbInstance();
  const current = getProjectById(id);
  if (!current) return null;

  const nextStatus = normalizeStatus(status, current.status);
  const publishedAt =
    nextStatus === "published"
      ? current.publishedAt || new Date().toISOString()
      : null;

  db.prepare(
    `
      UPDATE projects
      SET
        status = ?,
        published = ?,
        published_at = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
  ).run(nextStatus, nextStatus === "published" ? 1 : 0, publishedAt, id);

  return getProjectById(id);
}

export function duplicateProject(id) {
  const db = getDbInstance();
  const current = getProjectById(id);
  if (!current) return null;

  const copyTitle = `${current.title} Copy`;
  const slug = uniqueSlug(db, `${current.slug}-copy`);

  const result = db.prepare(
    `
      INSERT INTO projects (
        slug,
        title,
        type,
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'draft', 0, 0, NULL, ?, CURRENT_TIMESTAMP)
    `,
  ).run(
    slug,
    copyTitle,
    current.type,
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
  );

  return getProjectById(result.lastInsertRowid);
}

export function deleteProject(id) {
  const db = getDbInstance();
  db.prepare("DELETE FROM projects WHERE id = ?").run(id);
}

export function createActivity({ title, description = "", href = "" }) {
  const db = getDbInstance();
  db.prepare(
    `
      INSERT INTO activity_logs (title, description, href, created_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `,
  ).run(title, description, href);
}

export function listActivities(limit = 8) {
  const db = getDbInstance();
  return db
    .prepare(
      `
        SELECT *
        FROM activity_logs
        ORDER BY created_at DESC, id DESC
        LIMIT ?
      `,
    )
    .all(limit)
    .map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      href: row.href,
      createdAt: row.created_at,
    }));
}

export function getAdminAccount(username) {
  const db = getDbInstance();
  const row = db
    .prepare("SELECT id, username, display_name, email, created_at, updated_at FROM users WHERE username = ?")
    .get(username);

  if (!row) return null;

  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name || row.username,
    email: row.email || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function updateAdminAccount({
  username,
  displayName,
  email,
  currentPassword,
  newPassword,
}) {
  const db = getDbInstance();
  const row = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  if (!row) {
    return { ok: false, error: "Account not found." };
  }

  if (newPassword) {
    if (!verifyPassword(currentPassword || "", row.password_hash)) {
      return { ok: false, error: "Current password is incorrect." };
    }

    db.prepare(
      `
        UPDATE users
        SET
          display_name = ?,
          email = ?,
          password_hash = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
    ).run(
      displayName?.trim() || row.display_name || row.username,
      email?.trim() || "",
      hashPassword(newPassword),
      row.id,
    );

    return { ok: true };
  }

  db.prepare(
    `
      UPDATE users
      SET
        display_name = ?,
        email = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
  ).run(displayName?.trim() || row.display_name || row.username, email?.trim() || "", row.id);

  return { ok: true };
}

export function authenticateAdmin(identifier, password) {
  const db = getDbInstance();
  const value = identifier?.trim();
  const row = db
    .prepare("SELECT * FROM users WHERE username = ? OR email = ?")
    .get(value, value);
  if (!row) return null;
  if (!verifyPassword(password, row.password_hash)) return null;
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name || row.username,
    email: row.email || "",
  };
}
