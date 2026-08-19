import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

function resolveStoragePath(target, fallback) {
  const raw = target?.trim();
  if (!raw) return fallback;
  return path.isAbsolute(raw)
    ? raw
    : path.join(/* turbopackIgnore: true */ process.cwd(), raw);
}

function defaultUploadsRoot() {
  if (process.env.VERCEL === "1") {
    return path.join("/tmp", "portfolio-uploads");
  }

  return path.join(process.cwd(), "public", "uploads");
}

function safeName(name) {
  const parsed = path.parse(name || "upload");
  const stem = parsed.name.toLowerCase().replace(/[^a-z0-9-]+/g, "-").slice(0, 50);
  const ext = (parsed.ext || "").toLowerCase().replace(/[^a-z0-9.]/g, "");
  return `${stem || "asset"}${ext}`;
}

function getStorageMode() {
  return (process.env.PORTFOLIO_ASSET_STORAGE || "local").trim().toLowerCase();
}

function getSupabaseStorageConfig() {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const key = (
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    ""
  ).trim();
  const bucket = (process.env.SUPABASE_STORAGE_BUCKET || "portfolio-assets").trim();

  if (!url) {
    throw new Error("SUPABASE_URL is required when PORTFOLIO_ASSET_STORAGE=supabase.");
  }

  if (!key) {
    throw new Error(
      "SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY is required when PORTFOLIO_ASSET_STORAGE=supabase.",
    );
  }

  if (!bucket) {
    throw new Error(
      "SUPABASE_STORAGE_BUCKET is required when PORTFOLIO_ASSET_STORAGE=supabase.",
    );
  }

  return { url, key, bucket };
}

let supabaseAdminClient = null;

function getSupabaseAdminClient() {
  if (supabaseAdminClient) return supabaseAdminClient;

  const { url, key } = getSupabaseStorageConfig();
  supabaseAdminClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseAdminClient;
}

async function saveUploadToSupabase(file, folder) {
  const { bucket } = getSupabaseStorageConfig();
  const supabase = getSupabaseAdminClient();
  const objectPath = `${folder}/${Date.now()}-${crypto.randomBytes(4).toString("hex")}-${safeName(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage.from(bucket).upload(objectPath, buffer, {
    contentType: file.type || undefined,
    cacheControl: "3600",
    upsert: false,
  });

  if (uploadError) {
    throw new Error(`Supabase upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
  const publicUrl = data?.publicUrl?.trim();

  if (!publicUrl) {
    throw new Error(
      "Supabase upload succeeded but no public URL was returned. Make sure the storage bucket is public.",
    );
  }

  return publicUrl;
}

export async function saveUpload(file, folder) {
  if (!file || typeof file.arrayBuffer !== "function" || file.size === 0) {
    return "";
  }

  if (getStorageMode() === "supabase") {
    return saveUploadToSupabase(file, folder);
  }

  const uploadsRoot = resolveStoragePath(
    process.env.PORTFOLIO_UPLOADS_DIR,
    defaultUploadsRoot(),
  );
  const publicPrefix = (process.env.PORTFOLIO_UPLOADS_URL_PREFIX || "/uploads").replace(
    /\/$/,
    "",
  );
  const dir = path.join(/* turbopackIgnore: true */ uploadsRoot, folder);
  await fs.mkdir(dir, { recursive: true });

  const fileName = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}-${safeName(file.name)}`;
  const target = path.join(dir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(target, buffer);

  return `${publicPrefix}/${folder}/${fileName}`;
}
