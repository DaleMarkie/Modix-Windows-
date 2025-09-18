// src/utils/authFetch.ts

export interface AuthFetchInit extends RequestInit {
  credentials?: RequestCredentials; // allow overriding credentials
}

/**
 * Auth fetch util
 * Automatically includes credentials (cookies) for authenticated requests.
 */
export async function authFetch(
  input: RequestInfo,
  init: AuthFetchInit = {}
): Promise<Response> {
  const fetchOptions: RequestInit = {
    ...init,
    credentials: init.credentials || "include",
  };

  return fetch(input, fetchOptions);
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : undefined;
}
