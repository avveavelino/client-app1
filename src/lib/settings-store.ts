import { useEffect, useState } from "react";

/**
 * Client settings store.
 *
 * Persisted in localStorage under STORAGE_KEY. Designed to be replaced later
 * with a backend-synced version: keep field names stable so the JSON shape
 * here can be lifted directly into a `client.settings_ui` object on the
 * backend without renames.
 *
 * Each settings group is an opt-in module (e.g. customerContact). Future
 * clients may disable entire modules — keep that pattern as we add more.
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

  // Kundkontakt — controls SMS / Ring / E-post buttons in Delivery rows.
  // Module pattern: master flag + per-channel sub-flags. Easy to extend.
  customerContactActive: boolean;
  allowCustomerSms: boolean;
  allowCustomerCall: boolean;
  allowCustomerEmail: boolean;
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
  customerContactActive: true,
  allowCustomerSms: true,
  allowCustomerCall: true,
  allowCustomerEmail: true,
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

export function useSettings() {
  const [settings, setSettings] = useState<ClientSettings>(() =>
    loadFromStorage(),
  );

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

/**
 * Helper: resolve which customer contact channels are currently usable.
 * Returns flags consumed by OrderRow / Delivery components.
 *
 * Master OFF ⇒ all OFF, regardless of sub-flags.
 */
export function resolveContactFlags(s: ClientSettings) {
  const masterOn = s.customerContactActive;
  return {
    sms: masterOn && s.allowCustomerSms,
    call: masterOn && s.allowCustomerCall,
    email: masterOn && s.allowCustomerEmail,
  };
}