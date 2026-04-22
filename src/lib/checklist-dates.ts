const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** YYYY-MM-DD 문자열이면 true */
export function isValidIsoDateString(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return (
    dt.getFullYear() === y &&
    dt.getMonth() === m - 1 &&
    dt.getDate() === d
  );
}

/** 로컬 자정 기준 캘린더 날짜로 파싱 (input type="date"와 동일한 의미) */
export function parseIsoDateToLocalDate(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Prisma @db.Date(Postgres DATE)를 YYYY-MM-DD로 — PG는 UTC 자정으로 올 때가 많아 UTC 기준으로 자름 */
export function prismaDateToIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** DB 저장용: 캘린더 YYYY-MM-DD를 UTC 자정으로 맞춤 */
export function isoDateStringToPrismaDate(ymd: string): Date {
  return new Date(`${ymd}T00:00:00.000Z`);
}

/** 오늘(로컬)을 YYYY-MM-DD */
export function todayIsoDateLocal(): string {
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** dueDate(YYYY-MM-DD)와 오늘(로컬)의 일수 차이: 음수=지남, 0=오늘, 양수=N일 후 */
export function calendarDaysUntilDue(dueIso: string): number {
  const today = parseIsoDateToLocalDate(todayIsoDateLocal());
  const due = parseIsoDateToLocalDate(dueIso);
  const ms = due.getTime() - today.getTime();
  return Math.round(ms / 86400000);
}

/** 마감일 배지 문구 및 강조 여부 */
export function getDueDayMeta(dueIso: string): {
  text: string;
  overdue: boolean;
  soon: boolean;
} {
  const diff = calendarDaysUntilDue(dueIso);
  if (diff < 0) {
    return { text: `지남 ${Math.abs(diff)}일`, overdue: true, soon: false };
  }
  if (diff === 0) {
    return { text: "오늘", overdue: false, soon: true };
  }
  if (diff <= 7) {
    return { text: `D-${diff}`, overdue: false, soon: true };
  }
  return { text: `D-${diff}`, overdue: false, soon: false };
}

/** 정렬: 마감 임박(오름차순), null은 맨 뒤 */
export function compareDueDatesAsc(
  a: string | null,
  b: string | null
): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a.localeCompare(b);
}
