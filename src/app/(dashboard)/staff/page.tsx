"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Search,
  Stethoscope,
  HeartPulse,
  UserCog,
  Clock,
  Mail,
  Phone,
  Building2,
  Hash,
  Shield,
} from "lucide-react";
import { useBilingual } from "@/components/bilingual-provider";
import { DEPARTMENTS } from "@/lib/constants";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  hpiNumber: string | null;
  speciality: string | null;
  phone: string | null;
  createdAt: string;
}

interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  severity: string;
  details: string | null;
  createdAt: string;
}

const ROLES = [
  "admin",
  "doctor",
  "nurse",
  "receptionist",
  "pharmacist",
  "lab-tech",
  "radiologist",
];

const roleLabels: Record<string, string> = {
  admin: "Admin",
  doctor: "Doctor",
  nurse: "Nurse",
  receptionist: "Receptionist",
  pharmacist: "Pharmacist",
  "lab-tech": "Lab Tech",
  radiologist: "Radiologist",
};

const roleColors: Record<string, string> = {
  admin: "bg-purple-100 text-purple-800",
  doctor: "bg-blue-100 text-blue-800",
  nurse: "bg-green-100 text-green-800",
  receptionist: "bg-orange-100 text-orange-800",
  pharmacist: "bg-cyan-100 text-cyan-800",
  "lab-tech": "bg-yellow-100 text-yellow-800",
  radiologist: "bg-indigo-100 text-indigo-800",
};

const roleAvatarColors: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  doctor: "bg-blue-100 text-blue-700",
  nurse: "bg-green-100 text-green-700",
  receptionist: "bg-orange-100 text-orange-700",
  pharmacist: "bg-cyan-100 text-cyan-700",
  "lab-tech": "bg-yellow-100 text-yellow-700",
  radiologist: "bg-indigo-100 text-indigo-700",
};

