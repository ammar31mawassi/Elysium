# MVP Scope

The chosen MVP direction is **Full Student Hub**, but the implementation should be thin and focused. The goal is not to build every feature deeply. The goal is to make every core promise visible and useful.

## MVP Product Sentence

The working-title product is a multilingual campus compass that turns confusing university moments into clear steps, trusted people, and relevant resources in English, Hebrew, and Arabic.

## Core User Roles

### Student

Can:

- Sign up and log in.
- Complete onboarding.
- See a personalized dashboard.
- Search guides.
- Browse university pages.
- Find mentors.
- Join or save groups.
- Use basic planner/tools.
- Save useful resources.

### Mentor

Can:

- Create a mentor profile.
- Add university, field, year, languages, and help topics.
- Add a short bio.
- Add optional WhatsApp contact.
- Wait for admin approval before being public.

### Admin

Can:

- Add and edit resources.
- Approve mentors.
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
- Living/commute context: dorms, commuting, near campus, unknown.
- Help needs: registration, scholarships, Hebrew terms, exams, social belonging, study groups, rights, Moodle/systems.

Output:

- Student profile.
- Recommended starting guides.
- Suggested mentor filters.
- Suggested groups.
- The same workflow and resources in the selected interface language.

## Dashboard

The dashboard answers: "What matters now?"

MVP sections:

- Today or this week: deadlines and reminders, even if sample/manual at first.
- Start here: 2-3 guides based on onboarding.
- Ask someone: mentor CTA.
- Find your people: group suggestions.
- University shortcut: campus page.
- Saved guides.

Avoid:

- Hero marketing sections.
- Large generic progress cards as the first focus.
- Too much GPA data above guidance.

## Guide Library

Guides are the heart of the MVP.

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
- Ask a mentor prompt.

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
- Related mentors and groups.

## Mentors

Mentors are approved older students. They are not rated tutors in the MVP.

Profile fields:

- Name.
- University.
- Field.
- Year.
- Languages.
- Preferred contact language.
- Help topics.
- Bio.
- WhatsApp contact or request-contact button.
- Approved status.

Help topics:

- First-year advice.
- Course registration.
- Hebrew academic language.
- English academic reading.
- Arabic/Hebrew campus navigation.
- Scholarships.
- Exams.
- Housing.
- Social integration.
- Specific field help.

Trust model:

- Admin approval required.
- No star ratings in MVP.
- Allow reports.
- Show "verified by Dalili" or "approved mentor" after review.

## Groups

Groups help students find belonging and practical support.

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

## Planner And Tools

Planner/tools are useful but secondary.

MVP tools:

- Deadline/reminder list.
- GPA calculator or grade planning.
- Email templates.
- Three-language academic term glossary.
- First-week checklist.

Do not start with:

- Complex calendar sync.
- AI-generated schedules.
- Full course chat.
- Advanced notifications.
- Analytics.

## Admin

Admin MVP can be simple but must exist because trust is part of the product.

Admin screens:

- Pending mentors.
- Pending groups.
- Resources.
- Universities.
- Reports.

Admin rules:

- Public resources need source links.
- Mentors and groups need approval.
- Reports should hide or flag harmful content.

## Out Of Scope For MVP

- Real AI assistant.
- In-app direct messaging.
- Payment or tutoring marketplace.
- Multi-campus official partnerships.
- Native mobile app.
- Push notifications.
- Full analytics dashboard.
- Automatic scraping of official university sites.

## MVP Acceptance Test

A new student should be able to:

1. Create an account.
2. Choose university, field, year, and help needs.
3. Land on a dashboard that suggests useful next actions.
4. Open a guide and understand exactly what to do.
5. Find a mentor or group related to their context.
6. Save the guide or contact path.

The acceptance test must be completed separately in English, Hebrew, and Arabic. Switching language must preserve the current screen and user data.
