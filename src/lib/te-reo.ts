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

// Chinese Simplified translations for NZ-HIS
export const zhCN: Record<string, string> = {
  // Navigation sections
  "Clinical": "临床",
  "Operations": "运营",
  "Analytics": "数据分析",
  "AI Tools": "AI 工具",

  // Navigation items
  "Dashboard": "仪表盘",
  "Patients": "患者",
  "Clinical EMR": "临床电子病历",
  "Medications": "药物管理",
  "CDSS": "临床决策支持",
  "Appointments": "预约",
  "Waitlist": "候诊名单",
  "Bed Management": "床位管理",
  "ACC Claims": "ACC 理赔",
  "Hauora Equity": "健康公平",
  "Audit Trail": "审计日志",
  "AI Commander": "AI 指挥官",

  // Common terms
  "Patient": "患者",
  "Doctor": "医生",
  "Nurse": "护士",
  "Hospital": "医院",
  "Health": "健康",
  "Wellbeing": "福祉",
  "Family": "家庭",
  "Welcome": "欢迎",
  "Search": "搜索",
  "Add New": "新增",
  "Save": "保存",
  "Cancel": "取消",
  "Close": "关闭",
  "Delete": "删除",
  "Edit": "编辑",
  "View": "查看",
  "Status": "状态",
  "Active": "活跃",
  "Completed": "已完成",
  "Pending": "待处理",

  // Clinical terms
  "Vital Signs": "生命体征",
  "Blood Pressure": "血压",
  "Heart Rate": "心率",
  "Temperature": "体温",
  "Diagnosis": "诊断",
  "Treatment": "治疗",
  "Prescription": "处方",
  "Discharge": "出院",
  "Admission": "入院",
  "Emergency": "急诊",
  "Surgery": "手术",
  "Alert": "警报",
  "Critical": "危急",
  "Warning": "警告",

  // NZ-specific (keep English/NZ terms where appropriate)
  "NHI Number": "NHI 编号",
  "ACC Claim": "ACC 理赔",
  "Iwi": "部落 (Iwi)",
  "Ethnicity": "民族",
  "Region": "地区",
  "Whanau": "家庭 (Whānau)",
  "Hauora": "健康 (Hauora)",

  // Dashboard
  "Total Patients": "患者总数",
  "Active Admissions": "在院患者",
  "Today's Appointments": "今日预约",
  "Waitlist Count": "候诊人数",
  "Patient Census": "患者统计",
  "Demographics": "人口统计",
  "Quality Metrics": "质量指标",
  "Activity Feed": "动态信息",

  // Greetings
  "Good Morning": "早上好",
  "Good Afternoon": "下午好",
  "Good Evening": "晚上好",

  // Hauora/Equity
  "Health Equity": "健康公平",
  "Cultural Safety": "文化安全",
  "Whanau Ora": "家庭健康",
  "Te Whatu Ora": "新西兰卫生部",
  "Health Targets": "健康目标",
};

export function getZhCN(key: string): string | undefined {
  return zhCN[key];
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
