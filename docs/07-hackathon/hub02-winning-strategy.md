# Hub02 x BGU Hackathon Winning Strategy

Last researched: June 12, 2026.

## Executive Decision

Elysium should enter the hackathon as the connected one-stop student hub it was designed to be. The risk is not that it has several modules; the risk is presenting those modules as unrelated menu items.

The competition version should be:

> Elysium is a personalized, trilingual student hub where university students plan their week, meet people, study together, find tutors and peer help, use practical tools, and ask AI what to do next.

The hackathon build should prove that these modules share one student context: joining an activity or study session updates the calendar and home screen; tutor and peer-helper discovery use the student's courses and language; tools and guides are available from the same hub; AI coordinates the experience.

## What The Competition Actually Rewards

The official event page states:

- The hackathon runs from **June 17 through June 22, 2026**.
- Building is virtual; the closing event and fair are at the BGU Student House on **Monday, June 22**.
- Teams may start before June 17 and bring an existing project.
- Publishing to Hub02 opens June 17. Teams are expected to attract users, receive feedback, and improve the product during the week.
- The overall winner is the tool that creates the **greatest value**, attracts the **most users**, and best represents the integration of **technology and student life**.
- Main prizes are NIS 10,000, NIS 5,000, and NIS 1,000.
- Base44 separately offers NIS 3,000 for the best tool built with Base44, selected by the Base44 team.
- The three leading builders published in the Tech7 hub are invited to its international "Challenges" mentoring program.
- Each participant receives 75 Base44 credits; the same code can be used by up to three workspace users.

The event page does not say that the main and Base44 prizes are mutually exclusive. The working target is therefore **first place plus the Base44 prize, NIS 13,000 total**, but the organizers should confirm prize stacking in writing.

