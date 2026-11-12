// Persistent when available, memory-only otherwise. No personal data leaves this device.
const PREFIX = 'maha.escape.v1.';
const fallback = new Map();
function storage() { try { const s = window.localStorage; const k = PREFIX+'probe'; s.setItem(k,'1'); s.removeItem(k); return s; } catch { return null; } }
const local = storage();
export const store = {
  get(key, fallbackValue = null) {
    try { const raw = fallback.has(key) ? fallback.get(key) : (local ? local.getItem(PREFIX+key) : null); return raw == null ? fallbackValue : JSON.parse(raw); }
    catch { return fallbackValue; }
  },
  set(key, value) {
    const raw = JSON.stringify(value);
    try { if(local) { local.setItem(PREFIX+key, raw); fallback.delete(key); return true; } } catch { /* private browsing/quota */ }
    fallback.set(key, raw); return false;
  },
  remove(key) { try { local?.removeItem(PREFIX+key); } catch {} fallback.delete(key); },
  get durable() { return !!local; }
};
export function beginVisit() {
  let already = false;
  try { already = sessionStorage.getItem(PREFIX+'seenThisSession') === '1'; sessionStorage.setItem(PREFIX+'seenThisSession','1'); } catch {}
  let n = Number(store.get('visits',0)) || 0;
  if (!already) { n += 1; store.set('visits',n); }
  if (!store.get('firstVisitAt')) store.set('firstVisitAt', Date.now());
  return n;
}