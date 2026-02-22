import { NextRequest, NextResponse } from "next/server";

// ── Clinical Agent Responses (~15) ───────────────────────────────────

function clinicalResponse(message: string): string {
  const lower = message.toLowerCase();

  if ((lower.includes("summarise") || lower.includes("summarize") || lower.includes("summary")) && lower.includes("patient")) {
    const nhiMatch = message.match(/[A-Z]{3}\d{4}/i);
    const nhi = nhiMatch ? nhiMatch[0].toUpperCase() : "AAA1234";
    return `**Patient Summary -- ${nhi}**

**Demographics**
- Name: Hemi Tuhoe
- NHI: ${nhi} | DOB: 15/03/1985 (Age 40)
- Ethnicity: NZ Maori | Gender: Male
- GP: Dr Sarah Chen, Ponsonby Medical Centre

**Current Admission**
- Admitted: 19/02/2026 via ED
- Ward: Surgical 2, Bed 14A
- Consultant: Mr James Liu (Orthopaedics)
- Diagnosis: Displaced fracture right tibial shaft (S82.201A)
- Procedure: ORIF with intramedullary nail (20/02/2026)

**Current Medications**
1. Paracetamol 1g PO QDS
2. Tramadol 50mg PO QDS PRN
3. Enoxaparin 40mg SC daily (DVT prophylaxis)
4. Cefazolin 2g IV TDS (prophylactic, Day 2)

**Latest Vitals (06:00 today)**
| Parameter | Value | Status |
|-----------|-------|--------|
| HR | 78 bpm | Normal |
| BP | 128/82 mmHg | Normal |
| RR | 16 /min | Normal |
| Temp | 37.1 C | Normal |
| SpO2 | 98% RA | Normal |
| Pain | 4/10 | Moderate |

**Alerts**
- Allergy: Penicillin (rash)
- ACC Claim: ACC-2024-00123 (active - workplace injury)
- Diabetes: HbA1c 8.2% - endocrine review requested`;
  }

  if (lower.includes("drug interaction") || lower.includes("interaction")) {
    const drugMatch = message.match(/for\s+(\w+)/i);
    const drug = drugMatch ? drugMatch[1] : "Warfarin";
    return `**Drug Interaction Report: ${drug}**

**High Severity Interactions**
1. **${drug} + NSAIDs (Ibuprofen, Diclofenac)**
   - Risk: Increased bleeding risk (GI haemorrhage)
   - Mechanism: Platelet inhibition + anticoagulant effect
   - Recommendation: Avoid combination. Use paracetamol for analgesia.

2. **${drug} + Amiodarone**
   - Risk: Significantly increased INR (2-3x)
   - Mechanism: CYP2C9 inhibition reduces ${drug} metabolism
   - Recommendation: Reduce ${drug} dose by 30-50%, monitor INR weekly.

**Moderate Severity Interactions**
3. **${drug} + Omeprazole**
   - Risk: Modest INR increase
   - Mechanism: CYP2C19 competition
   - Recommendation: Monitor INR, consider pantoprazole as alternative.

4. **${drug} + Paracetamol (>2g/day)**
   - Risk: Gradual INR increase with prolonged use
   - Recommendation: Keep paracetamol <2g/day, monitor INR.

**Food Interactions**
5. **Vitamin K-rich foods** (spinach, broccoli, kale)
   - Recommendation: Maintain consistent dietary intake, avoid sudden changes.

*Source: NZ Formulary / Medsafe interactions database*`;
  }

  if (lower.includes("soap") || lower.includes("generate note")) {
    return `**SOAP Note -- Chest Pain Presentation**

**S (Subjective)**
45-year-old male presenting with central chest pain onset 2 hours ago. Describes as "pressure-like", radiating to left arm. Pain rated 7/10. Associated diaphoresis and mild dyspnoea. No nausea or vomiting. PMHx: Hypertension (on Cilazapril 5mg daily), Type 2 DM, ex-smoker (quit 2019). FHx: Father MI age 55.

**O (Objective)**
- Vitals: HR 95, BP 155/92, RR 20, SpO2 97% RA, Temp 36.8C
- General: Anxious, diaphoretic, no acute distress
- CVS: S1S2 normal, no murmurs, JVP not elevated
- Resp: Clear bilateral air entry, no crackles
- ECG: ST elevation leads II, III, aVF (inferior STEMI pattern)
- Troponin T: 245 ng/L (ref <14) -- ELEVATED

**A (Assessment)**
1. Acute inferior STEMI -- high probability
2. Hypertensive response
3. Type 2 DM (HbA1c due for review)

**P (Plan)**
1. Activate STEMI pathway -- cardiology on call notified
2. Aspirin 300mg STAT + Ticagrelor 180mg loading
3. Heparin 5000 units IV bolus
4. GTN spray PRN, Morphine 2.5mg IV for pain
5. Urgent coronary angiography +/- PCI
6. NBM, continuous cardiac monitoring
7. Repeat troponin at 6 hours
8. Inform whanau, document ACC notification if applicable`;
  }

  if (lower.includes("news2") || lower.includes("early warning")) {
    return `**NEWS2 Score Calculation**

| Parameter | Value | Score |
|-----------|-------|-------|
| Respiratory Rate | 22 /min | 2 |
| SpO2 (Scale 1) | 94% | 1 |
| Air or Oxygen | Air | 0 |
| Systolic BP | 100 mmHg | 2 |
| Heart Rate | 95 bpm | 1 |
| Consciousness | Alert | 0 |
| Temperature | 38.5 C | 1 |

**Total NEWS2 Score: 7 -- HIGH clinical risk**

**Recommended Actions:**
- Urgent clinical review by medical team
- Continuous vital sign monitoring (minimum every 30 minutes)
- Consider escalation to critical care outreach
- Sepsis screen if clinically indicated
- Document escalation plan in clinical notes
- Inform duty registrar/consultant immediately

*Score 7+: Emergency response threshold. Clinical team must attend within 30 minutes.*`;
  }

  if (lower.includes("discharge")) {
    const nhiMatch = message.match(/[A-Z]{3}\d{4}/i);
    const nhi = nhiMatch ? nhiMatch[0].toUpperCase() : "AAA1234";
    return `**Discharge Planning Checklist -- ${nhi}**

**Pre-Discharge Requirements**
- [ ] Medical team clearance for discharge
- [ ] Medications reconciliation completed
- [ ] Discharge prescriptions written and dispensed
- [ ] VTE risk assessment (post-discharge prophylaxis if indicated)
- [ ] Wound care instructions documented
- [ ] Follow-up appointments booked

**Medications on Discharge**
1. Paracetamol 1g QDS PRN (2 weeks)
2. Tramadol 50mg QDS PRN (max 5 days)
3. Enoxaparin 40mg SC daily (14 days)
4. Continue regular medications (Metformin 1g BD, Cilazapril 5mg daily)

**Follow-up Plan**
- Orthopaedic clinic: 2 weeks (wound check + X-ray)
- GP review: 1 week (medication review, diabetes)
- Physiotherapy: commence at 2 weeks post-op
- ACC follow-up: claim ACC-2024-00123

**Patient Education**
- Weight-bearing restrictions explained
- DVT prophylaxis self-injection technique taught
- Red flag symptoms discussed (fever, wound concerns, calf swelling)
- Whanau support plan confirmed

**Notifications**
- [ ] GP discharge summary sent (e-referral)
- [ ] Community pharmacy notified
- [ ] ACC status updated
- [ ] District nursing referral (if needed)`;
  }

  if (lower.includes("lab") || lower.includes("blood") || lower.includes("result")) {
    const nhiMatch = message.match(/[A-Z]{3}\d{4}/i);
    const nhi = nhiMatch ? nhiMatch[0].toUpperCase() : "EEE7890";
    return `**Laboratory Results -- ${nhi}**

**Full Blood Count** (collected 06:00 today)
| Test | Value | Ref Range | Status |
|------|-------|-----------|--------|
| Haemoglobin | 128 g/L | 130-175 | Low |
| WBC | 12.4 x10^9/L | 4.0-11.0 | High |
| Platelets | 245 x10^9/L | 150-400 | Normal |
| Neutrophils | 9.8 x10^9/L | 2.0-7.5 | High |
| CRP | 85 mg/L | <5 | High |

**Biochemistry**
| Test | Value | Ref Range | Status |
|------|-------|-----------|--------|
| Creatinine | 92 umol/L | 60-110 | Normal |
| eGFR | 82 mL/min | >60 | Normal |
| Sodium | 138 mmol/L | 135-145 | Normal |
| Potassium | 4.2 mmol/L | 3.5-5.0 | Normal |
| HbA1c | 8.2% | <50 mmol/mol | High |
| Glucose (fasting) | 9.8 mmol/L | 3.5-5.5 | High |

**Interpretation:**
- Elevated WBC and CRP suggest active infection/inflammation -- correlate clinically
- Low Hb may be dilutional or related to surgical blood loss
- HbA1c and fasting glucose indicate suboptimal diabetes control
- Renal function within normal limits

*Recommend: Repeat FBC in 24h, consider sepsis screen if clinically deteriorating*`;
  }

  if (lower.includes("diagnosis") || lower.includes("differential")) {
    return `**Differential Diagnosis -- Acute Chest Pain**

**Most Likely (based on presentation)**
1. **Acute Coronary Syndrome (STEMI/NSTEMI)**
   - Supporting: Central chest pressure, radiation to arm, diaphoresis, risk factors
   - Investigation: ECG, serial troponins, echocardiogram

2. **Pulmonary Embolism**
   - Supporting: Acute onset, dyspnoea, tachycardia
   - Investigation: D-dimer, CTPA if Wells score >4

3. **Aortic Dissection**
   - Supporting: Sudden onset, hypertension
   - Against: No tearing/back pain described
   - Investigation: CT aortogram if suspicion persists

**Less Likely**
4. **Tension Pneumothorax** -- check for reduced air entry, tracheal deviation
5. **Pericarditis** -- usually positional, diffuse ST changes
6. **Musculoskeletal** -- usually reproducible on palpation
7. **GORD / Oesophageal spasm** -- diagnosis of exclusion

**Recommended Workup:**
- 12-lead ECG (STAT) + continuous monitoring
- Troponin T at presentation and 3 hours
- CXR, FBC, U&E, coagulation
- Echocardiogram if haemodynamically unstable`;
  }

  if (lower.includes("medication") || lower.includes("prescri")) {
    return `**Medication Review & Recommendations**

**Current Medications (reconciled)**
| Medication | Dose | Route | Frequency | Indication |
|-----------|------|-------|-----------|------------|
| Metformin | 1g | PO | BD | Type 2 DM |
| Cilazapril | 5mg | PO | Daily | Hypertension |
| Atorvastatin | 20mg | PO | Nocte | CVD prevention |
| Paracetamol | 1g | PO | QDS PRN | Pain |
| Enoxaparin | 40mg | SC | Daily | DVT prophylaxis |

**Recommendations**
1. **Metformin** -- HbA1c 8.2%, consider uptitration or addition of Empagliflozin (cardiovascular/renal benefit for NZ Maori population)
2. **Cilazapril** -- BP at target, continue current dose
3. **Statin** -- Consider increasing to Atorvastatin 40mg given elevated cardiovascular risk
4. **Enoxaparin** -- Continue for 14 days post-surgery (orthopaedic guideline)
5. **Allergy noted:** Penicillin (rash) -- documented in allergy record

**Deprescribing Opportunities**
- Tramadol: taper and cease within 5 days (opioid stewardship)

*Refer to NZ Formulary for prescribing guidelines*`;
  }

  if (lower.includes("sepsis") || lower.includes("infection")) {
    return `**Sepsis Screening Protocol**

**Sepsis-3 Criteria Assessment**
- Suspected infection: YES/NO (clinical assessment required)
- qSOFA score: Calculate using RR >= 22, altered mentation, SBP <= 100

**qSOFA Calculation**
| Criterion | Value | Score |
|-----------|-------|-------|
| RR >= 22 | -- | 0 or 1 |
| Altered mentation | -- | 0 or 1 |
| Systolic BP <= 100 | -- | 0 or 1 |

qSOFA >= 2 = screen positive for sepsis

**Sepsis Pathway (NZ National Standard)**
1. **Recognise** -- NEWS2 score >= 5 or qSOFA >= 2
2. **Resuscitate** -- Sepsis Six within 1 hour:
   - Blood cultures x2 (before antibiotics)
   - IV antibiotics (per local guideline)
   - IV fluid bolus 500mL crystalloid
   - Serum lactate
   - Measure urine output (catheterise if needed)
   - Apply high-flow oxygen (target SpO2 94-98%)
3. **Refer** -- escalate to senior medical staff, consider ICU
4. **Reassess** -- repeat lactate at 2-4 hours, reassess fluid response

**Empiric Antibiotic Guidance (WDHB)**
- Community-acquired: Ceftriaxone 2g IV + Metronidazole 500mg IV
- Hospital-acquired: Piperacillin-Tazobactam 4.5g IV Q8H
- Penicillin allergy: Meropenem 1g IV Q8H

*Time zero = time of clinical suspicion. Document in clinical notes.*`;
  }

  if (lower.includes("chest pain") || lower.includes("cardiac")) {
    return `**Chest Pain Assessment Pathway**

**Initial Assessment (within 10 minutes of arrival)**
1. 12-lead ECG -- STAT
2. Focused history: PQRST assessment
3. Vital signs including bilateral BP
4. IV access x2, bloods: Troponin, FBC, U&E, Coag, Glucose
5. Continuous cardiac monitoring

**Risk Stratification**
- **STEMI identified on ECG** -> activate cath lab (target door-to-balloon <90 min)
- **NSTEMI / Unstable angina** -> TIMI risk score, consider early invasive strategy
- **Low risk** -> serial troponins (0h, 3h), EDACS score, consider discharge with follow-up

**EDACS Score Components**
| Factor | Points |
|--------|--------|
| Age 18-45 | +2 |
| Age 46-50 | +4 |
| Age >50 | +6 |
| Male | +6 |
| Known CAD | +4 |
| Diabetes/hypertension/hyperlipidaemia | +2 each |
| Diaphoresis | +3 |
| Radiates to arm/shoulder | +5 |

Score <16 with negative serial troponins = low risk for discharge

**Immediate Management**
- Aspirin 300mg (if no contraindication)
- GTN spray/sublingual
- Morphine for severe pain (titrate 1-2mg IV)
- Oxygen only if SpO2 <94%
- Antiemetic PRN`;
  }

  if (lower.includes("fall") || lower.includes("fracture")) {
    return `**Falls Assessment & Fracture Management**

**Falls Risk Assessment (NZ ACC Guidelines)**
- Previous falls in last 12 months
- Medications review (sedatives, antihypertensives, polypharmacy)
- Gait and balance assessment (Timed Up and Go test)
- Visual acuity check
- Postural hypotension screen
- Cognitive assessment (if indicated)
- Environmental hazard review

**Fracture Management Pathway**
1. ATLS primary survey if trauma
2. Neurovascular assessment of affected limb
3. Analgesia (femoral nerve block for hip fractures)
4. Imaging: X-ray +/- CT
5. Orthopaedic referral for surgical fractures
6. VTE prophylaxis assessment
7. ACC claim lodgement (if injury-related)

**Hip Fracture Fast-Track (NZ Standard)**
- Target: surgery within 24-36 hours
- Pre-op: FBC, U&E, Group & Hold, CXR, ECG
- Orthogeriatric co-management for age >65
- Delirium prevention bundle

*ACC claim: Required for all injury-related fractures in NZ*`;
  }

  if (lower.includes("diabetes") || lower.includes("glucose") || lower.includes("hba1c")) {
    return `**Diabetes Management Review**

**Current Status**
- HbA1c: 8.2% (66 mmol/mol) -- above target
- Fasting glucose: 9.8 mmol/L
- Target HbA1c: <53 mmol/mol (<7.0%) for most adults

**Management Recommendations (NZSSD Guidelines)**
1. **Lifestyle** -- dietary review with dietitian, physical activity goal 150 min/week
2. **Metformin** -- currently 1g BD, at maximum dose
3. **Consider add-on therapy:**
   - First choice: Empagliflozin 10mg daily (SGLT2i) -- cardiovascular and renal benefit
   - Alternative: Vildagliptin 50mg BD (DPP-4i)
   - If BMI >30: consider funded GLP-1 RA (Dulaglutide)
4. **Monitoring** -- HbA1c every 3 months until at target, then 6-monthly
5. **Annual review** -- retinal screening, foot check, renal function, lipids, BP

**Equity Considerations**
- NZ Maori and Pacific populations: higher T2DM prevalence, earlier onset
- Culturally appropriate education resources available
- Whanau Ora approach to diabetes self-management
- Green prescription for exercise support

*Refer to NZSSD Type 2 Diabetes Guidelines 2021*`;
  }

  // Default clinical response
  return `**Hauora Clinical AI**

I can assist you with clinical decision support across several areas:

- **Patient summaries** -- "Summarise patient AAA1234"
- **Drug interactions** -- "What are the drug interactions for Warfarin?"
- **Clinical notes** -- "Generate SOAP note for chest pain presentation"
- **Early warning scores** -- "Calculate NEWS2 for HR 95, BP 100/60..."
- **Discharge planning** -- "Discharge checklist for AAA1234"
- **Lab interpretation** -- "Interpret labs for EEE7890"
- **Differential diagnosis** -- "Differential for acute chest pain"
- **Medication review** -- "Review medications for patient"
- **Sepsis screening** -- "Sepsis screening protocol"
- **Chest pain pathway** -- "Chest pain assessment pathway"

Please ask me a specific clinical question and I will provide evidence-based guidance relevant to NZ clinical practice.`;
}

