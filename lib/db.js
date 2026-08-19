import "server-only";

const databaseUrl = (
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.SUPABASE_DATABASE_URL ||
  ""
)
  .trim()
  .toLowerCase();

async function getDriver() {
  if (databaseUrl.startsWith("mysql://")) {
    return import("./db-mysql");
  }

  if (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://")) {
    return import("./db-postgres");
  }

  return import("./db-sqlite");
}

async function call(method, args) {
  const driver = await getDriver();
  return driver[method](...args);
}

export async function getSiteSettings(...args) {
  return call("getSiteSettings", args);
}

export async function listServices(...args) {
  return call("listServices", args);
}

export async function listCategories(...args) {
  return call("listCategories", args);
}

export async function getCategoryById(...args) {
  return call("getCategoryById", args);
}

export async function getServiceById(...args) {
  return call("getServiceById", args);
}

export async function updateSiteSettings(...args) {
  return call("updateSiteSettings", args);
}

export async function saveCategory(...args) {
  return call("saveCategory", args);
}

export async function saveService(...args) {
  return call("saveService", args);
}

export async function deleteService(...args) {
  return call("deleteService", args);
}

export async function deleteCategory(...args) {
  return call("deleteCategory", args);
}

export async function bulkUpdateCategoryStatus(...args) {
  return call("bulkUpdateCategoryStatus", args);
}

export async function getCategoryAnalytics(...args) {
  return call("getCategoryAnalytics", args);
}

export async function listProjects(...args) {
  return call("listProjects", args);
}

export async function getProjectById(...args) {
  return call("getProjectById", args);
}

export async function getProjectBySlug(...args) {
  return call("getProjectBySlug", args);
}

export async function getProjectTypes(...args) {
  return call("getProjectTypes", args);
}

export async function getProjectStats(...args) {
  return call("getProjectStats", args);
}

export async function saveProject(...args) {
  return call("saveProject", args);
}

export async function updateProjectStatus(...args) {
  return call("updateProjectStatus", args);
}

export async function duplicateProject(...args) {
  return call("duplicateProject", args);
}

export async function deleteProject(...args) {
  return call("deleteProject", args);
}

export async function createActivity(...args) {
  return call("createActivity", args);
}

export async function listActivities(...args) {
  return call("listActivities", args);
}

export async function getAdminAccount(...args) {
  return call("getAdminAccount", args);
}

export async function updateAdminAccount(...args) {
  return call("updateAdminAccount", args);
}

export async function authenticateAdmin(...args) {
  return call("authenticateAdmin", args);
}
