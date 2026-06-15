# Elysium

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="app/src/assets/elysium-logo-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="app/src/assets/elysium-logo-light.png">
    <img src="app/src/assets/elysium-logo-light.png" alt="Elysium logo" width="220">
  </picture>
</p>

<p align="center"><strong>University the way it should feel.</strong></p>

Elysium is a trilingual student hub that brings campus planning, social connection, collaborative study, academic support, and practical tools into one personalized product.

The interface supports English, Hebrew, and Arabic, including first-class RTL layouts. Elysium is a hackathon MVP being developed for the Hub02 x BGU Hackathon, scheduled for June 17-22, 2026.

**Live application:** [elysium-nexus-flow.base44.app](https://elysium-nexus-flow.base44.app/)

## Product Purpose

Students routinely split their university life across calendars, messaging groups, course systems, social media, tutoring directories, and institutional websites. Elysium provides one place to answer three practical questions:

1. What do I need to do next?
2. Who can I study, meet, or ask for help?
3. Which tool or trusted resource should I use?

Elysium is not a generic planner. Recommendations are shaped by the student's university, active courses, interests, calendar, language, and current needs.

## MVP Features

- Personalized home screen with upcoming commitments and relevant recommendations.
- Social activities matched to students who share the selected hobby or interest.
- Scheduled study groups and study marathons matched to active courses.
- Private tutors and peer helpers contacted directly through consented WhatsApp links.
- Personal calendar items for homework, exams, and other commitments.
- Active and finished course management shared across study discovery and grade tools.
- GPA and required-grade calculators, flashcards, guides, and official university links.
- Ely, an action-oriented assistant that uses Base44 Agents with a Base44 AI fallback.
- Light, dark, and system appearance settings.
- English, Hebrew, and Arabic interfaces with responsive LTR and RTL behavior.

## Product Status

| Area | MVP status |
| --- | --- |
| Authentication and onboarding | Working |
| Personalized dashboard | Working |
| Social activity discovery and participation | Working |
| Course-matched study groups and marathons | Working |
| Tutor and peer-helper discovery | Working; contact moves to WhatsApp |
| Calendar, GPA tools, and flashcards | Working |
| Ely assistant | Working with persistent Agent conversations and an AI fallback |
| Payments, in-app chat, and calendar sync | Planned, not part of this MVP |

## How Creation Works

The global Create action offers five choices:

| Item | Visibility | Relevance rule |
| --- | --- | --- |
| Social activity | Public within the campus community | Shared hobby or interest |
| Study group | Public within the campus community | Shared active course |
| Homework | Private | Owner's calendar only |
| Exam | Private | Owner's calendar only |
| Other | Private | Owner's calendar only |

## Technology

- React 18 and Vite
- JavaScript with TypeScript checking through `jsconfig.json`
- Tailwind CSS and Radix UI primitives
- Base44 authentication, entities, agents, AI integrations, and hosting
- TanStack Query
- Vitest and Testing Library
- ESLint

## Repository Structure

```text
app/
  base44/
    agents/       Base44 AI agent definitions
    auth/         Authentication configuration
    entities/     Data schemas and row-level access rules
  src/
    components/   Shared product and UI components
    lib/          Product logic, localization, and helpers
    pages/        Application routes
docs/             Product research, design, team, and hackathon planning
```

Original logos and the hackathon roadmap in the repository root are project-owned source assets. Supplied assets must not be replaced or regenerated without explicit approval from the project owner.

## Local Development

Requirements:

- Node.js 20 or newer
- npm
- A Base44 account with access to the Elysium app

```bash
cd app
npm install
```

Set the Base44 application values in your local environment:

```bash
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=https://your-app.base44.app
```

Start the development server:

```bash
npm run dev
```

## Quality Checks

Run all repository checks before opening a pull request:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Tests currently cover localization direction, theme persistence, onboarding rules, urgency ordering, grade calculations, course normalization, creation helpers, and WhatsApp URL generation.

## Demo Journey

A focused demo can be completed without exposing private data:

1. Complete onboarding with a university, field, interests, and optional courses.
2. Add an active course and confirm it appears in the GPA calculator.
3. Create or discover a study group for that course.
4. Create a social activity linked to a hobby.
5. Add homework or an exam through the global Create action and confirm it remains private in the calendar.
6. Ask Ely what to focus on next and follow the suggested internal action.
7. Open an approved tutor or peer-helper profile and use WhatsApp only when contact consent is enabled.

## Base44 Workflow

The Base44 project configuration is stored in `app/base44/config.jsonc`. Schema and agent changes should be reviewed before synchronizing because entity pushes affect the linked Base44 application.

```bash
cd app
npx base44 whoami
npx base44 entities push
npx base44 agents push
npm run build
npx base44 site deploy -y
```

Never commit access tokens, passwords, private contact information, or environment files containing secrets.

## Privacy And Safety

- Student profiles, calendars, flashcards, and private calendar entries are owner-scoped.
- Social activities and study groups expose only the information needed for discovery and participation.
- Tutor and peer-helper contact details are shown only when the owner explicitly consents.
- Elysium does not host student-to-student messaging. Contact moves to WhatsApp.
- Ely must not invent university policies, deadlines, phone numbers, or official links.
- Ely may explain concepts and create study plans, but must not complete graded assignments.

## Current Scope

BGU is the first fully represented campus, while the data architecture supports multiple universities. Payments, verified ratings, calendar synchronization, push notifications, university-system integrations, syllabus import, and campus maps remain future work.

This repository is public for hackathon review and product feedback. Public visibility does not grant permission to reuse the code or assets; all rights remain reserved unless a license is added later.

## Team

- **Ammar:** product, design, frontend, content direction, and demo narrative
- **Marwan:** backend, data, security, integrations, and technical QA

## Contributing

Development uses feature branches and pull requests. Do not commit directly to `main`.

1. Create a branch with a focused name.
2. Keep changes scoped to one product concern.
3. Run all quality checks.
4. Describe user-visible behavior, data changes, and verification in the pull request.
5. Obtain review before deploying schema or agent changes.

## Documentation

- [Product definition](docs/02-product/elysium-product-definition.md)
- [MVP scope](docs/02-product/mvp-scope.md)
- [Design direction](docs/03-design/campus-compass.md)
- [Team workflow](docs/04-team/workflow.md)
- [Hackathon strategy](docs/07-hackathon/hub02-winning-strategy.md)
- [Execution plan](docs/07-hackathon/execution-plan.md)

## License

No open-source license has been granted yet. All rights are reserved by the Elysium team until a license is selected before public release.
