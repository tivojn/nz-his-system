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
  ArrowRight,
  Plus,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  FileCheck,
  Timer,
  ChevronDown,
  ChevronUp,
  MessageSquarePlus,
} from "lucide-react";
import { DEPARTMENTS } from "@/lib/constants";
import { useBilingual } from "@/components/bilingual-provider";

interface Referral {
  id: string;
  referralNumber: string;
  fromDepartment: string;
  toDepartment: string;
  priority: string;
  status: string;
  reason: string;
  clinicalSummary: string | null;
  responseNotes: string | null;
  requestedDate: string;
  acceptedDate: string | null;
  completedDate: string | null;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    nhiNumber: string;
  };
  referredBy: {
    id: string;
    name: string;
    department: string | null;
  };
}

interface PatientOption {
  id: string;
  firstName: string;
  lastName: string;
  nhiNumber: string;
}

interface UserOption {
  id: string;
  name: string;
  department: string | null;
}

const priorityStyles: Record<string, { badge: string; border: string }> = {
  stat: { badge: "bg-red-100 text-red-800", border: "border-l-red-500" },
  urgent: {
    badge: "bg-orange-100 text-orange-800",
    border: "border-l-orange-500",
  },
  routine: {
    badge: "bg-green-100 text-green-800",
    border: "border-l-green-500",
  },
};

const statusStyles: Record<string, string> = {
  pending: "bg-blue-100 text-blue-800",
  accepted: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-slate-100 text-slate-600",
};

