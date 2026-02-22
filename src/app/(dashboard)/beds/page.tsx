"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { BedDouble } from "lucide-react";
import { BED_STATUSES } from "@/lib/constants";
import { useBilingual } from "@/components/bilingual-provider";

interface BedData {
  id: string;
  ward: string;
  bedNumber: string;
  status: string;
  patientId: string | null;
  patient: { firstName: string; lastName: string; nhiNumber: string } | null;
}

type WardMap = Record<string, BedData[]>;

const bedCellColors: Record<string, string> = {
  available: "bg-emerald-500 hover:bg-emerald-600 text-white",
  occupied: "bg-teal-500 hover:bg-teal-600 text-white",
  cleaning: "bg-amber-400 hover:bg-amber-500 text-white",
  maintenance: "bg-slate-400 hover:bg-slate-500 text-white",
};

export default function BedsPage() {
  const { t } = useBilingual();
  const [wards, setWards] = useState<WardMap>({});

  useEffect(() => {
    fetch("/api/beds")
      .then((r) => r.json())
      .then(setWards);
  }, []);

  const allBeds = Object.values(wards).flat();
  const totalBeds = allBeds.length;
  const occupied = allBeds.filter((b) => b.status === "occupied").length;
  const available = allBeds.filter((b) => b.status === "available").length;
  const other = allBeds.filter((b) => b.status === "cleaning" || b.status === "maintenance").length;
  const occupancyPct = totalBeds > 0 ? Math.round((occupied / totalBeds) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BedDouble className="h-7 w-7 text-teal-600" />
          {t("Bed Management")}
        </h1>
        <p className="text-gray-500 mt-1">{t("Real-time bed occupancy across all wards")}</p>
      </div>

      {/* Occupancy Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">{t("Total Beds")}</p>
            <p className="text-2xl font-bold text-gray-900">{totalBeds}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">{t("Occupied")}</p>
            <p className="text-2xl font-bold text-teal-600">{occupied}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">{t("Available")}</p>
            <p className="text-2xl font-bold text-emerald-600">{available}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">{t("Cleaning / Maintenance")}</p>
            <p className="text-2xl font-bold text-amber-600">{other}</p>
          </CardContent>
        </Card>
      </div>

      {/* Occupancy Bar */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">{t("Overall Occupancy")}</p>
            <p className="text-sm font-bold text-gray-900">{occupancyPct}%</p>
          </div>
          <Progress value={occupancyPct} className="h-3" />
        </CardContent>
      </Card>

      {/* Status Legend */}
      <div className="flex gap-4 text-sm">
        {Object.entries(BED_STATUSES).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${val.color}`} />
            <span className="text-gray-600">{val.label}</span>
          </div>
        ))}
      </div>

      {/* Ward Bed Grids */}
      {Object.entries(wards).map(([wardName, beds]) => {
        const wardOccupied = beds.filter((b) => b.status === "occupied").length;
        return (
          <Card key={wardName} className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>{wardName}</span>
                <span className="text-sm font-normal text-gray-500">
                  {wardOccupied}/{beds.length} occupied
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                {beds.map((bed) => {
                  const cellClass = bedCellColors[bed.status] || bedCellColors.available;
                  const initials = bed.patient
                    ? `${bed.patient.firstName[0]}${bed.patient.lastName[0]}`
                    : null;

                  if (bed.status === "occupied" && bed.patient) {
                    return (
                      <HoverCard key={bed.id} openDelay={200} closeDelay={100}>
                        <HoverCardTrigger asChild>
                          <div
                            className={`rounded-lg p-2 text-center cursor-pointer transition-colors ${cellClass}`}
                          >
                            <p className="text-xs font-mono">{bed.bedNumber}</p>
                            <p className="text-xs font-semibold">{initials}</p>
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-52" side="top">
                          <div className="text-sm">
                            <p className="font-semibold">
                              {bed.patient.firstName} {bed.patient.lastName}
                            </p>
                            <p className="text-xs text-gray-500 font-mono">{bed.patient.nhiNumber}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Bed {bed.bedNumber} - {wardName}
                            </p>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    );
                  }

                  return (
                    <div
                      key={bed.id}
                      className={`rounded-lg p-2 text-center transition-colors ${cellClass}`}
                    >
                      <p className="text-xs font-mono">{bed.bedNumber}</p>
                      <p className="text-xs capitalize">{bed.status === "available" ? "" : bed.status}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {Object.keys(wards).length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <p className="text-gray-400">{t("No bed data available")}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
