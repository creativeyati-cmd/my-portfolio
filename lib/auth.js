import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { authenticateAdmin } from "./db";
import { createSessionValue, readSessionValue } from "./security";

const AUTH_COOKIE = "portfolio_admin_session";

export async function loginAdmin(username, password) {
  const user = await authenticateAdmin(username, password);
  if (!user) return false;

  const store = await cookies();
  store.set(AUTH_COOKIE, createSessionValue(user.username), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return true;
}

export async function logoutAdmin() {
  const store = await cookies();
  store.delete(AUTH_COOKIE);
}

export async function getAdminSession() {
  const store = await cookies();
  const value = store.get(AUTH_COOKIE)?.value;
  return readSessionValue(value);
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/login");
  return session;
}
