"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Plus, DollarSign, ChevronDown, ChevronRight, Calendar } from "lucide-react";
import { ACC_CLAIM_TYPES } from "@/lib/constants";

interface ACCClaimEvent {
  id: string;
  type: string;
  description: string;
  cost: number;
  eventDate: string;
}

interface ACCClaim {
  id: string;
  claimNumber: string;
  injuryDate: string;
  injuryDescription: string;
  injuryCode: string | null;
  claimType: string;
  status: string;
  totalCost: number;
  patient: { firstName: string; lastName: string; nhiNumber: string };
  events: ACCClaimEvent[];
}

interface PatientOption {
  id: string;
  firstName: string;
  lastName: string;
  nhiNumber: string;
}

const statusColors: Record<string, string> = {
  lodged: "bg-blue-100 text-blue-800",
  accepted: "bg-emerald-100 text-emerald-800",
  declined: "bg-red-100 text-red-800",
  closed: "bg-gray-100 text-gray-800",
  review: "bg-amber-100 text-amber-800",
};

const typeColors: Record<string, string> = {
  work: "bg-orange-100 text-orange-800",
  "motor-vehicle": "bg-purple-100 text-purple-800",
  sport: "bg-green-100 text-green-800",
  home: "bg-blue-100 text-blue-800",
  assault: "bg-red-100 text-red-800",
};

const eventTypeColors: Record<string, string> = {
  lodged: "bg-blue-500",
  assessment: "bg-teal-500",
  treatment: "bg-emerald-500",
  review: "bg-amber-500",
  payment: "bg-green-500",
  closed: "bg-gray-500",
};

export default function ACCPage() {
  const [claims, setClaims] = useState<ACCClaim[]>([]);
  const [tab, setTab] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [form, setForm] = useState({
    patientId: "",
    injuryDate: "",
    injuryDescription: "",
    injuryCode: "",
    claimType: "",
  });

  useEffect(() => {
    fetchClaims();
    fetch("/api/patients")
      .then((r) => r.json())
      .then((data: PatientOption[]) => setPatients(data));
  }, []);

  function fetchClaims() {
    const params = tab !== "all" ? `?status=${tab}` : "";
    fetch(`/api/acc${params}`)
      .then((r) => r.json())
      .then(setClaims);
  }

  useEffect(() => {
    fetchClaims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/acc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setDialogOpen(false);
      setForm({ patientId: "", injuryDate: "", injuryDescription: "", injuryCode: "", claimType: "" });
      fetchClaims();
    }
  }

  const totalCosts = claims.reduce((sum, c) => sum + c.totalCost, 0);
  const costByType: Record<string, number> = {};
  for (const c of claims) {
    costByType[c.claimType] = (costByType[c.claimType] || 0) + c.totalCost;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-7 w-7 text-teal-600" />
            ACC Claims — Kereme ACC
          </h1>
          <p className="text-gray-500 mt-1">
            Accident Compensation Corporation claim management — {claims.length} claims
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Plus className="h-4 w-4 mr-2" />
              New Claim
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Lodge New ACC Claim</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Patient</Label>
                <Select value={form.patientId} onValueChange={(v) => setForm({ ...form, patientId: v })}>
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
              <div className="space-y-2">
                <Label>Injury Date</Label>
                <Input
                  type="date"
                  value={form.injuryDate}
                  onChange={(e) => setForm({ ...form, injuryDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Injury Description</Label>
                <Textarea
                  value={form.injuryDescription}
                  onChange={(e) => setForm({ ...form, injuryDescription: e.target.value })}
                  required
                  placeholder="Describe the injury..."
                />
              </div>
              <div className="space-y-2">
                <Label>Injury Code (optional)</Label>
                <Input
                  value={form.injuryCode}
                  onChange={(e) => setForm({ ...form, injuryCode: e.target.value })}
                  placeholder="ACC injury code"
                />
              </div>
              <div className="space-y-2">
                <Label>Claim Type</Label>
                <Select value={form.claimType} onValueChange={(v) => setForm({ ...form, claimType: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select claim type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACC_CLAIM_TYPES.map((t) => (
                      <SelectItem key={t.code} value={t.code}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
                Lodge Claim
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cost Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-teal-600" />
              <p className="text-sm text-gray-500">Total Claim Costs</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ${totalCosts.toLocaleString("en-NZ", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Active Claims</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {claims.filter((c) => c.status === "lodged" || c.status === "accepted").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Cost by Type</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(costByType).map(([type, cost]) => (
                <Badge key={type} variant="outline" className="text-xs">
                  {type}: ${cost.toLocaleString("en-NZ", { minimumFractionDigits: 0 })}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Claims List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Claims</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="lodged">Lodged</TabsTrigger>
              <TabsTrigger value="accepted">Accepted</TabsTrigger>
              <TabsTrigger value="declined">Declined</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
            </TabsList>
            <TabsContent value={tab} className="mt-4 space-y-3">
              {claims.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No claims found</p>
              )}
              {claims.map((claim) => {
                const isExpanded = expandedId === claim.id;
                return (
                  <div key={claim.id} className="border rounded-lg overflow-hidden">
                    <button
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 text-left"
                      onClick={() => setExpandedId(isExpanded ? null : claim.id)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm font-medium">{claim.claimNumber}</span>
                            <span className="text-sm text-gray-600">
                              {claim.patient.firstName} {claim.patient.lastName}
                            </span>
                            <Badge className={`text-xs capitalize ${typeColors[claim.claimType] || "bg-gray-100"}`}>
                              {claim.claimType}
                            </Badge>
                            <Badge className={`text-xs capitalize ${statusColors[claim.status] || "bg-gray-100"}`}>
                              {claim.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(claim.injuryDate).toLocaleDateString("en-NZ")}
                            </span>
                            <span>{claim.injuryDescription}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="font-semibold">
                          ${claim.totalCost.toLocaleString("en-NZ", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t bg-gray-50 p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                          <div>
                            <p className="text-gray-400">NHI</p>
                            <p className="font-mono">{claim.patient.nhiNumber}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Injury Code</p>
                            <p>{claim.injuryCode || "—"}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Claim Type</p>
                            <p className="capitalize">{claim.claimType}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Total Cost</p>
                            <p className="font-semibold">
                              ${claim.totalCost.toLocaleString("en-NZ", { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>

                        {/* Event Timeline */}
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Claim Events</h4>
                        <div className="relative pl-6">
                          <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200" />
                          {claim.events.map((event, idx) => {
                            const runningCost = claim.events
                              .slice(0, idx + 1)
                              .reduce((sum, e) => sum + e.cost, 0);
                            return (
                              <div key={event.id} className="relative mb-4 last:mb-0">
                                <div
                                  className={`absolute -left-4 top-1.5 w-3 h-3 rounded-full border-2 border-white ${
                                    eventTypeColors[event.type] || "bg-gray-400"
                                  }`}
                                />
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs capitalize">
                                        {event.type}
                                      </Badge>
                                      <span className="text-xs text-gray-400">
                                        {new Date(event.eventDate).toLocaleDateString("en-NZ")}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                                  </div>
                                  <div className="text-right text-sm shrink-0 ml-4">
                                    {event.cost > 0 && (
                                      <p className="font-medium">
                                        ${event.cost.toLocaleString("en-NZ", { minimumFractionDigits: 2 })}
                                      </p>
                                    )}
                                    <p className="text-xs text-gray-400">
                                      Running: ${runningCost.toLocaleString("en-NZ", { minimumFractionDigits: 2 })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
