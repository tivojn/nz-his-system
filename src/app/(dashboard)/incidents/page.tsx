"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  AlertTriangle,
  Plus,
  Search,
  Shield,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  MapPin,
  User,
} from "lucide-react";
import { useBilingual } from "@/components/bilingual-provider";

interface IncidentReport {
  id: string;
  incidentNumber: string;
  type: string;
  severity: string;
  location: string;
  dateTime: string;
  description: string;
  immediateAction: string | null;
  rootCause: string | null;
  outcome: string | null;
  preventiveMeasures: string | null;
  status: string;
  patient: { firstName: string; lastName: string; nhiNumber: string } | null;
  reportedBy: { id: string; name: string; role: string };
  createdAt: string;
}

interface PatientOption {
  id: string;
  firstName: string;
  lastName: string;
  nhiNumber: string;
}

const INCIDENT_TYPES = [
  "fall",
  "medication-error",
  "adverse-reaction",
  "equipment-failure",
  "near-miss",
  "other",
];

const SEVERITIES = ["none", "minor", "moderate", "major", "catastrophic"];

const STATUSES = ["reported", "investigating", "resolved", "closed"];

const typeLabels: Record<string, string> = {
  fall: "Fall",
  "medication-error": "Medication Error",
  "adverse-reaction": "Adverse Reaction",
  "equipment-failure": "Equipment Failure",
  "near-miss": "Near Miss",
  other: "Other",
};

const typeColors: Record<string, string> = {
  fall: "bg-orange-100 text-orange-800",
  "medication-error": "bg-red-100 text-red-800",
  "adverse-reaction": "bg-purple-100 text-purple-800",
  "equipment-failure": "bg-yellow-100 text-yellow-800",
  "near-miss": "bg-blue-100 text-blue-800",
  other: "bg-gray-100 text-gray-800",
};

const severityColors: Record<string, string> = {
  none: "bg-gray-100 text-gray-700",
  minor: "bg-yellow-100 text-yellow-800",
  moderate: "bg-orange-100 text-orange-800",
  major: "bg-red-100 text-red-800",
  catastrophic: "bg-red-200 text-red-900 animate-pulse",
};

const statusColors: Record<string, string> = {
  reported: "bg-blue-100 text-blue-800",
  investigating: "bg-amber-100 text-amber-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
};

function getSession() {
  const match = document.cookie.match(/nzhis-session=([^;]+)/);
  if (!match) return null;
  try {
    return JSON.parse(atob(decodeURIComponent(match[1])));
  } catch {
    return null;
  }
}

