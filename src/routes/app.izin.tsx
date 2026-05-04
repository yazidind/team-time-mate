import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useCurrentUser, useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";

export const Route = createFileRoute("/app/izin")({
  component: IzinPage,
});

function IzinPage() {
  const user = useCurrentUser()!;
  const leaves = useStore((s) => s.leaves);
  const addLeave = useStore((s) => s.addLeave);

  const myLeaves = leaves
    .filter((l) => l.userId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"sakit" | "cuti" | "izin">("sakit");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!start || !end || !reason) return toast.error("Lengkapi semua field");
    addLeave({
      id: `l-${Date.now()}`,
      userId: user.id,
      type,
      startDate: start,
      endDate: end,
      reason,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    toast.success("Pengajuan terkirim");
    setOpen(false);
    setStart("");
    setEnd("");
    setReason("");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Pengajuan Izin</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-gradient-primary shadow-card">
              <Plus className="h-4 w-4 mr-1" /> Ajukan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm rounded-2xl">
            <DialogHeader>
              <DialogTitle>Pengajuan Izin Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <Label>Jenis</Label>
                <Select value={type} onValueChange={(v: any) => setType(v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sakit">Sakit</SelectItem>
                    <SelectItem value="cuti">Cuti</SelectItem>
                    <SelectItem value="izin">Izin Lain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Mulai</Label>
                  <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label>Selesai</Label>
                  <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label>Alasan</Label>
                <Textarea value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1.5" rows={3} />
              </div>
              <Button type="submit" className="w-full bg-gradient-primary">Kirim</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {myLeaves.length === 0 ? (
        <Card className="p-8 text-center border-0 shadow-card rounded-2xl">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Belum ada pengajuan</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {myLeaves.map((l) => (
            <Card key={l.id} className="p-4 border-0 shadow-card rounded-2xl">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm capitalize">{l.type}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(l.startDate), "d MMM", { locale: idLocale })} —{" "}
                    {format(new Date(l.endDate), "d MMM yyyy", { locale: idLocale })}
                  </p>
                  <p className="text-sm mt-2">{l.reason}</p>
                </div>
                <span
                  className={`text-[10px] px-2 py-1 rounded-full font-medium shrink-0 ${
                    l.status === "approved"
                      ? "bg-success/15 text-success"
                      : l.status === "rejected"
                      ? "bg-destructive/15 text-destructive"
                      : "bg-warning/15 text-warning-foreground"
                  }`}
                >
                  {l.status.toUpperCase()}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
