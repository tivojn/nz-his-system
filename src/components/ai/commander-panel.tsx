"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  Send,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ChevronRight,
  Zap,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBilingual } from "@/components/bilingual-provider";

interface PlanStep {
  id: number;
  action: string;
  status: "pending" | "executing" | "done";
}

interface ActionPlan {
  steps: PlanStep[];
  systems: string[];
  risk: "low" | "medium" | "high";
  summary: string;
}

const riskColors: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-800 border-emerald-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  high: "bg-red-100 text-red-800 border-red-200",
};

const exampleCommands = [
  "Discharge Hemi Tuhoe with meds review and ACC update",
  "Admit new patient to ICU with sepsis pathway activation",
  "Run full audit on all prescriptions in last 24 hours",
];

export function CommanderPanel() {
  const { t } = useBilingual();
  const [input, setInput] = useState("");
  const [plan, setPlan] = useState<ActionPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [executionComplete, setExecutionComplete] = useState(false);

  const generatePlan = async (text?: string) => {
    const command = text || input;
    if (!command.trim()) return;

    setInput("");
    setLoading(true);
    setPlan(null);
    setExecutionComplete(false);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: command, commander: true }),
      });
      const data = await res.json();
      if (data.plan) {
        setPlan({
          ...data.plan,
          steps: data.plan.steps.map((s: string, i: number) => ({
            id: i + 1,
            action: s,
            status: "pending" as const,
          })),
        });
      }
    } catch {
      setPlan(null);
    } finally {
      setLoading(false);
    }
  };

  const executePlan = async () => {
    if (!plan) return;
    setExecuting(true);

    for (let i = 0; i < plan.steps.length; i++) {
      setPlan((prev) => {
        if (!prev) return prev;
        const steps = prev.steps.map((s, idx) =>
          idx === i ? { ...s, status: "executing" as const } : s
        );
        return { ...prev, steps };
      });

      await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));

      setPlan((prev) => {
        if (!prev) return prev;
        const steps = prev.steps.map((s, idx) =>
          idx === i ? { ...s, status: "done" as const } : s
        );
        return { ...prev, steps };
      });
    }

    setExecuting(false);
    setExecutionComplete(true);
  };

  const cancelPlan = () => {
    setPlan(null);
    setExecutionComplete(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
          <Command className="h-5 w-5 text-blue-700" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{t("Commander Mode")}</h3>
          <p className="text-xs text-gray-500">
            {t("Issue natural language commands across hospital systems")}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {!plan && !loading && (
            <>
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("Multi-System Commander")}
                </h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  {t("Describe what you need done in plain language. Commander Mode will generate a structured action plan spanning multiple hospital systems.")}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Sparkles className="h-3 w-3" /> {t("Example commands")}
                </div>
                {exampleCommands.map((cmd) => (
                  <button
                    key={cmd}
                    className="w-full text-left px-4 py-3 rounded-lg border border-blue-100 hover:border-blue-300 hover:bg-blue-50 text-sm text-gray-700 transition-colors flex items-center gap-2"
                    onClick={() => generatePlan(cmd)}
                  >
                    <ChevronRight className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    {cmd}
                  </button>
                ))}
              </div>
            </>
          )}

          {loading && (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">{t("Generating action plan...")}</p>
            </div>
          )}

          {plan && (
            <Card className="border-blue-200 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{t("Action Plan")}</CardTitle>
                  <Badge variant="outline" className={riskColors[plan.risk]}>
                    {plan.risk === "low" && t("Low Risk")}
                    {plan.risk === "medium" && t("Medium Risk")}
                    {plan.risk === "high" && t("High Risk")}
                    {plan.risk === "high" && (
                      <AlertTriangle className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">{plan.summary}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {plan.systems.map((system) => (
                    <Badge
                      key={system}
                      variant="secondary"
                      className="text-xs"
                    >
                      {system}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {plan.steps.map((step) => (
                  <div
                    key={step.id}
                    className={cn(
                      "flex items-start gap-3 px-3 py-2.5 rounded-lg border transition-all",
                      step.status === "done"
                        ? "bg-emerald-50 border-emerald-200"
                        : step.status === "executing"
                        ? "bg-blue-50 border-blue-200"
                        : "bg-gray-50 border-gray-200"
                    )}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {step.status === "done" ? (
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      ) : step.status === "executing" ? (
                        <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                          <span className="text-xs text-gray-400">{step.id}</span>
                        </div>
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-sm",
                        step.status === "done"
                          ? "text-emerald-800"
                          : step.status === "executing"
                          ? "text-blue-800 font-medium"
                          : "text-gray-700"
                      )}
                    >
                      {step.action}
                    </span>
                  </div>
                ))}

                {executionComplete && (
                  <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                    <p className="text-sm font-medium text-emerald-800">
                      {t("All actions completed successfully")}
                    </p>
                  </div>
                )}

                {!executionComplete && (
                  <div className="flex gap-2 pt-3">
                    <Button
                      onClick={executePlan}
                      disabled={executing}
                      className="bg-blue-700 hover:bg-blue-800 flex-1"
                    >
                      {executing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t("Executing...")}
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          {t("Execute Plan")}
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={cancelPlan}
                      disabled={executing}
                    >
                      {t("Cancel")}
                    </Button>
                  </div>
                )}

                {executionComplete && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={cancelPlan}
                      className="flex-1"
                    >
                      {t("New Command")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <form
          onSubmit={(e) => { e.preventDefault(); generatePlan(); }}
          className="flex gap-2 max-w-3xl mx-auto"
        >
          <Input
            placeholder={t("Describe what you need done across systems...")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading || executing}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={loading || executing || !input.trim()}
            className="bg-blue-700 hover:bg-blue-800"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
