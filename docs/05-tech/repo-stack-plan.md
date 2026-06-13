# Repo And Stack Plan

This is a plan for later implementation. No app code should be created in the current research stage.

## Current Local Status

Workspace:

- `C:\Users\ammar\OneDrive\Desktop\Dalili`

Current status:

- The folder is a git repository.
- Remote is `https://github.com/ammar31mawassi/Elysium.git`.
- The GitHub repo is private.
- Default branch is `main`.
- GitHub CLI is installed at `C:\Program Files\GitHub CLI\gh.exe`.
- GitHub CLI is authenticated as `ammar31mawassi`.
- Initial labels and starter issues are created.
- The folder contains the Visily PDF and planning docs.

Implication:

- Repo creation and issue setup are complete.
- Branch protection/rulesets are blocked by GitHub plan limits for a private repo.
- Project board automation is blocked until the GitHub CLI token has the `project` scope.

References:

- [GitHub creating a new repository](https://docs.github.com/articles/creating-a-new-repository)
- [GitHub inviting collaborators](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-access-to-your-personal-repositories/inviting-collaborators-to-a-personal-repository)
- [GitHub protected branches](https://docs.github.com/articles/about-required-reviews-for-pull-requests)

## Private Repo Setup Status

Completed:

- Name: `Elysium`
- Visibility: private.
- README: created from this docs foundation.
- License: none for now.
- Default branch: `main`.
- Remote: `https://github.com/ammar31mawassi/Elysium.git`.
- Labels: created.
- Starter issues: created from `docs/06-backlog/initial-issues.md`.

Still needed:

- Invite collaborators:
  - Marwan.
- Create the project board after refreshing the GitHub CLI project scope:

```powershell
gh auth refresh --hostname github.com -s project
```

Branch protection status:

- Attempted GitHub branch protection and repository rulesets for `main`.
- GitHub blocked both for this private repo with: `Upgrade to GitHub Pro or make this repository public to enable this feature.`

Target protection once available:

- Require pull request before merging.
- Require at least 1 approval.
- Do not allow direct pushes.
- Require conversation resolution.

## Custom-Build Reference Stack

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

## Why Vite + Supabase Remains A Reference

Reasons:

- The strongest existing prototype already uses Vite, React, TypeScript, Tailwind, and Supabase.
- It is easier for a beginner team than a custom backend.
- Supabase Auth and RLS fit the student/tutor/Peer Helper/admin model.
- Vite is fast for local development.
- Vercel can deploy Vite apps simply.

This is no longer an automatic implementation decision. Base44 will be evaluated after product approval because it may reduce backend and deployment work for a two-person team. The comparison must verify multilingual content modeling, cross-language search, RTL/LTR quality, moderation, permissions, portability, pricing, and production debugging before selection.

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
    social/
    study/
    calendar/
    tutors/
    peer-helpers/
    tools/
    guides/
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
- `social_activities`
- `social_activity_participants`
- `study_sessions`
- `study_session_participants`
- `calendar_items`
- `private_tutors`
- `tutor_requests`
- `peer_helpers`
- `guides`
- `guide_categories`
- `groups`
- `flashcard_decks`
- `flashcards`
- `tool_state`
- `bookmarks`
- `reports`
- `admin_actions`

Profile fields:

- User id.
- Full name.
- Roles/capabilities: student, private tutor, Peer Helper, admin. A user may have multiple capabilities.
- University.
- Field.
- Academic year.
- Language comfort.
- Preferred interface language.
- Help needs.
- Interests/hobbies.
- Current courses/subjects.

Social activity fields:

- Host user id.
- Title, category, description.
- University/campus.
- Starts/ends at, location, capacity, visibility.
- Status and moderation fields.

Study session fields:

- Host user id.
- Course/subject and session type.
- Starts/ends at, location/online link, capacity.
- Preferred languages and collaboration expectations.
- Status and moderation fields.

Calendar item fields:

- Owner user id.
- Type: personal, social activity, study session, tutor request, or university deadline.
- Source record id where applicable.
- Title, starts/ends at, completion status, reminder settings.

Guide fields:

- Title.
- Category.
- Situation.
- Locale and translation-group id.
- English, Hebrew, or Arabic explanation.
- Official terms and cross-language equivalents.
- Steps.
- Official source URL.
- University relevance.
- Approved status.
- Created by.
- Updated at.

Private Tutor fields:

- User id.
- University.
- Subjects/courses.
- Experience.
- Languages.
- Availability and online/in-person mode.
- Price/contact-for-price.
- Bio.
- Contact/booking preference.
- Visibility and moderation status.

Peer Helper fields:

- User id.
- University, field, and year.
- Languages and help topics.
- Bio and availability.
- Contact preference and explicit consent state.
- Visible status and moderation state.

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
- Tutor profiles expose only consented public fields and follow moderation rules.
- Peer Helper profiles are visible only after explicit opt-in and can be hidden immediately by the owner.
- Activity/session records are editable only by their host; participant records are controlled by the participant and validated against capacity.
- Calendar items are owner-only unless a deliberately public university deadline is referenced.
- Tutor requests are visible only to the requesting student, the selected tutor, and authorized admins where operationally necessary.
- Group listings public only after approval.
- Admin actions require admin role.
- Never commit Supabase service role keys.
- Use only publishable/anon key in the browser.
- Treat language preference as personalization, not authorization; changing language must never expose or hide protected records.

## Platform Decision Status

Base44 app `6a2ae3a92ace0dad0f92f1a6` is the active hackathon implementation. Vite + Supabase remains the custom-build reference for post-hackathon evaluation. The Base44 app must be audited for multilingual behavior, entity relationships, authorization, consent, portability, pricing, and production debugging before it is treated as the long-term platform.

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
