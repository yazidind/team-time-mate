import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useCurrentUser, useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Camera, MapPin, Clock, CheckCircle2, RefreshCw, FileText } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import { dayNames, formatLocalDate, isScheduledWorkDate, parseLocalDate } from "@/lib/date";

export const Route = createFileRoute("/app/absensi")({
  component: AbsensiPage,
});

type AbsenceMode = "hadir" | "sakit" | "izin";

function AbsensiPage() {
  const user = useCurrentUser()!;
  const attendance = useStore((s) => s.attendance);
  const addAttendance = useStore((s) => s.addAttendance);

  const today = formatLocalDate();
  const todayAtt = attendance.find((a) => a.userId === user.id && a.date === today);
  const isWorkDay = isScheduledWorkDate(today, user.offDay ?? 0);

  const [mode, setMode] = useState<AbsenceMode>("hadir");
  const [reason, setReason] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraBusy, setCameraBusy] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const myHistory = attendance
    .filter((a) => a.userId === user.id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 14);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (!cameraOpen || !videoRef.current || !streamRef.current) return;
    videoRef.current.srcObject = streamRef.current;
    videoRef.current.play().catch(() => undefined);
  }, [cameraOpen]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOpen(false);
    setCameraBusy(false);
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Kamera tidak didukung di browser ini");
      return;
    }

    try {
      setCameraBusy(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
    } catch {
      toast.error("Tidak bisa membuka kamera. Periksa izin kamera browser.");
    } finally {
      setCameraBusy(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) {
      toast.error("Kamera belum siap");
      return;
    }

    const size = Math.min(video.videoWidth, video.videoHeight);
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    setPhoto(canvas.toDataURL("image/jpeg", 0.9));
    stopCamera();
  };

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
        setLoc({ lat: -6.2088, lng: 106.8456 });
        setBusy(false);
        toast.message("Lokasi default (demo) digunakan");
      },
      { timeout: 8000 },
    );
  };

  const chooseMode = (nextMode: AbsenceMode) => {
    setMode(nextMode);
    if (nextMode !== "hadir") stopCamera();
  };

  const submitAttendance = () => {
    if (!isWorkDay) {
      return toast.message(`Hari ini jadwal off (${dayNames[user.offDay ?? 0]})`);
    }

    const now = new Date();

    if (mode === "hadir") {
      if (!photo) return toast.error("Ambil foto selfie dulu");
      if (!loc) return toast.error("Aktifkan lokasi dulu");

      addAttendance({
        id: `a-${user.id}-${today}`,
        userId: user.id,
        date: today,
        clockIn: now.toISOString(),
        lat: loc.lat,
        lng: loc.lng,
        photo,
        status: "hadir",
      });
      setPhoto(null);
      stopCamera();
      toast.success("Absensi hadir berhasil!");
      return;
    }

    if (!reason.trim()) {
      return toast.error(`Keterangan ${mode} wajib diisi`);
    }

    addAttendance({
      id: `a-${user.id}-${today}`,
      userId: user.id,
      date: today,
      clockIn: now.toISOString(),
      status: mode,
      reason: reason.trim(),
    });
    setReason("");
    toast.success(`Absensi ${mode} berhasil dikirim!`);
  };

  return (
    <div className="space-y-5">
      <Card className="p-5 bg-gradient-card border-0 shadow-card rounded-2xl">
        <p className="text-xs text-muted-foreground uppercase">
          {format(new Date(), "EEEE", { locale: idLocale })}
        </p>
        <p className="text-2xl font-bold tabular-nums">{format(new Date(), "HH:mm")}</p>
        <p className="text-sm text-muted-foreground">
          {format(new Date(), "d MMMM yyyy", { locale: idLocale })}
        </p>

        {todayAtt && (
          <div className="mt-4 p-3 rounded-xl bg-success/10 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <p className="text-sm">
              Status: <b>{todayAtt.status.toUpperCase()}</b>
              {todayAtt.clockIn && <> · {format(new Date(todayAtt.clockIn), "HH:mm")}</>}
            </p>
          </div>
        )}
      </Card>

      {!isWorkDay ? (
        <Card className="p-5 border-0 shadow-card rounded-2xl text-center">
          <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="font-semibold">Hari ini jadwal off</p>
          <p className="text-sm text-muted-foreground">
            Tidak wajib absen pada hari {dayNames[user.offDay ?? 0]}.
          </p>
        </Card>
      ) : !todayAtt ? (
        <Card className="p-5 border-0 shadow-card rounded-2xl space-y-4">
          <h2 className="font-semibold">Verifikasi Absensi</h2>

          <div className="grid grid-cols-3 gap-2">
            {(["hadir", "sakit", "izin"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => chooseMode(item)}
                className={`h-10 rounded-xl border text-sm font-medium capitalize transition ${
                  mode === item
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {mode === "hadir" ? (
            <>
              <div>
                <p className="text-xs text-muted-foreground mb-2">1. Foto Selfie</p>
                {photo ? (
                  <div className="relative">
                    <img
                      src={photo}
                      alt="Selfie"
                      className="w-full aspect-square object-cover rounded-xl"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setPhoto(null);
                        startCamera();
                      }}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" /> Ulangi
                    </Button>
                  </div>
                ) : cameraOpen ? (
                  <div className="space-y-3">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full aspect-square object-cover rounded-xl bg-muted scale-x-[-1]"
                    />
                    <canvas ref={canvasRef} hidden />
                    <div className="grid grid-cols-2 gap-2">
                      <Button type="button" variant="outline" onClick={stopCamera}>
                        Tutup
                      </Button>
                      <Button type="button" className="bg-gradient-primary" onClick={capturePhoto}>
                        <Camera className="h-4 w-4 mr-1" /> Ambil
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={startCamera}
                    disabled={cameraBusy}
                    className="w-full aspect-square border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition"
                  >
                    <Camera className="h-10 w-10" />
                    <span className="text-sm">
                      {cameraBusy ? "Membuka kamera..." : "Buka Kamera"}
                    </span>
                  </button>
                )}
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">2. Lokasi</p>
                <button
                  type="button"
                  onClick={getLocation}
                  disabled={busy}
                  className={`w-full p-3 rounded-xl border-2 ${loc ? "border-success bg-success/5" : "border-border"} flex items-center gap-3`}
                >
                  <MapPin
                    className={`h-5 w-5 ${loc ? "text-success" : "text-muted-foreground"}`}
                  />
                  <div className="text-left flex-1">
                    {loc ? (
                      <>
                        <p className="text-sm font-medium text-success">Lokasi terkunci</p>
                        <p className="text-xs text-muted-foreground tabular-nums">
                          {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm">
                        {busy ? "Mengambil lokasi..." : "Tap untuk aktifkan GPS"}
                      </p>
                    )}
                  </div>
                </button>
              </div>
            </>
          ) : (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Keterangan {mode}</p>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder={
                  mode === "sakit"
                    ? "Contoh: Demam dan istirahat di rumah"
                    : "Contoh: Urusan keluarga mendesak"
                }
              />
            </div>
          )}

          <Button
            onClick={submitAttendance}
            className="w-full h-12 bg-gradient-primary shadow-card text-base"
          >
            {mode === "hadir" ? (
              <Clock className="h-5 w-5 mr-2" />
            ) : (
              <FileText className="h-5 w-5 mr-2" />
            )}
            Kirim Absensi
          </Button>
        </Card>
      ) : (
        <Card className="p-5 border-0 shadow-card rounded-2xl text-center">
          <CheckCircle2 className="h-12 w-12 mx-auto text-success mb-2" />
          <p className="font-semibold">Absensi hari ini sudah terkirim</p>
          <p className="text-sm text-muted-foreground">
            Status: {todayAtt.status.toUpperCase()}
          </p>
          {todayAtt.reason && <p className="text-sm mt-2">{todayAtt.reason}</p>}
        </Card>
      )}

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1">Riwayat 14 hari</h2>
        <Card className="border-0 shadow-card rounded-2xl divide-y divide-border overflow-hidden">
          {myHistory.length === 0 && (
            <p className="p-5 text-center text-sm text-muted-foreground">Belum ada riwayat</p>
          )}
          {myHistory.map((a) => (
            <div key={a.id} className="p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {format(parseLocalDate(a.date), "EEE, d MMM", { locale: idLocale })}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {a.clockIn ? format(new Date(a.clockIn), "HH:mm") : "-"}
                  {a.reason ? ` · ${a.reason}` : ""}
                </p>
              </div>
              <StatusBadge status={a.status} />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "hadir"
      ? "bg-success/15 text-success"
      : status === "sakit"
          ? "bg-primary/15 text-primary"
          : "bg-destructive/15 text-destructive";

  return (
    <span className={`text-[10px] px-2 py-1 rounded-full font-medium shrink-0 ${className}`}>
      {status.toUpperCase()}
    </span>
  );
}