// ── Quality Agent Responses (~10) ────────────────────────────────────

function qualityResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("compliance") || lower.includes("documentation")) {
    return `**Documentation Compliance Audit -- Ward 3**

**Audit Period:** 01/02/2026 -- 22/02/2026
**Records Reviewed:** 47 patient charts

**Compliance Summary**
| Standard | Compliant | Non-Compliant | Rate |
|----------|-----------|---------------|------|
| Admission documentation within 4h | 42 | 5 | 89% |
| Medication reconciliation on admission | 38 | 9 | 81% |
| VTE risk assessment within 24h | 44 | 3 | 94% |
| Falls risk assessment | 40 | 7 | 85% |
| Discharge summary within 24h | 35 | 12 | 74% |
| Allergy documentation | 46 | 1 | 98% |

**Key Findings**
1. Discharge summary completion rate below 80% target -- main gap is junior medical staff completing summaries after hours
2. Medication reconciliation has improved from 72% last month
3. VTE assessment compliance exceeds national benchmark (90%)

**Recommendations**
- Implement automated discharge summary reminder at 12h post-discharge decision
- Pharmacy-led medication reconciliation pilot for Ward 3
- Recognise VTE compliance improvement at next ward meeting

**Next Audit:** March 2026`;
  }

  if (lower.includes("quality report") || lower.includes("monthly")) {
    return `**Monthly Quality Report -- February 2026**

**Key Performance Indicators**
| Metric | Target | Actual | Trend |
|--------|--------|--------|-------|
| Hand hygiene compliance | >80% | 87% | Up |
| Falls per 1000 bed-days | <3.0 | 2.1 | Down |
| Pressure injury rate | <2% | 1.4% | Stable |
| Medication errors reported | -- | 12 | Down |
| HAI rate (per 1000 admissions) | <5.0 | 3.8 | Down |
| Patient experience score | >85% | 91% | Up |
| ED 6-hour target | >95% | 88% | Down |
| ESPI compliance | >100% | 94% | Stable |

**Highlights**
- Hand hygiene audit shows sustained improvement (was 79% in January)
- Falls rate at lowest in 12 months following whanau engagement initiative
- Patient experience score above national average (86%)

**Areas for Improvement**
- ED 6-hour target below 95% -- surge planning review underway
- ESPI 2 patients: 14 patients approaching long-wait threshold
- 3 medication errors classified as near-miss -- pharmacy review initiated

**Serious Adverse Events:** 0 this month
**Complaints Received:** 4 (2 resolved, 2 under investigation)

*Report prepared for Quality & Safety Committee*`;
  }

  if (lower.includes("readmission")) {
    return `**Readmission Analysis**

**30-Day Readmission Rates (Feb 2026)**
| Department | Readmissions | Total Discharges | Rate | National Avg |
|-----------|-------------|-----------------|------|-------------|
| General Medicine | 8 | 112 | 7.1% | 8.2% |
| Cardiology | 3 | 45 | 6.7% | 7.5% |
| Orthopaedics | 2 | 38 | 5.3% | 4.8% |
| Respiratory | 5 | 34 | 14.7% | 11.0% |
| General Surgery | 1 | 52 | 1.9% | 3.5% |

**High-Risk Patterns Identified**
1. **COPD readmissions** (Respiratory) -- 3 of 5 readmissions were COPD exacerbations
   - Common factor: Inadequate discharge education, no community follow-up within 48h
   - Recommendation: Implement COPD discharge bundle with respiratory nurse follow-up

2. **Heart failure** (Cardiology) -- 2 of 3 readmissions related to fluid overload
   - Contributing factor: Medication non-adherence post-discharge
   - Recommendation: Heart failure nurse specialist community follow-up within 7 days

3. **Surgical site infection** (Orthopaedics) -- 2 readmissions for wound complications
   - Recommendation: Review antibiotic prophylaxis protocol, wound care education

**Equity Lens**
- Maori readmission rate 12% vs non-Maori 6% -- further analysis in progress
- Pacific readmission rate 11% -- review access to community support services`;
  }

  if (lower.includes("audit") || lower.includes("antibiotic")) {
    return `**Antibiotic Prescribing Audit**

**Audit Period:** 15/02/2026 -- 22/02/2026
**Prescriptions Reviewed:** 89

**Compliance with Antibiotic Guidelines**
| Criterion | Compliant | Rate |
|-----------|-----------|------|
| Indication documented | 81 | 91% |
| Culture taken before antibiotics | 72 | 81% |
| Empiric choice per guideline | 76 | 85% |
| Duration specified | 68 | 76% |
| IV to oral switch within 48h (where appropriate) | 22/31 | 71% |
| Review/stop date documented | 59 | 66% |

**Top Prescribed Antibiotics**
1. Ceftriaxone 2g IV (23 prescriptions)
2. Amoxicillin/Clavulanate 1.2g IV (18)
3. Flucloxacillin 2g IV (12)
4. Metronidazole 500mg IV (11)
5. Co-trimoxazole 960mg PO (8)

**Issues Identified**
- 30% of IV antibiotics continued >48h without documented IV-to-oral switch review
- 34% missing review/stop dates -- antimicrobial stewardship risk
- 3 cases of broad-spectrum use without microbiological justification

**Actions Required**
1. Antimicrobial stewardship round -- weekly pharmacist-led review
2. Mandatory "antibiotic review at 48h" prompt in e-prescribing
3. Education session: IV-to-oral switch criteria (scheduled March 2026)

*Audit conducted per NZ Antimicrobial Stewardship Standards*`;
  }

  if (lower.includes("wait time") || lower.includes("waiting")) {
    return `**Wait Time Analysis**

**Emergency Department (Last 7 Days)**
| Triage Category | Target | Median Wait | 90th Percentile | Compliance |
|----------------|--------|-------------|-----------------|------------|
| T1 - Resuscitation | Immediate | 0 min | 2 min | 100% |
| T2 - Emergency | 10 min | 8 min | 14 min | 85% |
| T3 - Urgent | 30 min | 22 min | 48 min | 78% |
| T4 - Semi-urgent | 60 min | 45 min | 92 min | 72% |
| T5 - Non-urgent | 120 min | 68 min | 145 min | 81% |

**Outpatient Clinics (ESPI)**
| Speciality | Patients Waiting | >120 Days | Longest Wait |
|-----------|-----------------|-----------|-------------|
| Orthopaedics | 342 | 28 | 186 days |
| General Surgery | 218 | 12 | 145 days |
| Ophthalmology | 189 | 31 | 210 days |
| Cardiology | 156 | 8 | 132 days |
| ENT | 134 | 15 | 168 days |

**Key Concerns**
- Ophthalmology has longest waits -- capacity review recommended
- T3 ED compliance below 80% target -- nurse practitioner fast-track pilot proposed
- 94 ESPI-2 patients approaching long-wait threshold

*Data source: Hospital BI system, refreshed daily*`;
  }

  if (lower.includes("kpi") || lower.includes("target")) {
    return `**KPI Dashboard Summary -- February 2026**

**Ministry of Health Targets**
| Target | KPI | Current | Status |
|--------|-----|---------|--------|
| Shorter stays in ED | <6 hours for 95% | 88% | Below target |
| Improved access to elective surgery | ESPI compliance | 94% | Below target |
| Faster cancer treatment | 62-day target | 89% | Below target |
| Immunisation | 8-month coverage | 92% | On track |
| Raising healthy kids | BMI assessment | 95% | Achieved |

**Operational KPIs**
| Metric | Target | Actual |
|--------|--------|--------|
| Bed occupancy | <85% | 91% |
| Theatre utilisation | >80% | 78% |
| DNA rate (outpatients) | <10% | 8.5% |
| Staff turnover (annual) | <12% | 14% |
| Sick leave rate | <4% | 3.8% |

**Financial**
- YTD budget variance: -2.1% (over budget)
- Locum expenditure: $420K this month (up 15%)
- ACC revenue: on track

**Priority Actions**
1. ED flow improvement project (Phase 2 commencing March)
2. Elective surgery catch-up plan -- additional weekend lists approved
3. Staff retention initiative -- exit interview analysis underway`;
  }

  // Default quality response
  return `**Kounga Quality AI**

I can assist with quality improvement and compliance monitoring:

- **Documentation audits** -- "Check documentation compliance for ward 3"
- **Quality reports** -- "Generate monthly quality report"
- **Readmission analysis** -- "Identify readmission patterns"
- **Prescribing audits** -- "Review antibiotic prescribing audit"
- **Wait times** -- "Analyse ED and outpatient wait times"
- **KPI monitoring** -- "Show KPI dashboard summary"

What quality or compliance area would you like me to review?`;
}

