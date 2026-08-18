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

export async function saveUpload(file, folder) {
  if (!file || typeof file.arrayBuffer !== "function" || file.size === 0) {
    return "";
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
