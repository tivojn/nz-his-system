import { NextResponse } from "next/server";

const reportEN = (date: string) => `RADIOLOGICAL REPORT — AI-Assisted Analysis

Patient: Demo Patient
Study: CT Chest with Contrast
Date: ${date}

FINDINGS:
1. A 2.8 cm spiculated soft tissue mass is identified in the right upper lobe (RUL), segment 1/2. The mass demonstrates irregular margins with surrounding ground-glass opacity.
2. Ipsilateral mediastinal lymphadenopathy noted — subcarinal node measuring 1.4 cm (short axis).
3. No pleural effusion identified bilaterally.
4. No osseous metastatic disease evident.
5. Mild emphysematous changes in bilateral upper lobes.

IMPRESSION:
- Right upper lobe spiculated mass (2.8 cm) — highly suspicious for primary lung malignancy (Lung-RADS 4B).
- Mediastinal lymphadenopathy suggests possible N2 disease.
- Recommend urgent tissue sampling and PET-CT staging.

RECOMMENDATIONS:
1. Urgent CT-guided percutaneous biopsy or bronchoscopic biopsy
2. PET-CT for staging workup
3. Pulmonary function tests (PFTs) pre-operatively
4. MDT (Multidisciplinary Team) discussion
5. Referral to Thoracic Surgery / Oncology
6. ACC claim consideration if occupational exposure history

AI Confidence: 94.2%
Model: NZ-HIS Clinical Vision v2.0
This is AI-assisted analysis. All findings must be verified by a qualified radiologist.`;

const reportCN = (date: string) => `放射科报告 — AI 辅助分析

患者：演示患者
检查项目：胸部增强 CT
日期：${date}

影像发现：
1. 右上叶（RUL）第1/2段可见一个 2.8 cm 毛刺状软组织肿块，肿块边缘不规则，周围可见磨玻璃样改变。
2. 同侧纵隔淋巴结肿大 — 隆突下淋巴结短径 1.4 cm。
3. 双侧未见胸腔积液。
4. 未见骨转移性病变。
5. 双上叶轻度肺气肿改变。

诊断意见：
- 右上叶毛刺状肿块（2.8 cm）— 高度怀疑原发性肺恶性肿瘤（Lung-RADS 4B）。
- 纵隔淋巴结肿大提示可能存在 N2 期病变。
- 建议紧急组织取样及 PET-CT 分期检查。

建议措施：
1. 紧急 CT 引导经皮穿刺活检或支气管镜活检
2. PET-CT 分期检查
3. 术前肺功能检查 (PFTs)
4. MDT（多学科团队）讨论
5. 转诊至胸外科/肿瘤科
6. 如有职业暴露史，考虑 ACC 理赔

AI 置信度：94.2%
模型：NZ-HIS Clinical Vision v2.0
此为 AI 辅助分析结果，所有发现须经合格放射科医师确认。`;

export async function POST(req: Request) {
  const { language } = await req.json();

  // Simulate AI processing time
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const date = new Date().toLocaleDateString("en-NZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return NextResponse.json({
    reportEN: reportEN(date),
    reportCN: reportCN(date),
    confidence: 94.2,
    model: "NZ-HIS Clinical Vision v2.0",
    language,
  });
}
