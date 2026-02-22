import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Check if already seeded
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log("Database already seeded");
    return;
  }

  // Create demo users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "admin@nzhis.co.nz",
        name: "Dr. Sarah Mitchell",
        password: "$2a$10$k7Iy7gJzMjEz5RUVnOqFXeA5MjXbQ3UhJ1zK.WfJ8wX9v7Kz9Kyq2", // demo123
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
        lastName: "Tūhoe",
        dateOfBirth: new Date("1985-03-15"),
        gender: "male",
        ethnicity: "Māori",
        iwi: "Ngāi Tūhoe",
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
        ethnicity: "Māori",
        iwi: "Ngāti Porou",
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
        address: "67 Ōtāhuhu Rd",
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
        ethnicity: "Māori",
        iwi: "Ngāpuhi",
        phone: "021-555-0108",
        email: "aroha.tk@email.co.nz",
        address: "12 Queen St",
        city: "Whangārei",
        region: "Northland",
        status: "active",
      },
    }),
  ]);

  // Create encounters
  const now = new Date();
  await Promise.all([
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
    prisma.observation.create({
      data: {
        patientId: patients[0].id,
        type: "vital-signs",
        code: "8867-4",
        codeName: "Heart Rate",
        value: "82",
        unit: "bpm",
      },
    }),
    prisma.observation.create({
      data: {
        patientId: patients[0].id,
        type: "vital-signs",
        code: "8480-6",
        codeName: "Systolic Blood Pressure",
        value: "128",
        unit: "mmHg",
      },
    }),
    prisma.observation.create({
      data: {
        patientId: patients[0].id,
        type: "lab-result",
        code: "718-7",
        codeName: "Haemoglobin",
        value: "135",
        unit: "g/L",
      },
    }),
    prisma.observation.create({
      data: {
        patientId: patients[4].id,
        type: "lab-result",
        code: "4548-4",
        codeName: "HbA1c",
        value: "8.2",
        unit: "%",
      },
    }),
    prisma.observation.create({
      data: {
        patientId: patients[4].id,
        type: "lab-result",
        code: "2345-7",
        codeName: "Glucose (Fasting)",
        value: "9.8",
        unit: "mmol/L",
      },
    }),
    prisma.observation.create({
      data: {
        patientId: patients[1].id,
        type: "vital-signs",
        code: "8480-6",
        codeName: "Systolic Blood Pressure",
        value: "155",
        unit: "mmHg",
      },
    }),
    prisma.observation.create({
      data: {
        patientId: patients[1].id,
        type: "lab-result",
        code: "2093-3",
        codeName: "Total Cholesterol",
        value: "6.2",
        unit: "mmol/L",
      },
    }),
  ]);

  console.log("✅ Database seeded successfully with NZ hospital demo data");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
