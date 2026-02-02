import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseFlexibleDate(input: string): Date | undefined {
  const clean = input.replace(/[^0-9/.-]/g, '');
  if (!clean) return undefined;

  let month: number, day: number, year: number;

  // Case 1: Has / or - or .
  if (/[/.-]/.test(clean)) {
    const parts = clean.split(/[/.-]/);
    if (parts.length === 3) {
      if (!parts[0] || !parts[1] || !parts[2]) return undefined;
      month = parseInt(parts[0]);
      day = parseInt(parts[1]);
      year = parseInt(parts[2]);
    } else if (parts.length === 2 && parts[1].length >= 3) {
      // Handle the "2/625" case -> 2, 625 (D, YY)
      month = parseInt(parts[0]);
      const last = parts[1];
      if (last.length === 3) {
        // 625 -> 6, 25
        day = parseInt(last.substring(0, 1));
        year = parseInt(last.substring(1));
      } else if (last.length === 4) {
        // 2525 -> 25, 25
        day = parseInt(last.substring(0, 2));
        year = parseInt(last.substring(2));
      } else {
        return undefined; // ambiguous
      }
    } else {
      // Maybe M/D? use current year?
      if (parts.length === 2) {
        month = parseInt(parts[0]);
        day = parseInt(parts[1]);
        year = new Date().getFullYear() % 100; // default to current YY
      } else {
        return undefined;
      }
    }
  } else {
    // Continuous digits
    if (clean.length === 6) {
      // MMDDYY
      month = parseInt(clean.substring(0, 2));
      day = parseInt(clean.substring(2, 4));
      year = parseInt(clean.substring(4, 6));
    } else if (clean.length === 8) {
      // MMDDYYYY
      month = parseInt(clean.substring(0, 2));
      day = parseInt(clean.substring(2, 4));
      year = parseInt(clean.substring(4, 8));
    } else if (clean.length === 5) {
      // mddyy or mmdyy - ambiguous, prefer M-DD-YY
      const m1 = parseInt(clean.substring(0, 1));
      const d1 = parseInt(clean.substring(1, 3));
      const y1 = parseInt(clean.substring(3, 5));

      const m2 = parseInt(clean.substring(0, 2));
      const d2 = parseInt(clean.substring(2, 3));
      const y2 = parseInt(clean.substring(3, 5));

      // Try 1 digit month first? "12525" -> 1/25/25 vs 12/5/25
      // Let's assume user types leading zero usually, but if not:
      // If m2 is valid month (10,11,12) we might prefer that?
      if (m2 >= 10 && m2 <= 12 && d2 > 0) {
        month = m2; day = d2; year = y2;
      } else if (m1 > 0 && d1 <= 31) {
        month = m1; day = d1; year = y1;
      } else {
        return undefined;
      }
    } else {
      // Too short or 7 digits?
      return undefined;
    }
  }

  // Normalize Year
  if (year < 100) year += 2000; // Assume 21st century

  // Validation
  const date = new Date(year, month - 1, day);
  if (date.getMonth() !== month - 1 || date.getDate() !== day || year < 1900 || year > 2100) return undefined;

  return date;
}
