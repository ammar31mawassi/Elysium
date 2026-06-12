# Elysium App

Elysium is a multilingual campus hub for social activities, study sessions, private tutors, peer helpers, personal deadlines, student tools, guides, and contextual AI help.

## Base44

- App ID: `6a2ae3a92ace0dad0f92f1a6`
- Deployed app: <https://elysium-nexus-flow.base44.app>
- Dashboard: <https://app.base44.com/apps/6a2ae3a92ace0dad0f92f1a6/editor/workspace/overview>

## Local Setup

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

The project uses Vite, React, Tailwind CSS, and the Base44 SDK. Do not commit `.env.local` or `base44/.app.jsonc`.

## Validation

```powershell
npm run build
npx eslint src --quiet
```

The root repository documentation remains the product and hackathon planning source. This directory contains the deployable Base44 application source.