// ── Research Agent Responses (~10) ───────────────────────────────────

function researchResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("sepsis") || lower.includes("guideline")) {
    return `**Latest Sepsis Management Guidelines (NZ Context)**

**Surviving Sepsis Campaign 2021 + NZ Adaptations**

**Definition**
Sepsis: Life-threatening organ dysfunction caused by dysregulated host response to infection (Sepsis-3, Singer et al. 2016).

**Key Recommendations (Grade A/B Evidence)**

1. **Hour-1 Bundle** (start within 1 hour of recognition)
   - Measure lactate; re-measure if >2 mmol/L
   - Obtain blood cultures before antibiotics
   - Administer broad-spectrum antibiotics
   - Begin rapid infusion of 30 mL/kg crystalloid for hypotension or lactate >=4
   - Apply vasopressors for MAP <65 despite fluid resuscitation

2. **Fluid Resuscitation**
   - Balanced crystalloids preferred over 0.9% saline (BaSICS, PLUS trials)
   - Reassess fluid responsiveness using dynamic measures
   - Avoid hydroxyethyl starch (HES)

3. **Antimicrobials**
   - Empiric broad-spectrum within 1 hour
   - De-escalate based on culture/sensitivity
   - Procalcitonin-guided discontinuation (moderate evidence)

4. **NZ-Specific Considerations**
   - Higher sepsis mortality in Maori and Pacific populations
   - Meningococcal disease: NZ has higher rates -- consider empiric coverage
   - Rural/remote: early recognition and retrieval protocols critical
   - ACC may apply if sepsis follows injury/procedure

**Recent Evidence (2024-2025)**
- CLOVERS trial: restrictive vs liberal fluids -- no mortality difference
- STRESS-L trial: Levosimendan not beneficial in septic cardiomyopathy
- VITAMINS trial: Vitamin C combination not beneficial

*Sources: Surviving Sepsis Campaign 2021, NZ Sepsis Action Plan 2023, NZGG*`;
  }

  if (lower.includes("acl") || lower.includes("reconstruction")) {
    return `**ACL Reconstruction -- Evidence Review**

**Timing of Surgery**

**Early vs Delayed Reconstruction**
- KANON Trial (Frobell et al., NEJM 2010, 5-year follow-up 2013):
  - No significant difference in outcomes between early ACL reconstruction and rehabilitation + optional delayed reconstruction
  - 51% of rehabilitation-first group eventually had surgery

- Recent meta-analysis (Defined Early <3 weeks, Delayed 6-12 weeks):
  - Early reconstruction: slightly better patient-reported outcomes at 2 years
  - No difference in re-rupture rates or arthritis at 5 years
  - Early surgery associated with increased arthrofibrosis risk

**NZ ACC Guidelines**
- Surgery recommended for: active patients, associated meniscal injury, recurrent instability despite rehabilitation
- Pre-operative rehabilitation (prehab) 4-6 weeks recommended
- Optimal timing: 4-8 weeks post-injury (allows swelling resolution, ROM recovery)

**Graft Choice**
| Graft | Pros | Cons | Re-rupture Rate |
|-------|------|------|-----------------|
| BPTB autograft | Gold standard, bone-to-bone healing | Anterior knee pain, kneeling pain | 5-7% |
| Hamstring autograft | Less donor site morbidity | Slower integration, tunnel widening | 6-9% |
| Quadriceps autograft | Emerging evidence, good biomechanics | Less long-term data | 4-6% |

**Return to Sport**
- Minimum 9 months post-surgery (consensus)
- Criteria-based (not time-based): strength >90% LSI, hop tests >90%, psychological readiness
- NZ-specific: ACC funds comprehensive rehabilitation pathway

*Key References: MOON Cohort, STABILITY Trial (LARS), NZ ACC Clinical Pathway 2023*`;
  }

  if (lower.includes("diabetes") || lower.includes("management")) {
    return `**Diabetes Management Protocols -- NZ Guidelines**

**NZSSD Type 2 Diabetes Management Guidelines (2021, updated 2024)**

**Screening & Diagnosis**
- Screen from age 30 (age 25 for Maori, Pacific, Indo-Asian)
- Diagnostic criteria: HbA1c >= 50 mmol/mol (6.7%) on two occasions
- Annual CVD risk assessment using NZ-specific PREDICT equations

**Pharmacological Management Pathway**

**Step 1: Lifestyle + Metformin**
- Target HbA1c <53 mmol/mol (7.0%) for most adults
- Metformin 500mg, titrate to 1g BD over 4-6 weeks

**Step 2: Add second agent (if HbA1c >53 after 3 months)**
- Preferred: Empagliflozin 10-25mg (SGLT2i) -- CV and renal benefit
- Alternative: Vildagliptin 50mg BD (DPP-4i) -- funded without Special Authority
- If BMI >30: consider Dulaglutide (GLP-1 RA) -- requires Special Authority

**Step 3: Triple therapy or insulin**
- Combine agents from different classes
- Basal insulin if HbA1c remains >64 mmol/mol (8.0%)

**NZ-Specific Equity Considerations**
- Maori: 2.5x higher T2DM prevalence, earlier onset, higher complication rates
- Pacific: 3x higher T2DM prevalence
- Funded medications: Metformin, Vildagliptin, Empagliflozin (with Special Authority), Insulin
- Green Prescription for exercise, Whanau Ora for holistic support
- Podiatry, retinal screening, dietitian -- funded through DHB/Te Whatu Ora

**Monitoring Schedule**
| Interval | Test/Review |
|----------|-------------|
| 3-monthly | HbA1c (until at target) |
| 6-monthly | HbA1c (once stable), BP, medication review |
| Annually | Retinal screening, foot check, ACR, lipids, eGFR, CVD risk |

*Sources: NZSSD Guidelines 2021, NZ Formulary, BPAC NZ*`;
  }

  if (lower.includes("cardiovascular") || lower.includes("heart")) {
    return `**NZ Cardiovascular Risk Guidelines**

**NZ Primary Prevention Guidelines (2018, reviewed 2024)**

**CVD Risk Assessment**
- Use PREDICT or Framingham (NZ-adjusted) equations
- Assess all adults from age 45 (Maori/Pacific/Indo-Asian from age 30)
- Reassess every 5 years (or annually if 10-15% risk)

**NZ-Specific Risk Adjustments**
- Maori: 1.5x risk multiplier applied
- Pacific: 1.3x risk multiplier applied
- Indo-Asian: 1.3x risk multiplier applied
- Family history of premature CVD: additional weighting
- Deprivation index: incorporated into PREDICT model

**Management by Risk Category**
| 5-year CVD Risk | Management |
|----------------|------------|
| <5% (Low) | Lifestyle advice, reassess in 5 years |
| 5-10% (Moderate) | Intensive lifestyle, consider treatment if single risk factors very high |
| 10-15% (High) | Lifestyle + pharmacotherapy (statin + BP lowering) |
| >15% (Very High) | Intensive pharmacotherapy, dual antiplatelet if indicated |

**Pharmacotherapy**
- Statin: Atorvastatin 10-80mg (first-line, funded)
- BP targets: <130/80 for most, <140/90 if low risk
- ACEi/ARB: first-line for BP in diabetes/renal disease
- Aspirin: secondary prevention only (not primary prevention)

**NZ Heart Foundation Recommendations**
- Cardiac rehabilitation referral for all ACS patients
- Smoking cessation: Quitline + NRT/Varenicline (funded)
- Dietary: Mediterranean-style, reduce processed food, sodium <2g/day
- Exercise: 150 min moderate or 75 min vigorous per week

*Sources: NZ CVD Risk Assessment Guidelines 2018, NZ Heart Foundation, BPAC NZ*`;
  }

  if (lower.includes("evidence") || lower.includes("study")) {
    return `**Evidence-Based Medicine -- Quick Reference**

**Levels of Evidence (NHMRC/Oxford)**
| Level | Study Design | Strength |
|-------|-------------|----------|
| I | Systematic review of RCTs | Highest |
| II | Well-designed RCT | High |
| III-1 | Pseudo-RCT | Moderate |
| III-2 | Comparative study with concurrent controls | Moderate |
| III-3 | Comparative study without concurrent controls | Low-Moderate |
| IV | Case series | Low |

**Critical Appraisal Framework**
1. **Validity** -- Was the study methodology sound?
   - Randomisation, blinding, intention-to-treat analysis
   - Loss to follow-up <20%
2. **Results** -- What are the findings?
   - Effect size (RR, OR, NNT, NNH)
   - Confidence intervals and statistical significance
   - Clinical vs statistical significance
3. **Applicability** -- Does it apply to my patient/NZ context?
   - Population demographics (Maori/Pacific representation?)
   - NZ healthcare system differences
   - Funded treatments available

**NZ Evidence Resources**
- BPAC NZ (bpac.org.nz) -- NZ-specific clinical guidance
- NZ Guidelines Group archives
- Cochrane Library (free access via NZ health libraries)
- TRIP Database (tripdatabase.com)
- NZ Formulary (nzf.org.nz)

**How to Ask a Clinical Question (PICO)**
- P: Patient/Population
- I: Intervention
- C: Comparison
- O: Outcome

Would you like me to search for evidence on a specific clinical question?`;
  }

  if (lower.includes("mental health")) {
    return `**Mental Health Guidelines -- NZ Context**

**He Ara Oranga -- NZ Mental Health & Addiction Inquiry (2018)**

**Key Recommendations (implemented/in progress)**
1. Expand access to primary mental health services
2. Increase Maori and Pacific mental health workforce
3. Address social determinants (housing, employment, poverty)
4. Reduce seclusion and restraint in inpatient settings
5. Integrated addiction and mental health services

**Assessment Tools (NZ Standard)**
| Tool | Use | Cut-off |
|------|-----|---------|
| PHQ-9 | Depression screening | >=10 moderate |
| GAD-7 | Anxiety screening | >=10 moderate |
| AUDIT | Alcohol use | >=8 hazardous |
| K10 | Psychological distress | >=25 high distress |
| Columbia-Suicide | Suicide risk | Any positive = assess |

**Pharmacological Guidelines (NZ Formulary)**
- Depression first-line: Fluoxetine 20mg or Citalopram 20mg (funded)
- Anxiety first-line: SSRI + CBT (most evidence)
- Avoid benzodiazepines long-term (max 2-4 weeks)
- Maori: consider rongoā (traditional medicine) alongside conventional treatment

**Te Whare Tapa Wha Model (Mason Durie)**
Holistic wellbeing framework used in NZ mental health:
- Taha Wairua (Spiritual) -- meaning, purpose, faith
- Taha Hinengaro (Mental/Emotional) -- thoughts, feelings
- Taha Tinana (Physical) -- body, physical health
- Taha Whanau (Family/Social) -- belonging, relationships

**Crisis Resources**
- 1737 -- Need to Talk? (24/7 free call/text)
- Lifeline NZ: 0800 543 354
- Suicide Crisis Helpline: 0508 828 865

*Sources: He Ara Oranga 2018, RANZCP Guidelines, Te Rau Hinengaro NZ Mental Health Survey*`;
  }

  if (lower.includes("anticoagul") || lower.includes("warfarin") || lower.includes("doac")) {
    return `**Anticoagulation Guidelines -- NZ Evidence Summary**

**Atrial Fibrillation -- Stroke Prevention**
- Use CHA2DS2-VASc score for risk assessment
- Score >=2 (males) or >=3 (females): anticoagulation recommended
- DOACs preferred over Warfarin (unless mechanical valve or moderate-severe mitral stenosis)

**DOAC Options (NZ Funded)**
| DOAC | Dose (AF) | Renal Threshold | NZ Funding |
|------|-----------|-----------------|------------|
| Dabigatran | 150mg BD | eGFR >30 | Funded (Special Authority) |
| Rivaroxaban | 20mg daily | eGFR >15 | Funded (Special Authority) |
| Apixaban | 5mg BD | eGFR >25 | Funded (Special Authority) |

**Key Trials**
- RE-LY (Dabigatran): Non-inferior to warfarin, less intracranial haemorrhage
- ROCKET-AF (Rivaroxaban): Non-inferior, simpler dosing
- ARISTOTLE (Apixaban): Superior to warfarin for stroke prevention and major bleeding

**Warfarin Management**
- Target INR 2.0-3.0 for most indications
- Time in therapeutic range (TTR) target >65%
- NZ: Community anticoagulation clinics available

*Sources: ESC AF Guidelines 2024, BPAC NZ Anticoagulation, NZ Formulary*`;
  }

  // Default research response
  return `**Rangahau Research AI**

I can help you find evidence-based clinical information:

- **Clinical guidelines** -- "Latest guidelines for sepsis management"
- **Surgical evidence** -- "Evidence for ACL reconstruction timing"
- **Disease management** -- "Compare diabetes management protocols"
- **NZ-specific guidelines** -- "NZ cardiovascular risk guidelines"
- **Literature review** -- "Evidence for [clinical question]"
- **Mental health** -- "NZ mental health guidelines"

What clinical question would you like me to research?`;
}

