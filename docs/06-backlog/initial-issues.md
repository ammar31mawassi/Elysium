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
- Includes upcoming deadlines/joined items, social and study recommendations, tutor/Peer Helper access, a relevant tool/guide, and Ask Elysium.
- Language switching preserves context.
- Preserves the calendar and tools without making an empty grid or GPA score the entire first experience.

### Issue: Define the guide content template

Owner: Ammar
Reviewer: Marwan

Acceptance criteria:

- Template includes situation, why it matters, explanation, official terms, steps, source, common mistake, and related tutor/Peer Helper/tool/contact prompt.
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
- Social activity create/join/leave flow is approved.
- Study session create/join/leave flow is approved.
- Calendar and personal deadline flow is approved.
- Private Tutor request and Peer Helper opt-in/discovery flows are approved separately.
- Tools, guide discovery/detail, and Ask Elysium flows are approved.
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

- Profiles, activities/participants, study sessions/participants, calendar items, tutors/requests, Peer Helpers, tools, guides/translations, groups, universities, bookmarks, and reports are modeled.
- Private user data is owner-only.
- Public tutor, Peer Helper, activity, session, and group visibility rules are explicit.
- Contact sharing requires consent.
- Admin permissions are explicit.
- Language choice does not alter access control.

## Phase 3: Core Hub Features Later

### Issue: Build onboarding

Owner: Ammar
Reviewer: Marwan

Acceptance criteria:

- Captures institution, field, year, preferred language, language comfort, commute/housing, and help needs.
- Captures courses/subjects and interests needed for study, tutor, and social recommendations.
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

### Issue: Build social activities

Owner: Ammar
Reviewer: Marwan

Acceptance criteria:

- Students can create, join, and leave activities.
- Host, time, place, capacity, visibility, and participant count are clear.
- Joined activities update home and calendar.
- Ownership, capacity, reports, and permissions are tested.

### Issue: Build study sessions

Owner: Ammar
Reviewer: Marwan

Acceptance criteria:

- Students can create, join, and leave study sessions.
- Course/subject, session type, language, expectations, time, place, and capacity are clear.
- Joined sessions update home and calendar.
- Social activities and study sessions remain separate in data and UI.

### Issue: Build personal calendar

Owner: Ammar
Reviewer: Marwan

Acceptance criteria:

- Students can add, edit, complete, and delete personal deadlines.
- Joined activities, study sessions, and tutor requests/bookings appear automatically.
- Leaving/canceling updates linked calendar items correctly.
- Calendar data is owner-only.

### Issue: Add Private Tutor profiles and requests

Owner: Marwan
Reviewer: Ammar

Acceptance criteria:

- Tutors define subjects/courses, languages, availability, mode, experience, and price/contact state.
- Students can search and send a booking/contact request.
- Public contact data follows consent rules.
- Reports, moderation, and tutor opt-out exist.

### Issue: Add Peer Helper opt-in profiles

Owner: Marwan
Reviewer: Ammar

Acceptance criteria:

- Students explicitly opt in from their profile.
- University, field, year, languages, help topics, availability, and consented contact method are shown.
- Students can disable visibility immediately.
- Peer Helpers are not presented as tutors or official university staff.

### Issue: Complete core student tools

Owner: Ammar
Reviewer: Marwan

Acceptance criteria:

- GPA and required-grade calculations have known test cases.
- Flashcards support deck creation, review, and progress.
- Helpful links and source-backed guides are organized and searchable.
- Tool state is private to its owner where applicable.

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

- Admin can moderate tutors, Peer Helpers, activities, sessions, and groups.
- Admin can manage resources and translations.
- Admin can see missing/stale language versions.
- Admin can review reports and source freshness.

## Phase 4: QA And Pilot Later

### Issue: Run multilingual manual QA

Owner: Marwan
Reviewer: Ammar

Acceptance criteria:

- Account creation, onboarding, dashboard, social/study joins, calendar, tutors, Peer Helpers, tools, guides, and AI routing are tested.
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
