# Deployment

This app is now configured for **Vercel + Supabase**.

Recommended production stack:

- **Vercel** for the Next.js app
- **Supabase Postgres** for application data
- **Supabase Storage** for uploaded posters and small media files

Local development can still use SQLite and local `public/uploads`.

## Required Vercel environment variables

Set these in your Vercel project before deploying:

```bash
DATABASE_URL=
DATABASE_SSL=require

ADMIN_USERNAME=admin
ADMIN_EMAIL=creativeyati@gmail.com
ADMIN_DISPLAY_NAME=Admin
ADMIN_PASSWORD=
SESSION_SECRET=

PORTFOLIO_ASSET_STORAGE=supabase
SUPABASE_URL=
SUPABASE_SECRET_KEY=
SUPABASE_STORAGE_BUCKET=portfolio-assets
```

Legacy fallback if your Supabase project still uses legacy server keys:

```bash
SUPABASE_SERVICE_ROLE_KEY=
```

## Supabase setup

1. Create or reuse a Supabase project.
2. Copy the pooled Postgres connection string into `DATABASE_URL`.
3. Create a public Storage bucket, for example `portfolio-assets`.
4. Copy your project URL into `SUPABASE_URL`.
5. Copy a server-side secret key into `SUPABASE_SECRET_KEY`.

Use a **secret key** on the server. Do not expose it in any `NEXT_PUBLIC_*` variable.

## Upload behavior on Vercel

The admin uploader now writes files to Supabase Storage when:

```bash
PORTFOLIO_ASSET_STORAGE=supabase
```

Important limits:

- Vercel Functions accept request bodies up to about **4.5 MB**.
- This project sets the Next.js Server Actions body limit to **4 MB** so local behavior stays close to production.
- Poster images and short clips are fine.
- Large videos should be added as external URLs instead of uploading through the admin form.

## Local development

For local development, you can keep:

```bash
PORTFOLIO_ASSET_STORAGE=local
PORTFOLIO_DATA_DIR=./data
PORTFOLIO_DB_PATH=./data/portfolio.sqlite
PORTFOLIO_UPLOADS_DIR=./public/uploads
PORTFOLIO_UPLOADS_URL_PREFIX=/uploads
```

## Build and run

```bash
npm install
npm run build
npm start
```

## First login

On first boot, the admin account is seeded from:

- `ADMIN_USERNAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

If a user already exists in the database, those values do not overwrite the existing account.

## Verify after deploy

Check these routes:

- `/`
- `/projects`
- `/about`
- `/contact`
- `/login`
- `/admin`

Then test:

1. Admin login
2. Create project
3. Publish project
4. Upload poster image
5. Add external video URL
6. Edit content settings
7. Confirm changes appear on the public portfolio
