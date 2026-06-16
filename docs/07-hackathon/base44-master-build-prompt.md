# Base44 Master Build Prompt For Elysium

Prepared for Base44 app ID: `6a2ae3a92ace0dad0f92f1a6`.

## Before Sending This Prompt

1. Open the existing Elysium app. Do not create a new Base44 app.
2. Upload these three files to the Base44 builder chat with this prompt:
   - `Logo_LightTheme_Teal.png`
   - `Logo_DarkTheme.png`
   - `high-resolution-color-logo.png`
3. Keep a recoverable version or duplicate of the current app before approving destructive schema changes.
4. Paste the complete prompt below into Base44. Use Default mode when ready for it to implement. Discuss mode may be used first to review the plan without changing the app.
5. Review every permission change Base44 asks you to approve. Do not approve a rule that exposes personal calendars, contact details, booking requests, or private profile data publicly.

Official Base44 documentation confirms that light/dark themes, remembered theme selection, agent tools, entity permissions, AI controls, and uploaded context files are supported. References: [Design and themes](https://docs.base44.com/Building-your-app/Design), [AI agents](https://docs.base44.com/Building-your-app/AI-agents-for-apps), [Data permissions](https://docs.base44.com/Setting-up-your-app/Managing-security-settings), [AI chat modes and controls](https://docs.base44.com/Building-your-app/AI-chat-modes).

## Prompt To Paste Into Base44

```text
You are modifying an EXISTING Base44 application, not creating a new application.

EXISTING APP
- Product name: Elysium
- Base44 app ID: 6a2ae3a92ace0dad0f92f1a6
- Current app title may appear as "Elysium Hub."
- Keep this app, its authentication configuration, its working records, its existing users, and any working behavior unless this specification explicitly replaces that behavior.
- Do not create a second app.
- Do not reset the app.
- Do not delete existing entities or records merely because their names differ from this specification.
- Inspect the existing implementation first. Reuse and extend compatible entities, pages, and components.
- Where an existing entity has a different name, migrate or extend it safely instead of creating duplicate concepts.
- Before any destructive data or schema change, explain exactly what would be removed and ask for approval.
- Do not replace working features with static mockups.
- Do not stop after redesigning screens. Implement the data relationships, permissions, create/join/leave actions, calendar behavior, tutor/helper behavior, tools, and AI behavior described below.

The attached image files are the official Elysium brand assets:
- Logo_LightTheme_Teal.png
- Logo_DarkTheme.png
- high-resolution-color-logo.png

Use these actual uploaded files. Do not generate, redraw, replace, reinterpret, or substitute the Elysium logo. Preserve each image's aspect ratio. Do not crop the circular logo. Use transparent or compatible surfaces so it remains readable.

==================================================
1. PRODUCT DEFINITION: DO NOT CHANGE THE CORE IDEA
==================================================

Elysium is a personalized, trilingual, one-stop student hub for university life.

The exact product sentence is:

"Elysium is a personalized, trilingual student hub for planning university life, meeting people, studying together, finding academic help, and knowing what to do next."

Elysium is NOT only:
- an AI chatbot,
- a guide library,
- a calendar,
- a social network,
- a study-group app,
- a private-tutor marketplace,
- or a set of calculators.

Elysium's value comes from connecting all of those student needs around one profile, one university context, and one personalized week.

The core modules are all required:
1. Personalized Home
2. Social Activities
3. Study Sessions and Study Groups
4. Personal Calendar and Deadlines
5. Private Tutors
6. Peer Helpers
7. Student Tools, including GPA, required-grade calculations, and flashcards
8. Helpful Links and Source-Backed Guides
9. Elysium AI, which coordinates the other modules and answers "What should I do next?"
10. Profile, privacy, moderation, and administration

Do not remove Social, Study, Calendar, Private Tutors, Peer Helpers, GPA tools, Flashcards, Links, or Guides in order to make AI the main product. AI is the connective assistant across the hub. It is not a replacement for the hub.

The product is for students at Israeli universities and colleges. The hackathon pilot is BGU-first, but the architecture must support additional institutions later.

The three first-class interface languages are:
- English
- Hebrew
- Arabic

All three languages must have the same core features. Arabic is not optional or post-MVP.

==================================================
2. CORRECT THE APP METADATA AND PRODUCT IDENTITY
==================================================

Update the Base44 app metadata and any visible metadata to:

Name:
Elysium

Short description:
A personalized trilingual student hub for social life, collaborative study, academic help, planning, tools, and next-step guidance.

Long description:
Elysium brings university life into one connected place. Students can discover and create social activities, join study sessions, manage personal deadlines, find private tutors, contact opted-in peer helpers, use academic tools, open trusted university resources, and ask an AI assistant what to do next. The core experience works in English, Hebrew, and Arabic.

Suggested tagline:
University the way it should feel.

Remove the incorrect current description that presents Elysium as a project-management or hackathon-roadmap platform.

Use the official logo assets consistently:
- Light theme: use Logo_LightTheme_Teal.png where a full logo is appropriate.
- Dark theme: use Logo_DarkTheme.png where a full logo is appropriate.
- App icon, favicon, social preview, or high-resolution contexts: use high-resolution-color-logo.png when it provides the best clarity.

Logo placements:
- Sign-in/public entry: full logo centered above the product sentence.
- Onboarding: small full logo in the top region without consuming too much vertical space.
- Authenticated mobile header: compact logo at approximately 32-40 px, preserving aspect ratio.
- Desktop sidebar/header: compact logo plus ELYSIUM wordmark.
- Profile/About area: full logo and tagline.
- Loading state: logo or simplified existing E mark only if the uploaded logo cannot remain legible at loading size.
- Favicon/app icon: high-resolution color logo.

Do not place the full tagline inside a tiny mobile header. Do not stretch the logo. Do not put the logo on a low-contrast background.

==================================================
3. VISUAL DIRECTION: CAMPUS COMPASS
==================================================

The visual direction is called Campus Compass.

It should feel:
- polished,
- calm,
- useful,
- student-centered,
- modern,
- trustworthy,
- socially welcoming,
- academically credible,
- mobile-first,
- and clearly designed for repeated daily use.

It should not feel:
- like a marketing landing page,
- like a government portal,
- like only a tutor marketplace,
- like only a generic calendar,
- like a ChatGPT clone,
- like a collection of random cards,
- childish,
- excessively corporate,
- or generated from a generic dashboard template.

Use the idea of a compass, path, next step, checkpoint, and campus route subtly. Do not add decorative maps, gradient blobs, floating orbs, or unrelated illustrations.

DESIGN RULES
- Use a restrained, professional visual system.
- Use full-width layout bands for dashboard priorities.
- Use cards for repeated individual records such as activities, sessions, tutors, Peer Helpers, guides, and tool summaries.
- Do not nest cards inside cards.
- Keep card corner radii at 8 px or less unless an existing shared component requires slightly more.
- Use clear borders, spacing, and hierarchy instead of large shadows.
- Use icons from the existing icon library, preferably Lucide icons.
- Do not use emoji as primary navigation icons or primary controls.
- Emoji may appear in user-generated activity categories only if it adds meaning.
- Use familiar icons for add, join, calendar, search, filter, theme, language, edit, delete, report, save, and back.
- Add tooltips for unfamiliar icon-only controls.
- Do not use large hero typography inside the authenticated app.
- Keep headings compact and appropriate for mobile application screens.
- Ensure buttons and labels do not resize the layout when text changes.
- Ensure long Hebrew and Arabic labels wrap cleanly without overlap.
- Use smooth 150-200 ms state and theme transitions. Avoid decorative or slow animation.

COLOR SYSTEM

Light theme:
- App background: warm near-white or soft neutral, approximately #F6F8F7 or #F7F8F6.
- Main surfaces: #FFFFFF.
- Primary text: dark charcoal/green-black, approximately #182321.
- Secondary text: approximately #5F6F6A.
- Primary teal: approximately #0F766E or #0D8077.
- Teal hover/pressed: darker, approximately #0B5F59.
- Information blue: approximately #3B82F6.
- Deadline/warning amber: approximately #D97706.
- Urgent/report red: approximately #D9534F.
- Borders: approximately #DDE5E1.
- Disabled surfaces: neutral gray, not low-contrast teal.

Dark theme:
- App background: near-black charcoal with a green-neutral quality, approximately #0E1413.
- Main surfaces: approximately #151D1B.
- Elevated surfaces: approximately #1B2522.
- Primary text: approximately #F2F7F5.
- Secondary text: approximately #A7B7B1.
- Primary teal: approximately #2DD4BF or another accessible bright teal.
- Information blue: approximately #60A5FA.
- Deadline/warning amber: approximately #F4B942.
- Urgent/report red: approximately #F87171.
- Borders: approximately #2B3935.
- Avoid making the entire dark theme dark navy or monochrome teal.

Use teal as the brand anchor, not as the color of every component. Social, study, deadlines, and guidance may use restrained secondary accents while maintaining one coherent system.

ACCESSIBILITY
- All normal text must meet WCAG AA contrast.
- Interactive controls need visible focus states.
- Minimum touch target should be approximately 44x44 px.
- Do not communicate status by color alone.
- Every input needs a visible label or accessible label.
- Modals and drawers must trap focus and close predictably.
- Confirm destructive actions.
- Loading, empty, error, success, disabled, and offline/failure states must exist.

==================================================
4. LIGHT MODE AND DARK MODE
==================================================

Implement complete light and dark themes across every screen and component.

Requirements:
- Put a Sun/Moon theme toggle in the authenticated header and in Profile Settings.
- On first visit, default to the device/system theme.
- Remember the choice for each visitor locally.
- If the user is signed in, also save the theme preference in StudentProfile so it follows the user when possible.
- Changing themes must happen without a page reload.
- Use a short, smooth transition without flashing a white screen.
- Switch the displayed logo asset with the theme:
  - light mode uses Logo_LightTheme_Teal.png,
  - dark mode uses Logo_DarkTheme.png.
- Make every component theme-aware: navigation, drawers, dialogs, forms, inputs, calendars, charts, tool results, flashcards, AI chat, empty states, toasts, skeletons, tables, and admin screens.
- Do not implement a dark theme that only changes the page background while leaving unreadable white cards.
- Check contrast for teal text, muted text, borders, disabled states, error messages, and calendar event colors in both themes.

==================================================
5. ENGLISH, HEBREW, ARABIC, RTL, AND LOCALIZATION
==================================================

The current app incorrectly mixes Arabic headings with English navigation and only offers Hebrew and English in language settings. Replace this with a real localization system.

SUPPORTED LOCALES
- English: `en`, left-to-right.
- Hebrew: `he`, right-to-left.
- Arabic: `ar`, right-to-left.

GLOBAL REQUIREMENTS
- Ask for language on the first onboarding screen.
- Add a language selector in the authenticated header and Profile Settings.
- Display language choices as text: English, עברית, العربية. Do not rely only on flags.
- Store the user's selected locale in StudentProfile.
- Remember it locally before authentication if needed.
- Set the root document `lang` and `dir` correctly whenever locale changes.
- English must set `lang="en"` and `dir="ltr"`.
- Hebrew must set `lang="he"` and `dir="rtl"`.
- Arabic must set `lang="ar"` and `dir="rtl"`.
- Use logical start/end spacing, alignment, borders, and positioning.
- Mirror directional arrows and chevrons when appropriate.
- Do not mirror universally recognizable non-directional icons.
- Keep URLs, phone numbers, course codes, grades, times, and mixed-language terms readable with correct bidirectional handling.
- Language switching must preserve the current route, modal, selected tab, form values where safe, and user context.
- Never hide features because a language is selected.
- Never leave accidental English strings in Hebrew or Arabic core flows.
- Do not auto-translate user-generated posts without labeling the translation. Show the original content language and optionally offer an AI translation later.
- Dates, day names, numbers, and calendar labels should follow the selected locale while preserving course codes and grades correctly.

TYPOGRAPHY
- English: Inter or a clean system UI sans-serif.
- Hebrew: Noto Sans Hebrew or another high-quality Hebrew UI font.
- Arabic: Tajawal or Noto Sans Arabic.
- Use language-appropriate line height.
- Do not shrink Arabic or Hebrew text merely to fit an English-designed button.

CORE NAVIGATION LABELS SHOULD BE NATIVELY LOCALIZED
Use professionally reviewed translations. Initial labels may follow this structure:
- Home / בית / الرئيسية
- Discover or Community / קהילה / المجتمع
- Add / הוספה / إضافة
- Calendar / יומן / التقويم
- Tools / כלים / أدوات
- Social / חברתי / اجتماعي
- Study / לימודים / دراسة
- Private Tutors / מורים פרטיים / مدرّسون خصوصيون
- Peer Helpers / סטודנטים מסייעים / طلاب مساعدين
- Profile / פרופיל / الملف الشخصي
- Ask Elysium / שאלו את Elysium / اسأل Elysium

Do not blindly use literal machine translations if a phrase is unnatural. Keep all copy in a central translation structure so Ammar can revise wording later.

==================================================
6. RESPONSIVE APP SHELL AND NAVIGATION
==================================================

Build the actual usable application as the first authenticated screen. Do not create a marketing landing page as the main experience.

MOBILE NAVIGATION
Use a stable five-item bottom navigation inspired by the clean setup of the existing Lovable Dalili reference, but tailored to Elysium:

1. Home
2. Discover
3. Raised Add button in the center
4. Calendar
5. Tools

The raised Add button opens a clear bottom sheet with exactly these actions:
- Create Social Activity
- Create Study Session
- Add Personal Deadline
- Ask Elysium

Do not make the center button perform a different hidden action depending on the current page. The bottom sheet makes its meaning predictable.

DISCOVER PAGE TABS
Inside Discover, use a segmented tab control:
- Social
- Study
- Private Tutors
- Peer Helpers

Preserve each tab's filter/search state while the user switches between tabs during the session.

PROFILE ACCESS
- Put the profile avatar in the top header.
- Tapping it opens Profile.
- Put language and theme controls in the header where space permits; otherwise place compact icons in the header and full controls in Profile Settings.

DESKTOP/TABLET
- Replace the bottom navigation with a stable left sidebar at wider widths.
- Keep the same information architecture and labels.
- Show the logo plus ELYSIUM wordmark in the sidebar.
- Do not stretch mobile cards across the entire desktop width.
- Use a useful maximum content width and responsive grid for discovery lists.

HEADER
- Compact logo.
- Current page title or contextual greeting.
- Language control.
- Theme toggle.
- Notifications only if notifications actually work; do not show a dead notification icon.
- Profile avatar.

==================================================
7. ONBOARDING AND PERSONALIZATION
==================================================

Rebuild onboarding so it is short, useful, fully trilingual, and immediately affects the home experience.

Do not ask all questions in one long form.

STEP 1: LANGUAGE
- English, Hebrew, Arabic.
- Apply locale and direction immediately.

STEP 2: UNIVERSITY CONTEXT
- University/college.
- Campus if relevant.
- Faculty/department.
- Field of study.
- Academic year.
- For the hackathon, make Ben-Gurion University easy to select and ensure it has useful seeded data.

STEP 3: COURSES AND INTERESTS
- Current courses or subject interests.
- Social interests/hobbies such as football, basketball, running, gaming, music, films, coffee, volunteering, and technology.
- Let the student select multiple chips.
- Allow skipping and editing later.

STEP 4: HELP AND PREFERENCES
- Preferred study/social languages.
- Help needs such as study partners, private tutoring, peer questions, deadlines, scholarships, university systems, academic terms, and social belonging.
- Optional commute/housing context.

FINISH
- Save StudentProfile.
- Take the student directly to a populated personalized Home.
- Show a concise success message, not a marketing interstitial.
- If required fields are missing, explain exactly what is needed.

Existing users must not be forced to lose their profile. If new fields are missing, use a lightweight "Complete your profile" prompt rather than resetting onboarding.

==================================================
8. PERSONALIZED HOME: THE CONNECTED HUB
==================================================

The Home page must communicate the entire product in a coherent way without showing every feature as an equal tile.

The first viewport should contain:
1. A compact greeting using the student's preferred name.
2. Their university/faculty context.
3. A "Your next step" full-width band.
4. A compact Ask Elysium field or button.
5. The next deadline, joined activity, joined study session, or tutor request.

HOME SECTIONS IN PRIORITY ORDER

A. YOUR NEXT STEP
- Generate a deterministic useful next action from existing data before relying on AI.
- Examples:
  - An assignment deadline is within 48 hours: show it first.
  - A joined study session starts today: show time, location, and open details.
  - A joined activity starts soon: show it.
  - A tutor request is pending or accepted: show status.
  - The calendar is empty: recommend adding a deadline or joining a relevant session/activity.
- Add an optional AI-enhanced explanation, but never leave this section blank if AI fails.

B. TODAY / UPCOMING
- A compact timeline, not a giant empty calendar grid.
- Combine personal deadlines, social activities, study sessions, and tutor requests/bookings.
- Use clear type badges and icons.
- Show a useful empty state with Add Deadline, Find Study Session, and Find Activity actions.

C. RECOMMENDED FOR YOU
- One social activity based on interests, university, language, date, and capacity.
- One study session based on courses/subjects, university, language, and date.
- Explain relevance briefly, for example "Because you selected football" or "Matches your Data Structures course."
- Do not claim sophisticated AI personalization if it is only a simple filter. Honest rule-based personalization is acceptable.

D. ACADEMIC HELP
- One matching Private Tutor.
- One matching Peer Helper.
- Clearly label the difference:
  - Private Tutor: paid or arranged subject teaching.
  - Peer Helper: opted-in student willing to answer questions.

E. QUICK TOOLS
- GPA Calculator.
- Grade Needed.
- Flashcards.
- Helpful Links/Guides.
- Keep this compact.

F. BGU/UNIVERSITY NOTICE
- Optional trusted current notice or useful guide.
- Show source and last reviewed date.
- Never fabricate a university deadline or policy.

Do not show "Nothing this week" as the main Home experience. Empty states must lead to action.

==================================================
9. SOCIAL ACTIVITIES
==================================================

Purpose: help students find and create lightweight activities with people who share interests.

Examples:
- Football at the campus sports area.
- Basketball.
- Running.
- Gym session.
- Board games.
- Gaming.
- Music or film meetup.
- Coffee or lunch.
- Volunteering.
- Campus event attendance.

SOCIAL LIST
- Search by title or interest.
- Filter by date, category, university/campus, language, joined/not joined, and availability.
- Sort by soonest, recommended, and newly created.
- Cards show title, category, host, date/time, location, language, participant count/capacity, and Join state.
- Make the full card open details; keep Join/Leave as a stable explicit action.
- Show "Hosted by you" for the current user's activities.
- Do not display expired activities in the default upcoming view.

CREATE SOCIAL ACTIVITY
Required fields:
- Title.
- Category.
- Description.
- University/campus.
- Start date and time.
- End time or approximate duration.
- Location.
- Capacity, optional.
- Primary language and optional additional languages.
- Visibility: university members or public browsing, according to safe permissions.
- Participation notes, optional.

Behavior:
- Creator automatically becomes host and participant.
- Prevent impossible dates and negative/zero capacities.
- After creation, show the detail page and add the activity to the host's calendar.
- Allow host to edit, cancel, or delete according to permissions.
- Notify or visibly communicate cancellation to joined users if notifications are available; otherwise show canceled status in calendars.

JOIN/LEAVE
- Joining creates a participant record for the current user.
- Prevent duplicate participation.
- Enforce capacity.
- Add/update the linked CalendarItem.
- Leaving removes or marks the participant record appropriately and removes/updates the linked CalendarItem.
- Host cannot accidentally leave their own event without transferring ownership or canceling.

SOCIAL SAFETY
- Add Report action.
- Show host identity appropriate to the user's privacy settings.
- Do not expose participant phone numbers.
- Do not add real-time chat in this version.

==================================================
10. STUDY SESSIONS AND STUDY GROUPS
==================================================

Study is not the same as Social. Keep separate data, forms, filters, labels, and expectations.

STUDY SESSION TYPES
- Quiet library study.
- Study together for a course.
- Collaborative homework/problem solving.
- Exam preparation.
- Study marathon.
- Online study session.
- Recurring group meeting.

STUDY LIST
- Search by course, course code, subject, or title.
- Filter by university, faculty, course/subject, session type, date, language, location/online, joined/not joined, and capacity.
- Cards show title, course/subject, session type, date/time, location, language, host, and participant count.
- Clearly distinguish quiet study from collaborative homework.

CREATE STUDY SESSION
Required fields:
- Title.
- Course/subject.
- Course code, optional.
- Session type.
- Description or goal.
- University/campus.
- Date and start/end time.
- Location or online link.
- Preferred language/languages.
- Capacity, optional.
- Collaboration expectations, for example quiet focus, discuss questions, or solve homework together.
- Recurrence only if the existing Base44 implementation can support it reliably; otherwise use a single session for the hackathon.

Behavior:
- Creator is host and participant.
- Joining and leaving follow the same integrity rules as Social.
- Joined sessions automatically appear in Home and Calendar.
- Prevent duplicate joins and capacity overflow.
- Allow host edit/cancel with visible canceled state.

STUDY GROUPS
- Preserve existing persistent Study Group functionality if it works.
- A Study Group may contain multiple dated Study Sessions.
- Do not require every session to belong to a group.
- For the hackathon, a working session flow is more important than advanced group administration.

ACADEMIC INTEGRITY
- Do not position Elysium as completing graded homework for students.
- Collaboration descriptions should support studying, discussion, and learning.
- Add report/moderation support.

==================================================
11. PERSONAL CALENDAR AND DEADLINES
==================================================

The calendar is a core personalization feature.

The calendar combines:
- Personal deadlines and reminders created by the student.
- Joined Social Activities.
- Joined Study Sessions.
- Tutor booking/request dates when known.
- Trusted university deadlines when available.

CALENDAR VIEWS
- Agenda/list view should be the best mobile default.
- Provide day, week, and month views if the existing implementation supports them reliably.
- Preserve the selected view during the session.
- Use locale-aware dates and week direction.
- Use stable colors and icons for each item type, with labels so color is not the only distinction.

PERSONAL DEADLINE FORM
- Title.
- Course/category, optional.
- Due date and time.
- All-day option.
- Notes.
- Priority: normal, important, urgent.
- Reminder setting if reliable.
- Completion state.

CALENDAR BEHAVIOR
- Student can create, edit, complete, and delete only their own personal items.
- Linked items created from joined activities/sessions must reference their source record.
- Do not create duplicate calendar items when a user presses Join twice or revisits a page.
- If the source time or status changes, update the linked calendar item.
- If the student leaves or the source is canceled, remove or clearly mark the linked calendar item.
- Tapping a linked item opens the source detail page.
- Tapping a personal deadline opens its edit/detail view.
- Home uses the same calendar data; do not maintain a separate contradictory list.

==================================================
12. PRIVATE TUTORS
==================================================

Private Tutors teach subjects or courses. This is an intentional core feature. Do not rename all tutors to mentors or remove the tutor marketplace behavior.

However, Private Tutors are NOT the same as Peer Helpers.

PRIVATE TUTOR PROFILE
- User/account owner.
- Display name.
- University/faculty familiarity.
- Subjects and courses taught.
- Course codes, optional.
- Teaching languages.
- Experience/short bio.
- Online, in-person, or both.
- Availability summary.
- Price amount and unit, or "Contact for price."
- Public contact method only with explicit consent, or use an in-app booking/contact request.
- Active/hidden status.
- Moderation/report status.
- Average rating and count only if based on real stored ratings.

TUTOR DISCOVERY
- Search by subject, course, course code, or tutor name.
- Filter by university familiarity, language, online/in-person, availability, and price where available.
- Sort by relevance, availability, and real rating count if trustworthy.
- Do not sort tutors with zero ratings as if they have five stars.
- Clearly label paid/private tutoring.

TUTOR REQUEST
- Student selects subject/course.
- Student proposes preferred date/time or general availability.
- Student writes a short message.
- Tutor sees requester, subject, message, and status.
- Status: pending, accepted, declined, canceled, completed if completion is supported.
- Only requester and selected tutor can see the private request, plus authorized admin access only if operationally necessary.
- If accepted with a date/time, show it in both users' relevant calendar context if permissions and data model support that safely.
- Do not implement payment during this hackathon version.

TUTOR PROFILE OPT-IN
- From Profile, a student may choose "Offer private tutoring."
- This opens a separate tutor setup form.
- Make clear which fields become public.
- Require explicit agreement before publishing contact details.
- Allow immediate hide/deactivate.

RATINGS
- Preserve existing rating functionality only if it works and follows permissions.
- Never create fake ratings or reviews and present them as real.
- Demo tutors may be labeled Demo and have no ratings.
- A future verified-booking rule may gate ratings; do not pretend it exists if it is not implemented.

==================================================
13. PEER HELPERS: A SEPARATE ROLE
==================================================

Create a separate feature called Peer Helpers.

A Peer Helper is an opted-in student willing to answer student-life or academic-navigation questions. A Peer Helper is not necessarily a tutor, is not necessarily paid, and is not an official university representative.

Examples of Peer Helper topics:
- First-year questions.
- Course-registration experience.
- Campus navigation.
- Finding university systems and offices.
- Study habits.
- Social integration.
- Language transition.
- Dorm or commute experience.
- Faculty-specific student experience.

PEER HELPER PROFILE
- Owner user ID.
- Display name.
- University.
- Faculty/field.
- Academic year.
- Languages.
- Help topics.
- Short bio.
- Availability indicator.
- Preferred contact method.
- Contact value only if explicitly consented for public display.
- Visible/hidden status.
- Consent timestamp or consent state.
- Moderation/report status.

PEER HELPER OPT-IN
- Put "Help other students" in Profile.
- Explain exactly what will be visible.
- Require the user to actively enable the profile.
- Do not automatically turn every tutor into a Peer Helper.
- Do not automatically turn every student into a Peer Helper.
- Allow editing or disabling at any time.
- Disabling must immediately remove the public listing while preserving private account data appropriately.

PEER HELPER DISCOVERY
- Search/filter by university, faculty/field, academic year, language, help topic, and availability.
- Cards must say Peer Helper, not Tutor.
- Do not show price or tutor ratings.
- Show a clear disclaimer that Peer Helpers share personal student experience and are not official university authorities.
- Contact must follow the helper's selected method and consent.

==================================================
14. TOOLS, HELPFUL LINKS, AND GUIDES
==================================================

Tools are a core module, not an afterthought.

Organize the Tools page into clear sections with compact tool rows or tiles. Do not put everything inside one long accordion.

SECTION A: CALCULATORS

GPA Calculator:
- Allow multiple courses.
- Fields: course name, credits/weight, grade.
- Calculate weighted GPA/average correctly.
- Validate grades and weights.
- Explain the formula briefly.
- Allow reset.
- Save recent calculation for the signed-in user if existing data supports it.
- Test with known expected results.

Grade Needed Calculator:
- Fields: current weighted score or completed components, remaining component weight, desired final grade.
- Return the required remaining grade.
- Handle impossible results over 100 and already-achieved targets clearly.
- Validate that weights are meaningful and do not exceed the allowed total.
- Avoid giving a result when inputs are invalid.

SECTION B: FLASHCARDS

- Keep and improve existing flashcard functionality.
- Create deck.
- Edit deck name.
- Add, edit, and remove front/back cards.
- Study mode with card flip.
- Previous/next controls.
- Show progress such as 3 of 12.
- Optionally mark known/needs review if reliable.
- Decks and cards are private to their owner unless explicit sharing is added later.
- Ensure RTL card text displays correctly.

SECTION C: FIND A PERSON

- Quick links to Private Tutors and Peer Helpers.
- Explain the difference in one short line.
- Do not merge their records.

SECTION D: HELPFUL LINKS

- University-specific links.
- Categories such as academic calendar, student portal, Moodle/course system, scholarships, student union, accessibility, wellbeing, reserve-duty support, international support, and language support.
- Each link needs title, university, category, locale or language relevance, official URL, and last-reviewed date.
- Open external links safely.
- Never fabricate an official URL.

SECTION E: GUIDES

Guide format:
- Situation/problem answered.
- Why it matters.
- Plain-language explanation in the selected interface language.
- Important official terms in their original language with useful equivalents.
- Step-by-step actions.
- Common mistake.
- Official source link.
- University scope.
- Last-reviewed date.
- Related tutor, Peer Helper, tool, or official contact.
- Report outdated information.

The current guide UI hides source information. Make the official source and review date visible in the detail view.

==================================================
15. ELYSIUM AI: CONNECTIVE ASSISTANT, NOT REPLACEMENT
==================================================

Create or configure an in-app Base44 agent called Elysium Assistant.

AGENT PURPOSE
Help the current student understand what is next and navigate Elysium's existing social, study, calendar, tutor, Peer Helper, tools, links, and guide data.

PRIMARY USER QUESTIONS
- "What should I focus on next?"
- "Do I have anything due soon?"
- "Is anyone studying Data Structures today?"
- "Find me a football activity this week."
- "Find a tutor who teaches Calculus in Arabic."
- "Who can answer a first-year registration question?"
- "Which tool should I use to calculate the grade I need?"
- "Where is the official BGU information about this policy?"

AGENT DATA ACCESS
Start with least privilege and primarily read-only access.

The agent may read:
- The current user's StudentProfile fields needed for personalization.
- The current user's own CalendarItems.
- The current user's own participant memberships and tutor requests.
- Public/upcoming Social Activities.
- Public/upcoming Study Sessions and public Study Groups.
- Public active Private Tutor profile fields.
- Public visible Peer Helper fields that the helper consented to expose.
- Tool names and navigation destinations.
- Published Helpful Links and Guides.
- University and faculty metadata.

The agent must not read:
- Another user's private calendar.
- Private profile fields not needed for the task.
- Another student's private tutor request.
- Hidden tutor/helper profiles.
- Contact information that was not explicitly consented for display.
- Unpublished guides or private admin notes unless an admin-specific agent is created separately.

WRITE ACTIONS
For the first reliable version, the agent should recommend and deep-link to actions rather than silently changing data.

If write tools are added later:
- The agent must summarize the proposed action.
- Ask the user for explicit confirmation.
- Confirm exact date, time, record, and visibility.
- Only then create or update the current user's permitted record.
- Never join an activity, create a public post, send a tutor request, expose contact details, or delete a calendar item without explicit confirmation.

AGENT RESPONSE FORMAT
Keep responses short and actionable.

Preferred structure:
- Now: the most urgent item.
- Next: one useful academic or social action.
- Help: a relevant tutor, Peer Helper, tool, or guide.
- Action buttons/deep links where possible.

Do not return long generic essays.

POLICY AND TRUST RULES
- For university rules, rights, deadlines, scholarships, health, accessibility, or official procedures, answer only from published approved guides/links or clearly identified official sources.
- Cite the source and last-reviewed date.
- If no trusted answer exists, say so and route to an official office, guide request, or Peer Helper as appropriate.
- Never invent a BGU policy, deadline, phone number, email, office, or URL.
- Peer Helpers provide personal experience, not official decisions.
- Private Tutors provide subject teaching, not official policy advice.
- For urgent health or safety concerns, direct the user to appropriate official/emergency support rather than attempting diagnosis or crisis counseling.
- Do not assist academic dishonesty or offer to complete graded work.

LANGUAGE
- Reply in the user's selected interface language unless they explicitly ask for another.
- Preserve official terms in their source language when helpful and explain them.
- Support English, Hebrew, and Arabic.
- Ensure the AI chat layout respects RTL/LTR.

FAILURE BEHAVIOR
- If AI is unavailable, Home and the rest of the app must still work.
- Show a useful retry state.
- Never make Home depend entirely on a live AI call.
- Use deterministic rule-based next actions as fallback.

FEEDBACK
- After an AI answer, ask one compact question: "Was this useful?"
- Store helpful/not helpful, optional reason, language, recommendation type, and date.
- Do not expose private prompt content in public analytics.

==================================================
16. PROFILE, SETTINGS, AND USER CONTROL
==================================================

PROFILE PAGE
- Profile photo/avatar.
- Name.
- University, faculty, field, academic year.
- Courses/subjects.
- Interests/hobbies.
- Preferred locale.
- Study/social languages.
- Theme.
- Help preferences.

CAPABILITY SECTIONS
Keep these separate:
- Offer Private Tutoring.
- Help Other Students as a Peer Helper.

Each section must explain:
- What the role means.
- What information becomes public.
- Current visibility/status.
- Edit action.
- Disable/hide action.

PRIVACY
- Let users control public contact sharing.
- Do not show private phone numbers by default.
- Show report/privacy/help links.
- Provide sign out.
- If account deletion is not supported, do not show a fake working button.

==================================================
17. DATA MODEL: REUSE BEFORE CREATING
==================================================

First inspect all existing Base44 entities and fields. Existing source indicates there may already be entities such as StudentProfile, University, Faculty, SocialEvent, StudySession, StudyGroup, StudyGroupMember, PrivateTeacher, TeacherRating, Guide, SavedGuide, Feedback, and flashcard-related data.

Reuse them where they represent the same concept.

Suggested safe mapping:
- Existing SocialEvent -> use/extend as SocialActivity if compatible. Avoid duplicate SocialEvent and SocialActivity concepts unless migration is necessary.
- Existing StudySession -> extend and keep.
- Existing StudyGroup and StudyGroupMember -> preserve and connect to sessions if useful.
- Existing PrivateTeacher -> keep as the Private Tutor entity or safely rename only if Base44 can preserve records and references.
- Existing TeacherRating -> keep only for real tutor ratings.
- Existing Guide and SavedGuide -> extend with source and locale metadata.
- Existing StudentProfile -> extend, never replace.

Required conceptual data sets:

StudentProfile
- user_id/owner
- preferred_name
- university_id
- campus_id optional
- faculty_id
- field_of_study
- academic_year
- preferred_locale: en/he/ar
- language_preferences array
- courses/subjects array
- interests array
- help_needs array
- commute_or_housing optional
- theme_preference: system/light/dark
- onboarding_complete
- created_at/updated_at

Social Activity or existing SocialEvent
- host_user_id
- university_id/campus_id
- title
- category
- description
- starts_at
- ends_at
- location
- capacity optional
- primary_language
- additional_languages array
- visibility
- status: active/canceled/completed
- created_at/updated_at

Social Activity Participant
- activity_id
- user_id
- role: host/participant
- status: joined/left
- joined_at
- unique activity_id + user_id behavior

StudySession
- host_user_id
- optional study_group_id
- university_id/campus_id
- title
- course_or_subject
- course_code optional
- session_type
- description_or_goal
- starts_at
- ends_at
- location
- online_url optional
- preferred_languages array
- collaboration_expectations
- capacity optional
- status
- created_at/updated_at

Study Session Participant
- session_id
- user_id
- role
- status
- joined_at
- unique session_id + user_id behavior

CalendarItem
- owner_user_id
- source_type: personal/social_activity/study_session/tutor_request/university_deadline
- source_id optional
- title
- starts_at/due_at
- ends_at optional
- all_day
- notes optional
- priority
- completed
- status
- reminder option if supported
- created_at/updated_at
- prevent duplicate owner + source_type + source_id records

Private Tutor or existing PrivateTeacher
- owner_user_id
- display_name
- university_id/faculty familiarity
- subjects array
- course_codes array
- languages array
- bio
- experience
- teaching_mode
- availability summary or structured availability
- price_amount optional
- price_unit optional
- contact_for_price boolean
- contact_method
- contact_value only with consent
- contact_consent boolean
- is_active/is_visible
- moderation_status
- rating_avg and rating_count only from real ratings

TutorRequest
- student_user_id
- tutor_id
- subject/course
- preferred_datetime optional
- message
- status: pending/accepted/declined/canceled/completed
- agreed_datetime optional
- created_at/updated_at

PeerHelper
- owner_user_id
- display_name
- university_id
- faculty_id/field
- academic_year
- languages array
- help_topics array
- bio
- availability
- contact_method
- contact_value only with consent
- contact_consent boolean
- is_visible
- moderation_status
- created_at/updated_at

Guide
- title/content strategy that supports en/he/ar cleanly
- translation group or explicit localized fields
- category
- situation
- explanation
- steps
- official terms/equivalents
- common mistake
- university_id/scope
- source_url
- source_title optional
- last_reviewed_date
- content_owner/reviewer
- is_published
- created_at/updated_at

HelpfulLink
- title localized or locale field
- university_id
- category
- official_url
- description
- locale relevance
- last_reviewed_date
- is_published

FlashcardDeck
- owner_user_id
- name
- subject/course optional
- language
- created_at/updated_at

Flashcard
- deck_id
- owner_user_id
- front
- back
- order/index
- review status optional

Report
- reporter_user_id
- target_type
- target_id
- reason
- details optional
- status
- created_at

AIRecommendationFeedback or Feedback
- user_id
- language
- context_type
- recommendation_type
- helpful boolean
- reason optional
- private prompt storage only if necessary and permission-safe
- created_at

UsageEvent, only if Base44 analytics needs an app entity
- user_id optional/pseudonymous where appropriate
- event_name
- entity_type optional
- entity_id optional
- locale
- created_at
- metadata with no secrets or unnecessary private content

Do not add fields with ambiguous types. Avoid flexible objects unless their schema is defined. Ensure existing and new record values match entity field types so published pages do not fail with schema errors.

==================================================
18. AUTHENTICATION, ACCESS, PERMISSIONS, AND CONSENT
==================================================

App visibility:
- Allow safe public browsing of public upcoming activities, public study sessions, public active tutor profiles, visible Peer Helpers, published links, and published guides if Base44 supports this cleanly.
- Require authentication to join, create, save, personalize, add deadlines, create flashcards, opt into public roles, request tutoring, report, or access personal calendar data.

ROLES
- Student is the normal authenticated role.
- Admin is a privileged role.
- Private Tutor and Peer Helper should preferably be profile capabilities, because one user may be a student, tutor, and Peer Helper simultaneously.

PERMISSION RULES
- StudentProfile private fields: owner read/write, admin only where operationally justified.
- Public profile summary: expose only deliberately public fields.
- Personal CalendarItems: owner only.
- Social/Study host: may edit/cancel their own record.
- Other students: may read public active records and manage only their own participant membership.
- Participant records: user can manage their own; host may view an appropriate participant list but not unrelated private profile fields.
- Private Tutor: owner edits own profile; public reads only active/visible public fields.
- TutorRequest: requester and selected tutor only, plus narrowly authorized admin access if required.
- PeerHelper: owner edits and controls visibility; public reads only visible consented fields.
- FlashcardDeck/Flashcard: owner only unless sharing is explicitly implemented later.
- Published Guides/HelpfulLinks: public read; admin create/update/publish.
- Reports: reporter can create; admin can review; reported user should not gain access to reporter private details.
- Admin data and routes: admin only.

ADMIN ROUTE
- The current client appears to expose `/admin` to authenticated users without a clear client-side role check.
- Hide admin navigation from non-admin users.
- Guard the route.
- More importantly, enforce server/entity permissions so manually entering `/admin` or calling an entity API cannot expose or modify admin data.
- Test with a normal student account.

CONSENT
- Do not expose tutor or Peer Helper phone/WhatsApp details unless that user explicitly agreed.
- Record or represent consent state.
- Let the user revoke visibility immediately.
- Do not treat choosing a role as consent to publish every profile field.

==================================================
19. ADMIN AND MODERATION
==================================================

Keep the admin experience utilitarian and protected.

Admin sections:
- Overview/metrics.
- Reports.
- Social Activities.
- Study Sessions/Groups.
- Private Tutors.
- Peer Helpers.
- Guides.
- Helpful Links.
- Universities/Faculties.
- Feedback/unmet needs.

Admin capabilities:
- Review reports.
- Hide, suspend, or restore inappropriate public listings according to defined rules.
- Review tutor and Peer Helper concerns.
- Publish/unpublish guides and links.
- See source and review-date completeness.
- See missing English/Hebrew/Arabic content.
- See high-level real usage counts.

Do not show sensitive private student questions, calendars, or contact values in broad admin dashboards. Only expose data needed for a defined moderation task.

==================================================
20. DEMO DATA AND NON-EMPTY STATES
==================================================

The current primary screens are empty. Seed a small, coherent demonstration data set for the hackathon, but label fictional people or records as Demo/Test so they are not presented as real traction.

Use dates during the June 17-22, 2026 hackathon when appropriate, or use dates relative to the current demo day if the app will be tested later.

Suggested Social Activities:
- "Evening Football at BGU" - multilingual welcome, capacity 14.
- "Board Games Near the Student House" - capacity 10.
- "Coffee Meetup for First-Year Students" - capacity 8.

Suggested Study Sessions:
- "Data Structures Homework Session" - collaborative, library, English/Hebrew/Arabic welcome.
- "Quiet CS Study at the Library" - quiet focus.
- "Calculus Exam Preparation" - problem discussion.

Suggested Private Tutors:
- Three clearly labeled Demo Tutor profiles with distinct subjects, languages, modes, and availability.
- Do not seed fake ratings or fake completed bookings.

Suggested Peer Helpers:
- Ammar M. (Demo) - first-year navigation, Arabic/English/Hebrew as accurate.
- Marwan (Demo) - technical/course experience using accurate information.
- One additional generic Demo Peer Helper only if clearly fictional/demo.
- Use no real phone number without consent.

Suggested Calendar Items for the demo student:
- Data Structures assignment deadline.
- Statistics or Calculus quiz deadline.
- One personal reminder.

Suggested Flashcard Deck:
- Data Structures concepts or Academic Hebrew terms.
- At least 8-12 cards so study progress is visible.

Suggested Guides/Links:
- Six BGU-specific categories such as academic calendar, student portal, scholarships, accessibility, wellbeing, and reserve-duty support.
- Use only verified official URLs. If the URL is unknown, create the content field but do not invent the URL.

DEMO INTEGRITY
- Demo records should demonstrate functionality.
- Real user counts, joins, ratings, and feedback must be reported separately from demo records.
- Never claim seeded demo participation as traction.

==================================================
21. ANALYTICS AND HACKATHON SUCCESS METRICS
==================================================

Track meaningful product actions without collecting unnecessary private information.

Events:
- onboarding_started
- onboarding_completed
- locale_changed
- theme_changed
- social_activity_viewed
- social_activity_created
- social_activity_joined
- social_activity_left
- study_session_viewed
- study_session_created
- study_session_joined
- study_session_left
- personal_deadline_created
- personal_deadline_completed
- tutor_profile_viewed
- tutor_request_created
- peer_helper_profile_viewed
- peer_helper_contact_action
- gpa_calculation_completed
- grade_needed_calculation_completed
- flashcard_deck_created
- flashcard_review_completed
- guide_viewed
- official_source_clicked
- ai_question_submitted
- ai_recommendation_opened
- ai_feedback_submitted
- report_submitted

Admin metrics should show:
- Real registered users.
- Onboarding completion.
- Activated users, defined as completing at least one meaningful action.
- Activity/session creation and joins.
- Tutor requests.
- Tool usage.
- AI helpful/not-helpful ratio.
- Feedback count.
- Usage by locale.

Do not include demo records in real traction metrics when they can be distinguished.

==================================================
22. EMPTY, LOADING, ERROR, AND EDGE STATES
==================================================

Implement polished states for every primary feature.

HOME EMPTY STATE
- "Your week is open. Add a deadline or find something to join."
- Buttons: Add Deadline, Find Study Session, Find Activity.

SOCIAL EMPTY STATE
- Suggest clearing filters or creating an activity.

STUDY EMPTY STATE
- Suggest clearing filters, changing course, or creating a session.

TUTOR EMPTY STATE
- Suggest changing subject/language filters or becoming a tutor.

PEER HELPER EMPTY STATE
- Suggest changing filters or inviting students to opt in.

CALENDAR EMPTY STATE
- Do not show only "Nothing this week."
- Explain the calendar will include personal deadlines and joined Elysium items.

AI ERROR STATE
- Preserve the rest of the page.
- Show retry and relevant direct navigation actions.

NETWORK/ACTION ERRORS
- A failed Join must not visually show joined.
- A failed Leave must not remove the item locally.
- A failed create/request must preserve form data where safe.
- Show concise actionable messages.

CAPACITY
- Prevent joining full activities/sessions.
- Handle two users attempting the last spot safely if Base44 supports server validation.

DATES
- Prevent end before start.
- Handle canceled and expired records.
- Use consistent time zones appropriate to Israel.

==================================================
23. REQUIRED END-TO-END USER JOURNEYS
==================================================

JOURNEY A: FIRST-TIME STUDENT
1. Open app.
2. See official Elysium logo.
3. Select Arabic, Hebrew, or English.
4. Complete short onboarding.
5. Reach personalized Home with non-empty useful content.

JOURNEY B: SOCIAL ACTIVITY
1. Discover a football activity.
2. Open details.
3. Join.
4. Participant count changes.
5. Activity appears on Home and Calendar.
6. Leave.
7. Calendar and participant state update correctly.

JOURNEY C: STUDY SESSION
1. Search Data Structures.
2. Open a study session.
3. Join.
4. Session appears on Home and Calendar.
5. The student's course/interests influence future recommendations.

JOURNEY D: PERSONAL DEADLINE
1. Use center Add action.
2. Add assignment deadline.
3. See it in Calendar and Home next step.
4. Mark complete.
5. Home priority updates.

JOURNEY E: PRIVATE TUTOR
1. Search Calculus tutor.
2. Filter by language and mode.
3. View profile.
4. Send booking/contact request.
5. See pending state privately.

JOURNEY F: PEER HELPER
1. Open Peer Helpers.
2. Filter by first-year help and language.
3. View a clearly labeled Peer Helper.
4. Use only their consented contact method.
5. From Profile, current user can separately opt into Peer Helper visibility and later disable it.

JOURNEY G: TOOLS
1. Calculate a known weighted GPA result.
2. Calculate a required remaining grade with valid and impossible examples.
3. Open a flashcard deck.
4. Flip and move through cards.
5. Progress displays correctly.

JOURNEY H: ELYSIUM AI
1. Student has a deadline and joined study session.
2. Ask "What should I focus on next?"
3. AI references the current user's real permitted context.
4. AI recommends the deadline, session, tool, and appropriate help.
5. Links open the correct records/pages.
6. User gives helpful/not-helpful feedback.

JOURNEY I: THEME AND LANGUAGE
1. Switch light to dark.
2. Correct logo changes.
3. Refresh and preference remains.
4. Switch English to Arabic or Hebrew.
5. Root direction and all layouts switch correctly.
6. Current route and user state remain.

JOURNEY J: ADMIN SECURITY
1. Normal student cannot see Admin navigation.
2. Manually opening `/admin` does not expose admin data.
3. Normal student cannot publish guides, review reports, approve/hide profiles, or edit other users' records.
4. Admin can perform authorized moderation.

==================================================
24. ACCEPTANCE TESTS: DO NOT CALL THE WORK COMPLETE UNTIL THESE PASS
==================================================

PRODUCT
- The first screen communicates a connected student hub, not only AI or guides.
- Social, Study, Calendar, Private Tutors, Peer Helpers, Tools, Guides, and AI are present and purposeful.
- Private Tutors and Peer Helpers are visibly and structurally different.
- Social Activities and Study Sessions are visibly and structurally different.

BRANDING/THEMES
- Official uploaded logos are used.
- Light and dark themes work across all primary and admin pages.
- Theme persists.
- Correct logo is used for each theme.
- No unreadable card, input, modal, or calendar state exists in either theme.

LANGUAGES
- English core flow passes in LTR.
- Hebrew core flow passes in RTL.
- Arabic core flow passes in RTL.
- Onboarding and Profile offer all three languages.
- No accidental mixed-language core screen remains.
- Language switch preserves route and data.

DATA/BEHAVIOR
- Create/join/leave social activity works.
- Create/join/leave study session works.
- Joined items update Home and Calendar without duplication.
- Personal deadline CRUD works.
- Tutor discovery and request works.
- Peer Helper opt-in, discovery, contact consent, and opt-out work.
- GPA and Grade Needed calculations pass known test cases.
- Flashcard create/review/progress works.
- Guide source and review date are visible.
- AI reads only permitted context and provides useful deep links.

SECURITY
- User-owned data is protected.
- Contact consent is enforced.
- Admin route and admin entities are protected.
- Hidden/unpublished records are not exposed.
- Users cannot edit other users' records.

DEMO
- No primary screen shown to judges is empty.
- Demo data is labeled and not counted as real traction.
- The complete connected demo can be performed in approximately 60-90 seconds.
- The app still works if the AI call fails.

RESPONSIVE QUALITY
- Test at a small iPhone-sized viewport.
- Test at an Android-sized viewport.
- Test desktop.
- No text overlap, horizontal overflow, clipped controls, or inaccessible bottom navigation.
- Bottom navigation does not cover page content.
- Forms remain usable with mobile keyboard open.

==================================================
25. IMPLEMENTATION ORDER
==================================================

Implement in this order so the app remains stable:

PHASE 1: AUDIT AND PROTECT
- Inspect current pages, entities, data, auth, and permissions.
- Identify what will be reused, extended, or safely replaced.
- Do not delete data.
- Correct app metadata.

PHASE 2: GLOBAL FOUNDATION
- Localization system.
- English/Hebrew/Arabic.
- Root lang/dir.
- Light/dark theme and persistence.
- Logo usage.
- Responsive app shell and navigation.

PHASE 3: CONNECTED DATA MODEL
- Extend StudentProfile.
- Normalize Social participation.
- Normalize Study participation.
- Add/repair CalendarItem source linkage.
- Extend Private Tutor.
- Add TutorRequest.
- Add separate PeerHelper.
- Extend Guide/HelpfulLink trust metadata.
- Verify permissions after each entity change.

PHASE 4: CORE PAGES
- Onboarding.
- Home.
- Discover Social.
- Discover Study.
- Discover Private Tutors.
- Discover Peer Helpers.
- Calendar.
- Tools.
- Profile.

PHASE 5: INTERACTIONS
- Create/join/leave.
- Automatic calendar updates.
- Deadline CRUD.
- Tutor request.
- Peer Helper opt-in/opt-out.
- GPA/Grade Needed validation.
- Flashcard workflow.
- Reports and admin moderation.

PHASE 6: AI
- Configure Elysium Assistant.
- Start read-only and least-privilege.
- Add deep links and useful response format.
- Add feedback.
- Confirm fallback behavior.

PHASE 7: SEED AND QA
- Add labeled demo data.
- Test all three languages.
- Test both themes.
- Test permissions with normal student and admin accounts.
- Test mobile and desktop.
- Fix every failed acceptance test.

==================================================
26. FINAL RESPONSE REQUIRED FROM BASE44
==================================================

After implementing, give me a structured report containing:

1. What you changed.
2. Which existing entities/pages were reused.
3. Which entities/fields/pages were added.
4. Which data migrations or compatibility decisions were made.
5. Exact permission rules configured for every sensitive entity.
6. How light/dark theme persistence works.
7. How English/Hebrew/Arabic and RTL/LTR are implemented.
8. How the attached logo files are used.
9. How join/leave updates Calendar and Home.
10. How Private Tutors differ from Peer Helpers.
11. What tools the Elysium Assistant can access and whether they are read/write.
12. Which demo data was created and how it is labeled.
13. Which acceptance tests passed.
14. Which acceptance tests are still failing or need manual work.
15. Any Base44 limitations that prevented a requirement from being completed.

Do not claim a requirement is complete if it is only a visual placeholder or if its data/permissions do not work.

Begin by inspecting the current app and summarizing the safe implementation plan, then perform the work in the phases above. Keep the Elysium one-stop student hub concept intact throughout the implementation.
```
