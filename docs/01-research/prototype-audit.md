# Prototype Audit

This audit covers the hackathon visuals and three earlier Dalili attempts. The goal is to preserve the strongest product instincts while avoiding a generic student planner.

## 1. Visily Hackathon PDF

Location:

- `C:\Users\ammar\OneDrive\Desktop\Dalili\Visily-Export_10-06-2025_07-54.pdf`

Observed screens:

- Login.
- Home schedule with day/week/month tabs.
- Event cards for lecture, social activity, study group, and exam reminder.
- Quick actions for study groups, meetings, private tutors, and study tools.
- Side menu.
- Study/social group listing.
- Tutor or helper listing with ratings.
- Notifications.
- Profile.
- Study tools and semester progress.

What to keep:

- Strong Arabic/RTL mobile interface as proof that non-English experiences must be native.
- The idea that Dalili lives in the student's day, not only in a resource library.
- Schedule context connected to help actions.
- Quick access to groups, mentors, and tools.
- Simple bottom navigation.
- A practical notification model: exam reminders, suggested groups, useful events.

What to avoid:

- Over-centering the product on calendars and GPA tools.
- Rating mentors like a marketplace. For Dalili, trust should come from approval, profile quality, and lived experience, not stars.
- Generic placeholder people and generic app copy.
- Making "study tools" the main identity.

Product lesson:

The best original idea is a campus-day assistant: "Here is your day, here is what may confuse you, and here are the people/resources connected to that moment."

## 2. Spring Boot + React Prototype

Location:

- `C:\Users\ammar\IdeaProjects\DaliliApp`

Stack observed:

- Spring Boot backend with H2 and sample endpoints.
- Create React App frontend.
- Mostly placeholder navigation and mocked UI.

What to keep:

- Screen inventory: login, home, calendar, menu, events, ratings, notifications, study tools, study groups.
- The Arabic dashboard direction.
- The day/week/month interaction idea.

What to avoid:

- The backend is not a real product foundation.
- React code is mostly a single large component and mock state.
- Create React App is not the preferred direction for a fresh MVP.
- Text encoding issues in some files show the need for careful UTF-8 handling.

Product lesson:

This version is useful as a sketch, not as a codebase to continue.

## 3. Lovable Vite + React + Supabase Prototype

Location:

- `C:\Users\ammar\OneDrive\Desktop\myprojects\vibecoding\dalili_with_lovable`

Stack observed:

- Vite.
- React.
- TypeScript.
- Tailwind.
- shadcn-style components.
- Supabase.
- React Query.
- Protected routes.
- Mobile layout and bottom navigation.

Features observed:

- Auth.
- Dashboard.
- Courses.
- Goals.
- GPA calculator.
- Groups/study sessions.
- Tutors.
- Events.
- Notifications.
- Profile.

What to keep:

- Vite + React + TypeScript + Supabase remains the strongest custom-build reference.
- Protected route pattern.
- Mobile shell.
- Bottom navigation.
- Supabase migrations and RLS direction.
- Reusable UI component structure.
- Course groups and chat idea as a future feature.

What to avoid:

- The product reads as a general academic planner.
- Too much emphasis on GPA/courses/goals for Dalili's first identity.
- Tutor profiles are static and marketplace-like.
- It lacks a research-backed multilingual transition and hidden-curriculum model.

Product lesson:

Use this as the closest technical inspiration, but redesign the product model around guidance, mentors, resources, and first-year survival.

## 4. Cursor/Python + Supabase Prototype

Location:

- `C:\Users\ammar\OneDrive\Desktop\myprojects\vibecoding\trying_with_cursor`

Stack observed:

- Python Flask.
- Jinja templates.
- Supabase Auth and tables.
- Mobile/PWA direction.

Features observed:

- Auth.
- Profile.
- Add menu.
- Courses.
- GPA calculator.
- Goals.
- Events.
- Groups.
- Tutors.
- Arabic/RTL styling.

What to keep:

- PWA mindset.
- Arabic font stack direction such as Tajawal/Noto Sans Arabic.
- Supabase schema ideas for profiles and RLS.
- Mobile-first structure.

What to avoid:

- Flask is not a preferred implementation direction for the new product.
- The product model remains course/GPA-heavy.
- Server-rendered templates are less aligned with a modern mobile web app MVP.

Product lesson:

It proves the product can be made mobile-friendly and RTL-native, but the next version must give English, Hebrew, and Arabic equal product depth.

## Cross-Prototype Decision

Dalili should not become:

- A generic student planner.
- A GPA calculator with Arabic labels.
- A tutor marketplace.
- A collection of cards without a human product point of view.

Dalili should become:

- A multilingual campus compass for students.
- A human-written guide through first-year confusion.
- A trusted mentor and group network.
- A university-specific survival layer.
- A planner only where planning supports real student struggle.

## Reuse Policy

In this stage:

- Do not copy code from old prototypes.
- Do not migrate old schema yet.
- Do not create app files.

Later implementation may:

- Reuse concepts and screen ideas.
- Rebuild from scratch with clean architecture.
- Use Supabase as the backend.
- Use the old Vite version as a reference for patterns, not as a direct base unless the team explicitly decides to import it.
