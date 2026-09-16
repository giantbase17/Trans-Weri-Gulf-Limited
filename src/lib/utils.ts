import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extracts a human-readable message from any thrown value. Supabase's
 * storage/postgrest error objects carry a `.message` even when they don't
 * strictly satisfy `instanceof Error`, so checking for the property
 * directly surfaces the real reason instead of falling back to a generic
 * string.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}

/**
 * The canonical origin to use in emailed links (auth confirmation, password
 * reset, invites). Prefers VITE_SITE_URL so those links always point at the
 * production deployment even when an admin triggers them from a local dev
 * server, which would otherwise bake an unreachable localhost URL into the
 * email.
 */
export function getSiteUrl(): string {
  const configured = import.meta.env["VITE_SITE_URL"];
  if (typeof configured === "string" && configured.trim()) {
    return configured.trim().replace(/\/$/, "");
  }
  return typeof window === "undefined" ? "" : window.location.origin;
}
