# MVP Scope

The chosen MVP direction is **Personalized Student Hub**. The implementation should keep every core module visible while limiting each module to one reliable end-to-end workflow. See [Elysium Product Definition](elysium-product-definition.md).

## MVP Product Sentence

Elysium is a personalized, trilingual student hub for planning university life, meeting people, studying together, finding academic help, and knowing what to do next.

## Core User Roles

### Student

Can:

- Sign up and log in.
- Complete onboarding.
- See a personalized dashboard.
- Create and join social activities.
- Create and join study sessions.
- Manage a personal calendar and deadlines.
- Search guides.
- Browse university pages.
- Find Private Tutors and request a booking/contact.
- Find opted-in Peer Helpers.
- Use GPA, flashcard, planning, and guidance tools.
- Save useful resources.

### Private Tutor

Can:

- Create a tutor profile.
- Add subjects/courses, university familiarity, languages, availability, teaching mode, experience, and optional price.
- Accept booking/contact requests.
- Control visibility and contact information.

### Peer Helper

Can:

- Opt into a separate Peer Helper profile from the student profile.
- Add university, field, year, languages, help topics, availability, and short bio.
- Explicitly choose what contact method may be shared.
- Disable public visibility at any time.

### Admin

Can:

- Add and edit resources.
- Moderate tutors and Peer Helpers.
- Approve groups.
- Manage universities.
- Review reports.
- Keep content source-backed.

## Onboarding

Ask only what helps personalize the first experience:

- University or college.
- Study field.
- Academic year: preparatory, first year, second year, etc.
- Preferred interface language: English, Hebrew, or Arabic.
- Language comfort: Hebrew academic reading/speaking, Arabic reading/speaking, English academic reading.
- Interests and hobbies for social recommendations.
- Current courses or subjects for study, tutor, and tools recommendations.
- Living/commute context: dorms, commuting, near campus, unknown.
- Help needs: registration, scholarships, languages, exams, social belonging, study sessions, tutors, peer help, rights, and university systems.

Output:

- Student profile.
- Recommended starting guides.
- Suggested activities and study sessions.
- Suggested tutor and Peer Helper filters.
- Calendar starting state.
- The same workflow and resources in the selected interface language.

## Dashboard

The dashboard answers: "What matters now?"

MVP sections:

- Today or this week: personal deadlines, joined activities, study sessions, and tutor requests.
- One clear next action.
- Social and study recommendations based on context.
- Private Tutor and Peer Helper suggestions.
- Relevant tool, guide, or university shortcut.
- Compact Ask Elysium entry.

Avoid:

- Hero marketing sections.
- Large generic progress cards as the first focus.
- A full empty calendar grid as the only first-screen value.

## Social Activities

Students can create, join, and leave campus social activities. MVP fields:

- Title, category, description, host, university/campus.
- Date, time, place, capacity, and visibility.
- Participant list/count and report action.

Joining an activity adds it to the student's home and calendar.

## Study Sessions

Study sessions are separate from social activities. MVP fields:

- Subject/course and session type.
- Date, time, location/online link, capacity, and preferred languages.
- Host, participants, collaboration expectations, and report action.

Joining a session adds it to the student's home and calendar.

## Guide Library

Guides are the trusted information layer of the MVP. They support the hub but do not replace its social, study, calendar, tutor, Peer Helper, and tools workflows.

Guide categories:

- First week.
- Course registration.
- Exams and grades.
- Scholarships and money.
- Hebrew, Arabic, and English academic terms.
- Emails and communication.
- Moodle and university systems.
- Student rights.
- Dorms, transportation, and campus navigation.
- Mental pressure and time management.
- Study skills.

Fixed guide format:

- Situation: what problem this guide answers.
- Why it matters.
- Explanation in the student's selected language.
- Official terminology in Hebrew, Arabic, or English as relevant.
- Equivalent terms in the other supported languages when useful.
- Step-by-step action.
- Official link or source.
- Common mistake.
- Related tutor, Peer Helper, tool, or official contact prompt.

Example guide situations:

- How to write an email to a lecturer.
- What a syllabus is and where to find it.
- How to register for a course without creating a timetable conflict.
- What to do after not understanding the first lecture.
- How to search for a scholarship.
- Which office handles an appeal, accessibility request, or registration problem.

