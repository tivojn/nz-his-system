// Mock data generators for dashboard charts and other components

export function generateCensusData() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day) => ({
    day,
    admissions: Math.floor(Math.random() * 15) + 20,
    discharges: Math.floor(Math.random() * 12) + 18,
    inpatient: Math.floor(Math.random() * 30) + 80,
  }));
}

export function generateDemographicsData() {
  return [
    { ethnicity: "NZ European", count: 42, fill: "var(--color-chart-1)" },
    { ethnicity: "Maori", count: 28, fill: "var(--color-chart-2)" },
    { ethnicity: "Pacific Islander", count: 15, fill: "var(--color-chart-3)" },
    { ethnicity: "Asian", count: 10, fill: "var(--color-chart-4)" },
    { ethnicity: "Other", count: 5, fill: "var(--color-chart-5)" },
  ];
}

export function generateBedOccupancy() {
  return [
    { ward: "Medical 1", total: 24, occupied: 21, available: 2, cleaning: 1 },
    { ward: "Medical 2", total: 20, occupied: 18, available: 1, cleaning: 1 },
    { ward: "Surgical", total: 18, occupied: 15, available: 2, cleaning: 1 },
    { ward: "ICU", total: 8, occupied: 6, available: 1, cleaning: 1 },
    { ward: "ED", total: 12, occupied: 10, available: 2, cleaning: 0 },
    { ward: "Maternity", total: 10, occupied: 7, available: 3, cleaning: 0 },
    { ward: "Paediatric", total: 12, occupied: 8, available: 3, cleaning: 1 },
    { ward: "Ortho", total: 14, occupied: 12, available: 1, cleaning: 1 },
  ];
}

export function generateQualityMetrics() {
  return {
    insuranceRejection: { value: 3.2, trend: -0.8, label: "Insurance Rejection Rate", unit: "%" },
    avgWaitTime: { value: 42, trend: -5, label: "Avg ED Wait Time", unit: "min" },
    readmissionRate: { value: 4.8, trend: -0.3, label: "30-Day Readmission Rate", unit: "%" },
    satisfaction: { value: 87, trend: 2, label: "Patient Satisfaction", unit: "%" },
  };
}

export function generateActivityFeed() {
  const now = new Date();
  return [
    { id: "1", time: new Date(now.getTime() - 5 * 60000), type: "admission", message: "Hemi Tuhoe admitted to ED — fractured tibia", user: "Dr. James Henare" },
    { id: "2", time: new Date(now.getTime() - 12 * 60000), type: "alert", message: "CDSS Alert: Drug interaction detected — Warfarin + Ibuprofen", user: "System" },
    { id: "3", time: new Date(now.getTime() - 25 * 60000), type: "discharge", message: "David Stewart discharged from Respiratory", user: "Dr. Sarah Mitchell" },
    { id: "4", time: new Date(now.getTime() - 35 * 60000), type: "medication", message: "Medication administered: Morphine 10mg IV — Sione Manu", user: "Aroha Williams" },
    { id: "5", time: new Date(now.getTime() - 48 * 60000), type: "lab", message: "Lab result: HbA1c 8.2% — Wiremu Ngata (above target)", user: "Pathology" },
    { id: "6", time: new Date(now.getTime() - 60 * 60000), type: "appointment", message: "Appointment scheduled: Emma Thompson — Cardiology follow-up", user: "Mele Taufa" },
    { id: "7", time: new Date(now.getTime() - 90 * 60000), type: "note", message: "SOAP note created for Sione Manu — ACL tear assessment", user: "Dr. James Henare" },
    { id: "8", time: new Date(now.getTime() - 120 * 60000), type: "acc", message: "ACC claim ACC-2024-00456 status updated to Accepted", user: "System" },
    { id: "9", time: new Date(now.getTime() - 150 * 60000), type: "vitals", message: "NEWS2 Score 6 — Wiremu Ngata (Medium risk, escalation required)", user: "Aroha Williams" },
    { id: "10", time: new Date(now.getTime() - 180 * 60000), type: "bed", message: "Bed M1-05 status changed to Cleaning", user: "System" },
  ];
}

export function generateHealthTargets() {
  return [
    { name: "Shorter stays in ED", target: 95, actual: 88, description: "% patients within 6 hours" },
    { name: "Elective surgery access", target: 100, actual: 94, description: "Patients vs. target volume" },
    { name: "Faster cancer treatment", target: 90, actual: 85, description: "First treatment within 62 days" },
    { name: "Smoking cessation", target: 90, actual: 92, description: "Patients offered quit support" },
    { name: "Raising healthy kids", target: 95, actual: 91, description: "B4 School check referrals" },
    { name: "Mental health access", target: 80, actual: 76, description: "Population accessing services" },
  ];
}

export function generateHauoraEquityData() {
  return {
    waitTimes: [
      { department: "ED", maori: 65, nonMaori: 42, target: 45 },
      { department: "Ortho", maori: 120, nonMaori: 85, target: 90 },
      { department: "Cardiology", maori: 95, nonMaori: 72, target: 75 },
      { department: "Oncology", maori: 45, nonMaori: 38, target: 40 },
      { department: "Mental Health", maori: 55, nonMaori: 35, target: 30 },
    ],
    admissionRates: [
      { condition: "Diabetes", maori: 18.5, nonMaori: 8.2 },
      { condition: "Heart Disease", maori: 15.3, nonMaori: 9.1 },
      { condition: "Respiratory", maori: 22.1, nonMaori: 12.4 },
      { condition: "Mental Health", maori: 12.8, nonMaori: 7.6 },
      { condition: "Cancer", maori: 8.9, nonMaori: 7.2 },
    ],
    culturalSafety: {
      score: 72,
      staffTrained: 85,
      interpreterAccess: 68,
      tikangaCompliance: 74,
      patientSatisfaction: 78,
    },
    whanauOra: {
      familyWellbeing: 65,
      economicWellbeing: 58,
      healthyLifestyles: 62,
      participation: 71,
      culturalIdentity: 82,
    },
    equityTargets: [
      { metric: "ED Wait Disparity", target: "< 10 min difference", actual: "23 min", status: "off-track" },
      { metric: "Elective Surgery Access", target: "Equal rates", actual: "15% gap", status: "off-track" },
      { metric: "Cancer Screening", target: "> 70% Maori coverage", actual: "62%", status: "improving" },
      { metric: "Immunisation", target: "> 95% all ethnicities", actual: "91% Maori", status: "improving" },
      { metric: "Mental Health Access", target: "Equal access rates", actual: "68% equity", status: "off-track" },
      { metric: "Diabetes Management", target: "HbA1c < 7 for 80%", actual: "65% Maori", status: "improving" },
    ],
  };
}
