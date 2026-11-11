const PREFIX = "acolhe:";

export const storage = {
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  set<T>(key: string, value: T) {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  },
  remove(key: string) {
    localStorage.removeItem(PREFIX + key);
  },
};

export const SESSION_KEY = "session";
