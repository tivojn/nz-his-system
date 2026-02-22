"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { useBilingual } from "@/components/bilingual-provider";

interface WaitlistEntry {
  id: string;
  department: string;
  priority: string;
  procedure: string | null;
  referralDate: string;
  targetDate: string | null;
  status: string;
  notes: string | null;
  patient: { firstName: string; lastName: string; nhiNumber: string };
}

const priorityStyles: Record<string, { badge: string; border: string }> = {
  urgent: { badge: "bg-red-100 text-red-800", border: "border-l-red-500" },
  "semi-urgent": { badge: "bg-yellow-100 text-yellow-800", border: "border-l-yellow-500" },
  routine: { badge: "bg-green-100 text-green-800", border: "border-l-green-500" },
};

export default function WaitlistPage() {
  const { t } = useBilingual();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);

  useEffect(() => {
    fetch("/api/waitlist").then((r) => r.json()).then(setEntries);
  }, []);

  const waiting = entries.filter((e) => e.status === "waiting");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="h-7 w-7 text-teal-600" />
          {t("Surgical Waitlist")}
        </h1>
        <p className="text-gray-500 mt-1">{waiting.length} {t("patients waiting")}</p>
      </div>

      {/* Priority Legend */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500" /> {t("Urgent")}</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500" /> {t("Semi-urgent")}</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500" /> {t("Routine")}</div>
      </div>

      <div className="space-y-3">
        {entries.map((entry) => {
          const style = priorityStyles[entry.priority] || priorityStyles.routine;
          const daysWaiting = Math.floor((Date.now() - new Date(entry.referralDate).getTime()) / 86400000);
          return (
            <Card key={entry.id} className={`border-0 shadow-sm border-l-4 ${style.border}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{entry.patient.firstName} {entry.patient.lastName}</span>
                      <Badge variant="outline" className="text-xs font-mono">{entry.patient.nhiNumber}</Badge>
                      <Badge className={`text-xs capitalize ${style.badge}`}>{t(entry.priority)}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{entry.procedure || "—"} · {entry.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{daysWaiting}</p>
                    <p className="text-xs text-gray-400">{t("days waiting")}</p>
                    {entry.targetDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        Target: {new Date(entry.targetDate).toLocaleDateString("en-NZ")}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
