# Initial GitHub Issues

This backlog reflects the expanded multilingual product and the two-person team. No implementation issue should start until the repositioning, name, first launch cohort, and core workflows are approved.

## Phase 0: Repositioning And Research

### Issue: Validate the all-student product direction

Owner: Ammar
Reviewer: Marwan

Acceptance criteria:

- Interview plan includes Arabic-, Hebrew-, and English-using students.
- Universal needs and segment-specific needs are separated.
- First launch cohort is proposed.
- Findings are recorded with source or interview context.

### Issue: Select the new product name

Owner: Ammar
Reviewer: Marwan

Acceptance criteria:

- MAQOM, DARGA, and SAHA are tested with native speakers.
- At least five speakers from each language group review pronunciation and associations.
- Final two candidates receive trademark, company, domain, social-handle, and app-store checks.
- Final name works in Latin, Hebrew, and Arabic scripts.
- GitHub repo is not renamed until the decision is approved.

### Issue: Expand the research foundation

Owner: Ammar
Reviewer: Marwan

Acceptance criteria:

- Shared student problems have source links or explicit research hypotheses.
- Arab-student evidence remains documented as priority-segment research.
- New immigrant, international, working, commuting, and first-generation contexts are included.
- At least ten guide topics are derived from the combined research.

### Issue: Define the multilingual content model

Owner: Marwan
Reviewer: Ammar

Acceptance criteria:

- Content can link English, Hebrew, and Arabic versions of one concept.
- Official terminology can remain in its source language.
- Search aliases and transliterations are supported in the model.
- Locale does not control authorization.
- Missing or outdated translations can be identified by admins.

### Issue: Create project board

Owner: Ammar
Reviewer: Marwan

Acceptance criteria:

- Columns: Backlog, Ready, In Progress, Review, Done.
- Initial issues are added.
- Every issue has an owner and reviewer.

## Phase 1: Product And Design

### Issue: Design first multilingual mobile dashboard concept

Owner: Ammar
Reviewer: Marwan

Acceptance criteria:

- English, Hebrew, and Arabic versions use the same information architecture.
- Dashboard shows "what matters now."
- Includes recommended guides, mentor CTA, group suggestion, and university shortcut.
- Language switching preserves context.
- Avoids a generic GPA-first layout.

### Issue: Define the guide content template

Owner: Ammar
Reviewer: Marwan

Acceptance criteria:

- Template includes situation, why it matters, explanation, official terms, steps, source, common mistake, and ask-a-mentor prompt.
- Translation and source-freshness metadata are defined.
- Three sample guide concepts exist in English, Hebrew, and Arabic.

### Issue: Draft the first university page

Owner: Ammar
Reviewer: Marwan

Acceptance criteria:

- One university and launch cohort are selected.
- Official links and important offices are collected.
- Language, accessibility, new-immigrant, international, Arab-student, reserve-duty, and general support services are listed where available.
- First-year tips and related guide ideas are drafted.

### Issue: Approve core workflows before implementation

Owner: Ammar
Reviewer: Marwan

Acceptance criteria:

- Onboarding flow is approved.
- Dashboard flow is approved.
- Guide discovery/detail flow is approved.
- Mentor and group discovery flows are approved.
- Admin review flow is approved.
- Every workflow has English, Hebrew, and Arabic content examples.

## Phase 2: Platform Decision And Foundation Later

### Issue: Decide Base44 versus custom Vite/Supabase implementation

Owner: Marwan
Reviewer: Ammar

Acceptance criteria:

- Compare multilingual content, RTL/LTR, auth, permissions, search, moderation, portability, cost, deployment, and team learning curve.
- Build no production feature during the comparison.
- Record the selected platform and rejected tradeoffs.
- Do not initialize or link the production project before product approval.

### Issue: Create the application foundation

Owner: Ammar
Reviewer: Marwan

Acceptance criteria:

- Starts only after naming, workflows, and platform decision are approved.
- English, Hebrew, and Arabic routing/localization is configured.
- RTL and LTR root direction works.
- No secrets are committed.
- Basic mobile shell renders consistently in all three languages.

### Issue: Create auth, schema, and access policies

Owner: Marwan
Reviewer: Ammar

Acceptance criteria:

- Profiles, guides, translations, mentors, groups, universities, bookmarks, and reports are modeled.
- Private user data is owner-only.
- Public mentors/groups require approval.
- Admin permissions are explicit.
- Language choice does not alter access control.

## Phase 3: Core Hub Features Later

### Issue: Build onboarding

Owner: Ammar
Reviewer: Marwan

Acceptance criteria:

- Captures institution, field, year, preferred language, language comfort, commute/housing, and help needs.
- Optional identity/context fields explain why they are asked.
- Dashboard recommendations use onboarding data.
- Flow is tested in English, Hebrew, and Arabic.

### Issue: Build the guide library

Owner: Ammar
Reviewer: Marwan

Acceptance criteria:

- Search works across English, Hebrew, Arabic, aliases, and transliterations.
- Category and university filters work.
- Guide detail uses the approved template.
- Sources and update dates are visible.
- Guides can be saved.

### Issue: Add mentor profiles

Owner: Marwan
Reviewer: Ammar

Acceptance criteria:

- Profiles require admin approval.
- Students can filter by institution, field, help topic, and language.
- Contact path is available without exposing unnecessary personal data.
- Reports and removal workflow exist.

### Issue: Add groups

Owner: Marwan
Reviewer: Ammar

Acceptance criteria:

- Study, course, exam-prep, transition, and social groups are supported.
- Public groups require admin approval.
- Language and institution are filterable.
- Groups can be reported.

### Issue: Add admin review dashboard

Owner: Marwan
Reviewer: Ammar

Acceptance criteria:

- Admin can approve mentors and groups.
- Admin can manage resources and translations.
- Admin can see missing/stale language versions.
- Admin can review reports and source freshness.

## Phase 4: QA And Pilot Later

### Issue: Run multilingual manual QA

Owner: Marwan
Reviewer: Ammar

Acceptance criteria:

- Account creation, onboarding, dashboard, guide search, mentors, and groups are tested.
- Tests are repeated in English, Hebrew, and Arabic.
- RTL/LTR, mixed-direction text, accessibility, and mobile overflow issues are logged.
- Permission and moderation paths are tested.

### Issue: Pilot with one university cohort

Owner: Ammar
Reviewer: Marwan

Acceptance criteria:

- Pilot cohort and recruitment method are documented.
- Students from more than one language context participate.
- Time-to-answer, failed searches, trust, and usefulness are measured.
- Findings produce prioritized changes before expansion.

### Issue: Deployment, secret, and dependency checks

Owner: Marwan
Reviewer: Ammar

Acceptance criteria:

- Preview deployment works.
- Environment variables are configured without exposing secrets.
- Secret and dependency scans pass.
- Rollback and production ownership are documented.
