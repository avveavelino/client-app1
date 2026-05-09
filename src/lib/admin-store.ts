import { useEffect, useState } from "react";

/**
 * Lightweight admin password gate.
 *
 * V1: shared password stored in VITE_ADMIN_PASSWORD env var.
 * Once unlocked in this browser, stays unlocked (sessionStorage).
 *
 * This is intentionally minimal — when you have multiple operators or
 * audit requirements, replace with real auth (NextAuth, Clerk, etc.).
 */

const SESSION_KEY = "client-app1.admin.unlocked";

export function getExpectedPassword(): string {
  return (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) ?? "";
}

export function useAdminAuth() {
  const [unlocked, setUnlocked] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(SESSION_KEY) === "1";
  });

  // Sync across tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === SESSION_KEY) {
        setUnlocked(sessionStorage.getItem(SESSION_KEY) === "1");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const unlock = (attempt: string) => {
    const expected = getExpectedPassword();
    if (!expected) {
      // No password configured — refuse to unlock so we don't expose the panel
      return false;
    }
    if (attempt === expected) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setUnlocked(true);
      return true;
    }
    return false;
  };

  const lock = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setUnlocked(false);
  };

  return { unlocked, unlock, lock };
}