# Current Elysium Audit

Audit date: June 12, 2026.

## Method

This was a read-only audit of:

- Base44 app ID `6a2ae3a92ace0dad0f92f1a6`.
- The live Base44 preview and publicly delivered frontend source.
- Base44 editor project metadata.
- The Lovable Dalili reference at [daliliapp.lovable.app](https://daliliapp.lovable.app/).
- The supplied light and dark Elysium logos.
- The supplied Elysium roadmap PDF.

No Base44 data, settings, source, deployment, or workspace membership was changed.

## Current Product Scorecard

| Area | Current | Competition-ready target |
| --- | ---: | ---: |
| Product clarity | 2/5 | 5/5 |
| Demo readiness | 1/5 | 5/5 |
| English/Hebrew/Arabic parity | 1/5 | 5/5 |
| Source trust | 1/5 | 5/5 |
| BGU specificity | 1/5 | 4/5 |
| Base44-native differentiation | 1/5 | 4/5 |
| Visual polish | 2/5 | 4/5 |
| Accessibility/RTL | 1/5 | 5/5 |
| Security confidence | 2/5 | 4/5 |
| Traction instrumentation | 1/5 | 4/5 |

The application is a useful generated prototype, but it is not yet a coherent hackathon entry.

## P0: Must Fix Before Public Recruitment

### 1. The Base44 Project Description Is For The Wrong Product

The Base44 project is titled **Elysium Hub**, but its description says it is a project-management and roadmap platform for hackathon teams. This directly contradicts the student product and can confuse Base44 reviewers.

Required correction:

> Elysium is a trilingual campus copilot that gives Israeli university students verified answers, clear next steps, and trusted human support.

### 2. Localization Is Structurally Broken

Observed behavior:

- Arabic headings appear beside English subtitles, navigation, buttons, empty states, and dates.
- Onboarding only offers Hebrew and English.
- Profile language settings only offer Hebrew and English.
- The delivered document remains `lang="en"` with no active RTL direction while Arabic is visible.
- There is no complete language-switching behavior.

Impact:

- The three-language promise is false in the current build.
- Arabic and Hebrew users receive inconsistent reading order and accessibility metadata.
- The issue is visible immediately to judges.

Required correction:

- Use one translation system and one active locale.
- Set document language and direction from locale.
- Use logical spacing and direction-aware icons.
- Make the complete demo path available in English, Hebrew, and Arabic.
- Never mix languages except when deliberately showing an official term and its explanation.

Reference: [W3C bidirectional text guidance](https://www.w3.org/International/geo/html-tech/tech-bidi.html).

### 3. The Primary Demo Is Empty

Observed behavior:

- The dashboard's largest section is a calendar showing "Nothing this week."
- Social events, study groups, and tutors display empty states.
- The displayed week precedes the June 17-22 hackathon.

Impact:

The first impression is that Elysium has no users, content, or current purpose.

Required correction:

- Replace the calendar-first dashboard with "What matters now."
- Seed verified guides, timely notices, mentors, and groups.
- Use current hackathon-week content.
- Clearly mark fictional records as demo data; do not imply fake users are real.

### 4. The Product Thesis Is Buried

Observed behavior:

- Guides are inside a "Useful info" section on the Tools page.
- The home shortcuts prioritize Study Groups, Social, Teachers, and Tools.
- GPA, grade-needed, semester progress, and flashcards occupy substantial space.
- There is no source-grounded campus copilot.

Impact:

The current app looks like a collection of common student utilities. It does not communicate why Elysium should exist.

Required correction:

- Promote Guides and Ask Elysium to primary navigation.
- Make the verified answer-to-action journey the first screen and live demo.
- Demote calculators and remove flashcards for the competition build.

### 5. Mentors Became A Private-Tutor Marketplace

Observed behavior:

- The page is titled Private Tutors.
- Students offer tutoring services from their profile.
- Tutors are ordered and displayed with star ratings and reviews.
- The app stores `PrivateTeacher` and `TeacherRating` records.

Impact:

This changes the trust model and introduces marketplace moderation, reputation, safety, and possibly payment expectations. It also abandons Elysium's approved older-student mentor concept.

Required correction:

- Rename the role to Peer Mentor.
- Show approval, university, field, year, languages, and help topics.
- Remove star ratings from the MVP.
- Use request-contact or WhatsApp only after approval and privacy review.

### 6. Guide Trust Is Not Visible

Observed behavior:

- Guide details show situation, content, steps, and contact.
- A `source_url` exists in the admin form but is not visibly rendered in the guide detail audited.
- No reviewed date, content owner, university badge, or stale-content report is visible.
- Some advice is generic and prescriptive without clear institutional authority.

Impact:

Incorrect university-policy guidance can be worse than no guidance.

Required correction:

- Require source URL, university, locale, owner, approval status, and last-reviewed date.
- Display the official source on every policy guide.
- Add "report outdated" feedback.
- Make the AI decline to invent an answer when approved content is absent.

### 7. Admin Authorization Is Not Demonstrated

The client routes every authenticated profile to `/admin`, and the Admin page immediately attempts to list and mutate tutors, guides, feedback, and universities. No client-side role check was found.

This does not prove that Base44 entity permissions are insecure; server-side entity rules may still block unauthorized operations. However, both the route and every admin entity permission must be tested with a normal student account before launch.

Required correction:

- Hide and guard the route by role.
- Enforce authorization in Base44 entity/backend permissions, not only in the interface.
- Test read, create, update, delete, approve, and publish operations as student, mentor, admin, and anonymous visitor.

## P1: Strongly Recommended Before Judging

### Onboarding Is Too Long And Still Too Shallow

The current five steps ask for university, faculty, academic year, preferred language, and help needs. The structure is reasonable, but the language step is incomplete and the whole experience is English-only.

Competition target:

- Screen 1: language.
- Screen 2: BGU, year, and faculty with defaults where possible.
- Screen 3: choose up to three help needs.
- Show immediate value after completion.
- Allow optional details later.

### Authentication Delays The First Useful Moment

The current app requires authentication before the product experience. For user acquisition, public approved guides and one sample question should be accessible without an account if Base44 permissions can support that safely.

### The Dashboard Uses The Wrong Mental Model

The calendar organizes the app around dates. Elysium should organize it around uncertainty and next actions.

Recommended hierarchy:

1. Ask Elysium.
2. Your next action.
3. Recommended verified guides.
4. Current BGU notice or deadline.
5. Human help.

### The Information Architecture Is Feature-Led

Current bottom navigation: Home, Social, Groups, Teachers, Tools.

Competition navigation:

- Home.
- Guides.
- Ask, as the visually prominent center action.
- Community, containing mentors and groups.
- Profile.

Use the compact, stable five-item mobile shell from the Lovable prototype as inspiration, without copying its feature priorities.

### There Is No Feedback Loop Or Visible Traction

The hackathon expects users and iteration. Add:

- One-tap helpful/not-helpful after an answer.
- Optional reason and missing-answer report.
- Source-click and share tracking.
- Admin summary of activation and feedback.
- A dated changelog of changes made from user feedback.

### The App Does Not Use The Supplied Brand

The current header uses plain ELYSIUM text rather than the supplied logo. A full circular logo is not required in the header, but a consistent app mark and wordmark are.

## Logo And Brand Audit

### What Works

- The light and dark versions show an intent to support both themes.
- The circular composition can become a recognizable app mark.
- Teal is compatible with the trusted guidance direction.
- "University the way it should feel" supports the product story.

### What Needs Revision

- Metallic gradients and a seal-like ring make the logo resemble a traditional institution more than a modern student product.
- The central graduate silhouette is ambiguous and loses detail at app-icon size.
- Curved tagline text is illegible at small sizes.
- The mark does not communicate wayfinding, multilingual guidance, or a next action.
- The logo style does not match the current flat interface.

### Recommended Logo System

Keep Elysium and the teal direction, but separate the system into:

- A simplified app icon: an `E`, waypoint, path, or three-part compass motif.
- A clean ELYSIUM wordmark.
- The tagline used only at larger presentation sizes.
- Flat light and dark variants with no critical information in gradients.

Do not spend core build time on a complete rebrand. Produce one clean app icon, one wordmark, and one pitch-slide lockup.

## UI/Codex Design Direction

The design should feel like a polished campus operating system: calm, immediate, and more precise than the current generic card grid.

### Shell

- Mobile-first, with a constrained desktop canvas rather than a marketing landing page.
- Stable five-item bottom navigation.
- Clear top bar with app mark, context, language, and profile.
- No cards nested inside other cards.

### First View

- Small contextual greeting, not a large hero.
- Prominent Ask Elysium field.
- One "Next step" band.
- Two recommended guide rows.
- One timely campus notice.
- No empty primary module.

### Visual System

- Background: warm neutral or clean near-white.
- Text: charcoal, not navy everywhere.
- Primary: deep teal.
- Supporting colors: sky blue for information, amber for deadlines, coral/red only for urgent states.
- Dark mode: near-black/charcoal surfaces with restrained teal, not a monochrome navy screen.
- Icons: consistent Lucide-style icons, with emoji removed from primary navigation and controls.
- Motion: short page transitions and a clear response state for Ask Elysium; no decorative animation.

### Cards And Content

- Use cards only for repeated guides, mentors, and groups.
- Use full-width bands for dashboard priorities.
- Display source and review metadata without hiding it in an accordion.
- Keep action buttons stable across language lengths.

## Lovable Reference: Keep And Avoid

Keep:

- Compact mobile shell.
- Five-item bottom navigation.
- Clear active navigation state.
- Raised central action pattern, repurposed for Ask Elysium.
- Warm-neutral plus teal palette rhythm.

Avoid:

- Event-first and generic planner emphasis.
- Raised plus button whose meaning changes by page.
- Too many rounded cards.
- Treating GPA, courses, goals, and events as the product's central identity.

## Base44-Native Opportunity

The current app uses Base44 entities and authentication, but the sponsor-visible differentiator is weak. Add one clearly explainable native workflow:

1. Admin publishes a sourced BGU guide.
2. The Elysium agent can read published guides and offices but cannot publish or edit them.
3. A student asks in English, Hebrew, or Arabic.
4. The agent returns an answer with source references and actions.
5. The conversation records topic, language, and whether the answer helped.
6. Admin sees unanswered topics and improves content.

This creates a closed improvement loop and gives Base44 a central technical role.

## Release Acceptance Criteria

- Base44 metadata describes Elysium accurately.
- The core question-to-action flow works in all three languages.
- Arabic and Hebrew have correct RTL document direction.
- No primary screen is empty during the demo.
- Every policy guide has an official source and review date.
- The assistant never invents unsupported university policy.
- Student accounts cannot access admin data or operations.
- Peer mentors replace private tutors in the competition flow.
- The app records activation and feedback events.
- The complete demo can be reset and repeated in under 60 seconds.
