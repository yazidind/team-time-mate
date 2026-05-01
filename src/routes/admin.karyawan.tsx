import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, formatRupiah, type User } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { dayNames, formatLocalDate } from "@/lib/date";

export const Route = createFileRoute("/admin/karyawan")({
  component: KaryawanAdmin,
});

const empty = {
  name: "",
  email: "",
  password: "karyawan123",
  position: "",
  baseSalary: 5000000,
  allowance: 500000,
  offDay: 0,
};

function KaryawanAdmin() {
  const users = useStore((s) => s.users);
  const addUser = useStore((s) => s.addUser);
  const updateUser = useStore((s) => s.updateUser);
  const deleteUser = useStore((s) => s.deleteUser);
  const employees = users.filter((u) => u.role === "karyawan");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(empty);

  const startAdd = () => { setEditing(null); setForm(empty); setOpen(true); };
  const startEdit = (u: User) => {
    setEditing(u);
    setForm({
      name: u.name,
      email: u.email,
      password: u.password,
      position: u.position,
      baseSalary: u.baseSalary,
      allowance: u.allowance,
      offDay: u.offDay ?? 0,
    });
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return toast.error("Nama & email wajib");
    if (editing) {
      updateUser(editing.id, form);
      toast.success("Karyawan diperbarui");
    } else {
      addUser({
        id: `u-${Date.now()}`,
        ...form,
        role: "karyawan",
        joinDate: formatLocalDate(),
      });
      toast.success("Karyawan ditambahkan");
    }
    setOpen(false);
  };

  const onDelete = (u: User) => {
    if (confirm(`Hapus ${u.name}?`)) {
      deleteUser(u.id);
      toast.success("Karyawan dihapus");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Karyawan ({employees.length})</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-gradient-primary shadow-card" onClick={startAdd}>
              <Plus className="h-4 w-4 mr-1" /> Tambah
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm rounded-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit" : "Tambah"} Karyawan</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <Field label="Nama"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
              <Field label="Password"><Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
              <Field label="Posisi"><Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} /></Field>
              <Field label="Hari Off">
                <Select
                  value={String(form.offDay)}
                  onValueChange={(value) => setForm({ ...form, offDay: Number(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dayNames.map((day, index) => (
                      <SelectItem key={day} value={String(index)}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Gaji Pokok"><Input type="number" value={form.baseSalary} onChange={(e) => setForm({ ...form, baseSalary: +e.target.value })} /></Field>
              <Field label="Tunjangan"><Input type="number" value={form.allowance} onChange={(e) => setForm({ ...form, allowance: +e.target.value })} /></Field>
              <Button type="submit" className="w-full bg-gradient-primary">Simpan</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {employees.map((u) => (
          <Card key={u.id} className="p-4 border-0 shadow-card rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-semibold shrink-0">
                {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{u.name}</p>
                <p className="text-xs text-muted-foreground truncate">{u.position}</p>
                <p className="text-xs text-muted-foreground truncate">
                  Off: {dayNames[u.offDay ?? 0]}
                </p>
                <p className="text-xs text-primary font-medium mt-0.5">{formatRupiah(u.baseSalary + u.allowance)}</p>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => startEdit(u)}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => onDelete(u)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
