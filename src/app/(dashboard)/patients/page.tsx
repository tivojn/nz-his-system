"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Plus, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBilingual } from "@/components/bilingual-provider";

interface Patient {
  id: string;
  nhiNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  ethnicity: string;
  iwi: string | null;
  phone: string | null;
  status: string;
  accClaimStatus: string | null;
  encounters: { type: string; status: string; department: string }[];
  _count: { appointments: number; notes: number };
}

const ethnicityColors: Record<string, string> = {
  "Māori": "bg-green-100 text-green-800",
  "NZ European": "bg-blue-100 text-blue-800",
  "Pacific Islander": "bg-purple-100 text-purple-800",
  "Asian": "bg-orange-100 text-orange-800",
  "Other": "bg-gray-100 text-gray-800",
};

export default function PatientsPage() {
  const { t } = useBilingual();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [filterEthnicity, setFilterEthnicity] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    nhiNumber: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "male",
    ethnicity: "NZ European",
  });

  const fetchPatients = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterEthnicity) params.set("ethnicity", filterEthnicity);
    fetch(`/api/patients?${params}`).then((r) => r.json()).then(setPatients);
  };

  useEffect(() => {
    fetchPatients();
  }, [search, filterEthnicity]);

  const handleCreate = async () => {
    await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newPatient, dateOfBirth: new Date(newPatient.dateOfBirth).toISOString() }),
    });
    setDialogOpen(false);
    setNewPatient({ nhiNumber: "", firstName: "", lastName: "", dateOfBirth: "", gender: "male", ethnicity: "NZ European" });
    fetchPatients();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-7 w-7 text-teal-600" />
            {t("Patient Management")}
          </h1>
          <p className="text-gray-500 mt-1">{t("NHI-based patient registry")}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-700 hover:bg-teal-800">
              <Plus className="h-4 w-4 mr-2" /> {t("Register Patient")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("Register New Patient")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("NHI Number")}</Label>
                  <Input placeholder="ABC1234" value={newPatient.nhiNumber} onChange={(e) => setNewPatient({ ...newPatient, nhiNumber: e.target.value })} />
                </div>
                <div>
                  <Label>{t("Date of Birth")}</Label>
                  <Input type="date" value={newPatient.dateOfBirth} onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("First Name")}</Label>
                  <Input value={newPatient.firstName} onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })} />
                </div>
                <div>
                  <Label>{t("Last Name")}</Label>
                  <Input value={newPatient.lastName} onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("Gender")}</Label>
                  <Select value={newPatient.gender} onValueChange={(v) => setNewPatient({ ...newPatient, gender: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t("Male")}</SelectItem>
                      <SelectItem value="female">{t("Female")}</SelectItem>
                      <SelectItem value="other">{t("Other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("Ethnicity")}</Label>
                  <Select value={newPatient.ethnicity} onValueChange={(v) => setNewPatient({ ...newPatient, ethnicity: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NZ European">{t("NZ European")}</SelectItem>
                      <SelectItem value="Māori">{t("Māori")}</SelectItem>
                      <SelectItem value="Pacific Islander">{t("Pacific Islander")}</SelectItem>
                      <SelectItem value="Asian">{t("Asian")}</SelectItem>
                      <SelectItem value="Other">{t("Other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full bg-teal-700 hover:bg-teal-800">{t("Register Patient")}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t("Search patients...")}
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterEthnicity} onValueChange={setFilterEthnicity}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t("All Ethnicities")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All Ethnicities")}</SelectItem>
            <SelectItem value="Māori">{t("Māori")}</SelectItem>
            <SelectItem value="NZ European">{t("NZ European")}</SelectItem>
            <SelectItem value="Pacific Islander">{t("Pacific Islander")}</SelectItem>
            <SelectItem value="Asian">{t("Asian")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Patient List */}
      <div className="space-y-3">
        {patients.map((patient) => (
          <Link key={patient.id} href={`/patients/${patient.id}`}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                      <span className="text-teal-700 font-bold text-lg">
                        {patient.firstName[0]}{patient.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <Badge variant="outline" className="text-xs font-mono">
                          {patient.nhiNumber}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span>{new Date(patient.dateOfBirth).toLocaleDateString("en-NZ")}</span>
                        <span className="capitalize">{patient.gender}</span>
                        <Badge className={`text-xs ${ethnicityColors[patient.ethnicity] || "bg-gray-100"}`}>
                          {patient.ethnicity}
                        </Badge>
                        {patient.accClaimStatus && (
                          <Badge variant="outline" className="text-xs">
                            ACC: {patient.accClaimStatus}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-xs text-gray-400">
                      <div>{patient._count.notes} {t("notes")}</div>
                      <div>{patient._count.appointments} {t("appts")}</div>
                    </div>
                    {patient.encounters[0] && (
                      <Badge className={patient.encounters[0].status === "in-progress" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>
                        {patient.encounters[0].status === "in-progress" ? t("Admitted") : t("Discharged")}
                      </Badge>
                    )}
                    <ChevronRight className="h-5 w-5 text-gray-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {patients.length === 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center text-gray-400">
              {t("No patients found")}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
