import { PrismaClient } from "@prisma/client";

export async function seedDatabase(prisma: PrismaClient) {
  // Clear all data for clean seed
  await prisma.aCCClaimEvent.deleteMany();
  await prisma.aCCClaim.deleteMany();
  await prisma.vitalSignSet.deleteMany();
  await prisma.clinicalAlert.deleteMany();
  await prisma.clinicalPathway.deleteMany();
  await prisma.drugInteraction.deleteMany();
  await prisma.labOrder.deleteMany();
  await prisma.allergy.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.incidentReport.deleteMany();
  await prisma.medication.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.bed.deleteMany();
  await prisma.observation.deleteMany();
  await prisma.waitlistEntry.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.clinicalNote.deleteMany();
  await prisma.encounter.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  // Create demo users
  const users = await Promise.all([
    prisma.user.create({ data: { email: "admin@nzhis.co.nz", name: "Dr. Sarah Mitchell", password: "$2a$10$k7Iy7gJzMjEz5RUVnOqFXeA5MjXbQ3UhJ1zK.WfJ8wX9v7Kz9Kyq2", role: "admin", department: "Administration", hpiNumber: "HPI-00001" } }),
    prisma.user.create({ data: { email: "doctor@nzhis.co.nz", name: "Dr. James Henare", password: "$2a$10$k7Iy7gJzMjEz5RUVnOqFXeA5MjXbQ3UhJ1zK.WfJ8wX9v7Kz9Kyq2", role: "doctor", department: "Emergency Medicine", hpiNumber: "HPI-00002" } }),
    prisma.user.create({ data: { email: "nurse@nzhis.co.nz", name: "Aroha Williams", password: "$2a$10$k7Iy7gJzMjEz5RUVnOqFXeA5MjXbQ3UhJ1zK.WfJ8wX9v7Kz9Kyq2", role: "nurse", department: "General Medicine", hpiNumber: "HPI-00003" } }),
    prisma.user.create({ data: { email: "reception@nzhis.co.nz", name: "Mele Taufa", password: "$2a$10$k7Iy7gJzMjEz5RUVnOqFXeA5MjXbQ3UhJ1zK.WfJ8wX9v7Kz9Kyq2", role: "receptionist", department: "Front Desk" } }),
  ]);

  // Create patients
  const patients = await Promise.all([
    prisma.patient.create({ data: { nhiNumber: "AAA1234", firstName: "Hemi", lastName: "Tuhoe", dateOfBirth: new Date("1985-03-15"), gender: "male", ethnicity: "Maori", iwi: "Ngai Tuhoe", phone: "021-555-0101", email: "hemi.tuhoe@email.co.nz", address: "42 Karangahape Rd", city: "Auckland", region: "Auckland", accClaimNumber: "ACC-2024-00123", accClaimStatus: "active", status: "active" } }),
    prisma.patient.create({ data: { nhiNumber: "BBB5678", firstName: "Emma", lastName: "Thompson", dateOfBirth: new Date("1972-08-22"), gender: "female", ethnicity: "NZ European", phone: "027-555-0102", email: "emma.t@email.co.nz", address: "15 Willis Street", city: "Wellington", region: "Wellington", status: "active" } }),
    prisma.patient.create({ data: { nhiNumber: "CCC9012", firstName: "Sione", lastName: "Manu", dateOfBirth: new Date("1990-11-03"), gender: "male", ethnicity: "Pacific Islander", phone: "022-555-0103", address: "88 Great South Rd", city: "Manukau", region: "Auckland", accClaimNumber: "ACC-2024-00456", accClaimStatus: "pending", status: "active" } }),
    prisma.patient.create({ data: { nhiNumber: "DDD3456", firstName: "Mei", lastName: "Chen", dateOfBirth: new Date("1995-06-18"), gender: "female", ethnicity: "Asian", phone: "021-555-0104", email: "mei.chen@email.co.nz", address: "23 Dominion Rd", city: "Auckland", region: "Auckland", status: "active" } }),
    prisma.patient.create({ data: { nhiNumber: "EEE7890", firstName: "Wiremu", lastName: "Ngata", dateOfBirth: new Date("1968-01-25"), gender: "male", ethnicity: "Maori", iwi: "Ngati Porou", phone: "027-555-0105", address: "5 Marine Parade", city: "Gisborne", region: "Gisborne", accClaimNumber: "ACC-2023-00789", accClaimStatus: "closed", status: "active" } }),
    prisma.patient.create({ data: { nhiNumber: "FFF2345", firstName: "Leilani", lastName: "Pasifika", dateOfBirth: new Date("2001-09-12"), gender: "female", ethnicity: "Pacific Islander", phone: "022-555-0106", address: "67 Otahuhu Rd", city: "Auckland", region: "Auckland", status: "active" } }),
    prisma.patient.create({ data: { nhiNumber: "GGG6789", firstName: "David", lastName: "Stewart", dateOfBirth: new Date("1955-12-30"), gender: "male", ethnicity: "NZ European", phone: "03-555-0107", address: "100 Colombo St", city: "Christchurch", region: "Canterbury", status: "active" } }),
    prisma.patient.create({ data: { nhiNumber: "HHH0123", firstName: "Aroha", lastName: "Te Koha", dateOfBirth: new Date("1988-04-07"), gender: "female", ethnicity: "Maori", iwi: "Ngapuhi", phone: "021-555-0108", email: "aroha.tk@email.co.nz", address: "12 Queen St", city: "Whangarei", region: "Northland", status: "active" } }),
  ]);

  const now = new Date();

  // Encounters
  await Promise.all([
    prisma.encounter.create({ data: { patientId: patients[0].id, type: "admission", status: "in-progress", department: "Emergency Medicine", diagnosis: "Fractured right tibia", diagnosisCode: "263225007", admitDate: new Date(now.getTime() - 2 * 86400000) } }),
    prisma.encounter.create({ data: { patientId: patients[1].id, type: "outpatient", status: "finished", department: "Cardiology", diagnosis: "Hypertension review", diagnosisCode: "38341003", admitDate: new Date(now.getTime() - 5 * 86400000), dischargeDate: new Date(now.getTime() - 5 * 86400000) } }),
    prisma.encounter.create({ data: { patientId: patients[2].id, type: "admission", status: "in-progress", department: "Orthopaedics", diagnosis: "ACL tear - sports injury", diagnosisCode: "444801000", admitDate: new Date(now.getTime() - 86400000) } }),
    prisma.encounter.create({ data: { patientId: patients[4].id, type: "admission", status: "in-progress", department: "General Medicine", diagnosis: "Type 2 Diabetes management", diagnosisCode: "44054006", admitDate: new Date(now.getTime() - 3 * 86400000) } }),
    prisma.encounter.create({ data: { patientId: patients[6].id, type: "outpatient", status: "finished", department: "Respiratory", diagnosis: "COPD exacerbation", diagnosisCode: "195951000", admitDate: new Date(now.getTime() - 7 * 86400000), dischargeDate: new Date(now.getTime() - 6 * 86400000) } }),
  ]);

  // Clinical notes
  await Promise.all([
    prisma.clinicalNote.create({ data: { patientId: patients[0].id, authorId: users[1].id, type: "soap", subjective: "Patient presents with severe pain in right leg after fall from ladder. Reports hearing a snap. Pain 8/10.", objective: "Right tibia tenderness, swelling, unable to bear weight. X-ray confirms displaced fracture of right tibial shaft.", assessment: "Displaced fracture of right tibial shaft. ACC claim filed for workplace injury.", plan: "Surgical fixation (ORIF) scheduled. Pain management with paracetamol and tramadol. ACC claim ACC-2024-00123 active." } }),
    prisma.clinicalNote.create({ data: { patientId: patients[2].id, authorId: users[1].id, type: "soap", subjective: "Young male athlete with knee injury during rugby. Felt a pop and immediate swelling.", objective: "Positive Lachman test, positive anterior drawer. MRI shows complete ACL tear with associated meniscal damage.", assessment: "Complete ACL tear right knee with medial meniscal tear. Sports-related injury, ACC eligible.", plan: "ACL reconstruction surgery scheduled. Pre-op bloods and anaesthesia review. Physio referral post-op." } }),
    prisma.clinicalNote.create({ data: { patientId: patients[4].id, authorId: users[1].id, type: "progress", content: "Day 3 of admission. Blood glucose levels stabilising with adjusted insulin regime. HbA1c 8.2% indicates poor long-term control. Dietitian review completed. Plan to titrate metformin to 1g BD." } }),
    prisma.clinicalNote.create({ data: { patientId: patients[7].id, authorId: users[2].id, type: "soap", subjective: "Patient reports persistent lower abdominal pain, moderate severity 5/10.", objective: "Abdomen soft, mild tenderness in suprapubic region. No rebound or guarding. Urinalysis NAD.", assessment: "Suspected endometriosis, further investigation required.", plan: "Referral to gynaecology for transvaginal USS. Prescribe naproxen 500mg BD PRN." } }),
  ]);

  // Appointments
  const tomorrow = new Date(now.getTime() + 86400000);
  const nextWeek = new Date(now.getTime() + 7 * 86400000);
  await Promise.all([
    prisma.appointment.create({ data: { patientId: patients[1].id, providerId: users[1].id, dateTime: tomorrow, duration: 30, type: "follow-up", department: "Cardiology", status: "scheduled", notes: "BP review, medication adjustment" } }),
    prisma.appointment.create({ data: { patientId: patients[3].id, providerId: users[1].id, dateTime: new Date(tomorrow.getTime() + 7200000), duration: 45, type: "consultation", department: "General Medicine", status: "scheduled" } }),
    prisma.appointment.create({ data: { patientId: patients[5].id, providerId: users[1].id, dateTime: nextWeek, duration: 30, type: "consultation", department: "Paediatrics", status: "scheduled" } }),
    prisma.appointment.create({ data: { patientId: patients[7].id, dateTime: new Date(now.getTime() - 86400000), duration: 60, type: "procedure", department: "Gynaecology", status: "completed" } }),
  ]);

  // Waitlist
  await Promise.all([
    prisma.waitlistEntry.create({ data: { patientId: patients[0].id, department: "Orthopaedics", priority: "urgent", procedure: "ORIF Right Tibia", targetDate: new Date(now.getTime() + 3 * 86400000), status: "waiting" } }),
    prisma.waitlistEntry.create({ data: { patientId: patients[2].id, department: "Orthopaedics", priority: "semi-urgent", procedure: "ACL Reconstruction", targetDate: new Date(now.getTime() + 14 * 86400000), status: "waiting" } }),
    prisma.waitlistEntry.create({ data: { patientId: patients[6].id, department: "Respiratory", priority: "routine", procedure: "Pulmonary Function Test", targetDate: new Date(now.getTime() + 30 * 86400000), status: "waiting" } }),
    prisma.waitlistEntry.create({ data: { patientId: patients[1].id, department: "Cardiology", priority: "semi-urgent", procedure: "Echocardiogram", targetDate: new Date(now.getTime() + 21 * 86400000), status: "waiting" } }),
    prisma.waitlistEntry.create({ data: { patientId: patients[4].id, department: "Ophthalmology", priority: "routine", procedure: "Diabetic Retinopathy Screening", targetDate: new Date(now.getTime() + 60 * 86400000), status: "waiting" } }),
  ]);

  // Observations
  await Promise.all([
    prisma.observation.create({ data: { patientId: patients[0].id, type: "vital-signs", code: "8867-4", codeName: "Heart Rate", value: "82", unit: "bpm" } }),
    prisma.observation.create({ data: { patientId: patients[0].id, type: "vital-signs", code: "8480-6", codeName: "Systolic Blood Pressure", value: "128", unit: "mmHg" } }),
    prisma.observation.create({ data: { patientId: patients[0].id, type: "lab-result", code: "718-7", codeName: "Haemoglobin", value: "135", unit: "g/L" } }),
    prisma.observation.create({ data: { patientId: patients[4].id, type: "lab-result", code: "4548-4", codeName: "HbA1c", value: "8.2", unit: "%" } }),
    prisma.observation.create({ data: { patientId: patients[4].id, type: "lab-result", code: "2345-7", codeName: "Glucose (Fasting)", value: "9.8", unit: "mmol/L" } }),
    prisma.observation.create({ data: { patientId: patients[1].id, type: "vital-signs", code: "8480-6", codeName: "Systolic Blood Pressure", value: "155", unit: "mmHg" } }),
    prisma.observation.create({ data: { patientId: patients[1].id, type: "lab-result", code: "2093-3", codeName: "Total Cholesterol", value: "6.2", unit: "mmol/L" } }),
  ]);

  // Drug Interactions
  await Promise.all([
    prisma.drugInteraction.create({ data: { drugA: "Warfarin", drugB: "Ibuprofen", severity: "critical", description: "NSAIDs increase bleeding risk with warfarin.", recommendation: "Avoid combination. Use paracetamol instead." } }),
    prisma.drugInteraction.create({ data: { drugA: "Warfarin", drugB: "Aspirin", severity: "critical", description: "Dual anticoagulation significantly increases bleeding risk.", recommendation: "Specialist review required." } }),
    prisma.drugInteraction.create({ data: { drugA: "Metformin", drugB: "Prednisone", severity: "major", description: "Corticosteroids may increase blood glucose.", recommendation: "Monitor blood glucose more frequently." } }),
    prisma.drugInteraction.create({ data: { drugA: "Metoprolol", drugB: "Salbutamol", severity: "moderate", description: "Beta-blockers may reduce bronchodilator effect.", recommendation: "Consider cardioselective beta-blocker." } }),
    prisma.drugInteraction.create({ data: { drugA: "Tramadol", drugB: "Codeine", severity: "major", description: "Both opioids — additive CNS depression.", recommendation: "Avoid combination." } }),
    prisma.drugInteraction.create({ data: { drugA: "Morphine", drugB: "Tramadol", severity: "critical", description: "Dual opioid use — high risk of respiratory depression.", recommendation: "Never combine." } }),
    prisma.drugInteraction.create({ data: { drugA: "Diclofenac", drugB: "Enoxaparin", severity: "critical", description: "NSAID + anticoagulant — significantly increased bleeding risk.", recommendation: "Avoid combination." } }),
    prisma.drugInteraction.create({ data: { drugA: "Aspirin", drugB: "Ibuprofen", severity: "major", description: "Ibuprofen may interfere with antiplatelet effect of aspirin.", recommendation: "Take aspirin 30 min before ibuprofen." } }),
  ]);

  // Medications
  await Promise.all([
    prisma.medication.create({ data: { patientId: patients[0].id, prescriberId: users[1].id, name: "Paracetamol (Panadol)", genericName: "Paracetamol", dose: "1g", unit: "mg", route: "oral", frequency: "QID", status: "administered", instructions: "Every 6 hours. Max 4g/day." } }),
    prisma.medication.create({ data: { patientId: patients[0].id, prescriberId: users[1].id, name: "Tramadol", genericName: "Tramadol", dose: "50mg", unit: "mg", route: "oral", frequency: "PRN", status: "dispensed", instructions: "For breakthrough pain." } }),
    prisma.medication.create({ data: { patientId: patients[0].id, prescriberId: users[1].id, name: "Enoxaparin (Clexane)", genericName: "Enoxaparin", dose: "40mg", unit: "mg", route: "sc", frequency: "OD", status: "administered", instructions: "DVT prophylaxis." } }),
    prisma.medication.create({ data: { patientId: patients[1].id, prescriberId: users[1].id, name: "Metoprolol", genericName: "Metoprolol", dose: "50mg", unit: "mg", route: "oral", frequency: "BD", status: "administered" } }),
    prisma.medication.create({ data: { patientId: patients[1].id, prescriberId: users[1].id, name: "Cilazapril", genericName: "Cilazapril", dose: "2.5mg", unit: "mg", route: "oral", frequency: "OD", status: "administered" } }),
    prisma.medication.create({ data: { patientId: patients[1].id, prescriberId: users[1].id, name: "Atorvastatin (Lipitor)", genericName: "Atorvastatin", dose: "20mg", unit: "mg", route: "oral", frequency: "NOCTE", status: "administered" } }),
    prisma.medication.create({ data: { patientId: patients[4].id, prescriberId: users[1].id, name: "Metformin (Glucophage)", genericName: "Metformin", dose: "1g", unit: "mg", route: "oral", frequency: "BD", status: "administered", instructions: "Take with meals." } }),
    prisma.medication.create({ data: { patientId: patients[6].id, prescriberId: users[1].id, name: "Salbutamol (Ventolin)", genericName: "Salbutamol", dose: "100mcg", unit: "mcg", route: "inhaled", frequency: "PRN", status: "administered", instructions: "2 puffs as needed." } }),
  ]);

  // Clinical Alerts
  await Promise.all([
    prisma.clinicalAlert.create({ data: { patientId: patients[0].id, type: "drug-interaction", severity: "warning", title: "DVT Prophylaxis Reminder", message: "Patient on Enoxaparin — monitor for signs of bleeding.", source: "CDSS" } }),
    prisma.clinicalAlert.create({ data: { patientId: patients[4].id, type: "lab-critical", severity: "critical", title: "HbA1c Above Target", message: "HbA1c 8.2% — target <7%. Review medication.", source: "Lab" } }),
    prisma.clinicalAlert.create({ data: { patientId: patients[1].id, type: "lab-critical", severity: "warning", title: "Elevated Blood Pressure", message: "SBP 155mmHg. Above target of <140mmHg.", source: "Nursing" } }),
    prisma.clinicalAlert.create({ data: { type: "sepsis", severity: "critical", title: "Sepsis Screening Reminder", message: "All ED admissions should be screened with NEWS2 within 15 minutes.", source: "CDSS" } }),
  ]);

  // Clinical Pathways
  await Promise.all([
    prisma.clinicalPathway.create({ data: { name: "Chest Pain Pathway", code: "CP-CHEST", description: "Standardised pathway for acute chest pain presentation in ED", category: "cardiac", expectedDuration: "4 hours", steps: JSON.stringify([{ step: 1, title: "Initial Assessment", description: "Triage, ECG within 10 minutes", timeframe: "0-10 min" }, { step: 2, title: "Bloods & Imaging", description: "Troponin, FBC, U&E, CXR", timeframe: "10-30 min" }]) } }),
    prisma.clinicalPathway.create({ data: { name: "Sepsis Pathway", code: "CP-SEPSIS", description: "Sepsis-6 bundle", category: "sepsis", expectedDuration: "1 hour", steps: JSON.stringify([{ step: 1, title: "Recognition", description: "NEWS2 >= 5", timeframe: "0-15 min" }, { step: 2, title: "Blood Cultures", description: "Take before antibiotics", timeframe: "0-15 min" }]) } }),
    prisma.clinicalPathway.create({ data: { name: "DVT Prophylaxis Pathway", code: "CP-DVT", description: "DVT prevention for surgical patients", category: "ortho", expectedDuration: "72 hours", steps: JSON.stringify([{ step: 1, title: "Risk Assessment", description: "VTE risk assessment using Padua score", timeframe: "On admission" }]) } }),
    prisma.clinicalPathway.create({ data: { name: "Diabetes Management Pathway", code: "CP-DM", description: "Inpatient diabetes management", category: "endocrine", expectedDuration: "5 days", steps: JSON.stringify([{ step: 1, title: "Assessment", description: "HbA1c, fasting glucose, renal function", timeframe: "Day 1" }]) } }),
  ]);

  // Vital Sign Sets
  await Promise.all([
    prisma.vitalSignSet.create({ data: { patientId: patients[0].id, heartRate: 82, systolicBP: 128, diastolicBP: 78, respiratoryRate: 16, temperature: 36.8, oxygenSat: 98, consciousness: "A", painScore: 8, news2Score: 1, recordedBy: users[2].name, recordedAt: new Date(now.getTime() - 4 * 3600000) } }),
    prisma.vitalSignSet.create({ data: { patientId: patients[0].id, heartRate: 78, systolicBP: 125, diastolicBP: 76, respiratoryRate: 15, temperature: 36.6, oxygenSat: 99, consciousness: "A", painScore: 6, news2Score: 0, recordedBy: users[2].name, recordedAt: new Date(now.getTime() - 8 * 3600000) } }),
    prisma.vitalSignSet.create({ data: { patientId: patients[2].id, heartRate: 72, systolicBP: 118, diastolicBP: 72, respiratoryRate: 14, temperature: 36.5, oxygenSat: 99, consciousness: "A", painScore: 5, news2Score: 0, recordedBy: users[2].name, recordedAt: new Date(now.getTime() - 2 * 3600000) } }),
    prisma.vitalSignSet.create({ data: { patientId: patients[4].id, heartRate: 92, systolicBP: 145, diastolicBP: 88, respiratoryRate: 20, temperature: 37.4, oxygenSat: 95, consciousness: "A", painScore: 3, news2Score: 4, recordedBy: users[2].name, recordedAt: new Date(now.getTime() - 3600000) } }),
    prisma.vitalSignSet.create({ data: { patientId: patients[4].id, heartRate: 96, systolicBP: 148, diastolicBP: 90, respiratoryRate: 22, temperature: 37.8, oxygenSat: 94, consciousness: "A", painScore: 4, news2Score: 6, recordedBy: users[2].name, recordedAt: new Date(now.getTime() - 13 * 3600000) } }),
  ]);

  // ACC Claims
  const accClaims = await Promise.all([
    prisma.aCCClaim.create({ data: { patientId: patients[0].id, claimNumber: "ACC-2024-00123", injuryDate: new Date(now.getTime() - 2 * 86400000), injuryDescription: "Fall from ladder at workplace. Displaced fracture of right tibial shaft.", injuryCode: "S82.1", claimType: "work", status: "accepted", totalCost: 12500 } }),
    prisma.aCCClaim.create({ data: { patientId: patients[2].id, claimNumber: "ACC-2024-00456", injuryDate: new Date(now.getTime() - 86400000), injuryDescription: "ACL tear during rugby match.", injuryCode: "S83.5", claimType: "sport", status: "lodged", totalCost: 0 } }),
    prisma.aCCClaim.create({ data: { patientId: patients[4].id, claimNumber: "ACC-2023-00789", injuryDate: new Date("2023-06-15"), injuryDescription: "Slip and fall at home. Wrist fracture.", injuryCode: "S52.5", claimType: "home", status: "closed", totalCost: 4200 } }),
    prisma.aCCClaim.create({ data: { patientId: patients[7].id, claimNumber: "ACC-2024-00567", injuryDate: new Date(now.getTime() - 30 * 86400000), injuryDescription: "Motor vehicle accident — whiplash.", injuryCode: "S13.4", claimType: "motor-vehicle", status: "accepted", totalCost: 3800 } }),
  ]);

  // ACC Events
  await Promise.all([
    prisma.aCCClaimEvent.create({ data: { claimId: accClaims[0].id, type: "lodged", description: "Claim lodged by ED physician.", cost: 0, eventDate: new Date(now.getTime() - 2 * 86400000) } }),
    prisma.aCCClaimEvent.create({ data: { claimId: accClaims[0].id, type: "treatment", description: "ORIF surgery scheduled.", cost: 8500, eventDate: new Date(now.getTime() - 86400000) } }),
    prisma.aCCClaimEvent.create({ data: { claimId: accClaims[1].id, type: "lodged", description: "Claim lodged for sports injury.", cost: 0, eventDate: new Date(now.getTime() - 86400000) } }),
    prisma.aCCClaimEvent.create({ data: { claimId: accClaims[2].id, type: "closed", description: "Claim closed — full recovery.", cost: 0, eventDate: new Date("2023-12-01") } }),
  ]);

  // Beds (simplified — 40 beds across wards)
  const wards = [
    { ward: "Medical Ward 1", count: 8 },
    { ward: "Surgical Ward", count: 6 },
    { ward: "ICU", count: 4 },
    { ward: "Emergency Department", count: 6 },
    { ward: "Orthopaedic Ward", count: 6 },
    { ward: "Maternity", count: 5 },
    { ward: "Paediatric Ward", count: 5 },
  ];
  const admittedIds = [patients[0].id, patients[2].id, patients[4].id];
  let admitIdx = 0;
  for (const w of wards) {
    for (let i = 1; i <= w.count; i++) {
      const prefix = w.ward.split(" ").map((x: string) => x[0]).join("");
      const bedNumber = `${prefix}-${String(i).padStart(2, "0")}`;
      const isFirst3 = admitIdx < admittedIds.length && i === 1;
      await prisma.bed.create({
        data: {
          ward: w.ward,
          bedNumber,
          status: isFirst3 ? "occupied" : (i <= Math.floor(w.count * 0.7) ? "occupied" : "available"),
          patientId: isFirst3 ? admittedIds[admitIdx++] : undefined,
        },
      });
    }
  }

  // Audit Logs
  await Promise.all([
    prisma.auditLog.create({ data: { userId: users[0].id, action: "LOGIN", entity: "User", entityId: users[0].id, severity: "info", details: JSON.stringify({ method: "password" }) } }),
    prisma.auditLog.create({ data: { userId: users[1].id, action: "LOGIN", entity: "User", entityId: users[1].id, severity: "info", details: JSON.stringify({ method: "password" }) } }),
    prisma.auditLog.create({ data: { userId: users[1].id, action: "CREATE", entity: "ClinicalNote", severity: "info", details: JSON.stringify({ patientNhi: "AAA1234", noteType: "soap" }), createdAt: new Date(now.getTime() - 2 * 3600000) } }),
    prisma.auditLog.create({ data: { userId: users[1].id, action: "PRESCRIBE", entity: "Medication", severity: "info", details: JSON.stringify({ patientNhi: "AAA1234", medication: "Tramadol 50mg" }), createdAt: new Date(now.getTime() - 3 * 3600000) } }),
    prisma.auditLog.create({ data: { userId: null, action: "CREATE", entity: "ClinicalAlert", severity: "critical", details: JSON.stringify({ alertType: "lab-critical", patientNhi: "EEE7890" }), createdAt: new Date(now.getTime() - 12 * 3600000) } }),
  ]);

  // ==================== LAB ORDERS ====================
  const h = 3600000;
  await Promise.all([
    prisma.labOrder.create({ data: { patientId: patients[0].id, orderedById: users[1].id, orderNumber: "LAB-2026-001", testName: "Full Blood Count (FBC)", testCode: "58410-2", priority: "stat", specimen: "Blood", clinicalNotes: "Pre-op for ORIF right tibia.", status: "completed", resultValue: "Hb 135, WBC 8.2, Plt 245", resultUnit: "g/L, ×10⁹/L, ×10⁹/L", referenceRange: "Hb 130-175, WBC 4.0-11.0, Plt 150-400", interpretation: "normal", resultNotes: "All parameters within normal range. Fit for surgery.", orderedAt: new Date(now.getTime() - 48 * h), collectedAt: new Date(now.getTime() - 47 * h), completedAt: new Date(now.getTime() - 45 * h) } }),
    prisma.labOrder.create({ data: { patientId: patients[4].id, orderedById: users[1].id, orderNumber: "LAB-2026-002", testName: "HbA1c", testCode: "4548-4", priority: "routine", specimen: "Blood", clinicalNotes: "Diabetes management review.", status: "completed", resultValue: "8.2", resultUnit: "%", referenceRange: "20-42 mmol/mol (<7%)", interpretation: "critical", resultNotes: "HbA1c significantly above target. Poor glycaemic control.", orderedAt: new Date(now.getTime() - 72 * h), collectedAt: new Date(now.getTime() - 71 * h), completedAt: new Date(now.getTime() - 68 * h) } }),
    prisma.labOrder.create({ data: { patientId: patients[1].id, orderedById: users[1].id, orderNumber: "LAB-2026-003", testName: "Lipid Panel", testCode: "57698-3", priority: "routine", specimen: "Blood", clinicalNotes: "Hypertension review. On atorvastatin 20mg.", status: "completed", resultValue: "TC 6.2, LDL 4.1, HDL 1.3, TG 1.8", resultUnit: "mmol/L", referenceRange: "TC <5.0, LDL <2.0, HDL >1.0, TG <1.7", interpretation: "abnormal", resultNotes: "LDL above target. Consider uptitrating atorvastatin.", orderedAt: new Date(now.getTime() - 120 * h), collectedAt: new Date(now.getTime() - 119 * h), completedAt: new Date(now.getTime() - 116 * h) } }),
    prisma.labOrder.create({ data: { patientId: patients[6].id, orderedById: users[1].id, orderNumber: "LAB-2026-004", testName: "Arterial Blood Gas", testCode: "24336-0", priority: "stat", specimen: "Blood", clinicalNotes: "COPD exacerbation. SpO2 94%.", status: "completed", resultValue: "pH 7.38, pO2 68, pCO2 48, HCO3 26", resultUnit: "mmHg", referenceRange: "pH 7.35-7.45, pO2 80-100, pCO2 35-45", interpretation: "abnormal", resultNotes: "Type 2 respiratory failure. Consider NIV if worsening.", orderedAt: new Date(now.getTime() - 168 * h), collectedAt: new Date(now.getTime() - 168 * h), completedAt: new Date(now.getTime() - 167 * h) } }),
    prisma.labOrder.create({ data: { patientId: patients[2].id, orderedById: users[1].id, orderNumber: "LAB-2026-005", testName: "Coagulation (INR/PT)", testCode: "5902-2", priority: "urgent", specimen: "Blood", clinicalNotes: "Pre-op ACL reconstruction.", status: "in-progress", orderedAt: new Date(now.getTime() - 6 * h), collectedAt: new Date(now.getTime() - 5 * h) } }),
    prisma.labOrder.create({ data: { patientId: patients[4].id, orderedById: users[1].id, orderNumber: "LAB-2026-006", testName: "Urea & Electrolytes (U&Es)", testCode: "24326-1", priority: "routine", specimen: "Blood", clinicalNotes: "Renal function check. On metformin.", status: "in-progress", orderedAt: new Date(now.getTime() - 8 * h), collectedAt: new Date(now.getTime() - 7 * h) } }),
    prisma.labOrder.create({ data: { patientId: patients[0].id, orderedById: users[1].id, orderNumber: "LAB-2026-007", testName: "C-Reactive Protein (CRP)", testCode: "1988-5", priority: "urgent", specimen: "Blood", clinicalNotes: "Post-surgical monitoring.", status: "collected", orderedAt: new Date(now.getTime() - 3 * h), collectedAt: new Date(now.getTime() - 2 * h) } }),
    prisma.labOrder.create({ data: { patientId: patients[3].id, orderedById: users[1].id, orderNumber: "LAB-2026-008", testName: "Thyroid Function (TFTs)", testCode: "3016-3", priority: "routine", specimen: "Blood", clinicalNotes: "Fatigue and weight gain.", status: "ordered", orderedAt: new Date(now.getTime() - h) } }),
    prisma.labOrder.create({ data: { patientId: patients[5].id, orderedById: users[1].id, orderNumber: "LAB-2026-009", testName: "Full Blood Count (FBC)", testCode: "58410-2", priority: "routine", specimen: "Blood", clinicalNotes: "Routine wellness check.", status: "ordered", orderedAt: new Date(now.getTime() - 30 * 60000) } }),
    prisma.labOrder.create({ data: { patientId: patients[7].id, orderedById: users[1].id, orderNumber: "LAB-2026-010", testName: "Urinalysis", testCode: "24356-8", priority: "routine", specimen: "Urine", clinicalNotes: "Lower abdominal pain. Rule out UTI.", status: "ordered", orderedAt: new Date(now.getTime() - 45 * 60000) } }),
    prisma.labOrder.create({ data: { patientId: patients[2].id, orderedById: users[1].id, orderNumber: "LAB-2026-011", testName: "Blood Group & Crossmatch", testCode: "882-1", priority: "stat", specimen: "Blood", clinicalNotes: "Pre-op ACL reconstruction.", status: "ordered", orderedAt: new Date(now.getTime() - 15 * 60000) } }),
    prisma.labOrder.create({ data: { patientId: patients[4].id, orderedById: users[1].id, orderNumber: "LAB-2026-012", testName: "Liver Function Tests (LFTs)", testCode: "24325-3", priority: "routine", specimen: "Blood", clinicalNotes: "Baseline liver function.", status: "completed", resultValue: "ALT 18, AST 22, ALP 65, GGT 30, Bili 12", resultUnit: "U/L", referenceRange: "ALT <40, AST <35, ALP 30-120, GGT <50, Bili <20", interpretation: "normal", resultNotes: "Normal liver function. Safe to commence statin.", orderedAt: new Date(now.getTime() - 96 * h), collectedAt: new Date(now.getTime() - 95 * h), completedAt: new Date(now.getTime() - 92 * h) } }),
    prisma.labOrder.create({ data: { patientId: patients[0].id, orderedById: users[1].id, orderNumber: "LAB-2026-013", testName: "D-Dimer", testCode: "48065-7", priority: "stat", specimen: "Blood", clinicalNotes: "Post-fracture DVT screening.", status: "completed", resultValue: "0.8", resultUnit: "mg/L FEU", referenceRange: "<0.5 mg/L FEU", interpretation: "abnormal", resultNotes: "Elevated D-dimer. USS Doppler recommended.", orderedAt: new Date(now.getTime() - 36 * h), collectedAt: new Date(now.getTime() - 35 * h), completedAt: new Date(now.getTime() - 33 * h) } }),
    prisma.labOrder.create({ data: { patientId: patients[1].id, orderedById: users[1].id, orderNumber: "LAB-2026-014", testName: "Troponin T", testCode: "6598-7", priority: "stat", specimen: "Blood", clinicalNotes: "Chest discomfort. Rule out ACS.", status: "completed", resultValue: "8", resultUnit: "ng/L", referenceRange: "<14 ng/L", interpretation: "normal", resultNotes: "Troponin normal. Low risk for acute coronary event.", orderedAt: new Date(now.getTime() - 24 * h), collectedAt: new Date(now.getTime() - 24 * h), completedAt: new Date(now.getTime() - 23 * h) } }),
    prisma.labOrder.create({ data: { patientId: patients[3].id, orderedById: users[1].id, orderNumber: "LAB-2026-015", testName: "Blood Cultures", testCode: "600-7", priority: "urgent", specimen: "Blood", clinicalNotes: "Fever — subsequently resolved.", status: "cancelled", orderedAt: new Date(now.getTime() - 60 * h) } }),
  ]);

  return {
    users: 4,
    patients: 8,
    encounters: 5,
    clinicalNotes: 4,
    appointments: 4,
    waitlistEntries: 5,
    observations: 7,
    drugInteractions: 8,
    medications: 8,
    clinicalAlerts: 4,
    clinicalPathways: 4,
    vitalSignSets: 5,
    accClaims: 4,
    labOrders: 15,
  };
}
