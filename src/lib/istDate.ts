/**
 * India (Asia/Kolkata) business dates. Business dates are YYYY-MM-DD strings
 * and are never passed through new Date() for display or comparison.
 * Audit timestamps (created_at, updated_at) stay UTC and do not use this module.
 */
const FMT = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" });
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function toISTDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const parts = FMT.formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}
export function todayIST(): string { return toISTDate(new Date()); }
export function currentPeriodIST(): string { return todayIST().slice(0, 7); }
export function periodOf(dateStr: string): string { return dateStr.slice(0, 7); }
export function monthStart(period: string): string { return `${period.slice(0, 7)}-01`; }
function isLeap(y: number) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }
export function monthEnd(period: string): string {
  const y = Number(period.slice(0, 4));
  const m = Number(period.slice(5, 7));
  const days = [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
  return `${period.slice(0, 7)}-${String(days).padStart(2, "0")}`;
}
export function addMonths(period: string, n: number): string {
  const total = Number(period.slice(0, 4)) * 12 + (Number(period.slice(5, 7)) - 1) + n;
  const y = Math.floor(total / 12);
  const m = total - y * 12 + 1;
  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}`;
}
export function financialYearOf(dateStr: string): string {
  const y = Number(dateStr.slice(0, 4));
  const start = Number(dateStr.slice(5, 7)) >= 4 ? y : y - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, "0")}`;
}
export function fyQuarterOf(dateStr: string): "Q1" | "Q2" | "Q3" | "Q4" {
  const m = Number(dateStr.slice(5, 7));
  return m >= 4 && m <= 6 ? "Q1" : m >= 7 && m <= 9 ? "Q2" : m >= 10 ? "Q3" : "Q4";
}
export function isOverdue(dueDate: string): boolean { return dueDate.slice(0, 10) < todayIST(); }
function dayNumber(s: string): number {
  return Date.UTC(Number(s.slice(0, 4)), Number(s.slice(5, 7)) - 1, Number(s.slice(8, 10))) / 86_400_000;
}
export function daysUntil(dueDate: string): number { return Math.round(dayNumber(dueDate) - dayNumber(todayIST())); }
export function formatDateIN(dateStr: string): string {
  if (!/^\d{4}-\d{2}-\d{2}/.test(dateStr ?? "")) return dateStr ?? "";
  return `${dateStr.slice(8, 10)} ${MONTHS[Number(dateStr.slice(5, 7)) - 1]} ${dateStr.slice(0, 4)}`;
}
