// Te Reo Maori translations for NZ-HIS

export const teReo: Record<string, string> = {
  // Navigation sections
  "Clinical": "Hauora Haumanu",
  "Operations": "Whakahaere",
  "Analytics": "Tātaritanga",
  "AI Tools": "Taputapu AI",

  // Navigation items
  "Dashboard": "Papa Matua",
  "Patients": "Tūroro",
  "Clinical EMR": "Rekōta Hauora",
  "Medications": "Rongoā",
  "CDSS": "Pūnaha Āwhina",
  "Appointments": "Wā Kite",
  "Waitlist": "Rārangi Tatari",
  "Bed Management": "Whakahaere Moenga",
  "ACC Claims": "Kerēme ACC",
  "Hauora Equity": "Ōritenga Hauora",
  "Audit Trail": "Ara Arotake",
  "AI Commander": "Kaiārahi AI",

  // Common terms
  "Patient": "Tūroro",
  "Doctor": "Rata",
  "Nurse": "Tapuhi",
  "Hospital": "Hōhipera",
  "Health": "Hauora",
  "Wellbeing": "Oranga",
  "Family": "Whānau",
  "Welcome": "Nau mai",
  "Search": "Rapu",
  "Add New": "Tāpiri Hou",
  "Save": "Tiaki",
  "Cancel": "Whakakore",
  "Close": "Kati",
  "Delete": "Mukua",
  "Edit": "Whakatika",
  "View": "Tirohia",
  "Status": "Āhua",
  "Active": "Hohe",
  "Completed": "Oti",
  "Pending": "Tatari",

  // Clinical terms
  "Vital Signs": "Tohu Koiora",
  "Blood Pressure": "Pēhanga Toto",
  "Heart Rate": "Pao Manawa",
  "Temperature": "Mahana",
  "Diagnosis": "Tautuhi Mate",
  "Treatment": "Maimoatanga",
  "Prescription": "Tono Rongoā",
  "Discharge": "Tuku Atu",
  "Admission": "Whakaurunga",
  "Emergency": "Ohotata",
  "Surgery": "Pokanga",
  "Alert": "Matohi",
  "Critical": "Tino Nui",
  "Warning": "Whakatūpato",

  // NZ-specific
  "NHI Number": "Tau NHI",
  "ACC Claim": "Kerēme ACC",
  "Iwi": "Iwi",
  "Ethnicity": "Momo Iwi",
  "Region": "Rohe",
  "Whanau": "Whānau",
  "Hauora": "Hauora",
  "Kia ora": "Kia ora",
  "Mana": "Mana",
  "Aroha": "Aroha",
  "Wairua": "Wairua",
  "Tinana": "Tinana",
  "Hinengaro": "Hinengaro",

  // Hauora Equity
  "Health Equity": "Ōritenga Hauora",
  "Cultural Safety": "Haumaru Ahurea",
  "Whanau Ora": "Whānau Ora",
  "Te Whatu Ora": "Te Whatu Ora",
  "Health Targets": "Whāinga Hauora",

  // Dashboard
  "Total Patients": "Tūroro Katoa",
  "Active Admissions": "Whakaurunga Hohe",
  "Today's Appointments": "Wā Kite o Tēnei Rā",
  "Waitlist Count": "Rārangi Tatari",
  "Patient Census": "Tatauranga Tūroro",
  "Demographics": "Tatauranga Taupori",
  "Quality Metrics": "Inenga Kounga",
  "Activity Feed": "Hongere Mahi",

  // Greetings by time
  "Good Morning": "Ata mārie",
  "Good Afternoon": "Ahiahi mārie",
  "Good Evening": "Pō mārie",
};

export function getTeReo(key: string): string | undefined {
  return teReo[key];
}

export function getBilingualLabel(english: string): { en: string; mi: string | undefined } {
  return {
    en: english,
    mi: teReo[english],
  };
}

export const teReoGlossary = [
  { term: "Hauora", meaning: "Health, wellbeing", context: "Holistic Māori concept of health encompassing physical, mental, spiritual, and family wellbeing" },
  { term: "Whānau", meaning: "Family, extended family", context: "Central to Māori health — health of an individual is tied to the health of their whānau" },
  { term: "Wairua", meaning: "Spirit, spirituality", context: "One of the four cornerstones of Māori health (Te Whare Tapa Whā)" },
  { term: "Tinana", meaning: "Body, physical health", context: "Physical dimension of health in Te Whare Tapa Whā" },
  { term: "Hinengaro", meaning: "Mind, mental health", context: "Mental and emotional dimension of health" },
  { term: "Mana", meaning: "Authority, prestige, power", context: "Relates to patient dignity and cultural respect in healthcare" },
  { term: "Aroha", meaning: "Love, compassion", context: "Fundamental value in healthcare interactions" },
  { term: "Koru", meaning: "Spiral, new growth", context: "Symbol of new life, growth, strength — used in NZ healthcare branding" },
  { term: "Tūroro", meaning: "Patient, sick person", context: "Term for a patient or someone receiving care" },
  { term: "Rongoā", meaning: "Medicine, remedy", context: "Can refer to traditional Māori medicine or modern medications" },
  { term: "Iwi", meaning: "Tribe, people", context: "Important for identifying health needs of specific Māori communities" },
  { term: "Kaitiakitanga", meaning: "Guardianship, stewardship", context: "Responsibility to protect and care for health data and patient welfare" },
  { term: "Whakamana", meaning: "Empowerment", context: "Empowering patients to participate in their own healthcare decisions" },
  { term: "Tika", meaning: "Correct, right, fair", context: "Ethical principle in health research and practice" },
  { term: "Pono", meaning: "True, genuine, honest", context: "Integrity in clinical practice and patient relationships" },
];
