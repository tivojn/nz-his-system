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
  ShieldAlert,
  FlaskConical,
  BarChart3,
  HeartPulse,
  History,
  Network,
  ScanEye,
  Send,
  AlertTriangle,
  UserCog,
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
    label: "Operations",
    teReo: "Whakahaere",
    items: [
      { name: "Appointments", href: "/appointments", icon: Calendar, roles: ["Admin", "Doctor", "Nurse", "Receptionist"] },
      { name: "Waitlist", href: "/waitlist", icon: Clock, roles: ["Admin", "Doctor", "Nurse"], badge: 2 },
      { name: "Bed Management", href: "/beds", icon: BedDouble, roles: ["Admin", "Doctor", "Nurse"] },
      { name: "Referrals", href: "/referrals", icon: Send, roles: ["Admin", "Doctor", "Nurse"] },
      { name: "ACC Claims", href: "/acc", icon: Shield, roles: ["Admin", "Doctor"] },
      { name: "Incident Reports", href: "/incidents", icon: AlertTriangle, roles: ["Admin", "Doctor", "Nurse"] },
    ],
  },
  {
    label: "Clinical",
    teReo: "Hauora Haumanu",
    items: [
      { name: "Patients", href: "/patients", icon: Users, roles: ["Admin", "Doctor", "Nurse", "Receptionist"] },
      { name: "Lab Orders", href: "/lab-orders", icon: FlaskConical, roles: ["Admin", "Doctor", "Nurse", "lab-tech"] },
      { name: "Clinical EMR", href: "/clinical", icon: FileText, roles: ["Admin", "Doctor", "Nurse"] },
      { name: "Medications", href: "/medications", icon: Pill, roles: ["Admin", "Doctor", "Nurse"] },
      { name: "Allergies", href: "/allergies", icon: ShieldAlert, roles: ["Admin", "Doctor", "Nurse"] },
      { name: "CDSS", href: "/cdss", icon: BrainCircuit, roles: ["Admin", "Doctor", "Nurse"], badge: 3 },
    ],
  },
  {
    label: "Analytics",
    teReo: "Tātaritanga",
    items: [
      { name: "Dashboard", href: "/", icon: BarChart3, roles: ["Admin", "Doctor", "Nurse", "Receptionist"] },
      { name: "Hauora Equity", href: "/hauora", icon: HeartPulse, roles: ["Admin", "Doctor", "Nurse"] },
      { name: "Staff Management", href: "/staff", icon: UserCog, roles: ["Admin"] },
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
    Operations: true,
    Clinical: true,
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
    <div className="flex h-full flex-col">
      {/* Header — fixed, darkest */}
      <div className="flex items-center gap-3 px-6 py-5 bg-[#0a2725] border-b border-teal-600/20">
        <div className="flex items-center justify-center w-10 h-10 bg-teal-500/20 rounded-xl ring-1 ring-teal-400/20">
          <HeartPulse className="h-6 w-6 text-teal-300" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">NZ-HIS</h1>
          <p className="text-xs text-teal-300/60">Te Whatu Ora</p>
        </div>
      </div>

      {/* User info — fixed, dark */}
      {session && (
        <div className="px-4 py-4 bg-[#0a2725] border-b border-teal-600/20">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-teal-500/20 text-teal-200 text-sm font-semibold ring-1 ring-teal-400/20">
              {session.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{session.name}</p>
              <p className="text-xs text-teal-300/50 truncate">{session.email}</p>
            </div>
          </div>
          <Badge className={cn("mt-2 text-xs", roleColors[role])}>
            {role}
          </Badge>
        </div>
      )}

      {/* Navigation — scrollable, lighter teal with koru pattern */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto custom-scrollbar bg-[#11403d] koru-pattern">
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

      {/* Footer — fixed, darkest to match header */}
      <div className="px-3 py-3 bg-[#0a2725] border-t border-teal-600/20 space-y-2">
        {/* Language toggle */}
        <button
          onClick={toggleTeReo}
          className="flex items-center justify-between w-full px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-2 text-teal-300/70">
            <Languages className="h-4 w-4" />
            <span className="text-xs font-medium">{t("Language")}</span>
          </div>
          <span className="text-xs font-semibold text-teal-200 bg-teal-500/20 px-2 py-0.5 rounded-md ring-1 ring-teal-400/20">
            {language === "en" ? "EN" : language === "cn" ? "\u4E2D\u6587" : "Mi"}
          </span>
        </button>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-teal-200/60 hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut className="h-4.5 w-4.5" />
          {t("Sign Out")}
        </button>
        <p className="px-3 text-[10px] text-teal-300/30">
          Te Whatu Ora · FHIR R4
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar — in document flow, not floating */}
      <div className="sticky top-0 z-30 lg:hidden gradient-sidebar flex items-center gap-3 px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/15 h-9 w-9"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <HeartPulse className="h-5 w-5 text-white flex-shrink-0" />
          <span className="text-sm font-bold text-white truncate">NZ-HIS</span>
          <span className="text-xs text-teal-200/60 truncate">Te Whatu Ora</span>
        </div>
        {session && (
          <Badge className={cn("text-[10px] flex-shrink-0", roleColors[role])}>
            {role}
          </Badge>
        )}
      </div>

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
