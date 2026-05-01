import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, type Attendance } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Pencil, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import { dayNames, formatLocalDate, isScheduledWorkDate, parseLocalDate } from "@/lib/date";

export const Route = createFileRoute("/admin/absensi")({
  component: AdminAbsensi,
});

type EditableStatus = "hadir" | "sakit" | "izin";

function AdminAbsensi() {
  const users = useStore((s) => s.users);
  const attendance = useStore((s) => s.attendance);
  const updateAttendance = useStore((s) => s.updateAttendance);
  const deleteAttendanceForDay = useStore((s) => s.deleteAttendanceForDay);
  const [date, setDate] = useState(formatLocalDate());
  const [editing, setEditing] = useState<Attendance | null>(null);
  const [deleting, setDeleting] = useState<Attendance | null>(null);
  const [form, setForm] = useState({ status: "hadir" as EditableStatus, time: "", reason: "" });

  const dayAtt = attendance.filter((a) => a.date === date);
  const employees = users.filter((u) => u.role === "karyawan");

  const rows = employees.map((emp) => {
    const a = dayAtt.find((x) => x.userId === emp.id);
    const isWorkDay = isScheduledWorkDate(date, emp.offDay ?? 0);
    return {
      Nama: emp.name,
      Posisi: emp.position,
      Waktu: a?.clockIn ? format(new Date(a.clockIn), "HH:mm") : "-",
      Status: isWorkDay ? formatStatus(a?.status) : "OFF",
      Lokasi: a?.lat ? `${a.lat.toFixed(4)}, ${a.lng?.toFixed(4)}` : "-",
      Keterangan: a?.reason ?? "-",
    };
  });

  const startEdit = (a: Attendance) => {
    setEditing(a);
    setForm({
      status: normalizeStatus(a.status),
      time: a.clockIn ? format(new Date(a.clockIn), "HH:mm") : "08:00",
      reason: a.reason ?? "",
    });
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if ((form.status === "sakit" || form.status === "izin") && !form.reason.trim()) {
      toast.error("Keterangan wajib diisi untuk sakit/izin");
      return;
    }

    updateAttendance(editing.id, {
      status: form.status,
      clockIn: buildClockIn(editing.date, form.time),
      reason: form.status === "sakit" || form.status === "izin" ? form.reason.trim() : undefined,
    });
    setEditing(null);
    toast.success("Absensi diperbarui");
  };

  const removeAttendance = () => {
    if (!deleting) return;
    deleteAttendanceForDay(deleting.userId, deleting.date);
    setDeleting(null);
    toast.success("Absensi dihapus");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [{ wch: 22 }, { wch: 18 }, { wch: 10 }, { wch: 10 }, { wch: 22 }, { wch: 30 }];
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
      <p className="text-xs text-muted-foreground">
        {format(parseLocalDate(date), "EEEE, d MMMM yyyy", { locale: idLocale })}
      </p>

      <div className="space-y-2">
        {employees.map((emp) => {
          const a = dayAtt.find((x) => x.userId === emp.id);
          const isWorkDay = isScheduledWorkDate(date, emp.offDay ?? 0);
          return (
            <Card key={emp.id} className="p-3 border-0 shadow-card rounded-xl">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{emp.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {a?.clockIn ? format(new Date(a.clockIn), "HH:mm") : "-"}
                    {a?.lat ? ` · ${a.lat.toFixed(4)}, ${a.lng?.toFixed(4)}` : ""}
                  </p>
                  {!isWorkDay && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Jadwal off {dayNames[emp.offDay ?? 0]}
                    </p>
                  )}
                  {a?.reason && <p className="text-xs mt-1 line-clamp-2">{a.reason}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <StatusBadge status={a?.status ?? (isWorkDay ? "alpha" : "off")} />
                  {a && (
                    <>
                      <Button size="icon" variant="ghost" onClick={() => startEdit(a)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleting(a)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Absensi</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveEdit} className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Status</p>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm({ ...form, status: value as EditableStatus })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hadir">Hadir</SelectItem>
                  <SelectItem value="sakit">Sakit</SelectItem>
                  <SelectItem value="izin">Izin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Waktu</p>
              <Input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Keterangan</p>
              <Textarea
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                rows={3}
                placeholder="Wajib untuk sakit atau izin"
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-primary">
              Simpan
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent className="max-w-sm rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus absensi?</AlertDialogTitle>
            <AlertDialogDescription>
              Data absensi {users.find((x) => x.id === deleting?.userId)?.name ?? "karyawan"} pada{" "}
              {deleting?.date ?? date} akan dihapus dari rekap.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={removeAttendance}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function normalizeStatus(status: string): EditableStatus {
  return status === "sakit" || status === "izin" ? status : "hadir";
}

function buildClockIn(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hour || 0, minute || 0).toISOString();
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "hadir"
      ? "bg-success/15 text-success"
      : status === "sakit"
          ? "bg-primary/15 text-primary"
          : status === "off"
            ? "bg-muted text-muted-foreground"
          : "bg-destructive/15 text-destructive";

  return (
    <span className={`text-[10px] px-2 py-1 rounded-full font-medium shrink-0 ${className}`}>
      {formatStatus(status)}
    </span>
  );
}

function formatStatus(status?: string) {
  if (!status) return "ALPHA";
  if (status === "off") return "OFF";
  return status.toUpperCase();
}
