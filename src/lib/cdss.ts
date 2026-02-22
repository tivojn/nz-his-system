// Clinical Decision Support System utilities

export interface NEWS2Params {
  respiratoryRate: number;
  oxygenSat: number;
  onSupplementalO2: boolean;
  systolicBP: number;
  heartRate: number;
  consciousness: "A" | "V" | "P" | "U";
  temperature: number;
}

export function calculateNEWS2(params: NEWS2Params): {
  total: number;
  components: Record<string, number>;
  risk: string;
  color: string;
  action: string;
} {
  const components: Record<string, number> = {};

  // Respiratory Rate
  const rr = params.respiratoryRate;
  if (rr <= 8) components.respiratoryRate = 3;
  else if (rr <= 11) components.respiratoryRate = 1;
  else if (rr <= 20) components.respiratoryRate = 0;
  else if (rr <= 24) components.respiratoryRate = 2;
  else components.respiratoryRate = 3;

  // SpO2 Scale 1 (no supplemental O2)
  const spo2 = params.oxygenSat;
  if (!params.onSupplementalO2) {
    if (spo2 <= 91) components.oxygenSat = 3;
    else if (spo2 <= 93) components.oxygenSat = 2;
    else if (spo2 <= 95) components.oxygenSat = 1;
    else components.oxygenSat = 0;
  } else {
    // Scale 2 for supplemental O2
    if (spo2 <= 83) components.oxygenSat = 3;
    else if (spo2 <= 85) components.oxygenSat = 2;
    else if (spo2 <= 87) components.oxygenSat = 1;
    else if (spo2 <= 92) components.oxygenSat = 0;
    else if (spo2 <= 94) components.oxygenSat = 1;
    else if (spo2 <= 96) components.oxygenSat = 2;
    else components.oxygenSat = 3;
  }

  // Supplemental O2
  components.supplementalO2 = params.onSupplementalO2 ? 2 : 0;

  // Systolic BP
  const sbp = params.systolicBP;
  if (sbp <= 90) components.systolicBP = 3;
  else if (sbp <= 100) components.systolicBP = 2;
  else if (sbp <= 110) components.systolicBP = 1;
  else if (sbp <= 219) components.systolicBP = 0;
  else components.systolicBP = 3;

  // Heart Rate
  const hr = params.heartRate;
  if (hr <= 40) components.heartRate = 3;
  else if (hr <= 50) components.heartRate = 1;
  else if (hr <= 90) components.heartRate = 0;
  else if (hr <= 110) components.heartRate = 1;
  else if (hr <= 130) components.heartRate = 2;
  else components.heartRate = 3;

  // Consciousness
  components.consciousness = params.consciousness === "A" ? 0 : 3;

  // Temperature
  const temp = params.temperature;
  if (temp <= 35.0) components.temperature = 3;
  else if (temp <= 36.0) components.temperature = 1;
  else if (temp <= 38.0) components.temperature = 0;
  else if (temp <= 39.0) components.temperature = 1;
  else components.temperature = 2;

  const total = Object.values(components).reduce((sum, val) => sum + val, 0);

  let risk: string;
  let color: string;
  let action: string;

  if (total >= 7) {
    risk = "High";
    color = "red";
    action = "Urgent/emergency response. Continuous monitoring. Senior clinician review.";
  } else if (total >= 5) {
    risk = "Medium";
    color = "orange";
    action = "Urgent ward-based response. Increase monitoring frequency. Senior clinician review within 30 minutes.";
  } else if (total >= 1) {
    risk = "Low";
    color = "yellow";
    action = "Inform registered nurse. Assess within 1 hour. Increase monitoring to minimum 4-hourly.";
  } else {
    risk = "None";
    color = "green";
    action = "Continue routine observations. Minimum 12-hourly monitoring.";
  }

  // Check for single parameter score of 3
  const hasExtremeParam = Object.values(components).some(v => v === 3);
  if (hasExtremeParam && total < 5) {
    risk = "Low-Medium";
    color = "orange";
    action = "Urgent ward-based response for individual parameter. Senior clinician review within 30 minutes.";
  }

  return { total, components, risk, color, action };
}

export interface FallsRiskParams {
  age: number;
  previousFalls: boolean;
  mobilityImpaired: boolean;
  cognitiveImpairment: boolean;
  continenceIssues: boolean;
  medicationsRisk: boolean; // sedatives, antihypertensives, etc.
  visualImpairment: boolean;
}

export function calculateFallsRisk(params: FallsRiskParams): {
  score: number;
  risk: string;
  color: string;
  interventions: string[];
} {
  let score = 0;
  const interventions: string[] = [];

  if (params.age >= 65) { score += 2; interventions.push("Age-related falls prevention"); }
  if (params.age >= 80) { score += 1; }
  if (params.previousFalls) { score += 3; interventions.push("Review falls history and circumstances"); }
  if (params.mobilityImpaired) { score += 2; interventions.push("Physiotherapy referral, mobility aids"); }
  if (params.cognitiveImpairment) { score += 2; interventions.push("1:1 nursing, bed alarms, frequent checks"); }
  if (params.continenceIssues) { score += 1; interventions.push("Toileting schedule, easy access to bathroom"); }
  if (params.medicationsRisk) { score += 2; interventions.push("Medication review by pharmacist"); }
  if (params.visualImpairment) { score += 1; interventions.push("Ensure glasses available, adequate lighting"); }

  let risk: string;
  let color: string;

  if (score >= 8) {
    risk = "High";
    color = "red";
    interventions.push("Falls care plan mandatory", "Yellow wristband and bed sign");
  } else if (score >= 4) {
    risk = "Medium";
    color = "orange";
    interventions.push("Standard falls precautions");
  } else {
    risk = "Low";
    color = "green";
  }

  return { score, risk, color, interventions };
}

export function checkDrugInteractions(
  drugA: string,
  drugB: string,
  interactions: Array<{ drugA: string; drugB: string; severity: string; description: string; recommendation: string }>
) {
  const aLower = drugA.toLowerCase();
  const bLower = drugB.toLowerCase();

  return interactions.filter(
    (i) =>
      (i.drugA.toLowerCase() === aLower && i.drugB.toLowerCase() === bLower) ||
      (i.drugA.toLowerCase() === bLower && i.drugB.toLowerCase() === aLower)
  );
}
