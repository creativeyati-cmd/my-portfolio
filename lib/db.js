import "server-only";

import * as sqliteDriver from "./db-sqlite";
import * as mysqlDriver from "./db-mysql";
import * as postgresDriver from "./db-postgres";

const databaseUrl = process.env.DATABASE_URL?.trim().toLowerCase() || "";

const driver = databaseUrl.startsWith("mysql://")
  ? mysqlDriver
  : databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://")
    ? postgresDriver
    : sqliteDriver;

export async function getSiteSettings(...args) {
  return driver.getSiteSettings(...args);
}

export async function listServices(...args) {
  return driver.listServices(...args);
}

export async function listCategories(...args) {
  return driver.listCategories(...args);
}

export async function getCategoryById(...args) {
  return driver.getCategoryById(...args);
}

export async function getServiceById(...args) {
  return driver.getServiceById(...args);
}

export async function updateSiteSettings(...args) {
  return driver.updateSiteSettings(...args);
}

export async function saveCategory(...args) {
  return driver.saveCategory(...args);
}

export async function saveService(...args) {
  return driver.saveService(...args);
}

export async function deleteService(...args) {
  return driver.deleteService(...args);
}

export async function deleteCategory(...args) {
  return driver.deleteCategory(...args);
}

export async function bulkUpdateCategoryStatus(...args) {
  return driver.bulkUpdateCategoryStatus(...args);
}

export async function getCategoryAnalytics(...args) {
  return driver.getCategoryAnalytics(...args);
}

export async function listProjects(...args) {
  return driver.listProjects(...args);
}

export async function getProjectById(...args) {
  return driver.getProjectById(...args);
}

export async function getProjectBySlug(...args) {
  return driver.getProjectBySlug(...args);
}

export async function getProjectTypes(...args) {
  return driver.getProjectTypes(...args);
}

export async function getProjectStats(...args) {
  return driver.getProjectStats(...args);
}

export async function saveProject(...args) {
  return driver.saveProject(...args);
}

export async function updateProjectStatus(...args) {
  return driver.updateProjectStatus(...args);
}

export async function duplicateProject(...args) {
  return driver.duplicateProject(...args);
}

export async function deleteProject(...args) {
  return driver.deleteProject(...args);
}

export async function createActivity(...args) {
  return driver.createActivity(...args);
}

export async function listActivities(...args) {
  return driver.listActivities(...args);
}

export async function getAdminAccount(...args) {
  return driver.getAdminAccount(...args);
}

export async function updateAdminAccount(...args) {
  return driver.updateAdminAccount(...args);
}

export async function authenticateAdmin(...args) {
  return driver.authenticateAdmin(...args);
}
