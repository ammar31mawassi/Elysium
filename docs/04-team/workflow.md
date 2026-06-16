# Team Workflow

Team:

- Ammar.
- Marwan.

The team is intentionally small. Ownership must be explicit, but neither person should become a single point of failure. Every major decision and implementation must be reviewable by the other person.

## Roles

### Ammar: Product, Design, Frontend, Content Direction

Owns:

- Product direction and prioritization.
- User research planning and synthesis.
- User journeys and information architecture.
- Naming and brand direction.
- Visual design direction.
- English, Hebrew, and Arabic UX consistency.
- Frontend implementation later.
- Guide format and editorial quality.
- Public story, demos, and LinkedIn presentation.

First responsibilities:

- Keep the product specific and non-generic while expanding the audience.
- Lead native-speaker name testing.
- Approve flows before implementation.
- Define the first university and launch cohort.
- Draft sample guides with source links in all three languages.

### Marwan: Backend, Data, Security, Technical QA

Owns:

- Backend platform decision and setup later.
- Data model and content localization structure.
- Authentication and authorization.
- Row Level Security or equivalent access policies.
- Admin permissions and moderation workflows.
- Environment variables and secrets.
- Data integrity, logging, and technical QA.
- Deployment safety and production troubleshooting.

First responsibilities:

- Review how multilingual content, search terms, and translations should be stored.
- Draft a safe schema before implementation.
- Make sure users can only edit their own private data.
- Make sure public content has approval, source, locale, and freshness metadata.
- Define test cases for language switching, permissions, and moderation.

## Shared Ownership

Both Ammar and Marwan own:

- Student interviews.
- Scope decisions.
- Research quality.
- Manual product QA.
- Reviewing claims and source links.
- Deciding when the planning stage is complete.
- Deciding whether Base44, Vite/Supabase, or another implementation route best fits the approved product.

When ownership is unclear:

- Ammar decides product behavior and user-facing priority.
- Marwan decides security, data integrity, and operational safety.
- A decision affecting both requires agreement and a written note in GitHub or the docs.

## Beginner Git Rules

No one works directly on `main`, even if GitHub plan limits prevent enforced branch protection.

Branch examples:

- `docs/multilingual-positioning`
- `docs/name-research`
- `feature/onboarding`
- `feature/guide-library`
- `feature/private-tutors`
- `feature/peer-helpers`
- `feature/social-activities`
- `feature/study-sessions`
- `feature/personal-calendar`
- `feature/groups`
- `feature/admin-review`
- `fix/rtl-ltr-layout`

Daily start:

```bash
git checkout main
git pull origin main
git checkout -b feature/name-of-task
```

Save work:

```bash
git add .
git commit -m "Add multilingual guide research"
git push origin feature/name-of-task
```

Then open a pull request.

## Pull Request Rules

Every PR needs:

- Clear title.
- Short description.
- Linked issue.
- Screenshots for UI changes later.
- Tests or manual test notes.
- Review by the other team member.

No merge if:

- It breaks English, Hebrew, or Arabic behavior.
- It breaks RTL or LTR layout.
- It adds secrets.
- It changes unrelated files.
- It copies code from old prototypes without discussion.
- It adds a feature without acceptance criteria.

## Review Ownership

- Ammar reviews product behavior, UX, visual consistency, and content.
- Marwan reviews data, auth, permissions, security, deployment, and technical tests.
- Ammar's PRs require Marwan's review.
- Marwan's PRs require Ammar's review.
- Cross-cutting changes need both product and technical acceptance notes.

## Planning Rhythm

### Stage 0: Repositioning And Name

- Validate the all-student, three-language direction.
- Interview students from different language and transition contexts.
- Test MAQOM, DARGA, SAHA, and any new candidate.
- Choose the product name before public branding or implementation.

### Stage 1: Product Definition

- Select the first university and launch cohort.
- Approve onboarding, dashboard, social activity, study session, calendar, Private Tutor, Peer Helper, tools/guides, AI, and admin workflows.
- Draft representative content in English, Hebrew, and Arabic.
- Decide implementation platform only after flows are stable.

### Stage 2: Visual Prototype

- Design the first mobile screens.
- Test RTL and LTR with real content.
- Validate with students before building backend behavior.

### Stage 3: Implementation

- Create the application foundation.
- Add auth, profiles, content, localization, and permissions.
- Build thin vertical slices instead of all modules in parallel.

### Stage 4: Pilot And QA

- Run one-university pilot.
- Test all three languages.
- Review content freshness and source accuracy.
- Fix trust, accessibility, and onboarding problems before expansion.

## Communication Rules

Use GitHub Issues for work.

Issue template:

- Goal.
- User story.
- Acceptance criteria.
- Owner.
- Reviewer.
- Notes and source links.

Use WhatsApp or Discord for quick discussion, but decisions must be written in GitHub or the docs.

## Definition Of Done

A task is done when:

- Code or docs are committed on a branch.
- A PR is opened and linked to an issue.
- The other team member reviewed it.
- Acceptance criteria are checked.
- No secrets are committed.
- Relevant English, Hebrew, and Arabic behavior is checked.
- Relevant RTL and LTR behavior is checked.
- The PR is merged into `main`.
- Deployment, when needed, happens only after the project changes are committed and merged into `main`, with a clean `main` checkout.
