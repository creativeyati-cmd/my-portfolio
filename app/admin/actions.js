"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { logoutAdmin, requireAdmin } from "@/lib/auth";
import {
  createActivity,
  deleteProject,
  duplicateProject,
  getAdminAccount,
  getProjectById,
  getSiteSettings,
  saveProject,
  updateAdminAccount,
  updateProjectStatus,
  updateSiteSettings,
} from "@/lib/db";
import { saveUpload } from "@/lib/uploads";

function value(formData, key) {
  return String(formData.get(key) || "");
}

function has(formData, key) {
  return formData.has(key);
}

function redirectTarget(formData, fallback) {
  return value(formData, "redirectTo") || fallback;
}

function mergeSettingField(formData, current, key) {
  return has(formData, key) ? value(formData, key) : current[key];
}

function toastRedirect(target, toast, extra = "") {
  const separator = target.includes("?") ? "&" : "?";
  redirect(`${target}${separator}toast=${toast}${extra}`);
}

function revalidateAdmin() {
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/projects");
  revalidatePath("/admin");
  revalidatePath("/admin/projects");
  revalidatePath("/admin/analytics");
  revalidatePath("/admin/settings");
}

export async function logoutAction() {
  await logoutAdmin();
  redirect("/login");
}

export async function saveSiteSettingsAction(formData) {
  await requireAdmin();

  const current = getSiteSettings();
  const redirectTo = redirectTarget(formData, "/admin/settings/content");
  const savedState = value(formData, "savedState") || "settings-updated";

  updateSiteSettings({
    siteTitle: mergeSettingField(formData, current, "siteTitle"),
    siteDescription: mergeSettingField(formData, current, "siteDescription"),
    introHeading: mergeSettingField(formData, current, "introHeading"),
    introSubheading: mergeSettingField(formData, current, "introSubheading"),
    navHomeLabel: mergeSettingField(formData, current, "navHomeLabel"),
    navProjectsLabel: mergeSettingField(formData, current, "navProjectsLabel"),
    navAboutLabel: mergeSettingField(formData, current, "navAboutLabel"),
    navContactLabel: mergeSettingField(formData, current, "navContactLabel"),
    selectedProjectLabel: mergeSettingField(formData, current, "selectedProjectLabel"),
    playVideoLabel: mergeSettingField(formData, current, "playVideoLabel"),
    aboutTitle: mergeSettingField(formData, current, "aboutTitle"),
    aboutBody: mergeSettingField(formData, current, "aboutBody"),
    aboutPageTitle: mergeSettingField(formData, current, "aboutPageTitle"),
    aboutPageLead: mergeSettingField(formData, current, "aboutPageLead"),
    aboutNotesTitle: mergeSettingField(formData, current, "aboutNotesTitle"),
    aboutNotesBody: mergeSettingField(formData, current, "aboutNotesBody"),
    availabilityLabel: mergeSettingField(formData, current, "availabilityLabel"),
    profileAvailability: mergeSettingField(formData, current, "profileAvailability"),
    servicesTitle: mergeSettingField(formData, current, "servicesTitle"),
    serviceIdealForLabel: mergeSettingField(formData, current, "serviceIdealForLabel"),
    serviceDeliverablesLabel: mergeSettingField(
      formData,
      current,
      "serviceDeliverablesLabel",
    ),
    serviceOneName: mergeSettingField(formData, current, "serviceOneName"),
    serviceOneDescription: mergeSettingField(formData, current, "serviceOneDescription"),
    serviceOneIdealFor: mergeSettingField(formData, current, "serviceOneIdealFor"),
    serviceOneDeliverables: mergeSettingField(
      formData,
      current,
      "serviceOneDeliverables",
    ),
    serviceOneCta: mergeSettingField(formData, current, "serviceOneCta"),
    serviceTwoName: mergeSettingField(formData, current, "serviceTwoName"),
    serviceTwoDescription: mergeSettingField(formData, current, "serviceTwoDescription"),
    serviceTwoIdealFor: mergeSettingField(formData, current, "serviceTwoIdealFor"),
    serviceTwoDeliverables: mergeSettingField(
      formData,
      current,
      "serviceTwoDeliverables",
    ),
    serviceTwoCta: mergeSettingField(formData, current, "serviceTwoCta"),
    serviceThreeName: mergeSettingField(formData, current, "serviceThreeName"),
    serviceThreeDescription: mergeSettingField(
      formData,
      current,
      "serviceThreeDescription",
    ),
    serviceThreeIdealFor: mergeSettingField(formData, current, "serviceThreeIdealFor"),
    serviceThreeDeliverables: mergeSettingField(
      formData,
      current,
      "serviceThreeDeliverables",
    ),
    serviceThreeCta: mergeSettingField(formData, current, "serviceThreeCta"),
    skillsTitle: mergeSettingField(formData, current, "skillsTitle"),
    skillsList: mergeSettingField(formData, current, "skillsList"),
    openToTitle: mergeSettingField(formData, current, "openToTitle"),
    openToList: mergeSettingField(formData, current, "openToList"),
    contactHeading: mergeSettingField(formData, current, "contactHeading"),
    contactPageTitle: mergeSettingField(formData, current, "contactPageTitle"),
    contactPageLead: mergeSettingField(formData, current, "contactPageLead"),
    contactEmail: mergeSettingField(formData, current, "contactEmail"),
    contactPhone: mergeSettingField(formData, current, "contactPhone"),
    whatsapp: mergeSettingField(formData, current, "whatsapp"),
    location: mergeSettingField(formData, current, "location"),
    emailLabel: mergeSettingField(formData, current, "emailLabel"),
    phoneLabel: mergeSettingField(formData, current, "phoneLabel"),
    whatsappLabel: mergeSettingField(formData, current, "whatsappLabel"),
    locationLabel: mergeSettingField(formData, current, "locationLabel"),
    socialsLabel: mergeSettingField(formData, current, "socialsLabel"),
    instagramUrl: mergeSettingField(formData, current, "instagramUrl"),
    linkedinUrl: mergeSettingField(formData, current, "linkedinUrl"),
    youtubeUrl: mergeSettingField(formData, current, "youtubeUrl"),
    ctaLabel: mergeSettingField(formData, current, "ctaLabel"),
    projectOverviewLabel: mergeSettingField(formData, current, "projectOverviewLabel"),
    projectBackHomeLabel: mergeSettingField(formData, current, "projectBackHomeLabel"),
    projectContactCtaLabel: mergeSettingField(
      formData,
      current,
      "projectContactCtaLabel",
    ),
    projectModalCloseLabel: mergeSettingField(formData, current, "projectModalCloseLabel"),
    projectModalBackLabel: mergeSettingField(formData, current, "projectModalBackLabel"),
    noVideoLabel: mergeSettingField(formData, current, "noVideoLabel"),
    portfolioUrl: mergeSettingField(formData, current, "portfolioUrl"),
    defaultLanguage: mergeSettingField(formData, current, "defaultLanguage"),
    timezone: mergeSettingField(formData, current, "timezone"),
    bookingEnabled: has(formData, "bookingEnabled")
      ? formData.get("bookingEnabled") === "on"
      : current.bookingEnabled,
    bookingCta: mergeSettingField(formData, current, "bookingCta"),
    bookingUrl: mergeSettingField(formData, current, "bookingUrl"),
    seoTitle: mergeSettingField(formData, current, "seoTitle"),
    metaDescription: mergeSettingField(formData, current, "metaDescription"),
    trackingId: mergeSettingField(formData, current, "trackingId"),
  });

  createActivity({
    title: "Settings updated",
    description: redirectTo.replace("/admin/settings/", "").replace("/admin/", ""),
    href: redirectTo,
  });

  revalidateAdmin();
  toastRedirect(redirectTo, savedState);
}

