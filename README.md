# Zash Admin Web

Separate owner console for Zash Academy. It shares MongoDB only with the public web project and is deployed independently.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev -- --port 3001
```

Open `http://localhost:3001`.

Set `MONGODB_URI`, `MONGODB_DB=zash`, and `OWNER_SESSION_SECRET` in `.env.local`. Owner login uses the existing `owners` documents created by Zash Admin.

## Vercel deployment

Deploy this directory as a separate Vercel project. Add these environment variables:

- `MONGODB_URI`
- `MONGODB_DB=zash`
- `OWNER_SESSION_SECRET`
- `PUBLIC_BASE_URL` set to the deployed owner-console domain

Use a separate Vercel URL or custom domain such as `admin.zash-academy.com`. Do not add owner routes to the public Zash Academy deployment.

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```
