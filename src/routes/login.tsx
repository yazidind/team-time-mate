import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Clock, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const login = useStore((s) => s.login);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const u = login(email, password);
    if (!u) {
      toast.error("Email atau password salah");
      return;
    }
    toast.success(`Selamat datang, ${u.name}`);
    navigate({ to: u.role === "admin" ? "/admin" : "/app" });
  };

  const quickLogin = (em: string, pw: string) => {
    setEmail(em);
    setPassword(pw);
    const u = login(em, pw);
    if (u) navigate({ to: u.role === "admin" ? "/admin" : "/app" });
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col max-w-md mx-auto shadow-elegant">
      <Toaster />
      <div className="flex-1 flex flex-col justify-center px-6 py-10 text-white">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-white/15 backdrop-blur mb-5 shadow-glow">
            <Clock className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">AbsenPay</h1>
          <p className="text-white/80 mt-2 text-sm">Absensi & Payroll dalam genggaman</p>
        </div>

        <Card className="p-6 bg-white text-foreground shadow-elegant border-0 rounded-2xl">
          <h2 className="text-xl font-semibold mb-1">Masuk</h2>
          <p className="text-sm text-muted-foreground mb-5">Gunakan akun Anda</p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@perusahaan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1.5 h-11"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1.5 h-11"
              />
            </div>
            <Button type="submit" className="w-full h-11 bg-gradient-primary hover:opacity-95 shadow-card">
              Masuk
            </Button>
          </form>
        </Card>

        <div className="mt-6 space-y-2">
          <p className="text-xs text-white/70 text-center mb-2">Akun Demo (klik untuk login)</p>
          <button
            onClick={() => quickLogin("admin@demo.com", "admin123")}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur hover:bg-white/20 transition text-left"
          >
            <ShieldCheck className="h-5 w-5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Admin HR</p>
              <p className="text-xs text-white/70">admin@demo.com / admin123</p>
            </div>
          </button>
          <button
            onClick={() => quickLogin("budi@demo.com", "karyawan123")}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur hover:bg-white/20 transition text-left"
          >
            <User className="h-5 w-5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Karyawan — Budi Santoso</p>
              <p className="text-xs text-white/70">budi@demo.com / karyawan123</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
