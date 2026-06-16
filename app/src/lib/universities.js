export const defaultUniversities = [
  {
    id: "bgu",
    name: "Ben-Gurion University of the Negev",
    name_he: "אוניברסיטת בן-גוריון בנגב",
    name_ar: "جامعة بن غوريون في النقب",
    city: "Beer Sheva",
    website: "https://www.bgu.ac.il/",
    supported_languages: ["en", "he", "ar"],
    is_active: true,
    is_public: true,
  },
  {
    id: "tel-aviv-university",
    name: "Tel Aviv University",
    name_he: "אוניברסיטת תל אביב",
    city: "Tel Aviv",
    website: "https://english.tau.ac.il/",
    supported_languages: ["en", "he"],
    is_active: true,
    is_public: true,
  },
  {
    id: "hebrew-university-of-jerusalem",
    name: "Hebrew University of Jerusalem",
    name_he: "האוניברסיטה העברית בירושלים",
    city: "Jerusalem",
    website: "https://www.huji.ac.il/",
    supported_languages: ["en", "he"],
    is_active: true,
    is_public: true,
  },
  {
    id: "technion",
    name: "Technion - Israel Institute of Technology",
    name_he: "הטכניון - מכון טכנולוגי לישראל",
    city: "Haifa",
    website: "https://www.technion.ac.il/en/",
    supported_languages: ["en", "he"],
    is_active: true,
    is_public: true,
  },
  {
    id: "university-of-haifa",
    name: "University of Haifa",
    name_he: "אוניברסיטת חיפה",
    city: "Haifa",
    website: "https://www.haifa.ac.il/",
    supported_languages: ["en", "he"],
    is_active: true,
    is_public: true,
  },
  {
    id: "bar-ilan-university",
    name: "Bar-Ilan University",
    name_he: "אוניברסיטת בר-אילן",
    city: "Ramat Gan",
    website: "https://www.biu.ac.il/en",
    supported_languages: ["en", "he"],
    is_active: true,
    is_public: true,
  },
  {
    id: "shamoon-college-of-engineering",
    name: "Shamoon College of Engineering",
    name_he: "המכללה האקדמית להנדסה ע״ש סמי שמעון",
    city: "Beer Sheva / Ashdod",
    website: "https://en.sce.ac.il/",
    supported_languages: ["en", "he"],
    is_active: true,
    is_public: true,
  },
];

function normalizedUniversityKey(university) {
  const website = university.website?.trim().toLocaleLowerCase("en").replace(/\/+$/, "");
  if (website) return `site:${website}`;
  return `name:${university.name?.trim().toLocaleLowerCase("en") || university.id}`;
}

export function mergeUniversities(collections = [], { includePrivateIds = [] } = {}) {
  const privateIds = new Set(includePrivateIds.filter(Boolean));
  const universities = new Map();
  collections.flat().filter(Boolean).forEach((university) => {
    if (!university.id || university.is_active === false) return;
    if (university.is_public === false && !privateIds.has(university.id)) return;
    universities.set(normalizedUniversityKey(university), university);
  });
  return [...universities.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function withDefaultUniversities(universities = [], options) {
  return mergeUniversities([defaultUniversities, universities], options);
}

export function findDefaultUniversity(id) {
  return defaultUniversities.find((university) => university.id === id) || null;
}
