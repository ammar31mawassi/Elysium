# Elysium Hackathon Execution Plan

Plan date: Friday, June 12, 2026.

Event: Wednesday, June 17 through Monday, June 22, 2026.

## Team

### Ammar

Owns:

- Product decisions and Base44 prompting/build direction.
- Information architecture and UI quality.
- English, Hebrew, and Arabic experience review.
- Social, study, tutor, Peer Helper, tools, guide, and AI experience quality.
- User recruitment, interviews, pitch, and live demo.

### Marwan

Owns:

- Base44 entities and data integrity.
- Authentication, roles, admin permissions, and privacy.
- Cross-entity relationships, AI permissions, and source restrictions.
- Analytics, feedback records, technical QA, and release reliability.

### Shared

- Daily scope decision.
- Testing on real phones.
- Source verification.
- User interviews.
- Final submission and pitch rehearsal.

Use one Base44 workspace. Redeem the hackathon credit code and add Marwan only after verifying that the code/workspace rules permit it. Never share personal login credentials.

## Non-Negotiable Scope

The team builds and demonstrates one connected student day:

> Choose a language -> see a personalized week -> join a study session and social activity -> see both in the calendar -> find a tutor or Peer Helper -> use a student tool -> ask AI what to do next.

Every core module remains part of Elysium, but implementation depth is limited to what supports this reliable connected path.

## Preparation: June 12-16

### Friday, June 12: Decide And Clean The Story

Ammar:

- Approve the competition product sentence.
- Select one connected student-day demo and one shorter fallback demo.
- Select the target user: a BGU student balancing courses, deadlines, study needs, and social belonging.
- Correct the Base44 title, description, and visible product language.
- Freeze the competition navigation.

Marwan:

- Audit Base44 entity permissions and `/admin` access with a normal student account.
- Inventory entities to keep, rename, archive, or ignore.
- Define minimum fields and relationships for StudentProfile, SocialActivity, ActivityParticipant, StudySession, SessionParticipant, CalendarItem, PrivateTutor, TutorRequest, PeerHelper, ToolData, Guide, and Feedback.
- Confirm analytics options and credit costs.

Exit criteria:

- One sentence, one target user, one connected demo, one navigation model.
- Private Tutor and Peer Helper terminology is fixed and reflected in the data model.

### Saturday, June 13: Connected Data And Demo Foundation

Ammar:

- Create realistic demo content: three social activities, three study sessions, three tutors, three Peer Helpers, personal deadlines, one flashcard deck, and six BGU links/guides.
- Write the complete demo content in English, Hebrew, and Arabic.
- Verify official links and label demo people/content honestly.
- Write useful empty, error, and no-recommendation states.

Marwan:

- Implement or configure cross-entity relationships and user ownership.
- Add source, review date, locale, status, university, and owner fields where content requires trust metadata.
- Protect admin operations.
- Configure public, authenticated, owner, tutor/helper, and admin access.
- Add reports, booking requests, and feedback records.

Exit criteria:

- The seeded student can join one social activity and one study session and see both in the calendar.
- Tutors and Peer Helpers are separate entities and screens.
- Student account cannot perform admin actions.

### Sunday, June 14: Core Connected Experience

Ammar:

- Rebuild first use around language, university, courses, interests, and immediate value.
- Turn the empty calendar-first dashboard into a personalized week and next-action home.
- Polish Social, Study, Private Tutor, Peer Helper, Calendar, and Tools navigation.
- Apply the Lovable-inspired compact mobile shell without hiding the hub's core modules.

Marwan:

- Make join/leave and create flows update participants, calendar, and home context.
- Configure the Elysium Base44 agent with least-privilege access to the current user's permitted hub context and published guides.
- Require confirmation before the agent creates or changes records.
- Record recommendation type, language, outcome, and feedback without exposing private content publicly.

Exit criteria:

- The complete connected student-day path works from a clean user session.
- The AI correctly summarizes existing context and routes to at least one useful action.

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
- Test app reset, account creation, join/leave, calendar updates, tutor requests, Peer Helper visibility, tool calculations, broken links, agent failure, and slow responses.
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

- Analyze failed joins, confusing creation flows, missed recommendations, and tool errors.
- Improve home priorities and navigation labels.
- Improve onboarding exits and AI no-result behavior.
- Add the content or filter most requested by real users.
- Start the dated feedback-to-change log.

