import { create } from "zustand";
import { persist } from "zustand/middleware";

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
}

export interface Attendance {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  clockIn?: string; // ISO
  clockOut?: string;
  lat?: number;
  lng?: number;
  photo?: string; // dataURL
  status: "hadir" | "telat" | "alpha";
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
  },
];

// seed beberapa absensi bulan ini
function seedAttendance(): Attendance[] {
  const now = new Date();
  const list: Attendance[] = [];
  const employees = seedUsers.filter((u) => u.role === "karyawan");
  for (let day = 1; day <= now.getDate(); day++) {
    const d = new Date(now.getFullYear(), now.getMonth(), day);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    employees.forEach((emp, idx) => {
      const skip = (day + idx) % 9 === 0;
      if (skip) return;
      const dateStr = d.toISOString().slice(0, 10);
      const inTime = new Date(d);
      inTime.setHours(8, (idx * 7 + day) % 30, 0);
      const outTime = new Date(d);
      outTime.setHours(17, (idx * 5) % 30, 0);
      list.push({
        id: `a-${emp.id}-${dateStr}`,
        userId: emp.id,
        date: dateStr,
        clockIn: inTime.toISOString(),
        clockOut: day === now.getDate() ? undefined : outTime.toISOString(),
        lat: -6.2 + Math.random() * 0.05,
        lng: 106.8 + Math.random() * 0.05,
        status: inTime.getMinutes() > 15 ? "telat" : "hadir",
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
          startDate: new Date().toISOString().slice(0, 10),
          endDate: new Date().toISOString().slice(0, 10),
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
      addAttendance: (a) => set((s) => ({ attendance: [...s.attendance, a] })),
      updateAttendance: (id, patch) =>
        set((s) => ({
          attendance: s.attendance.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      addLeave: (l) => set((s) => ({ leaves: [l, ...s.leaves] })),
      updateLeave: (id, patch) =>
        set((s) => ({ leaves: s.leaves.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      addUser: (u) => set((s) => ({ users: [...s.users, u] })),
      updateUser: (id, patch) =>
        set((s) => ({ users: s.users.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteUser: (id) => set((s) => ({ users: s.users.filter((x) => x.id !== id) })),
      generatePayroll: (period) => {
        const { users, attendance, payrolls } = get();
        const [yy, mm] = period.split("-").map(Number);
        // hitung work days (Mon-Fri) di bulan
        const lastDay = new Date(yy, mm, 0).getDate();
        let workDays = 0;
        for (let d = 1; d <= lastDay; d++) {
          const dow = new Date(yy, mm - 1, d).getDay();
          if (dow !== 0 && dow !== 6) workDays++;
        }
        const employees = users.filter((u) => u.role === "karyawan");
        const newPayrolls: Payroll[] = employees.map((emp) => {
          const days = attendance.filter(
            (a) => a.userId === emp.id && a.date.startsWith(period) && a.clockIn
          ).length;
          const ratio = days / workDays;
          const base = Math.round(emp.baseSalary * ratio);
          const allowance = emp.allowance;
          const overtime = 0;
          const deduction = Math.round(base * 0.05); // BPJS/pajak demo 5%
          return {
            id: `p-${emp.id}-${period}`,
            userId: emp.id,
            period,
            daysPresent: days,
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
