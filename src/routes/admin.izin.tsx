import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import { parseLocalDate } from "@/lib/date";

export const Route = createFileRoute("/admin/izin")({
  component: AdminIzin,
});

function AdminIzin() {
  const leaves = useStore((s) => s.leaves);
  const users = useStore((s) => s.users);
  const updateLeave = useStore((s) => s.updateLeave);

  const sorted = [...leaves].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (b.status === "pending" && a.status !== "pending") return 1;
    return b.createdAt.localeCompare(a.createdAt);
  });

  const decide = (id: string, status: "approved" | "rejected") => {
    updateLeave(id, { status });
    toast.success(status === "approved" ? "Disetujui" : "Ditolak");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Pengajuan Izin & Cuti</h2>
      {sorted.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada pengajuan</p>}
      {sorted.map((l) => {
        const u = users.find((x) => x.id === l.userId);
        return (
          <Card key={l.id} className="p-4 border-0 shadow-card rounded-2xl">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <p className="font-semibold text-sm">{u?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {l.type} · {format(parseLocalDate(l.startDate), "d MMM", { locale: idLocale })} —{" "}
                  {format(parseLocalDate(l.endDate), "d MMM", { locale: idLocale })}
                </p>
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
            <p className="text-sm bg-muted p-2 rounded-lg">{l.reason}</p>
            {l.status === "pending" && (
              <div className="flex gap-2 mt-3">
                <Button size="sm" className="flex-1 bg-success hover:bg-success/90" onClick={() => decide(l.id, "approved")}>
                  <Check className="h-4 w-4 mr-1" /> Setujui
                </Button>
                <Button size="sm" variant="destructive" className="flex-1" onClick={() => decide(l.id, "rejected")}>
                  <X className="h-4 w-4 mr-1" /> Tolak
                </Button>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
