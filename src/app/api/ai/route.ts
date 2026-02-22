import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function mockAIResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("latest labs") || lower.includes("lab results")) {
    const nhiMatch = message.match(/[A-Z]{3}\d{4}/);
    if (nhiMatch) {
      return `📊 **Lab Results for ${nhiMatch[0]}**\n\nSearching patient records...\n\n| Test | Value | Unit | Status |\n|------|-------|------|--------|\n| Haemoglobin | 135 | g/L | Normal |\n| HbA1c | 8.2 | % | ⚠️ High |\n| Glucose (Fasting) | 9.8 | mmol/L | ⚠️ High |\n\n*Note: HbA1c and fasting glucose are elevated. Consider reviewing diabetes management plan.*`;
    }
    return "Please specify a patient NHI number (e.g., 'Show me latest labs for AAA1234')";
  }

  if (lower.includes("admissions") || lower.includes("admitted")) {
    return `📋 **Today's Admissions Summary**\n\n- **Hemi Tūhoe** (AAA1234) — Emergency Medicine, Fractured right tibia\n- **Sione Manu** (CCC9012) — Orthopaedics, ACL tear\n- **Wiremu Ngata** (EEE7890) — General Medicine, Type 2 Diabetes management\n\n**Total Active Admissions:** 3\n**Departments:** Emergency (1), Orthopaedics (1), General Medicine (1)`;
  }

  if (lower.includes("discharge summary") || lower.includes("discharge")) {
    const nhiMatch = message.match(/[A-Z]{3}\d{4}/);
    const nhi = nhiMatch ? nhiMatch[0] : "AAA1234";
    return `📄 **Draft Discharge Summary — ${nhi}**\n\n**Patient:** Hemi Tūhoe\n**NHI:** ${nhi}\n**Admission Date:** ${new Date(Date.now() - 2 * 86400000).toLocaleDateString("en-NZ")}\n**Discharge Date:** ${new Date().toLocaleDateString("en-NZ")}\n**Department:** Emergency Medicine\n\n**Diagnosis:** Displaced fracture of right tibial shaft (SNOMED: 263225007)\n\n**Summary:** Patient admitted following workplace fall. ORIF performed successfully. Post-operative recovery uneventful.\n\n**Medications on Discharge:**\n- Paracetamol 1g QDS PRN\n- Tramadol 50mg QDS PRN (max 5 days)\n- Enoxaparin 40mg daily SC (14 days)\n\n**Follow-up:**\n- Orthopaedic clinic 2 weeks\n- GP review 1 week\n- ACC claim: ACC-2024-00123 (active)\n\n**GP:** To be notified\n\n*⚠️ This is an AI-generated draft. Please review and approve before finalising.*`;
  }

  if (lower.includes("waitlist") || lower.includes("waiting")) {
    return `⏳ **Waitlist Overview**\n\n| Priority | Count | Avg Wait |\n|----------|-------|----------|\n| 🔴 Urgent | 1 | 3 days |\n| 🟡 Semi-urgent | 2 | 14-21 days |\n| 🟢 Routine | 2 | 30-60 days |\n\n**Total Waiting:** 5 patients\n\n**Urgent Cases:**\n- Hemi Tūhoe — ORIF Right Tibia (Orthopaedics)`;
  }

  if (lower.includes("help") || lower.includes("what can you")) {
    return `🤖 **NZ-HIS AI Clinical Assistant**\n\nI can help you with:\n\n- 📊 **Lab Results** — "Show me latest labs for AAA1234"\n- 📋 **Admissions** — "Summarize today's admissions"\n- 📄 **Discharge** — "Draft discharge summary for NHI AAA1234"\n- ⏳ **Waitlist** — "Show waitlist status"\n- 🏥 **Patient Info** — "Tell me about patient CCC9012"\n\nTry any of these commands!`;
  }

  if (lower.includes("patient") && message.match(/[A-Z]{3}\d{4}/)) {
    const nhi = message.match(/[A-Z]{3}\d{4}/)![0];
    return `🏥 **Patient Summary — ${nhi}**\n\nSearching NHI database...\n\n*Patient information retrieved. Please check the Patient Management module for full details.*\n\nQuick actions: View EMR | Book Appointment | Add to Waitlist`;
  }

  return `🤖 I understand you're asking about: "${message}"\n\nAs a demo AI assistant, I can help with:\n- Lab results lookup\n- Admission summaries\n- Discharge summary drafting\n- Waitlist status\n\nTry: "Show me latest labs for AAA1234" or "Summarize today's admissions"`;
}

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  
  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  const response = mockAIResponse(message);
  
  return NextResponse.json({ response });
}
