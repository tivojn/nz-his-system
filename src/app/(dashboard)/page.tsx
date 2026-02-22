"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Bed, Calendar, Clock, TrendingUp, Activity } from "lucide-react";

interface DashboardData {
  stats: {
    totalPatients: number;
    activeEncounters: number;
    todayAppointments: number;
    waitlistCount: number;
  };
  ethnicityBreakdown: { name: string; value: number }[];
  departmentCensus: { name: string; value: number }[];
  waitlistByPriority: { name: string; value: number }[];
  appointmentsByStatus: { name: string; value: number }[];
}

const priorityColors: Record<string, string> = {
  urgent: "bg-red-500",
  "semi-urgent": "bg-yellow-500",
  routine: "bg-green-500",
};

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
  "no-show": "bg-gray-500",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setData);
  }, []);

  if (!data) {
    return <div className="animate-pulse text-gray-400 p-8">Loading dashboard...</div>;
  }

  const statCards = [
    { title: "Total Patients", value: data.stats.totalPatients, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Active Admissions", value: data.stats.activeEncounters, icon: Bed, color: "text-teal-600", bg: "bg-teal-50" },
    { title: "Today's Appointments", value: data.stats.todayAppointments, icon: Calendar, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Waitlist", value: data.stats.waitlistCount, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="h-7 w-7 text-teal-600" />
          Dashboard
        </h1>
        <p className="text-gray-500 mt-1">Hospital operations overview — Te Whatu Ora</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Census */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bed className="h-5 w-5 text-teal-600" />
              Department Census
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.departmentCensus.map((dept) => (
                <div key={dept.name} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{dept.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-teal-500 h-2 rounded-full"
                        style={{ width: `${Math.min((dept.value / 5) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{dept.value}</span>
                  </div>
                </div>
              ))}
              {data.departmentCensus.length === 0 && (
                <p className="text-gray-400 text-sm">No active admissions</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ethnicity Breakdown */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Patient Demographics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.ethnicityBreakdown.map((eth) => (
                <div key={eth.name} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{eth.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min((eth.value / data.stats.totalPatients) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{eth.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Waitlist by Priority */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Waitlist by Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.waitlistByPriority.map((w) => (
                <div key={w.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${priorityColors[w.name] || "bg-gray-400"}`} />
                    <span className="text-sm text-gray-600 capitalize">{w.name}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{w.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Appointments by Status */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Appointments Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.appointmentsByStatus.map((a) => (
                <div key={a.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${statusColors[a.name] || "bg-gray-400"}`} />
                    <span className="text-sm text-gray-600 capitalize">{a.name}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{a.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-xs text-gray-400">
          NZ-HIS v1.0 · FHIR R4 Compliant · Health Information Privacy Code (HIPC) · Te Whatu Ora
        </p>
      </div>
    </div>
  );
}
