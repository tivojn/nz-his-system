"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Clock,
  Bot,
  LogOut,
  Activity,
  Menu,
  X,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["admin", "doctor", "nurse", "receptionist"] },
  { name: "Patients", href: "/patients", icon: Users, roles: ["admin", "doctor", "nurse", "receptionist"] },
  { name: "Clinical EMR", href: "/clinical", icon: FileText, roles: ["admin", "doctor", "nurse"] },
  { name: "Appointments", href: "/appointments", icon: Calendar, roles: ["admin", "doctor", "nurse", "receptionist"] },
  { name: "Waitlist", href: "/waitlist", icon: Clock, roles: ["admin", "doctor", "nurse"] },
  { name: "AI Assistant", href: "/ai-agent", icon: Bot, roles: ["admin", "doctor", "nurse"] },
];

const roleColors: Record<string, string> = {
  admin: "bg-purple-100 text-purple-800",
  doctor: "bg-blue-100 text-blue-800",
  nurse: "bg-green-100 text-green-800",
  receptionist: "bg-orange-100 text-orange-800",
};

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = (session?.user as any)?.role || "doctor";

  const filteredNav = navigation.filter((item) => item.roles.includes(role));

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-teal-700/30">
        <div className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-xl">
          <Activity className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">NZ-HIS</h1>
          <p className="text-xs text-teal-200/70">Hospital Information System</p>
        </div>
      </div>

      {/* User Info */}
      {session?.user && (
        <div className="px-4 py-4 border-b border-teal-700/30">
          <p className="text-sm font-medium text-white truncate">{session.user.name}</p>
          <p className="text-xs text-teal-200/60 truncate">{session.user.email}</p>
          <Badge className={cn("mt-2 text-xs capitalize", roleColors[role])}>
            {role}
          </Badge>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-teal-100/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-teal-700/30">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-teal-100/70 hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
        <p className="px-3 mt-3 text-xs text-teal-200/40">
          Te Whatu Ora · FHIR R4
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
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
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-teal-800 to-teal-900 transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
