# Deployment

This app is ready for a **traditional Node.js server / VPS / container host**.

It is **not** a good fit for fully stateless serverless hosting in its current form because it uses:

- local SQLite for the portfolio database
- local filesystem storage for uploaded images and videos

## Requirements

- Node.js 20+
- a persistent writable directory for:
  - SQLite data
  - uploaded media

## Environment

Copy [.env.example](/C:/Users/USER/Downloads/Viscose-carousel-main/.env.example) to `.env` on the server and set real values.

Required in production:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `SESSION_SECRET`

Recommended:

- `PORT=3001`
- `HOSTNAME=0.0.0.0`
- `PORTFOLIO_DATA_DIR=/absolute/path/to/shared/data`
- `PORTFOLIO_DB_PATH=/absolute/path/to/shared/data/portfolio.sqlite`
- `PORTFOLIO_UPLOADS_DIR=/absolute/path/to/shared/public/uploads`
- `PORTFOLIO_UPLOADS_URL_PREFIX=/uploads`

## Important persistence rule

If you redeploy by replacing the app directory, do **not** keep the database and uploads inside disposable build output.

Use persistent mounted folders for:

- database
- uploads

Example:

```bash
PORTFOLIO_DATA_DIR=/var/www/portfolio/shared/data
PORTFOLIO_DB_PATH=/var/www/portfolio/shared/data/portfolio.sqlite
PORTFOLIO_UPLOADS_DIR=/var/www/portfolio/current/public/uploads
```

If uploads are stored outside the app root, your server must still expose them at `PORTFOLIO_UPLOADS_URL_PREFIX`.

## Build

```bash
npm install
npm run build
```

This project now builds with Next.js `output: "standalone"`.

## Start

```bash
npm start
```

That runs:

```bash
node .next/standalone/server.js
```

Use a process manager in production, for example:

- `pm2`
- `systemd`
- Docker

## Reverse proxy

Put the Node app behind Nginx, Caddy, or another reverse proxy.

Typical proxy responsibilities:

- HTTPS termination
- domain routing
- compression
- cache rules for static assets

## First login

On first boot, the app seeds the admin account from:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

If an existing SQLite file already exists, those values do not overwrite the existing user automatically.

## Verify after deploy

Check these routes:

- `/`
- `/projects`
- `/admin`
- `/admin/projects`
- `/admin/settings/general`

Then test:

1. Admin login
2. Create project
3. Publish project
4. Upload poster image
5. Upload video
6. Edit content settings
7. Confirm changes appear on the public portfolio
