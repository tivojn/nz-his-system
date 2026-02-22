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
  FlaskConical,
  Plus,
  Search,
  ClipboardList,
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  TestTube2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useBilingual } from "@/components/bilingual-provider";

// ─── Types ──────────────────────────────────────────────────────────
interface PatientOption {
  id: string;
  firstName: string;
  lastName: string;
  nhiNumber: string;
}

interface LabOrderData {
  id: string;
  orderNumber: string;
  testName: string;
  testCode: string;
  priority: string;
  status: string;
  specimen: string | null;
  clinicalNotes: string | null;
  resultValue: string | null;
  resultUnit: string | null;
  referenceRange: string | null;
  interpretation: string | null;
  resultNotes: string | null;
  orderedAt: string;
  collectedAt: string | null;
  completedAt: string | null;
  patient: { id: string; firstName: string; lastName: string; nhiNumber: string };
  orderedBy: { id: string; name: string };
}

// ─── Constants ──────────────────────────────────────────────────────
const NZ_LAB_TESTS = [
  { name: "Full Blood Count (FBC)", code: "58410-2", specimen: "Blood", refRange: "See components" },
  { name: "Liver Function Tests (LFTs)", code: "24325-3", specimen: "Blood", refRange: "See components" },
  { name: "Urea & Electrolytes (U&Es)", code: "24326-1", specimen: "Blood", refRange: "See components" },
  { name: "C-Reactive Protein (CRP)", code: "1988-5", specimen: "Blood", refRange: "<5 mg/L" },
  { name: "HbA1c", code: "4548-4", specimen: "Blood", refRange: "20-42 mmol/mol" },
  { name: "Troponin T", code: "6598-7", specimen: "Blood", refRange: "<14 ng/L" },
  { name: "Lipid Panel", code: "57698-3", specimen: "Blood", refRange: "See components" },
  { name: "Coagulation (INR/PT)", code: "5902-2", specimen: "Blood", refRange: "INR 0.9-1.1" },
  { name: "Thyroid Function (TFTs)", code: "3016-3", specimen: "Blood", refRange: "TSH 0.4-4.0 mIU/L" },
  { name: "Blood Cultures", code: "600-7", specimen: "Blood", refRange: "No growth" },
  { name: "Urinalysis", code: "24356-8", specimen: "Urine", refRange: "See components" },
  { name: "D-Dimer", code: "48065-7", specimen: "Blood", refRange: "<0.5 mg/L FEU" },
  { name: "Arterial Blood Gas", code: "24336-0", specimen: "Blood", refRange: "pH 7.35-7.45" },
  { name: "Blood Group & Crossmatch", code: "882-1", specimen: "Blood", refRange: "N/A" },
] as const;

const SPECIMENS = ["Blood", "Urine", "CSF", "Swab", "Tissue"] as const;
const PRIORITIES = ["stat", "urgent", "routine"] as const;

const priorityColors: Record<string, string> = {
  stat: "bg-red-100 text-red-800",
  urgent: "bg-amber-100 text-amber-800",
  routine: "bg-green-100 text-green-800",
};

const statusColors: Record<string, string> = {
  ordered: "bg-blue-100 text-blue-800",
  collected: "bg-purple-100 text-purple-800",
  "in-progress": "bg-amber-100 text-amber-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
};

const interpretationColors: Record<string, string> = {
  normal: "bg-green-100 text-green-800",
  abnormal: "bg-amber-100 text-amber-800",
  critical: "bg-red-100 text-red-800",
};

type TabKey = "all" | "pending" | "in-progress" | "completed" | "critical";

