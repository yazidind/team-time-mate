import { create } from "zustand";
import { persist } from "zustand/middleware";
import { eachScheduledWorkDate, formatLocalDate, isScheduledWorkDate } from "./date";

export type Role = "admin" | "karyawan";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  position: string;
  baseSalary: number;
  allowance: number;
  joinDate: string;
  offDay: number; // 0 Minggu, 1 Senin, ..., 6 Sabtu
}

export interface Attendance {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  clockIn?: string; // ISO waktu submit absensi
  lat?: number;
  lng?: number;
  photo?: string; // dataURL
  reason?: string;
  status: "hadir" | "sakit" | "izin" | "alpha";
}

export interface LeaveRequest {
  id: string;
  userId: string;
  type: "sakit" | "cuti" | "izin";
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Payroll {
  id: string;
  userId: string;
  period: string; // YYYY-MM
  daysPresent: number;
  paidLeaveDays: number;
  workDays: number;
  baseSalary: number;
  allowance: number;
  overtime: number;
  deduction: number;
  total: number;
  generatedAt: string;
}

interface AppState {
  currentUserId: string | null;
  users: User[];
  attendance: Attendance[];
  leaves: LeaveRequest[];
  payrolls: Payroll[];
  login: (email: string, password: string) => User | null;
  logout: () => void;
  addAttendance: (a: Attendance) => void;
  updateAttendance: (id: string, patch: Partial<Attendance>) => void;
  deleteAttendance: (id: string) => void;
  deleteAttendanceForDay: (userId: string, date: string) => void;
  addLeave: (l: LeaveRequest) => void;
  updateLeave: (id: string, patch: Partial<LeaveRequest>) => void;
  addUser: (u: User) => void;
  updateUser: (id: string, patch: Partial<User>) => void;
  deleteUser: (id: string) => void;
  generatePayroll: (period: string) => void;
}

const seedUsers: User[] = [
  {
    id: "u-admin",
    name: "Admin HR",
    email: "admin@demo.com",
    password: "admin123",
    role: "admin",
    position: "HR Manager",
    baseSalary: 12000000,
    allowance: 2000000,
    joinDate: "2022-01-10",
    offDay: 0,
  },
  {
    id: "u-budi",
    name: "Budi Santoso",
    email: "budi@demo.com",
    password: "karyawan123",
    role: "karyawan",
    position: "Software Engineer",
    baseSalary: 9000000,
    allowance: 1500000,
    joinDate: "2023-03-15",
    offDay: 0,
  },
  {
    id: "u-sari",
    name: "Sari Dewi",
    email: "sari@demo.com",
    password: "karyawan123",
    role: "karyawan",
    position: "UI/UX Designer",
    baseSalary: 8500000,
    allowance: 1200000,
    joinDate: "2023-07-01",
    offDay: 2,
  },
  {
    id: "u-andi",
    name: "Andi Pratama",
    email: "andi@demo.com",
    password: "karyawan123",
    role: "karyawan",
    position: "Marketing Staff",
    baseSalary: 7000000,
    allowance: 1000000,
    joinDate: "2024-02-20",
    offDay: 4,
  },
];

// seed beberapa absensi bulan ini
function seedAttendance(): Attendance[] {
  const now = new Date();
  const list: Attendance[] = [];
  const employees = seedUsers.filter((u) => u.role === "karyawan");
  for (let day = 1; day < now.getDate(); day++) {
    const d = new Date(now.getFullYear(), now.getMonth(), day);
    employees.forEach((emp, idx) => {
      if (d.getDay() === emp.offDay) return;
      const skip = (day + idx) % 9 === 0;
      if (skip) return;
      const dateStr = formatLocalDate(d);
      const inTime = new Date(d);
      inTime.setHours(8, (idx * 7 + day) % 30, 0);
      list.push({
        id: `a-${emp.id}-${dateStr}`,
        userId: emp.id,
        date: dateStr,
        clockIn: inTime.toISOString(),
        lat: -6.2 + Math.random() * 0.05,
        lng: 106.8 + Math.random() * 0.05,
        status: "hadir",
      });
    });
  }
  return list;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUserId: null,
      users: seedUsers,
      attendance: seedAttendance(),
      leaves: [
        {
          id: "l-1",
          userId: "u-sari",
          type: "sakit",
          startDate: formatLocalDate(),
          endDate: formatLocalDate(),
          reason: "Demam tinggi, surat dokter terlampir",
          status: "pending",
          createdAt: new Date().toISOString(),
        },
      ],
      payrolls: [],
      login: (email, password) => {
        const u = get().users.find(
          (x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password
        );
        if (u) set({ currentUserId: u.id });
        return u ?? null;
      },
      logout: () => set({ currentUserId: null }),
      addAttendance: (a) =>
        set((s) => ({
          attendance: [
            ...s.attendance.filter(
              (x) => !(x.id === a.id || (x.userId === a.userId && x.date === a.date)),
            ),
            a,
          ],
        })),
      updateAttendance: (id, patch) =>
        set((s) => ({
          attendance: s.attendance.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      deleteAttendance: (id) =>
        set((s) => ({
          attendance: s.attendance.filter((x) => x.id !== id),
        })),
      deleteAttendanceForDay: (userId, date) =>
        set((s) => ({
          attendance: s.attendance.filter((x) => !(x.userId === userId && x.date === date)),
        })),
      addLeave: (l) => set((s) => ({ leaves: [l, ...s.leaves] })),
      updateLeave: (id, patch) =>
        set((s) => ({ leaves: s.leaves.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      addUser: (u) => set((s) => ({ users: [...s.users, u] })),
      updateUser: (id, patch) =>
        set((s) => ({ users: s.users.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteUser: (id) =>
        set((s) => ({
          currentUserId: s.currentUserId === id ? null : s.currentUserId,
          users: s.users.filter((x) => x.id !== id),
          attendance: s.attendance.filter((x) => x.userId !== id),
          leaves: s.leaves.filter((x) => x.userId !== id),
          payrolls: s.payrolls.filter((x) => x.userId !== id),
        })),
      generatePayroll: (period) => {
        const { users, attendance, leaves, payrolls } = get();
        const [yy, mm] = period.split("-").map(Number);
        // hitung work days (Mon-Fri) di bulan
        const lastDay = new Date(yy, mm, 0).getDate();
        const employees = users.filter((u) => u.role === "karyawan");
        const newPayrolls: Payroll[] = employees.map((emp) => {
          const offDay = emp.offDay ?? 0;
          let workDays = 0;
          for (let d = 1; d <= lastDay; d++) {
            if (new Date(yy, mm - 1, d).getDay() !== offDay) workDays++;
          }
          const daysPresent = attendance.filter(
            (a) =>
              a.userId === emp.id &&
              a.date.startsWith(period) &&
              isScheduledWorkDate(a.date, offDay) &&
              a.status === "hadir"
          ).length;
          const attendedDates = new Set(
            attendance
              .filter(
                (a) =>
                  a.userId === emp.id &&
                  a.date.startsWith(period) &&
                  isScheduledWorkDate(a.date, offDay) &&
                  a.status === "hadir",
              )
              .map((a) => a.date),
          );
          const paidLeaveDays = new Set(
            leaves
              .filter((l) => l.userId === emp.id && l.status === "approved")
              .flatMap((l) => eachScheduledWorkDate(l.startDate, l.endDate, offDay))
              .filter((date) => date.startsWith(period) && !attendedDates.has(date)),
          ).size;
          const paidDays = Math.min(daysPresent + paidLeaveDays, workDays);
          const ratio = workDays === 0 ? 0 : paidDays / workDays;
          const base = Math.round(emp.baseSalary * ratio);
          const allowance = emp.allowance;
          const overtime = 0;
          const deduction = Math.round(base * 0.05); // BPJS/pajak demo 5%
          return {
            id: `p-${emp.id}-${period}`,
            userId: emp.id,
            period,
            daysPresent,
            paidLeaveDays,
            workDays,
            baseSalary: base,
            allowance,
            overtime,
            deduction,
            total: base + allowance + overtime - deduction,
            generatedAt: new Date().toISOString(),
          };
        });
        // replace yang sudah ada untuk periode itu
        const filtered = payrolls.filter((p) => p.period !== period);
        set({ payrolls: [...filtered, ...newPayrolls] });
      },
    }),
    { name: "absenpay-store" }
  )
);

export const useCurrentUser = () => {
  const id = useStore((s) => s.currentUserId);
  const users = useStore((s) => s.users);
  return users.find((u) => u.id === id) ?? null;
};

export const formatRupiah = (n: number) =>
  "Rp " + n.toLocaleString("id-ID");
