"use client";

import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ScanEye,
  Send,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Brain,
  Upload,
  ImagePlus,
  X,
  FileImage,
} from "lucide-react";
import { useBilingual } from "@/components/bilingual-provider";
import { LungScanViewer } from "@/components/medical/lung-scan";

interface DiagnosisReport {
  reportEN: string;
  reportCN: string;
  confidence: number;
  model: string;
  source?: string;
}

export default function DiagnosisPage() {
  const { t, language } = useBilingual();
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<DiagnosisReport | null>(null);
  const [showReport, setShowReport] = useState(false);

  // Image upload state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null); // base64 data URL
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null); // raw base64 (no prefix)
  const [imageMimeType, setImageMimeType] = useState<string>("image/png");
  const [dragActive, setDragActive] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [imageDescription, setImageDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    // Limit to 20MB
    if (file.size > 20 * 1024 * 1024) {
      alert("Image too large. Maximum 20MB.");
      return;
    }
    setUploadedFile(file);
    setImageMimeType(file.type);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setUploadedImage(dataUrl);
      // Extract raw base64 (strip "data:image/png;base64," prefix)
      const base64 = dataUrl.split(",")[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processFile(e.dataTransfer.files[0]);
      }
    },
    [processFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        processFile(e.target.files[0]);
      }
    },
    [processFile]
  );

  const clearUpload = () => {
    setUploadedImage(null);
    setUploadedFile(null);
    setImageBase64(null);
    setImageMimeType("image/png");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setReport(null);
    setShowReport(false);

    try {
      const res = await fetch("/api/diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          imageBase64: imageBase64 || undefined,
          imageMimeType: imageBase64 ? imageMimeType : undefined,
          imageDescription: imageDescription || undefined,
          patientName: patientName || undefined,
        }),
      });
      const data = await res.json();
      setReport(data);
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

  const hasImage = !!uploadedImage;

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
        {/* Left Column — Image Upload & Viewer */}
        <div className="space-y-4">
          {/* Upload Zone */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <ImagePlus className="h-4 w-4 text-teal-700" />
                  {hasImage
                    ? t("Uploaded Image")
                    : t("Upload Medical Image")}
                </CardTitle>
                {hasImage ? (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-xs bg-green-50 text-green-700 border-green-200"
                    >
                      {uploadedFile?.name || "image"}
                    </Badge>
                    <button
                      onClick={clearUpload}
                      className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-xs bg-teal-50 text-teal-700 border-teal-200"
                  >
                    DICOM / JPEG / PNG
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {hasImage ? (
                /* Uploaded image preview */
                <div className="relative rounded-lg overflow-hidden bg-black">
                  <img
                    src={uploadedImage!}
                    alt="Uploaded medical image"
                    className="w-full max-h-[400px] object-contain"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileImage className="h-4 w-4 text-white/80" />
                        <span className="text-xs text-white/80 font-mono">
                          {uploadedFile?.name} ({(uploadedFile?.size || 0 / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </div>
                      <Badge className="bg-green-500/80 text-white text-[10px]">
                        Ready
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                /* Drag & drop zone */
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 min-h-[240px] ${
                    dragActive
                      ? "border-teal-500 bg-teal-50/80 scale-[1.01]"
                      : "border-gray-300 bg-gray-50/50 hover:border-teal-400 hover:bg-teal-50/30"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
                      dragActive ? "bg-teal-200" : "bg-gray-200"
                    }`}
                  >
                    <Upload
                      className={`h-8 w-8 ${
                        dragActive ? "text-teal-700" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    {dragActive
                      ? language === "cn"
                        ? "释放以上传图像"
                        : "Drop image here"
                      : language === "cn"
                        ? "拖放医学影像至此处"
                        : "Drag & drop a medical image here"}
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    {language === "cn"
                      ? "或点击选择文件"
                      : "or click to browse files"}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <span>JPEG</span>
                    <span className="text-gray-300">|</span>
                    <span>PNG</span>
                    <span className="text-gray-300">|</span>
                    <span>WebP</span>
                    <span className="text-gray-300">|</span>
                    <span>GIF</span>
                    <span className="text-gray-300">|</span>
                    <span>Max 20MB</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patient & Clinical Context (optional fields) */}
          <Card className="border-0 shadow-sm">
            <CardContent className="py-3 px-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">
                    {t("Patient Name")} ({t("optional")})
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder={
                      language === "cn" ? "患者姓名" : "Patient name"
                    }
                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">
                    {t("Clinical Context")} ({t("optional")})
                  </label>
                  <input
                    type="text"
                    value={imageDescription}
                    onChange={(e) => setImageDescription(e.target.value)}
                    placeholder={
                      language === "cn"
                        ? "例如：胸痛、咳嗽3周"
                        : "e.g., chest pain, cough for 3 weeks"
                    }
                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Demo scan fallback toggle */}
          {!hasImage && (
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2 text-gray-500">
                    <ScanEye className="h-3.5 w-3.5" />
                    {t("Sample CT Scan — Right Upper Lobe Mass")}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-gray-50 text-gray-500 border-gray-200"
                  >
                    {t("Pre-loaded Demo Image")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <LungScanViewer
                  patientName={patientName || "Demo Patient"}
                  date={todayDate}
                />
              </CardContent>
            </Card>
          )}

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
                    {hasImage
                      ? t("Analyze Uploaded Image")
                      : t("Submit for AI Analysis")}
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
                    <p className="font-semibold text-teal-800">
                      {t("AI Analyzing...")}
                    </p>
                    <p className="text-sm text-teal-600">
                      {hasImage
                        ? language === "cn"
                          ? "正在使用 Claude Vision 分析上传的影像..."
                          : "Analyzing uploaded image with Claude Vision API..."
                        : t(
                            "Analyzing medical image with deep learning model..."
                          )}
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-teal-700">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>
                      {hasImage
                        ? language === "cn"
                          ? "图像上传完成"
                          : "Image upload complete"
                        : "Image preprocessing complete"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-teal-700">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>
                      {hasImage
                        ? language === "cn"
                          ? "Claude Vision API 已连接"
                          : "Connected to Claude Vision API"
                        : "Lung segmentation complete"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-teal-600 animate-pulse">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {language === "cn"
                        ? "正在分析影像内容..."
                        : "Analyzing image content..."}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {language === "cn"
                        ? "生成放射科报告..."
                        : "Generating radiological report..."}
                    </span>
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
                        <h3 className="font-bold text-teal-800">
                          {t("Diagnosis Report")}
                        </h3>
                        <p className="text-xs text-teal-600">
                          {t("AI-Assisted Radiological Analysis")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-teal-100 text-teal-800 text-sm font-bold">
                        {report.confidence}%
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {report.model}
                      </p>
                      {report.source && (
                        <Badge
                          variant="outline"
                          className={`mt-1 text-[10px] ${
                            report.source === "claude-api"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {report.source === "claude-api"
                            ? "Live API"
                            : "Demo Fallback"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Chinese Report — show first when language is cn */}
              {language === "cn" && (
                <Card className="border-0 shadow-sm border-l-4 border-l-teal-600">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs bg-red-50 text-red-700 border-red-200"
                      >
                        中文
                      </Badge>
                      放射科报告
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed bg-gray-50 p-4 rounded-lg overflow-x-auto">
                      {report.reportCN}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {/* English Report */}
              <Card
                className={`border-0 shadow-sm ${language === "cn" ? "opacity-80" : ""}`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      EN
                    </Badge>
                    Radiological Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed bg-gray-50 p-4 rounded-lg overflow-x-auto">
                    {report.reportEN}
                  </pre>
                </CardContent>
              </Card>

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
                  {hasImage
                    ? language === "cn"
                      ? "图像已上传。点击「分析上传图像」按钮，AI 将使用 Claude Vision 分析影像并生成诊断报告。"
                      : 'Image uploaded. Click "Analyze Uploaded Image" to have Claude Vision analyze the image and generate a diagnosis report.'
                    : language === "cn"
                      ? "上传医学影像或使用预载样本图像。点击分析按钮，AI 将生成诊断报告。"
                      : "Upload a medical image or use the pre-loaded sample. Click the analysis button to generate an AI diagnosis report."}
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
