import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { Home, Clock, FileText, Wallet, Users, ClipboardCheck, LogOut } from "lucide-react";
import { useCurrentUser, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export function AppShell() {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useStore((s) => s.logout);

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user, navigate]);

  if (!user) return null;

  const isAdmin = user.role === "admin";
  const navItems = isAdmin
    ? [
        { to: "/admin", label: "Beranda", icon: Home },
        { to: "/admin/karyawan", label: "Karyawan", icon: Users },
        { to: "/admin/absensi", label: "Absensi", icon: ClipboardCheck },
        { to: "/admin/payroll", label: "Payroll", icon: Wallet },
      ]
    : [
        { to: "/app", label: "Beranda", icon: Home },
        { to: "/app/absensi", label: "Absensi", icon: Clock },
        { to: "/app/izin", label: "Izin", icon: FileText },
        { to: "/app/slip", label: "Slip Gaji", icon: Wallet },
      ];

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-background md:bg-secondary/40">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-border bg-card px-4 py-5 shadow-card md:flex">
        <div className="mb-8 px-2">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            {isAdmin ? "Admin Panel" : "Karyawan"}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">AbsenPay</h1>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const active =
              location.pathname === item.to ||
              (item.to !== "/admin" && item.to !== "/app" && location.pathname.startsWith(item.to));
            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground shadow-card"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="rounded-xl bg-secondary p-3">
          <p className="text-sm font-semibold text-foreground">{user.name}</p>
          <p className="text-xs text-muted-foreground">{isAdmin ? "Administrator" : user.position}</p>
          <Button
            variant="outline"
            className="mt-3 h-9 w-full justify-start gap-2 bg-card"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="safe-top sticky top-0 z-40 bg-gradient-hero px-5 pt-4 pb-5 text-white shadow-card md:hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs opacity-80">{isAdmin ? "Admin Panel" : "Selamat datang"}</p>
            <h1 className="text-lg font-semibold">{user.name}</h1>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/15 rounded-full"
            onClick={handleLogout}
            aria-label="Keluar"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="md:pl-72">
        {/* Desktop top bar */}
        <header className="sticky top-0 z-30 hidden border-b border-border bg-background/90 px-8 py-4 backdrop-blur md:block">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{isAdmin ? "Kelola operasional HR" : "Ringkasan kerja Anda"}</p>
              <h2 className="text-xl font-semibold text-foreground">{user.name}</h2>
            </div>
            <Button variant="outline" className="gap-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Keluar
            </Button>
          </div>
        </header>

        <main className="mx-auto max-w-md px-4 py-5 pb-28 md:max-w-6xl md:px-8 md:py-8 md:pb-10">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-border bg-card/95 backdrop-blur safe-bottom md:hidden">
        <div className="grid grid-cols-4 px-2 py-2">
          {navItems.map((item) => {
            const active =
              location.pathname === item.to ||
              (item.to !== "/admin" && item.to !== "/app" && location.pathname.startsWith(item.to));
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg transition-all ${
                    active ? "bg-primary/10 scale-110" : ""
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