Target cumulative: 30 users, 18 activated, 10 feedback responses.

### Friday, June 19: Improve Trust And Sharing

- Verify guide sources, public contact consent, tutor data, and activity details.
- Make host, time, location, source, review date, and BGU scope clear where applicable.
- Add or improve deep-link sharing.
- Recruit through additional permitted student groups.
- Test tutor booking/contact and Peer Helper contact separately.

Target cumulative: 45 users, 27 activated, 5 shares.

### Saturday, June 20: Base44 Prize Polish

- Make the Base44 architecture easy to explain: entities, permissions, agent, admin loop, analytics.
- Validate that the agent has the minimum permissions it needs.
- Capture one example of AI turning student context into a useful existing action and one feedback item improving the hub.
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

## First Demo Dataset

Create a small but believable BGU experience:

1. Three future social activities, including football and a non-sports interest.
2. Three study sessions, including library study and collaborative homework.
3. Three private tutors with distinct subjects, languages, and availability.
4. Three Peer Helpers with distinct topics and explicit contact preferences.
5. Three personal or course deadlines for the demo account.
6. One GPA/required-grade scenario with known expected results.
7. One flashcard deck with enough cards to demonstrate review progress.
8. Six source-backed BGU links or guides covering common student needs.
9. One AI prompt that connects the student's deadline, joined session, tool, and human-help options.

Additional guides can cover:

- Reserve-duty or disruption support.
- Exam/grade appeals.
- First-week systems.
- Lecturer email templates.
- Scholarships.
- Accessibility and wellbeing routes.

For health, legal, rights, or crisis content, show official contacts and avoid personalized professional advice.

## User Interview Script

Do not begin by explaining the product.

1. "How do you currently organize deadlines, study with others, social activities, and academic help?"
2. "Use Elysium to join something useful and find what you should do next."
3. "What did you expect to happen after joining it?"
4. "Which part would make you return next week?"
5. "Which language would you actually use for each part?"

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
- Social activity create/join/leave.
- Study session create/join/leave.
- Personal deadline create/edit/complete/delete.
- Joined item appears and disappears correctly in calendar.
- Tutor discovery and booking/contact request.
- Peer Helper opt-in, discovery, consent, and opt-out.
- GPA calculation against known results.
- Flashcard create/review/progress.
- Admin account.
- Slow agent response.
- No approved answer.
- Broken or expired source.

Security checks:

- Student cannot open or call admin operations.
- Student cannot edit another user's profile, saved content, or feedback.
- Tutor or Peer Helper cannot approve or moderate themselves.
- Users cannot reveal contact information that another user did not consent to publish.
- Users cannot edit or remove activities, sessions, deadlines, bookings, or profiles they do not own.
- Unpublished guides do not appear publicly or to the agent.
- Private questions are not exposed in public metrics.

## Submission Assets

Prepare before June 21:

- Product URL.
- Hub02 listing.
- Correct title and tagline.
- 3:2 project thumbnail.
- Light and dark logo assets.
- Three screenshots: personalized home, connected social/study/calendar flow, and AI coordinating tools/people/next actions.
- 45-60 second backup demo video.
- Architecture diagram showing Base44 entities, relationships, agent, permissions, and feedback loop.
- Short product story and problem evidence.
- Built-with list naming Base44 accurately.
- User/activation/feedback metrics with date and definition.
- Three examples of improvements made during the hackathon.

## Stop-Doing Rules

Immediately stop or postpone work when it involves:

- A second product.
- Additional calculators beyond the working core tools.
- Tutor payments; use booking/contact requests for the hackathon.
- Broad multi-university content before BGU works.
- Real-time group chat or direct messaging.
- External calendar synchronization; keep the internal calendar reliable.
- Visual polish on a screen outside the demo path while a core-flow defect remains.
- AI answers that cannot cite approved content.

## Definition Of Competition Ready

Elysium is ready when:

- A new user understands the purpose in five seconds.
- The complete connected hub demo works in all three languages.
- A real user can reach a trustworthy next action in under two minutes.
- No primary screen shown to judges is empty.
- All policy content is sourced and dated.
- Social, Study, Private Tutor, Peer Helper, Calendar, Tools, and AI have a working role in the demo.
- Roles and data permissions pass the test matrix.
- User and feedback metrics are real and defined.
- Ammar and Marwan can each deliver the demo if the other is interrupted.
