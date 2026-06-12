# Elysium (formerly Dalili / دليلي)

Elysium is a multilingual student support hub for students in Israeli universities and colleges. The project began as Dalili, an Arabic-first idea, and now serves students in English, Hebrew, and Arabic while preserving the depth of the original research.

The product direction is a **Personalized Student Hub** with a **Campus Compass** design language. The MVP combines student social life, collaborative study, tutors, peer help, a personal calendar, practical tools, and trusted guidance in English, Hebrew, and Arabic.

## Mission

The product exists because student life is fragmented across calendars, WhatsApp groups, tutoring contacts, university pages, social posts, study groups, and disconnected tools. Elysium brings those needs into one personalized place and helps each student decide what to do next.

The long-term product sentence:

> Elysium is a personalized, trilingual student hub for planning university life, meeting people, studying together, finding academic help, and knowing what to do next.

For the June 17-22, 2026 Hub02 x BGU hackathon, Elysium demonstrates this connected hub through a polished BGU-first experience. AI is the coordinating assistant across the hub, not the product's replacement. See the hackathon documents below.

## Current Stage

This repository is in the research and planning stage.

Allowed in this stage:

- Markdown documentation.
- Research notes with source links.
- Product planning, design direction, team workflow, and backlog.
- Private GitHub workflow planning.

Not allowed in this stage:

- App code.
- Package setup.
- Database migrations.
- Generated components.
- Copying implementation from older prototypes.

## Chosen Defaults

- MVP direction: Full Student Hub.
- Implementation decision: Base44 is connected for later evaluation; Vite + Supabase remains the custom-build reference. No platform project is initialized yet.
- Design direction: Campus Compass.
- Language model: English, Hebrew, and Arabic are first-class product languages.
- Team workflow: Ammar owns product/design/frontend/content direction; Marwan owns backend/data/security/technical QA. Research and product QA are shared.

## Documents

- [Arab Student Struggles](docs/01-research/arab-student-struggles.md)
- [Multilingual Student Needs](docs/01-research/multilingual-student-needs.md)
- [Prototype Audit](docs/01-research/prototype-audit.md)
- [Dalili Idea](docs/02-product/dalili-idea.md)
- [Elysium Product Definition](docs/02-product/elysium-product-definition.md)
- [Naming Directions](docs/02-product/naming-directions.md)
- [MVP Scope](docs/02-product/mvp-scope.md)
- [Campus Compass Design](docs/03-design/campus-compass.md)
- [Team Workflow](docs/04-team/workflow.md)
- [Repo And Stack Plan](docs/05-tech/repo-stack-plan.md)
- [Initial Issues](docs/06-backlog/initial-issues.md)
- [Hub02 Winning Strategy](docs/07-hackathon/hub02-winning-strategy.md)
- [Current Elysium Audit](docs/07-hackathon/current-elysium-audit.md)
- [Hackathon Execution Plan](docs/07-hackathon/execution-plan.md)
- [Base44 Master Build Prompt](docs/07-hackathon/base44-master-build-prompt.md)

## Source Material Read

- `Visily-Export_10-06-2025_07-54.pdf` in this folder.
- Previous Spring Boot + React prototype at `C:\Users\ammar\IdeaProjects\DaliliApp` as read-only.
- Previous Lovable Vite + React + Supabase prototype at `C:\Users\ammar\OneDrive\Desktop\myprojects\vibecoding\dalili_with_lovable` as read-only.
- Previous Cursor/Python + Supabase prototype at `C:\Users\ammar\OneDrive\Desktop\myprojects\vibecoding\trying_with_cursor` as read-only.
- Pasted ChatGPT plan attachment from Codex.

## GitHub Status

This folder is now a git repository connected to the private GitHub repo:

- Remote: `https://github.com/ammar31mawassi/Dalili.git`
- Default branch: `main`
- Current stage: docs-only research and planning
- Initial labels and starter issues: created
- GitHub CLI: installed and authenticated as `ammar31mawassi`
- Base44 plugin/CLI: installed and authenticated, intentionally unused until product definition is approved.

Remaining GitHub-side limits:

- `main` protection/rulesets cannot be enabled while this private repo is on the current GitHub plan. GitHub returned: `Upgrade to GitHub Pro or make this repository public to enable this feature.`
- GitHub Projects automation needs the `project` OAuth scope. Run `gh auth refresh --hostname github.com -s project` before creating the project board from the CLI.

Until `main` protection is available, the team rule is still: use feature branches and pull requests, no direct implementation work on `main`.
