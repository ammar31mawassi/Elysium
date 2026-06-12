# Elysium Hackathon Execution Plan

Plan date: Friday, June 12, 2026.

Event: Wednesday, June 17 through Monday, June 22, 2026.

## Team

### Ammar

Owns:

- Product decisions and Base44 prompting/build direction.
- Information architecture and UI quality.
- English, Hebrew, and Arabic experience review.
- Guide format and content quality.
- User recruitment, interviews, pitch, and live demo.

### Marwan

Owns:

- Base44 entities and data integrity.
- Authentication, roles, admin permissions, and privacy.
- AI agent permissions and source restrictions.
- Analytics, feedback records, technical QA, and release reliability.

### Shared

- Daily scope decision.
- Testing on real phones.
- Source verification.
- User interviews.
- Final submission and pitch rehearsal.

Use one Base44 workspace. Redeem the hackathon credit code and add Marwan only after verifying that the code/workspace rules permit it. Never share personal login credentials.

## Non-Negotiable Scope

The team builds and demonstrates one complete path:

> Choose a language -> ask a campus question -> receive a verified BGU answer -> understand the next actions -> open the official source -> reach the correct human route -> give feedback.

No optional feature may delay this path.

## Preparation: June 12-16

### Friday, June 12: Decide And Clean The Story

Ammar:

- Approve the competition product sentence.
- Select two demo questions: one high-impact and one universal fallback.
- Select the target user: BGU first-year or disrupted student.
- Correct the Base44 title, description, and visible product language.
- Freeze the competition navigation.

Marwan:

- Audit Base44 entity permissions and `/admin` access with a normal student account.
- Inventory entities to keep, rename, archive, or ignore.
- Define minimum fields for Guide, Office, Mentor, Feedback, and StudentProfile.
- Confirm analytics options and credit costs.

Exit criteria:

- One sentence, one target user, one demo, one navigation model.
- No open argument about tutors versus mentors or guides versus tools.

### Saturday, June 13: Trustworthy Content Foundation

Ammar:

- Draft the first six BGU guides in the fixed format.
- Produce English, Hebrew, and Arabic versions of the two demo guides.
- Verify every official link and contact.
- Write empty, error, and unsupported-answer copy.

Marwan:

- Implement or configure source, review date, locale, status, university, and owner fields.
- Protect admin operations.
- Configure public versus authenticated access.
- Add stale-content and answer-feedback records.

Exit criteria:

- Six sourced guides; two fully trilingual.
- Student account cannot perform admin actions.

### Sunday, June 14: Core Product Flow

Ammar:

- Rebuild the first-use flow around language and immediate value.
- Replace the calendar-first dashboard.
- Promote Guides and Ask Elysium.
- Apply the Lovable-inspired five-item mobile navigation.

Marwan:

- Configure the Elysium Base44 agent with read-only access to published guides and relevant user context.
- Add source-grounded instructions and unsupported-answer behavior.
- Record question topic, language, answer status, and feedback without exposing private content publicly.

Exit criteria:

- The prepared demo question returns a correct, sourced answer.
- The same path works from a clean user session.

### Monday, June 15: Trilingual And RTL Completion

Ammar:

- Complete all visible core-flow copy in English, Hebrew, and Arabic.
- Test long labels, mixed official terms, numbers, URLs, and punctuation.
- Simplify the logo into a usable app mark/wordmark pair if needed.

Marwan:

- Set and verify locale persistence.
- Set document `lang` and `dir` correctly.
- Verify language switching preserves route, answer, and user state.
- Test permissions in each language path.

Exit criteria:

- No mixed-language accidental copy in the core flow.
- Hebrew and Arabic pass RTL checks on phone and desktop.

### Tuesday, June 16: Reliability And Recruitment Setup

Ammar:

- Recruit the first 15 testers for June 17.
- Prepare QR code, short invitation message, and 3-question interview script.
- Prepare the 90-second pitch draft and screenshots.
- Record a backup demo video.

Marwan:

- Seed non-empty, honest demo content.
- Add event instrumentation and an admin metrics summary.
- Test app reset, account creation, broken links, agent failure, and slow responses.
- Export or document critical data so accidental Base44 changes can be recovered.

Exit criteria:

- Release candidate works on two phones and one desktop.
- Backup demo exists.
- Recruitment list is ready.

## Competition Week: June 17-22

### Wednesday, June 17: Publish First, Then Observe

- Publish to Hub02 as soon as submissions open.
- Send to the first tester cohort.
- Watch five users attempt the core task without instruction.
- Record completion, confusion, language, and feedback.
- Fix only P0 blockers that day.

Target: 15 users, 8 activated, 5 feedback responses.

### Thursday, June 18: Improve Comprehension