Source: [Hub02 x BGU Hackathon](https://hub02.com/bgu-hackathon).

## The Winning Thesis

### 1. Value: Connect Fragmented Student Life

Students currently coordinate different parts of university life through separate systems: calendar apps, WhatsApp groups, social posts, tutor contacts, course groups, calculators, university pages, and memory.

Elysium should demonstrate the value of connection:

- Discover a football activity and add it to the same calendar that holds assignment deadlines.
- Join a CS study session and see it in the personalized home screen.
- Find a private tutor for instruction or an opted-in peer helper for a student question.
- Use a grade calculator or flashcards without leaving the student context.
- Ask AI what is next and receive a recommendation grounded in the student's actual Elysium data.

### 2. Users: Launch Early Enough To Learn

Because the official criteria explicitly mention users and iteration, publishing on the final day is a losing strategy. The usable core should be published to Hub02 on **June 17**, then improved from observed behavior and short interviews.

Target by the June 22 closing event:

- 75 registered or identifiable pilot users.
- 40 activated users who complete one meaningful action: join, create, save, calculate, request, or receive a useful AI answer.
- 20 pieces of structured feedback.
- 10 shares or referrals.
- 3 documented product changes made because of user feedback.
- At least 8 users in each supported language path, where recruitment permits.

These are internal targets, not claims to publish before they are achieved.

### 3. Technology And Student Life: Make Base44 Essential To The Story

The Base44 implementation must be more than a generated interface. The strongest sponsor-prize story is:

- Base44 entities hold profiles, interests, activities, participants, study sessions, personal deadlines, tutors, peer helpers, guides, tools data, feedback, and user context.
- Entity relationships make one action update the wider hub: a join becomes a calendar item and a home-screen next action.
- A Base44 AI agent reads the student's permitted context and routes them to existing Elysium actions, people, tools, and approved information.
- Per-user context remembers institution, faculty, courses, interests, language, and help needs.
- Admin workflows moderate public listings, reports, and sourced content.
- Analytics show joins, created sessions, tutor requests, tool usage, AI usefulness, and unmet needs.

Base44 officially supports agents with entity tools and scoped operations. Its app agents can also connect to WhatsApp, although WhatsApp should be attempted only after the in-app flow is reliable and credits are understood.

Sources: [Base44 agent configuration](https://docs.base44.com/developers/backend/resources/agents-config), [Base44 app agents](https://docs.base44.com/Building-your-app/AI-agents-for-apps).

## Evidence That The Problem Matters

### Broad Student Pressure

The National Union of Israeli Students' 2025 survey reports:

- **34%** of respondents considered leaving their studies.
- **48%** said the war substantially affected their academic performance.
- Average monthly income among working students was **NIS 6,291**, while average monthly expenses were **NIS 6,879**, a monthly gap of about **NIS 588**.

These are wartime and survey figures, not a normal-year causal estimate. They support a product focused on fast access to rights, recovery paths, scholarships, deadlines, and human help.

Sources: [NUIS Student Survey 2025](https://www.nuis.co.il/student-report-2025/), [NUIS statistics](https://www.nuis.co.il/stats/).

### BGU-Specific Disruption

BGU reports that more than 2,000 students were reservists, some serving more than 300 days, and that at the height of the war approximately 25% of its students were called to duty. This creates unusually complex needs around accommodations, missed coursework, exams, reintegration, and support services.

Sources: [BGU student reservists](https://www.bgu.ac.il/en/general/people-bgu-project/noa-dekel-on-a-mission-for-student-reservists/), [BGU academic challenges](https://www.bgu.ac.il/en/general/academic-challenges-in-light-of-current-events/).

### Unequal Language And Transition Friction

The earlier Dalili research remains a product advantage. Arab students and other multilingual groups encounter a hidden curriculum across Hebrew administration, Arabic daily language, and English academic material. Elysium should serve all students without flattening these higher-friction journeys into generic personalization.

See [Multilingual Student Needs](../01-research/multilingual-student-needs.md) and [Arab Student Struggles](../01-research/arab-student-struggles.md).

### Important Counterpoint

OECD 2025 data reports that Israel's first-year bachelor dropout share was 8%, below the OECD average of 13%. Elysium should therefore avoid claiming that all Israeli higher education is broadly failing. The defensible claim is that students face fragmented information and that specific groups and disrupted students face much higher friction.

Source: [OECD Education at a Glance 2025: Israel](https://www.oecd.org/en/publications/education-at-a-glance-2025_1a3543e2-en/israel_4b1e0baf-en.html).

## Lessons From Other Products And Winners

### Existing Campus Platforms

Products such as campusM, Ready Education, and Navigate360 already aggregate institutional resources, events, communications, and campus services. Elysium should not pretend that aggregation alone is unique.

Elysium's defensible wedge is different:

- Student-created social and study coordination rather than institution-only broadcasting.
- A single personalized calendar across personal, social, study, and tutor activity.
- Two explicit human-help models: private tutors and opt-in peer helpers.
- Practical student tools and source-backed guides in the same context.
- English, Hebrew, and Arabic across the core workflow.
- AI that coordinates real hub actions rather than acting as a disconnected chatbot.
- BGU-specific usefulness on the first day.

Sources: [campusM](https://campusm.exlibrisgroup.com/), [Ready Education Campus App](https://resources.readyeducation.com/landing/campusapp), [Navigate360 Student](https://play.google.com/store/apps/details?id=com.eab.se).

### Winning Hackathon Patterns

Recent winning student-support projects reinforce four patterns:

- A specific lived problem is stronger than a general feature list.
- Institutional knowledge creates relevance and trust.
- One memorable interaction creates the demo moment.
- A credible path to feedback and campus adoption matters.

Project M.E.G.A.N, a 2026 second-place project, framed fragmented student life as a proactive institutional-knowledge mentor. Vector Mentor, a first-overall winner, emphasized iterative testing and campus integration. Elysium should learn from their focus without copying their features or claims.

Sources: [Project M.E.G.A.N](https://devpost.com/software/project-m-e-g-a-n), [Vector Mentor](https://devpost.com/software/to-be-decided-og94ij).

Devpost recommends comparing ideas against effort, time, requirements, and judging criteria. MLH's judging guidance assumes short, repeated demonstrations, which rewards a reliable prepared flow over a large product that needs explanation.

Sources: [Devpost project planning](https://help.devpost.com/article/125-tips-for-planning-your-project), [MLH judging plan](https://guide.mlh.io/general-information/judging-and-submissions/judging-plan).

## Competition MVP

### Must Be Excellent

1. **Language-first entry**
   - English, Hebrew, and Arabic are available immediately.
   - Hebrew and Arabic use true RTL at the document and component level.
   - Switching language preserves the current task.

2. **Personalized home and calendar**
   - Personal deadlines, joined activities, study sessions, and tutor requests share one timeline.
   - The home screen always offers a useful next action when the calendar is empty.

3. **Social and study participation**
   - A student can create and join a social activity.
   - A student can create and join a separate academic study session.
   - Joining updates participants, calendar, and home context reliably.

4. **Two human-help paths**
   - Private tutors list subjects, languages, availability, and a booking/contact request.
   - Peer Helpers are opted-in students listing topics, languages, and consented contact options.
   - The interface never confuses the two roles.

5. **Tools, links, and guides**
   - GPA and required-grade calculators work correctly.
   - At least one flashcard flow is usable.
   - Helpful links and policy guides show source and freshness metadata.

6. **Ask Elysium**
   - AI can summarize what is next from the student's permitted hub data.
   - It can recommend a relevant activity, study session, tutor, peer helper, tool, or approved guide.
   - It asks for confirmation before creating or changing anything.
   - It never invents university policy.

7. **Trust, safety, and traction**
   - Admin is role-protected and public listings can be reported.
   - Contact details follow explicit consent and visibility rules.
   - Track onboarding, joins, creations, calendar actions, tutor requests, tool use, AI usefulness, feedback, and language.
   - Do not expose private questions or personal calendar data in public analytics.

### Should Be Present, But Thin

- Three private tutor profiles covering real subjects.
- Three clearly separate Peer Helper profiles.
- Three social activities and three study sessions with realistic future dates.
- Six source-backed BGU links or guides.
- One working GPA flow and one flashcard deck.

### Preserve The Core, Limit The Depth

- Keep social activities, study sessions, tutors, Peer Helpers, calendar, GPA, flashcards, links, guides, and AI visible and usable.
- Do not build payments; use a booking/contact request for tutors.
- Do not build real-time group chat; use participant lists and approved contact routes.
- Do not build external calendar synchronization; use Elysium's internal calendar.
- Do not build advanced flashcard algorithms; prove create, review, and progress.
- Do not expand beyond BGU-specific seeded content before the BGU experience works.
- Do not build a second CV/LinkedIn product.

The scope decision is **thin connected modules**, not removal of the one-stop-shop core.

## The Demonstration Story

Use one prepared student day that connects the hub:

1. A BGU computer-science student opens Elysium in Arabic and sees an assignment deadline plus a personalized next step.
2. The student joins a CS library study session; it immediately appears in their calendar.
3. They join an evening football activity, which appears in the same timeline.
4. They open Tools, calculate the grade needed in the course, and view a matching flashcard deck.
5. They compare a private tutor for the course with a separate Peer Helper who can answer first-year questions.
6. They ask Elysium AI, "What should I focus on next?" The answer references the deadline, joined study session, relevant tool, and available help.
7. The interface changes to Hebrew or English without losing the student's context.

Prepare a shorter fallback demo containing home, one join action, calendar update, and AI summary in case judging time is limited.

## User Acquisition Plan

### Recruitment Channels

- Personal BGU student network.
- Course and faculty WhatsApp groups where posting is permitted.
- Arab student, international student, first-year, and reservist communities.
- Student union and department contacts.
- A QR code at the June 22 fair.
- Direct one-to-one testing requests rather than broad spam.

### Reduce Adoption Friction

- Let visitors browse public activities, study sessions, tutors, Peer Helpers, tools previews, and guides without creating an account where Base44 permissions allow it safely.
- Ask for login only to save, join, or personalize.
- Use contextual one-question feedback: "Was this useful?" after a join, request, tool, guide, or AI recommendation.
- Provide shareable deep links to activities, study sessions, tutor profiles, and guides.
- Seed the app so no judge or user reaches an empty primary screen.

## Pitch Structure

Keep the pitch to roughly 90 seconds unless organizers publish another format.

1. **Problem, 15 seconds:** student life is fragmented across calendars, WhatsApp groups, tutor contacts, university systems, disconnected tools, and three languages.
2. **Evidence, 10 seconds:** cite the NUIS pressure figures without overstating causality.
3. **Product, 10 seconds:** give the one-sentence Elysium promise.
4. **Live demo, 35 seconds:** personalized home, one join, automatic calendar update, tool/human-help option, and AI next-step summary.
5. **Traction, 10 seconds:** users, activation, feedback, and changes made during the week.
6. **Why Base44 and why this team, 10 seconds:** Base44 entities, relationships, permissions, agent, and feedback loop; Ammar's lived product insight and the team's ability to execute.

Do not give a tour of every page.

## Decision Gates

The team should not add another feature unless all are true:

- It improves value, users, student-life integration, or the Base44 prize story.
- It appears in the live demo or directly supports reliability/trust.
- It can be completed and tested in all three languages.
- It does not reduce time for content, user recruitment, or pitch rehearsal.

## Strategic Risks

- **Generic AI wrapper:** prevented by making AI coordinate real social, study, calendar, tutor, Peer Helper, tools, and guide data.
- **Too broad:** prevented by thin connected workflows, one BGU demo account, and one prepared student-day story.
- **Empty network features:** prevented by seeding real or clearly labeled demo content.
- **False policy answers:** prevented by source restrictions, review dates, and refusal when no approved answer exists.
- **Language promise not delivered:** prevented by requiring all three languages in the demo path.
- **Base44 instability:** mitigated with a recorded backup demo, screenshots, and a tested reset path.
- **Weak traction:** mitigated by publishing June 17 and assigning daily recruitment ownership.
