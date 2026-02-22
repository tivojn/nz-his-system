"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HeartPulse, ChevronDown, Shield } from "lucide-react";
import { teReoGlossary } from "@/lib/te-reo";
import { useBilingual } from "@/components/bilingual-provider";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

interface HauoraData {
  waitTimes: { department: string; maori: number; nonMaori: number; target: number }[];
  admissionRates: { condition: string; maori: number; nonMaori: number }[];
  culturalSafety: {
    score: number;
    staffTrained: number;
    interpreterAccess: number;
    tikangaCompliance: number;
    patientSatisfaction: number;
  };
  whanauOra: {
    familyWellbeing: number;
    economicWellbeing: number;
    healthyLifestyles: number;
    participation: number;
    culturalIdentity: number;
  };
  equityTargets: { metric: string; target: string; actual: string; status: string }[];
}

const overviewCards = [
  { title: "Cultural Safety Score", value: "72/100", description: "Staff & process compliance", trend: "+3 from last quarter" },
  { title: "Whanau Ora Score", value: "68%", description: "Holistic family wellbeing index", trend: "+5% improving" },
  { title: "Health Disparity Index", value: "0.34", description: "Maori vs non-Maori gap (lower = better)", trend: "-0.02 improving" },
  { title: "Equity Target Progress", value: "2/6", description: "Targets on track or improving", trend: "4 need attention" },
];

const statusColor: Record<string, string> = {
  "on-track": "bg-emerald-100 text-emerald-800",
  "improving": "bg-amber-100 text-amber-800",
  "off-track": "bg-red-100 text-red-800",
};

export default function HauoraPage() {
  const { t } = useBilingual();
  const [data, setData] = useState<HauoraData | null>(null);
  const [glossaryOpen, setGlossaryOpen] = useState(false);

  useEffect(() => {
    fetch("/api/hauora")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HeartPulse className="h-7 w-7 text-teal-600" />
            {t("Hauora Equity")}
          </h1>
          <p className="text-gray-500 mt-1">{t("Loading equity data...")}</p>
        </div>
      </div>
    );
  }

  const safetyMetrics = [
    { label: t("Staff Trained"), value: data.culturalSafety.staffTrained },
    { label: t("Interpreter Access"), value: data.culturalSafety.interpreterAccess },
    { label: t("Tikanga Compliance"), value: data.culturalSafety.tikangaCompliance },
    { label: t("Patient Satisfaction"), value: data.culturalSafety.patientSatisfaction },
  ];

  const whanauMetrics = [
    { label: t("Family Wellbeing"), value: data.whanauOra.familyWellbeing },
    { label: t("Economic Wellbeing"), value: data.whanauOra.economicWellbeing },
    { label: t("Healthy Lifestyles"), value: data.whanauOra.healthyLifestyles },
    { label: t("Participation"), value: data.whanauOra.participation },
    { label: t("Cultural Identity"), value: data.whanauOra.culturalIdentity },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <HeartPulse className="h-7 w-7 text-teal-600" />
          {t("Hauora Equity")}
        </h1>
        <p className="text-gray-500 mt-1">
          {t("National equity targets and current progress")}
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewCards.map((card) => (
          <Card key={card.title} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              <p className="text-xs text-gray-400 mt-1">{card.description}</p>
              <p className="text-xs text-teal-600 mt-1">{card.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Wait Time by Ethnicity */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t("Wait Time by Ethnicity (minutes)")}</CardTitle>
          <CardDescription>{t("Average wait times across departments — Maori vs non-Maori")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.waitTimes} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="maori" name="Maori" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="nonMaori" name="Non-Maori" fill="#9ca3af" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="Target" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Admission Rate by Ethnicity */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t("Admission Rate by Ethnicity (per 1,000)")}</CardTitle>
          <CardDescription>{t("Hospital admission rates by condition")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-56 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.admissionRates}
                layout="vertical"
                margin={{ top: 5, right: 20, bottom: 5, left: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="condition" type="category" tick={{ fontSize: 12 }} width={80} />
                <Tooltip />
                <Legend />
                <Bar dataKey="maori" name="Maori" fill="#0d9488" radius={[0, 4, 4, 0]} />
                <Bar dataKey="nonMaori" name="Non-Maori" fill="#9ca3af" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cultural Safety Score */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-teal-600" />
              {t("Cultural Safety Score")}
            </CardTitle>
            <CardDescription>Haumaru Ahurea — Overall: {data.culturalSafety.score}/100</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-teal-600">{data.culturalSafety.score}</div>
              <div className="text-sm text-gray-500">out of 100</div>
            </div>
            {safetyMetrics.map((m) => (
              <div key={m.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{m.label}</span>
                  <span className="font-medium">{m.value}%</span>
                </div>
                <Progress value={m.value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Whanau Ora Indicators */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">{t("Whanau Ora Indicators")}</CardTitle>
            <CardDescription>{t("Holistic family wellbeing metrics")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {whanauMetrics.map((m) => (
              <div key={m.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{m.label}</span>
                  <span className="font-medium">{m.value}%</span>
                </div>
                <Progress value={m.value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Te Whatu Ora Equity Targets */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t("Te Whatu Ora Equity Targets")}</CardTitle>
          <CardDescription>{t("National equity targets and current progress")}</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Metric")}</TableHead>
                <TableHead>{t("Target")}</TableHead>
                <TableHead>{t("Actual")}</TableHead>
                <TableHead>{t("Status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.equityTargets.map((t) => (
                <TableRow key={t.metric}>
                  <TableCell className="font-medium">{t.metric}</TableCell>
                  <TableCell>{t.target}</TableCell>
                  <TableCell>{t.actual}</TableCell>
                  <TableCell>
                    <Badge className={`capitalize ${statusColor[t.status] || "bg-gray-100 text-gray-800"}`}>
                      {t.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Te Reo Maori Glossary */}
      <Collapsible open={glossaryOpen} onOpenChange={setGlossaryOpen}>
        <Card className="border-0 shadow-sm">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 rounded-t-lg">
              <CardTitle className="text-lg flex items-center gap-2">
                {t("Te Reo Maori Glossary")}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${glossaryOpen ? "rotate-180" : ""}`}
                />
              </CardTitle>
              <CardDescription>{t("Health terminology in Te Reo Maori")}</CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {teReoGlossary.map((entry) => (
                  <div key={entry.term} className="p-3 rounded-lg bg-gray-50">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-teal-700">{entry.term}</span>
                      <span className="text-sm text-gray-600">— {entry.meaning}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{entry.context}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
