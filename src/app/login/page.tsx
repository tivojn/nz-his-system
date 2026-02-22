"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hospital, Shield, Activity, Users, Lock, Mail, Languages } from "lucide-react";
import type { Language } from "@/components/bilingual-provider";

const demoAccounts = [
  { email: "admin@nzhis.co.nz", role: "Admin", name: "Dr. Sarah Mitchell", icon: Shield },
  { email: "doctor@nzhis.co.nz", role: "Doctor", name: "Dr. James Henare", icon: Activity },
  { email: "nurse@nzhis.co.nz", role: "Nurse", name: "Aroha Williams", icon: Users },
  { email: "reception@nzhis.co.nz", role: "Receptionist", name: "Mele Taufa", icon: Mail },
];

const demoUsers: Record<string, any> = {
  "admin@nzhis.co.nz": { id: "1", email: "admin@nzhis.co.nz", name: "Dr. Sarah Mitchell", role: "Admin", department: "Administration" },
  "doctor@nzhis.co.nz": { id: "2", email: "doctor@nzhis.co.nz", name: "Dr. James Henare", role: "Doctor", department: "General Medicine" },
  "nurse@nzhis.co.nz": { id: "3", email: "nurse@nzhis.co.nz", name: "Aroha Williams", role: "Nurse", department: "Emergency" },
  "reception@nzhis.co.nz": { id: "4", email: "reception@nzhis.co.nz", name: "Mele Taufa", role: "Receptionist", department: "Front Desk" },
};

const roleColors: Record<string, string> = {
  Admin: "bg-purple-100 text-purple-800 border-purple-200",
  Doctor: "bg-blue-100 text-blue-800 border-blue-200",
  Nurse: "bg-green-100 text-green-800 border-green-200",
  Receptionist: "bg-orange-100 text-orange-800 border-orange-200",
};

const features: Record<Language, { title: string; desc: string }[]> = {
  en: [
    { title: "FHIR R4 Compliant", desc: "Full HL7 FHIR integration for clinical data exchange" },
    { title: "AI-Powered CDSS", desc: "Clinical decision support with intelligent alerts" },
    { title: "Hauora Equity", desc: "Cultural health equity tracking and reporting" },
    { title: "ACC Integration", desc: "Seamless ACC claims management workflow" },
  ],
  cn: [
    { title: "FHIR R4 标准", desc: "完整的 HL7 FHIR 临床数据交换集成" },
    { title: "AI 临床决策支持", desc: "智能预警的临床决策支持系统" },
    { title: "健康公平", desc: "文化健康公平追踪与报告" },
    { title: "ACC 理赔集成", desc: "无缝的 ACC 理赔管理工作流" },
  ],
  mi: [
    { title: "FHIR R4 Compliant", desc: "Full HL7 FHIR integration for clinical data exchange" },
    { title: "AI-Powered CDSS", desc: "Clinical decision support with intelligent alerts" },
    { title: "Hauora Equity", desc: "Cultural health equity tracking and reporting" },
    { title: "ACC Integration", desc: "Seamless ACC claims management workflow" },
  ],
};

const welcomeText: Record<Language, { primary: string; secondary: string }> = {
  en: { primary: "Welcome", secondary: "Nau mai, haere mai" },
  cn: { primary: "欢迎使用", secondary: "Welcome" },
  mi: { primary: "Nau mai, haere mai", secondary: "Welcome" },
};

const greetingText: Record<Language, { title: string; subtitle: string }> = {
  en: { title: "Kia ora", subtitle: "Sign in to access the clinical portal" },
  cn: { title: "你好", subtitle: "登录以访问临床门户" },
  mi: { title: "Kia ora", subtitle: "Sign in to access the clinical portal" },
};

export default function LoginPage() {
  const [email, setEmail] = useState("doctor@nzhis.co.nz");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<Language>("en");
  const router = useRouter();

  const cycleLang = () => {
    setLang((prev) => (prev === "en" ? "cn" : prev === "cn" ? "mi" : "en"));
  };

  const doLogin = (loginEmail: string, loginPassword: string) => {
    if (loginPassword !== "demo123") {
      setError("Invalid password. Use demo123");
      setLoading(false);
      return;
    }
    const user = demoUsers[loginEmail];
    if (!user) {
      setError("User not found");
      setLoading(false);
      return;
    }
    const encoded = btoa(JSON.stringify(user));
    document.cookie = `nzhis-session=${encoded}; path=/; max-age=86400; SameSite=Lax`;
    router.push("/patients");
  };

  const handleLogin = (e: React.FormEvent, loginEmail?: string) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    doLogin(loginEmail || email, loginEmail ? "demo123" : password);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left: Hero Panel */}
      <div className="relative lg:w-1/2 gradient-hero overflow-hidden">
        <div className="absolute inset-0 koru-pattern opacity-30" />
        <div className="relative flex flex-col justify-center items-center min-h-[40vh] lg:min-h-screen p-8 lg:p-16">
          {/* Glassmorphism card */}
          <div className="glass-dark rounded-2xl p-8 lg:p-10 max-w-md w-full text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-2">
              <Hospital className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight">NZ-HIS</h1>
              <p className="text-teal-100/80 mt-1 text-sm">Hospital Information System</p>
              <p className="text-teal-200/60 text-xs mt-1">Te Whatu Ora &middot; Health New Zealand</p>
            </div>

            <div className="border-t border-white/10 pt-6">
              <p className="text-2xl font-light text-white italic">{welcomeText[lang].primary}</p>
              <p className="text-teal-200/70 text-sm mt-1">{welcomeText[lang].secondary}</p>
            </div>

            <div className="space-y-3 text-left">
              {features[lang].map((f) => (
                <div key={f.title} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white">{f.title}</p>
                    <p className="text-xs text-teal-200/60">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-8 text-xs text-teal-200/40 text-center">
            Secure clinical platform &middot; NZ Health Standards
          </p>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-16 bg-white">
        <div className="w-full max-w-sm space-y-8">
          {/* Greeting */}
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{greetingText[lang].title}</h2>
              <button
                onClick={cycleLang}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-teal-700 transition-colors px-2 py-1 rounded-md hover:bg-teal-50"
              >
                <Languages className="h-3.5 w-3.5" />
                {lang === "en" ? "EN" : lang === "cn" ? "\u4E2D\u6587" : "Mi"}
              </button>
            </div>
            <p className="text-gray-500 mt-1 text-sm">{greetingText[lang].subtitle}</p>
          </div>

          {/* Login form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="doctor@nzhis.co.nz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-teal-700 hover:bg-teal-800"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-gray-400">Quick Demo Access</span>
            </div>
          </div>

          {/* Demo accounts */}
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                onClick={(e) => handleLogin(e, account.email)}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 hover:border-teal-300 hover:bg-teal-50/50 transition-all text-left group"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-teal-100 transition-colors">
                  <account.icon className="h-4 w-4 text-gray-500 group-hover:text-teal-600 transition-colors" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-700">{account.role}</p>
                  <p className="text-[10px] text-gray-400 truncate">{account.name}</p>
                </div>
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400">
            Demo system &middot; Password: demo123
          </p>
        </div>
      </div>
    </div>
  );
}
