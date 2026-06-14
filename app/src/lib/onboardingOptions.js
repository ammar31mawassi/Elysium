export const FIELD_OPTIONS = [
  { id: "computer-science", en: "Computer Science", he: "מדעי המחשב", ar: "علوم الحاسوب" },
  { id: "computer-engineering", en: "Computer Engineering", he: "הנדסת מחשבים", ar: "هندسة الحاسوب" },
  { id: "software-engineering", en: "Software Engineering", he: "הנדסת תוכנה", ar: "هندسة البرمجيات" },
  { id: "information-systems", en: "Information Systems", he: "מערכות מידע", ar: "نظم المعلومات" },
  { id: "data-science", en: "Data Science", he: "מדעי הנתונים", ar: "علم البيانات" },
  { id: "electrical-engineering", en: "Electrical Engineering", he: "הנדסת חשמל", ar: "الهندسة الكهربائية" },
  { id: "mechanical-engineering", en: "Mechanical Engineering", he: "הנדסת מכונות", ar: "الهندسة الميكانيكية" },
  { id: "industrial-engineering", en: "Industrial Engineering and Management", he: "הנדסת תעשייה וניהול", ar: "الهندسة الصناعية والإدارة" },
  { id: "civil-engineering", en: "Civil Engineering", he: "הנדסה אזרחית", ar: "الهندسة المدنية" },
  { id: "chemical-engineering", en: "Chemical Engineering", he: "הנדסה כימית", ar: "الهندسة الكيميائية" },
  { id: "biomedical-engineering", en: "Biomedical Engineering", he: "הנדסה ביו-רפואית", ar: "الهندسة الطبية الحيوية" },
  { id: "mathematics", en: "Mathematics", he: "מתמטיקה", ar: "الرياضيات" },
  { id: "statistics", en: "Statistics", he: "סטטיסטיקה", ar: "الإحصاء" },
  { id: "physics", en: "Physics", he: "פיזיקה", ar: "الفيزياء" },
  { id: "chemistry", en: "Chemistry", he: "כימיה", ar: "الكيمياء" },
  { id: "biology", en: "Biology", he: "ביולוגיה", ar: "الأحياء" },
  { id: "medicine", en: "Medicine", he: "רפואה", ar: "الطب" },
  { id: "nursing", en: "Nursing", he: "סיעוד", ar: "التمريض" },
  { id: "pharmacy", en: "Pharmacy", he: "רוקחות", ar: "الصيدلة" },
  { id: "psychology", en: "Psychology", he: "פסיכולוגיה", ar: "علم النفس" },
  { id: "economics", en: "Economics", he: "כלכלה", ar: "الاقتصاد" },
  { id: "business-administration", en: "Business Administration", he: "מנהל עסקים", ar: "إدارة الأعمال" },
  { id: "accounting", en: "Accounting", he: "חשבונאות", ar: "المحاسبة" },
  { id: "law", en: "Law", he: "משפטים", ar: "القانون" },
  { id: "education", en: "Education", he: "חינוך", ar: "التربية" },
  { id: "social-work", en: "Social Work", he: "עבודה סוציאלית", ar: "العمل الاجتماعي" },
  { id: "communications", en: "Communication", he: "תקשורת", ar: "الاتصال والإعلام" },
  { id: "architecture", en: "Architecture", he: "אדריכלות", ar: "الهندسة المعمارية" },
  { id: "political-science", en: "Political Science", he: "מדע המדינה", ar: "العلوم السياسية" },
  { id: "linguistics", en: "Linguistics", he: "בלשנות", ar: "اللسانيات" },
];

export const DEFAULT_INTERESTS = [
  { id: "football", en: "Football", he: "כדורגל", ar: "كرة القدم" },
  { id: "basketball", en: "Basketball", he: "כדורסל", ar: "كرة السلة" },
  { id: "running", en: "Running", he: "ריצה", ar: "الجري" },
  { id: "gym", en: "Gym", he: "חדר כושר", ar: "النادي الرياضي" },
  { id: "board-games", en: "Board games", he: "משחקי קופסה", ar: "ألعاب الطاولة" },
  { id: "gaming", en: "Gaming", he: "גיימינג", ar: "الألعاب الإلكترونية" },
  { id: "music", en: "Music", he: "מוזיקה", ar: "الموسيقى" },
  { id: "film", en: "Film", he: "קולנוע", ar: "الأفلام" },
  { id: "coffee", en: "Coffee", he: "קפה", ar: "القهوة" },
  { id: "volunteering", en: "Volunteering", he: "התנדבות", ar: "التطوع" },
  { id: "photography", en: "Photography", he: "צילום", ar: "التصوير" },
  { id: "hiking", en: "Hiking", he: "טיולים", ar: "المشي والرحلات" },
  { id: "reading", en: "Reading", he: "קריאה", ar: "القراءة" },
  { id: "cooking", en: "Cooking", he: "בישול", ar: "الطبخ" },
  { id: "chess", en: "Chess", he: "שחמט", ar: "الشطرنج" },
];

export function localizedOption(option, locale = "en") {
  return option?.[locale] || option?.en || "";
}

export function normalizeOptionName(value = "") {
  return value.trim().toLocaleLowerCase("en").replace(/\s+/g, " ");
}

export function filterLocalizedOptions(options, query) {
  const normalized = normalizeOptionName(query);
  if (!normalized) return options;
  return options.filter((option) => [option.en, option.he, option.ar]
    .filter(Boolean)
    .some((value) => normalizeOptionName(value).includes(normalized)));
}

export function mergeInterestOptions(records = []) {
  const merged = new Map(DEFAULT_INTERESTS.map((interest) => [normalizeOptionName(interest.en), interest]));
  records.filter((record) => record.is_active !== false).forEach((record) => {
    const interest = {
      id: record.id,
      en: record.name_en,
      he: record.name_he,
      ar: record.name_ar || record.name_en,
      persisted: true,
    };
    if (interest.en && interest.he) merged.set(normalizeOptionName(interest.en), interest);
  });
  return [...merged.values()];
}
