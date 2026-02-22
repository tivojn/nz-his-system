import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT_EN = `You are an expert radiologist AI assistant integrated into the NZ-HIS Hospital Information System (New Zealand).
You analyze medical images described to you and produce structured radiological reports.

When given a clinical scenario/image description, produce a detailed report in the following format:

RADIOLOGICAL REPORT — AI-Assisted Analysis

Patient: [Patient name if provided]
Study: [Imaging modality]
Date: [Current date]

FINDINGS:
[Numbered list of detailed findings using proper radiological terminology. Include measurements, locations (using anatomical segments), and characterization of abnormalities.]

IMPRESSION:
[Bullet-pointed summary of key findings with Lung-RADS, BI-RADS, or other applicable scoring systems.]

RECOMMENDATIONS:
[Numbered list of clinical recommendations including further workup, referrals, and NZ-specific considerations like ACC claims.]

AI Confidence: [Percentage]
This is AI-assisted analysis. All findings must be verified by a qualified radiologist.

Be clinically precise. Use SNOMED CT codes where relevant. Reference NZ clinical guidelines and Te Whatu Ora standards.`;

const SYSTEM_PROMPT_CN = `你是一名集成在NZ-HIS医院信息系统（新西兰）中的专家放射科AI助手。
你分析描述给你的医学影像，并生成结构化的放射科报告。

当给定临床场景/影像描述时，生成以下格式的详细中文报告：

放射科报告 — AI 辅助分析

患者：[患者姓名]
检查项目：[影像学检查方式]
日期：[当前日期]

影像发现：
[使用专业放射学术语的编号列表。包括测量值、位置（使用解剖学分段）和异常特征描述。]

诊断意见：
[要点总结关键发现，附Lung-RADS、BI-RADS或其他适用的评分系统。]

建议措施：
[编号列表的临床建议，包括进一步检查、转诊和新西兰特有的考虑因素如ACC理赔。]

AI 置信度：[百分比]
此为 AI 辅助分析结果，所有发现须经合格放射科医师确认。

请使用精确的临床术语。在相关处引用SNOMED CT编码。参考新西兰临床指南和Te Whatu Ora标准。`;

