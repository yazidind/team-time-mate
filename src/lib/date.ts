export const formatLocalDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatLocalMonth = (date = new Date()) => formatLocalDate(date).slice(0, 7);

export const parseLocalDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const dayNames = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
] as const;

export const isScheduledWorkDate = (date: Date | string, offDay: number) => {
  const parsed = typeof date === "string" ? parseLocalDate(date) : date;
  return parsed.getDay() !== offDay;
};

export const eachScheduledWorkDate = (startDate: string, endDate: string, offDay: number) => {
  const dates: string[] = [];
  const cursor = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);

  while (cursor <= end) {
    if (isScheduledWorkDate(cursor, offDay)) {
      dates.push(formatLocalDate(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
};

export const eachWorkDate = (startDate: string, endDate: string) => {
  const dates: string[] = [];
  const cursor = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);

  while (cursor <= end) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) {
      dates.push(formatLocalDate(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
};