export default function StaffPage() {
  const { t } = useBilingual();

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");

  // Profile dialog state
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    role: "",
    department: "",
    speciality: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchStaff = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (roleFilter !== "all") params.set("role", roleFilter);
      if (deptFilter !== "all") params.set("department", deptFilter);
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/staff?${params}`);
      const data = await res.json();
      setStaff(data);
    } catch (err) {
      console.error("Failed to fetch staff:", err);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, deptFilter, searchQuery]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Stats
  const totalStaff = staff.length;
  const doctorCount = useMemo(
    () => staff.filter((s) => s.role === "doctor").length,
    [staff]
  );
  const nurseCount = useMemo(
    () => staff.filter((s) => s.role === "nurse").length,
    [staff]
  );
  const otherCount = useMemo(
    () =>
      staff.filter((s) => s.role !== "doctor" && s.role !== "nurse").length,
    [staff]
  );

  const openProfile = async (member: StaffMember) => {
    setSelectedStaff(member);
    setEditing(false);
    setEditForm({
      role: member.role,
      department: member.department || "",
      speciality: member.speciality || "",
      phone: member.phone || "",
    });
    setProfileOpen(true);

    // Fetch recent audit log for this user
    setAuditLoading(true);
    try {
      const res = await fetch(`/api/audit?userId=${member.id}&limit=10`);
      const data = await res.json();
      setAuditLog(Array.isArray(data) ? data : data.logs || []);
    } catch (err) {
      console.error("Failed to fetch audit log:", err);
      setAuditLog([]);
    } finally {
      setAuditLoading(false);
    }
  };

  const saveEdit = async () => {
    if (!selectedStaff) return;
    setSaving(true);
    try {
      const res = await fetch("/api/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedStaff.id,
          role: editForm.role,
          department: editForm.department || null,
          speciality: editForm.speciality || null,
          phone: editForm.phone || null,
        }),
      });
      const updated = await res.json();
      setSelectedStaff(updated);
      setEditing(false);
      fetchStaff();
    } catch (err) {
      console.error("Failed to update staff:", err);
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="h-7 w-7 text-teal-600" />
          {t("Staff Management")}
        </h1>
        <p className="text-gray-500 mt-1">
          {t("Staff directory and role management")}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-50 rounded-lg">
                <Users className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalStaff}</p>
                <p className="text-xs text-gray-500">{t("Total Staff")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Stethoscope className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {doctorCount}
                </p>
                <p className="text-xs text-gray-500">{t("Doctors")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <HeartPulse className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {nurseCount}
                </p>
                <p className="text-xs text-gray-500">{t("Nurses")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <UserCog className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {otherCount}
                </p>
                <p className="text-xs text-gray-500">{t("Other Staff")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder={t("Search staff...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("Role")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All Roles")}</SelectItem>
            {ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {t(roleLabels[role])}
              </SelectItem>
            ))}
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

      {/* Staff Directory Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">
          <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
          <p>{t("Loading...")}</p>
        </div>
      ) : staff.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center text-gray-400">
            {t("No staff found")}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  <th className="text-left p-3 font-semibold text-gray-600">
                    {t("Name")}
                  </th>
                  <th className="text-left p-3 font-semibold text-gray-600">
                    {t("Email")}
                  </th>
                  <th className="text-left p-3 font-semibold text-gray-600">
                    {t("Role")}
                  </th>
                  <th className="text-left p-3 font-semibold text-gray-600">
                    {t("Department")}
                  </th>
                  <th className="text-left p-3 font-semibold text-gray-600">
                    {t("Speciality")}
                  </th>
                  <th className="text-left p-3 font-semibold text-gray-600">
                    {t("HPI Number")}
                  </th>
                  <th className="text-left p-3 font-semibold text-gray-600">
                    {t("Phone")}
                  </th>
                  <th className="text-right p-3 font-semibold text-gray-600"></th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                            roleAvatarColors[member.role] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {getInitials(member.name)}
                        </div>
                        <span className="font-medium text-gray-900">
                          {member.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-gray-500">{member.email}</td>
                    <td className="p-3">
                      <Badge
                        className={
                          roleColors[member.role] || "bg-gray-100 text-gray-800"
                        }
                      >
                        {t(roleLabels[member.role] || member.role)}
                      </Badge>
                    </td>
                    <td className="p-3 text-gray-600">
                      {member.department ? t(member.department) : "—"}
                    </td>
                    <td className="p-3 text-gray-600">
                      {member.speciality || "—"}
                    </td>
                    <td className="p-3 font-mono text-xs text-gray-500">
                      {member.hpiNumber || "—"}
                    </td>
                    <td className="p-3 text-gray-500">
                      {member.phone || "—"}
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openProfile(member)}
                      >
                        {t("View Profile")}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Staff Profile Dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("Staff Profile")}</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <div className="space-y-5 mt-2">
              {/* Profile header */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${
                    roleAvatarColors[selectedStaff.role] ||
                    "bg-gray-100 text-gray-700"
                  }`}
                >
                  {getInitials(selectedStaff.name)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedStaff.name}
                  </h3>
                  <Badge
                    className={
                      roleColors[selectedStaff.role] ||
                      "bg-gray-100 text-gray-800"
                    }
                  >
                    {t(
                      roleLabels[selectedStaff.role] || selectedStaff.role
                    )}
                  </Badge>
                </div>
                <div className="ml-auto">
                  {!editing ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditing(true)}
                    >
                      {t("Edit")}
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditing(false)}
                      >
                        {t("Cancel")}
                      </Button>
                      <Button
                        size="sm"
                        className="bg-teal-700 hover:bg-teal-800"
                        onClick={saveEdit}
                        disabled={saving}
                      >
                        {saving ? t("Saving...") : t("Save")}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Details */}
              {!editing ? (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {selectedStaff.email}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {selectedStaff.phone || "—"}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    {selectedStaff.department
                      ? t(selectedStaff.department)
                      : "—"}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Stethoscope className="h-4 w-4 text-gray-400" />
                    {selectedStaff.speciality || "—"}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Hash className="h-4 w-4 text-gray-400" />
                    {t("HPI")}: {selectedStaff.hpiNumber || "—"}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Shield className="h-4 w-4 text-gray-400" />
                    {t("Joined")}:{" "}
                    {new Date(selectedStaff.createdAt).toLocaleDateString(
                      "en-NZ"
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("Role")}</Label>
                    <Select
                      value={editForm.role}
                      onValueChange={(v) =>
                        setEditForm({ ...editForm, role: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {t(roleLabels[role])}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("Department")}</Label>
                    <Select
                      value={editForm.department}
                      onValueChange={(v) =>
                        setEditForm({ ...editForm, department: v })
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
                    <Label>{t("Speciality")}</Label>
                    <Input
                      value={editForm.speciality}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          speciality: e.target.value,
                        })
                      }
                      placeholder={t("e.g. Cardiology")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("Phone")}</Label>
                    <Input
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                      placeholder="+64..."
                    />
                  </div>
                </div>
              )}

              {/* Recent Audit Activity */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  {t("Recent Activity")}
                </h4>
                {auditLoading ? (
                  <div className="text-center py-4 text-gray-400 text-sm">
                    {t("Loading...")}
                  </div>
                ) : auditLog.length === 0 ? (
                  <p className="text-sm text-gray-400 py-2">
                    {t("No recent activity")}
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {auditLog.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between text-xs px-3 py-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              entry.severity === "critical"
                                ? "border-red-300 text-red-700"
                                : entry.severity === "warning"
                                ? "border-amber-300 text-amber-700"
                                : "border-gray-300 text-gray-600"
                            }`}
                          >
                            {entry.action}
                          </Badge>
                          <span className="text-gray-600">
                            {entry.entity}
                          </span>
                        </div>
                        <span className="text-gray-400">
                          {new Date(entry.createdAt).toLocaleString("en-NZ", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
