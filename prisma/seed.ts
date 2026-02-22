import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
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

  console.log("Cleared existing data...");

  // Create demo users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "admin@nzhis.co.nz",
        name: "Dr. Sarah Mitchell",
        password: "$2a$10$k7Iy7gJzMjEz5RUVnOqFXeA5MjXbQ3UhJ1zK.WfJ8wX9v7Kz9Kyq2",
        role: "admin",
        department: "Administration",
        hpiNumber: "HPI-00001",
      },
    }),
    prisma.user.create({
      data: {
        email: "doctor@nzhis.co.nz",
        name: "Dr. James Henare",
        password: "$2a$10$k7Iy7gJzMjEz5RUVnOqFXeA5MjXbQ3UhJ1zK.WfJ8wX9v7Kz9Kyq2",
        role: "doctor",
        department: "Emergency Medicine",
        hpiNumber: "HPI-00002",
      },
    }),
    prisma.user.create({
      data: {
        email: "nurse@nzhis.co.nz",
        name: "Aroha Williams",
        password: "$2a$10$k7Iy7gJzMjEz5RUVnOqFXeA5MjXbQ3UhJ1zK.WfJ8wX9v7Kz9Kyq2",
        role: "nurse",
        department: "General Medicine",
        hpiNumber: "HPI-00003",
      },
    }),
    prisma.user.create({
      data: {
        email: "reception@nzhis.co.nz",
        name: "Mele Taufa",
        password: "$2a$10$k7Iy7gJzMjEz5RUVnOqFXeA5MjXbQ3UhJ1zK.WfJ8wX9v7Kz9Kyq2",
        role: "receptionist",
        department: "Front Desk",
      },
    }),
  ]);

  // Create patients with NZ-realistic names
  const patients = await Promise.all([
    prisma.patient.create({
      data: {
        nhiNumber: "AAA1234",
        firstName: "Hemi",
        lastName: "Tuhoe",
        dateOfBirth: new Date("1985-03-15"),
        gender: "male",
        ethnicity: "Maori",
        iwi: "Ngai Tuhoe",
        phone: "021-555-0101",
        email: "hemi.tuhoe@email.co.nz",
        address: "42 Karangahape Rd",
        city: "Auckland",
        region: "Auckland",
        accClaimNumber: "ACC-2024-00123",
        accClaimStatus: "active",
        status: "active",
      },
    }),
    prisma.patient.create({
      data: {
        nhiNumber: "BBB5678",
        firstName: "Emma",
        lastName: "Thompson",
        dateOfBirth: new Date("1972-08-22"),
        gender: "female",
        ethnicity: "NZ European",
        phone: "027-555-0102",
        email: "emma.t@email.co.nz",
        address: "15 Willis Street",
        city: "Wellington",
        region: "Wellington",
        status: "active",
      },
    }),
    prisma.patient.create({
      data: {
        nhiNumber: "CCC9012",
        firstName: "Sione",
        lastName: "Manu",
        dateOfBirth: new Date("1990-11-03"),
        gender: "male",
        ethnicity: "Pacific Islander",
        phone: "022-555-0103",
        address: "88 Great South Rd",
        city: "Manukau",
        region: "Auckland",
        accClaimNumber: "ACC-2024-00456",
        accClaimStatus: "pending",
        status: "active",
      },
    }),
    prisma.patient.create({
      data: {
        nhiNumber: "DDD3456",
        firstName: "Mei",
        lastName: "Chen",
        dateOfBirth: new Date("1995-06-18"),
        gender: "female",
        ethnicity: "Asian",
        phone: "021-555-0104",
        email: "mei.chen@email.co.nz",
        address: "23 Dominion Rd",
        city: "Auckland",
        region: "Auckland",
        status: "active",
      },
    }),
    prisma.patient.create({
      data: {
        nhiNumber: "EEE7890",
        firstName: "Wiremu",
        lastName: "Ngata",
        dateOfBirth: new Date("1968-01-25"),
        gender: "male",
        ethnicity: "Maori",
        iwi: "Ngati Porou",
        phone: "027-555-0105",
        address: "5 Marine Parade",
        city: "Gisborne",
        region: "Gisborne",
        accClaimNumber: "ACC-2023-00789",
        accClaimStatus: "closed",
        status: "active",
      },
    }),
    prisma.patient.create({
      data: {
        nhiNumber: "FFF2345",
        firstName: "Leilani",
        lastName: "Pasifika",
        dateOfBirth: new Date("2001-09-12"),
        gender: "female",
        ethnicity: "Pacific Islander",
        phone: "022-555-0106",
        address: "67 Otahuhu Rd",
        city: "Auckland",
        region: "Auckland",
        status: "active",
      },
    }),
    prisma.patient.create({
      data: {
        nhiNumber: "GGG6789",
        firstName: "David",
        lastName: "Stewart",
        dateOfBirth: new Date("1955-12-30"),
        gender: "male",
        ethnicity: "NZ European",
        phone: "03-555-0107",
        address: "100 Colombo St",
        city: "Christchurch",
        region: "Canterbury",
        status: "active",
      },
    }),
    prisma.patient.create({
      data: {
        nhiNumber: "HHH0123",
        firstName: "Aroha",
        lastName: "Te Koha",
        dateOfBirth: new Date("1988-04-07"),
        gender: "female",
        ethnicity: "Maori",
        iwi: "Ngapuhi",
        phone: "021-555-0108",
        email: "aroha.tk@email.co.nz",
        address: "12 Queen St",
        city: "Whangarei",
        region: "Northland",
        status: "active",
      },
    }),
  ]);

  // Create encounters
  const now = new Date();
  const encounters = await Promise.all([
    prisma.encounter.create({
      data: {
        patientId: patients[0].id,
        type: "admission",
        status: "in-progress",
        department: "Emergency Medicine",
        diagnosis: "Fractured right tibia",
        diagnosisCode: "263225007",
        admitDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.encounter.create({
      data: {
        patientId: patients[1].id,
        type: "outpatient",
        status: "finished",
        department: "Cardiology",
        diagnosis: "Hypertension review",
        diagnosisCode: "38341003",
        admitDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        dischargeDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.encounter.create({
      data: {
        patientId: patients[2].id,
        type: "admission",
        status: "in-progress",
        department: "Orthopaedics",
        diagnosis: "ACL tear - sports injury",
        diagnosisCode: "444801000",
        admitDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.encounter.create({
      data: {
        patientId: patients[4].id,
        type: "admission",
        status: "in-progress",
        department: "General Medicine",
        diagnosis: "Type 2 Diabetes management",
        diagnosisCode: "44054006",
        admitDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.encounter.create({
      data: {
        patientId: patients[6].id,
        type: "outpatient",
        status: "finished",
        department: "Respiratory",
        diagnosis: "COPD exacerbation",
        diagnosisCode: "195951000",
        admitDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        dischargeDate: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  // Clinical notes
  await Promise.all([
    prisma.clinicalNote.create({
      data: {
        patientId: patients[0].id,
        authorId: users[1].id,
        type: "soap",
        subjective: "Patient presents with severe pain in right leg after fall from ladder. Reports hearing a snap. Pain 8/10.",
        objective: "Right tibia tenderness, swelling, unable to bear weight. X-ray confirms displaced fracture of right tibial shaft.",
        assessment: "Displaced fracture of right tibial shaft. ACC claim filed for workplace injury.",
        plan: "Surgical fixation (ORIF) scheduled. Pain management with paracetamol and tramadol. ACC claim ACC-2024-00123 active.",
      },
    }),
    prisma.clinicalNote.create({
      data: {
        patientId: patients[2].id,
        authorId: users[1].id,
        type: "soap",
        subjective: "Young male athlete with knee injury during rugby. Felt a pop and immediate swelling. Cannot straighten knee fully.",
        objective: "Positive Lachman test, positive anterior drawer. MRI shows complete ACL tear with associated meniscal damage.",
        assessment: "Complete ACL tear right knee with medial meniscal tear. Sports-related injury, ACC eligible.",
        plan: "ACL reconstruction surgery scheduled. Pre-op bloods and anaesthesia review. Physio referral post-op. ACC claim pending.",
      },
    }),
    prisma.clinicalNote.create({
      data: {
        patientId: patients[4].id,
        authorId: users[1].id,
        type: "progress",
        content: "Day 3 of admission. Blood glucose levels stabilising with adjusted insulin regime. HbA1c 8.2% indicates poor long-term control. Dietitian review completed. Diabetes nurse specialist to see patient today for education. Plan to titrate metformin to 1g BD. Eye screening referral made for diabetic retinopathy. Podiatry assessment pending.",
      },
    }),
    prisma.clinicalNote.create({
      data: {
        patientId: patients[7].id,
        authorId: users[2].id,
        type: "soap",
        subjective: "Patient reports persistent lower abdominal pain, moderate severity 5/10. Associated with irregular menstrual cycle.",
        objective: "Abdomen soft, mild tenderness in suprapubic region. No rebound or guarding. Urinalysis NAD.",
        assessment: "Suspected endometriosis, further investigation required.",
        plan: "Referral to gynaecology for transvaginal USS. Prescribe naproxen 500mg BD PRN for pain. Follow-up in 2 weeks.",
      },
    }),
  ]);

  // Appointments
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  await Promise.all([
    prisma.appointment.create({
      data: {
        patientId: patients[1].id,
        providerId: users[1].id,
        dateTime: tomorrow,
        duration: 30,
        type: "follow-up",
        department: "Cardiology",
        status: "scheduled",
        notes: "BP review, medication adjustment",
      },
    }),
    prisma.appointment.create({
      data: {
        patientId: patients[3].id,
        providerId: users[1].id,
        dateTime: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000),
        duration: 45,
        type: "consultation",
        department: "General Medicine",
        status: "scheduled",
      },
    }),
    prisma.appointment.create({
      data: {
        patientId: patients[5].id,
        providerId: users[1].id,
        dateTime: nextWeek,
        duration: 30,
        type: "consultation",
        department: "Paediatrics",
        status: "scheduled",
      },
    }),
    prisma.appointment.create({
      data: {
        patientId: patients[7].id,
        dateTime: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        duration: 60,
        type: "procedure",
        department: "Gynaecology",
        status: "completed",
      },
    }),
  ]);

  // Waitlist entries
  await Promise.all([
    prisma.waitlistEntry.create({
      data: {
        patientId: patients[0].id,
        department: "Orthopaedics",
        priority: "urgent",
        procedure: "ORIF Right Tibia",
        targetDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        status: "waiting",
      },
    }),
    prisma.waitlistEntry.create({
      data: {
        patientId: patients[2].id,
        department: "Orthopaedics",
        priority: "semi-urgent",
        procedure: "ACL Reconstruction",
        targetDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        status: "waiting",
      },
    }),
    prisma.waitlistEntry.create({
      data: {
        patientId: patients[6].id,
        department: "Respiratory",
        priority: "routine",
        procedure: "Pulmonary Function Test",
        targetDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        status: "waiting",
      },
    }),
    prisma.waitlistEntry.create({
      data: {
        patientId: patients[1].id,
        department: "Cardiology",
        priority: "semi-urgent",
        procedure: "Echocardiogram",
        targetDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
        status: "waiting",
      },
    }),
    prisma.waitlistEntry.create({
      data: {
        patientId: patients[4].id,
        department: "Ophthalmology",
        priority: "routine",
        procedure: "Diabetic Retinopathy Screening",
        targetDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
        status: "waiting",
      },
    }),
  ]);

  // Observations (lab results & vitals)
  await Promise.all([
    prisma.observation.create({ data: { patientId: patients[0].id, type: "vital-signs", code: "8867-4", codeName: "Heart Rate", value: "82", unit: "bpm" } }),
    prisma.observation.create({ data: { patientId: patients[0].id, type: "vital-signs", code: "8480-6", codeName: "Systolic Blood Pressure", value: "128", unit: "mmHg" } }),
    prisma.observation.create({ data: { patientId: patients[0].id, type: "lab-result", code: "718-7", codeName: "Haemoglobin", value: "135", unit: "g/L" } }),
    prisma.observation.create({ data: { patientId: patients[4].id, type: "lab-result", code: "4548-4", codeName: "HbA1c", value: "8.2", unit: "%" } }),
    prisma.observation.create({ data: { patientId: patients[4].id, type: "lab-result", code: "2345-7", codeName: "Glucose (Fasting)", value: "9.8", unit: "mmol/L" } }),
    prisma.observation.create({ data: { patientId: patients[1].id, type: "vital-signs", code: "8480-6", codeName: "Systolic Blood Pressure", value: "155", unit: "mmHg" } }),
    prisma.observation.create({ data: { patientId: patients[1].id, type: "lab-result", code: "2093-3", codeName: "Total Cholesterol", value: "6.2", unit: "mmol/L" } }),
  ]);

  // ==================== NEW SEED DATA ====================

  // Drug Interactions (15+)
  await Promise.all([
    prisma.drugInteraction.create({ data: { drugA: "Warfarin", drugB: "Ibuprofen", severity: "critical", description: "NSAIDs increase bleeding risk with warfarin. May cause GI haemorrhage.", recommendation: "Avoid combination. Use paracetamol for analgesia instead." } }),
    prisma.drugInteraction.create({ data: { drugA: "Warfarin", drugB: "Aspirin", severity: "critical", description: "Dual anticoagulation significantly increases bleeding risk.", recommendation: "Specialist review required. Monitor INR closely if combination essential." } }),
    prisma.drugInteraction.create({ data: { drugA: "Metformin", drugB: "Prednisone", severity: "major", description: "Corticosteroids may increase blood glucose, reducing metformin effectiveness.", recommendation: "Monitor blood glucose more frequently. May need temporary insulin." } }),
    prisma.drugInteraction.create({ data: { drugA: "Metoprolol", drugB: "Salbutamol", severity: "moderate", description: "Beta-blockers may reduce bronchodilator effect of salbutamol.", recommendation: "Consider cardioselective beta-blocker. Monitor respiratory response." } }),
    prisma.drugInteraction.create({ data: { drugA: "Tramadol", drugB: "Codeine", severity: "major", description: "Both opioids — additive CNS depression and respiratory risk.", recommendation: "Avoid combination. Use one opioid at appropriate dose." } }),
    prisma.drugInteraction.create({ data: { drugA: "Cilazapril", drugB: "Enoxaparin", severity: "moderate", description: "ACE inhibitors with anticoagulants may increase hyperkalaemia risk.", recommendation: "Monitor potassium levels. Renal function check recommended." } }),
    prisma.drugInteraction.create({ data: { drugA: "Atorvastatin", drugB: "Amoxicillin", severity: "minor", description: "Minor interaction — amoxicillin may marginally affect statin metabolism.", recommendation: "No action required. Standard monitoring sufficient." } }),
    prisma.drugInteraction.create({ data: { drugA: "Amlodipine", drugB: "Metoprolol", severity: "moderate", description: "Both agents lower blood pressure — risk of hypotension and bradycardia.", recommendation: "Monitor BP and heart rate. Start at lower doses." } }),
    prisma.drugInteraction.create({ data: { drugA: "Morphine", drugB: "Tramadol", severity: "critical", description: "Dual opioid use — high risk of respiratory depression.", recommendation: "Never combine. Use one opioid agent only." } }),
    prisma.drugInteraction.create({ data: { drugA: "Warfarin", drugB: "Omeprazole", severity: "moderate", description: "Omeprazole may inhibit warfarin metabolism via CYP2C19.", recommendation: "Monitor INR when starting or stopping. Consider pantoprazole." } }),
    prisma.drugInteraction.create({ data: { drugA: "Diclofenac", drugB: "Enoxaparin", severity: "critical", description: "NSAID + anticoagulant — significantly increased bleeding risk.", recommendation: "Avoid combination. Use paracetamol for pain relief." } }),
    prisma.drugInteraction.create({ data: { drugA: "Flucloxacillin", drugB: "Warfarin", severity: "major", description: "Flucloxacillin may reduce warfarin levels via enzyme induction.", recommendation: "Monitor INR closely. May need warfarin dose adjustment." } }),
    prisma.drugInteraction.create({ data: { drugA: "Prednisone", drugB: "Ibuprofen", severity: "major", description: "Additive GI ulceration risk with corticosteroid + NSAID.", recommendation: "Add PPI cover (omeprazole). Consider alternative analgesia." } }),
    prisma.drugInteraction.create({ data: { drugA: "Codeine", drugB: "Morphine", severity: "critical", description: "Additive opioid effects — severe respiratory depression risk.", recommendation: "Avoid. Use single opioid with appropriate dosing." } }),
    prisma.drugInteraction.create({ data: { drugA: "Aspirin", drugB: "Ibuprofen", severity: "major", description: "Ibuprofen may interfere with antiplatelet effect of aspirin.", recommendation: "Take aspirin 30 min before ibuprofen, or use alternative NSAID." } }),
    prisma.drugInteraction.create({ data: { drugA: "Metformin", drugB: "Ceftriaxone", severity: "minor", description: "Minimal interaction expected.", recommendation: "No dose adjustment needed." } }),
  ]);

  // Medications per patient
  await Promise.all([
    // Patient 0 - Hemi (fracture)
    prisma.medication.create({ data: { patientId: patients[0].id, prescriberId: users[1].id, name: "Paracetamol (Panadol)", genericName: "Paracetamol", dose: "1g", unit: "mg", route: "oral", frequency: "QID", status: "administered", instructions: "Every 6 hours. Max 4g/day." } }),
    prisma.medication.create({ data: { patientId: patients[0].id, prescriberId: users[1].id, name: "Tramadol", genericName: "Tramadol", dose: "50mg", unit: "mg", route: "oral", frequency: "PRN", status: "dispensed", instructions: "For breakthrough pain. Max 400mg/day." } }),
    prisma.medication.create({ data: { patientId: patients[0].id, prescriberId: users[1].id, name: "Enoxaparin (Clexane)", genericName: "Enoxaparin", dose: "40mg", unit: "mg", route: "sc", frequency: "OD", status: "administered", instructions: "DVT prophylaxis. Subcutaneous injection." } }),
    // Patient 1 - Emma (hypertension)
    prisma.medication.create({ data: { patientId: patients[1].id, prescriberId: users[1].id, name: "Metoprolol", genericName: "Metoprolol", dose: "50mg", unit: "mg", route: "oral", frequency: "BD", status: "administered" } }),
    prisma.medication.create({ data: { patientId: patients[1].id, prescriberId: users[1].id, name: "Cilazapril", genericName: "Cilazapril", dose: "2.5mg", unit: "mg", route: "oral", frequency: "OD", status: "administered" } }),
    prisma.medication.create({ data: { patientId: patients[1].id, prescriberId: users[1].id, name: "Atorvastatin (Lipitor)", genericName: "Atorvastatin", dose: "20mg", unit: "mg", route: "oral", frequency: "NOCTE", status: "administered" } }),
    // Patient 2 - Sione (ACL)
    prisma.medication.create({ data: { patientId: patients[2].id, prescriberId: users[1].id, name: "Diclofenac (Voltaren)", genericName: "Diclofenac", dose: "50mg", unit: "mg", route: "oral", frequency: "TDS", status: "dispensed", instructions: "Take with food." } }),
    prisma.medication.create({ data: { patientId: patients[2].id, prescriberId: users[1].id, name: "Omeprazole (Losec)", genericName: "Omeprazole", dose: "20mg", unit: "mg", route: "oral", frequency: "OD", status: "dispensed", instructions: "GI protection with NSAID." } }),
    // Patient 4 - Wiremu (diabetes)
    prisma.medication.create({ data: { patientId: patients[4].id, prescriberId: users[1].id, name: "Metformin (Glucophage)", genericName: "Metformin", dose: "1g", unit: "mg", route: "oral", frequency: "BD", status: "administered", instructions: "Take with meals." } }),
    prisma.medication.create({ data: { patientId: patients[4].id, prescriberId: users[1].id, name: "Aspirin", genericName: "Aspirin", dose: "100mg", unit: "mg", route: "oral", frequency: "OD", status: "administered", instructions: "Cardiovascular protection." } }),
    // Patient 6 - David (COPD)
    prisma.medication.create({ data: { patientId: patients[6].id, prescriberId: users[1].id, name: "Salbutamol (Ventolin)", genericName: "Salbutamol", dose: "100mcg", unit: "mcg", route: "inhaled", frequency: "PRN", status: "administered", instructions: "2 puffs as needed for breathlessness." } }),
    prisma.medication.create({ data: { patientId: patients[6].id, prescriberId: users[1].id, name: "Prednisone", genericName: "Prednisone", dose: "40mg", unit: "mg", route: "oral", frequency: "OD", status: "administered", instructions: "5-day tapering course for exacerbation." } }),
  ]);

  // Clinical Alerts (5+)
  await Promise.all([
    prisma.clinicalAlert.create({ data: { patientId: patients[0].id, type: "drug-interaction", severity: "warning", title: "DVT Prophylaxis Reminder", message: "Patient on Enoxaparin — monitor for signs of bleeding. Check platelet count at day 5.", source: "CDSS" } }),
    prisma.clinicalAlert.create({ data: { patientId: patients[4].id, type: "lab-critical", severity: "critical", title: "HbA1c Above Target", message: "HbA1c 8.2% — target <7%. Patient requires diabetes management review and medication adjustment.", source: "Lab" } }),
    prisma.clinicalAlert.create({ data: { patientId: patients[1].id, type: "lab-critical", severity: "warning", title: "Elevated Blood Pressure", message: "SBP 155mmHg recorded. Above target of <140mmHg. Review antihypertensive regimen.", source: "Nursing" } }),
    prisma.clinicalAlert.create({ data: { patientId: patients[4].id, type: "fall-risk", severity: "warning", title: "Falls Risk — Elderly Diabetic", message: "Age 58, diabetes with neuropathy risk, on metformin. Falls prevention measures recommended.", source: "Nursing" } }),
    prisma.clinicalAlert.create({ data: { type: "sepsis", severity: "critical", title: "Sepsis Screening Reminder", message: "System reminder: All ED admissions should be screened with NEWS2 within 15 minutes of arrival.", source: "CDSS" } }),
    prisma.clinicalAlert.create({ data: { patientId: patients[2].id, type: "allergy", severity: "info", title: "Pre-op Assessment Due", message: "ACL reconstruction scheduled — anaesthesia review and pre-op bloods required within 48 hours.", source: "CDSS" } }),
    prisma.clinicalAlert.create({ data: { patientId: patients[6].id, type: "pathway", severity: "info", title: "COPD Pathway Step 3", message: "Patient due for respiratory physio assessment and spirometry before discharge planning.", source: "CDSS" } }),
  ]);

  // Clinical Pathways (4)
  await Promise.all([
    prisma.clinicalPathway.create({
      data: {
        name: "Chest Pain Pathway",
        code: "CP-CHEST",
        description: "Standardised pathway for acute chest pain presentation in ED",
        category: "cardiac",
        expectedDuration: "4 hours",
        steps: JSON.stringify([
          { step: 1, title: "Initial Assessment", description: "Triage, ECG within 10 minutes, vital signs", timeframe: "0-10 min" },
          { step: 2, title: "Bloods & Imaging", description: "Troponin, FBC, U&E, CXR", timeframe: "10-30 min" },
          { step: 3, title: "Risk Stratification", description: "HEART score calculation, NEWS2", timeframe: "30-60 min" },
          { step: 4, title: "Treatment Decision", description: "Based on risk: discharge / observe / cardiology referral / PCI", timeframe: "1-4 hours" },
        ]),
      },
    }),
    prisma.clinicalPathway.create({
      data: {
        name: "Sepsis Pathway",
        code: "CP-SEPSIS",
        description: "Sepsis-6 bundle: recognition, resuscitation, and antimicrobial therapy",
        category: "sepsis",
        expectedDuration: "1 hour",
        steps: JSON.stringify([
          { step: 1, title: "Recognition", description: "NEWS2 >= 5 or clinical suspicion. Screen for infection source.", timeframe: "0-15 min" },
          { step: 2, title: "Blood Cultures", description: "Take blood cultures BEFORE antibiotics", timeframe: "0-15 min" },
          { step: 3, title: "IV Antibiotics", description: "Empirical broad-spectrum antibiotics within 1 hour", timeframe: "Within 60 min" },
          { step: 4, title: "IV Fluids", description: "500ml crystalloid stat if SBP <90 or lactate >2", timeframe: "Within 60 min" },
          { step: 5, title: "Lactate & Urine Output", description: "Check serum lactate. Catheterise and monitor urine output", timeframe: "Within 60 min" },
          { step: 6, title: "Reassess", description: "Senior review. Repeat NEWS2. ICU referral if not improving.", timeframe: "1-2 hours" },
        ]),
      },
    }),
    prisma.clinicalPathway.create({
      data: {
        name: "DVT Prophylaxis Pathway",
        code: "CP-DVT",
        description: "Deep vein thrombosis prevention for surgical and immobile patients",
        category: "ortho",
        expectedDuration: "72 hours",
        steps: JSON.stringify([
          { step: 1, title: "Risk Assessment", description: "VTE risk assessment on admission using Padua score", timeframe: "On admission" },
          { step: 2, title: "Mechanical Prophylaxis", description: "Anti-embolism stockings and/or IPC if no contraindication", timeframe: "Within 4 hours" },
          { step: 3, title: "Pharmacological Prophylaxis", description: "Enoxaparin 40mg SC daily (adjust for renal function)", timeframe: "Within 14 hours" },
          { step: 4, title: "Monitoring", description: "Check platelets day 5 (HIT screening). Monitor for bleeding.", timeframe: "Day 5" },
        ]),
      },
    }),
    prisma.clinicalPathway.create({
      data: {
        name: "Diabetes Management Pathway",
        code: "CP-DM",
        description: "Inpatient diabetes management and insulin titration",
        category: "endocrine",
        expectedDuration: "5 days",
        steps: JSON.stringify([
          { step: 1, title: "Assessment", description: "HbA1c, fasting glucose, renal function, foot check", timeframe: "Day 1" },
          { step: 2, title: "Glucose Monitoring", description: "QID BGL monitoring. Sliding scale insulin if >15mmol/L", timeframe: "Ongoing" },
          { step: 3, title: "Medication Review", description: "Review oral hypoglycaemics. Consider insulin if HbA1c >9%", timeframe: "Day 1-2" },
          { step: 4, title: "Education", description: "Diabetes nurse specialist education. Diet and lifestyle counselling.", timeframe: "Day 2-3" },
          { step: 5, title: "Discharge Planning", description: "GP letter, medication plan, retinopathy screening, podiatry referral", timeframe: "Day 4-5" },
        ]),
      },
    }),
  ]);

  // Vital Sign Sets (for admitted patients)
  await Promise.all([
    // Patient 0 - Hemi (3 sets)
    prisma.vitalSignSet.create({ data: { patientId: patients[0].id, heartRate: 82, systolicBP: 128, diastolicBP: 78, respiratoryRate: 16, temperature: 36.8, oxygenSat: 98, consciousness: "A", painScore: 8, news2Score: 1, recordedBy: users[2].name, recordedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000) } }),
    prisma.vitalSignSet.create({ data: { patientId: patients[0].id, heartRate: 78, systolicBP: 125, diastolicBP: 76, respiratoryRate: 15, temperature: 36.6, oxygenSat: 99, consciousness: "A", painScore: 6, news2Score: 0, recordedBy: users[2].name, recordedAt: new Date(now.getTime() - 8 * 60 * 60 * 1000) } }),
    prisma.vitalSignSet.create({ data: { patientId: patients[0].id, heartRate: 88, systolicBP: 135, diastolicBP: 82, respiratoryRate: 18, temperature: 37.2, oxygenSat: 97, consciousness: "A", painScore: 7, news2Score: 1, recordedBy: users[2].name, recordedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000) } }),
    // Patient 2 - Sione (3 sets)
    prisma.vitalSignSet.create({ data: { patientId: patients[2].id, heartRate: 72, systolicBP: 118, diastolicBP: 72, respiratoryRate: 14, temperature: 36.5, oxygenSat: 99, consciousness: "A", painScore: 5, news2Score: 0, recordedBy: users[2].name, recordedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) } }),
    prisma.vitalSignSet.create({ data: { patientId: patients[2].id, heartRate: 68, systolicBP: 115, diastolicBP: 70, respiratoryRate: 14, temperature: 36.4, oxygenSat: 99, consciousness: "A", painScore: 4, news2Score: 0, recordedBy: users[2].name, recordedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000) } }),
    prisma.vitalSignSet.create({ data: { patientId: patients[2].id, heartRate: 75, systolicBP: 120, diastolicBP: 74, respiratoryRate: 15, temperature: 36.6, oxygenSat: 98, consciousness: "A", painScore: 6, news2Score: 0, recordedBy: users[2].name, recordedAt: new Date(now.getTime() - 10 * 60 * 60 * 1000) } }),
    // Patient 4 - Wiremu (4 sets, showing deterioration pattern)
    prisma.vitalSignSet.create({ data: { patientId: patients[4].id, heartRate: 92, systolicBP: 145, diastolicBP: 88, respiratoryRate: 20, temperature: 37.4, oxygenSat: 95, consciousness: "A", painScore: 3, news2Score: 4, recordedBy: users[2].name, recordedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000) } }),
    prisma.vitalSignSet.create({ data: { patientId: patients[4].id, heartRate: 88, systolicBP: 140, diastolicBP: 85, respiratoryRate: 18, temperature: 37.1, oxygenSat: 96, consciousness: "A", painScore: 2, news2Score: 2, recordedBy: users[2].name, recordedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000) } }),
    prisma.vitalSignSet.create({ data: { patientId: patients[4].id, heartRate: 85, systolicBP: 138, diastolicBP: 84, respiratoryRate: 17, temperature: 36.9, oxygenSat: 97, consciousness: "A", painScore: 2, news2Score: 1, recordedBy: users[2].name, recordedAt: new Date(now.getTime() - 9 * 60 * 60 * 1000) } }),
    prisma.vitalSignSet.create({ data: { patientId: patients[4].id, heartRate: 96, systolicBP: 148, diastolicBP: 90, respiratoryRate: 22, temperature: 37.8, oxygenSat: 94, consciousness: "A", painScore: 4, news2Score: 6, recordedBy: users[2].name, recordedAt: new Date(now.getTime() - 13 * 60 * 60 * 1000) } }),
  ]);

  // ACC Claims
  const accClaims = await Promise.all([
    prisma.aCCClaim.create({
      data: {
        patientId: patients[0].id,
        claimNumber: "ACC-2024-00123",
        injuryDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        injuryDescription: "Fall from ladder at workplace. Displaced fracture of right tibial shaft.",
        injuryCode: "S82.1",
        claimType: "work",
        status: "accepted",
        totalCost: 12500,
      },
    }),
    prisma.aCCClaim.create({
      data: {
        patientId: patients[2].id,
        claimNumber: "ACC-2024-00456",
        injuryDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        injuryDescription: "ACL tear during rugby match. Complete rupture with meniscal damage.",
        injuryCode: "S83.5",
        claimType: "sport",
        status: "lodged",
        totalCost: 0,
      },
    }),
    prisma.aCCClaim.create({
      data: {
        patientId: patients[4].id,
        claimNumber: "ACC-2023-00789",
        injuryDate: new Date("2023-06-15"),
        injuryDescription: "Slip and fall at home. Wrist fracture (healed). Follow-up physiotherapy.",
        injuryCode: "S52.5",
        claimType: "home",
        status: "closed",
        totalCost: 4200,
      },
    }),
    prisma.aCCClaim.create({
      data: {
        patientId: patients[7].id,
        claimNumber: "ACC-2024-00567",
        injuryDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        injuryDescription: "Motor vehicle accident — whiplash and lower back strain.",
        injuryCode: "S13.4",
        claimType: "motor-vehicle",
        status: "accepted",
        totalCost: 3800,
      },
    }),
  ]);

  // ACC Claim Events
  await Promise.all([
    // Claim 0 events
    prisma.aCCClaimEvent.create({ data: { claimId: accClaims[0].id, type: "lodged", description: "Claim lodged by ED physician after workplace fall.", cost: 0, eventDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) } }),
    prisma.aCCClaimEvent.create({ data: { claimId: accClaims[0].id, type: "assessment", description: "X-ray and orthopaedic assessment completed.", cost: 850, eventDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) } }),
    prisma.aCCClaimEvent.create({ data: { claimId: accClaims[0].id, type: "treatment", description: "ORIF surgery scheduled. Estimated cost $8,500.", cost: 8500, eventDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) } }),
    prisma.aCCClaimEvent.create({ data: { claimId: accClaims[0].id, type: "payment", description: "Initial treatment costs approved by ACC.", cost: 3150, eventDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) } }),
    // Claim 1 events
    prisma.aCCClaimEvent.create({ data: { claimId: accClaims[1].id, type: "lodged", description: "Claim lodged for sports injury during rugby.", cost: 0, eventDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) } }),
    // Claim 2 events
    prisma.aCCClaimEvent.create({ data: { claimId: accClaims[2].id, type: "lodged", description: "Claim lodged for home injury.", cost: 0, eventDate: new Date("2023-06-15") } }),
    prisma.aCCClaimEvent.create({ data: { claimId: accClaims[2].id, type: "treatment", description: "Wrist fracture treatment and casting.", cost: 2200, eventDate: new Date("2023-06-16") } }),
    prisma.aCCClaimEvent.create({ data: { claimId: accClaims[2].id, type: "treatment", description: "Physiotherapy sessions (8 sessions).", cost: 2000, eventDate: new Date("2023-09-01") } }),
    prisma.aCCClaimEvent.create({ data: { claimId: accClaims[2].id, type: "closed", description: "Claim closed — full recovery.", cost: 0, eventDate: new Date("2023-12-01") } }),
    // Claim 3 events
    prisma.aCCClaimEvent.create({ data: { claimId: accClaims[3].id, type: "lodged", description: "MVA claim — ED presentation with whiplash.", cost: 0, eventDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } }),
    prisma.aCCClaimEvent.create({ data: { claimId: accClaims[3].id, type: "assessment", description: "MRI cervical spine — disc bulge at C5/C6.", cost: 1200, eventDate: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000) } }),
    prisma.aCCClaimEvent.create({ data: { claimId: accClaims[3].id, type: "treatment", description: "Physiotherapy programme commenced (12 sessions).", cost: 2600, eventDate: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000) } }),
  ]);

  // Beds
  const wards = [
    { ward: "Medical Ward 1", beds: 24 },
    { ward: "Medical Ward 2", beds: 20 },
    { ward: "Surgical Ward", beds: 18 },
    { ward: "ICU", beds: 8 },
    { ward: "Emergency Department", beds: 12 },
    { ward: "Maternity", beds: 10 },
    { ward: "Paediatric Ward", beds: 12 },
    { ward: "Orthopaedic Ward", beds: 14 },
  ];

  const bedStatuses = ["available", "occupied", "cleaning", "maintenance"];
  const allBeds = [];

  for (const w of wards) {
    for (let i = 1; i <= w.beds; i++) {
      const prefix = w.ward.split(" ").map(w => w[0]).join("");
      const bedNumber = `${prefix}-${String(i).padStart(2, "0")}`;

      // Most beds occupied, some available, few cleaning/maintenance
      let status: string;
      const rand = Math.random();
      if (rand < 0.7) status = "occupied";
      else if (rand < 0.88) status = "available";
      else if (rand < 0.96) status = "cleaning";
      else status = "maintenance";

      allBeds.push({ ward: w.ward, bedNumber, status });
    }
  }

  // Assign some patients to beds
  const occupiedBeds = allBeds.filter(b => b.status === "occupied");
  const admittedPatientIds = [patients[0].id, patients[2].id, patients[4].id]; // currently admitted

  for (const bed of allBeds) {
    const patientId = admittedPatientIds.length > 0 && bed.status === "occupied" ? admittedPatientIds.shift() : undefined;
    await prisma.bed.create({
      data: {
        ward: bed.ward,
        bedNumber: bed.bedNumber,
        status: bed.status,
        patientId: patientId || (bed.status === "occupied" ? undefined : undefined),
      },
    });
  }

  // Audit Logs (20+)
  await Promise.all([
    prisma.auditLog.create({ data: { userId: users[0].id, action: "LOGIN", entity: "User", entityId: users[0].id, severity: "info", details: JSON.stringify({ method: "password", ip: "192.168.1.100" }) } }),
    prisma.auditLog.create({ data: { userId: users[1].id, action: "LOGIN", entity: "User", entityId: users[1].id, severity: "info", details: JSON.stringify({ method: "password", ip: "192.168.1.101" }) } }),
    prisma.auditLog.create({ data: { userId: users[1].id, action: "CREATE", entity: "ClinicalNote", severity: "info", details: JSON.stringify({ patientNhi: "AAA1234", noteType: "soap" }), createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) } }),
    prisma.auditLog.create({ data: { userId: users[1].id, action: "READ", entity: "Patient", entityId: patients[0].id, severity: "info", details: JSON.stringify({ patientNhi: "AAA1234" }), createdAt: new Date(now.getTime() - 2.5 * 60 * 60 * 1000) } }),
    prisma.auditLog.create({ data: { userId: users[1].id, action: "PRESCRIBE", entity: "Medication", severity: "info", details: JSON.stringify({ patientNhi: "AAA1234", medication: "Tramadol 50mg", route: "oral" }), createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000) } }),
    prisma.auditLog.create({ data: { userId: users[2].id, action: "UPDATE", entity: "VitalSigns", severity: "info", details: JSON.stringify({ patientNhi: "AAA1234", news2: 1 }), createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000) } }),
    prisma.auditLog.create({ data: { userId: users[1].id, action: "CREATE", entity: "Encounter", severity: "info", details: JSON.stringify({ patientNhi: "CCC9012", type: "admission", department: "Orthopaedics" }), createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000) } }),
    prisma.auditLog.create({ data: { userId: users[1].id, action: "PRESCRIBE", entity: "Medication", severity: "info", details: JSON.stringify({ patientNhi: "CCC9012", medication: "Diclofenac 50mg" }), createdAt: new Date(now.getTime() - 23 * 60 * 60 * 1000) } }),
    prisma.auditLog.create({ data: { userId: users[2].id, action: "UPDATE", entity: "VitalSigns", severity: "info", details: JSON.stringify({ patientNhi: "EEE7890", news2: 6 }), createdAt: new Date(now.getTime() - 13 * 60 * 60 * 1000) } }),
    prisma.auditLog.create({ data: { userId: null, action: "CREATE", entity: "ClinicalAlert", severity: "critical", details: JSON.stringify({ alertType: "lab-critical", patientNhi: "EEE7890", title: "HbA1c Above Target" }), createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000) } }),
    prisma.auditLog.create({ data: { userId: users[1].id, action: "ACKNOWLEDGE_ALERT", entity: "ClinicalAlert", severity: "info", details: JSON.stringify({ alertTitle: "HbA1c Above Target", patientNhi: "EEE7890" }), createdAt: new Date(now.getTime() - 11 * 60 * 60 * 1000) } }),
    prisma.auditLog.create({ data: { userId: users[3].id, action: "CREATE", entity: "Appointment", severity: "info", details: JSON.stringify({ patientNhi: "BBB5678", type: "follow-up", department: "Cardiology" }), createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000) } }),
    prisma.auditLog.create({ data: { userId: users[1].id, action: "READ", entity: "Patient", entityId: patients[4].id, severity: "info", details: JSON.stringify({ patientNhi: "EEE7890" }), createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000) } }),
    prisma.auditLog.create({ data: { userId: users[0].id, action: "UPDATE", entity: "User", entityId: users[2].id, severity: "warning", details: JSON.stringify({ field: "department", oldValue: "Surgical", newValue: "General Medicine" }), createdAt: new Date(now.getTime() - 72 * 60 * 60 * 1000) } }),
    prisma.auditLog.create({ data: { userId: users[1].id, action: "DISCHARGE", entity: "Encounter", severity: "warning", details: JSON.stringify({ patientNhi: "GGG6789", department: "Respiratory", diagnosis: "COPD exacerbation" }), createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000) } }),
    prisma.auditLog.create({ data: { userId: null, action: "CREATE", entity: "ACCClaim", severity: "info", details: JSON.stringify({ claimNumber: "ACC-2024-00123", patientNhi: "AAA1234", type: "work" }), createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) } }),
    prisma.auditLog.create({ data: { userId: null, action: "CREATE", entity: "ACCClaim", severity: "info", details: JSON.stringify({ claimNumber: "ACC-2024-00456", patientNhi: "CCC9012", type: "sport" }), createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) } }),
    prisma.auditLog.create({ data: { userId: users[2].id, action: "LOGIN", entity: "User", entityId: users[2].id, severity: "info", details: JSON.stringify({ method: "password", ip: "192.168.1.102" }), createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000) } }),
    prisma.auditLog.create({ data: { userId: users[2].id, action: "UPDATE", entity: "Medication", severity: "info", details: JSON.stringify({ patientNhi: "AAA1234", medication: "Paracetamol", statusChange: "dispensed -> administered" }), createdAt: new Date(now.getTime() - 7 * 60 * 60 * 1000) } }),
    prisma.auditLog.create({ data: { userId: users[1].id, action: "CREATE", entity: "ClinicalNote", severity: "info", details: JSON.stringify({ patientNhi: "EEE7890", noteType: "progress" }), createdAt: new Date(now.getTime() - 10 * 60 * 60 * 1000) } }),
    prisma.auditLog.create({ data: { userId: users[3].id, action: "LOGIN", entity: "User", entityId: users[3].id, severity: "info", details: JSON.stringify({ method: "password", ip: "192.168.1.103" }), createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000) } }),
    prisma.auditLog.create({ data: { userId: null, action: "CREATE", entity: "ClinicalAlert", severity: "warning", details: JSON.stringify({ alertType: "fall-risk", patientNhi: "EEE7890" }), createdAt: new Date(now.getTime() - 9 * 60 * 60 * 1000) } }),
  ]);

  // ==================== LAB ORDERS ====================
  const labNow = new Date();
  await Promise.all([
    // Completed orders with results
    prisma.labOrder.create({
      data: {
        patientId: patients[0].id,
        orderedById: users[1].id,
        orderNumber: "LAB-2026-001",
        testName: "Full Blood Count (FBC)",
        testCode: "58410-2",
        priority: "stat",
        specimen: "Blood",
        clinicalNotes: "Pre-op for ORIF right tibia. Check Hb and platelets.",
        status: "completed",
        resultValue: "Hb 135, WBC 8.2, Plt 245",
        resultUnit: "g/L, ×10⁹/L, ×10⁹/L",
        referenceRange: "Hb 130-175, WBC 4.0-11.0, Plt 150-400",
        interpretation: "normal",
        resultNotes: "All parameters within normal range. Fit for surgery.",
        orderedAt: new Date(labNow.getTime() - 48 * 60 * 60 * 1000),
        collectedAt: new Date(labNow.getTime() - 47 * 60 * 60 * 1000),
        completedAt: new Date(labNow.getTime() - 45 * 60 * 60 * 1000),
      },
    }),
    prisma.labOrder.create({
      data: {
        patientId: patients[4].id,
        orderedById: users[1].id,
        orderNumber: "LAB-2026-002",
        testName: "HbA1c",
        testCode: "4548-4",
        priority: "routine",
        specimen: "Blood",
        clinicalNotes: "Diabetes management review. Previous HbA1c 8.2%.",
        status: "completed",
        resultValue: "8.2",
        resultUnit: "%",
        referenceRange: "20-42 mmol/mol (<7%)",
        interpretation: "critical",
        resultNotes: "HbA1c significantly above target. Indicates poor glycaemic control. Recommend medication adjustment and dietitian review.",
        orderedAt: new Date(labNow.getTime() - 72 * 60 * 60 * 1000),
        collectedAt: new Date(labNow.getTime() - 71 * 60 * 60 * 1000),
        completedAt: new Date(labNow.getTime() - 68 * 60 * 60 * 1000),
      },
    }),
    prisma.labOrder.create({
      data: {
        patientId: patients[1].id,
        orderedById: users[1].id,
        orderNumber: "LAB-2026-003",
        testName: "Lipid Panel",
        testCode: "57698-3",
        priority: "routine",
        specimen: "Blood",
        clinicalNotes: "Hypertension review. Currently on atorvastatin 20mg.",
        status: "completed",
        resultValue: "TC 6.2, LDL 4.1, HDL 1.3, TG 1.8",
        resultUnit: "mmol/L",
        referenceRange: "TC <5.0, LDL <2.0, HDL >1.0, TG <1.7",
        interpretation: "abnormal",
        resultNotes: "LDL above target despite statin therapy. Consider uptitrating atorvastatin to 40mg or adding ezetimibe.",
        orderedAt: new Date(labNow.getTime() - 120 * 60 * 60 * 1000),
        collectedAt: new Date(labNow.getTime() - 119 * 60 * 60 * 1000),
        completedAt: new Date(labNow.getTime() - 116 * 60 * 60 * 1000),
      },
    }),
    prisma.labOrder.create({
      data: {
        patientId: patients[6].id,
        orderedById: users[1].id,
        orderNumber: "LAB-2026-004",
        testName: "Arterial Blood Gas",
        testCode: "24336-0",
        priority: "stat",
        specimen: "Blood",
        clinicalNotes: "COPD exacerbation. SpO2 dropping to 94%.",
        status: "completed",
        resultValue: "pH 7.38, pO2 68, pCO2 48, HCO3 26",
        resultUnit: "mmHg",
        referenceRange: "pH 7.35-7.45, pO2 80-100, pCO2 35-45",
        interpretation: "abnormal",
        resultNotes: "Type 2 respiratory failure. Elevated pCO2 with compensated pH. Consider NIV if worsening.",
        orderedAt: new Date(labNow.getTime() - 168 * 60 * 60 * 1000),
        collectedAt: new Date(labNow.getTime() - 168 * 60 * 60 * 1000),
        completedAt: new Date(labNow.getTime() - 167 * 60 * 60 * 1000),
      },
    }),
    // In-progress orders
    prisma.labOrder.create({
      data: {
        patientId: patients[2].id,
        orderedById: users[1].id,
        orderNumber: "LAB-2026-005",
        testName: "Coagulation (INR/PT)",
        testCode: "5902-2",
        priority: "urgent",
        specimen: "Blood",
        clinicalNotes: "Pre-op for ACL reconstruction. Confirm coagulation status.",
        status: "in-progress",
        orderedAt: new Date(labNow.getTime() - 6 * 60 * 60 * 1000),
        collectedAt: new Date(labNow.getTime() - 5 * 60 * 60 * 1000),
      },
    }),
    prisma.labOrder.create({
      data: {
        patientId: patients[4].id,
        orderedById: users[1].id,
        orderNumber: "LAB-2026-006",
        testName: "Urea & Electrolytes (U&Es)",
        testCode: "24326-1",
        priority: "routine",
        specimen: "Blood",
        clinicalNotes: "Renal function check. Patient on metformin.",
        status: "in-progress",
        orderedAt: new Date(labNow.getTime() - 8 * 60 * 60 * 1000),
        collectedAt: new Date(labNow.getTime() - 7 * 60 * 60 * 1000),
      },
    }),
    // Collected, awaiting processing
    prisma.labOrder.create({
      data: {
        patientId: patients[0].id,
        orderedById: users[1].id,
        orderNumber: "LAB-2026-007",
        testName: "C-Reactive Protein (CRP)",
        testCode: "1988-5",
        priority: "urgent",
        specimen: "Blood",
        clinicalNotes: "Post-surgical monitoring. Watch for infection.",
        status: "collected",
        orderedAt: new Date(labNow.getTime() - 3 * 60 * 60 * 1000),
        collectedAt: new Date(labNow.getTime() - 2 * 60 * 60 * 1000),
      },
    }),
    // Pending collection (ordered)
    prisma.labOrder.create({
      data: {
        patientId: patients[3].id,
        orderedById: users[1].id,
        orderNumber: "LAB-2026-008",
        testName: "Thyroid Function (TFTs)",
        testCode: "3016-3",
        priority: "routine",
        specimen: "Blood",
        clinicalNotes: "Fatigue and weight gain. Screen for hypothyroidism.",
        status: "ordered",
        orderedAt: new Date(labNow.getTime() - 1 * 60 * 60 * 1000),
      },
    }),
    prisma.labOrder.create({
      data: {
        patientId: patients[5].id,
        orderedById: users[1].id,
        orderNumber: "LAB-2026-009",
        testName: "Full Blood Count (FBC)",
        testCode: "58410-2",
        priority: "routine",
        specimen: "Blood",
        clinicalNotes: "Routine wellness check.",
        status: "ordered",
        orderedAt: new Date(labNow.getTime() - 30 * 60 * 1000),
      },
    }),
    prisma.labOrder.create({
      data: {
        patientId: patients[7].id,
        orderedById: users[1].id,
        orderNumber: "LAB-2026-010",
        testName: "Urinalysis",
        testCode: "24356-8",
        priority: "routine",
        specimen: "Urine",
        clinicalNotes: "Lower abdominal pain. Rule out UTI.",
        status: "ordered",
        orderedAt: new Date(labNow.getTime() - 45 * 60 * 1000),
      },
    }),
    prisma.labOrder.create({
      data: {
        patientId: patients[2].id,
        orderedById: users[1].id,
        orderNumber: "LAB-2026-011",
        testName: "Blood Group & Crossmatch",
        testCode: "882-1",
        priority: "stat",
        specimen: "Blood",
        clinicalNotes: "Pre-op ACL reconstruction. Type and crossmatch 2 units.",
        status: "ordered",
        orderedAt: new Date(labNow.getTime() - 15 * 60 * 1000),
      },
    }),
    // Completed with critical result
    prisma.labOrder.create({
      data: {
        patientId: patients[4].id,
        orderedById: users[1].id,
        orderNumber: "LAB-2026-012",
        testName: "Liver Function Tests (LFTs)",
        testCode: "24325-3",
        priority: "routine",
        specimen: "Blood",
        clinicalNotes: "Baseline liver function — starting new statin.",
        status: "completed",
        resultValue: "ALT 18, AST 22, ALP 65, GGT 30, Bili 12",
        resultUnit: "U/L",
        referenceRange: "ALT <40, AST <35, ALP 30-120, GGT <50, Bili <20",
        interpretation: "normal",
        resultNotes: "Normal liver function. Safe to commence statin therapy.",
        orderedAt: new Date(labNow.getTime() - 96 * 60 * 60 * 1000),
        collectedAt: new Date(labNow.getTime() - 95 * 60 * 60 * 1000),
        completedAt: new Date(labNow.getTime() - 92 * 60 * 60 * 1000),
      },
    }),
    prisma.labOrder.create({
      data: {
        patientId: patients[0].id,
        orderedById: users[1].id,
        orderNumber: "LAB-2026-013",
        testName: "D-Dimer",
        testCode: "48065-7",
        priority: "stat",
        specimen: "Blood",
        clinicalNotes: "Post-fracture immobilisation. DVT screening.",
        status: "completed",
        resultValue: "0.8",
        resultUnit: "mg/L FEU",
        referenceRange: "<0.5 mg/L FEU",
        interpretation: "abnormal",
        resultNotes: "Elevated D-dimer. Correlation with clinical signs and USS Doppler recommended. Continue enoxaparin prophylaxis.",
        orderedAt: new Date(labNow.getTime() - 36 * 60 * 60 * 1000),
        collectedAt: new Date(labNow.getTime() - 35 * 60 * 60 * 1000),
        completedAt: new Date(labNow.getTime() - 33 * 60 * 60 * 1000),
      },
    }),
    prisma.labOrder.create({
      data: {
        patientId: patients[1].id,
        orderedById: users[1].id,
        orderNumber: "LAB-2026-014",
        testName: "Troponin T",
        testCode: "6598-7",
        priority: "stat",
        specimen: "Blood",
        clinicalNotes: "Chest discomfort reported during BP check. Rule out ACS.",
        status: "completed",
        resultValue: "8",
        resultUnit: "ng/L",
        referenceRange: "<14 ng/L",
        interpretation: "normal",
        resultNotes: "Troponin within normal limits. Low risk for acute coronary event. Continue BP management.",
        orderedAt: new Date(labNow.getTime() - 24 * 60 * 60 * 1000),
        collectedAt: new Date(labNow.getTime() - 24 * 60 * 60 * 1000),
        completedAt: new Date(labNow.getTime() - 23 * 60 * 60 * 1000),
      },
    }),
    // Cancelled order
    prisma.labOrder.create({
      data: {
        patientId: patients[3].id,
        orderedById: users[1].id,
        orderNumber: "LAB-2026-015",
        testName: "Blood Cultures",
        testCode: "600-7",
        priority: "urgent",
        specimen: "Blood",
        clinicalNotes: "Fever — subsequently resolved. Cancelled by clinician.",
        status: "cancelled",
        orderedAt: new Date(labNow.getTime() - 60 * 60 * 60 * 1000),
      },
    }),
  ]);

  console.log("Database seeded successfully with comprehensive NZ hospital demo data");
  console.log(`  Users: 4`);
  console.log(`  Patients: 8`);
  console.log(`  Encounters: 5`);
  console.log(`  Clinical Notes: 4`);
  console.log(`  Appointments: 4`);
  console.log(`  Waitlist Entries: 5`);
  console.log(`  Observations: 7`);
  console.log(`  Drug Interactions: 16`);
  console.log(`  Medications: 12`);
  console.log(`  Clinical Alerts: 7`);
  console.log(`  Clinical Pathways: 4`);
  console.log(`  Vital Sign Sets: 10`);
  console.log(`  ACC Claims: 4`);
  console.log(`  ACC Claim Events: 12`);
  console.log(`  Beds: ${allBeds.length}`);
  console.log(`  Audit Logs: 22`);
  console.log(`  Lab Orders: 15`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