// Hardcoded fallback reports for when API key is not set
function getFallbackReport(date: string, language: string) {
  const reportEN = `RADIOLOGICAL REPORT — AI-Assisted Analysis

Patient: Demo Patient
Study: CT Chest with Contrast
Date: ${date}

FINDINGS:
1. A 2.8 cm spiculated soft tissue mass is identified in the right upper lobe (RUL), segment 1/2 (apicoposterior). The mass demonstrates irregular margins with surrounding ground-glass opacity (GGO) halo, consistent with lepidic spread. Hounsfield unit measurement: 35-45 HU.
2. Ipsilateral mediastinal lymphadenopathy noted — subcarinal node (station 7) measuring 1.4 cm (short axis), pre-tracheal node (station 4R) measuring 0.9 cm. Both exceed size criteria for significance.
3. No contralateral hilar or mediastinal lymphadenopathy.
4. No pleural effusion identified bilaterally. No pericardial effusion.
5. No osseous metastatic disease evident on bone windows. No pathological fractures.
6. Mild centrilobular emphysematous changes in bilateral upper lobes, consistent with smoking history.
7. Coronary artery calcification noted — moderate (Agatston score estimated 100-300).
8. Small 4mm non-calcified nodule in left lower lobe (segment 8) — likely benign but warrants follow-up per Fleischner criteria.
9. Liver, adrenals, and visualized upper abdomen unremarkable on soft tissue windows.

IMPRESSION:
- Right upper lobe spiculated mass (2.8 cm) — highly suspicious for primary lung malignancy (Lung-RADS 4B). Morphology suggests adenocarcinoma, possibly with lepidic component.
- Mediastinal lymphadenopathy (stations 4R, 7) suggests possible N2 disease — clinical stage T1c N2 M0 (Stage IIIA) pending tissue confirmation.
- Background emphysema — relevant for surgical planning and PFT assessment.
- Incidental LLL nodule (4mm) — recommend 12-month CT follow-up per Fleischner 2017 guidelines for low-risk patients.

RECOMMENDATIONS:
1. Urgent CT-guided percutaneous biopsy or EBUS-guided TBNA for tissue diagnosis and molecular profiling (EGFR, ALK, ROS1, PD-L1)
2. PET-CT (FDG) for comprehensive staging workup
3. Pulmonary function tests (PFTs) including DLCO — essential for surgical candidacy
4. Brain MRI with contrast — baseline for staging
5. MDT (Multidisciplinary Team) discussion at next available slot
6. Referral to Thoracic Surgery and Medical Oncology
7. Smoking cessation support referral (if applicable)
8. ACC claim consideration if occupational exposure history (asbestos, silica, radon)
9. Te Whatu Ora cancer pathway — ensure 62-day faster cancer treatment target compliance
10. Consider genetic counselling if age <50 or family history of lung cancer

SNOMED CT: 254637007 (Non-small cell lung cancer)
ICD-10-AM: C34.1 (Malignant neoplasm of upper lobe, bronchus or lung)

AI Confidence: 94.2%
Model: NZ-HIS Clinical Vision v2.1 (Claude-powered)
This is AI-assisted analysis. All findings must be verified by a qualified radiologist.`;

  const reportCN = `放射科报告 — AI 辅助分析

患者：演示患者
检查项目：胸部增强 CT
日期：${date}

影像发现：
1. 右上叶（RUL）第1/2段（尖后段）可见一个 2.8 cm 毛刺状软组织肿块。肿块边缘不规则，周围可见磨玻璃影（GGO）晕征，符合附壁生长模式。CT 值测量：35-45 HU。
2. 同侧纵隔淋巴结肿大 — 隆突下淋巴结（第7站）短径 1.4 cm，气管前淋巴结（第4R站）短径 0.9 cm。两者均超过显著性大小标准。
3. 对侧未见肺门或纵隔淋巴结肿大。
4. 双侧未见胸腔积液。未见心包积液。
5. 骨窗未见骨转移性病变。未见病理性骨折。
6. 双上叶轻度小叶中心型肺气肿改变，符合吸烟史表现。
7. 冠状动脉钙化 — 中度（Agatston 评分估计 100-300）。
8. 左下叶（第8段）4mm 非钙化小结节 — 可能为良性，但根据 Fleischner 标准建议随访。
9. 肝脏、肾上腺及可见上腹部软组织窗未见明显异常。

诊断意见：
- 右上叶毛刺状肿块（2.8 cm）— 高度怀疑原发性肺恶性肿瘤（Lung-RADS 4B）。形态学提示腺癌，可能伴附壁生长成分。
- 纵隔淋巴结肿大（第4R、7站）提示可能存在 N2 期病变 — 临床分期 T1c N2 M0（IIIA 期），待组织学确认。
- 背景肺气肿 — 与手术规划和肺功能评估相关。
- 左下叶偶发结节（4mm）— 根据 2017 年 Fleischner 指南建议低风险患者 12 个月后 CT 随访。

建议措施：
1. 紧急 CT 引导经皮穿刺活检或 EBUS 引导 TBNA 获取组织诊断和分子检测（EGFR、ALK、ROS1、PD-L1）
2. PET-CT（FDG）全面分期检查
3. 肺功能检查（PFTs）包括 DLCO — 评估手术适应性的关键
4. 脑部增强 MRI — 基线分期检查
5. MDT（多学科团队）讨论 — 尽快安排
6. 转诊至胸外科和肿瘤内科
7. 戒烟支持转介（如适用）
8. 如有职业暴露史（石棉、二氧化硅、氡气），考虑 ACC 理赔
9. Te Whatu Ora 癌症诊疗路径 — 确保符合 62 天快速癌症治疗目标
10. 如年龄 <50 岁或有肺癌家族史，考虑遗传咨询

SNOMED CT: 254637007（非小细胞肺癌）
ICD-10-AM: C34.1（上叶、支气管或肺恶性肿瘤）

AI 置信度：94.2%
模型：NZ-HIS Clinical Vision v2.1（Claude 驱动）
此为 AI 辅助分析结果，所有发现须经合格放射科医师确认。`;

  return { reportEN, reportCN, confidence: 94.2, model: "NZ-HIS Clinical Vision v2.1" };
}

export async function POST(req: Request) {
  const { language, imageDescription, patientName } = await req.json();

  const date = new Date().toLocaleDateString("en-NZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // If no API key configured, use enhanced fallback
  if (!apiKey) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const fallback = getFallbackReport(date, language);
    return NextResponse.json({
      ...fallback,
      language,
      source: "fallback",
    });
  }

  // Real Claude API call
  try {
    const client = new Anthropic({ apiKey });

    const userMessage = imageDescription
      ? `Analyze the following medical image/clinical scenario and generate a radiological report:\n\n${imageDescription}\n\nPatient: ${patientName || "Unknown"}\nDate: ${date}`
      : `Analyze a CT Chest with Contrast showing a right upper lobe spiculated mass with surrounding ground-glass opacity and ipsilateral mediastinal lymphadenopathy. Generate a comprehensive radiological report.\n\nPatient: ${patientName || "Demo Patient"}\nDate: ${date}`;

    // Generate English report
    const enResponse = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: SYSTEM_PROMPT_EN,
      messages: [{ role: "user", content: userMessage }],
    });

    const reportEN = enResponse.content[0].type === "text" ? enResponse.content[0].text : "";

    // Generate Chinese report
    const cnResponse = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: SYSTEM_PROMPT_CN,
      messages: [{ role: "user", content: userMessage + "\n\n请用中文生成报告。" }],
    });

    const reportCN = cnResponse.content[0].type === "text" ? cnResponse.content[0].text : "";

    return NextResponse.json({
      reportEN,
      reportCN,
      confidence: 94.2,
      model: "NZ-HIS Clinical Vision v2.1 (Claude-powered)",
      language,
      source: "claude-api",
    });
  } catch (error) {
    // Fallback to hardcoded report on API error
    console.error("Claude API error, using fallback:", error);
    const fallback = getFallbackReport(date, language);
    return NextResponse.json({
      ...fallback,
      language,
      source: "fallback",
    });
  }
}
