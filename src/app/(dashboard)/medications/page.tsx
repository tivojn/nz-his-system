"use client";

import { useEffect, useState } from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Pill, Plus, AlertTriangle } from "lucide-react";
import { NZ_MEDICATIONS, FREQUENCIES, MEDICATION_STATUSES } from "@/lib/constants";
import { useBilingual } from "@/components/bilingual-provider";

interface MedicationData {
  id: string;
  name: string;
  genericName: string | null;
  dose: string;
  unit: string;
  route: string;
  frequency: string;
  status: string;
  instructions: string | null;
  startDate: string;
  endDate: string | null;
  patient: { id: string; firstName: string; lastName: string; nhiNumber: string };
  prescriber: { id: string; name: string };
}

interface PatientOption {
  id: string;
  firstName: string;
  lastName: string;
  nhiNumber: string;
}

interface InteractionWarning {
  drugA: string;
  drugB: string;
  severity: string;
  description: string;
  recommendation: string;
}

const statusColors: Record<string, string> = {
  ordered: "bg-blue-100 text-blue-800",
  verified: "bg-purple-100 text-purple-800",
  dispensed: "bg-amber-100 text-amber-800",
  administered: "bg-green-100 text-green-800",
  discontinued: "bg-red-100 text-red-800",
};

export default function MedicationsPage() {
  const { t } = useBilingual();
  const [medications, setMedications] = useState<MedicationData[]>([]);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [interactions, setInteractions] = useState<InteractionWarning[]>([]);
  const [prescribing, setPrescribing] = useState(false);

  const [form, setForm] = useState({
    patientId: "",
    medicationIdx: "",
    dose: "",
    route: "",
    frequency: "",
    instructions: "",
  });

  useEffect(() => {
    fetchMedications();
    fetchPatients();
  }, []);

  const fetchMedications = async () => {
    setLoading(true);
    const res = await fetch("/api/medications");
    const data = await res.json();
    setMedications(data);
    setLoading(false);
  };

  const fetchPatients = async () => {
    const res = await fetch("/api/patients");
    const data = await res.json();
    setPatients(data);
  };

  const checkInteractions = async (selectedMedName: string, patientId: string) => {
    const patientMeds = medications.filter(
      (m) => m.patient.id === patientId && m.status !== "discontinued"
    );
    const allInteractions: InteractionWarning[] = [];

    for (const existing of patientMeds) {
      const res = await fetch("/api/cdss/check-interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drugA: selectedMedName,
          drugB: existing.genericName || existing.name,
        }),
      });
      const found = await res.json();
      allInteractions.push(...found);
    }

    setInteractions(allInteractions);
  };

  const handleMedicationSelect = (idx: string) => {
    const med = NZ_MEDICATIONS[Number(idx)];
    setForm({
      ...form,
      medicationIdx: idx,
      dose: med.defaultDose,
      route: med.route,
    });

    if (form.patientId && med) {
      checkInteractions(med.genericName, form.patientId);
    }
  };

  const handlePatientSelect = (patientId: string) => {
    setForm({ ...form, patientId });
    if (form.medicationIdx) {
      const med = NZ_MEDICATIONS[Number(form.medicationIdx)];
      checkInteractions(med.genericName, patientId);
    }
  };

  const prescribe = async () => {
    setPrescribing(true);
    const med = NZ_MEDICATIONS[Number(form.medicationIdx)];
    let prescriberId = "1";
    try {
      const match = document.cookie.match(/nzhis-session=([^;]+)/);
      if (match) {
        const user = JSON.parse(atob(match[1]));
        prescriberId = user.id;
      }
    } catch {}

    await fetch("/api/medications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: form.patientId,
        prescriberId,
        name: med.name,
        genericName: med.genericName,
        dose: form.dose,
        unit: med.unit,
        route: form.route,
        frequency: form.frequency,
        instructions: form.instructions || null,
      }),
    });

    setForm({ patientId: "", medicationIdx: "", dose: "", route: "", frequency: "", instructions: "" });
    setInteractions([]);
    setDialogOpen(false);
    setPrescribing(false);
    fetchMedications();
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/medications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchMedications();
  };

  // Group medications by patient
  const grouped = medications.reduce<Record<string, MedicationData[]>>((acc, med) => {
    const key = med.patient.id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(med);
    return acc;
  }, {});

  const statusSteps = MEDICATION_STATUSES.filter((s) => s !== "discontinued");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Pill className="h-8 w-8 text-teal-700" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("Medications")}</h1>
            <p className="text-sm text-gray-500">
              {medications.length} active prescription{medications.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-700 hover:bg-teal-800">
              <Plus className="h-4 w-4 mr-1" /> {t("Prescribe")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("Prescribe Medication")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t("Patient")}</Label>
                <Select value={form.patientId} onValueChange={handlePatientSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
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
              <div>
                <Label>{t("Medication")}</Label>
                <Select value={form.medicationIdx} onValueChange={handleMedicationSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select medication" />
                  </SelectTrigger>
                  <SelectContent>
                    {NZ_MEDICATIONS.map((med, idx) => (
                      <SelectItem key={idx} value={String(idx)}>
                        {med.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {interactions.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{t("Drug Interaction Warning")}</AlertTitle>
                  <AlertDescription>
                    {interactions.map((i, idx) => (
                      <div key={idx} className="mt-1">
                        <span className="font-semibold capitalize">[{i.severity}]</span>{" "}
                        {i.description}
                        <br />
                        <span className="text-xs">{i.recommendation}</span>
                      </div>
                    ))}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>{t("Dose")}</Label>
                  <Input
                    value={form.dose}
                    onChange={(e) => setForm({ ...form, dose: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t("Route")}</Label>
                  <Select value={form.route} onValueChange={(v) => setForm({ ...form, route: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oral">Oral</SelectItem>
                      <SelectItem value="iv">IV</SelectItem>
                      <SelectItem value="im">IM</SelectItem>
                      <SelectItem value="sc">SC</SelectItem>
                      <SelectItem value="topical">Topical</SelectItem>
                      <SelectItem value="inhaled">Inhaled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>{t("Frequency")}</Label>
                <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((f) => (
                      <SelectItem key={f.code} value={f.code}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("Instructions")}</Label>
                <Textarea
                  placeholder="Additional instructions..."
                  value={form.instructions}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                />
              </div>
              <Button
                onClick={prescribe}
                disabled={!form.patientId || !form.medicationIdx || !form.frequency || prescribing}
                className="w-full bg-teal-700 hover:bg-teal-800"
              >
                {prescribing ? t("Loading...") : t("Prescribe Medication")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="animate-pulse text-gray-400 p-4">{t("Loading...")}</div>
      ) : Object.keys(grouped).length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center text-gray-500">
            {t("No medications prescribed yet.")}
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([patientId, meds]) => {
          const patient = meds[0].patient;
          return (
            <Card key={patientId} className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-sm">
                    {patient.firstName[0]}{patient.lastName[0]}
                  </span>
                  {patient.firstName} {patient.lastName}
                  <Badge variant="outline" className="font-mono text-xs">{patient.nhiNumber}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {meds.map((med) => {
                  const currentStepIdx = statusSteps.indexOf(
                    med.status as (typeof statusSteps)[number]
                  );
                  return (
                    <div
                      key={med.id}
                      className={`p-3 rounded-lg border ${
                        med.status === "discontinued" ? "bg-gray-50 opacity-60" : "bg-white"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{med.name}</span>
                          <Badge className={statusColors[med.status]}>{med.status}</Badge>
                        </div>
                        <span className="text-xs text-gray-400">
                          {med.dose} · {med.route} · {med.frequency}
                        </span>
                      </div>
                      {med.instructions && (
                        <p className="text-xs text-gray-500 mb-2">{med.instructions}</p>
                      )}
                      {/* Status Pipeline */}
                      {med.status !== "discontinued" && (
                        <div className="status-pipeline mb-2">
                          {statusSteps.map((step, idx) => (
                            <div
                              key={step}
                              className={`status-step ${
                                idx < currentStepIdx
                                  ? "active"
                                  : idx === currentStepIdx
                                  ? "current"
                                  : ""
                              }`}
                              title={step}
                            />
                          ))}
                        </div>
                      )}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs text-gray-400">
                          Prescribed by {med.prescriber.name} on{" "}
                          {new Date(med.startDate).toLocaleDateString("en-NZ")}
                        </span>
                        {med.status !== "discontinued" && med.status !== "administered" && (
                          <div className="flex flex-wrap gap-1">
                            {currentStepIdx < statusSteps.length - 1 && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-7"
                                onClick={() =>
                                  updateStatus(med.id, statusSteps[currentStepIdx + 1])
                                }
                              >
                                {t("Advance to")} {statusSteps[currentStepIdx + 1]}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => updateStatus(med.id, "discontinued")}
                            >
                              {t("Discontinue")}
                            </Button>
                          </div>
                        )}
                      </div>
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
