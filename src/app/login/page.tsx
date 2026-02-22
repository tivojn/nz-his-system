"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

const demoAccounts = [
  { email: "admin@nzhis.co.nz", role: "Admin", name: "Dr. Sarah Mitchell" },
  { email: "doctor@nzhis.co.nz", role: "Doctor", name: "Dr. James Henare" },
  { email: "nurse@nzhis.co.nz", role: "Nurse", name: "Aroha Williams" },
  { email: "reception@nzhis.co.nz", role: "Receptionist", name: "Mele Taufa" },
];

const demoUsers: Record<string, any> = {
  "admin@nzhis.co.nz": { id: "1", email: "admin@nzhis.co.nz", name: "Dr. Sarah Mitchell", role: "Admin", department: "Administration" },
  "doctor@nzhis.co.nz": { id: "2", email: "doctor@nzhis.co.nz", name: "Dr. James Henare", role: "Doctor", department: "General Medicine" },
  "nurse@nzhis.co.nz": { id: "3", email: "nurse@nzhis.co.nz", name: "Aroha Williams", role: "Nurse", department: "Emergency" },
  "reception@nzhis.co.nz": { id: "4", email: "reception@nzhis.co.nz", name: "Mele Taufa", role: "Receptionist", department: "Front Desk" },
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
    // Set cookie client-side
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl mb-4 shadow-lg">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">NZ-HIS</h1>
          <p className="text-gray-500 mt-1">Hospital Information System</p>
          <p className="text-xs text-teal-600 mt-1">Te Whatu Ora · Health New Zealand</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>Access the clinical portal</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="doctor@nzhis.co.nz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="demo123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full bg-teal-700 hover:bg-teal-800" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Quick Demo Access</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {demoAccounts.map((account) => (
              <Button
                key={account.email}
                variant="outline"
                size="sm"
                className="text-xs h-auto py-2 flex flex-col items-start"
                onClick={(e) => handleLogin(e, account.email)}
              >
                <span className="font-medium">{account.role}</span>
                <span className="text-gray-400 truncate w-full">{account.name}</span>
              </Button>
            ))}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400">
          Demo system · Password: demo123 · FHIR R4 compliant
        </p>
      </div>
    </div>
  );
}
