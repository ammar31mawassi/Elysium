# Repo And Stack Plan

This is a plan for later implementation. No app code should be created in the current research stage.

## Current Local Status

Workspace:

- `C:\Users\ammar\OneDrive\Desktop\Dalili`

Current status:

- The folder is not a git repository.
- GitHub CLI is not installed.
- The folder contains the Visily PDF and planning docs.

Implication:

- Private GitHub repo creation cannot be completed from this environment using `gh`.
- Create the private repo through GitHub's website, or install and authenticate GitHub CLI first.

References:

- [GitHub creating a new repository](https://docs.github.com/articles/creating-a-new-repository)
- [GitHub inviting collaborators](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-access-to-your-personal-repositories/inviting-collaborators-to-a-personal-repository)
- [GitHub protected branches](https://docs.github.com/articles/about-required-reviews-for-pull-requests)

## Private Repo Setup Later

Recommended repo:

- Name: `dalili`
- Visibility: private.
- Add README: yes, from this docs foundation.
- License: none for now.
- Default branch: `main`.

After creation:

```bash
git init
git add .
git commit -m "Add Dalili research and planning foundation"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dalili.git
git push -u origin main
```

Then invite collaborators:

- Marwan.
- Abd Allah.

Then protect `main`:

- Require pull request before merging.
- Require at least 1 approval.
- Do not allow direct pushes.
- Require conversation resolution.

## Chosen Later Stack

- Vite.
- React.
- TypeScript.
- Supabase Auth.
- Supabase Postgres.
- Row Level Security.
- Tailwind CSS.
- shadcn-style components if useful.
- React Query or TanStack Query for server state.
- Vercel for deployment.

References:

- [Vite guide](https://vite.dev/guide/)
- [Supabase Auth](https://supabase.com/docs/guides/auth/)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/auth-deep-dive/auth-row-level-security)
- [Vercel Vite docs](https://vercel.com/docs/frameworks/frontend/vite)
- [Vercel environment variables](https://vercel.com/docs/projects/environment-variables)

## Why Vite + Supabase

Reasons:

- The strongest existing prototype already uses Vite, React, TypeScript, Tailwind, and Supabase.
- It is easier for a beginner team than a custom backend.
- Supabase Auth and RLS fit the student/mentor/admin model.
- Vite is fast for local development.
- Vercel can deploy Vite apps simply.

Tradeoff:

- Next.js would provide more server-side structure, but the MVP does not need that complexity yet.
- Firebase is valid, but Supabase better matches the existing direction and relational admin/review data.

## Future App Structure

Suggested later structure:

```text
src/
  app/
  components/
    layout/
    ui/
    guides/
    mentors/
    groups/
    admin/
  data/
  hooks/
  lib/
  pages/
  styles/
supabase/
  migrations/
  seed/
docs/
```

Do not create this until the team moves from planning to implementation.

## Future Data Model Draft

Core tables:

- `profiles`
- `universities`
- `guides`
- `guide_categories`
- `mentors`
- `groups`
- `bookmarks`
- `reports`
- `admin_actions`

Profile fields:

- User id.
- Full name.
- Role: student, mentor, admin.
- University.
- Field.
- Academic year.
- Language comfort.
- Help needs.

Guide fields:

- Title.
- Category.
- Situation.
- Arabic explanation.
- Hebrew terms.
- Steps.
- Official source URL.
- University relevance.
- Approved status.
- Created by.
- Updated at.

Mentor fields:

- User id.
- University.
- Field.
- Year.
- Languages.
- Help topics.
- Bio.
- WhatsApp contact.
- Approved status.

Group fields:

- Name.
- Type.
- University.
- Field/course.
- Description.
- WhatsApp link or contact.
- Approved status.
- Created by.

## Security Principles

- Enable RLS for all public schema tables.
- Public approved guides and universities can be readable by everyone.
- User profile private fields editable only by owner.
- Mentor profiles public only after approval.
- Group listings public only after approval.
- Admin actions require admin role.
- Never commit Supabase service role keys.
- Use only publishable/anon key in the browser.

## Environment Variables Later

For Vite:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

For Vercel:

- Add variables in project settings.
- Vite client-exposed variables must use the `VITE_` prefix.

## Useful Plugins Later

- GitHub: issues, branches, PRs, reviews.
- Build Web Apps: frontend planning and implementation.
- ImageGen: visual concepts after design direction is approved.
- Browser or Chrome DevTools: local UI screenshots and interaction testing.
- Vercel: deployment.
- Secret Guard: scan for secrets before commits.
- Env Lint: compare `.env` and `.env.example`.
- Deps Doctor: dependency audit.
- Brooks Lint: architecture/code review.
- Test Gap: coverage review after code exists.

