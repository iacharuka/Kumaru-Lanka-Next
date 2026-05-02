import { useSyncExternalStore } from "react";

export type AuthUser = {
  fullName: string;
  email: string;
  role: string;
  expiry?: string;
};

const TOKEN_KEY = "kl_token";
const USER_KEY = "kl_user";
const AUTH_EVENT = "kl_auth_changed";

let cachedUserRaw: string | null | undefined;
let cachedUser: AuthUser | null = null;

function emitAuthChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_EVENT));
}

function subscribeAuthChange(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(AUTH_EVENT, callback);
  window.addEventListener("storage", callback);
  window.addEventListener("focus", callback);
  return () => {
    window.removeEventListener(AUTH_EVENT, callback);
    window.removeEventListener("storage", callback);
    window.removeEventListener("focus", callback);
  };
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
  emitAuthChange();
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
  emitAuthChange();
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (raw === cachedUserRaw) return cachedUser;

  cachedUserRaw = raw;
  if (!raw) {
    cachedUser = null;
    return cachedUser;
  }

  try {
    cachedUser = JSON.parse(raw) as AuthUser;
  } catch {
    cachedUser = null;
  }

  return cachedUser;
}

export function setUser(user: AuthUser) {
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  emitAuthChange();
}

export function clearUser() {
  window.localStorage.removeItem(USER_KEY);
  emitAuthChange();
}

export function logout() {
  clearToken();
  clearUser();
}

export function useAuthUser() {
  return useSyncExternalStore(subscribeAuthChange, getUser, () => null);
}
