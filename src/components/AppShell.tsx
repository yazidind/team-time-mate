import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { Home, Clock, FileText, Wallet, User, Users, BarChart3, ClipboardCheck, LogOut } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative shadow-elegant">
      {/* Top bar */}
      <header className="safe-top sticky top-0 z-40 bg-gradient-hero text-white px-5 pt-4 pb-5 rounded-b-3xl shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs opacity-80">{isAdmin ? "Admin Panel" : "Selamat datang"}</p>
            <h1 className="text-lg font-semibold">{user.name}</h1>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/15 rounded-full"
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
            aria-label="Keluar"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 py-5 pb-28">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card/95 backdrop-blur border-t border-border safe-bottom z-50">
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
