# Hub02 x BGU Hackathon Winning Strategy

Last researched: June 12, 2026.

## Executive Decision

Elysium should not enter the hackathon as a broad collection of calendars, GPA tools, social events, tutors, flashcards, and guides. That is difficult to explain, difficult to finish, and easy to mistake for a generic student dashboard.

The competition version should be:

> Elysium is a trilingual campus copilot that turns a confusing student question into a verified BGU answer, a clear action checklist, and the right person or office to contact.

The long-term Full Student Hub remains valid. The hackathon build is the strongest vertical slice of that vision: **BGU-first guidance in English, Hebrew, and Arabic**.

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

### 1. Value: Solve A Repeated, Expensive Moment Of Confusion

Students do not need another screen containing links. They need to know:

- What does this message or university term mean?
- What should I do next?
- What is the deadline?
- Which source can I trust?
- Who owns this problem?
- Can someone who has experienced it explain it in my language?

Elysium should demonstrate that complete path in one interaction.

### 2. Users: Launch Early Enough To Learn

Because the official criteria explicitly mention users and iteration, publishing on the final day is a losing strategy. The usable core should be published to Hub02 on **June 17**, then improved from observed behavior and short interviews.

Target by the June 22 closing event:

- 75 registered or identifiable pilot users.
- 40 activated users who complete one useful answer or guide.
- 20 pieces of structured feedback.
- 10 shares or referrals.
- 3 documented product changes made because of user feedback.
- At least 8 users in each supported language path, where recruitment permits.

These are internal targets, not claims to publish before they are achieved.

### 3. Technology And Student Life: Make Base44 Essential To The Story

The Base44 implementation must be more than a generated interface. The strongest sponsor-prize story is:

- Base44 entities hold verified university guides, offices, deadlines, mentors, feedback, and user context.
- A Base44 AI agent searches only approved information and produces a short answer with sources and next actions.
- Per-user context remembers institution, year, language, and help needs.
- Admin workflows publish, review, and expire content.
- Analytics show questions, successful answers, feedback, and unmet needs.

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

Products such as campusM, Ready Education, and Navigate360 already aggregate resources, events, communications, and campus services. Competing as "one app for everything" would place Elysium against mature institutional platforms.

Elysium's defensible wedge is different:

- Student-language explanations rather than institutional navigation alone.
- Source-backed answers rather than a link directory.
- Cross-language terminology and search.
- The action after the answer: checklist, office, mentor, or group.
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

2. **Ask Elysium**
   - A student asks a real campus question in any supported language.
   - The answer uses only approved Elysium content.
   - It shows a source, reviewed date, BGU context, and uncertainty when applicable.
   - It returns three to five concrete actions, not an essay.

3. **Verified guide detail**
   - Situation.
   - Plain-language explanation.
   - Official Hebrew term and useful equivalents.
   - Steps, deadline or timing, office/contact, source, and last-reviewed date.
   - "Report outdated information" action.

4. **What Matters Now dashboard**
   - One primary next step.
   - Recommended guide or answer based on onboarding.
   - Relevant deadline or support notice.
   - A human-help route.

5. **Trust and admin flow**
   - Only approved guides are public.
   - Admin is role-protected.
   - Content has source and freshness fields.
   - Feedback and stale-content reports are reviewable.

6. **Traction instrumentation**
   - Track onboarding completion, question submitted, answer opened, source clicked, guide saved/shared, feedback submitted, and language.
   - Do not expose private user questions in public analytics.

### Should Be Present, But Thin

- Three approved peer-mentor profiles with language and topic filters.
- Four useful BGU groups or support routes.
- Public guide browsing before login.
- Save/share after login.
- A small BGU university page with official services.

### Remove Or Demote For The Competition

- Private tutor marketplace and star ratings.
- Flashcards.
- GPA and grade-needed calculators.
- Empty social-event feeds.
- Empty calendar as the dashboard centerpiece.
- Multi-university browsing with no useful content.
- A second CV/LinkedIn product.
- Advanced planner or calendar synchronization.

These features are not necessarily bad. They are bad uses of the remaining competition time because they weaken the product sentence and demo.

## The Demonstration Story

Use one prepared, real BGU scenario. Example:

1. A first-year student opens Elysium in Arabic.
2. The student asks: "I missed an exam because of reserve duty. What should I do?"
3. Elysium explains the relevant official Hebrew terms in Arabic, shows the BGU source and review date, and produces a short checklist.
4. The student changes the interface to Hebrew; the same answer and context remain.
5. The student saves or shares the guide and sees the correct office or approved peer mentor.
6. The admin view shows that the guide is approved, sourced, and can be updated without rebuilding the app.

Prepare a second non-reserve scenario, such as an exam appeal or scholarship deadline, in case the judges prefer a more universal example.

## User Acquisition Plan

### Recruitment Channels

- Personal BGU student network.
- Course and faculty WhatsApp groups where posting is permitted.
- Arab student, international student, first-year, and reservist communities.
- Student union and department contacts.
- A QR code at the June 22 fair.
- Direct one-to-one testing requests rather than broad spam.

### Reduce Adoption Friction

- Let visitors browse guides and try one example answer without creating an account if Base44 permissions allow it safely.
- Ask for login only to save, join, or personalize.
- Use a one-question feedback prompt after an answer: "Did this tell you what to do next?"
- Provide a shareable deep link to each guide.
- Seed the app so no judge or user reaches an empty primary screen.

## Pitch Structure

Keep the pitch to roughly 90 seconds unless organizers publish another format.

1. **Problem, 15 seconds:** students face a hidden university operating system spread across portals, PDFs, emails, and three languages.
2. **Evidence, 10 seconds:** cite the NUIS pressure figures without overstating causality.
3. **Product, 10 seconds:** give the one-sentence Elysium promise.
4. **Live demo, 35 seconds:** one question, verified answer, language switch, source, and next human/contact.
5. **Traction, 10 seconds:** users, activation, feedback, and changes made during the week.
6. **Why Base44 and why this team, 10 seconds:** Base44 agent plus entities/admin workflow; Ammar's lived product insight and the team's ability to execute.

Do not give a tour of every page.

## Decision Gates

The team should not add another feature unless all are true:

- It improves value, users, student-life integration, or the Base44 prize story.
- It appears in the live demo or directly supports reliability/trust.
- It can be completed and tested in all three languages.
- It does not reduce time for content, user recruitment, or pitch rehearsal.

## Strategic Risks

- **Generic AI wrapper:** prevented by approved source data, citations, and action workflows.
- **Too broad:** prevented by BGU-first content and one core interaction.
- **Empty network features:** prevented by seeding real or clearly labeled demo content.
- **False policy answers:** prevented by source restrictions, review dates, and refusal when no approved answer exists.
- **Language promise not delivered:** prevented by requiring all three languages in the demo path.
- **Base44 instability:** mitigated with a recorded backup demo, screenshots, and a tested reset path.
- **Weak traction:** mitigated by publishing June 17 and assigning daily recruitment ownership.
