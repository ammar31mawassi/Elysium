# Initial GitHub Issues

These are starter issues to create after the private GitHub repo exists. They are written for a beginner team and should be kept small.

## Phase 0: Docs And Repo

### Issue: Add research foundation docs

Owner: Abd Allah

Goal:

- Keep all research claims source-backed.

Acceptance criteria:

- Arab student participation stats have source links.
- First-year dropout/transition risks have source links.
- At least five guide topics are derived from research.

### Issue: Create private GitHub repo and protect main

Owner: Ammar

Goal:

- Make a private collaboration repo.

Acceptance criteria:

- Repo is private.
- Marwan and Abd Allah are invited.
- `main` exists.
- Direct pushes to `main` are blocked.
- Pull request approval is required.

### Issue: Create project board

Owner: Ammar

Goal:

- Track work clearly.

Acceptance criteria:

- Columns: Backlog, Ready, In Progress, Review, Done.
- Initial issues are added.
- Each issue has one owner.

## Phase 1: Design And Static Product Shape

### Issue: Design first mobile dashboard concept

Owner: Ammar

Goal:

- Make the Campus Compass direction concrete.

Acceptance criteria:

- Includes Arabic-first dashboard.
- Shows "what matters now."
- Includes recommended guides, mentor CTA, group suggestion, university shortcut.
- Avoids generic GPA-first layout.

### Issue: Define guide content template

Owner: Abd Allah

Goal:

- Make every guide useful and consistent.

Acceptance criteria:

- Template includes situation, why it matters, Arabic explanation, Hebrew terms, steps, source, common mistake, ask-a-mentor prompt.
- Three sample guide drafts exist.

### Issue: Draft first university page content

Owner: Abd Allah

Goal:

- Build the first university-specific survival page.

Acceptance criteria:

- One university selected.
- Official links collected.
- Important offices listed.
- First-year tips drafted.
- Relevant guide ideas listed.

## Phase 2: App Foundation Later

### Issue: Create Vite React TypeScript app

Owner: Ammar

Goal:

- Start the app only after docs/design approval.

Acceptance criteria:

- Vite React TypeScript project created.
- Tailwind configured.
- Arabic font loaded.
- Root supports RTL.
- No Supabase logic yet.

### Issue: Add mobile app shell

Owner: Ammar

Goal:

- Create the first navigable structure.

Acceptance criteria:

- Bottom navigation exists.
- Routes for dashboard, guides, mentors, groups, profile exist.
- Layout works on mobile and desktop.
- No overflow in Arabic labels.

### Issue: Set up Supabase project

Owner: Marwan

Goal:

- Prepare auth and database foundation.

Acceptance criteria:

- Supabase project exists.
- Auth enabled.
- `.env.example` documents required variables.
- No secrets committed.

### Issue: Draft initial schema and RLS

Owner: Marwan

Goal:

- Model profiles, guides, mentors, groups, universities, bookmarks, and reports.

Acceptance criteria:

- SQL migration drafted.
- RLS enabled on public tables.
- Owner-only policies for private user data.
- Approved-only public policies for mentors/groups.

## Phase 3: Core Hub Features Later

### Issue: Build onboarding flow

Owner: Ammar

Goal:

- Personalize the student's first experience.

Acceptance criteria:

- Captures university, field, year, language comfort, commute/housing, help needs.
- Saves to profile.
- Dashboard recommendations use onboarding data.

### Issue: Build guide library

Owner: Ammar

Goal:

- Let students find practical Arabic guidance.

Acceptance criteria:

- Search works.
- Category filters work.
- Guide detail page uses the approved template.
- Guides can be saved.

### Issue: Add mentor profiles

Owner: Marwan

Goal:

- Let approved older students appear as mentors.

Acceptance criteria:

- Mentor profile form exists.
- Profiles require admin approval.
- Students can filter mentors by university, field, and help topic.
- WhatsApp contact or contact request is available.

### Issue: Add groups

Owner: Marwan

Goal:

- Let students find study/social/first-year groups.

Acceptance criteria:

- Group list exists.
- Group creation exists.
- Public groups require admin approval.
- Groups can be reported.

### Issue: Add admin review dashboard

Owner: Marwan

Goal:

- Protect trust in the app.

Acceptance criteria:

- Admin can approve mentors.
- Admin can approve groups.
- Admin can manage resources.
- Admin can review reports.

## Phase 4: QA And Launch Later

### Issue: Manual first-year student QA

Owner: Abd Allah

Goal:

- Test the product as a new student.

Acceptance criteria:

- Account creation tested.
- Onboarding tested.
- Dashboard tested.
- Guide search tested.
- Mentor/group discovery tested.
- Arabic/RTL issues logged.

### Issue: Vercel preview deployment

Owner: Ammar

Goal:

- Share a live preview.

Acceptance criteria:

- Vercel project created.
- Environment variables configured.
- Preview URL works.
- No secrets exposed.

### Issue: Secret and dependency checks

Owner: Marwan

Goal:

- Keep the repo safe before sharing.

Acceptance criteria:

- Secret scan passes.
- Dependency audit reviewed.
- `.env` is ignored.
- `.env.example` is complete.