export async function saveProjectAction(formData) {
  await requireAdmin();

  const redirectTo = redirectTarget(formData, "/admin/projects");
  const intent = value(formData, "intent") || "save";
  const id = Number(formData.get("id") || 0) || null;
  const current = id ? getProjectById(id) : null;

  const posterUpload = await saveUpload(formData.get("posterFile"), "images");
  const videoUpload = await saveUpload(formData.get("videoFile"), "videos");

  const explicitStatus = value(formData, "status");
  const intentStatus =
    intent === "publish"
      ? "published"
      : intent === "save-draft"
        ? "draft"
        : intent === "archive"
          ? "archived"
          : explicitStatus;

  const project = saveProject({
    id,
    slug: value(formData, "slug"),
    title: value(formData, "title"),
    type: value(formData, "type"),
    year: value(formData, "year"),
    posterPath: posterUpload || value(formData, "posterPath"),
    videoPath: videoUpload || value(formData, "videoPath"),
    videoUrl: value(formData, "videoUrl"),
    shortDescription: value(formData, "shortDescription"),
    longDescription: value(formData, "longDescription"),
    role: value(formData, "role"),
    tools: value(formData, "tools"),
    clientName: value(formData, "clientName"),
    credits: value(formData, "credits"),
    status: intentStatus,
    published: intentStatus === "published" || formData.get("published") === "on",
    featured: formData.get("featured") === "on",
    publishDate: value(formData, "publishDate"),
    sortOrder: value(formData, "sortOrder"),
  });

  createActivity({
    title:
      intent === "publish"
        ? `${project.title} was published`
        : current
          ? `${project.title} was updated`
          : `${project.title} was created`,
    description: project.status,
    href: `/admin/projects/${project.id}/edit`,
  });

  revalidateAdmin();
  revalidatePath(`/projects/${project.slug}`);
  if (current?.slug && current.slug !== project.slug) {
    revalidatePath(`/projects/${current.slug}`);
  }

  const destination = current ? redirectTo : `/admin/projects/${project.id}/edit`;

  const toast =
    intent === "publish"
      ? "project-published"
      : current
        ? "project-saved"
        : "project-created";

  toastRedirect(destination, toast);
}

