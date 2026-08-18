import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

function resolveStoragePath(target, fallback) {
  const raw = target?.trim();
  if (!raw) return fallback;
  return path.isAbsolute(raw)
    ? raw
    : path.join(/* turbopackIgnore: true */ process.cwd(), raw);
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

function joinUrl(base, value) {
  if (!base || !value) return "";
  return `${base.replace(/\/$/, "")}/${String(value).replace(/^\/+/, "")}`;
}

function pickRemoteUrl(payload) {
  const direct = [
    payload?.url,
    payload?.publicUrl,
    payload?.cdnUrl,
    payload?.asset?.url,
    payload?.asset?.publicUrl,
    payload?.asset?.cdnUrl,
    payload?.data?.url,
    payload?.data?.publicUrl,
    payload?.data?.cdnUrl,
  ].find((value) => typeof value === "string" && value.trim());

  if (direct) return direct.trim();

  const relative = [
    payload?.path,
    payload?.key,
    payload?.fileKey,
    payload?.asset?.path,
    payload?.asset?.key,
    payload?.data?.path,
    payload?.data?.key,
  ].find((value) => typeof value === "string" && value.trim());

  const publicBase = process.env.PXXL_CDN_PUBLIC_BASE_URL?.trim();
  return joinUrl(publicBase, relative);
}

async function saveUploadToPxxl(file) {
  const apiKey = process.env.PXXL_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("PXXL_API_KEY is required when PORTFOLIO_ASSET_STORAGE=pxxl-cdn.");
  }

  const endpoint = (
    process.env.PXXL_CDN_UPLOAD_URL || "https://gateway.pxxl.dev/api/v3/cdn/assets"
  ).trim();
  const visibility = (process.env.PXXL_CDN_VISIBILITY || "public").trim();
  const form = new FormData();
  form.append("file", file, safeName(file.name));
  form.append("visibility", visibility);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `PXXL CDN upload failed with ${response.status}${detail ? `: ${detail.slice(0, 180)}` : "."}`,
    );
  }

  const payload = await response
    .json()
    .catch(async () => ({ url: (await response.text().catch(() => "")).trim() }));
  const remoteUrl = pickRemoteUrl(payload);

  if (!remoteUrl) {
    throw new Error(
      "PXXL CDN upload succeeded but no public asset URL was returned. Set PXXL_CDN_PUBLIC_BASE_URL or provide a direct media URL in admin.",
    );
  }

  return remoteUrl;
}

export async function saveUpload(file, folder) {
  if (!file || typeof file.arrayBuffer !== "function" || file.size === 0) {
    return "";
  }

  if (getStorageMode() === "pxxl-cdn") {
    return saveUploadToPxxl(file, folder);
  }

  const uploadsRoot = resolveStoragePath(
    process.env.PORTFOLIO_UPLOADS_DIR,
    path.join(process.cwd(), "public", "uploads"),
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