- Analyze failed or unclear questions.
- Rewrite weak answers and guide headings.
- Improve onboarding exits and unsupported-answer behavior.
- Add two guides from actual user demand.
- Start the dated feedback-to-change log.

Target cumulative: 30 users, 18 activated, 10 feedback responses.

### Friday, June 19: Improve Trust And Sharing

- Verify every source again.
- Make source, review date, and BGU scope impossible to miss.
- Add or improve deep-link sharing.
- Recruit through additional permitted student groups.
- Test mentor/contact handoff.

Target cumulative: 45 users, 27 activated, 5 shares.

### Saturday, June 20: Base44 Prize Polish

- Make the Base44 architecture easy to explain: entities, permissions, agent, admin loop, analytics.
- Validate that the agent has the minimum permissions it needs.
- Capture one example of a missing question becoming a new approved guide.
- Remove broken or nonessential screens from navigation.

Target cumulative: 60 users, 34 activated, 15 feedback responses.

### Sunday, June 21: Freeze And Rehearse

- Stop feature development by 15:00 unless a release blocker exists.
- Run the full test matrix.
- Prepare a clean demo account and reset state.
- Finalize pitch slides or one-page visual.
- Rehearse the 90-second and 3-minute versions.
- Rehearse offline/slow-network fallback using the recorded demo and screenshots.

Target cumulative: 75 users, 40 activated, 20 feedback responses.

### Monday, June 22: Closing Event

- Verify production before leaving for the Student House.
- Bring laptop charger, phone charger, hotspot, QR code, and backup video.
- Keep the demo account logged in but protect admin access.
- Use the live product first; switch to backup immediately if reliability drops.
- Lead with the student problem and traction, not the feature list.
- Ask organizers to confirm whether main and Base44 prizes can be combined.

## First Content Set

Create 10-12 BGU guides, but make six excellent before adding more:

1. Missed exam or coursework due to reserve duty/disruption.
2. Exam or grade appeal.
3. First-week systems and where to find course information.
4. Writing a clear email to a lecturer or department.
5. Finding scholarships and financial support.
6. Mental-health or urgent support route, with crisis boundaries.
7. Accessibility accommodations.
8. Course registration problem.
9. Dorms, transportation, or campus arrival.
10. Academic Hebrew terminology.
11. English syllabus terminology.
12. Finding an approved peer mentor or student support group.

For health, legal, rights, or crisis content, show official contacts and avoid personalized professional advice.

## User Interview Script

Do not begin by explaining the product.

1. "Think of the last university task that confused you. What was it?"
2. "Use Elysium to find what you would do next."
3. "Did you trust the answer? What made you trust or distrust it?"
4. "What would you do after reading it?"
5. "Which language would you actually use for this task?"

Record behavior and exact confusion points, not only opinions.

## Test Matrix

Run every core scenario on:

- English LTR.
- Hebrew RTL.
- Arabic RTL.
- Android-sized mobile viewport.
- iPhone-sized mobile viewport.
- Desktop.
- New anonymous visitor if public access exists.
- New student account.
- Existing student account.
- Admin account.
- Slow agent response.
- No approved answer.
- Broken or expired source.

Security checks:

- Student cannot open or call admin operations.
- Student cannot edit another user's profile, saved content, or feedback.
- Mentor cannot approve themselves.
- Unpublished guides do not appear publicly or to the agent.
- Private questions are not exposed in public metrics.

## Submission Assets

Prepare before June 21:

- Product URL.
- Hub02 listing.
- Correct title and tagline.
- 3:2 project thumbnail.
- Light and dark logo assets.
- Three screenshots: question, verified answer, admin trust loop.
- 45-60 second backup demo video.
- Architecture diagram showing Base44 entities, agent, permissions, and feedback loop.
- Short product story and problem evidence.
- Built-with list naming Base44 accurately.
- User/activation/feedback metrics with date and definition.
- Three examples of improvements made during the hackathon.

## Stop-Doing Rules

Immediately stop or postpone work when it involves:

- A second product.
- Another generic student calculator.
- Payments or tutor monetization.
- Broad multi-university content before BGU works.
- Full chat or social networking.
- Complex calendar integration.
- Visual polish on a screen outside the demo path while a core-flow defect remains.
- AI answers that cannot cite approved content.

## Definition Of Competition Ready

Elysium is ready when:

- A new user understands the purpose in five seconds.
- The complete demo path works in all three languages.
- A real user can reach a trustworthy next action in under two minutes.
- No primary screen shown to judges is empty.
- All policy content is sourced and dated.
- Roles and data permissions pass the test matrix.
- User and feedback metrics are real and defined.
- Ammar and Marwan can each deliver the demo if the other is interrupted.
