import { KeyValueStore } from "../core/Progress";

/**
 * Adapter from the core's tiny KeyValueStore interface to Lens Studio's
 * persistent storage (data stays on the device; nothing is uploaded).
 *
 * VERIFY: uses global.persistentStorageSystem.store.getString / putString.
 * Any failure degrades silently to "no saved data" so the Lens never crashes.
 */
export class LensPersistentStore implements KeyValueStore {
  private get store(): any {
    return global.persistentStorageSystem.store;
  }

  get(key: string): string | null {
    try {
      const v: string = this.store.getString(key);
      return v ? v : null;
    } catch (e) {
      return null;
    }
  }

  set(key: string, value: string): void {
    try {
      this.store.putString(key, value);
    } catch (e) {
      // storage unavailable — progress simply isn't saved
    }
  }
}
