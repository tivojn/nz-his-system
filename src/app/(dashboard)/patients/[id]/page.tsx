"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  User,
  FileText,
  Calendar,
  Activity,
  FlaskConical,
  ArrowLeft,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

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

export default function PatientDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [newNote, setNewNote] = useState({ subjective: "", objective: "", assessment: "", plan: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/patients/${params.id}`).then((r) => r.json()).then(setPatient);
  }, [params.id]);

  const saveNote = async () => {
    setSaving(true);
    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: patient!.id,
        authorId: (session?.user as any)?.id,
        type: "soap",
        ...newNote,
      }),
    });
    setNewNote({ subjective: "", objective: "", assessment: "", plan: "" });
    // Refresh
    const updated = await fetch(`/api/patients/${params.id}`).then((r) => r.json());
    setPatient(updated);
    setSaving(false);
  };

  if (!patient) return <div className="animate-pulse text-gray-400 p-8">Loading patient...</div>;

  const age = Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 86400000));

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
          <div><span className="text-gray-500">Phone</span><p className="font-medium">{patient.phone || "—"}</p></div>
          <div><span className="text-gray-500">Email</span><p className="font-medium">{patient.email || "—"}</p></div>
          <div><span className="text-gray-500">Address</span><p className="font-medium">{patient.address ? `${patient.address}, ${patient.city}` : "—"}</p></div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="notes" className="space-y-4">
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="notes" className="gap-1"><FileText className="h-4 w-4" /> Notes ({patient.notes.length})</TabsTrigger>
          <TabsTrigger value="encounters" className="gap-1"><Activity className="h-4 w-4" /> Encounters ({patient.encounters.length})</TabsTrigger>
          <TabsTrigger value="observations" className="gap-1"><FlaskConical className="h-4 w-4" /> Labs & Vitals ({patient.observations.length})</TabsTrigger>
          <TabsTrigger value="appointments" className="gap-1"><Calendar className="h-4 w-4" /> Appointments ({patient.appointments.length})</TabsTrigger>
          <TabsTrigger value="waitlist" className="gap-1"><Clock className="h-4 w-4" /> Waitlist ({patient.waitlistEntries.length})</TabsTrigger>
        </TabsList>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          {/* New SOAP Note */}
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-lg">New SOAP Note</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs font-medium text-gray-500">SUBJECTIVE</Label>
                <Textarea placeholder="Patient's complaint and history..." value={newNote.subjective} onChange={(e) => setNewNote({ ...newNote, subjective: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-500">OBJECTIVE</Label>
                <Textarea placeholder="Examination findings, vitals, results..." value={newNote.objective} onChange={(e) => setNewNote({ ...newNote, objective: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-500">ASSESSMENT</Label>
                <Textarea placeholder="Diagnosis and clinical reasoning..." value={newNote.assessment} onChange={(e) => setNewNote({ ...newNote, assessment: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-500">PLAN</Label>
                <Textarea placeholder="Treatment plan, medications, follow-up..." value={newNote.plan} onChange={(e) => setNewNote({ ...newNote, plan: e.target.value })} className="mt-1" />
              </div>
              <Button onClick={saveNote} disabled={saving} className="bg-teal-700 hover:bg-teal-800">
                {saving ? "Saving..." : "Save Note"}
              </Button>
            </CardContent>
          </Card>

          {/* Existing Notes */}
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
                {note.subjective && <div className="mb-2"><span className="text-xs font-bold text-gray-400">S:</span> <span className="text-sm">{note.subjective}</span></div>}
                {note.objective && <div className="mb-2"><span className="text-xs font-bold text-gray-400">O:</span> <span className="text-sm">{note.objective}</span></div>}
                {note.assessment && <div className="mb-2"><span className="text-xs font-bold text-gray-400">A:</span> <span className="text-sm">{note.assessment}</span></div>}
                {note.plan && <div><span className="text-xs font-bold text-gray-400">P:</span> <span className="text-sm">{note.plan}</span></div>}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Encounters Tab */}
        <TabsContent value="encounters" className="space-y-3">
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