export default function ReferralsPage() {
  const { t } = useBilingual();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [activeReferralId, setActiveReferralId] = useState<string | null>(null);
  const [responseNotesInput, setResponseNotesInput] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    patientId: "",
    referredById: "",
    fromDepartment: "",
    toDepartment: "",
    priority: "routine",
    reason: "",
    clinicalSummary: "",
  });

  const fetchReferrals = async () => {
    try {
      const res = await fetch("/api/referrals");
      const data = await res.json();
      setReferrals(data);
    } catch (err) {
      console.error("Failed to fetch referrals:", err);
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

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchReferrals();
    fetchPatients();
    fetchUsers();
  }, []);

  // Stats
  const totalReferrals = referrals.length;
  const pendingCount = referrals.filter((r) => r.status === "pending").length;
  const acceptedCount = referrals.filter((r) => r.status === "accepted").length;
  const avgResponseTime = (() => {
    const responded = referrals.filter((r) => r.acceptedDate && r.requestedDate);
    if (responded.length === 0) return "N/A";
    const totalHours = responded.reduce((sum, r) => {
      const requested = new Date(r.requestedDate).getTime();
      const accepted = new Date(r.acceptedDate!).getTime();
      return sum + (accepted - requested) / 3600000;
    }, 0);
    const avg = totalHours / responded.length;
    if (avg < 1) return `${Math.round(avg * 60)}m`;
    if (avg < 24) return `${Math.round(avg)}h`;
    return `${Math.round(avg / 24)}d`;
  })();

  // Filtering
  const filtered = useMemo(() => {
    let result = referrals;

    if (activeTab !== "all") {
      result = result.filter((r) => r.status === activeTab);
    }

    if (priorityFilter !== "all") {
      result = result.filter((r) => r.priority === priorityFilter);
    }

    if (deptFilter !== "all") {
      result = result.filter((r) => r.toDepartment === deptFilter);
    }

    return result;
  }, [referrals, activeTab, priorityFilter, deptFilter]);

  const updateReferralStatus = async (
    id: string,
    status: string,
    responseNotes?: string
  ) => {
    await fetch(`/api/referrals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, responseNotes }),
    });
    fetchReferrals();
  };

  const openNotesDialog = (id: string, existingNotes: string | null) => {
    setActiveReferralId(id);
    setResponseNotesInput(existingNotes || "");
    setNotesDialogOpen(true);
  };

  const submitNotes = async () => {
    if (!activeReferralId) return;
    await fetch(`/api/referrals/${activeReferralId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ responseNotes: responseNotesInput }),
    });
    setNotesDialogOpen(false);
    setActiveReferralId(null);
    setResponseNotesInput("");
    fetchReferrals();
  };

  const createReferral = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm({
        patientId: "",
        referredById: "",
        fromDepartment: "",
        toDepartment: "",
        priority: "routine",
        reason: "",
        clinicalSummary: "",
      });
      setDialogOpen(false);
      fetchReferrals();
    } catch (err) {
      console.error("Failed to create referral:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Unique departments for filter
  const departments = useMemo(() => {
    const depts = new Set(referrals.map((r) => r.toDepartment));
    return Array.from(depts).sort();
  }, [referrals]);

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
            <Send className="h-7 w-7 text-teal-600" />
            {t("Referral Management")}
          </h1>
          <p className="text-gray-500 mt-1">
            {totalReferrals} {t("referrals")}
          </p>
        </div>
        <Button
          className="bg-teal-700 hover:bg-teal-800"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          {t("New Referral")}
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Send className="h-4 w-4 text-blue-500" />
              <p className="text-sm text-gray-500">{t("Total Referrals")}</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalReferrals}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-amber-500" />
              <p className="text-sm text-gray-500">{t("Pending Review")}</p>
            </div>
            <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <p className="text-sm text-gray-500">{t("Accepted")}</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{acceptedCount}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Timer className="h-4 w-4 text-purple-500" />
              <p className="text-sm text-gray-500">{t("Avg Response Time")}</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{avgResponseTime}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">{t("All")}</TabsTrigger>
          <TabsTrigger value="pending">{t("Pending")}</TabsTrigger>
          <TabsTrigger value="accepted">{t("Accepted")}</TabsTrigger>
          <TabsTrigger value="declined">{t("Declined")}</TabsTrigger>
          <TabsTrigger value="completed">{t("Completed")}</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="sm:max-w-[180px]">
            <SelectValue placeholder={t("Priority")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All Priorities")}</SelectItem>
            <SelectItem value="stat">{t("STAT")}</SelectItem>
            <SelectItem value="urgent">{t("Urgent")}</SelectItem>
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

      {/* Referral Cards */}
      <div className="space-y-3">
        {filtered.map((referral) => {
          const pStyle =
            priorityStyles[referral.priority] || priorityStyles.routine;
          const isExpanded = expandedId === referral.id;

          return (
            <Card
              key={referral.id}
              className={`border-0 shadow-sm border-l-4 ${pStyle.border}`}
            >
              <CardContent className="p-4">
                {/* Main Row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm text-gray-500">
                        {referral.referralNumber}
                      </span>
                      <span className="font-semibold">
                        {referral.patient.firstName}{" "}
                        {referral.patient.lastName}
                      </span>
                      <Badge variant="outline" className="text-xs font-mono">
                        {referral.patient.nhiNumber}
                      </Badge>
                      <Badge className={`text-xs ${pStyle.badge}`}>
                        {t(
                          referral.priority === "stat"
                            ? "STAT"
                            : referral.priority === "urgent"
                              ? "Urgent"
                              : "Routine"
                        )}
                      </Badge>
                      <Badge
                        className={`text-xs capitalize ${statusStyles[referral.status] || ""}`}
                      >
                        {t(
                          referral.status.charAt(0).toUpperCase() +
                            referral.status.slice(1)
                        )}
                      </Badge>
                    </div>

                    {/* Department flow */}
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                      <span className="font-medium">
                        {t(referral.fromDepartment)}
                      </span>
                      <ArrowRight className="h-4 w-4 text-teal-500 flex-shrink-0" />
                      <span className="font-medium">
                        {t(referral.toDepartment)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                      {referral.reason}
                    </p>
                  </div>

                  {/* Date + expand */}
                  <div className="text-right shrink-0">
                    <p className="text-sm text-gray-500">
                      {new Date(referral.requestedDate).toLocaleDateString(
                        "en-NZ"
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {t("by")} {referral.referredBy.name}
                    </p>
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : referral.id)
                      }
                      className="mt-2 text-teal-600 hover:text-teal-700 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                        {t("Clinical Summary")}
                      </p>
                      <p className="text-sm text-gray-700">
                        {referral.clinicalSummary || "\u2014"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                        {t("Reason for Referral")}
                      </p>
                      <p className="text-sm text-gray-700">{referral.reason}</p>
                    </div>
                    {referral.responseNotes && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                          {t("Response Notes")}
                        </p>
                        <p className="text-sm text-gray-700">
                          {referral.responseNotes}
                        </p>
                      </div>
                    )}
                    {/* Timeline */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        {t("Timeline")}
                      </p>
                      <div className="space-y-2 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-400" />
                          <span>
                            {t("Requested")}:{" "}
                            {new Date(
                              referral.requestedDate
                            ).toLocaleString("en-NZ")}
                          </span>
                        </div>
                        {referral.acceptedDate && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-400" />
                            <span>
                              {t("Accepted")}:{" "}
                              {new Date(
                                referral.acceptedDate
                              ).toLocaleString("en-NZ")}
                            </span>
                          </div>
                        )}
                        {referral.completedDate && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gray-400" />
                            <span>
                              {t("Completed")}:{" "}
                              {new Date(
                                referral.completedDate
                              ).toLocaleString("en-NZ")}
                            </span>
                          </div>
                        )}
                        {referral.status === "declined" && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-400" />
                            <span>{t("Declined")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  {referral.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() =>
                          updateReferralStatus(referral.id, "accepted")
                        }
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        {t("Accept")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() =>
                          updateReferralStatus(referral.id, "declined")
                        }
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        {t("Decline")}
                      </Button>
                    </>
                  )}
                  {referral.status === "accepted" && (
                    <>
                      <Button
                        size="sm"
                        className="bg-teal-600 hover:bg-teal-700"
                        onClick={() =>
                          updateReferralStatus(referral.id, "completed")
                        }
                      >
                        <FileCheck className="h-3.5 w-3.5 mr-1" />
                        {t("Complete")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          openNotesDialog(referral.id, referral.responseNotes)
                        }
                      >
                        <MessageSquarePlus className="h-3.5 w-3.5 mr-1" />
                        {t("Add Notes")}
                      </Button>
                    </>
                  )}
                  {referral.status === "completed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setExpandedId(
                          expandedId === referral.id ? null : referral.id
                        )
                      }
                    >
                      {t("View Summary")}
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
              <Send className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">
                {t("No referrals found")}
              </p>
              <p className="text-sm text-gray-300 mt-1">
                {t("Try adjusting your filters or create a new referral")}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* New Referral Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("New Referral")}</DialogTitle>
            <DialogDescription>
              {t("Create a new inter-department referral")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
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
              <Label>{t("Referred By")}</Label>
              <Select
                value={form.referredById}
                onValueChange={(val) => {
                  const user = users.find((u) => u.id === val);
                  setForm((prev) => ({
                    ...prev,
                    referredById: val,
                    fromDepartment: user?.department || prev.fromDepartment,
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("Select provider")} />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} {u.department ? `(${u.department})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("From Department")}</Label>
              <Select
                value={form.fromDepartment}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, fromDepartment: val }))
                }
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
            <div className="space-y-2">
              <Label>{t("To Department")}</Label>
              <Select
                value={form.toDepartment}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, toDepartment: val }))
                }
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
                  <SelectItem value="stat">{t("STAT")}</SelectItem>
                  <SelectItem value="urgent">{t("Urgent")}</SelectItem>
                  <SelectItem value="routine">{t("Routine")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("Reason for Referral")}</Label>
              <Textarea
                placeholder={t("Reason for referral...")}
                value={form.reason}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, reason: e.target.value }))
                }
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("Clinical Summary")}</Label>
              <Textarea
                placeholder={t("Clinical summary...")}
                value={form.clinicalSummary}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    clinicalSummary: e.target.value,
                  }))
                }
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("Cancel")}
            </Button>
            <Button
              className="bg-teal-700 hover:bg-teal-800"
              disabled={
                !form.patientId ||
                !form.referredById ||
                !form.fromDepartment ||
                !form.toDepartment ||
                !form.reason ||
                !form.clinicalSummary ||
                submitting
              }
              onClick={createReferral}
            >
              {submitting ? t("Submitting...") : t("Submit Referral")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Response Notes")}</DialogTitle>
            <DialogDescription>
              {t("Add or update notes for this referral")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder={t("Enter response notes...")}
              value={responseNotesInput}
              onChange={(e) => setResponseNotesInput(e.target.value)}
              rows={5}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNotesDialogOpen(false)}
            >
              {t("Cancel")}
            </Button>
            <Button
              className="bg-teal-700 hover:bg-teal-800"
              onClick={submitNotes}
              disabled={!responseNotesInput.trim()}
            >
              {t("Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
