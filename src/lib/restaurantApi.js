/**
 * Calls Restaurant Server public website APIs.
 * Linking is done only in Admin → Settings → Website Connection (site slug).
 */
import { RESTAURANT_API_URL, SITE_SLUG } from '../config';

function baseUrl() {
  return `${RESTAURANT_API_URL.replace(/\/$/, '')}/api/public/website/${encodeURIComponent(SITE_SLUG)}`;
}

export function resolveMenuImage(url) {
  const raw = String(url || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw) || raw.startsWith('data:')) return raw;
  const base = RESTAURANT_API_URL.replace(/\/$/, '');
  return raw.startsWith('/') ? `${base}${raw}` : `${base}/${raw}`;
}

async function parseJson(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) {
    const err = new Error(data.error || data.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function getRestaurantStatus() {
  const res = await fetch(baseUrl());
  return parseJson(res);
}

/** Live menu from Restaurant Admin → Menus (available items only). */
export async function getMenu() {
  const res = await fetch(`${baseUrl()}/menu`);
  const data = await parseJson(res);
  const items = (data.items || []).map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category || 'General',
    desc: item.description || '',
    description: item.description || '',
    priceValue: Number(item.price) || 0,
    image: resolveMenuImage(item.imageUrl),
    veg: Boolean(item.isVeg),
    spicyLevel: item.spicyLevel || '',
    available: item.available !== false,
    live: true,
  }));
  return {
    ...data,
    items,
    categories: Array.isArray(data.categories) && data.categories.length
      ? data.categories
      : [...new Set(items.map((i) => i.category))],
  };
}

export async function getAvailability({ date, partySize = 2, slotMinutes = 60 }) {
  const params = new URLSearchParams({
    date,
    partySize: String(partySize),
    slotMinutes: String(slotMinutes),
  });
  const res = await fetch(`${baseUrl()}/availability?${params}`);
  return parseJson(res);
}

export async function createReservation(payload) {
  const res = await fetch(`${baseUrl()}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson(res);
}

export async function createOrder(payload) {
  const res = await fetch(`${baseUrl()}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson(res);
}

export function nextLocalDateISO(daysAhead = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function buildReservedAt(dateISO, timeHHMM) {
  const offsetMin = -new Date().getTimezoneOffset();
  const sign = offsetMin >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMin);
  const oh = String(Math.floor(abs / 60)).padStart(2, '0');
  const om = String(abs % 60).padStart(2, '0');
  return `${dateISO}T${timeHHMM}:00${sign}${oh}:${om}`;
}
