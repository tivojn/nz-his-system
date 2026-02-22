// NZ-HIS Constants

export const DEPARTMENTS = [
  "Emergency Medicine",
  "General Medicine",
  "Cardiology",
  "Orthopaedics",
  "Respiratory",
  "Paediatrics",
  "Gynaecology",
  "Ophthalmology",
  "Oncology",
  "Psychiatry",
  "Surgical",
  "ICU",
  "Radiology",
  "Pathology",
  "Administration",
  "Front Desk",
] as const;

export const WARDS = [
  "Medical Ward 1",
  "Medical Ward 2",
  "Surgical Ward",
  "ICU",
  "Emergency Department",
  "Maternity",
  "Paediatric Ward",
  "Orthopaedic Ward",
] as const;

export const ETHNICITIES = [
  "Maori",
  "NZ European",
  "Pacific Islander",
  "Asian",
  "MELAA",
  "Other",
] as const;

export const NZ_MEDICATIONS = [
  { name: "Paracetamol (Panadol)", genericName: "Paracetamol", defaultDose: "1g", unit: "mg", route: "oral" },
  { name: "Ibuprofen (Nurofen)", genericName: "Ibuprofen", defaultDose: "400mg", unit: "mg", route: "oral" },
  { name: "Diclofenac (Voltaren)", genericName: "Diclofenac", defaultDose: "50mg", unit: "mg", route: "oral" },
  { name: "Metformin (Glucophage)", genericName: "Metformin", defaultDose: "500mg", unit: "mg", route: "oral" },
  { name: "Amoxicillin", genericName: "Amoxicillin", defaultDose: "500mg", unit: "mg", route: "oral" },
  { name: "Omeprazole (Losec)", genericName: "Omeprazole", defaultDose: "20mg", unit: "mg", route: "oral" },
  { name: "Metoprolol", genericName: "Metoprolol", defaultDose: "50mg", unit: "mg", route: "oral" },
  { name: "Atorvastatin (Lipitor)", genericName: "Atorvastatin", defaultDose: "20mg", unit: "mg", route: "oral" },
  { name: "Salbutamol (Ventolin)", genericName: "Salbutamol", defaultDose: "100mcg", unit: "mcg", route: "inhaled" },
  { name: "Tramadol", genericName: "Tramadol", defaultDose: "50mg", unit: "mg", route: "oral" },
  { name: "Codeine", genericName: "Codeine", defaultDose: "30mg", unit: "mg", route: "oral" },
  { name: "Morphine", genericName: "Morphine", defaultDose: "10mg", unit: "mg", route: "iv" },
  { name: "Enoxaparin (Clexane)", genericName: "Enoxaparin", defaultDose: "40mg", unit: "mg", route: "sc" },
  { name: "Ceftriaxone", genericName: "Ceftriaxone", defaultDose: "1g", unit: "mg", route: "iv" },
  { name: "Flucloxacillin", genericName: "Flucloxacillin", defaultDose: "500mg", unit: "mg", route: "oral" },
  { name: "Prednisone", genericName: "Prednisone", defaultDose: "40mg", unit: "mg", route: "oral" },
  { name: "Amlodipine", genericName: "Amlodipine", defaultDose: "5mg", unit: "mg", route: "oral" },
  { name: "Cilazapril", genericName: "Cilazapril", defaultDose: "2.5mg", unit: "mg", route: "oral" },
  { name: "Aspirin", genericName: "Aspirin", defaultDose: "100mg", unit: "mg", route: "oral" },
  { name: "Warfarin", genericName: "Warfarin", defaultDose: "5mg", unit: "mg", route: "oral" },
] as const;

export const FREQUENCIES = [
  { code: "STAT", label: "STAT (once now)" },
  { code: "OD", label: "OD (once daily)" },
  { code: "BD", label: "BD (twice daily)" },
  { code: "TDS", label: "TDS (three times daily)" },
  { code: "QID", label: "QID (four times daily)" },
  { code: "PRN", label: "PRN (as needed)" },
  { code: "NOCTE", label: "NOCTE (at night)" },
  { code: "MANE", label: "MANE (in the morning)" },
] as const;

