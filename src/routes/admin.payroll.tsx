import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, formatRupiah } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { formatLocalMonth } from "@/lib/date";

export const Route = createFileRoute("/admin/payroll")({
  component: AdminPayroll,
});

function AdminPayroll() {
  const users = useStore((s) => s.users);
  const payrolls = useStore((s) => s.payrolls);
  const generatePayroll = useStore((s) => s.generatePayroll);

  const [period, setPeriod] = useState(formatLocalMonth());

  const periodPayrolls = payrolls.filter((p) => p.period === period);
  const total = periodPayrolls.reduce((s, p) => s + p.total, 0);

  const generate = () => {
    generatePayroll(period);
    toast.success(`Payroll periode ${period} berhasil di-generate`);
  };

  const exportAll = () => {
    if (periodPayrolls.length === 0) return toast.error("Generate dulu");
    const rows = periodPayrolls.map((p) => {
      const u = users.find((x) => x.id === p.userId);
      return {
        Nama: u?.name,
        Posisi: u?.position,
        Periode: p.period,
        "Hari Kerja": p.workDays,
        Hadir: p.daysPresent,
        "Izin Dibayar": p.paidLeaveDays ?? 0,
        "Gaji Pokok": p.baseSalary,
        Tunjangan: p.allowance,
        Lembur: p.overtime,
        Potongan: p.deduction,
        Total: p.total,
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [
      { wch: 22 }, { wch: 18 }, { wch: 10 }, { wch: 10 }, { wch: 8 },
      { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 16 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Payroll-${period}`);
    XLSX.writeFile(wb, `payroll-${period}.xlsx`);
    toast.success("Diunduh");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Payroll</h2>

      <Card className="p-4 border-0 shadow-card rounded-2xl space-y-3 bg-gradient-card">
        <div>
          <Label className="text-xs">Periode (YYYY-MM)</Label>
          <Input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={generate} className="flex-1 bg-gradient-primary shadow-card">
            <Sparkles className="h-4 w-4 mr-1" /> Generate
          </Button>
          <Button onClick={exportAll} variant="outline">
            <Download className="h-4 w-4 mr-1" /> Excel
          </Button>
        </div>
        {periodPayrolls.length > 0 && (
          <div className="pt-2 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Total Payroll</span>
            <span className="font-bold text-primary">{formatRupiah(total)}</span>
          </div>
        )}
      </Card>

      {periodPayrolls.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Belum ada payroll untuk periode {period}.<br />
          Klik <b>Generate</b> untuk hitung otomatis dari data absensi.
        </p>
      ) : (
        <div className="space-y-3">
          {periodPayrolls.map((p) => {
            const u = users.find((x) => x.id === p.userId);
            return (
              <Card key={p.id} className="p-4 border-0 shadow-card rounded-2xl">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm">{u?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Hadir {p.daysPresent}
                      {p.paidLeaveDays ? ` + izin ${p.paidLeaveDays}` : ""}/{p.workDays} hari
                    </p>
                  </div>
                  <p className="font-bold text-primary">{formatRupiah(p.total)}</p>
                </div>
                <div className="text-xs text-muted-foreground grid grid-cols-2 gap-x-2 gap-y-0.5">
                  <span>Pokok: {formatRupiah(p.baseSalary)}</span>
                  <span>Tunj: {formatRupiah(p.allowance)}</span>
                  <span>Lembur: {formatRupiah(p.overtime)}</span>
                  <span className="text-destructive">Potong: {formatRupiah(p.deduction)}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