// ─── Component ──────────────────────────────────────────────────────
export default function LabOrdersPage() {
  const { t } = useBilingual();

  const [orders, setOrders] = useState<LabOrderData[]>([]);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  // New order dialog
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderForm, setOrderForm] = useState({
    patientId: "",
    testIdx: "",
    priority: "routine",
    specimen: "",
    clinicalNotes: "",
  });

  // Enter results dialog
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);
  const [resultsOrderId, setResultsOrderId] = useState<string | null>(null);
  const [resultsForm, setResultsForm] = useState({
    resultValue: "",
    resultUnit: "",
    referenceRange: "",
    interpretation: "",
    resultNotes: "",
  });
  const [enteringResults, setEnteringResults] = useState(false);

  // Expanded results view
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // ─── Data fetching ────────────────────────────────────────────────
  useEffect(() => {
    fetchOrders();
    fetchPatients();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/lab-orders");
      const data = await res.json();
      setOrders(data);
    } catch {
      // Handle fetch error silently
    }
    setLoading(false);
  };

  const fetchPatients = async () => {
    try {
      const res = await fetch("/api/patients");
      const data = await res.json();
      setPatients(data);
    } catch {
      // Handle fetch error silently
    }
  };

  // ─── Session helper ───────────────────────────────────────────────
  const getSessionUserId = (): string => {
    try {
      const match = document.cookie.match(/nzhis-session=([^;]+)/);
      if (match) {
        const user = JSON.parse(atob(match[1]));
        return user.id;
      }
    } catch {}
    return "1";
  };

  // ─── Submit new order ─────────────────────────────────────────────
  const submitOrder = async () => {
    setSubmitting(true);
    const test = NZ_LAB_TESTS[Number(orderForm.testIdx)];
    const orderedById = getSessionUserId();

    await fetch("/api/lab-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: orderForm.patientId,
        orderedById,
        testName: test.name,
        testCode: test.code,
        priority: orderForm.priority,
        specimen: orderForm.specimen || test.specimen,
        clinicalNotes: orderForm.clinicalNotes || null,
      }),
    });

    setOrderForm({ patientId: "", testIdx: "", priority: "routine", specimen: "", clinicalNotes: "" });
    setNewOrderOpen(false);
    setSubmitting(false);
    fetchOrders();
  };

  // ─── Update order status ──────────────────────────────────────────
  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/lab-orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  };

  // ─── Open enter results dialog ────────────────────────────────────
  const openResultsDialog = (order: LabOrderData) => {
    const test = NZ_LAB_TESTS.find((t) => t.code === order.testCode);
    setResultsOrderId(order.id);
    setResultsForm({
      resultValue: "",
      resultUnit: "",
      referenceRange: test?.refRange || "",
      interpretation: "",
      resultNotes: "",
    });
    setResultsDialogOpen(true);
  };

  // ─── Submit results ───────────────────────────────────────────────
  const submitResults = async () => {
    if (!resultsOrderId) return;
    setEnteringResults(true);

    await fetch(`/api/lab-orders/${resultsOrderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "completed",
        resultValue: resultsForm.resultValue,
        resultUnit: resultsForm.resultUnit,
        referenceRange: resultsForm.referenceRange,
        interpretation: resultsForm.interpretation,
        resultNotes: resultsForm.resultNotes || null,
      }),
    });

    setResultsDialogOpen(false);
    setResultsOrderId(null);
    setEnteringResults(false);
    fetchOrders();
  };

  // ─── Computed stats ───────────────────────────────────────────────
  const totalOrders = orders.length;
  const pendingCollection = orders.filter((o) => o.status === "ordered").length;
  const inProgressCount = orders.filter((o) => o.status === "in-progress").length;
  const criticalCount = orders.filter((o) => o.interpretation === "critical").length;

  // ─── Filtered orders ─────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    let result = orders;

    // Tab filter
    switch (activeTab) {
      case "pending":
        result = result.filter((o) => o.status === "ordered");
        break;
      case "in-progress":
        result = result.filter((o) => o.status === "in-progress" || o.status === "collected");
        break;
      case "completed":
        result = result.filter((o) => o.status === "completed");
        break;
      case "critical":
        result = result.filter((o) => o.interpretation === "critical");
        break;
    }

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.patient.firstName.toLowerCase().includes(q) ||
          o.patient.lastName.toLowerCase().includes(q) ||
          o.orderNumber.toLowerCase().includes(q) ||
          o.testName.toLowerCase().includes(q) ||
          o.patient.nhiNumber.toLowerCase().includes(q)
      );
    }

    return result;
  }, [orders, activeTab, searchQuery]);

  // ─── Tabs ─────────────────────────────────────────────────────────
  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "all", label: t("All Orders"), count: totalOrders },
    { key: "pending", label: t("Pending"), count: pendingCollection },
    { key: "in-progress", label: t("In Progress"), count: inProgressCount },
    { key: "completed", label: t("Completed"), count: orders.filter((o) => o.status === "completed").length },
    { key: "critical", label: t("Critical"), count: criticalCount },
  ];

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <FlaskConical className="h-8 w-8 text-teal-700" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("Laboratory Orders")}</h1>
            <p className="text-sm text-gray-500">
              {totalOrders} {t("orders")} &middot; {pendingCollection} {t("pending collection")}
            </p>
          </div>
        </div>

        {/* New Lab Order Dialog */}
        <Dialog open={newOrderOpen} onOpenChange={setNewOrderOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-700 hover:bg-teal-800">
              <Plus className="h-4 w-4 mr-1" /> {t("New Lab Order")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("New Lab Order")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t("Patient")}</Label>
                <Select
                  value={orderForm.patientId}
                  onValueChange={(v) => setOrderForm({ ...orderForm, patientId: v })}
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

              <div>
                <Label>{t("Test")}</Label>
                <Select
                  value={orderForm.testIdx}
                  onValueChange={(v) => {
                    const test = NZ_LAB_TESTS[Number(v)];
                    setOrderForm({
                      ...orderForm,
                      testIdx: v,
                      specimen: test.specimen,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select test")} />
                  </SelectTrigger>
                  <SelectContent>
                    {NZ_LAB_TESTS.map((test, idx) => (
                      <SelectItem key={test.code} value={String(idx)}>
                        {test.name} ({test.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>{t("Priority")}</Label>
                  <Select
                    value={orderForm.priority}
                    onValueChange={(v) => setOrderForm({ ...orderForm, priority: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p === "stat" ? "STAT" : p === "urgent" ? t("Urgent") : t("Routine")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("Specimen")}</Label>
                  <Select
                    value={orderForm.specimen}
                    onValueChange={(v) => setOrderForm({ ...orderForm, specimen: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("Select specimen")} />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIMENS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {t(s)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>{t("Clinical Notes")}</Label>
                <Textarea
                  placeholder={t("Reason for test, relevant clinical details...")}
                  value={orderForm.clinicalNotes}
                  onChange={(e) => setOrderForm({ ...orderForm, clinicalNotes: e.target.value })}
                />
              </div>

              <Button
                onClick={submitOrder}
                disabled={!orderForm.patientId || !orderForm.testIdx || submitting}
                className="w-full bg-teal-700 hover:bg-teal-800"
              >
                {submitting ? t("Loading...") : t("Submit Lab Order")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-teal-600" />
              <p className="text-sm text-gray-500">{t("Total Orders")}</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalOrders}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <p className="text-sm text-gray-500">{t("Pending Collection")}</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{pendingCollection}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 text-amber-600" />
              <p className="text-sm text-gray-500">{t("In Progress")}</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{inProgressCount}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-gray-500">{t("Critical Results")}</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{criticalCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "border-teal-700 text-teal-700"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1 sm:ml-1.5 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder={t("Search orders...")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="animate-pulse text-gray-400 p-4">{t("Loading...")}</div>
      ) : filteredOrders.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center text-gray-500">
            {t("No lab orders found.")}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                {/* Order row */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-semibold text-gray-700">
                        {order.orderNumber}
                      </span>
                      <Badge className={priorityColors[order.priority]}>
                        {order.priority === "stat"
                          ? "STAT"
                          : order.priority === "urgent"
                          ? t("Urgent")
                          : t("Routine")}
                      </Badge>
                      <Badge className={statusColors[order.status]}>
                        {t(order.status)}
                      </Badge>
                      {order.interpretation === "critical" && (
                        <Badge className="bg-red-100 text-red-800 animate-pulse">
                          {t("CRITICAL")}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-7 h-7 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-xs">
                        {order.patient.firstName[0]}
                        {order.patient.lastName[0]}
                      </span>
                      <span className="font-medium text-sm text-gray-900">
                        {order.patient.firstName} {order.patient.lastName}
                      </span>
                      <Badge variant="outline" className="font-mono text-xs">
                        {order.patient.nhiNumber}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <TestTube2 className="h-3 w-3" />
                        {order.testName}
                      </span>
                      {order.specimen && (
                        <span>{t("Specimen")}: {t(order.specimen)}</span>
                      )}
                      <span>
                        {t("Ordered")} {new Date(order.orderedAt).toLocaleDateString("en-NZ")}{" "}
                        {new Date(order.orderedAt).toLocaleTimeString("en-NZ", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span>{t("By")} {order.orderedBy.name}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-1">
                    {order.status === "ordered" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        onClick={() => updateStatus(order.id, "collected")}
                      >
                        {t("Mark Collected")}
                      </Button>
                    )}
                    {order.status === "collected" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        onClick={() => updateStatus(order.id, "in-progress")}
                      >
                        {t("Start Processing")}
                      </Button>
                    )}
                    {(order.status === "in-progress" || order.status === "collected") && (
                      <Button
                        size="sm"
                        className="text-xs h-7 bg-teal-700 hover:bg-teal-800"
                        onClick={() => openResultsDialog(order)}
                      >
                        {t("Enter Results")}
                      </Button>
                    )}
                    {order.status === "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        onClick={() =>
                          setExpandedOrderId(expandedOrderId === order.id ? null : order.id)
                        }
                      >
                        {expandedOrderId === order.id ? (
                          <ChevronUp className="h-3 w-3 mr-1" />
                        ) : (
                          <ChevronDown className="h-3 w-3 mr-1" />
                        )}
                        {t("View Results")}
                      </Button>
                    )}
                    {order.status !== "completed" && order.status !== "cancelled" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => updateStatus(order.id, "cancelled")}
                      >
                        {t("Cancel")}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Expanded Results View */}
                {expandedOrderId === order.id && order.status === "completed" && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Result details */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700">{t("Results")}</h4>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-gray-900">
                            {order.resultValue || "—"}
                          </span>
                          <span className="text-sm text-gray-500">{order.resultUnit}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {t("Reference Range")}: {order.referenceRange || "—"}
                        </div>
                        {order.interpretation && (
                          <Badge
                            className={`${
                              interpretationColors[order.interpretation]
                            } ${order.interpretation === "critical" ? "animate-pulse" : ""}`}
                          >
                            {order.interpretation === "normal"
                              ? t("Normal")
                              : order.interpretation === "abnormal"
                              ? t("Abnormal")
                              : t("Critical")}
                          </Badge>
                        )}
                        {order.resultNotes && (
                          <div className="text-xs text-gray-600 bg-gray-50 rounded p-2">
                            {order.resultNotes}
                          </div>
                        )}
                      </div>

                      {/* Timeline */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700">{t("Timeline")}</h4>
                        <div className="space-y-2">
                          <TimelineStep
                            label={t("Ordered")}
                            date={order.orderedAt}
                            active={true}
                            icon={<ClipboardList className="h-3 w-3" />}
                          />
                          <TimelineStep
                            label={t("Collected")}
                            date={order.collectedAt}
                            active={!!order.collectedAt}
                            icon={<TestTube2 className="h-3 w-3" />}
                          />
                          <TimelineStep
                            label={t("Completed")}
                            date={order.completedAt}
                            active={!!order.completedAt}
                            icon={<CheckCircle2 className="h-3 w-3" />}
                            last
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Enter Results Dialog */}
      <Dialog open={resultsDialogOpen} onOpenChange={setResultsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("Enter Results")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t("Result Value")}</Label>
                <Input
                  placeholder="e.g. 5.2"
                  value={resultsForm.resultValue}
                  onChange={(e) =>
                    setResultsForm({ ...resultsForm, resultValue: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>{t("Unit")}</Label>
                <Input
                  placeholder="e.g. mmol/L"
                  value={resultsForm.resultUnit}
                  onChange={(e) =>
                    setResultsForm({ ...resultsForm, resultUnit: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label>{t("Reference Range")}</Label>
              <Input
                value={resultsForm.referenceRange}
                onChange={(e) =>
                  setResultsForm({ ...resultsForm, referenceRange: e.target.value })
                }
              />
            </div>

            <div>
              <Label>{t("Interpretation")}</Label>
              <Select
                value={resultsForm.interpretation}
                onValueChange={(v) =>
                  setResultsForm({ ...resultsForm, interpretation: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("Select interpretation")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">{t("Normal")}</SelectItem>
                  <SelectItem value="abnormal">{t("Abnormal")}</SelectItem>
                  <SelectItem value="critical">{t("Critical")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t("Result Notes")}</Label>
              <Textarea
                placeholder={t("Additional notes on result...")}
                value={resultsForm.resultNotes}
                onChange={(e) =>
                  setResultsForm({ ...resultsForm, resultNotes: e.target.value })
                }
              />
            </div>

            <Button
              onClick={submitResults}
              disabled={!resultsForm.resultValue || !resultsForm.interpretation || enteringResults}
              className="w-full bg-teal-700 hover:bg-teal-800"
            >
              {enteringResults ? t("Loading...") : t("Complete with Results")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Timeline Step Component ────────────────────────────────────────
function TimelineStep({
  label,
  date,
  active,
  icon,
  last,
}: {
  label: string;
  date: string | null;
  active: boolean;
  icon: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center ${
            active ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-400"
          }`}
        >
          {icon}
        </div>
        {!last && (
          <div
            className={`w-0.5 h-6 ${active ? "bg-teal-200" : "bg-gray-200"}`}
          />
        )}
      </div>
      <div className="flex-1 min-w-0 pb-1">
        <p
          className={`text-xs font-medium ${
            active ? "text-gray-900" : "text-gray-400"
          }`}
        >
          {label}
        </p>
        {date && (
          <p className="text-[10px] text-gray-400">
            {new Date(date).toLocaleDateString("en-NZ")}{" "}
            {new Date(date).toLocaleTimeString("en-NZ", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>
    </div>
  );
}
