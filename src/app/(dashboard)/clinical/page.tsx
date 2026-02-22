"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Patient {
  id: string;
  nhiNumber: string;
  firstName: string;
  lastName: string;
  ethnicity: string;
  encounters: { status: string; department: string; diagnosis: string }[];
  _count: { notes: number };
}

export default function ClinicalPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`/api/patients?search=${search}`).then((r) => r.json()).then(setPatients);
  }, [search]);

  // Show patients with active encounters first
  const sorted = [...patients].sort((a, b) => {
    const aActive = a.encounters.some((e) => e.status === "in-progress") ? 1 : 0;
    const bActive = b.encounters.some((e) => e.status === "in-progress") ? 1 : 0;
    return bActive - aActive;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="h-7 w-7 text-teal-600" />
          Clinical EMR
        </h1>
        <p className="text-gray-500 mt-1">Electronic Medical Records — Select a patient to view or create notes</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="Search patients..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid gap-3">
        {sorted.map((patient) => {
          const activeEnc = patient.encounters.find((e) => e.status === "in-progress");
          return (
            <Link key={patient.id} href={`/patients/${patient.id}`}>
              <Card className={`border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${activeEnc ? "border-l-4 border-l-green-500" : ""}`}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <span className="text-teal-700 font-bold">{patient.firstName[0]}{patient.lastName[0]}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{patient.firstName} {patient.lastName}</span>
                        <Badge variant="outline" className="text-xs font-mono">{patient.nhiNumber}</Badge>
                      </div>
                      {activeEnc && (
                        <p className="text-sm text-gray-500">{activeEnc.department} — {activeEnc.diagnosis}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeEnc && <Badge className="bg-green-100 text-green-800">Admitted</Badge>}
                    <span className="text-sm text-gray-400">{patient._count.notes} notes</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
