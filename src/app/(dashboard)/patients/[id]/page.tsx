"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import {
  FileText,
  Calendar,
  Activity,
  FlaskConical,
  ArrowLeft,
  Clock,
  Heart,
  Thermometer,
  Pill,
  Plus,
  AlertTriangle,
  Check,
  X,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  NZ_MEDICATIONS,
  FREQUENCIES,
  MEDICATION_STATUSES,
  NOTE_TEMPLATES,
} from "@/lib/constants";

interface PatientDetail {
  id: string;
  nhiNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  ethnicity: string;
  iwi: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  region: string | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  accClaimNumber: string | null;
  accClaimStatus: string | null;
  status: string;
  encounters: any[];
  notes: any[];
  appointments: any[];
  waitlistEntries: any[];
  observations: any[];
}

interface VitalSignSet {
  id: string;
  heartRate: number | null;
  systolicBP: number | null;
  diastolicBP: number | null;
  respiratoryRate: number | null;
  temperature: number | null;
  oxygenSat: number | null;
  consciousness: string | null;
  painScore: number | null;
  news2Score: number | null;
  recordedBy: string | null;
  recordedAt: string;
}

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
  prescriber: { id: string; name: string };
}

const statusSteps = MEDICATION_STATUSES.filter((s) => s !== "discontinued");
const statusColors: Record<string, string> = {
  ordered: "bg-blue-100 text-blue-800",
  verified: "bg-purple-100 text-purple-800",
  dispensed: "bg-amber-100 text-amber-800",
  administered: "bg-green-100 text-green-800",
  discontinued: "bg-red-100 text-red-800",
};

const templateDefaults: Record<string, { subjective: string; objective: string; assessment: string; plan: string }> = {
  soap: { subjective: "", objective: "", assessment: "", plan: "" },
  admission: {
    subjective: "Presenting complaint:\nHistory of presenting illness:\nPast medical history:\nMedications:\nAllergies:\nSocial history:",
    objective: "Observations:\nExamination findings:\nInvestigations ordered:",
    assessment: "Working diagnosis:\nDifferentials:",
    plan: "Admission plan:\nMedications:\nInvestigations:\nConsults:\nVTE prophylaxis:\nDiet:\nMobility:",
  },
  discharge: {
    subjective: "Admission reason:\nHospital course:",
    objective: "Discharge observations:\nOutstanding results:",
    assessment: "Discharge diagnosis:\nProcedures performed:",
    plan: "Discharge medications:\nFollow-up appointments:\nGP letter:\nPatient education:\nWarning signs to return:",
  },
  surgical: {
    subjective: "Indication for surgery:\nConsent obtained:",
    objective: "Procedure:\nFindings:\nSpecimen:\nEstimated blood loss:\nComplications:",
    assessment: "Post-operative diagnosis:",
    plan: "Post-op orders:\nAnalgesia:\nDVT prophylaxis:\nDiet:\nMobility:\nFollow-up:",
  },
  progress: {
    subjective: "Overnight events:\nPatient concerns:",
    objective: "Observations:\nExamination:\nResults:",
    assessment: "Progress:\nOngoing issues:",
    plan: "Plan for today:\nOutstanding tasks:\nEstimated discharge:",
  },
};

