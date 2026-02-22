"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BrainCircuit, Shield, BookOpen, Network, Command } from "lucide-react";
import { AgentTab } from "@/components/ai/agent-tab";
import { CommanderPanel } from "@/components/ai/commander-panel";

const agents = [
  {
    id: "clinical" as const,
    name: "Hauora Clinical AI",
    icon: BrainCircuit,
    color: "teal" as const,
    description: "Clinical decision support, patient summaries, diagnosis assistance",
    welcome:
      "Kia ora! I'm Hauora Clinical AI -- your clinical decision support assistant.\n\nI can help with patient summaries, drug interactions, clinical notes, early warning scores, discharge planning, and evidence-based clinical guidance.\n\nTry one of the suggested prompts below, or ask me anything clinical.",
    prompts: [
      "Summarise patient AAA1234",
      "What are the drug interactions for Warfarin?",
      "Generate SOAP note for chest pain presentation",
      "Calculate NEWS2 for HR 95, BP 100/60, RR 22, Temp 38.5, SpO2 94%, Alert",
    ],
  },
  {
    id: "quality" as const,
    name: "Kounga Quality AI",
    icon: Shield,
    color: "amber" as const,
    description: "Audit compliance, quality metrics, policy adherence",
    welcome:
      "Kia ora! I'm Kounga Quality AI -- your quality improvement and compliance assistant.\n\nI can help with documentation audits, quality reports, readmission analysis, prescribing audits, wait time analysis, and KPI monitoring.\n\nTry one of the suggested prompts below.",
    prompts: [
      "Check documentation compliance for ward 3",
      "Generate monthly quality report",
      "Identify readmission patterns",
      "Review antibiotic prescribing audit",
    ],
  },
  {
    id: "research" as const,
    name: "Rangahau Research AI",
    icon: BookOpen,
    color: "purple" as const,
    description: "Evidence-based medicine, clinical guidelines, literature review",
    welcome:
      "Kia ora! I'm Rangahau Research AI -- your evidence-based medicine assistant.\n\nI can help with clinical guideline summaries, surgical evidence reviews, disease management protocols, and NZ-specific clinical guidance.\n\nTry one of the suggested prompts below.",
    prompts: [
      "Latest guidelines for sepsis management",
      "Evidence for ACL reconstruction timing",
      "Compare diabetes management protocols",
      "NZ-specific cardiovascular risk guidelines",
    ],
  },
] as const;

const tabColors: Record<string, { active: string; indicator: string }> = {
  clinical: {
    active: "data-[state=active]:text-teal-700",
    indicator: "data-[state=active]:after:bg-teal-600",
  },
  quality: {
    active: "data-[state=active]:text-amber-700",
    indicator: "data-[state=active]:after:bg-amber-600",
  },
  research: {
    active: "data-[state=active]:text-purple-700",
    indicator: "data-[state=active]:after:bg-purple-600",
  },
};

export default function AIAgentPage() {
  const [commanderMode, setCommanderMode] = useState(false);

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col page-enter">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Network className="h-7 w-7 text-teal-600" />
            AI Clinical Commander
          </h1>
          <p className="text-gray-500 mt-1">
            Multi-agent AI assistant for clinical, quality, and research support
          </p>
        </div>

        {/* Commander Mode Toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="commander-mode"
                  className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-1.5"
                >
                  <Command className="h-4 w-4" />
                  Commander Mode
                </Label>
                <Switch
                  id="commander-mode"
                  checked={commanderMode}
                  onCheckedChange={setCommanderMode}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p>
                Commander Mode lets you issue natural language commands that
                generate multi-system action plans spanning pharmacy, bed
                management, ACC claims, and more.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Main content */}
      <Card className="flex-1 border-0 shadow-sm flex flex-col overflow-hidden">
        {commanderMode ? (
          <CommanderPanel />
        ) : (
          <Tabs defaultValue="clinical" className="flex flex-col h-full">
            <TabsList variant="line" className="px-4 border-b w-full justify-start gap-0">
              {agents.map((agent) => {
                const colors = tabColors[agent.id];
                return (
                  <TabsTrigger
                    key={agent.id}
                    value={agent.id}
                    className={`gap-2 ${colors.active} ${colors.indicator}`}
                  >
                    <agent.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{agent.name}</span>
                    <span className="sm:hidden">{agent.name.split(" ")[0]}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {agents.map((agent) => (
              <TabsContent
                key={agent.id}
                value={agent.id}
                className="flex-1 overflow-hidden mt-0"
              >
                <AgentTab
                  agentName={agent.name}
                  agentType={agent.id}
                  agentColor={agent.color}
                  agentIcon={agent.icon}
                  examplePrompts={[...agent.prompts]}
                  welcomeMessage={agent.welcome}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </Card>
    </div>
  );
}
