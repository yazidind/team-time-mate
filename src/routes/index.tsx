import { createFileRoute, redirect } from "@tanstack/react-router";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const state = useStore.getState();
    const u = state.users.find((x) => x.id === state.currentUserId);
    if (!u) throw redirect({ to: "/login" });
    throw redirect({ to: u.role === "admin" ? "/admin" : "/app" });
  },
  component: () => null,
});
