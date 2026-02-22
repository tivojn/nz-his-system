"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScanEye, Send, RefreshCw, AlertTriangle, CheckCircle, Clock, Brain } from "lucide-react";
import { useBilingual } from "@/components/bilingual-provider";
import { LungScanViewer } from "@/components/medical/lung-scan";

interface DiagnosisReport {
  reportEN: string;
  reportCN: string;
  confidence: number;
  model: string;
}

export default function DiagnosisPage() {
  const { t, language } = useBilingual();
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<DiagnosisReport | null>(null);
  const [showReport, setShowReport] = useState(false);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setReport(null);
    setShowReport(false);

    try {
      const res = await fetch("/api/diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language }),
      });
      const data = await res.json();
      setReport(data);
      // Small delay before showing for animation
      setTimeout(() => setShowReport(true), 100);
    } catch {
      // Handle error silently
    } finally {
      setAnalyzing(false);
    }
  };

  const handleNewAnalysis = () => {
    setReport(null);
    setShowReport(false);
  };

  const todayDate = new Date().toLocaleDateString("en-NZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-teal-100">
          <ScanEye className="h-6 w-6 text-teal-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("AI Medical Image Diagnosis")}
          </h1>
          <p className="text-sm text-gray-500">
            {t("Upload or select a medical image for AI-assisted diagnosis")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column — Image Viewer */}
        <div className="space-y-4">
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <ScanEye className="h-4 w-4 text-teal-700" />
                  {t("Sample CT Scan — Right Upper Lobe Mass")}
                </CardTitle>
                <Badge variant="outline" className="text-xs bg-teal-50 text-teal-700 border-teal-200">
                  {t("Pre-loaded Demo Image")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <LungScanViewer patientName="Demo Patient" date={todayDate} />
            </CardContent>
          </Card>

          {/* Action Button */}
          <div className="flex gap-3">
            {!report ? (
              <Button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="flex-1 bg-teal-700 hover:bg-teal-800 text-white h-12 text-base font-semibold shadow-md"
                size="lg"
              >
                {analyzing ? (
                  <>
                    <Brain className="h-5 w-5 mr-2 animate-pulse" />
                    {t("AI Analyzing...")}
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    {t("Submit for AI Analysis")}
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNewAnalysis}
                variant="outline"
                className="flex-1 h-12 text-base font-semibold border-teal-300 text-teal-700 hover:bg-teal-50"
                size="lg"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                {t("New Analysis")}
              </Button>
            )}
          </div>

          {/* Processing indicator */}
          {analyzing && (
            <Card className="border-0 shadow-sm bg-gradient-to-r from-teal-50 to-cyan-50">
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin" />
                    <Brain className="h-5 w-5 text-teal-700 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div>
                    <p className="font-semibold text-teal-800">{t("AI Analyzing...")}</p>
                    <p className="text-sm text-teal-600">{t("Analyzing medical image with deep learning model...")}</p>
                  </div>
                </div>
                {/* Progress animation */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-teal-700">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Image preprocessing complete</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-teal-700">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Lung segmentation complete</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-teal-600 animate-pulse">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Running nodule detection model...</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Generating radiological report...</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column — Diagnosis Report */}
        <div className="space-y-4">
          {report && showReport ? (
            <div
              className="space-y-4 transition-all duration-700 ease-out"
              style={{
                opacity: showReport ? 1 : 0,
                transform: showReport ? "translateY(0)" : "translateY(20px)",
              }}
            >
              {/* Report Header */}
              <Card className="border-0 shadow-sm bg-gradient-to-r from-teal-50 to-emerald-50 border-l-4 border-l-teal-600">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-teal-800">{t("Diagnosis Report")}</h3>
                        <p className="text-xs text-teal-600">{t("AI-Assisted Radiological Analysis")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-teal-100 text-teal-800 text-sm font-bold">
                        {report.confidence}%
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{report.model}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* English Report */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">EN</Badge>
                    Radiological Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed bg-gray-50 p-4 rounded-lg overflow-x-auto">
                    {report.reportEN}
                  </pre>
                </CardContent>
              </Card>

              {/* Chinese Report — show when language is cn */}
              {language === "cn" && (
                <Card className="border-0 shadow-sm border-l-4 border-l-red-400">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">CN</Badge>
                      放射科报告
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed bg-red-50/30 p-4 rounded-lg overflow-x-auto">
                      {report.reportCN}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {/* Disclaimer */}
              <Card className="border-0 shadow-none bg-amber-50/50 border border-amber-200">
                <CardContent className="py-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-amber-800 leading-relaxed">
                      <span className="font-semibold">Disclaimer: </span>
                      {language === "cn"
                        ? "此为 AI 辅助分析结果，仅供参考。所有影像学发现必须由具有执业资格的放射科医师进行审核和确认。本系统不构成正式医学诊断。"
                        : "This is an AI-assisted analysis for reference only. All radiological findings must be reviewed and confirmed by a qualified radiologist. This system does not constitute a formal medical diagnosis."}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : !analyzing ? (
            /* Placeholder when no report */
            <Card className="border-0 shadow-sm h-full min-h-[400px] flex items-center justify-center">
              <CardContent className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <ScanEye className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-400 mb-2">
                  {t("Diagnosis Report")}
                </h3>
                <p className="text-sm text-gray-400 max-w-xs mx-auto">
                  {language === "cn"
                    ? "点击「提交 AI 分析」按钮，AI 将分析医学影像并生成诊断报告。"
                    : "Click \"Submit for AI Analysis\" to have the AI analyze the medical image and generate a diagnosis report."}
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      {/* Bottom Disclaimer Bar */}
      <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>
            {language === "cn"
              ? "NZ-HIS AI 影像诊断系统 — 仅用于临床辅助决策。所有 AI 生成的结果必须经过合格医疗专业人员审核。符合 HISO 10029:2022 和《2020 年健康信息隐私法》要求。"
              : "NZ-HIS AI Imaging Diagnosis System — For clinical decision support only. All AI-generated findings must be reviewed by qualified medical professionals. Compliant with HISO 10029:2022 and the Health Information Privacy Code 2020."}
          </span>
        </div>
      </div>
    </div>
  );
}
