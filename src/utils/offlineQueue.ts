import { Transaction } from '../types';

const DB_NAME = 'SwiftPayOfflineQueueDB';
const STORE_NAME = 'payment_queue';
const DB_VERSION = 1;

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open IndexedDB for offline queue');
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Adds a payment attempt to the IndexedDB offline queue.
 */
export async function addOfflinePayment(tx: Transaction): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(tx);

      request.onsuccess = () => {
        console.log(`Payment attempt ${tx.id} queued successfully in IndexedDB`);
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Failed to add payment to offline queue', error);
    throw error;
  }
}

/**
 * Gets all payment attempts stored in the IndexedDB offline queue.
 */
export async function getOfflinePayments(): Promise<Transaction[]> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result as Transaction[]);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Failed to fetch offline payment queue', error);
    return [];
  }
}

/**
 * Removes a payment attempt from the IndexedDB offline queue.
 */
export async function deleteOfflinePayment(id: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log(`Payment attempt ${id} removed from offline queue`);
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error(`Failed to delete offline payment ${id}`, error);
    throw error;
  }
}

/**
 * Clears all payments from the offline queue.
 */
export async function clearOfflineQueue(): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('Offline queue cleared successfully');
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Failed to clear offline queue', error);
    throw error;
  }
}
