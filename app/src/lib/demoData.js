const bguId = "demo-bgu";

function futureDate(days, hour = 17) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

export const demoUniversity = {
  id: bguId,
  name: "Ben-Gurion University of the Negev",
  name_he: "אוניברסיטת בן-גוריון בנגב",
  name_ar: "جامعة بن غوريون في النقب",
  city: "Be'er Sheva",
  website: "https://www.bgu.ac.il/en/",
  supported_languages: ["en", "he", "ar"],
};

export const demoFaculties = [
  { id: "demo-engineering", university_id: bguId, name: "Engineering Sciences", name_he: "מדעי ההנדסה", name_ar: "علوم الهندسة" },
  { id: "demo-natural-sciences", university_id: bguId, name: "Natural Sciences", name_he: "מדעי הטבע", name_ar: "العلوم الطبيعية" },
  { id: "demo-humanities", university_id: bguId, name: "Humanities and Social Sciences", name_he: "מדעי הרוח והחברה", name_ar: "العلوم الإنسانية والاجتماعية" },
];

export const demoContent = {
  events: [
    { id: "demo-event-football", title: "Casual football after classes", organizer_id: "demo-host", university_id: bguId, date: futureDate(2).slice(0, 10), start_time: "18:00", location: "Sports Center field", category: "sports", activity_name: "Football", max_spots: 14, is_open: true, status: "open", description: "Mixed-level game. Bring water and a light shirt." },
    { id: "demo-event-coffee", title: "First-year coffee meetup", organizer_id: "demo-host-2", university_id: bguId, date: futureDate(4).slice(0, 10), start_time: "16:30", location: "Student Center courtyard", category: "social", activity_name: "Coffee", max_spots: 20, is_open: true, status: "open", description: "Meet students from other departments and swap first-semester tips." },
  ],
  sessions: [
    { id: "demo-session-calculus", university_id: bguId, course_name: "Calculus 2", preferred_language: "English / Hebrew", title: "Calculus problem-solving session", location: "Aranne Library, floor 2", session_date: futureDate(1, 15), end_time: futureDate(1, 17), max_spots: 8, host_id: "demo-host", status: "open", notes: "We will solve tutorial sheet 9 together." },
    { id: "demo-session-data", university_id: bguId, course_name: "Data Structures", preferred_language: "Arabic / Hebrew", title: "Trees and graph review", location: "Building 37, study area", session_date: futureDate(3, 12), end_time: futureDate(3, 14), max_spots: 6, host_id: "demo-host-3", status: "open", notes: "Bring one question you could not solve." },
  ],
  tutors: [
    { id: "demo-tutor-lina", user_id: "demo-tutor-user-1", university_id: bguId, display_name: "Lina A.", subjects: ["Calculus", "Linear Algebra"], languages: ["Arabic", "Hebrew", "English"], bio: "Fourth-year engineering student focused on clear problem-solving methods.", teaching_mode: "both", price_min: 70, price_max: 90, currency: "ILS", availability: "Evenings and Thursday afternoons", rating_avg: 4.9, rating_count: 18, is_approved: true, is_active: true, moderation_status: "approved" },
    { id: "demo-tutor-noam", user_id: "demo-tutor-user-2", university_id: bguId, display_name: "Noam R.", subjects: ["Data Structures", "Algorithms"], languages: ["Hebrew", "English"], bio: "Computer science graduate student. Sessions emphasize intuition and exam practice.", teaching_mode: "online", price_min: 85, price_max: 100, currency: "ILS", availability: "Sunday to Wednesday evenings", rating_avg: 4.8, rating_count: 12, is_approved: true, is_active: true, moderation_status: "approved" },
  ],
  helpers: [
    { id: "demo-helper-sara", owner_user_id: "demo-helper-user-1", display_name: "Sara M.", university_id: bguId, field_of_study: "Information Systems", academic_year: "3rd Year", languages: ["Arabic", "Hebrew", "English"], help_topics: ["First week", "Moodle", "Course registration"], bio: "Happy to help new students understand where to start.", availability: "Usually replies in the evening", contact_method: "in_app", is_visible: true, moderation_status: "ok" },
    { id: "demo-helper-daniel", owner_user_id: "demo-helper-user-2", display_name: "Daniel K.", university_id: bguId, field_of_study: "Psychology", academic_year: "4th Year+", languages: ["Hebrew", "English"], help_topics: ["Scholarships", "Reserve duty support", "Student services"], bio: "I can point you toward the right official office and share what worked for me.", availability: "Weekdays", contact_method: "in_app", is_visible: true, moderation_status: "ok" },
  ],
  guides: [
    { id: "demo-guide-first-week", university_id: bguId, category: "First Week", title: "Your first week at BGU", title_he: "השבוע הראשון שלך בבן-גוריון", title_ar: "أسبوعك الأول في جامعة بن غوريون", situation: "You have accounts and course names, but do not know which systems matter first.", content: "Start with the BGU Portal and Moodle. Confirm your courses, locate each classroom, and save important semester dates.", what_to_do: "1. Sign into the portal.\n2. Open Moodle and verify your courses.\n3. Add exam and registration dates to Elysium.", who_to_contact: "Your department secretary or the Dean of Students when the issue crosses departments.", source_url: "https://portal.bgu.ac.il/", source_label: "BGU Portal", last_reviewed_date: "2026-06-13", is_published: true },
    { id: "demo-guide-study-support", university_id: bguId, category: "Study Skills", title: "Get academic help before you fall behind", title_he: "לקבל עזרה אקדמית בזמן", title_ar: "احصل على مساعدة أكاديمية مبكرًا", situation: "A course is moving faster than your current study plan.", content: "Combine a focused study session with official support or a private tutor. Bring a specific topic and attempted questions.", what_to_do: "1. Join a study session.\n2. Ask Ely to build a seven-day plan.\n3. Contact an approved tutor if you need individual teaching.", who_to_contact: "BGU Dean of Students academic support or your course staff.", source_url: "https://www.bgu.ac.il/en/u/academic-affairs/dekanat/", source_label: "BGU Dean of Students", last_reviewed_date: "2026-06-13", is_published: true },
  ],
  links: [
    { id: "demo-link-moodle", university_id: bguId, category: "course_system", title: "BGU Moodle", title_he: "מודל בן-גוריון", title_ar: "مودل جامعة بن غوريون", official_url: "https://moodle.bgu.ac.il/", description: "Courses, materials, recordings and assignments.", description_he: "קורסים, חומרי לימוד, הקלטות ומטלות.", description_ar: "المساقات والمواد والتسجيلات والمهام.", last_reviewed_date: "2026-06-13", is_published: true },
    { id: "demo-link-calendar", university_id: bguId, category: "academic_calendar", title: "BGU Academic Calendar", title_he: "לוח השנה האקדמי", title_ar: "التقويم الأكاديمي", official_url: "https://www.bgu.ac.il/en/academic-calendar/", description: "Official semester and examination dates.", description_he: "תאריכי סמסטרים ובחינות רשמיים.", description_ar: "المواعيد الرسمية للفصول والامتحانات.", last_reviewed_date: "2026-06-13", is_published: true },
  ],
};

export function withDemoFallback(records, fallback) {
  return Array.isArray(records) && records.length ? records : fallback;
}
