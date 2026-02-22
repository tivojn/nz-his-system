"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Users,
  FileText,
  Pill,
  BrainCircuit,
  Calendar,
  Clock,
  BedDouble,
  Shield,
  BarChart3,
  HeartPulse,
  History,
  Network,
  ScanEye,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Languages,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useBilingual } from "@/components/bilingual-provider";
import { BilingualLabel } from "@/components/bilingual-label";

function getSession() {
  const match = document.cookie.match(/nzhis-session=([^;]+)/);
  if (!match) return null;
  try {
    return JSON.parse(atob(decodeURIComponent(match[1])));
  } catch {
    return null;
  }
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  badge?: number;
}

interface NavGroup {
  label: string;
  teReo: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Clinical",
    teReo: "Hauora Haumanu",
    items: [
      { name: "Patients", href: "/patients", icon: Users, roles: ["Admin", "Doctor", "Nurse", "Receptionist"] },
      { name: "Clinical EMR", href: "/clinical", icon: FileText, roles: ["Admin", "Doctor", "Nurse"] },
      { name: "Medications", href: "/medications", icon: Pill, roles: ["Admin", "Doctor", "Nurse"] },
      { name: "CDSS", href: "/cdss", icon: BrainCircuit, roles: ["Admin", "Doctor", "Nurse"], badge: 3 },
    ],
  },
  {
    label: "Operations",
    teReo: "Whakahaere",
    items: [
      { name: "Appointments", href: "/appointments", icon: Calendar, roles: ["Admin", "Doctor", "Nurse", "Receptionist"] },
      { name: "Waitlist", href: "/waitlist", icon: Clock, roles: ["Admin", "Doctor", "Nurse"], badge: 2 },
      { name: "Bed Management", href: "/beds", icon: BedDouble, roles: ["Admin", "Doctor", "Nurse"] },
      { name: "ACC Claims", href: "/acc", icon: Shield, roles: ["Admin", "Doctor"] },
    ],
  },
  {
    label: "Analytics",
    teReo: "Tātaritanga",
    items: [
      { name: "Dashboard", href: "/", icon: BarChart3, roles: ["Admin", "Doctor", "Nurse", "Receptionist"] },
      { name: "Hauora Equity", href: "/hauora", icon: HeartPulse, roles: ["Admin", "Doctor", "Nurse"] },
      { name: "Audit Trail", href: "/audit", icon: History, roles: ["Admin"] },
    ],
  },
  {
    label: "AI Tools",
    teReo: "Taputapu AI",
    items: [
      { name: "AI Commander", href: "/ai-agent", icon: Network, roles: ["Admin", "Doctor", "Nurse"] },
      { name: "AI Diagnosis", href: "/diagnosis", icon: ScanEye, roles: ["Admin", "Doctor", "Nurse"] },
    ],
  },
];

const roleColors: Record<string, string> = {
  Admin: "bg-purple-100 text-purple-800",
  Doctor: "bg-blue-100 text-blue-800",
  Nurse: "bg-green-100 text-green-800",
  Receptionist: "bg-orange-100 text-orange-800",
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    Clinical: true,
    Operations: true,
    Analytics: true,
    "AI Tools": true,
  });
  const { language, toggleTeReo, t } = useBilingual();

  useEffect(() => {
    setSession(getSession());
  }, []);

  const role = session?.role || "Doctor";

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleSignOut = () => {
    document.cookie = "nzhis-session=; path=/; max-age=0";
    router.push("/login");
  };

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  const sidebarContent = (
    <div className="flex h-full flex-col koru-pattern">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-teal-700/30">
        <div className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-xl">
          <HeartPulse className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">NZ-HIS</h1>
          <p className="text-xs text-teal-200/70">Te Whatu Ora</p>
        </div>
      </div>

      {/* User info */}
      {session && (
        <div className="px-4 py-4 border-b border-teal-700/30">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/15 text-white text-sm font-semibold">
              {session.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{session.name}</p>
              <p className="text-xs text-teal-200/60 truncate">{session.email}</p>
            </div>
          </div>
          <Badge className={cn("mt-2 text-xs", roleColors[role])}>
            {role}
          </Badge>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto custom-scrollbar">
        {navGroups.map((group) => {
          const filteredItems = group.items.filter((item) => item.roles.includes(role));
          if (filteredItems.length === 0) return null;

          return (
            <Collapsible
              key={group.label}
              open={expandedGroups[group.label]}
              onOpenChange={() => toggleGroup(group.label)}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-teal-300/80 uppercase tracking-wider hover:text-teal-200 transition-colors group">
                <BilingualLabel
                  subtitleClassName="block text-[9px] opacity-50 font-normal lowercase tracking-normal leading-tight"
                >
                  {group.label}
                </BilingualLabel>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    expandedGroups[group.label] ? "rotate-0" : "-rotate-90"
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-0.5 mt-0.5">
                {filteredItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all relative",
                        active
                          ? "bg-white/15 text-white shadow-sm nav-active-indicator"
                          : "text-teal-100/70 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
                      <BilingualLabel
                        subtitleClassName="block text-[9px] opacity-50 font-normal leading-tight"
                      >
                        {item.name}
                      </BilingualLabel>
                      {item.badge && (
                        <span className="ml-auto flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-teal-700/30 space-y-3">
        {/* Language toggle */}
        <button
          onClick={toggleTeReo}
          className="flex items-center justify-between w-full px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-2 text-teal-200/70">
            <Languages className="h-4 w-4" />
            <span className="text-xs font-medium">{t("Language")}</span>
          </div>
          <span className="text-xs font-semibold text-white bg-white/15 px-2 py-0.5 rounded-md">
            {language === "en" ? "EN" : language === "cn" ? "\u4E2D\u6587" : "Mi"}
          </span>
        </button>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-teal-100/70 hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut className="h-4.5 w-4.5" />
          {t("Sign Out")}
        </button>
        <p className="px-3 text-xs text-teal-200/40">
          Te Whatu Ora · FHIR R4
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-teal-700 text-white hover:bg-teal-600"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 gradient-sidebar transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
