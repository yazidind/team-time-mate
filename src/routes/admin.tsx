import { createFileRoute, redirect } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    const s = useStore.getState();
    const u = s.users.find((x) => x.id === s.currentUserId);
    if (!u) throw redirect({ to: "/login" });
    if (u.role !== "admin") throw redirect({ to: "/app" });
  },
  component: () => (
    <>
      <AppShell />
      <Toaster />
    </>
  ),
});
