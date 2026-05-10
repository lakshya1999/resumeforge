import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export function formatDate(dateStr: string) {
  if (!dateStr) return "";
  // If it's a YYYY-MM format, convert to "Jan 2022"
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})$/);
  if (isoMatch) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthName = months[parseInt(isoMatch[2]) - 1];
    return monthName ? `${monthName} ${isoMatch[1]}` : isoMatch[1];
  }
  // Otherwise return as-is (e.g. "Jan 2022", "2023", "Present")
  return dateStr;
}