export default function IncidentsPage() {
  const { t } = useBilingual();

  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Detail dialogs for root cause / outcome
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailMode, setDetailMode] = useState<"rootCause" | "resolve">("rootCause");
  const [detailIncident, setDetailIncident] = useState<IncidentReport | null>(null);
  const [detailText, setDetailText] = useState("");
  const [outcomeText, setOutcomeText] = useState("");
  const [preventiveText, setPreventiveText] = useState("");

  const [form, setForm] = useState({
    type: "fall",
    severity: "minor",
    location: "",
    dateTime: "",
    patientId: "",
    description: "",
    immediateAction: "",
  });

  const session = typeof window !== "undefined" ? getSession() : null;

  const fetchIncidents = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (severityFilter !== "all") params.set("severity", severityFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/incidents?${params}`);
      const data = await res.json();
      setIncidents(data);
    } catch (err) {
      console.error("Failed to fetch incidents:", err);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, severityFilter, statusFilter]);

  const fetchPatients = useCallback(async () => {
    try {
      const res = await fetch("/api/patients");
      const data = await res.json();
      setPatients(data);
    } catch (err) {
      console.error("Failed to fetch patients:", err);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
    fetchPatients();
  }, [fetchIncidents, fetchPatients]);

  // Stats
  const openCount = useMemo(
    () => incidents.filter((i) => i.status === "reported").length,
    [incidents]
  );
  const investigatingCount = useMemo(
    () => incidents.filter((i) => i.status === "investigating").length,
    [incidents]
  );
  const majorCount = useMemo(
    () =>
      incidents.filter(
        (i) => i.severity === "major" || i.severity === "catastrophic"
      ).length,
    [incidents]
  );
  const resolvedThisMonth = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return incidents.filter(
      (i) =>
        i.status === "resolved" && new Date(i.createdAt) >= monthStart
    ).length;
  }, [incidents]);

  const submitIncident = async () => {
    if (!session) return;
    setSubmitting(true);
    try {
      await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          reportedById: session.id,
          patientId: form.patientId || undefined,
          dateTime: new Date(form.dateTime).toISOString(),
        }),
      });
      setForm({
        type: "fall",
        severity: "minor",
        location: "",
        dateTime: "",
        patientId: "",
        description: "",
        immediateAction: "",
      });
      setDialogOpen(false);
      fetchIncidents();
    } catch (err) {
      console.error("Failed to create incident:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const updateIncidentStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/incidents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchIncidents();
    } catch (err) {
      console.error("Failed to update incident:", err);
    }
  };

  const openDetailDialog = (incident: IncidentReport, mode: "rootCause" | "resolve") => {
    setDetailIncident(incident);
    setDetailMode(mode);
    setDetailText(incident.rootCause || "");
    setOutcomeText(incident.outcome || "");
    setPreventiveText(incident.preventiveMeasures || "");
    setDetailDialogOpen(true);
  };

  const submitDetail = async () => {
    if (!detailIncident) return;
    setSubmitting(true);
    try {
      const body: Record<string, string> = {};
      if (detailMode === "rootCause") {
        body.rootCause = detailText;
      } else {
        body.status = "resolved";
        body.outcome = outcomeText;
        body.preventiveMeasures = preventiveText;
        if (detailText) body.rootCause = detailText;
      }
      await fetch(`/api/incidents/${detailIncident.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setDetailDialogOpen(false);
      fetchIncidents();
    } catch (err) {
      console.error("Failed to update incident:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-7 w-7 text-teal-600" />
            {t("Incident Reports")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("Track and manage clinical incidents and near-misses")}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-700 hover:bg-teal-800">
              <Plus className="h-4 w-4 mr-2" />
              {t("New Incident Report")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>{t("Report New Incident")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              {/* Type + Severity */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("Type")}</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) => setForm({ ...form, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INCIDENT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {t(typeLabels[type])}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("Severity")}</Label>
                  <Select
                    value={form.severity}
                    onValueChange={(v) => setForm({ ...form, severity: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SEVERITIES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {t(s.charAt(0).toUpperCase() + s.slice(1))}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label>{t("Location")}</Label>
                <Input
                  placeholder={t("Ward / department where incident occurred")}
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>

              {/* Date & Time */}
              <div className="space-y-2">
                <Label>{t("Date & Time")}</Label>
                <Input
                  type="datetime-local"
                  value={form.dateTime}
                  onChange={(e) => setForm({ ...form, dateTime: e.target.value })}
                />
              </div>

              {/* Patient (optional) */}
              <div className="space-y-2">
                <Label>
                  {t("Patient")} <span className="text-gray-400 text-xs">({t("optional")})</span>
                </Label>
                <Select
                  value={form.patientId}
                  onValueChange={(v) => setForm({ ...form, patientId: v === "none" ? "" : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select patient")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("None")}</SelectItem>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.firstName} {p.lastName} ({p.nhiNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>{t("Description")}</Label>
                <Textarea
                  placeholder={t("Describe the incident in detail...")}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Immediate Action */}
              <div className="space-y-2">
                <Label>{t("Immediate Action Taken")}</Label>
                <Textarea
                  placeholder={t("What was done immediately after the incident?")}
                  value={form.immediateAction}
                  onChange={(e) =>
                    setForm({ ...form, immediateAction: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <Button
                className="w-full bg-teal-700 hover:bg-teal-800"
                onClick={submitIncident}
                disabled={
                  submitting ||
                  !form.location ||
                  !form.dateTime ||
                  !form.description
                }
              >
                {submitting ? t("Submitting...") : t("Submit Incident Report")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{openCount}</p>
                <p className="text-xs text-gray-500">{t("Open Incidents")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Search className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {investigatingCount}
                </p>
                <p className="text-xs text-gray-500">
                  {t("Under Investigation")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{majorCount}</p>
                <p className="text-xs text-gray-500">
                  {t("Major / Catastrophic")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {resolvedThisMonth}
                </p>
                <p className="text-xs text-gray-500">
                  {t("Resolved This Month")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={t("Type")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All Types")}</SelectItem>
            {INCIDENT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {t(typeLabels[type])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={t("Severity")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All Severities")}</SelectItem>
            {SEVERITIES.map((s) => (
              <SelectItem key={s} value={s}>
                {t(s.charAt(0).toUpperCase() + s.slice(1))}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={t("Status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All Statuses")}</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {t(s.charAt(0).toUpperCase() + s.slice(1))}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Incident Cards */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">
          <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
          <p>{t("Loading...")}</p>
        </div>
      ) : incidents.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center text-gray-400">
            {t("No incidents found")}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {incidents.map((incident) => {
            const isExpanded = expandedId === incident.id;
            return (
              <Card key={incident.id} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  {/* Main row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-semibold text-gray-700">
                          {incident.incidentNumber}
                        </span>
                        <Badge className={typeColors[incident.type] || "bg-gray-100 text-gray-800"}>
                          {t(typeLabels[incident.type] || incident.type)}
                        </Badge>
                        <Badge className={severityColors[incident.severity] || "bg-gray-100"}>
                          {t(incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1))}
                        </Badge>
                        <Badge className={statusColors[incident.status] || "bg-gray-100"}>
                          {t(incident.status.charAt(0).toUpperCase() + incident.status.slice(1))}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {incident.location}
                        </span>
                        <span>
                          {new Date(incident.dateTime).toLocaleString("en-NZ", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                        {incident.patient && (
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {incident.patient.firstName} {incident.patient.lastName}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {incident.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : incident.id)
                        }
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">
                          {t("Description")}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          {incident.description}
                        </p>
                      </div>
                      {incident.immediateAction && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase">
                            {t("Immediate Action Taken")}
                          </p>
                          <p className="text-sm text-gray-700 mt-1">
                            {incident.immediateAction}
                          </p>
                        </div>
                      )}
                      {incident.rootCause && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase">
                            {t("Root Cause")}
                          </p>
                          <p className="text-sm text-gray-700 mt-1">
                            {incident.rootCause}
                          </p>
                        </div>
                      )}
                      {incident.outcome && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase">
                            {t("Outcome")}
                          </p>
                          <p className="text-sm text-gray-700 mt-1">
                            {incident.outcome}
                          </p>
                        </div>
                      )}
                      {incident.preventiveMeasures && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase">
                            {t("Preventive Measures")}
                          </p>
                          <p className="text-sm text-gray-700 mt-1">
                            {incident.preventiveMeasures}
                          </p>
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                        {t("Reported by")}: {incident.reportedBy.name} ({incident.reportedBy.role})
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {incident.status === "reported" && (
                          <Button
                            size="sm"
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                            onClick={() =>
                              updateIncidentStatus(incident.id, "investigating")
                            }
                          >
                            {t("Investigate")}
                          </Button>
                        )}
                        {(incident.status === "reported" ||
                          incident.status === "investigating") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDetailDialog(incident, "rootCause")}
                          >
                            {t("Add Root Cause")}
                          </Button>
                        )}
                        {incident.status === "investigating" && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => openDetailDialog(incident, "resolve")}
                          >
                            {t("Resolve")}
                          </Button>
                        )}
                        {incident.status === "resolved" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              updateIncidentStatus(incident.id, "closed")
                            }
                          >
                            {t("Close")}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Root Cause / Resolve Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>
              {detailMode === "rootCause"
                ? t("Add Root Cause")
                : t("Resolve Incident")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {detailIncident && (
              <p className="text-sm text-gray-500">
                {detailIncident.incidentNumber} &mdash;{" "}
                {t(typeLabels[detailIncident.type] || detailIncident.type)}
              </p>
            )}
            <div className="space-y-2">
              <Label>{t("Root Cause")}</Label>
              <Textarea
                placeholder={t("Describe the root cause...")}
                value={detailText}
                onChange={(e) => setDetailText(e.target.value)}
                rows={3}
              />
            </div>
            {detailMode === "resolve" && (
              <>
                <div className="space-y-2">
                  <Label>{t("Outcome")}</Label>
                  <Textarea
                    placeholder={t("Describe the outcome...")}
                    value={outcomeText}
                    onChange={(e) => setOutcomeText(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("Preventive Measures")}</Label>
                  <Textarea
                    placeholder={t("What measures will prevent recurrence?")}
                    value={preventiveText}
                    onChange={(e) => setPreventiveText(e.target.value)}
                    rows={2}
                  />
                </div>
              </>
            )}
            <Button
              className="w-full bg-teal-700 hover:bg-teal-800"
              onClick={submitDetail}
              disabled={submitting || !detailText}
            >
              {submitting ? t("Submitting...") : t("Save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