export async function deleteProjectAction(formData) {
  await requireAdmin();
  const redirectTo = redirectTarget(formData, "/admin/projects");

  const id = Number(formData.get("id") || 0);
  const current = getProjectById(id);
  if (current) {
    deleteProject(id);
    createActivity({
      title: `${current.title} was deleted`,
      description: current.status,
      href: "/admin/projects",
    });
    revalidateAdmin();
    revalidatePath(`/projects/${current.slug}`);
  }

  toastRedirect(redirectTo, "project-deleted");
}

export async function duplicateProjectAction(formData) {
  await requireAdmin();
  const redirectTo = redirectTarget(formData, "/admin/projects");
  const id = Number(formData.get("id") || 0);
  const project = duplicateProject(id);

  if (project) {
    createActivity({
      title: `${project.title} was duplicated`,
      description: "draft",
      href: `/admin/projects/${project.id}/edit`,
    });
    revalidateAdmin();
    toastRedirect(`/admin/projects/${project.id}/edit`, "project-duplicated");
  }

  toastRedirect(redirectTo, "project-saved");
}

export async function setProjectStatusAction(formData) {
  await requireAdmin();
  const redirectTo = redirectTarget(formData, "/admin/projects");
  const id = Number(formData.get("id") || 0);
  const status = value(formData, "status");
  const project = updateProjectStatus(id, status);

  if (project) {
    createActivity({
      title: `${project.title} moved to ${project.status}`,
      description: project.status,
      href: `/admin/projects/${project.id}/edit`,
    });
    revalidateAdmin();
    revalidatePath(`/projects/${project.slug}`);
    toastRedirect(
      redirectTo,
      project.status === "published"
        ? "project-published"
        : project.status === "archived"
          ? "project-archived"
          : "project-drafted",
    );
  }

  toastRedirect(redirectTo, "project-saved");
}

export async function updateAccountAction(formData) {
  const session = await requireAdmin();
  const redirectTo = redirectTarget(formData, "/admin/settings/account");

  const result = updateAdminAccount({
    username: session.username,
    displayName: value(formData, "displayName"),
    email: value(formData, "email"),
    currentPassword: value(formData, "currentPassword"),
    newPassword: value(formData, "newPassword"),
  });

  if (!result.ok) {
    const separator = redirectTo.includes("?") ? "&" : "?";
    redirect(`${redirectTo}${separator}error=${encodeURIComponent(result.error)}`);
  }

  const account = getAdminAccount(session.username);
  createActivity({
    title: "Account settings updated",
    description: account?.displayName || session.username,
    href: "/admin/settings/account",
  });

  revalidateAdmin();
  toastRedirect(redirectTo, "account-updated");
}
