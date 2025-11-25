const subs = new Map();

export function on(topic, fn) {
  if (!subs.has(topic)) subs.set(topic, new Set());
  subs.get(topic).add(fn);
  return () => off(topic, fn);
}
export function off(topic, fn) {
  subs.get(topic)?.delete(fn);
}
export function emit(topic, payload) {
  subs.get(topic)?.forEach((fn) => {
    try { fn(payload); } catch (e) { console.log(e); }
  });
}
