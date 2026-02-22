"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { KpiCard } from "@/components/charts/kpi-card";
import { ActivityFeed } from "@/components/activity-feed";
import { PageSkeleton } from "@/components/page-skeleton";
import { useBilingual } from "@/components/bilingual-provider";
import { BilingualLabel } from "@/components/bilingual-label";
import {
  Users,
  Activity,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Heart,
  Target,
  AlertTriangle,
  BedDouble,
} from "lucide-react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  generateCensusData,
  generateDemographicsData,
  generateBedOccupancy,
  generateQualityMetrics,
  generateActivityFeed,
  generateHealthTargets,
} from "@/lib/mock-data";

interface DashboardStats {
  totalPatients: number;
  activeEncounters: number;
  todayAppointments: number;
  waitlistCount: number;
  trends: {
    patients: number;
    admissions: number;
    appointments: number;
    waitlist: number;
  };
  sparklines: {
    patients: number[];
    admissions: number[];
    appointments: number[];
    waitlist: number[];
  };
}

interface DashboardData {
  stats: DashboardStats;
}

const PIE_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function getGreetingKey(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [userName, setUserName] = useState<string>("");
  const { t, language } = useBilingual();

  const censusData = useMemo(() => generateCensusData(), []);
  const demographicsData = useMemo(() => generateDemographicsData(), []);
  const bedOccupancy = useMemo(() => generateBedOccupancy(), []);
  const qualityMetrics = useMemo(() => generateQualityMetrics(), []);
  const activityFeed = useMemo(() => generateActivityFeed(), []);
  const healthTargets = useMemo(() => generateHealthTargets(), []);

  useEffect(() => {
    // Read session from cookie
    const cookie = document.cookie
      .split(";")
      .find((c) => c.trim().startsWith("nzhis-session="));
    if (cookie) {
      try {
        const session = JSON.parse(atob(cookie.split("=")[1]));
        setUserName(session?.name || "");
      } catch {
        // ignore
      }
    }

    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return <PageSkeleton variant="dashboard" />;
  }

  const today = new Date().toLocaleDateString("en-NZ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6 page-enter">
      {/* Banner Header */}
      <div className="rounded-xl gradient-jade p-6 text-white relative overflow-hidden">
        <div className="koru-pattern absolute inset-0 opacity-20" />
        <div className="relative">
          {language !== "en" && (
            <p className="text-teal-100 text-sm">{t(getGreetingKey())}</p>
          )}
          <h1 className="text-2xl font-bold mt-1">
            {getGreetingKey()}, {userName || "Clinician"}
          </h1>
          <p className="text-teal-100 mt-1 text-sm">{today}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title={t("Total Patients")}
          value={data.stats.totalPatients}
          trend={data.stats.trends.patients}
          icon={Users}
          sparklineData={data.stats.sparklines.patients}
        />
        <KpiCard
          title={t("Active Admissions")}
          value={data.stats.activeEncounters}
          trend={data.stats.trends.admissions}
          icon={BedDouble}
          sparklineData={data.stats.sparklines.admissions}
        />
        <KpiCard
          title={t("Today's Appointments")}
          value={data.stats.todayAppointments}
          trend={data.stats.trends.appointments}
          icon={Calendar}
          sparklineData={data.stats.sparklines.appointments}
        />
        <KpiCard
          title={t("Waitlist Count")}
          value={data.stats.waitlistCount}
          trend={data.stats.trends.waitlist}
          icon={Clock}
          sparklineData={data.stats.sparklines.waitlist}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Census Trend */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-teal-600" />
              <BilingualLabel>Patient Census</BilingualLabel>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={censusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="inpatient"
                    stroke="#0d9488"
                    fill="#0d948820"
                    strokeWidth={2}
                    name="Inpatient"
                  />
                  <Area
                    type="monotone"
                    dataKey="admissions"
                    stroke="#00a86b"
                    fill="#00a86b15"
                    strokeWidth={2}
                    name="Admissions"
                  />
                  <Area
                    type="monotone"
                    dataKey="discharges"
                    stroke="#2980b9"
                    fill="#2980b910"
                    strokeWidth={2}
                    name="Discharges"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Patient Demographics */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-teal-600" />
              <BilingualLabel>Demographics</BilingualLabel>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-auto md:h-64">
              <div className="grid grid-cols-1 md:grid-cols-2 items-center">
                <div>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={demographicsData}
                        dataKey="count"
                        nameKey="ethnicity"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {demographicsData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {demographicsData.map((item, index) => (
                    <div key={item.ethnicity} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{
                          backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                        }}
                      />
                      <span className="text-sm text-muted-foreground flex-1">
                        {item.ethnicity}
                      </span>
                      <span className="text-sm font-medium">{item.count}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department Bed Management */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BedDouble className="h-4 w-4 text-teal-600" />
              Department Bed Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bedOccupancy} layout="vertical" barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    dataKey="ward"
                    type="category"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="occupied" fill="#0d9488" name="Occupied" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="available" fill="#00a86b" name="Available" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="cleaning" fill="#d4a843" name="Cleaning" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quality Metrics */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-4 w-4 text-teal-600" />
              <BilingualLabel>Quality Metrics</BilingualLabel>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.values(qualityMetrics).map((metric) => {
                const isPositive = metric.trend <= 0 && metric.unit !== "%"
                  ? metric.trend <= 0
                  : metric.label === "Patient Satisfaction"
                    ? metric.trend >= 0
                    : metric.trend <= 0;
                return (
                  <div
                    key={metric.label}
                    className="p-4 rounded-xl bg-muted/30 border border-border/50"
                  >
                    <p className="text-xs text-muted-foreground font-medium">
                      {metric.label}
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {metric.value}
                      <span className="text-sm font-normal text-muted-foreground ml-0.5">
                        {metric.unit}
                      </span>
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {isPositive ? (
                        <TrendingDown className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <TrendingUp className="h-3 w-3 text-red-500" />
                      )}
                      <span
                        className={`text-xs font-medium ${
                          isPositive ? "text-emerald-600" : "text-red-500"
                        }`}
                      >
                        {metric.trend > 0 ? "+" : ""}
                        {metric.trend}
                        {metric.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NZ Health Targets */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-teal-600" />
              <BilingualLabel>Health Targets</BilingualLabel>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {healthTargets.map((ht) => {
                const onTrack = ht.actual >= ht.target;
                return (
                  <div key={ht.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{ht.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={onTrack ? "default" : "secondary"}
                          className={
                            onTrack
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                              : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                          }
                        >
                          {ht.actual}%
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          / {ht.target}%
                        </span>
                      </div>
                    </div>
                    <Progress value={ht.actual} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {ht.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-teal-600" />
              <BilingualLabel>Activity Feed</BilingualLabel>
              <div className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot ml-1" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed items={activityFeed} />
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-xs text-muted-foreground">
          NZ-HIS v2.0 · FHIR R4 Compliant · Health Information Privacy Code (HIPC) · Te Whatu Ora
        </p>
      </div>
    </div>
  );
}
