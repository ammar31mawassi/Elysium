export const defaultUniversities = [
  {
    id: "demo-bgu",
    name: "Ben-Gurion University of the Negev",
    name_he: "אוניברסיטת בן-גוריון בנגב",
    name_ar: "جامعة بن غوريون في النقب",
    city: "Beer Sheva",
    website: "https://www.bgu.ac.il/",
    supported_languages: ["en", "he", "ar"],
    is_active: true,
  },
  {
    id: "tel-aviv-university",
    name: "Tel Aviv University",
    name_he: "אוניברסיטת תל אביב",
    city: "Tel Aviv",
    website: "https://english.tau.ac.il/",
    supported_languages: ["en", "he"],
    is_active: true,
  },
  {
    id: "technion",
    name: "Technion - Israel Institute of Technology",
    name_he: "הטכניון - מכון טכנולוגי לישראל",
    city: "Haifa",
    website: "https://www.technion.ac.il/en/",
    supported_languages: ["en", "he"],
    is_active: true,
  },
  {
    id: "university-of-haifa",
    name: "University of Haifa",
    name_he: "אוניברסיטת חיפה",
    city: "Haifa",
    website: "https://www.haifa.ac.il/",
    supported_languages: ["en", "he"],
    is_active: true,
  },
  {
    id: "bar-ilan-university",
    name: "Bar-Ilan University",
    name_he: "אוניברסיטת בר-אילן",
    city: "Ramat Gan",
    website: "https://www.biu.ac.il/en",
    supported_languages: ["en", "he"],
    is_active: true,
  },
  {
    id: "shamoon-college-of-engineering",
    name: "Shamoon College of Engineering",
    name_he: "המכללה האקדמית להנדסה ע״ש סמי שמעון",
    city: "Beer Sheva / Ashdod",
    website: "https://en.sce.ac.il/",
    supported_languages: ["en", "he"],
    is_active: true,
  },
];

export function mergeUniversities(...collections) {
  const universities = new Map();
  collections.flat().filter(Boolean).forEach((university) => {
    if (!university.id || university.is_active === false) return;
    universities.set(university.id, university);
  });
  return [...universities.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function withDefaultUniversities(universities = []) {
  return mergeUniversities(defaultUniversities, universities);
}

export function findDefaultUniversity(id) {
  return defaultUniversities.find((university) => university.id === id) || null;
}