// ── Commander Mode Responses ─────────────────────────────────────────

interface CommanderPlan {
  steps: string[];
  systems: string[];
  risk: "low" | "medium" | "high";
  summary: string;
}

function commanderResponse(message: string): CommanderPlan {
  const lower = message.toLowerCase();

  if (lower.includes("discharge")) {
    return {
      summary: "Discharge patient with medication review, ACC update, and community follow-up coordination",
      steps: [
        "Complete discharge medication reconciliation and prescriptions",
        "Generate discharge summary and send to GP via e-referral",
        "Update ACC claim status to 'community rehabilitation phase'",
        "Book orthopaedic follow-up appointment (2 weeks)",
        "Notify community pharmacy of discharge medications",
        "Arrange district nursing referral for wound care",
        "Update bed management system -- mark bed for cleaning",
        "Send patient experience survey via email/SMS",
      ],
      systems: ["Patient Management", "Pharmacy", "ACC Claims", "Bed Management", "e-Referral", "Scheduling"],
      risk: "low",
    };
  }

  if (lower.includes("admit") || lower.includes("icu") || lower.includes("sepsis pathway")) {
    return {
      summary: "Emergency ICU admission with sepsis pathway activation across clinical and administrative systems",
      steps: [
        "Create admission record -- ICU, high-acuity bed allocation",
        "Activate Sepsis Hour-1 Bundle protocol in CDSS",
        "Order STAT labs: blood cultures x2, FBC, UE, CRP, lactate, coagulation",
        "Prescribe empiric antibiotics per hospital sepsis guideline",
        "Initiate continuous vital signs monitoring (NEWS2 automated)",
        "Alert ICU consultant and registrar on-call",
        "Notify next of kin / whanau as per patient preferences",
        "Update bed management -- ICU bed occupied, ED bed freed",
        "Generate ACC notification if injury/procedure-related",
        "Create audit trail entry for sepsis pathway activation",
      ],
      systems: ["Patient Management", "CDSS", "Laboratory", "Pharmacy", "Bed Management", "ACC Claims", "Audit Trail"],
      risk: "high",
    };
  }

  if (lower.includes("audit") || lower.includes("prescription")) {
    return {
      summary: "Comprehensive prescription audit across all wards for the last 24 hours",
      steps: [
        "Extract all prescriptions from last 24 hours across all wards",
        "Cross-reference with antibiotic stewardship guidelines",
        "Check for drug-drug interactions across concurrent prescriptions",
        "Verify allergy documentation compliance for all prescriptions",
        "Identify controlled substance prescriptions for schedule review",
        "Generate compliance report with ward-level breakdown",
        "Flag high-risk prescriptions for pharmacist review",
        "Submit audit results to Quality & Safety dashboard",
      ],
      systems: ["Pharmacy", "CDSS", "Quality & Safety", "Audit Trail", "Patient Management"],
      risk: "low",
    };
  }

  if (lower.includes("transfer") || lower.includes("ward")) {
    return {
      summary: "Inter-ward patient transfer with handover documentation and system updates",
      steps: [
        "Generate clinical handover summary (ISBAR format)",
        "Update patient location in bed management system",
        "Transfer active medication orders to receiving ward",
        "Notify receiving ward nursing team",
        "Update dietary requirements and allergy alerts",
        "Schedule follow-up reviews with current treating team",
      ],
      systems: ["Patient Management", "Bed Management", "Pharmacy", "Clinical Handover"],
      risk: "low",
    };
  }

  // Default commander plan
  return {
    summary: "Multi-system action plan generated from natural language command",
    steps: [
      "Parse command and identify affected clinical systems",
      "Validate patient identity and current status",
      "Execute primary clinical action",
      "Update relevant administrative systems",
      "Generate audit trail and notifications",
      "Confirm completion across all systems",
    ],
    systems: ["Patient Management", "Clinical Systems", "Audit Trail"],
    risk: "medium",
  };
}

// ── API Route Handler ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { message, agent, commander } = body as {
    message: string;
    agent?: "clinical" | "quality" | "research";
    commander?: boolean;
  };

  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 800));

  if (commander) {
    const plan = commanderResponse(message);
    return NextResponse.json({ agent: "commander", message: plan.summary, plan });
  }

  let responseMessage: string;

  switch (agent) {
    case "quality":
      responseMessage = qualityResponse(message);
      break;
    case "research":
      responseMessage = researchResponse(message);
      break;
    case "clinical":
    default:
      responseMessage = clinicalResponse(message);
      break;
  }

  return NextResponse.json({ agent: agent || "clinical", message: responseMessage });
}
