"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AlertTriangle, BrainCircuit, Activity, Shield, Check, ChevronRight } from "lucide-react";
import { ALERT_SEVERITIES } from "@/lib/constants";

interface ClinicalAlertData {
  id: string;
  type: string;
  severity: "critical" | "warning" | "info";
  title: string;
  message: string;
  source: string | null;
  status: string;
  acknowledgedBy: string | null;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  patient: { id: string; firstName: string; lastName: string; nhiNumber: string } | null;
}

interface PathwayStep {
  step: number;
  title: string;
  description: string;
  timeframe: string;
}

interface ClinicalPathwayData {
  id: string;
  name: string;
  code: string;
  description: string;
  category: string;
  steps: PathwayStep[];
  expectedDuration: string | null;
}

export default function CDSSPage() {
  const [alerts, setAlerts] = useState<ClinicalAlertData[]>([]);
  const [pathways, setPathways] = useState<ClinicalPathwayData[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  // NEWS2 state
  const [news2, setNews2] = useState({
    respiratoryRate: "",
    oxygenSat: "",
    onSupplementalO2: false,
    systolicBP: "",
    heartRate: "",
    consciousness: "A" as "A" | "V" | "P" | "U",
    temperature: "",
  });
  const [news2Result, setNews2Result] = useState<{
    total: number;
    components: Record<string, number>;
    risk: string;
    color: string;
    action: string;
  } | null>(null);

  // Falls risk state
  const [falls, setFalls] = useState({
    age: "",
    previousFalls: false,
    mobilityImpaired: false,
    cognitiveImpairment: false,
    continenceIssues: false,
    medicationsRisk: false,
    visualImpairment: false,
  });
  const [fallsResult, setFallsResult] = useState<{
    score: number;
    risk: string;
    color: string;
    interventions: string[];
  } | null>(null);

  useEffect(() => {
    fetchAlerts();
    fetchPathways();
  }, []);

  const fetchAlerts = async () => {
    setLoadingAlerts(true);
    const res = await fetch("/api/cdss/alerts");
    const data = await res.json();
    setAlerts(data);
    setLoadingAlerts(false);
  };

  const fetchPathways = async () => {
    const res = await fetch("/api/cdss/pathways");
    const data = await res.json();
    setPathways(data);
  };

  const updateAlertStatus = async (id: string, status: string) => {
    let acknowledgedBy: string | undefined;
    try {
      const match = document.cookie.match(/nzhis-session=([^;]+)/);
      if (match) {
        const user = JSON.parse(atob(match[1]));
        acknowledgedBy = user.id;
      }
    } catch {}

    await fetch("/api/cdss/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, acknowledgedBy }),
    });
    fetchAlerts();
  };

  const calculateNEWS2 = async () => {
    const res = await fetch("/api/cdss/risk-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "news2",
        params: {
          respiratoryRate: Number(news2.respiratoryRate),
          oxygenSat: Number(news2.oxygenSat),
          onSupplementalO2: news2.onSupplementalO2,
          systolicBP: Number(news2.systolicBP),
          heartRate: Number(news2.heartRate),
          consciousness: news2.consciousness,
          temperature: Number(news2.temperature),
        },
      }),
    });
    const result = await res.json();
    setNews2Result(result);
  };

  const calculateFallsRisk = async () => {
    const res = await fetch("/api/cdss/risk-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "falls",
        params: {
          age: Number(falls.age),
          previousFalls: falls.previousFalls,
          mobilityImpaired: falls.mobilityImpaired,
          cognitiveImpairment: falls.cognitiveImpairment,
          continenceIssues: falls.continenceIssues,
          medicationsRisk: falls.medicationsRisk,
          visualImpairment: falls.visualImpairment,
        },
      }),
    });
    const result = await res.json();
    setFallsResult(result);
  };

  const severityConfig = ALERT_SEVERITIES;

  const categoryColors: Record<string, string> = {
    cardiac: "bg-red-100 text-red-800",
    sepsis: "bg-orange-100 text-orange-800",
    ortho: "bg-blue-100 text-blue-800",
    endocrine: "bg-purple-100 text-purple-800",
  };

  const news2ColorMap: Record<string, string> = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
  };

  const componentLabels: Record<string, string> = {
    respiratoryRate: "Respiratory Rate",
    oxygenSat: "Oxygen Saturation",
    supplementalO2: "Supplemental O2",
    systolicBP: "Systolic BP",
    heartRate: "Heart Rate",
    consciousness: "Consciousness",
    temperature: "Temperature",
  };

  const activeAlerts = alerts.filter((a) => a.status === "active");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BrainCircuit className="h-8 w-8 text-teal-700" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clinical Decision Support</h1>
          <p className="text-sm text-gray-500">Alerts, pathways, and clinical scoring tools</p>
        </div>
        {activeAlerts.length > 0 && (
          <Badge className="bg-red-100 text-red-800 ml-auto text-sm">
            {activeAlerts.length} Active Alert{activeAlerts.length !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="alerts" className="gap-1">
            <AlertTriangle className="h-4 w-4" /> Active Alerts
          </TabsTrigger>
          <TabsTrigger value="pathways" className="gap-1">
            <ChevronRight className="h-4 w-4" /> Clinical Pathways
          </TabsTrigger>
          <TabsTrigger value="news2" className="gap-1">
            <Activity className="h-4 w-4" /> NEWS2 Calculator
          </TabsTrigger>
          <TabsTrigger value="falls" className="gap-1">
            <Shield className="h-4 w-4" /> Falls Risk
          </TabsTrigger>
        </TabsList>

        {/* Active Alerts Tab */}
        <TabsContent value="alerts" className="space-y-3">
          {loadingAlerts ? (
            <div className="animate-pulse text-gray-400 p-4">Loading alerts...</div>
          ) : alerts.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center text-gray-500">
                No clinical alerts at this time.
              </CardContent>
            </Card>
          ) : (
            alerts.map((alert) => {
              const config = severityConfig[alert.severity];
              return (
                <Card
                  key={alert.id}
                  className={`border-0 shadow-sm border-l-4 ${
                    alert.severity === "critical"
                      ? "border-l-red-500"
                      : alert.severity === "warning"
                      ? "border-l-amber-500"
                      : "border-l-blue-500"
                  } ${alert.status !== "active" ? "opacity-60" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${config.color} text-white text-xs`}>
                            {config.label}
                          </Badge>
                          <span className="font-semibold">{alert.title}</span>
                          {alert.status !== "active" && (
                            <Badge variant="outline" className="text-xs capitalize">
                              {alert.status}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          {alert.patient && (
                            <span>
                              Patient: {alert.patient.firstName} {alert.patient.lastName} ({alert.patient.nhiNumber})
                            </span>
                          )}
                          {alert.source && <span>Source: {alert.source}</span>}
                          <span>{new Date(alert.createdAt).toLocaleString("en-NZ")}</span>
                        </div>
                      </div>
                      {alert.status === "active" && (
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateAlertStatus(alert.id, "acknowledged")}
                          >
                            Acknowledge
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-700 border-green-300 hover:bg-green-50"
                            onClick={() => updateAlertStatus(alert.id, "resolved")}
                          >
                            <Check className="h-3 w-3 mr-1" /> Resolve
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Clinical Pathways Tab */}
        <TabsContent value="pathways" className="space-y-3">
          {pathways.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center text-gray-500">
                No clinical pathways configured.
              </CardContent>
            </Card>
          ) : (
            <Accordion type="single" collapsible className="space-y-2">
              {pathways.map((pathway) => (
                <AccordionItem
                  key={pathway.id}
                  value={pathway.id}
                  className="bg-white border-0 shadow-sm rounded-lg overflow-hidden"
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <Badge className={categoryColors[pathway.category] || "bg-gray-100 text-gray-800"}>
                        {pathway.category}
                      </Badge>
                      <div>
                        <span className="font-semibold">{pathway.name}</span>
                        <p className="text-sm text-gray-500">{pathway.description}</p>
                      </div>
                      {pathway.expectedDuration && (
                        <Badge variant="outline" className="ml-auto text-xs">
                          {pathway.expectedDuration}
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-3">
                      {pathway.steps.map((step: PathwayStep, idx: number) => (
                        <div key={idx} className="flex gap-3 items-start">
                          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm flex-shrink-0">
                            {step.step}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{step.title}</p>
                            <p className="text-sm text-gray-500">{step.description}</p>
                            {step.timeframe && (
                              <span className="text-xs text-gray-400">Timeframe: {step.timeframe}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </TabsContent>

        {/* NEWS2 Calculator Tab */}
        <TabsContent value="news2" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-teal-700" />
                NEWS2 Score Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>Respiratory Rate (breaths/min)</Label>
                  <Input
                    type="number"
                    placeholder="12-20"
                    value={news2.respiratoryRate}
                    onChange={(e) => setNews2({ ...news2, respiratoryRate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Oxygen Saturation (%)</Label>
                  <Input
                    type="number"
                    placeholder="94-100"
                    value={news2.oxygenSat}
                    onChange={(e) => setNews2({ ...news2, oxygenSat: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch
                    checked={news2.onSupplementalO2}
                    onCheckedChange={(v) => setNews2({ ...news2, onSupplementalO2: v })}
                  />
                  <Label>Supplemental O2</Label>
                </div>
                <div>
                  <Label>Systolic BP (mmHg)</Label>
                  <Input
                    type="number"
                    placeholder="111-219"
                    value={news2.systolicBP}
                    onChange={(e) => setNews2({ ...news2, systolicBP: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Heart Rate (bpm)</Label>
                  <Input
                    type="number"
                    placeholder="51-90"
                    value={news2.heartRate}
                    onChange={(e) => setNews2({ ...news2, heartRate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Consciousness (AVPU)</Label>
                  <Select
                    value={news2.consciousness}
                    onValueChange={(v) => setNews2({ ...news2, consciousness: v as "A" | "V" | "P" | "U" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A - Alert</SelectItem>
                      <SelectItem value="V">V - Voice</SelectItem>
                      <SelectItem value="P">P - Pain</SelectItem>
                      <SelectItem value="U">U - Unresponsive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Temperature (C)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="36.1-38.0"
                    value={news2.temperature}
                    onChange={(e) => setNews2({ ...news2, temperature: e.target.value })}
                  />
                </div>
              </div>
              <Button
                onClick={calculateNEWS2}
                className="bg-teal-700 hover:bg-teal-800"
                disabled={
                  !news2.respiratoryRate ||
                  !news2.oxygenSat ||
                  !news2.systolicBP ||
                  !news2.heartRate ||
                  !news2.temperature
                }
              >
                Calculate NEWS2 Score
              </Button>
            </CardContent>
          </Card>

          {news2Result && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold ${
                      news2ColorMap[news2Result.color] || "bg-gray-500"
                    }`}
                  >
                    {news2Result.total}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{news2Result.risk} Risk</h3>
                    <p className="text-sm text-gray-600 mt-1">{news2Result.action}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  {Object.entries(news2Result.components).map(([key, value]) => (
                    <div
                      key={key}
                      className={`p-3 rounded-lg text-center ${
                        value === 0
                          ? "bg-green-50 text-green-800"
                          : value === 1
                          ? "bg-yellow-50 text-yellow-800"
                          : value === 2
                          ? "bg-orange-50 text-orange-800"
                          : "bg-red-50 text-red-800"
                      }`}
                    >
                      <div className="text-2xl font-bold">{value}</div>
                      <div className="text-xs">{componentLabels[key] || key}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Falls Risk Tab */}
        <TabsContent value="falls" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-teal-700" />
                Falls Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Age</Label>
                <Input
                  type="number"
                  placeholder="Enter patient age"
                  value={falls.age}
                  onChange={(e) => setFalls({ ...falls, age: e.target.value })}
                  className="max-w-xs"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { key: "previousFalls", label: "Previous falls in last 12 months" },
                  { key: "mobilityImpaired", label: "Mobility impaired / unsteady gait" },
                  { key: "cognitiveImpairment", label: "Cognitive impairment / confusion" },
                  { key: "continenceIssues", label: "Continence issues" },
                  { key: "medicationsRisk", label: "High-risk medications (sedatives, antihypertensives)" },
                  { key: "visualImpairment", label: "Visual impairment" },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Switch
                      checked={falls[key as keyof typeof falls] as boolean}
                      onCheckedChange={(v) => setFalls({ ...falls, [key]: v })}
                    />
                    <Label className="cursor-pointer">{label}</Label>
                  </div>
                ))}
              </div>
              <Button
                onClick={calculateFallsRisk}
                className="bg-teal-700 hover:bg-teal-800"
                disabled={!falls.age}
              >
                Calculate Falls Risk
              </Button>
            </CardContent>
          </Card>

          {fallsResult && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold ${
                      fallsResult.color === "red"
                        ? "bg-red-500"
                        : fallsResult.color === "orange"
                        ? "bg-orange-500"
                        : "bg-green-500"
                    }`}
                  >
                    {fallsResult.score}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{fallsResult.risk} Risk</h3>
                    <p className="text-sm text-gray-500">Falls Risk Score: {fallsResult.score}</p>
                  </div>
                </div>
                {fallsResult.interventions.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Recommended Interventions</h4>
                    <ul className="space-y-1">
                      {fallsResult.interventions.map((intervention, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                          <Check className="h-4 w-4 text-teal-600 flex-shrink-0" />
                          {intervention}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
