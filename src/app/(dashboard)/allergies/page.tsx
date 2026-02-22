"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShieldAlert,
  Plus,
  AlertTriangle,
  Search,
  Pencil,
  Ban,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { useBilingual } from "@/components/bilingual-provider";

// --- Types ---

interface AllergyData {
  id: string;
  allergen: string;
  type: string;
  severity: string;
  reaction: string;
  status: string;
  onsetDate: string | null;
  verifiedBy: string | null;
  notes: string | null;
  createdAt: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    nhiNumber: string;
  };
}

interface PatientOption {
  id: string;
  firstName: string;
  lastName: string;
  nhiNumber: string;
}

// --- Constants ---

const ALLERGY_TYPES = ["drug", "food", "environmental", "other"] as const;
const SEVERITY_LEVELS = ["mild", "moderate", "severe", "life-threatening"] as const;
const STATUS_OPTIONS = ["active", "inactive", "resolved"] as const;

const COMMON_ALLERGENS = [
  "Penicillin",
  "Amoxicillin",
  "Sulfonamides",
  "Aspirin",
  "NSAIDs",
  "Latex",
  "Peanuts",
  "Shellfish",
  "Eggs",
  "Dairy",
  "Bee Stings",
  "Iodine",
];

const severityColors: Record<string, string> = {
  mild: "bg-green-100 text-green-800",
  moderate: "bg-yellow-100 text-yellow-800",
  severe: "bg-orange-100 text-orange-800",
  "life-threatening": "bg-red-100 text-red-800",
};

const typeColors: Record<string, string> = {
  drug: "bg-purple-100 text-purple-800",
  food: "bg-amber-100 text-amber-800",
  environmental: "bg-sky-100 text-sky-800",
  other: "bg-gray-100 text-gray-800",
};

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-600",
  resolved: "bg-blue-100 text-blue-800",
};

// --- Component ---

