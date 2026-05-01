import { createFileRoute, Link } from "@tanstack/react-router";
import { useCurrentUser, useStore, formatRupiah } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Clock, FileText, Wallet, MapPin, CheckCircle2, XCircle, type LucideIcon } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { dayNames, formatLocalDate, isScheduledWorkDate } from "@/lib/date";

export const Route = createFileRoute("/app/")({
  component: KaryawanHome,
});

function KaryawanHome() {
  const user = useCurrentUser()!;
  const attendance = useStore((s) => s.attendance);
  const payrolls = useStore((s) => s.payrolls);

  const today = formatLocalDate();
  const todayAtt = attendance.find((a) => a.userId === user.id && a.date === today);
  const isWorkDay = isScheduledWorkDate(today, user.offDay ?? 0);
  const monthPrefix = today.slice(0, 7);
  const monthCount = attendance.filter(
    (a) =>
      a.userId === user.id &&
      a.date.startsWith(monthPrefix) &&
      a.status === "hadir",
  ).length;
  const monthSickOrPermit = attendance.filter(
    (a) =>
      a.userId === user.id &&
      a.date.startsWith(monthPrefix) &&
      (a.status === "sakit" || a.status === "izin"),
  ).length;
  const lastSlip = payrolls
    .filter((p) => p.userId === user.id)
    .sort((a, b) => b.period.localeCompare(a.period))[0];

  return (
    <div className="space-y-5">
      {/* Status hari ini */}
      <Card className="p-5 bg-gradient-card shadow-card border-0 rounded-2xl">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Hari ini</p>
        <p className="text-base font-semibold mt-0.5">
          {format(new Date(), "EEEE, d MMMM yyyy", { locale: idLocale })}
        </p>
        <div className="mt-4">
          <div className="p-3 rounded-xl bg-success/10">
            <p className="text-[10px] text-muted-foreground uppercase">Status Absensi</p>
            <p className="text-lg font-bold text-success flex items-center gap-1.5 mt-0.5">
              {todayAtt ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {todayAtt.status.toUpperCase()}
                </>
              ) : !isWorkDay ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground text-base">OFF</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground text-base">Belum</span>
                </>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {todayAtt?.clockIn
                ? `Terkirim ${format(new Date(todayAtt.clockIn), "HH:mm")}`
                : !isWorkDay
                  ? `Jadwal off ${dayNames[user.offDay ?? 0]}`
                : "Hadir, sakit, atau izin"}
            </p>
          </div>
        </div>
        <Link
          to="/app/absensi"
          className="mt-4 block text-center py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold shadow-card"
        >
          {todayAtt ? "Lihat Absensi" : "Kirim Absensi"}
        </Link>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Hadir" value={`${monthCount}`} sub="bulan ini" color="success" />
        <StatCard label="S/I" value={`${monthSickOrPermit}`} sub="bulan ini" color="warning" />
        <StatCard
          label="Posisi"
          value={user.position.split(" ")[0]}
          sub={user.position.split(" ").slice(1).join(" ") || "—"}
          color="primary"
        />
      </div>

      {/* Menu */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1">Akses Cepat</h2>
        <div className="grid grid-cols-2 gap-3">
          <MenuTile to="/app/absensi" icon={Clock} label="Absensi" desc="Hadir / sakit / izin" />
          <MenuTile to="/app/izin" icon={FileText} label="Pengajuan Izin" desc="Sakit / cuti" />
          <MenuTile
            to="/app/slip"
            icon={Wallet}
            label="Slip Gaji"
            desc={lastSlip ? formatRupiah(lastSlip.total) : "Belum ada"}
          />
          <MenuTile to="/app/profil" icon={MapPin} label="Profil" desc="Akun saya" />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: "success" | "warning" | "primary";
}) {
  const colorMap = { success: "text-success", warning: "text-warning", primary: "text-primary" };
  return (
    <Card className="p-3 border-0 shadow-card rounded-xl">
      <p className="text-[10px] text-muted-foreground uppercase">{label}</p>
      <p className={`text-xl font-bold mt-0.5 truncate ${colorMap[color]}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground truncate">{sub}</p>
    </Card>
  );
}

function MenuTile({
  to,
  icon: Icon,
  label,
  desc,
}: {
  to: string;
  icon: LucideIcon;
  label: string;
  desc: string;
}) {
  return (
    <Link to={to} className="block">
      <Card className="p-4 border-0 shadow-card rounded-2xl hover:shadow-elegant transition active:scale-95">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <p className="font-semibold text-sm">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{desc}</p>
      </Card>
    </Link>
  );
}
