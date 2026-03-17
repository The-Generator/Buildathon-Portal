import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(date: Date | string) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDateTime(date: Date | string) {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

/** Scroll to the first visible validation error after React re-renders. */
export function scrollToFirstError() {
  requestAnimationFrame(() => {
    // border-red-500 targets Input/Select fields in error state;
    // text-red-600 catches standalone error messages (RoleSelector, SkillChips, etc.)
    const el = document.querySelector<HTMLElement>(".border-red-500, .text-red-600");
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement) {
      el.focus();
    }
  });
}