export default function AllergiesPage() {
  const { t } = useBilingual();

  const [allergies, setAllergies] = useState<AllergyData[]>([]);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit severity dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AllergyData | null>(null);
  const [editSeverity, setEditSeverity] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");

  // New allergy form
  const [form, setForm] = useState({
    patientId: "",
    allergen: "",
    type: "drug",
    severity: "moderate",
    reaction: "",
    onsetDate: "",
    notes: "",
  });

  // Allergen suggestions
  const [showSuggestions, setShowSuggestions] = useState(false);
  const filteredSuggestions = COMMON_ALLERGENS.filter((a) =>
    a.toLowerCase().includes(form.allergen.toLowerCase())
  );

  useEffect(() => {
    fetchAllergies();
    fetchPatients();
  }, []);

  const fetchAllergies = async () => {
    setLoading(true);
    const res = await fetch("/api/allergies");
    const data = await res.json();
    setAllergies(data);
    setLoading(false);
  };

  const fetchPatients = async () => {
    const res = await fetch("/api/patients");
    const data = await res.json();
    setPatients(data);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await fetch("/api/allergies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: form.patientId,
        allergen: form.allergen,
        type: form.type,
        severity: form.severity,
        reaction: form.reaction,
        onsetDate: form.onsetDate || null,
        notes: form.notes || null,
      }),
    });
    setForm({
      patientId: "",
      allergen: "",
      type: "drug",
      severity: "moderate",
      reaction: "",
      onsetDate: "",
      notes: "",
    });
    setDialogOpen(false);
    setSubmitting(false);
    fetchAllergies();
  };

  const updateAllergy = async (id: string, data: Record<string, unknown>) => {
    await fetch(`/api/allergies/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    fetchAllergies();
  };

  const deleteAllergy = async (id: string) => {
    await fetch(`/api/allergies/${id}`, { method: "DELETE" });
    fetchAllergies();
  };

  const openEditDialog = (allergy: AllergyData) => {
    setEditTarget(allergy);
    setEditSeverity(allergy.severity);
    setEditNotes(allergy.notes || "");
    setEditDialogOpen(true);
  };

  const submitEdit = async () => {
    if (!editTarget) return;
    await updateAllergy(editTarget.id, {
      severity: editSeverity,
      notes: editNotes || null,
    });
    setEditDialogOpen(false);
    setEditTarget(null);
  };

  // --- Stats (computed from ALL allergies, unfiltered) ---

  const activeAllergies = allergies.filter((a) => a.status === "active");
  const totalActive = activeAllergies.length;
  const drugCount = activeAllergies.filter((a) => a.type === "drug").length;
  const lifeThreatCount = activeAllergies.filter(
    (a) => a.severity === "life-threatening"
  ).length;
  const uniquePatientCount = new Set(activeAllergies.map((a) => a.patient.id)).size;

  // --- Filtering ---

  const filtered = useMemo(() => {
    let result = allergies;

    if (statusFilter !== "all") {
      result = result.filter((a) => a.status === statusFilter);
    }
    if (typeFilter !== "all") {
      result = result.filter((a) => a.type === typeFilter);
    }
    if (severityFilter !== "all") {
      result = result.filter((a) => a.severity === severityFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.patient.firstName.toLowerCase().includes(q) ||
          a.patient.lastName.toLowerCase().includes(q) ||
          a.patient.nhiNumber.toLowerCase().includes(q) ||
          a.allergen.toLowerCase().includes(q)
      );
    }

    return result;
  }, [allergies, statusFilter, typeFilter, severityFilter, searchQuery]);

  // --- Group by patient ---

  const grouped = filtered.reduce<Record<string, AllergyData[]>>((acc, a) => {
    const key = a.patient.id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-8 w-8 text-teal-700" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("Allergy Management")}
            </h1>
            <p className="text-sm text-gray-500">
              {totalActive} {t("active allergies")}
            </p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-700 hover:bg-teal-800">
              <Plus className="h-4 w-4 mr-1" /> {t("Record Allergy")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("New Allergy Record")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Patient */}
              <div>
                <Label>{t("Patient")}</Label>
                <Select
                  value={form.patientId}
                  onValueChange={(v) => setForm({ ...form, patientId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select patient")} />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.firstName} {p.lastName} ({p.nhiNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Allergen with suggestions */}
              <div className="relative">
                <Label>{t("Allergen")}</Label>
                <Input
                  placeholder={t("e.g. Penicillin, Peanuts, Latex")}
                  value={form.allergen}
                  onChange={(e) => {
                    setForm({ ...form, allergen: e.target.value });
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                {showSuggestions &&
                  form.allergen.length > 0 &&
                  filteredSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
                      {filteredSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-teal-50 transition-colors"
                          onMouseDown={() => {
                            setForm({ ...form, allergen: suggestion });
                            setShowSuggestions(false);
                          }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
              </div>

              {/* Type + Severity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{t("Type")}</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) => setForm({ ...form, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALLERGY_TYPES.map((t_) => (
                        <SelectItem key={t_} value={t_}>
                          {t_.charAt(0).toUpperCase() + t_.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("Severity")}</Label>
                  <Select
                    value={form.severity}
                    onValueChange={(v) => setForm({ ...form, severity: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SEVERITY_LEVELS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Reaction */}
              <div>
                <Label>{t("Reaction Description")}</Label>
                <Textarea
                  placeholder={t("Describe the reaction (e.g. Anaphylaxis, Rash, Hives)...")}
                  value={form.reaction}
                  onChange={(e) => setForm({ ...form, reaction: e.target.value })}
                />
              </div>

              {/* Onset Date */}
              <div>
                <Label>{t("Onset Date")} ({t("optional")})</Label>
                <Input
                  type="date"
                  value={form.onsetDate}
                  onChange={(e) => setForm({ ...form, onsetDate: e.target.value })}
                />
              </div>

              {/* Notes */}
              <div>
                <Label>{t("Notes")}</Label>
                <Textarea
                  placeholder={t("Additional notes...")}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={
                  !form.patientId || !form.allergen || !form.reaction || submitting
                }
                className="w-full bg-teal-700 hover:bg-teal-800"
              >
                {submitting ? t("Loading...") : t("Record Allergy")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">{t("Total Active Allergies")}</p>
            <p className="text-2xl font-bold text-gray-900">{totalActive}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">{t("Drug Allergies")}</p>
            <p className="text-2xl font-bold text-purple-700">{drugCount}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500">{t("Life-Threatening")}</p>
              {lifeThreatCount > 0 && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-red-600">{lifeThreatCount}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">
              {t("Patients with Allergies")}
            </p>
            <p className="text-2xl font-bold text-gray-900">{uniquePatientCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t("Search allergies...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("All Types")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All Types")}</SelectItem>
            {ALLERGY_TYPES.map((t_) => (
              <SelectItem key={t_} value={t_}>
                {t_.charAt(0).toUpperCase() + t_.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("All Severities")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All Severities")}</SelectItem>
            {SEVERITY_LEVELS.map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("Status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All")}</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Edit Severity Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("Edit Allergy")}</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {editTarget.allergen} &mdash; {editTarget.patient.firstName}{" "}
                {editTarget.patient.lastName}
              </p>
              <div>
                <Label>{t("Severity")}</Label>
                <Select value={editSeverity} onValueChange={setEditSeverity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SEVERITY_LEVELS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("Notes")}</Label>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder={t("Additional notes...")}
                />
              </div>
              <Button
                onClick={submitEdit}
                className="w-full bg-teal-700 hover:bg-teal-800"
              >
                {t("Save")}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Allergy List */}
      {loading ? (
        <div className="animate-pulse text-gray-400 p-4">{t("Loading...")}</div>
      ) : Object.keys(grouped).length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center text-gray-500">
            {t("No allergies recorded.")}
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([patientId, items]) => {
          const patient = items[0].patient;
          const hasLifeThreat = items.some(
            (a) => a.severity === "life-threatening" && a.status === "active"
          );

          return (
            <Card
              key={patientId}
              className={`border-0 shadow-sm ${
                hasLifeThreat ? "border-l-4 border-l-red-500 ring-1 ring-red-200" : ""
              }`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-sm">
                    {patient.firstName[0]}
                    {patient.lastName[0]}
                  </span>
                  {patient.firstName} {patient.lastName}
                  <Badge variant="outline" className="font-mono text-xs">
                    {patient.nhiNumber}
                  </Badge>
                  {hasLifeThreat && (
                    <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {t("Life-Threatening")}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((allergy) => {
                  const isLifeThreat =
                    allergy.severity === "life-threatening" &&
                    allergy.status === "active";

                  return (
                    <div
                      key={allergy.id}
                      className={`p-3 rounded-lg border transition-all ${
                        isLifeThreat
                          ? "border-l-4 border-l-red-500 bg-red-50/50"
                          : allergy.status !== "active"
                          ? "bg-gray-50 opacity-60"
                          : "bg-white"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {isLifeThreat && (
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                            </span>
                          )}
                          <span className="font-semibold text-gray-900">
                            {allergy.allergen}
                          </span>
                          <Badge className={typeColors[allergy.type]}>
                            {allergy.type}
                          </Badge>
                          <Badge className={severityColors[allergy.severity]}>
                            {allergy.severity}
                          </Badge>
                          <Badge className={statusColors[allergy.status]}>
                            {allergy.status}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(allergy.createdAt).toLocaleDateString("en-NZ")}
                        </span>
                      </div>

                      {allergy.reaction && (
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">{t("Reaction")}:</span>{" "}
                          {allergy.reaction}
                        </p>
                      )}

                      {allergy.notes && (
                        <p className="text-xs text-gray-500 mb-1">
                          <span className="font-medium">{t("Notes")}:</span>{" "}
                          {allergy.notes}
                        </p>
                      )}

                      {allergy.onsetDate && (
                        <p className="text-xs text-gray-400 mb-2">
                          {t("Onset")}:{" "}
                          {new Date(allergy.onsetDate).toLocaleDateString("en-NZ")}
                        </p>
                      )}

                      {/* Action Buttons */}
                      {allergy.status === "active" && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7"
                            onClick={() => openEditDialog(allergy)}
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            {t("Edit")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 text-amber-600 border-amber-200 hover:bg-amber-50"
                            onClick={() =>
                              updateAllergy(allergy.id, { status: "inactive" })
                            }
                          >
                            <Ban className="h-3 w-3 mr-1" />
                            {t("Mark Inactive")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() =>
                              updateAllergy(allergy.id, { status: "resolved" })
                            }
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {t("Resolve")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => deleteAllergy(allergy.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            {t("Delete")}
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
