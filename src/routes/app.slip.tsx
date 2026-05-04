import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser, useStore, formatRupiah } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Wallet, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export const Route = createFileRoute("/app/slip")({
  component: SlipPage,
});

function SlipPage() {
  const user = useCurrentUser()!;
  const payrolls = useStore((s) => s.payrolls)
    .filter((p) => p.userId === user.id)
    .sort((a, b) => b.period.localeCompare(a.period));

  const exportExcel = (p: any) => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["SLIP GAJI"],
      [],
      ["Nama", user.name],
      ["Posisi", user.position],
      ["Periode", p.period],
      [],
      ["Komponen", "Jumlah"],
      ["Gaji Pokok (proporsional)", p.baseSalary],
      ["Tunjangan", p.allowance],
      ["Lembur", p.overtime],
      ["Potongan (BPJS/Pajak)", -p.deduction],
      ["TOTAL", p.total],
      [],
      ["Hari Kerja", p.workDays],
      ["Hadir", p.daysPresent],
    ]);
    ws["!cols"] = [{ wch: 30 }, { wch: 18 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Slip");
    XLSX.writeFile(wb, `slip-${user.name.replace(/\s+/g, "_")}-${p.period}.xlsx`);
    toast.success("Slip gaji diunduh");
  };

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">Slip Gaji Saya</h2>

      {payrolls.length === 0 ? (
        <Card className="p-8 text-center border-0 shadow-card rounded-2xl">
          <Wallet className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Belum ada slip gaji.</p>
          <p className="text-xs text-muted-foreground mt-1">Admin perlu generate payroll terlebih dahulu.</p>
        </Card>
      ) : (
        payrolls.map((p) => (
          <Card key={p.id} className="p-5 border-0 shadow-card rounded-2xl bg-gradient-card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Periode</p>
                <p className="font-semibold">{p.period}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => exportExcel(p)}>
                <Download className="h-4 w-4 mr-1" /> Excel
              </Button>
            </div>
            <div className="space-y-1.5 text-sm py-3 border-y border-border">
              <Row label="Gaji Pokok" value={formatRupiah(p.baseSalary)} />
              <Row label="Tunjangan" value={formatRupiah(p.allowance)} />
              <Row label="Lembur" value={formatRupiah(p.overtime)} />
              <Row label="Potongan" value={`- ${formatRupiah(p.deduction)}`} negative />
            </div>
            <div className="flex items-center justify-between mt-3">
              <p className="text-sm text-muted-foreground">Total Diterima</p>
              <p className="text-xl font-bold text-primary">{formatRupiah(p.total)}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Hadir {p.daysPresent} dari {p.workDays} hari kerja
            </p>
          </Card>
        ))
      )}
    </div>
  );
}

function Row({ label, value, negative }: { label: string; value: string; negative?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${negative ? "text-destructive" : ""}`}>{value}</span>
    </div>
  );
}