export default function PatientDetailPage() {
  const params = useParams();
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [noteTemplate, setNoteTemplate] = useState("soap");
  const [newNote, setNewNote] = useState({ subjective: "", objective: "", assessment: "", plan: "" });
  const [saving, setSaving] = useState(false);

  // Vitals state
  const [vitals, setVitals] = useState<VitalSignSet[]>([]);
  const [vitalsDialogOpen, setVitalsDialogOpen] = useState(false);
  const [vitalForm, setVitalForm] = useState({
    heartRate: "",
    systolicBP: "",
    diastolicBP: "",
    respiratoryRate: "",
    temperature: "",
    oxygenSat: "",
    onSupplementalO2: false,
    consciousness: "A",
    painScore: "",
  });
  const [savingVitals, setSavingVitals] = useState(false);

  // Medications state
  const [medications, setMedications] = useState<MedicationData[]>([]);
  const [prescribeDialogOpen, setPrescribeDialogOpen] = useState(false);
  const [medForm, setMedForm] = useState({
    medicationIdx: "",
    dose: "",
    route: "",
    frequency: "",
    instructions: "",
  });
  const [interactions, setInteractions] = useState<any[]>([]);
  const [prescribing, setPrescribing] = useState(false);

  // Discharge state
  const [dischargeDialogOpen, setDischargeDialogOpen] = useState(false);
  const [dischargeStep, setDischargeStep] = useState(0);
  const [dischargeData, setDischargeData] = useState({
    diagnosis: "",
    continueMeds: [] as string[],
    followUpDate: "",
    followUpDept: "",
    accUpdate: "",
    notes: "",
  });
  const [discharging, setDischarging] = useState(false);

  useEffect(() => {
    fetchPatient();
  }, [params.id]);

  useEffect(() => {
    if (patient) {
      fetchVitals();
      fetchMedications();
    }
  }, [patient?.id]);

  const fetchPatient = async () => {
    const res = await fetch(`/api/patients/${params.id}`);
    const data = await res.json();
    setPatient(data);
  };

  const fetchVitals = async () => {
    if (!patient) return;
    const res = await fetch(`/api/vitals?patientId=${patient.id}`);
    const data = await res.json();
    setVitals(data);
  };

  const fetchMedications = async () => {
    if (!patient) return;
    const res = await fetch(`/api/medications?patientId=${patient.id}`);
    const data = await res.json();
    setMedications(data);
  };

  const getCurrentUser = () => {
    try {
      const match = document.cookie.match(/nzhis-session=([^;]+)/);
      if (match) return JSON.parse(atob(match[1]));
    } catch {}
    return { id: "1", name: "Unknown" };
  };

  // Notes
  const handleTemplateChange = (template: string) => {
    setNoteTemplate(template);
    setNewNote(templateDefaults[template] || templateDefaults.soap);
  };

  const saveNote = async () => {
    setSaving(true);
    const user = getCurrentUser();
    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: patient!.id,
        authorId: user.id,
        type: noteTemplate,
        ...newNote,
      }),
    });
    setNewNote({ subjective: "", objective: "", assessment: "", plan: "" });
    await fetchPatient();
    setSaving(false);
  };

  // Vitals
  const saveVitals = async () => {
    setSavingVitals(true);
    const user = getCurrentUser();
    await fetch("/api/vitals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: patient!.id,
        heartRate: vitalForm.heartRate ? Number(vitalForm.heartRate) : null,
        systolicBP: vitalForm.systolicBP ? Number(vitalForm.systolicBP) : null,
        diastolicBP: vitalForm.diastolicBP ? Number(vitalForm.diastolicBP) : null,
        respiratoryRate: vitalForm.respiratoryRate ? Number(vitalForm.respiratoryRate) : null,
        temperature: vitalForm.temperature ? Number(vitalForm.temperature) : null,
        oxygenSat: vitalForm.oxygenSat ? Number(vitalForm.oxygenSat) : null,
        onSupplementalO2: vitalForm.onSupplementalO2,
        consciousness: vitalForm.consciousness,
        painScore: vitalForm.painScore ? Number(vitalForm.painScore) : null,
        recordedBy: user.name,
      }),
    });
    setVitalForm({
      heartRate: "",
      systolicBP: "",
      diastolicBP: "",
      respiratoryRate: "",
      temperature: "",
      oxygenSat: "",
      onSupplementalO2: false,
      consciousness: "A",
      painScore: "",
    });
    setVitalsDialogOpen(false);
    setSavingVitals(false);
    fetchVitals();
  };

  // Medications
  const handleMedSelect = async (idx: string) => {
    const med = NZ_MEDICATIONS[Number(idx)];
    setMedForm({ ...medForm, medicationIdx: idx, dose: med.defaultDose, route: med.route });

    // Check interactions with existing meds
    const activeMeds = medications.filter((m) => m.status !== "discontinued");
    const allInteractions: any[] = [];
    for (const existing of activeMeds) {
      const res = await fetch("/api/cdss/check-interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drugA: med.genericName, drugB: existing.genericName || existing.name }),
      });
      const found = await res.json();
      allInteractions.push(...found);
    }
    setInteractions(allInteractions);
  };

  const prescribe = async () => {
    setPrescribing(true);
    const med = NZ_MEDICATIONS[Number(medForm.medicationIdx)];
    const user = getCurrentUser();
    await fetch("/api/medications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: patient!.id,
        prescriberId: user.id,
        name: med.name,
        genericName: med.genericName,
        dose: medForm.dose,
        unit: med.unit,
        route: medForm.route,
        frequency: medForm.frequency,
        instructions: medForm.instructions || null,
      }),
    });
    setMedForm({ medicationIdx: "", dose: "", route: "", frequency: "", instructions: "" });
    setInteractions([]);
    setPrescribeDialogOpen(false);
    setPrescribing(false);
    fetchMedications();
  };

  const updateMedStatus = async (id: string, status: string) => {
    await fetch(`/api/medications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchMedications();
  };

  // Discharge
  const activeEncounter = patient?.encounters.find((e: any) => e.status === "in-progress");

  const processDischarge = async () => {
    if (!activeEncounter) return;
    setDischarging(true);
    const user = getCurrentUser();
    const discontinueMeds = medications
      .filter((m) => m.status !== "discontinued" && !dischargeData.continueMeds.includes(m.id))
      .map((m) => m.id);

    await fetch(`/api/encounters/${activeEncounter.id}/discharge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        diagnosis: dischargeData.diagnosis || activeEncounter.diagnosis,
        dischargedBy: user.id,
        discontinueMedications: discontinueMeds,
      }),
    });

    setDischargeDialogOpen(false);
    setDischargeStep(0);
    setDischarging(false);
    fetchPatient();
    fetchMedications();
  };

  // Vitals chart data
  const chartData = useMemo(() => {
    return [...vitals]
      .reverse()
      .map((v) => ({
        time: new Date(v.recordedAt).toLocaleTimeString("en-NZ", {
          hour: "2-digit",
          minute: "2-digit",
          day: "numeric",
          month: "short",
        }),
        heartRate: v.heartRate,
        systolicBP: v.systolicBP,
        diastolicBP: v.diastolicBP,
        temperature: v.temperature,
      }));
  }, [vitals]);

  const latestVitals = vitals[0];
  const news2Color =
    latestVitals?.news2Score != null
      ? latestVitals.news2Score >= 7
        ? "bg-red-500"
        : latestVitals.news2Score >= 5
        ? "bg-orange-500"
        : latestVitals.news2Score >= 1
        ? "bg-yellow-500"
        : "bg-green-500"
      : "bg-gray-300";

  if (!patient) return <div className="animate-pulse text-gray-400 p-8">Loading patient...</div>;

  const age = Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 86400000));
  const activeMeds = medications.filter((m) => m.status !== "discontinued");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/patients">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center">
              <span className="text-teal-700 font-bold text-xl">{patient.firstName[0]}{patient.lastName[0]}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{patient.firstName} {patient.lastName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="font-mono">{patient.nhiNumber}</Badge>
                <span className="text-sm text-gray-500">{age} yrs · {patient.gender} · {patient.ethnicity}</span>
                {patient.iwi && <Badge className="bg-green-100 text-green-800 text-xs">Iwi: {patient.iwi}</Badge>}
              </div>
            </div>
          </div>
        </div>
        {patient.accClaimNumber && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3">
              <p className="text-xs text-gray-500">ACC Claim</p>
              <p className="font-mono text-sm">{patient.accClaimNumber}</p>
              <Badge className={patient.accClaimStatus === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>
                {patient.accClaimStatus}
              </Badge>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Demographics Card */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><span className="text-gray-500">DOB</span><p className="font-medium">{new Date(patient.dateOfBirth).toLocaleDateString("en-NZ")}</p></div>
          <div><span className="text-gray-500">Phone</span><p className="font-medium">{patient.phone || "\u2014"}</p></div>
          <div><span className="text-gray-500">Email</span><p className="font-medium">{patient.email || "\u2014"}</p></div>
          <div><span className="text-gray-500">Address</span><p className="font-medium">{patient.address ? `${patient.address}, ${patient.city}` : "\u2014"}</p></div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="notes" className="space-y-4">
        <TabsList className="bg-white border shadow-sm flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="notes" className="gap-1"><FileText className="h-4 w-4" /> Notes ({patient.notes.length})</TabsTrigger>
          <TabsTrigger value="vitals" className="gap-1"><Heart className="h-4 w-4" /> Vitals ({vitals.length})</TabsTrigger>
          <TabsTrigger value="medications" className="gap-1"><Pill className="h-4 w-4" /> Meds ({activeMeds.length})</TabsTrigger>
          <TabsTrigger value="encounters" className="gap-1"><Activity className="h-4 w-4" /> Encounters ({patient.encounters.length})</TabsTrigger>
          <TabsTrigger value="observations" className="gap-1"><FlaskConical className="h-4 w-4" /> Labs ({patient.observations.length})</TabsTrigger>
          <TabsTrigger value="appointments" className="gap-1"><Calendar className="h-4 w-4" /> Appts ({patient.appointments.length})</TabsTrigger>
          <TabsTrigger value="waitlist" className="gap-1"><Clock className="h-4 w-4" /> Waitlist ({patient.waitlistEntries.length})</TabsTrigger>
        </TabsList>

        {/* Notes Tab (enhanced with templates) */}
        <TabsContent value="notes" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">New Clinical Note</CardTitle>
                <Select value={noteTemplate} onValueChange={handleTemplateChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTE_TEMPLATES.map((t) => (
                      <SelectItem key={t.type} value={t.type}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs font-medium text-gray-500">
                  {noteTemplate === "soap" ? "SUBJECTIVE" : "SUBJECTIVE / HISTORY"}
                </Label>
                <Textarea
                  placeholder="Patient's complaint and history..."
                  value={newNote.subjective}
                  onChange={(e) => setNewNote({ ...newNote, subjective: e.target.value })}
                  className="mt-1"
                  rows={4}
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-500">
                  {noteTemplate === "soap" ? "OBJECTIVE" : "OBJECTIVE / FINDINGS"}
                </Label>
                <Textarea
                  placeholder="Examination findings, vitals, results..."
                  value={newNote.objective}
                  onChange={(e) => setNewNote({ ...newNote, objective: e.target.value })}
                  className="mt-1"
                  rows={4}
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-500">ASSESSMENT</Label>
                <Textarea
                  placeholder="Diagnosis and clinical reasoning..."
                  value={newNote.assessment}
                  onChange={(e) => setNewNote({ ...newNote, assessment: e.target.value })}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-500">PLAN</Label>
                <Textarea
                  placeholder="Treatment plan, medications, follow-up..."
                  value={newNote.plan}
                  onChange={(e) => setNewNote({ ...newNote, plan: e.target.value })}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <Button onClick={saveNote} disabled={saving} className="bg-teal-700 hover:bg-teal-800">
                {saving ? "Saving..." : "Save Note"}
              </Button>
            </CardContent>
          </Card>

          {patient.notes.map((note: any) => (
            <Card key={note.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-teal-100 text-teal-800 uppercase text-xs">{note.type}</Badge>
                    <span className="text-sm text-gray-500">{note.author?.name}</span>
                    {note.aiGenerated && <Badge className="bg-purple-100 text-purple-800 text-xs">AI Generated</Badge>}
                  </div>
                  <span className="text-xs text-gray-400">{new Date(note.createdAt).toLocaleString("en-NZ")}</span>
                </div>
                {note.subjective && <div className="mb-2"><span className="text-xs font-bold text-gray-400">S:</span> <span className="text-sm whitespace-pre-wrap">{note.subjective}</span></div>}
                {note.objective && <div className="mb-2"><span className="text-xs font-bold text-gray-400">O:</span> <span className="text-sm whitespace-pre-wrap">{note.objective}</span></div>}
                {note.assessment && <div className="mb-2"><span className="text-xs font-bold text-gray-400">A:</span> <span className="text-sm whitespace-pre-wrap">{note.assessment}</span></div>}
                {note.plan && <div><span className="text-xs font-bold text-gray-400">P:</span> <span className="text-sm whitespace-pre-wrap">{note.plan}</span></div>}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Vitals Tab (new) */}
        <TabsContent value="vitals" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {latestVitals?.news2Score != null && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">Current NEWS2:</span>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${news2Color}`}>
                    {latestVitals.news2Score}
                  </div>
                </div>
              )}
            </div>
            <Dialog open={vitalsDialogOpen} onOpenChange={setVitalsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-teal-700 hover:bg-teal-800">
                  <Plus className="h-4 w-4 mr-1" /> Record Vitals
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Record Vital Signs</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Heart Rate (bpm)</Label>
                      <Input type="number" value={vitalForm.heartRate} onChange={(e) => setVitalForm({ ...vitalForm, heartRate: e.target.value })} />
                    </div>
                    <div>
                      <Label>Respiratory Rate</Label>
                      <Input type="number" value={vitalForm.respiratoryRate} onChange={(e) => setVitalForm({ ...vitalForm, respiratoryRate: e.target.value })} />
                    </div>
                    <div>
                      <Label>Systolic BP (mmHg)</Label>
                      <Input type="number" value={vitalForm.systolicBP} onChange={(e) => setVitalForm({ ...vitalForm, systolicBP: e.target.value })} />
                    </div>
                    <div>
                      <Label>Diastolic BP (mmHg)</Label>
                      <Input type="number" value={vitalForm.diastolicBP} onChange={(e) => setVitalForm({ ...vitalForm, diastolicBP: e.target.value })} />
                    </div>
                    <div>
                      <Label>Temperature (C)</Label>
                      <Input type="number" step="0.1" value={vitalForm.temperature} onChange={(e) => setVitalForm({ ...vitalForm, temperature: e.target.value })} />
                    </div>
                    <div>
                      <Label>SpO2 (%)</Label>
                      <Input type="number" value={vitalForm.oxygenSat} onChange={(e) => setVitalForm({ ...vitalForm, oxygenSat: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={vitalForm.onSupplementalO2} onCheckedChange={(v) => setVitalForm({ ...vitalForm, onSupplementalO2: v })} />
                    <Label>Supplemental O2</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Consciousness (AVPU)</Label>
                      <Select value={vitalForm.consciousness} onValueChange={(v) => setVitalForm({ ...vitalForm, consciousness: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A - Alert</SelectItem>
                          <SelectItem value="V">V - Voice</SelectItem>
                          <SelectItem value="P">P - Pain</SelectItem>
                          <SelectItem value="U">U - Unresponsive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Pain Score (0-10)</Label>
                      <Input type="number" min="0" max="10" value={vitalForm.painScore} onChange={(e) => setVitalForm({ ...vitalForm, painScore: e.target.value })} />
                    </div>
                  </div>
                  <Button onClick={saveVitals} disabled={savingVitals} className="w-full bg-teal-700 hover:bg-teal-800">
                    {savingVitals ? "Saving..." : "Record Vitals"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Vitals Chart */}
          {chartData.length > 1 && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Vitals Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="heartRate" stroke="#ef4444" name="HR" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="systolicBP" stroke="#3b82f6" name="Sys BP" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="diastolicBP" stroke="#93c5fd" name="Dia BP" strokeWidth={1} dot={false} />
                    <Line type="monotone" dataKey="temperature" stroke="#f59e0b" name="Temp" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Vitals History Table */}
          {vitals.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center text-gray-500">No vital signs recorded yet.</CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 text-xs font-medium text-gray-500">Time</th>
                      <th className="text-left p-3 text-xs font-medium text-gray-500">HR</th>
                      <th className="text-left p-3 text-xs font-medium text-gray-500">BP</th>
                      <th className="text-left p-3 text-xs font-medium text-gray-500">RR</th>
                      <th className="text-left p-3 text-xs font-medium text-gray-500">Temp</th>
                      <th className="text-left p-3 text-xs font-medium text-gray-500">SpO2</th>
                      <th className="text-left p-3 text-xs font-medium text-gray-500">AVPU</th>
                      <th className="text-left p-3 text-xs font-medium text-gray-500">NEWS2</th>
                      <th className="text-left p-3 text-xs font-medium text-gray-500">By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vitals.map((v) => (
                      <tr key={v.id} className="border-b last:border-0">
                        <td className="p-3 text-xs text-gray-500">{new Date(v.recordedAt).toLocaleString("en-NZ", { dateStyle: "short", timeStyle: "short" })}</td>
                        <td className="p-3">{v.heartRate ?? "\u2014"}</td>
                        <td className="p-3">{v.systolicBP != null ? `${v.systolicBP}/${v.diastolicBP ?? "?"}` : "\u2014"}</td>
                        <td className="p-3">{v.respiratoryRate ?? "\u2014"}</td>
                        <td className="p-3">{v.temperature != null ? `${v.temperature}\u00B0C` : "\u2014"}</td>
                        <td className="p-3">{v.oxygenSat != null ? `${v.oxygenSat}%` : "\u2014"}</td>
                        <td className="p-3">{v.consciousness ?? "\u2014"}</td>
                        <td className="p-3">
                          {v.news2Score != null ? (
                            <Badge className={`text-white text-xs ${
                              v.news2Score >= 7 ? "bg-red-500" : v.news2Score >= 5 ? "bg-orange-500" : v.news2Score >= 1 ? "bg-yellow-500 text-yellow-900" : "bg-green-500"
                            }`}>
                              {v.news2Score}
                            </Badge>
                          ) : "\u2014"}
                        </td>
                        <td className="p-3 text-xs text-gray-400">{v.recordedBy ?? "\u2014"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Medications Tab (new) */}
        <TabsContent value="medications" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={prescribeDialogOpen} onOpenChange={setPrescribeDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-teal-700 hover:bg-teal-800">
                  <Plus className="h-4 w-4 mr-1" /> Prescribe
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Prescribe Medication</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Medication</Label>
                    <Select value={medForm.medicationIdx} onValueChange={handleMedSelect}>
                      <SelectTrigger><SelectValue placeholder="Select medication" /></SelectTrigger>
                      <SelectContent>
                        {NZ_MEDICATIONS.map((med, idx) => (
                          <SelectItem key={idx} value={String(idx)}>{med.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {interactions.length > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Drug Interaction Warning</AlertTitle>
                      <AlertDescription>
                        {interactions.map((i: any, idx: number) => (
                          <div key={idx} className="mt-1">
                            <span className="font-semibold capitalize">[{i.severity}]</span> {i.description}
                            <br /><span className="text-xs">{i.recommendation}</span>
                          </div>
                        ))}
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Dose</Label>
                      <Input value={medForm.dose} onChange={(e) => setMedForm({ ...medForm, dose: e.target.value })} />
                    </div>
                    <div>
                      <Label>Route</Label>
                      <Select value={medForm.route} onValueChange={(v) => setMedForm({ ...medForm, route: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
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
                    <Label>Frequency</Label>
                    <Select value={medForm.frequency} onValueChange={(v) => setMedForm({ ...medForm, frequency: v })}>
                      <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
                      <SelectContent>
                        {FREQUENCIES.map((f) => (
                          <SelectItem key={f.code} value={f.code}>{f.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Instructions</Label>
                    <Textarea placeholder="Additional instructions..." value={medForm.instructions} onChange={(e) => setMedForm({ ...medForm, instructions: e.target.value })} />
                  </div>
                  <Button onClick={prescribe} disabled={!medForm.medicationIdx || !medForm.frequency || prescribing} className="w-full bg-teal-700 hover:bg-teal-800">
                    {prescribing ? "Prescribing..." : "Prescribe"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {medications.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center text-gray-500">No medications prescribed for this patient.</CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {medications.map((med) => {
                const currentStepIdx = statusSteps.indexOf(med.status as (typeof statusSteps)[number]);
                return (
                  <Card key={med.id} className={`border-0 shadow-sm ${med.status === "discontinued" ? "opacity-60" : ""}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Pill className="h-4 w-4 text-teal-600" />
                          <span className="font-medium">{med.name}</span>
                          <Badge className={statusColors[med.status]}>{med.status}</Badge>
                        </div>
                        <span className="text-xs text-gray-400">{med.dose} · {med.route} · {med.frequency}</span>
                      </div>
                      {med.instructions && <p className="text-xs text-gray-500 mb-2">{med.instructions}</p>}
                      {med.status !== "discontinued" && (
                        <div className="status-pipeline mb-2">
                          {statusSteps.map((step, idx) => (
                            <div key={step} className={`status-step ${idx < currentStepIdx ? "active" : idx === currentStepIdx ? "current" : ""}`} title={step} />
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Prescribed by {med.prescriber.name} on {new Date(med.startDate).toLocaleDateString("en-NZ")}</span>
                        {med.status !== "discontinued" && med.status !== "administered" && (
                          <div className="flex gap-1">
                            {currentStepIdx < statusSteps.length - 1 && (
                              <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => updateMedStatus(med.id, statusSteps[currentStepIdx + 1])}>
                                Advance to {statusSteps[currentStepIdx + 1]}
                              </Button>
                            )}
                            <Button size="sm" variant="outline" className="text-xs h-7 text-red-600 border-red-200 hover:bg-red-50" onClick={() => updateMedStatus(med.id, "discontinued")}>
                              Discontinue
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Encounters Tab */}
        <TabsContent value="encounters" className="space-y-3">
          {activeEncounter && (
            <div className="flex justify-end mb-2">
              <Dialog open={dischargeDialogOpen} onOpenChange={(open) => { setDischargeDialogOpen(open); if (!open) setDischargeStep(0); }}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="text-orange-700 border-orange-300 hover:bg-orange-50">
                    Discharge Patient
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>
                      Discharge Workflow {dischargeStep > 0 && `(Step ${dischargeStep + 1}/5)`}
                    </DialogTitle>
                  </DialogHeader>

                  {/* Step 0: Confirm Diagnosis */}
                  {dischargeStep === 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Step 1: Confirm Diagnosis</h4>
                      <div>
                        <Label>Discharge Diagnosis</Label>
                        <Input
                          value={dischargeData.diagnosis || activeEncounter.diagnosis || ""}
                          onChange={(e) => setDischargeData({ ...dischargeData, diagnosis: e.target.value })}
                          placeholder="Final diagnosis"
                        />
                      </div>
                      <Button onClick={() => setDischargeStep(1)} className="w-full bg-teal-700 hover:bg-teal-800">
                        Next: Medications <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}

                  {/* Step 1: Medications on discharge */}
                  {dischargeStep === 1 && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Step 2: Medications on Discharge</h4>
                      <p className="text-sm text-gray-500">Select medications to continue after discharge:</p>
                      {activeMeds.length === 0 ? (
                        <p className="text-sm text-gray-400">No active medications.</p>
                      ) : (
                        <div className="space-y-2">
                          {activeMeds.map((med) => (
                            <div key={med.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                              <Switch
                                checked={dischargeData.continueMeds.includes(med.id)}
                                onCheckedChange={(v) => {
                                  setDischargeData({
                                    ...dischargeData,
                                    continueMeds: v
                                      ? [...dischargeData.continueMeds, med.id]
                                      : dischargeData.continueMeds.filter((id) => id !== med.id),
                                  });
                                }}
                              />
                              <div className="flex-1">
                                <span className="text-sm font-medium">{med.name}</span>
                                <span className="text-xs text-gray-400 ml-2">{med.dose} {med.frequency}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setDischargeStep(0)}>Back</Button>
                        <Button onClick={() => setDischargeStep(2)} className="flex-1 bg-teal-700 hover:bg-teal-800">
                          Next: Follow-up <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Follow-up */}
                  {dischargeStep === 2 && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Step 3: Follow-up Appointment</h4>
                      <div>
                        <Label>Follow-up Date</Label>
                        <Input type="date" value={dischargeData.followUpDate} onChange={(e) => setDischargeData({ ...dischargeData, followUpDate: e.target.value })} />
                      </div>
                      <div>
                        <Label>Department</Label>
                        <Input value={dischargeData.followUpDept} onChange={(e) => setDischargeData({ ...dischargeData, followUpDept: e.target.value })} placeholder="e.g., General Medicine" />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setDischargeStep(1)}>Back</Button>
                        <Button onClick={() => setDischargeStep(3)} className="flex-1 bg-teal-700 hover:bg-teal-800">
                          Next: ACC <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: ACC claim */}
                  {dischargeStep === 3 && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Step 4: ACC Claim Status</h4>
                      {patient.accClaimNumber ? (
                        <div>
                          <p className="text-sm text-gray-500 mb-2">ACC Claim: {patient.accClaimNumber} ({patient.accClaimStatus})</p>
                          <Label>Update Status</Label>
                          <Select value={dischargeData.accUpdate} onValueChange={(v) => setDischargeData({ ...dischargeData, accUpdate: v })}>
                            <SelectTrigger><SelectValue placeholder="No change" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">No change</SelectItem>
                              <SelectItem value="closed">Close claim</SelectItem>
                              <SelectItem value="review">Mark for review</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">No ACC claim associated with this patient.</p>
                      )}
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setDischargeStep(2)}>Back</Button>
                        <Button onClick={() => setDischargeStep(4)} className="flex-1 bg-teal-700 hover:bg-teal-800">
                          Next: Summary <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Summary */}
                  {dischargeStep === 4 && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Step 5: Discharge Summary</h4>
                      <Card className="bg-gray-50 border">
                        <CardContent className="p-4 space-y-2 text-sm">
                          <div><span className="font-medium">Patient:</span> {patient.firstName} {patient.lastName}</div>
                          <div><span className="font-medium">Diagnosis:</span> {dischargeData.diagnosis || activeEncounter.diagnosis || "Not specified"}</div>
                          <div><span className="font-medium">Continuing Medications:</span> {dischargeData.continueMeds.length > 0 ? activeMeds.filter((m) => dischargeData.continueMeds.includes(m.id)).map((m) => m.name).join(", ") : "None"}</div>
                          <div><span className="font-medium">Discontinued:</span> {activeMeds.filter((m) => !dischargeData.continueMeds.includes(m.id)).map((m) => m.name).join(", ") || "None"}</div>
                          {dischargeData.followUpDate && <div><span className="font-medium">Follow-up:</span> {dischargeData.followUpDate} {dischargeData.followUpDept && `- ${dischargeData.followUpDept}`}</div>}
                          {dischargeData.accUpdate && <div><span className="font-medium">ACC Update:</span> {dischargeData.accUpdate}</div>}
                        </CardContent>
                      </Card>
                      <div>
                        <Label>Additional Notes</Label>
                        <Textarea value={dischargeData.notes} onChange={(e) => setDischargeData({ ...dischargeData, notes: e.target.value })} placeholder="Discharge notes..." />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setDischargeStep(3)}>Back</Button>
                        <Button onClick={processDischarge} disabled={discharging} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white">
                          {discharging ? "Processing..." : "Confirm Discharge"}
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          )}

          {patient.encounters.map((enc: any) => (
            <Card key={enc.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className={enc.status === "in-progress" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>
                        {enc.status}
                      </Badge>
                      <span className="font-medium capitalize">{enc.type}</span>
                      <span className="text-sm text-gray-500">· {enc.department}</span>
                    </div>
                    {enc.diagnosis && <p className="text-sm mt-1">{enc.diagnosis}</p>}
                    {enc.diagnosisCode && <span className="text-xs text-gray-400">SNOMED: {enc.diagnosisCode}</span>}
                  </div>
                  <div className="text-right text-xs text-gray-400">
                    <div>Admitted: {new Date(enc.admitDate).toLocaleDateString("en-NZ")}</div>
                    {enc.dischargeDate && <div>Discharged: {new Date(enc.dischargeDate).toLocaleDateString("en-NZ")}</div>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Observations Tab */}
        <TabsContent value="observations">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 text-xs font-medium text-gray-500">Type</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500">Test</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500">Value</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500">Code</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {patient.observations.map((obs: any) => (
                    <tr key={obs.id} className="border-b last:border-0">
                      <td className="p-3">
                        <Badge variant="outline" className="text-xs capitalize">{obs.type.replace("-", " ")}</Badge>
                      </td>
                      <td className="p-3 text-sm font-medium">{obs.codeName}</td>
                      <td className="p-3 text-sm">{obs.value} {obs.unit}</td>
                      <td className="p-3 text-xs text-gray-400 font-mono">{obs.code}</td>
                      <td className="p-3 text-xs text-gray-400">{new Date(obs.effectiveDate).toLocaleDateString("en-NZ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-3">
          {patient.appointments.map((appt: any) => (
            <Card key={appt.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className={appt.status === "scheduled" ? "bg-blue-100 text-blue-800" : appt.status === "completed" ? "bg-green-100 text-green-800" : "bg-gray-100"}>
                        {appt.status}
                      </Badge>
                      <span className="font-medium capitalize">{appt.type}</span>
                      <span className="text-sm text-gray-500">· {appt.department}</span>
                    </div>
                    {appt.provider && <p className="text-sm text-gray-500 mt-1">Provider: {appt.provider.name}</p>}
                  </div>
                  <div className="text-right text-sm">
                    <div>{new Date(appt.dateTime).toLocaleDateString("en-NZ")}</div>
                    <div className="text-gray-400">{new Date(appt.dateTime).toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit" })} · {appt.duration}min</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Waitlist Tab */}
        <TabsContent value="waitlist" className="space-y-3">
          {patient.waitlistEntries.map((entry: any) => (
            <Card key={entry.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        entry.priority === "urgent" ? "bg-red-100 text-red-800" :
                        entry.priority === "semi-urgent" ? "bg-yellow-100 text-yellow-800" :
                        "bg-green-100 text-green-800"
                      }>
                        {entry.priority}
                      </Badge>
                      <span className="font-medium">{entry.procedure}</span>
                      <span className="text-sm text-gray-500">· {entry.department}</span>
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-400">
                    <div>Referred: {new Date(entry.referralDate).toLocaleDateString("en-NZ")}</div>
                    {entry.targetDate && <div>Target: {new Date(entry.targetDate).toLocaleDateString("en-NZ")}</div>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
