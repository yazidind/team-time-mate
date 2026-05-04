import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser, formatRupiah } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Mail, Briefcase, Calendar, Wallet } from "lucide-react";

export const Route = createFileRoute("/app/profil")({
  component: ProfilPage,
});

function ProfilPage() {
  const user = useCurrentUser()!;
  return (
    <div className="space-y-5">
      <Card className="p-6 text-center border-0 shadow-card rounded-2xl bg-gradient-card">
        <div className="h-20 w-20 mx-auto rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-glow">
          {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </div>
        <h2 className="mt-3 font-semibold text-lg">{user.name}</h2>
        <p className="text-sm text-muted-foreground">{user.position}</p>
      </Card>

      <Card className="border-0 shadow-card rounded-2xl divide-y divide-border overflow-hidden">
        <Item icon={Mail} label="Email" value={user.email} />
        <Item icon={Briefcase} label="Posisi" value={user.position} />
        <Item icon={Calendar} label="Bergabung" value={user.joinDate} />
        <Item icon={Wallet} label="Gaji Pokok" value={formatRupiah(user.baseSalary)} />
        <Item icon={Wallet} label="Tunjangan" value={formatRupiah(user.allowance)} />
      </Card>
    </div>
  );
}

function Item({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="p-4 flex items-center gap-3">
      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
