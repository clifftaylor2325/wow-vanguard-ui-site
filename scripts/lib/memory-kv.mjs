// An in-memory stand-in for a Workers KV namespace (get, put with
// expirationTtl, delete, list by prefix), for the feedback tests and the
// screenshot walk-through. clock.now is the time in ms. Every call waits a
// turn of the event loop first, so requests run side by side interleave
// the way they would against real KV. Unlike real KV it is always
// consistent: each call sees every earlier write at once.
export function memoryKV(clock = { get now() { return Date.now(); } }) {
  const map = new Map();
  const turn = () => new Promise((resolve) => setImmediate(resolve));
  const live = (key) => {
    const e = map.get(key);
    if (e && e.until && e.until <= clock.now) map.delete(key);
    return map.get(key);
  };
  return {
    map,
    async get(key) {
      await turn();
      const e = live(key);
      return e ? e.value : null;
    },
    async put(key, value, opts = {}) {
      await turn();
      map.set(key, { value: String(value), until: opts.expirationTtl ? clock.now + opts.expirationTtl * 1000 : 0 });
    },
    async delete(key) {
      await turn();
      map.delete(key);
    },
    async list({ prefix = "" } = {}) {
      await turn();
      const keys = [...map.keys()].filter((k) => k.startsWith(prefix) && live(k)).sort().map((name) => ({ name }));
      return { keys, list_complete: true, cursor: "" };
    },
  };
}
