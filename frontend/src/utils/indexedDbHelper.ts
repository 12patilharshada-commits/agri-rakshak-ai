// IndexedDB offline cache manager for AgriRakshak AI
const DB_NAME = 'agri_rakshak_db';
const DB_VERSION = 1;

export interface OfflineSOS {
  id?: number;
  lat: number;
  lon: number;
  timestamp: string;
  synced: boolean;
}

export interface CachedWeather {
  location: string;
  data: any;
  timestamp: number;
}

export class IndexedDbHelper {
  private static openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = request.result;
        
        // Weather cache store
        if (!db.objectStoreNames.contains('weather')) {
          db.createObjectStore('weather', { keyPath: 'location' });
        }
        
        // Disease history cache store
        if (!db.objectStoreNames.contains('disease_history')) {
          db.createObjectStore('disease_history', { keyPath: 'id', autoIncrement: true });
        }
        
        // Offline SOS queue store
        if (!db.objectStoreNames.contains('sos_queue')) {
          db.createObjectStore('sos_queue', { keyPath: 'id', autoIncrement: true });
        }
        
        // Offline FAQs
        if (!db.objectStoreNames.contains('faqs')) {
          db.createObjectStore('faqs', { keyPath: 'id', autoIncrement: true });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // --- Weather Operations ---
  static async cacheWeather(location: string, data: any): Promise<void> {
    const db = await this.openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('weather', 'readwrite');
      const store = tx.objectStore('weather');
      const entry: CachedWeather = {
        location,
        data,
        timestamp: Date.now(),
      };
      
      const req = store.put(entry);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  static async getCachedWeather(location: string): Promise<any | null> {
    try {
      const db = await this.openDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('weather', 'readonly');
        const store = tx.objectStore('weather');
        const req = store.get(location);
        
        req.onsuccess = () => {
          const result = req.result as CachedWeather;
          if (result) {
            // Cache valid for 4 hours
            if (Date.now() - result.timestamp < 4 * 60 * 60 * 1000) {
              resolve(result.data);
              return;
            }
          }
          resolve(null);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      return null;
    }
  }

  // --- Disease History Operations ---
  static async addDiseaseReport(report: any): Promise<number> {
    const db = await this.openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('disease_history', 'readwrite');
      const store = tx.objectStore('disease_history');
      const req = store.add(report);
      req.onsuccess = () => resolve(req.result as number);
      req.onerror = () => reject(req.error);
    });
  }

  static async getDiseaseHistory(): Promise<any[]> {
    try {
      const db = await this.openDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('disease_history', 'readonly');
        const store = tx.objectStore('disease_history');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return [];
    }
  }

  // --- Offline SOS Queue Operations ---
  static async queueSOS(lat: number, lon: number): Promise<number> {
    const db = await this.openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sos_queue', 'readwrite');
      const store = tx.objectStore('sos_queue');
      const req = store.add({
        lat,
        lon,
        timestamp: new Date().toISOString(),
        synced: false
      });
      req.onsuccess = () => resolve(req.result as number);
      req.onerror = () => reject(req.error);
    });
  }

  static async getQueuedSOS(): Promise<OfflineSOS[]> {
    try {
      const db = await this.openDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('sos_queue', 'readonly');
        const store = tx.objectStore('sos_queue');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return [];
    }
  }

  static async clearSyncedSOS(ids: number[]): Promise<void> {
    const db = await this.openDb();
    const tx = db.transaction('sos_queue', 'readwrite');
    const store = tx.objectStore('sos_queue');
    for (const id of ids) {
      store.delete(id);
    }
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
    });
  }
}
