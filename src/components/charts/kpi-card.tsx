"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: number | string;
  trend: number;
  icon: LucideIcon;
  sparklineData: number[];
  color?: string;
}

export function KpiCard({
  title,
  value,
  trend,
  icon: Icon,
  sparklineData,
  color = "#0d9488",
}: KpiCardProps) {
  const isPositive = trend >= 0;
  const chartData = sparklineData.map((v, i) => ({ i, v }));

  return (
    <Card className="card-hover border-0 shadow-sm overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
            <div className="flex items-center gap-1 mt-2">
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              )}
              <span
                className={`text-xs font-medium ${
                  isPositive ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {isPositive ? "+" : ""}
                {trend}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs last week</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="p-2.5 rounded-xl bg-teal-50">
              <Icon className="h-5 w-5 text-teal-600" />
            </div>
            <div className="w-20 h-8 sparkline-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke={color}
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
