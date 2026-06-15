const copy = {
  en: {
    title: "What do you want to add?",
    social: ["Social activity", "Visible to students at your university"],
    study: ["Study group", "Visible to students taking the same active course"],
    homework: ["Homework", "Private calendar item"],
    exam: ["Exam", "Private calendar item"],
    other: ["Other", "Private calendar item"],
  },
  he: {
    title: "מה תרצו להוסיף?",
    social: ["פעילות חברתית", "גלוי לסטודנטים באוניברסיטה שלך"],
    study: ["קבוצת לימוד", "גלוי לסטודנטים שלומדים את אותו קורס פעיל"],
    homework: ["שיעורי בית", "פריט פרטי ביומן"],
    exam: ["בחינה", "פריט פרטי ביומן"],
    other: ["אחר", "פריט פרטי ביומן"],
  },
  ar: {
    title: "ماذا تريد أن تضيف؟",
    social: ["نشاط اجتماعي", "يظهر لطلاب جامعتك"],
    study: ["مجموعة دراسة", "تظهر للطلاب في نفس المساق الفعّال"],
    homework: ["واجب", "عنصر خاص في التقويم"],
    exam: ["امتحان", "عنصر خاص في التقويم"],
    other: ["أخرى", "عنصر خاص في التقويم"],
  },
};

const paths = {
  social: "/social?create=1",
  study: "/groups?create=1",
  homework: "/calendar?create=1&type=homework",
  exam: "/calendar?create=1&type=exam",
  other: "/calendar?create=1&type=other",
};

export function createActionCopy(locale = "en") {
  const localized = copy[locale] || copy.en;
  return {
    title: localized.title,
    actions: Object.entries(paths).map(([key, path]) => ({
      key,
      path,
      label: localized[key][0],
      description: localized[key][1],
    })),
  };
}