export const MEDICATION_STATUSES = [
  "ordered",
  "verified",
  "dispensed",
  "administered",
  "discontinued",
] as const;

export const ALERT_SEVERITIES = {
  critical: { label: "Critical", color: "bg-red-500", textColor: "text-red-700", bgLight: "bg-red-50" },
  warning: { label: "Warning", color: "bg-amber-500", textColor: "text-amber-700", bgLight: "bg-amber-50" },
  info: { label: "Info", color: "bg-blue-500", textColor: "text-blue-700", bgLight: "bg-blue-50" },
} as const;

export const NOTE_TEMPLATES = [
  { type: "soap", label: "SOAP Note", description: "Standard clinical note" },
  { type: "admission", label: "Admission Note", description: "Patient admission documentation" },
  { type: "discharge", label: "Discharge Summary", description: "Discharge documentation" },
  { type: "surgical", label: "Surgical Note", description: "Operative/procedure note" },
  { type: "progress", label: "Progress Note", description: "Daily progress documentation" },
] as const;

export const ACC_CLAIM_TYPES = [
  { code: "work", label: "Workplace Injury" },
  { code: "motor-vehicle", label: "Motor Vehicle Accident" },
  { code: "sport", label: "Sport/Recreation Injury" },
  { code: "home", label: "Home Injury" },
  { code: "assault", label: "Assault" },
] as const;

export const ACC_CLAIM_STATUSES = [
  "lodged",
  "accepted",
  "declined",
  "closed",
  "review",
] as const;

export const BED_STATUSES = {
  available: { label: "Available", color: "bg-emerald-500", bgLight: "bg-emerald-50" },
  occupied: { label: "Occupied", color: "bg-teal-500", bgLight: "bg-teal-50" },
  cleaning: { label: "Cleaning", color: "bg-amber-500", bgLight: "bg-amber-50" },
  maintenance: { label: "Maintenance", color: "bg-slate-500", bgLight: "bg-slate-50" },
} as const;

export const NEWS2_THRESHOLDS = {
  low: { min: 0, max: 4, label: "Low Risk", color: "bg-green-500" },
  lowMedium: { min: 5, max: 6, label: "Low-Medium Risk", color: "bg-yellow-500" },
  medium: { min: 7, max: 7, label: "Medium Risk", color: "bg-orange-500" },
  high: { min: 8, max: 20, label: "High Risk", color: "bg-red-500" },
} as const;

export const APPOINTMENT_TYPES = [
  "consultation",
  "follow-up",
  "procedure",
  "surgery",
] as const;

export const APPOINTMENT_STATUSES = [
  "scheduled",
  "checked-in",
  "completed",
  "cancelled",
  "no-show",
] as const;

export const APPOINTMENT_DURATIONS = [15, 30, 45, 60, 90, 120] as const;

export const WAITLIST_STATUSES = [
  "waiting",
  "scheduled",
  "completed",
  "cancelled",
] as const;

export const WAITLIST_PRIORITIES = [
  { code: "urgent", label: "Urgent", color: "bg-red-500", textColor: "text-red-700", bgLight: "bg-red-50" },
  { code: "semi-urgent", label: "Semi-urgent", color: "bg-yellow-500", textColor: "text-yellow-700", bgLight: "bg-yellow-50" },
  { code: "routine", label: "Routine", color: "bg-green-500", textColor: "text-green-700", bgLight: "bg-green-50" },
] as const;

export const NZ_HEALTH_TARGETS = [
  { name: "Shorter stays in ED", target: 95, description: "% patients admitted/discharged/transferred within 6 hours" },
  { name: "Improved access to elective surgery", target: 100, description: "Patients receiving elective surgery vs. target" },
  { name: "Faster cancer treatment", target: 90, description: "% receiving first treatment within 62 days" },
  { name: "Better help for smokers to quit", target: 90, description: "% enrolled patients offered smoking cessation" },
  { name: "Raising healthy kids", target: 95, description: "% obese children identified in B4 School check offered referral" },
  { name: "Mental health access", target: 80, description: "% population accessing mental health services" },
] as const;
