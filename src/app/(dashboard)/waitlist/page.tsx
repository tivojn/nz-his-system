"use client";

import { useEffect, useState, useMemo } from "react";
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
  Clock,
  Plus,
  AlertTriangle,
  CalendarClock,
  Users,
  Timer,
} from "lucide-react";
import { DEPARTMENTS } from "@/lib/constants";
import { useBilingual } from "@/components/bilingual-provider";

interface WaitlistEntry {
  id: string;
  department: string;
  priority: string;
  procedure: string | null;
  referralDate: string;
  targetDate: string | null;
  status: string;
  notes: string | null;
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

const priorityStyles: Record<string, { badge: string; border: string }> = {
  urgent: { badge: "bg-red-100 text-red-800", border: "border-l-red-500" },
  "semi-urgent": {
    badge: "bg-yellow-100 text-yellow-800",
    border: "border-l-yellow-500",
  },
  routine: {
    badge: "bg-green-100 text-green-800",
    border: "border-l-green-500",
  },
};

const statusColors: Record<string, string> = {
  waiting: "bg-blue-100 text-blue-800",
  scheduled: "bg-teal-100 text-teal-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function WaitlistPage() {
  const { t } = useBilingual();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("waiting");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    patientId: "",
    department: "",
    priority: "routine",
    procedure: "",
    targetDate: "",
    notes: "",
  });

  const fetchEntries = async () => {
    try {
      const res = await fetch("/api/waitlist");
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      console.error("Failed to fetch waitlist entries:", err);
    } finally {
      setLoading(false);
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
    fetchEntries();
    fetchPatients();
  }, []);

  // Stats computed from all entries
  const totalWaiting = entries.filter((e) => e.status === "waiting").length;
  const urgentCount = entries.filter(
    (e) => e.priority === "urgent" && e.status === "waiting"
  ).length;
  const avgWait = (() => {
    const waitingEntries = entries.filter((e) => e.status === "waiting");
    if (waitingEntries.length === 0) return 0;
    const totalDays = waitingEntries.reduce(
      (sum, e) =>
        sum + (Date.now() - new Date(e.referralDate).getTime()) / 86400000,
      0
    );
    return Math.round(totalDays / waitingEntries.length);
  })();
  const breachingTarget = entries.filter(
    (e) =>
      e.status === "waiting" &&
      e.targetDate &&
      new Date(e.targetDate).getTime() < Date.now()
  ).length;

  // Filtering
  const filtered = useMemo(() => {
    let result = entries;

    // Tab filter
    if (activeTab !== "all") {
      result = result.filter((e) => e.status === activeTab);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      result = result.filter((e) => e.priority === priorityFilter);
    }

    // Department filter
    if (deptFilter !== "all") {
      result = result.filter((e) => e.department === deptFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.patient.firstName.toLowerCase().includes(q) ||
          e.patient.lastName.toLowerCase().includes(q) ||
          e.patient.nhiNumber.toLowerCase().includes(q)
      );
    }

    return result;
  }, [entries, activeTab, priorityFilter, deptFilter, searchQuery]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/waitlist/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchEntries();
  };

  const updatePriority = async (id: string, priority: string) => {
    await fetch(`/api/waitlist/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority }),
    });
    fetchEntries();
  };

  const addToWaitlist = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: form.patientId,
          department: form.department,
          priority: form.priority,
          procedure: form.procedure || undefined,
          targetDate: form.targetDate
            ? new Date(form.targetDate).toISOString()
            : undefined,
          notes: form.notes || undefined,
        }),
      });
      setForm({
        patientId: "",
        department: "",
        priority: "routine",
        procedure: "",
        targetDate: "",
        notes: "",
      });
      setDialogOpen(false);
      fetchEntries();
    } catch (err) {
      console.error("Failed to add to waitlist:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Unique departments from entries for filter
  const departments = useMemo(() => {
    const depts = new Set(entries.map((e) => e.department));
    return Array.from(depts).sort();
  }, [entries]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="h-7 w-7 text-teal-600" />
            {t("Surgical Waitlist")}
          </h1>
          <p className="text-gray-500 mt-1">
            {totalWaiting} {t("patients waiting")}
          </p>
        </div>
        <Button
          className="bg-teal-700 hover:bg-teal-800"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          {t("Add to Waitlist")}
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-blue-500" />
              <p className="text-sm text-gray-500">
                {t("Total Waiting")}
              </p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalWaiting}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-gray-500">{t("Urgent")}</p>
            </div>
            <p className="text-2xl font-bold text-red-600">{urgentCount}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Timer className="h-4 w-4 text-amber-500" />
              <p className="text-sm text-gray-500">
                {t("Avg Wait (days)")}
              </p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{avgWait}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CalendarClock className="h-4 w-4 text-orange-500" />
              <p className="text-sm text-gray-500">
                {t("Breaching Target")}
              </p>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {breachingTarget}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="waiting">{t("Waiting")}</TabsTrigger>
          <TabsTrigger value="scheduled">{t("Scheduled")}</TabsTrigger>
          <TabsTrigger value="completed">{t("Completed")}</TabsTrigger>
          <TabsTrigger value="cancelled">{t("Cancelled")}</TabsTrigger>
          <TabsTrigger value="all">{t("All")}</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder={t("Search patient name or NHI...")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="sm:max-w-[180px]">
            <SelectValue placeholder={t("Priority")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All Priorities")}</SelectItem>
            <SelectItem value="urgent">{t("Urgent")}</SelectItem>
            <SelectItem value="semi-urgent">{t("Semi-urgent")}</SelectItem>
            <SelectItem value="routine">{t("Routine")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="sm:max-w-[200px]">
            <SelectValue placeholder={t("Department")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All Departments")}</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {t(dept)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Waitlist Cards */}
      <div className="space-y-3">
        {filtered.map((entry) => {
              const style =
                priorityStyles[entry.priority] || priorityStyles.routine;
              const daysWaiting = Math.floor(
                (Date.now() - new Date(entry.referralDate).getTime()) / 86400000
              );

              return (
                <Card
                  key={entry.id}
                  className={`border-0 shadow-sm border-l-4 ${style.border}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">
                            {entry.patient.firstName} {entry.patient.lastName}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-xs font-mono"
                          >
                            {entry.patient.nhiNumber}
                          </Badge>
                          {/* Inline priority change */}
                          <Select
                            value={entry.priority}
                            onValueChange={(val) =>
                              updatePriority(entry.id, val)
                            }
                          >
                            <SelectTrigger
                              size="sm"
                              className={`h-6 text-xs px-2 border-0 ${style.badge}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="urgent">
                                {t("Urgent")}
                              </SelectItem>
                              <SelectItem value="semi-urgent">
                                {t("Semi-urgent")}
                              </SelectItem>
                              <SelectItem value="routine">
                                {t("Routine")}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Badge
                            className={`text-xs capitalize ${statusColors[entry.status] || ""}`}
                          >
                            {t(entry.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {entry.procedure || "\u2014"} · {t(entry.department)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-2xl font-bold text-gray-900">
                          {daysWaiting}
                        </p>
                        <p className="text-xs text-gray-400">
                          {t("days waiting")}
                        </p>
                        {entry.targetDate && (
                          <p
                            className={`text-xs mt-1 ${
                              new Date(entry.targetDate).getTime() < Date.now()
                                ? "text-red-500 font-medium"
                                : "text-gray-500"
                            }`}
                          >
                            {t("Target:")}{" "}
                            {new Date(entry.targetDate).toLocaleDateString(
                              "en-NZ"
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      {entry.status === "waiting" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-teal-600 hover:bg-teal-700"
                            onClick={() => updateStatus(entry.id, "scheduled")}
                          >
                            {t("Schedule")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => updateStatus(entry.id, "cancelled")}
                          >
                            {t("Remove")}
                          </Button>
                        </>
                      )}
                      {entry.status === "scheduled" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => updateStatus(entry.id, "completed")}
                          >
                            {t("Complete")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(entry.id, "waiting")}
                          >
                            {t("Back to Waiting")}
                          </Button>
                        </>
                      )}
                      {entry.status === "cancelled" && (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => updateStatus(entry.id, "waiting")}
                        >
                          {t("Restore")}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filtered.length === 0 && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-8 text-center">
                  <Clock className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium">
                    {t("No waitlist entries found")}
                  </p>
                  <p className="text-sm text-gray-300 mt-1">
                    {t("Try adjusting your filters or add a new entry")}
                  </p>
                </CardContent>
              </Card>
            )}
      </div>

      {/* Add to Waitlist Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Add to Waitlist")}</DialogTitle>
            <DialogDescription>
              {t("Add a patient to the surgical waitlist")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("Patient")}</Label>
              <Select
                value={form.patientId}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, patientId: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("Select patient...")} />
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
              <Label>{t("Department")}</Label>
              <Select
                value={form.department}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, department: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("Select department...")} />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {t(dept)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("Priority")}</Label>
              <Select
                value={form.priority}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, priority: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">{t("Urgent")}</SelectItem>
                  <SelectItem value="semi-urgent">
                    {t("Semi-urgent")}
                  </SelectItem>
                  <SelectItem value="routine">{t("Routine")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("Procedure")}</Label>
              <Input
                placeholder={t("e.g. Hip replacement")}
                value={form.procedure}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, procedure: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t("Target Date")}</Label>
              <Input
                type="date"
                value={form.targetDate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, targetDate: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t("Notes")}</Label>
              <Textarea
                placeholder={t("Additional notes...")}
                value={form.notes}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, notes: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("Cancel")}
            </Button>
            <Button
              className="bg-teal-700 hover:bg-teal-800"
              disabled={!form.patientId || !form.department || submitting}
              onClick={addToWaitlist}
            >
              {submitting ? t("Adding...") : t("Add to Waitlist")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