## University Pages

Start with a small list only. Recommended first candidates:

- Tel Aviv University.
- University of Haifa.
- Hebrew University.
- Technion.
- Ben-Gurion University.

Each page:

- Arabic, Hebrew, and English university names.
- City.
- Official site.
- Student union link.
- Academic calendar link.
- Important offices.
- Language, accessibility, new-immigrant, international, Arab-student, reserve-duty, and other support services where available.
- Scholarships.
- Campus tips from older students.
- Common first-year confusion.
- Related guides.
- Related activities, study sessions, tutors, Peer Helpers, tools, and guides.

## Private Tutors

Private Tutors offer subject instruction. They are distinct from Peer Helpers.

Profile fields:

- Name.
- University.
- Subjects/courses.
- Experience.
- Languages.
- Availability.
- Online/in-person mode.
- Price or contact-for-price.
- Bio.
- Booking/contact request.
- Visibility and moderation status.

MVP behavior:

- Search/filter by subject, course, language, availability, and mode.
- Submit a booking or contact request.
- Tutor accepts, declines, or contacts the student outside the app according to the approved flow.
- No in-app payment is required for the hackathon MVP.

Trust model:

- Public profiles require identity/moderation rules appropriate to the pilot.
- Allow reports and immediate tutor opt-out.
- Reviews, if retained, must be tied to real users/interactions and clearly distinguished from approval.
- Public contact information requires consent.

## Peer Helpers

Peer Helpers are opted-in students willing to answer questions. They are not paid tutors or official university representatives.

Profile fields:

- University, field, and year.
- Languages.
- Help topics.
- Bio and availability.
- Contact preference and explicit sharing consent.
- Visible/hidden status.

Students can enable, edit, or disable Peer Helper status from their profile.

## Groups

Persistent groups can help students find belonging and practical support, but event-like social activities and dated study sessions are the first MVP workflows.

Group types:

- Study group.
- Course group.
- Exam prep.
- First-year support.
- Social group.

Fields:

- Name.
- Type.
- University.
- Field or course.
- Description.
- WhatsApp link or contact person.
- Created by.
- Approved status.

Rules:

- Public listing requires admin approval.
- Groups can be reported.
- Group pages should explain what the group is for and who it helps.

## Personal Calendar And Tools

The calendar and tools are core parts of the one-stop-shop promise. They should be useful without overpowering the personalized home.

MVP tools:

- Personal deadline/reminder create, edit, complete, and delete.
- Automatic calendar items for joined activities, study sessions, and tutor bookings/requests.
- GPA calculator and required-grade planning.
- Flashcard deck create/review/progress.
- Email templates.
- Three-language academic term glossary.
- Helpful links and source-backed guides.

Do not start with:

- External calendar sync.
- AI-generated schedules.
- Full course or group chat.
- Advanced notifications.
- Analytics.

## Admin

Admin MVP can be simple but must exist because trust is part of the product.

Admin screens:

- Tutors and Peer Helpers.
- Pending groups.
- Resources.
- Universities.
- Reports.

Admin rules:

- Public resources need source links.
- Tutors, Peer Helpers, activities, sessions, and groups need moderation/report handling appropriate to their visibility.
- Reports should hide or flag harmful content.

## Out Of Scope For MVP

- Autonomous AI actions without confirmation.
- In-app direct messaging.
- In-app tutor payments; booking/contact requests are in scope.
- Multi-campus official partnerships.
- Native mobile app.
- Push notifications.
- Full analytics dashboard.
- Automatic scraping of official university sites.

## MVP Acceptance Test

A new student should be able to:

1. Create an account.
2. Choose university, field, year, and help needs.
3. Land on a dashboard that summarizes their week and suggests a useful next action.
4. Join a social activity and a study session and see both in the calendar.
5. Add a personal deadline.
6. Find a Private Tutor and a separate Peer Helper.
7. Complete one GPA/grade calculation and one flashcard review.
8. Open a sourced guide or helpful link.
9. Ask Elysium AI what is next and receive a recommendation grounded in their current hub data.

The acceptance test must be completed separately in English, Hebrew, and Arabic. Switching language must preserve the current screen and user data.
