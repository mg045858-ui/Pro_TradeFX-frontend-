/**
 * api.js — All TradeX backend API calls
 */

const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const getToken   = ()    => localStorage.getItem("tradex_token");
export const setToken   = (tok) => localStorage.setItem("tradex_token", tok);
export const clearToken = ()    => localStorage.removeItem("tradex_token");

async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

/* ── AUTH ── */
export async function apiRegister({ name, email, password }) {
  const data = await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  setToken(data.token);
  return data.user;
}

export async function apiLogin({ email, password }) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data.user;
}

export async function apiGetMe() {
  const data = await apiFetch("/auth/me");
  return data.user;
}

/* ── DEPOSIT ── */
export async function apiInitiateDeposit({ amount, method }) {
  return apiFetch("/deposit/initiate", {
    method: "POST",
    body: JSON.stringify({ amount, method }),
  });
}

export async function apiConfirmDeposit({ txid, utr }) {
  return apiFetch("/deposit/confirm", {
    method: "POST",
    body: JSON.stringify({ txid, utr }),
  });
}

/* ── WITHDRAW ── */
export async function apiWithdraw({ amount, method, methodDetail }) {
  return apiFetch("/withdraw", {
    method: "POST",
    body: JSON.stringify({ amount, method, methodDetail }),
  });
}

/* ── TRANSACTIONS ── */
export async function apiGetTransactions() {
  const data = await apiFetch("/transactions");
  return data.transactions;
}

/* ── ADMIN ── */
export async function apiAdminGetUsers(search = "") {
  const q = search ? `?search=${encodeURIComponent(search)}` : "";
  const data = await apiFetch(`/admin/users${q}`);
  return data.users;
}

export async function apiAdminGetTransactions({ status, type } = {}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (type)   params.set("type",   type);
  const q = params.toString() ? "?" + params.toString() : "";
  const data = await apiFetch(`/admin/transactions${q}`);
  return data.transactions;
}

export async function apiAdminApproveDeposit(txid) {
  return apiFetch("/admin/approve-deposit", { method: "POST", body: JSON.stringify({ txid }) });
}

export async function apiAdminRejectDeposit(txid, reason) {
  return apiFetch("/admin/reject-deposit", { method: "POST", body: JSON.stringify({ txid, reason }) });
}

export async function apiAdminSetBalance({ uid, real_balance, demo_balance, note }) {
  return apiFetch("/admin/set-balance", { method: "POST", body: JSON.stringify({ uid, real_balance, demo_balance, note }) });
}

export async function apiAdminCredit({ uid, amount, account, note }) {
  return apiFetch("/admin/credit", { method: "POST", body: JSON.stringify({ uid, amount, account, note }) });
}

export async function apiAdminGetStats() {
  const data = await apiFetch("/admin/stats");
  return data;
}
