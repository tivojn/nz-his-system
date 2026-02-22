"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Calendar,
  Plus,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useBilingual } from "@/components/bilingual-provider";
import {
  DEPARTMENTS,
  APPOINTMENT_TYPES,
  APPOINTMENT_DURATIONS,
} from "@/lib/constants";

interface Appointment {
  id: string;
  dateTime: string;
  duration: number;
  type: string;
  department: string;
  status: string;
  notes: string | null;
  patient: { firstName: string; lastName: string; nhiNumber: string };
  provider: { name: string } | null;
}

interface PatientOption {
  id: string;
  firstName: string;
  lastName: string;
  nhiNumber: string;
}

interface ProviderOption {
  id: string;
  name: string;
  role: string;
  department: string | null;
}

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  "checked-in": "bg-teal-100 text-teal-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  "no-show": "bg-gray-100 text-gray-800",
};

export default function AppointmentsPage() {
  const { t } = useBilingual();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [providers, setProviders] = useState<ProviderOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    patientId: "",
    providerId: "",
    dateTime: "",
    duration: "30",
    type: "consultation",
    department: "",
    notes: "",
  });

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPatients = useCallback(async () => {
    try {
      const res = await fetch("/api/patients");
      const data = await res.json();
      setPatients(data);
    } catch (err) {
      console.error("Failed to fetch patients:", err);
    }
  }, []);

  const fetchProviders = useCallback(async () => {
    try {
      const res = await fetch("/api/users?role=doctor");
      const data = await res.json();
      setProviders(data);
    } catch (err) {
      console.error("Failed to fetch providers:", err);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
    fetchProviders();
  }, [fetchAppointments, fetchPatients, fetchProviders]);

  // --- Filtering ---
  const filtered = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let result = appointments;

    // Tab filter
    if (activeTab === "today") {
      result = result.filter((a) => {
        const d = new Date(a.dateTime);
        return d >= today && d < tomorrow;
      });
    } else if (activeTab === "upcoming") {
      result = result.filter((a) => new Date(a.dateTime) >= tomorrow);
    } else if (activeTab === "past") {
      result = result.filter((a) => new Date(a.dateTime) < today);
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((a) => a.status === statusFilter);
    }

    // Department filter
    if (deptFilter !== "all") {
      result = result.filter((a) => a.department === deptFilter);
    }

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.patient.firstName.toLowerCase().includes(q) ||
          a.patient.lastName.toLowerCase().includes(q) ||
          a.patient.nhiNumber.toLowerCase().includes(q)
      );
    }

    return result;
  }, [appointments, activeTab, statusFilter, deptFilter, searchQuery]);

  // --- Stats ---
  const todayCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return appointments.filter((a) => {
      const d = new Date(a.dateTime);
      return d >= today && d < tomorrow;
    }).length;
  }, [appointments]);

  const scheduledCount = useMemo(
    () => appointments.filter((a) => a.status === "scheduled").length,
    [appointments]
  );

  const completedCount = useMemo(
    () => appointments.filter((a) => a.status === "completed").length,
    [appointments]
  );

  const noShowCount = useMemo(
    () => appointments.filter((a) => a.status === "no-show").length,
    [appointments]
  );

  // --- Group by date ---
  const grouped = useMemo(() => {
    const groups: Record<string, Appointment[]> = {};
    const sorted = [...filtered].sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );
    for (const appt of sorted) {
      const dateKey = new Date(appt.dateTime).toLocaleDateString("en-NZ", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(appt);
    }
    return groups;
  }, [filtered]);

  // --- Actions ---
  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchAppointments();
    } catch (err) {
      console.error("Failed to update appointment status:", err);
    }
  };

  const bookAppointment = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: form.patientId,
          providerId: form.providerId || undefined,
          dateTime: new Date(form.dateTime).toISOString(),
          duration: parseInt(form.duration),
          type: form.type,
          department: form.department || undefined,
          notes: form.notes || undefined,
        }),
      });
      setForm({
        patientId: "",
        providerId: "",
        dateTime: "",
        duration: "30",
        type: "consultation",
        department: "",
        notes: "",
      });
      setDialogOpen(false);
      fetchAppointments();
    } catch (err) {
      console.error("Failed to book appointment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Render ---
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-7 w-7 text-teal-600" />
            {t("Appointments")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("Appointment schedule and booking")}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-700 hover:bg-teal-800">
              <Plus className="h-4 w-4 mr-2" />
              {t("New Appointment")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>{t("Book New Appointment")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              {/* Patient */}
              <div className="space-y-2">
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

              {/* Provider */}
              <div className="space-y-2">
                <Label>{t("Provider")}</Label>
                <Select
                  value={form.providerId}
                  onValueChange={(v) => setForm({ ...form, providerId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select provider")} />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date & Time */}
              <div className="space-y-2">
                <Label>{t("Date & Time")}</Label>
                <Input
                  type="datetime-local"
                  value={form.dateTime}
                  onChange={(e) =>
                    setForm({ ...form, dateTime: e.target.value })
                  }
                />
              </div>

              {/* Duration + Type row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("Duration")}</Label>
                  <Select
                    value={form.duration}
                    onValueChange={(v) => setForm({ ...form, duration: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {APPOINTMENT_DURATIONS.map((d) => (
                        <SelectItem key={d} value={String(d)}>
                          {d} {t("min")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                      {APPOINTMENT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {t(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label>{t("Department")}</Label>
                <Select
                  value={form.department}
                  onValueChange={(v) => setForm({ ...form, department: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select department")} />
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

              {/* Notes */}
              <div className="space-y-2">
                <Label>{t("Notes")}</Label>
                <Textarea
                  placeholder={t("Optional notes")}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Submit */}
              <Button
                className="w-full bg-teal-700 hover:bg-teal-800"
                onClick={bookAppointment}
                disabled={submitting || !form.patientId || !form.dateTime}
              >
                {submitting ? t("Booking...") : t("Book Appointment")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-50 rounded-lg">
                <Calendar className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {todayCount}
                </p>
                <p className="text-xs text-gray-500">{t("Today")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {scheduledCount}
                </p>
                <p className="text-xs text-gray-500">{t("Scheduled")}</p>
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
                  {completedCount}
                </p>
                <p className="text-xs text-gray-500">{t("Completed")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                <XCircle className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {noShowCount}
                </p>
                <p className="text-xs text-gray-500">{t("No-shows")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="today">{t("Today")}</TabsTrigger>
          <TabsTrigger value="upcoming">{t("Upcoming")}</TabsTrigger>
          <TabsTrigger value="past">{t("Past")}</TabsTrigger>
          <TabsTrigger value="all">{t("All")}</TabsTrigger>
        </TabsList>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-9"
              placeholder={t("Search by patient name or NHI...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={t("Status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("All Statuses")}</SelectItem>
              <SelectItem value="scheduled">{t("scheduled")}</SelectItem>
              <SelectItem value="checked-in">{t("checked-in")}</SelectItem>
              <SelectItem value="completed">{t("completed")}</SelectItem>
              <SelectItem value="cancelled">{t("cancelled")}</SelectItem>
              <SelectItem value="no-show">{t("no-show")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t("Department")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("All Departments")}</SelectItem>
              {DEPARTMENTS.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {t(dept)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tab Content (all tabs use the same filtered/grouped view) */}
        {["today", "upcoming", "past", "all"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            {loading ? (
              <div className="text-center py-12 text-gray-400">
                <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
                <p>{t("Loading appointments...")}</p>
              </div>
            ) : Object.keys(grouped).length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 font-medium">
                  {t("No appointments found")}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {t("Try adjusting your filters or book a new appointment")}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(grouped).map(([date, appts]) => (
                  <div key={date}>
                    <h2 className="text-sm font-semibold text-gray-500 mb-3">
                      {date}
                    </h2>
                    <div className="space-y-3">
                      {appts.map((appt) => (
                        <Card key={appt.id} className="border-0 shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              {/* Left: time block */}
                              <div className="flex items-center gap-4">
                                <div className="text-center min-w-[60px]">
                                  <p className="text-lg font-bold text-teal-700">
                                    {new Date(
                                      appt.dateTime
                                    ).toLocaleTimeString("en-NZ", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {appt.duration} {t("min")}
                                  </p>
                                </div>

                                {/* Center: patient info */}
                                <div className="border-l pl-4">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium">
                                      {appt.patient.firstName}{" "}
                                      {appt.patient.lastName}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-xs font-mono"
                                    >
                                      {appt.patient.nhiNumber}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 flex-wrap">
                                    <span className="capitalize">
                                      {t(appt.type)}
                                    </span>
                                    {appt.department && (
                                      <>
                                        <span>·</span>
                                        <span>{t(appt.department)}</span>
                                      </>
                                    )}
                                    {appt.provider && (
                                      <>
                                        <span>·</span>
                                        <span>{appt.provider.name}</span>
                                      </>
                                    )}
                                  </div>
                                  {appt.notes && (
                                    <p className="text-xs text-gray-400 mt-1">
                                      {appt.notes}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Right: status badge + action buttons */}
                              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                <Badge
                                  className={
                                    statusColors[appt.status] ||
                                    "bg-gray-100 text-gray-800"
                                  }
                                >
                                  {t(appt.status)}
                                </Badge>

                                {/* Action buttons by status */}
                                {appt.status === "scheduled" && (
                                  <>
                                    <Button
                                      size="sm"
                                      className="bg-teal-600 hover:bg-teal-700 text-white"
                                      onClick={() =>
                                        updateStatus(appt.id, "checked-in")
                                      }
                                    >
                                      {t("Check In")}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={() =>
                                        updateStatus(appt.id, "no-show")
                                      }
                                    >
                                      {t("No Show")}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-red-600 border-red-200 hover:bg-red-50"
                                      onClick={() =>
                                        updateStatus(appt.id, "cancelled")
                                      }
                                    >
                                      {t("Cancel")}
                                    </Button>
                                  </>
                                )}
                                {appt.status === "checked-in" && (
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() =>
                                      updateStatus(appt.id, "completed")
                                    }
                                  >
                                    {t("Complete")}
                                  </Button>
                                )}
                                {(appt.status === "cancelled" ||
                                  appt.status === "no-show") && (
                                  <Button
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={() =>
                                      updateStatus(appt.id, "scheduled")
                                    }
                                  >
                                    {t("Reschedule")}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
