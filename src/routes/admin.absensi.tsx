import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/absensi")({
  component: AdminAbsensi,
});

function AdminAbsensi() {
  const users = useStore((s) => s.users);
  const attendance = useStore((s) => s.attendance);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const dayAtt = attendance.filter((a) => a.date === date);
  const employees = users.filter((u) => u.role === "karyawan");

  const rows = employees.map((emp) => {
    const a = dayAtt.find((x) => x.userId === emp.id);
    return {
      Nama: emp.name,
      Posisi: emp.position,
      "Clock In": a?.clockIn ? format(new Date(a.clockIn), "HH:mm") : "—",
      "Clock Out": a?.clockOut ? format(new Date(a.clockOut), "HH:mm") : "—",
      Status: a?.status?.toUpperCase() ?? "ALPHA",
      Lokasi: a?.lat ? `${a.lat.toFixed(4)}, ${a.lng?.toFixed(4)}` : "—",
    };
  });

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [{ wch: 22 }, { wch: 18 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 22 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Absensi-${date}`);
    XLSX.writeFile(wb, `absensi-${date}.xlsx`);
    toast.success("Diunduh");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Rekap Absensi</h2>
        <Button size="sm" variant="outline" onClick={exportExcel}>
          <Download className="h-4 w-4 mr-1" /> Excel
        </Button>
      </div>

      <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <p className="text-xs text-muted-foreground">{format(new Date(date), "EEEE, d MMMM yyyy", { locale: idLocale })}</p>

      <div className="space-y-2">
        {employees.map((emp) => {
          const a = dayAtt.find((x) => x.userId === emp.id);
          return (
            <Card key={emp.id} className="p-3 border-0 shadow-card rounded-xl">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{emp.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {a?.clockIn ? format(new Date(a.clockIn), "HH:mm") : "—"} ·{" "}
                    {a?.clockOut ? format(new Date(a.clockOut), "HH:mm") : "—"}
                  </p>
                </div>
                <span
                  className={`text-[10px] px-2 py-1 rounded-full font-medium shrink-0 ${
                    a?.status === "hadir"
                      ? "bg-success/15 text-success"
                      : a?.status === "telat"
                      ? "bg-warning/15 text-warning-foreground"
                      : "bg-destructive/15 text-destructive"
                  }`}
                >
                  {a?.status?.toUpperCase() ?? "ALPHA"}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
