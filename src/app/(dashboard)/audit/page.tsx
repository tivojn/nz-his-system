"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { History, ChevronDown, ChevronRight, Filter } from "lucide-react";

interface AuditLog {
  id: string;
  userId: string | null;
  user: { name: string; role: string } | null;
  action: string;
  entity: string;
  entityId: string | null;
  severity: string;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

interface AuditResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

const ACTIONS = ["CREATE", "READ", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "PRESCRIBE", "DISCHARGE"];
const SEVERITIES = ["info", "warning", "critical"];
const ENTITIES = ["Patient", "Encounter", "ClinicalNote", "Medication", "Appointment", "WaitlistEntry", "ACCClaim", "Bed", "User"];
const DATE_RANGES = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "24h", label: "Last 24 Hours" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
];

const severityColors: Record<string, string> = {
  info: "bg-blue-100 text-blue-800",
  warning: "bg-amber-100 text-amber-800",
  critical: "bg-red-100 text-red-800",
};

export default function AuditPage() {
  const [data, setData] = useState<AuditResponse>({ logs: [], total: 0, page: 1, limit: 20 });
  const [filters, setFilters] = useState({
    action: "",
    severity: "",
    entity: "",
    dateRange: "",
  });
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "20");
    if (filters.action) params.set("action", filters.action);
    if (filters.severity) params.set("severity", filters.severity);
    if (filters.entity) params.set("entity", filters.entity);
    if (filters.dateRange && filters.dateRange !== "all") params.set("dateRange", filters.dateRange);

    fetch(`/api/audit?${params.toString()}`)
      .then((r) => r.json())
      .then(setData);
  }, [page, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  function updateFilter(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value === "all" ? "" : value }));
    setPage(1);
  }

  const totalPages = Math.ceil(data.total / data.limit);

  function parseDetails(details: string | null): Record<string, unknown> | null {
    if (!details) return null;
    try {
      return JSON.parse(details);
    } catch {
      return null;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <History className="h-7 w-7 text-teal-600" />
          Audit Trail — Ara Arotake
        </h1>
        <p className="text-gray-500 mt-1">System activity and compliance logging</p>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <Select value={filters.dateRange || "all"} onValueChange={(v) => updateFilter("dateRange", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGES.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.action || "all"} onValueChange={(v) => updateFilter("action", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {ACTIONS.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.severity || "all"} onValueChange={(v) => updateFilter("severity", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                {SEVERITIES.map((s) => (
                  <SelectItem key={s} value={s}>
                    <span className="capitalize">{s}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.entity || "all"} onValueChange={(v) => updateFilter("entity", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                {ENTITIES.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Audit Logs</span>
            <span className="text-sm font-normal text-gray-500">{data.total} entries</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                    No audit logs found
                  </TableCell>
                </TableRow>
              )}
              {data.logs.map((log) => {
                const isExpanded = expandedId === log.id;
                const details = parseDetails(log.details);
                return (
                  <>
                    <TableRow
                      key={log.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    >
                      <TableCell>
                        {details ? (
                          isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )
                        ) : null}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-gray-600 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("en-NZ")}
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.user?.name || "System"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs font-mono">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{log.entity}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs capitalize ${severityColors[log.severity] || "bg-gray-100"}`}>
                          {log.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500 max-w-[200px] truncate">
                        {log.details ? (details ? Object.keys(details).join(", ") : log.details) : "—"}
                      </TableCell>
                    </TableRow>
                    {isExpanded && details && (
                      <TableRow key={`${log.id}-detail`}>
                        <TableCell colSpan={7} className="bg-gray-50">
                          <pre className="text-xs text-gray-600 p-3 rounded bg-white overflow-x-auto">
                            {JSON.stringify(details, null, 2)}
                          </pre>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500">
                Page {data.page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
