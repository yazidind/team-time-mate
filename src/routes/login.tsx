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
    <div className="min-h-screen bg-gradient-hero md:flex md:bg-secondary/40">
      <Toaster />

      <section className="hidden min-h-screen flex-1 flex-col justify-between bg-gradient-hero px-12 py-10 text-white md:flex lg:px-16">
        <div className="max-w-2xl">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 shadow-glow backdrop-blur">
            <Clock className="h-8 w-8" />
          </div>
          <h1 className="mt-8 text-5xl font-bold tracking-tight lg:text-6xl">AbsenPay</h1>
          <p className="mt-5 text-lg leading-8 text-white/80">
            Dashboard absensi dan payroll untuk tim operasional.
          </p>
        </div>

        <div className="grid max-w-3xl grid-cols-3 gap-4">
          <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
            <p className="text-2xl font-bold">GPS</p>
            <p className="mt-1 text-sm text-white/75">Absensi berbasis lokasi</p>
          </div>
          <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
            <p className="text-2xl font-bold">HR</p>
            <p className="mt-1 text-sm text-white/75">Kelola izin dan karyawan</p>
          </div>
          <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
            <p className="text-2xl font-bold">Pay</p>
            <p className="mt-1 text-sm text-white/75">Slip gaji bulanan</p>
          </div>
        </div>
      </section>

      <main className="flex min-h-screen w-full items-center justify-center px-5 py-8 md:w-[460px] md:flex-none md:bg-background md:px-10 lg:w-[500px]">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center text-white md:text-foreground">
            <div className="mb-5 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 shadow-glow backdrop-blur md:bg-primary/10 md:text-primary md:shadow-card">
              <Clock className="h-9 w-9" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">AbsenPay</h1>
            <p className="mt-2 text-sm text-white/80 md:text-muted-foreground">
              Absensi & Payroll dalam genggaman
            </p>
          </div>

          <Card className="rounded-2xl border-0 bg-white p-6 text-foreground shadow-elegant md:border md:border-border md:shadow-card">
            <h2 className="text-xl font-semibold">Masuk</h2>
            <p className="mt-1 mb-5 text-sm text-muted-foreground">Gunakan akun Anda</p>
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
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1.5 h-11"
                />
              </div>
              <Button type="submit" className="h-11 w-full bg-gradient-primary shadow-card hover:opacity-95">
                Masuk
              </Button>
            </form>
          </Card>

          <div className="mt-6 space-y-2">
            <p className="mb-2 text-center text-xs text-white/70 md:text-muted-foreground">
              Akun Demo (klik untuk login)
            </p>
            <button
              onClick={() => quickLogin("admin@demo.com", "admin123")}
              className="flex w-full items-center gap-3 rounded-xl bg-white/10 p-3 text-left text-white backdrop-blur transition hover:bg-white/20 md:bg-card md:text-foreground md:shadow-card md:hover:bg-accent"
            >
              <ShieldCheck className="h-5 w-5 flex-none" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Admin HR</p>
                <p className="truncate text-xs text-white/70 md:text-muted-foreground">
                  admin@demo.com / admin123
                </p>
              </div>
            </button>
            <button
              onClick={() => quickLogin("budi@demo.com", "karyawan123")}
              className="flex w-full items-center gap-3 rounded-xl bg-white/10 p-3 text-left text-white backdrop-blur transition hover:bg-white/20 md:bg-card md:text-foreground md:shadow-card md:hover:bg-accent"
            >
              <User className="h-5 w-5 flex-none" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Karyawan - Budi Santoso</p>
                <p className="truncate text-xs text-white/70 md:text-muted-foreground">
                  budi@demo.com / karyawan123
                </p>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
