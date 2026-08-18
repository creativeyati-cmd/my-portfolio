"use server";

import { redirect } from "next/navigation";

import { loginAdmin } from "@/lib/auth";

export async function loginAction(formData) {
  const identifier = String(formData.get("identifier") || "");
  const password = String(formData.get("password") || "");

  const ok = await loginAdmin(identifier, password);
  if (!ok) {
    redirect("/login?error=invalid");
  }

  redirect("/admin");
}
