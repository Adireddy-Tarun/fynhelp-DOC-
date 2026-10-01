import { afterEach, describe, expect, it, vi } from "vitest";
import {
  toISTDate, monthEnd, financialYearOf, fyQuarterOf, isOverdue, daysUntil, addMonths, formatDateIN, periodOf, monthStart, todayIST,
} from "@/lib/istDate";

afterEach(() => vi.useRealTimers());

describe("istDate", () => {
  it("converts instants to India dates", () => {
    expect(toISTDate("2026-09-30T19:00:00Z")).toBe("2026-10-01");
    expect(toISTDate("2026-09-30T18:29:59Z")).toBe("2026-09-30");
  });
  it("month boundaries", () => {
    expect(monthEnd("2028-02")).toBe("2028-02-29");
    expect(monthEnd("2026-02")).toBe("2026-02-28");
    expect(monthEnd("2100-02")).toBe("2100-02-28");
    expect(monthStart("2026-09")).toBe("2026-09-01");
    expect(addMonths("2026-11", 3)).toBe("2027-02");
    expect(addMonths("2026-01", -1)).toBe("2025-12");
    expect(periodOf("2026-09-05")).toBe("2026-09");
  });
  it("financial year and quarter", () => {
    expect(financialYearOf("2027-03-31")).toBe("2026-27");
    expect(financialYearOf("2027-04-01")).toBe("2027-28");
    expect(fyQuarterOf("2026-01-15")).toBe("Q4");
    expect(fyQuarterOf("2026-04-01")).toBe("Q1");
  });
  it("overdue and days until around midnight IST", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-30T18:29:00Z")); // 23:59 IST on 30 Sep
    expect(todayIST()).toBe("2026-09-30");
    expect(isOverdue("2026-09-30")).toBe(false);
    expect(daysUntil("2026-10-01")).toBe(1);
    vi.setSystemTime(new Date("2026-09-30T18:31:00Z")); // 00:01 IST on 1 Oct
    expect(isOverdue("2026-09-30")).toBe(true);
    expect(daysUntil("2026-09-30")).toBe(-1);
    expect(daysUntil("2026-10-01")).toBe(0);
  });
  it("formats without shifting", () => {
    expect(formatDateIN("2026-09-05")).toBe("05 Sep 2026");
  });
});
