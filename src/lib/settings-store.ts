import { useEffect, useState } from "react";

/**
 * Client settings store.
 *
 * Persisted in localStorage under STORAGE_KEY. Designed to be replaced later
 * with a backend-synced version: keep field names stable so the JSON shape
 * here can be lifted directly into a `client.settings_ui` object on the
 * backend without renames.
 */

export interface ClientSettings {
  // Master switch — disables all automation-driven features below.
  automationActive: boolean;

  // E-postautomation
  autoReplies: boolean;
  orderConfirmations: boolean;

  // Leveransnotiser
  deliveryUpdates: boolean;
  smsNotifications: boolean;

  // Ordervisning (display-only, never disabled by master)
  showCompletedOrders: boolean;
  showOldOrders: boolean;

  // Ruttoptimering
  allowRouteOptimization: boolean;
  allowRouteStart: boolean;
}

export const DEFAULT_SETTINGS: ClientSettings = {
  automationActive: true,
  autoReplies: true,
  orderConfirmations: true,
  deliveryUpdates: true,
  smsNotifications: false,
  showCompletedOrders: true,
  showOldOrders: false,
  allowRouteOptimization: true,
  allowRouteStart: true,
};

const STORAGE_KEY = "client-app1.settings.v1";

function loadFromStorage(): ClientSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    // Merge over defaults so newly-added fields don't break old saves.
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveToStorage(settings: ClientSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Swallow quota / privacy-mode errors silently.
  }
}

/**
 * useSettings — shared client settings, persisted to localStorage,
 * synced live across tabs via the `storage` event.
 */
export function useSettings() {
  const [settings, setSettings] = useState<ClientSettings>(() =>
    loadFromStorage(),
  );

  // Keep tabs in sync if user changes settings in another tab.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setSettings(loadFromStorage());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = <K extends keyof ClientSettings>(
    key: K,
    value: ClientSettings[K],
  ) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveToStorage(next);
      return next;
    });
  };

  const updateMany = (patch: Partial<ClientSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveToStorage(next);
      return next;
    });
  };

  const reset = () => {
    setSettings(DEFAULT_SETTINGS);
    saveToStorage(DEFAULT_SETTINGS);
  };

  return { settings, update, updateMany, reset };
}