"use client";

import {
  Users,
  AlertTriangle,
  LogOut,
  Pill,
  FlaskConical,
  Calendar,
  FileText,
  Shield,
  Activity,
  BedDouble,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { LucideIcon } from "lucide-react";

interface ActivityItem {
  id: string;
  time: Date;
  type: string;
  message: string;
  user: string;
}

const typeConfig: Record<string, { icon: LucideIcon; color: string }> = {
  admission: { icon: Users, color: "text-blue-600 bg-blue-50" },
  alert: { icon: AlertTriangle, color: "text-amber-600 bg-amber-50" },
  discharge: { icon: LogOut, color: "text-green-600 bg-green-50" },
  medication: { icon: Pill, color: "text-purple-600 bg-purple-50" },
  lab: { icon: FlaskConical, color: "text-cyan-600 bg-cyan-50" },
  appointment: { icon: Calendar, color: "text-indigo-600 bg-indigo-50" },
  note: { icon: FileText, color: "text-gray-600 bg-gray-50" },
  acc: { icon: Shield, color: "text-teal-600 bg-teal-50" },
  vitals: { icon: Activity, color: "text-red-600 bg-red-50" },
  bed: { icon: BedDouble, color: "text-orange-600 bg-orange-50" },
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

interface ActivityFeedProps {
  items: ActivityItem[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <ScrollArea className="h-[300px] md:h-[400px] custom-scrollbar">
      <div className="space-y-1 pr-3">
        {items.map((item) => {
          const config = typeConfig[item.type] || {
            icon: Activity,
            color: "text-gray-600 bg-gray-50",
          };
          const Icon = config.icon;
          const [iconColor, iconBg] = config.color.split(" ");

          return (
            <div
              key={item.id}
              className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className={`p-1.5 rounded-lg shrink-0 ${iconBg}`}>
                <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-snug">
                  {item.message}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{item.user}</span>
                  <span className="text-xs text-muted-foreground/50">|</span>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(item.time)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
