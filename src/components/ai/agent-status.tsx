"use client";

import { cn } from "@/lib/utils";

type AgentStatusType = "available" | "processing" | "idle";

interface AgentStatusProps {
  name: string;
  status: AgentStatusType;
}

const statusConfig: Record<AgentStatusType, { label: string; dotClass: string }> = {
  available: { label: "Available", dotClass: "bg-emerald-500" },
  processing: { label: "Processing", dotClass: "bg-amber-500 animate-pulse" },
  idle: { label: "Idle", dotClass: "bg-gray-400" },
};

export function AgentStatus({ name, status }: AgentStatusProps) {
  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700">{name}</span>
      <div className="flex items-center gap-1.5">
        <div className={cn("w-2 h-2 rounded-full", config.dotClass)} />
        <span className="text-xs text-gray-500">{config.label}</span>
      </div>
    </div>
  );
}
