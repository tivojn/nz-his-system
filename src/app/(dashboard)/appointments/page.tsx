"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { useBilingual } from "@/components/bilingual-provider";

interface Appointment {
  id: string;
  dateTime: string;
  duration: number;
  type: string;
  department: string;
  status: string;
  notes: string | null;
  patient: { firstName: string; lastName: string; nhiNumber: string };
  provider: { name: string } | null;
}

const statusStyles: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  "no-show": "bg-gray-100 text-gray-800",
};

export default function AppointmentsPage() {
  const { t } = useBilingual();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    fetch("/api/appointments").then((r) => r.json()).then(setAppointments);
  }, []);

  const grouped = appointments.reduce<Record<string, Appointment[]>>((acc, appt) => {
    const date = new Date(appt.dateTime).toLocaleDateString("en-NZ", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    (acc[date] = acc[date] || []).push(appt);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="h-7 w-7 text-teal-600" />
          {t("Appointments")}
        </h1>
        <p className="text-gray-500 mt-1">{t("Appointment schedule and booking")}</p>
      </div>

      {Object.entries(grouped).map(([date, appts]) => (
        <div key={date}>
          <h2 className="text-sm font-semibold text-gray-500 mb-3">{date}</h2>
          <div className="space-y-3">
            {appts.map((appt) => (
              <Card key={appt.id} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[60px]">
                        <p className="text-lg font-bold text-teal-700">
                          {new Date(appt.dateTime).toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <p className="text-xs text-gray-400">{appt.duration} min</p>
                      </div>
                      <div className="border-l pl-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{appt.patient.firstName} {appt.patient.lastName}</span>
                          <Badge variant="outline" className="text-xs font-mono">{appt.patient.nhiNumber}</Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                          <span className="capitalize">{appt.type}</span>
                          <span>· {appt.department}</span>
                          {appt.provider && <span>· {appt.provider.name}</span>}
                        </div>
                        {appt.notes && <p className="text-xs text-gray-400 mt-1">{appt.notes}</p>}
                      </div>
                    </div>
                    <Badge className={statusStyles[appt.status] || "bg-gray-100"}>
                      {t(appt.status)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
