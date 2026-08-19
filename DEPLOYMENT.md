# Deployment

This app is now ready for **PXXL-safe persistent hosting**.

In production, the recommended setup is:

- Supabase Postgres or PXXL managed PostgreSQL for application data
- PXXL CDN storage for uploaded posters and videos
- environment variables for all runtime secrets and connection values

Local development can still use SQLite and local `public/uploads`.

## Recommended setup

1. Create a Supabase Postgres project or a PXXL managed PostgreSQL database.
2. Copy the connection URL.
3. Add it to the project as `DATABASE_URL`.
4. If you are using Supabase on an IPv4-only host, prefer the Supavisor session pooler connection string on port `5432`.
5. Create a scoped PXXL API key with CDN upload permissions.
6. Add that key as `PXXL_API_KEY`.
7. Configure uploads to use the CDN:

```bash
PORTFOLIO_ASSET_STORAGE=pxxl-cdn
PXXL_CDN_UPLOAD_URL=https://gateway.pxxl.dev/api/v3/cdn/assets
PXXL_CDN_VISIBILITY=public
PXXL_CDN_PUBLIC_BASE_URL=https://your-cdn-space-hostname
```

7. Redeploy the project after saving environment variables.

## Environment

Required in production:

- `DATABASE_URL` or `SUPABASE_DB_URL`
- `ADMIN_USERNAME`
- `ADMIN_EMAIL` if you want the first login to work with an email address
- `ADMIN_PASSWORD`
- `SESSION_SECRET`

Recommended:

- `PORT=3001`
- `HOSTNAME=0.0.0.0`
- `DATABASE_SSL=require`
- `PORTFOLIO_ASSET_STORAGE=pxxl-cdn`
- `PXXL_API_KEY`
- `PXXL_CDN_PUBLIC_BASE_URL`

Local or VPS fallback only:

- `PORTFOLIO_DATA_DIR`
- `PORTFOLIO_DB_PATH`
- `PORTFOLIO_UPLOADS_DIR`
- `PORTFOLIO_UPLOADS_URL_PREFIX`

## Build

```bash
npm install
npm run build
```

## Start

```bash
npm start
```

That runs:

```bash
node .next/standalone/server.js
```

## Persistence notes

- The app automatically uses PostgreSQL when `DATABASE_URL` or `SUPABASE_DB_URL` is present.
- If `DATABASE_URL` is missing, it falls back to local SQLite.
- Supabase session pooler on port `5432` is recommended for long-lived app servers on IPv4-only networks.
- Uploaded assets are stored in PXXL CDN only when `PORTFOLIO_ASSET_STORAGE=pxxl-cdn`.
- If the PXXL CDN response does not include a direct asset URL, set `PXXL_CDN_PUBLIC_BASE_URL`.
- Database migrations are idempotent and run on startup.

## First login

On first boot, the admin account is seeded from:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

If a database already contains a user, those values do not overwrite the existing account.

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
5. Upload video
6. Edit content settings
7. Confirm changes appear on the public portfolio
