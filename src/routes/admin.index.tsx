import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, formatRupiah } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Users, ClipboardCheck, FileText, Wallet, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const users = useStore((s) => s.users);
  const attendance = useStore((s) => s.attendance);
  const leaves = useStore((s) => s.leaves);
  const payrolls = useStore((s) => s.payrolls);

  const today = new Date().toISOString().slice(0, 10);
  const employees = users.filter((u) => u.role === "karyawan");
  const todayAttCount = attendance.filter((a) => a.date === today && a.clockIn).length;
  const pendingLeaves = leaves.filter((l) => l.status === "pending").length;
  const totalPayroll = payrolls
    .filter((p) => p.period === today.slice(0, 7))
    .reduce((s, p) => s + p.total, 0);

  return (
    <div className="space-y-5">
      <Card className="p-5 bg-gradient-card border-0 shadow-card rounded-2xl">
        <p className="text-xs text-muted-foreground uppercase">Hari ini</p>
        <p className="font-semibold">{format(new Date(), "EEEE, d MMMM yyyy", { locale: idLocale })}</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat label="Total Karyawan" value={employees.length.toString()} icon={Users} />
          <Stat label="Hadir Hari Ini" value={`${todayAttCount}/${employees.length}`} icon={ClipboardCheck} />
          <Stat label="Izin Pending" value={pendingLeaves.toString()} icon={FileText} />
          <Stat label="Payroll Bulan Ini" value={totalPayroll ? formatRupiah(totalPayroll) : "—"} icon={Wallet} small />
        </div>
      </Card>

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1">Manajemen</h2>
        <div className="grid grid-cols-2 gap-3">
          <Tile to="/admin/karyawan" icon={Users} label="Karyawan" desc="Tambah / edit" />
          <Tile to="/admin/absensi" icon={ClipboardCheck} label="Absensi" desc="Pantau hari ini" />
          <Tile to="/admin/izin" icon={FileText} label="Izin & Cuti" desc={`${pendingLeaves} pending`} />
          <Tile to="/admin/payroll" icon={Wallet} label="Payroll" desc="Generate gaji" />
        </div>
      </div>

      {/* Aktivitas */}
      <Card className="p-4 border-0 shadow-card rounded-2xl">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Absensi Terbaru</h3>
        </div>
        <div className="space-y-2">
          {attendance
            .filter((a) => a.date === today)
            .slice(0, 5)
            .map((a) => {
              const u = users.find((x) => x.id === a.userId);
              return (
                <div key={a.id} className="flex items-center justify-between text-sm">
                  <span>{u?.name}</span>
                  <span className="text-muted-foreground">
                    {a.clockIn ? format(new Date(a.clockIn), "HH:mm") : "—"}
                  </span>
                </div>
              );
            })}
          {attendance.filter((a) => a.date === today).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-3">Belum ada yang absen</p>
          )}
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value, icon: Icon, small }: { label: string; value: string; icon: any; small?: boolean }) {
  return (
    <div className="p-3 rounded-xl bg-background">
      <Icon className="h-4 w-4 text-primary mb-1.5" />
      <p className="text-[10px] text-muted-foreground uppercase">{label}</p>
      <p className={`font-bold ${small ? "text-sm" : "text-lg"} truncate`}>{value}</p>
    </div>
  );
}

function Tile({ to, icon: Icon, label, desc }: { to: string; icon: any; label: string; desc: string }) {
  return (
    <Link to={to}>
      <Card className="p-4 border-0 shadow-card rounded-2xl hover:shadow-elegant active:scale-95 transition">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <p className="font-semibold text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </Card>
    </Link>
  );
}
