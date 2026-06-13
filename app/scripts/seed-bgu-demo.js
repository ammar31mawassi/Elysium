const university = await base44.entities.University.create({
  name: "Ben-Gurion University of the Negev",
  name_he: "אוניברסיטת בן-גוריון בנגב",
  name_ar: "جامعة بن غوريون في النقب",
  city: "Be'er Sheva",
  website: "https://www.bgu.ac.il/en/",
  supported_languages: ["en", "he", "ar"],
  is_active: true
});

const records = [
  ["Faculty", { name: "Engineering Sciences", name_he: "מדעי ההנדסה", name_ar: "علوم الهندسة", university_id: university.id }],
  ["Faculty", { name: "Natural Sciences", name_he: "מדעי הטבע", name_ar: "العلوم الطبيعية", university_id: university.id }],
  ["HelpfulLink", { title: "BGU Moodle", title_he: "מודל בן-גוריון", title_ar: "مودل جامعة بن غوريون", university_id: university.id, category: "course_system", official_url: "https://moodle.bgu.ac.il/", description: "Courses, materials, recordings and assignments.", last_reviewed_date: "2026-06-13", is_published: true }],
  ["HelpfulLink", { title: "BGU Academic Calendar", title_he: "לוח השנה האקדמי", title_ar: "التقويم الأكاديمي", university_id: university.id, category: "academic_calendar", official_url: "https://www.bgu.ac.il/en/academic-calendar/", description: "Official semester and examination dates.", last_reviewed_date: "2026-06-13", is_published: true }],
  ["Guide", { title: "Your first week at BGU", title_he: "השבוע הראשון שלך בבן-גוריון", title_ar: "أسبوعك الأول في جامعة بن غوريون", category: "First Week", situation: "You have accounts and course names, but do not know which systems matter first.", content: "Start with the BGU Portal and Moodle. Confirm your courses and save important semester dates.", what_to_do: "Sign into the portal, verify Moodle courses, and add key dates to Elysium.", who_to_contact: "Your department secretary or the Dean of Students.", university_id: university.id, source_url: "https://portal.bgu.ac.il/", source_label: "BGU Portal", last_reviewed_date: "2026-06-13", is_published: true }],
  ["Guide", { title: "Get academic help before you fall behind", category: "Study Skills", situation: "A course is moving faster than your current study plan.", content: "Combine a focused study session with official support or an approved tutor.", what_to_do: "Join a study session, ask Ely for a seven-day plan, then contact a tutor if needed.", who_to_contact: "BGU Dean of Students academic support.", university_id: university.id, source_url: "https://www.bgu.ac.il/en/u/academic-affairs/dekanat/", source_label: "BGU Dean of Students", last_reviewed_date: "2026-06-13", is_published: true }]
];

for (const [entity, data] of records) {
  await base44.entities[entity].create(data);
}

console.log(`Seeded BGU with ${records.length + 1} records.`);
