// Centralized API configuration. Single source of truth for the backend URL.
// All fetch calls in the app should import API_URL from here.
//
// To change environments later, set VITE_API_URL in the Vercel/local env vars.

export const API_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "https://automation-system-production-2711.up.railway.app";

/**
 * Convenience wrapper around fetch that prepends API_URL.
 * Use it for any backend call:
 *
 *   const res = await api("/clients");
 *   const res = await api("/admin/pause-client", { method: "POST", json: { client_id: 1 } });
 */
export async function api(
  path: string,
  options: (RequestInit & { json?: unknown }) = {},
): Promise<Response> {
  const { json, headers, ...rest } = options;

  const init: RequestInit = {
    ...rest,
    headers: {
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(headers || {}),
    },
    body: json !== undefined ? JSON.stringify(json) : (rest as RequestInit).body,
  };

  return fetch(`${API_URL}${path}`, init);
}