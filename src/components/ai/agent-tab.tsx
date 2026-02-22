"use client";

import { useState, useRef, useEffect, type ElementType } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AgentStatus } from "./agent-status";
import { Send, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

type AgentColor = "teal" | "amber" | "purple";

interface AgentTabProps {
  agentName: string;
  agentType: "clinical" | "quality" | "research";
  agentColor: AgentColor;
  agentIcon: ElementType;
  examplePrompts: string[];
  welcomeMessage: string;
}

const colorMap: Record<AgentColor, {
  iconBg: string;
  iconText: string;
  userBubble: string;
  userTime: string;
  agentBubble: string;
  sendBtn: string;
  promptBorder: string;
}> = {
  teal: {
    iconBg: "bg-teal-100",
    iconText: "text-teal-700",
    userBubble: "bg-teal-700 text-white",
    userTime: "text-teal-200",
    agentBubble: "bg-teal-50 text-gray-900 border border-teal-100",
    sendBtn: "bg-teal-700 hover:bg-teal-800",
    promptBorder: "border-teal-200 hover:border-teal-400 hover:bg-teal-50 text-teal-800",
  },
  amber: {
    iconBg: "bg-amber-100",
    iconText: "text-amber-700",
    userBubble: "bg-amber-700 text-white",
    userTime: "text-amber-200",
    agentBubble: "bg-amber-50 text-gray-900 border border-amber-100",
    sendBtn: "bg-amber-700 hover:bg-amber-800",
    promptBorder: "border-amber-200 hover:border-amber-400 hover:bg-amber-50 text-amber-800",
  },
  purple: {
    iconBg: "bg-purple-100",
    iconText: "text-purple-700",
    userBubble: "bg-purple-700 text-white",
    userTime: "text-purple-200",
    agentBubble: "bg-purple-50 text-gray-900 border border-purple-100",
    sendBtn: "bg-purple-700 hover:bg-purple-800",
    promptBorder: "border-purple-200 hover:border-purple-400 hover:bg-purple-50 text-purple-800",
  },
};

export function AgentTab({
  agentName,
  agentType,
  agentColor,
  agentIcon: Icon,
  examplePrompts,
  welcomeMessage,
}: AgentTabProps) {
  const colors = colorMap[agentColor];
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: welcomeMessage, timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"available" | "processing" | "idle">("available");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const message = text || input;
    if (!message.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: message, timestamp: new Date() }]);
    setInput("");
    setLoading(true);
    setStatus("processing");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, agent: agentType }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message, timestamp: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error processing your request. Please try again.", timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
      setStatus("available");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Agent header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white/50">
        <div className="flex items-center gap-3">
          <div className={cn("w-9 h-9 rounded-full flex items-center justify-center", colors.iconBg)}>
            <Icon className={cn("h-5 w-5", colors.iconText)} />
          </div>
          <AgentStatus name={agentName} status={status} />
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "")}>
              {msg.role === "assistant" && (
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", colors.iconBg)}>
                  <Icon className={cn("h-4 w-4", colors.iconText)} />
                </div>
              )}
              <div
                className={cn(
                  "rounded-2xl px-4 py-3 max-w-[80%]",
                  msg.role === "user" ? colors.userBubble : colors.agentBubble
                )}
              >
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                <div
                  className={cn(
                    "text-xs mt-1",
                    msg.role === "user" ? colors.userTime : "text-gray-400"
                  )}
                >
                  {msg.timestamp.toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", colors.iconBg)}>
                <Icon className={cn("h-4 w-4 animate-pulse", colors.iconText)} />
              </div>
              <div className={cn("rounded-2xl px-4 py-3", colors.agentBubble)}>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Quick actions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
            <Sparkles className="h-3 w-3" /> Suggested prompts
          </div>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((prompt) => (
              <Button
                key={prompt}
                variant="outline"
                size="sm"
                className={cn("text-xs", colors.promptBorder)}
                onClick={() => sendMessage(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="flex gap-2 max-w-3xl mx-auto"
        >
          <Input
            placeholder={`Ask ${agentName}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className={colors.sendBtn}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
