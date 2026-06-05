# Team Workflow

Team:

- Ammar.
- Marwan.
- Abd Allah.

Chosen workflow: **Balanced Defaults**.

## Roles

### Ammar: Product, Design, Frontend

Owns:

- Product direction.
- User journeys.
- Visual design direction.
- Frontend app shell later.
- Arabic UI copy quality.
- LinkedIn/story presentation.

First responsibilities:

- Keep Dalili specific and non-generic.
- Approve screen flows before code.
- Lead Campus Compass design.
- Review every user-facing page.

### Marwan: Supabase, Backend, Security

Owns:

- Supabase project setup later.
- Database schema.
- Auth.
- Row Level Security policies.
- Admin permissions.
- Environment variables.
- Data integrity.

First responsibilities:

- Read Supabase Auth and RLS docs.
- Draft safe schema before implementation.
- Make sure users can only edit their own private data.
- Make sure public content has an approval model.

### Abd Allah: Content, Research, QA

Owns:

- Research sources.
- University pages.
- Guide content.
- Mentor/group approval checklist.
- Manual testing.
- Documentation quality.

First responsibilities:

- Turn research into useful guide topics.
- Gather official university links.
- Create sample guides.
- Test every flow as a first-year student.

## Beginner Git Rules

No one works directly on `main`.

Branches:

- `docs/research-foundation`
- `feature/onboarding`
- `feature/guide-library`
- `feature/mentor-profiles`
- `feature/groups`
- `feature/admin-review`
- `fix/mobile-rtl`

Daily start:

```bash
git checkout main
git pull origin main
git checkout -b feature/name-of-task
```

Save work:

```bash
git add .
git commit -m "Add guide library research notes"
git push origin feature/name-of-task
```

Then open a pull request.

## Pull Request Rules

Every PR needs:

- Clear title.
- Short description.
- Screenshots for UI changes later.
- Tests or manual test notes.
- One reviewer.

No merge if:

- It breaks Arabic/RTL layout.
- It adds secrets.
- It changes unrelated files.
- It copies code from old prototypes without discussion.
- It adds a feature without docs or acceptance criteria.

## Review Ownership

- Ammar reviews UI, copy, product behavior.
- Marwan reviews data, auth, Supabase, security.
- Abd Allah reviews content, source links, test cases.

If the author is Ammar, Marwan or Abd Allah must review.
If the author is Marwan, Ammar must review product impact.
If the author is Abd Allah, Ammar reviews copy/product and Marwan reviews data changes if any.

## Weekly Rhythm

### Week 0: Research And Docs

- Finish docs-only foundation.
- Create private GitHub repo.
- Add issues.
- Agree on MVP screens.

### Week 1: Visual And Skeleton

- Design first screens.
- Create Vite app only after docs are approved.
- Build static app shell with sample data.
- No Supabase dependency until UI direction is clear.

### Week 2: Auth And Data

- Add Supabase Auth.
- Add profiles and onboarding.
- Add guide and university data model.
- Add RLS.

### Week 3: Hub Features

- Guide library.
- University pages.
- Mentor profiles.
- Groups.

### Week 4: Admin And Polish

- Admin review queues.
- Reports.
- Mobile QA.
- Vercel preview.

## Communication Rules

Use GitHub Issues for work.

Issue template:

- Goal.
- User story.
- Acceptance criteria.
- Owner.
- Notes/source links.

Use WhatsApp/Discord for quick discussion, but decisions must be written in GitHub or docs.

## Definition Of Done

A task is done when:

- Code or docs are committed on a branch.
- PR is opened.
- Reviewer approved.
- Acceptance criteria are checked.
- No secrets are committed.
- Arabic/RTL is checked for UI tasks.
- The PR is merged into `main`.

