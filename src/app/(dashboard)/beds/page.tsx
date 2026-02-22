"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BedDouble,
  Search,
  UserPlus,
  ArrowRightLeft,
  LogOut,
  Wrench,
  CheckCircle2,
} from "lucide-react";
import { BED_STATUSES } from "@/lib/constants";
import { useBilingual } from "@/components/bilingual-provider";

interface BedData {
  id: string;
  ward: string;
  bedNumber: string;
  status: string;
  patientId: string | null;
  patient: {
    firstName: string;
    lastName: string;
    nhiNumber: string;
  } | null;
}

type WardMap = Record<string, BedData[]>;

interface PatientOption {
  id: string;
  firstName: string;
  lastName: string;
  nhiNumber: string;
}

const bedCellColors: Record<string, string> = {
  available: "bg-emerald-500 hover:bg-emerald-600 text-white",
  occupied: "bg-teal-500 hover:bg-teal-600 text-white",
  cleaning: "bg-amber-400 hover:bg-amber-500 text-white",
  maintenance: "bg-slate-400 hover:bg-slate-500 text-white",
};

export default function BedsPage() {
  const { t } = useBilingual();
  const [wards, setWards] = useState<WardMap>({});
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [activeWard, setActiveWard] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBed, setSelectedBed] = useState<BedData | null>(null);
  const [bedDialogOpen, setBedDialogOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedDestBed, setSelectedDestBed] = useState("");

  const fetchBeds = async () => {
    try {
      const res = await fetch("/api/beds");
      const data = await res.json();
      setWards(data);
    } catch (err) {
      console.error("Failed to fetch beds:", err);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await fetch("/api/patients");
      const data = await res.json();
      setPatients(data);
    } catch (err) {
      console.error("Failed to fetch patients:", err);
    }
  };

  useEffect(() => {
    fetchBeds();
    fetchPatients();
  }, []);

  const allBeds = Object.values(wards).flat();
  const totalBeds = allBeds.length;
  const occupied = allBeds.filter((b) => b.status === "occupied").length;
  const available = allBeds.filter((b) => b.status === "available").length;
  const other = allBeds.filter(
    (b) => b.status === "cleaning" || b.status === "maintenance"
  ).length;
  const occupancyPct =
    totalBeds > 0 ? Math.round((occupied / totalBeds) * 100) : 0;

  const wardNames = Object.keys(wards);
  const displayedWards =
    activeWard === "all"
      ? Object.entries(wards)
      : Object.entries(wards).filter(([name]) => name === activeWard);

  // Patients not currently assigned to any bed
  const assignedPatientIds = useMemo(() => {
    const ids = new Set<string>();
    allBeds.forEach((bed) => {
      if (bed.patientId) ids.add(bed.patientId);
    });
    return ids;
  }, [allBeds]);

  const availablePatients = useMemo(
    () => patients.filter((p) => !assignedPatientIds.has(p.id)),
    [patients, assignedPatientIds]
  );

  // Available beds for transfer (excluding the currently selected bed)
  const availableBedsForTransfer = useMemo(
    () =>
      allBeds.filter(
        (b) => b.status === "available" && b.id !== selectedBed?.id
      ),
    [allBeds, selectedBed]
  );

  // Search matching
  const isSearchMatch = (bed: BedData) => {
    if (!searchQuery.trim()) return false;
    if (!bed.patient) return false;
    const q = searchQuery.toLowerCase();
    return (
      bed.patient.firstName.toLowerCase().includes(q) ||
      bed.patient.lastName.toLowerCase().includes(q) ||
      bed.patient.nhiNumber.toLowerCase().includes(q)
    );
  };

  const openBedDialog = (bed: BedData) => {
    setSelectedBed(bed);
    setSelectedPatientId("");
    setSelectedDestBed("");
    setBedDialogOpen(true);
  };

  const handleBedAction = async (action: string) => {
    if (!selectedBed) return;

    try {
      if (action === "assign" && selectedPatientId) {
        await fetch(`/api/beds/${selectedBed.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patientId: selectedPatientId }),
        });
      } else if (action === "discharge") {
        await fetch(`/api/beds/${selectedBed.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patientId: null }),
        });
      } else if (action === "available") {
        await fetch(`/api/beds/${selectedBed.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "available" }),
        });
      } else if (action === "transfer" && selectedDestBed) {
        // First unassign from current bed
        await fetch(`/api/beds/${selectedBed.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patientId: null, status: "available" }),
        });
        // Then assign to destination bed
        await fetch(`/api/beds/${selectedDestBed}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patientId: selectedBed.patientId }),
        });
      }
    } catch (err) {
      console.error("Bed action failed:", err);
    }

    setBedDialogOpen(false);
    setSelectedBed(null);
    setSelectedPatientId("");
    setSelectedDestBed("");
    fetchBeds();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BedDouble className="h-7 w-7 text-teal-600" />
          {t("Bed Management")}
        </h1>
        <p className="text-gray-500 mt-1">
          {t("Real-time bed occupancy across all wards")}
        </p>
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
            <p className="text-sm text-gray-500">
              {t("Cleaning / Maintenance")}
            </p>
            <p className="text-2xl font-bold text-amber-600">{other}</p>
          </CardContent>
        </Card>
      </div>

      {/* Occupancy Bar */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">
              {t("Overall Occupancy")}
            </p>
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
            <span className="text-gray-600">{t(val.label)}</span>
          </div>
        ))}
      </div>

      {/* Patient Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder={t("Search patient in beds...")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 max-w-sm"
        />
      </div>

      {/* Ward Filter Tabs */}
      {wardNames.length > 0 && (
        <Tabs value={activeWard} onValueChange={setActiveWard}>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="all">{t("All Wards")}</TabsTrigger>
            {wardNames.map((name) => (
              <TabsTrigger key={name} value={name}>
                {t(name)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Ward Bed Grids */}
      {displayedWards.map(([wardName, beds]) => {
        const wardOccupied = beds.filter(
          (b) => b.status === "occupied"
        ).length;
        return (
          <Card key={wardName} className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>{t(wardName)}</span>
                <span className="text-sm font-normal text-gray-500">
                  {wardOccupied}/{beds.length} {t("occupied")}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                {beds.map((bed) => {
                  const cellClass =
                    bedCellColors[bed.status] || bedCellColors.available;
                  const initials = bed.patient
                    ? `${bed.patient.firstName[0]}${bed.patient.lastName[0]}`
                    : null;
                  const highlighted = isSearchMatch(bed);
                  const highlightClass = highlighted
                    ? "ring-2 ring-blue-500"
                    : "";

                  if (bed.status === "occupied" && bed.patient) {
                    return (
                      <HoverCard
                        key={bed.id}
                        openDelay={200}
                        closeDelay={100}
                      >
                        <HoverCardTrigger asChild>
                          <div
                            onClick={() => openBedDialog(bed)}
                            className={`rounded-lg p-2 text-center cursor-pointer transition-colors ${cellClass} ${highlightClass}`}
                          >
                            <p className="text-xs font-mono">
                              {bed.bedNumber}
                            </p>
                            <p className="text-xs font-semibold">{initials}</p>
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-52" side="top">
                          <div className="text-sm">
                            <p className="font-semibold">
                              {bed.patient.firstName} {bed.patient.lastName}
                            </p>
                            <p className="text-xs text-gray-500 font-mono">
                              {bed.patient.nhiNumber}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {t("Bed")} {bed.bedNumber} - {t(wardName)}
                            </p>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    );
                  }

                  return (
                    <div
                      key={bed.id}
                      onClick={() => openBedDialog(bed)}
                      className={`rounded-lg p-2 text-center cursor-pointer transition-colors ${cellClass} ${highlightClass}`}
                    >
                      <p className="text-xs font-mono">{bed.bedNumber}</p>
                      <p className="text-xs capitalize">
                        {bed.status === "available" ? "" : t(bed.status)}
                      </p>
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

      {/* Bed Action Dialog */}
      <Dialog open={bedDialogOpen} onOpenChange={setBedDialogOpen}>
        <DialogContent>
          {selectedBed && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {t("Bed")} {selectedBed.bedNumber} - {t(selectedBed.ward)}
                </DialogTitle>
                <DialogDescription>
                  <Badge
                    className={`capitalize mt-1 ${
                      selectedBed.status === "available"
                        ? "bg-emerald-100 text-emerald-800"
                        : selectedBed.status === "occupied"
                          ? "bg-teal-100 text-teal-800"
                          : selectedBed.status === "cleaning"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {t(selectedBed.status)}
                  </Badge>
                </DialogDescription>
              </DialogHeader>

              {/* Available bed: Assign Patient */}
              {selectedBed.status === "available" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <UserPlus className="h-4 w-4" />
                    {t("Assign a patient to this bed")}
                  </div>
                  <div className="space-y-2">
                    <Label>{t("Patient")}</Label>
                    <Select
                      value={selectedPatientId}
                      onValueChange={setSelectedPatientId}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("Select patient...")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePatients.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.firstName} {p.lastName} ({p.nhiNumber})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setBedDialogOpen(false)}
                    >
                      {t("Cancel")}
                    </Button>
                    <Button
                      className="bg-teal-700 hover:bg-teal-800"
                      disabled={!selectedPatientId}
                      onClick={() => handleBedAction("assign")}
                    >
                      <UserPlus className="h-4 w-4" />
                      {t("Assign Patient")}
                    </Button>
                  </DialogFooter>
                </div>
              )}

              {/* Occupied bed: Transfer or Discharge */}
              {selectedBed.status === "occupied" && selectedBed.patient && (
                <div className="space-y-4">
                  <Card className="border-0 bg-teal-50">
                    <CardContent className="p-3">
                      <p className="font-semibold text-sm">
                        {selectedBed.patient.firstName}{" "}
                        {selectedBed.patient.lastName}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        {selectedBed.patient.nhiNumber}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Transfer */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <ArrowRightLeft className="h-4 w-4" />
                      {t("Transfer Patient")}
                    </div>
                    <Select
                      value={selectedDestBed}
                      onValueChange={setSelectedDestBed}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("Select destination bed...")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableBedsForTransfer.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {t(b.ward)} - {b.bedNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      className="w-full bg-teal-700 hover:bg-teal-800"
                      disabled={!selectedDestBed}
                      onClick={() => handleBedAction("transfer")}
                    >
                      <ArrowRightLeft className="h-4 w-4" />
                      {t("Transfer")}
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-400">
                        {t("or")}
                      </span>
                    </div>
                  </div>

                  {/* Discharge */}
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setBedDialogOpen(false)}
                    >
                      {t("Cancel")}
                    </Button>
                    <Button
                      variant="outline"
                      className="text-amber-700 border-amber-200 hover:bg-amber-50"
                      onClick={() => handleBedAction("discharge")}
                    >
                      <LogOut className="h-4 w-4" />
                      {t("Discharge to Cleaning")}
                    </Button>
                  </DialogFooter>
                </div>
              )}

              {/* Cleaning bed: Mark Available */}
              {selectedBed.status === "cleaning" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Wrench className="h-4 w-4 text-amber-500" />
                    {t("This bed is being cleaned")}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setBedDialogOpen(false)}
                    >
                      {t("Cancel")}
                    </Button>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleBedAction("available")}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {t("Mark Available")}
                    </Button>
                  </DialogFooter>
                </div>
              )}

              {/* Maintenance bed: Mark Available */}
              {selectedBed.status === "maintenance" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Wrench className="h-4 w-4 text-slate-500" />
                    {t("This bed is under maintenance")}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setBedDialogOpen(false)}
                    >
                      {t("Cancel")}
                    </Button>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleBedAction("available")}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {t("Mark Available")}
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
