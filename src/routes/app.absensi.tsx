import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useCurrentUser, useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, MapPin, Clock, CheckCircle2, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";

export const Route = createFileRoute("/app/absensi")({
  component: AbsensiPage,
});

function AbsensiPage() {
  const user = useCurrentUser()!;
  const attendance = useStore((s) => s.attendance);
  const addAttendance = useStore((s) => s.addAttendance);
  const updateAttendance = useStore((s) => s.updateAttendance);

  const today = new Date().toISOString().slice(0, 10);
  const todayAtt = attendance.find((a) => a.userId === user.id && a.date === today);

  const [photo, setPhoto] = useState<string | null>(null);
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const myHistory = attendance
    .filter((a) => a.userId === user.id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 14);

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation tidak didukung");
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setBusy(false);
        toast.success("Lokasi berhasil diambil");
      },
      () => {
        // demo fallback Jakarta
        setLoc({ lat: -6.2088, lng: 106.8456 });
        setBusy(false);
        toast.message("Lokasi default (demo) digunakan");
      },
      { timeout: 8000 }
    );
  };

  const onPickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(f);
  };

  const doClockIn = () => {
    if (!photo) return toast.error("Ambil foto selfie dulu");
    if (!loc) return toast.error("Aktifkan lokasi dulu");
    const now = new Date();
    addAttendance({
      id: `a-${user.id}-${today}`,
      userId: user.id,
      date: today,
      clockIn: now.toISOString(),
      lat: loc.lat,
      lng: loc.lng,
      photo,
      status: now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 15) ? "telat" : "hadir",
    });
    setPhoto(null);
    toast.success("Clock In berhasil!");
  };

  const doClockOut = () => {
    if (!todayAtt) return;
    updateAttendance(todayAtt.id, { clockOut: new Date().toISOString() });
    toast.success("Clock Out berhasil!");
  };

  return (
    <div className="space-y-5">
      <Card className="p-5 bg-gradient-card border-0 shadow-card rounded-2xl">
        <p className="text-xs text-muted-foreground uppercase">{format(new Date(), "EEEE", { locale: idLocale })}</p>
        <p className="text-2xl font-bold tabular-nums">{format(new Date(), "HH:mm")}</p>
        <p className="text-sm text-muted-foreground">{format(new Date(), "d MMMM yyyy", { locale: idLocale })}</p>

        {todayAtt?.clockIn && (
          <div className="mt-4 p-3 rounded-xl bg-success/10 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <p className="text-sm">
              Clock In: <b>{format(new Date(todayAtt.clockIn), "HH:mm")}</b>
              {todayAtt.clockOut && <> · Out: <b>{format(new Date(todayAtt.clockOut), "HH:mm")}</b></>}
            </p>
          </div>
        )}
      </Card>

      {!todayAtt?.clockIn ? (
        <Card className="p-5 border-0 shadow-card rounded-2xl space-y-4">
          <h2 className="font-semibold">Verifikasi Absensi</h2>

          {/* Foto */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">1. Foto Selfie</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="user"
              hidden
              onChange={onPickPhoto}
            />
            {photo ? (
              <div className="relative">
                <img src={photo} alt="Selfie" className="w-full aspect-square object-cover rounded-xl" />
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2"
                  onClick={() => fileRef.current?.click()}
                >
                  <RefreshCw className="h-3 w-3 mr-1" /> Ulangi
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full aspect-square border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition"
              >
                <Camera className="h-10 w-10" />
                <span className="text-sm">Ambil Foto</span>
              </button>
            )}
          </div>

          {/* Lokasi */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">2. Lokasi</p>
            <button
              type="button"
              onClick={getLocation}
              disabled={busy}
              className={`w-full p-3 rounded-xl border-2 ${loc ? "border-success bg-success/5" : "border-border"} flex items-center gap-3`}
            >
              <MapPin className={`h-5 w-5 ${loc ? "text-success" : "text-muted-foreground"}`} />
              <div className="text-left flex-1">
                {loc ? (
                  <>
                    <p className="text-sm font-medium text-success">Lokasi terkunci</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
                    </p>
                  </>
                ) : (
                  <p className="text-sm">{busy ? "Mengambil lokasi..." : "Tap untuk aktifkan GPS"}</p>
                )}
              </div>
            </button>
          </div>

          <Button onClick={doClockIn} className="w-full h-12 bg-gradient-primary shadow-card text-base">
            <Clock className="h-5 w-5 mr-2" /> Clock In Sekarang
          </Button>
        </Card>
      ) : !todayAtt.clockOut ? (
        <Button onClick={doClockOut} variant="destructive" className="w-full h-12 text-base">
          <Clock className="h-5 w-5 mr-2" /> Clock Out Sekarang
        </Button>
      ) : (
        <Card className="p-5 border-0 shadow-card rounded-2xl text-center">
          <CheckCircle2 className="h-12 w-12 mx-auto text-success mb-2" />
          <p className="font-semibold">Absensi hari ini selesai</p>
          <p className="text-sm text-muted-foreground">Sampai jumpa besok!</p>
        </Card>
      )}

      {/* Riwayat */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1">Riwayat 14 hari</h2>
        <Card className="border-0 shadow-card rounded-2xl divide-y divide-border overflow-hidden">
          {myHistory.length === 0 && (
            <p className="p-5 text-center text-sm text-muted-foreground">Belum ada riwayat</p>
          )}
          {myHistory.map((a) => (
            <div key={a.id} className="p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{format(new Date(a.date), "EEE, d MMM", { locale: idLocale })}</p>
                <p className="text-xs text-muted-foreground">
                  {a.clockIn ? format(new Date(a.clockIn), "HH:mm") : "—"} ·{" "}
                  {a.clockOut ? format(new Date(a.clockOut), "HH:mm") : "—"}
                </p>
              </div>
              <span
                className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                  a.status === "hadir"
                    ? "bg-success/15 text-success"
                    : a.status === "telat"
                    ? "bg-warning/15 text-warning-foreground"
                    : "bg-destructive/15 text-destructive"
                }`}
              >
                {a.status.toUpperCase()}
              </span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
