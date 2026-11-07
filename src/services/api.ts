import { Employee, ServiceCatalogItem, ProductCatalogItem, TransactionEntry } from '../types';

export interface SalonSyncPayload {
  employees: Employee[];
  services: ServiceCatalogItem[];
  products: ProductCatalogItem[];
  transactions: TransactionEntry[];
  updatedAt: string;
}

/**
 * Fetches the shared salon database from the server if available
 */
export async function fetchServerData(): Promise<SalonSyncPayload | null> {
  try {
    const res = await fetch('/api/data', {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.employees && data.transactions) {
      return data as SalonSyncPayload;
    }
    return null;
  } catch {
    // Pure client or offline mode fallback
    return null;
  }
}

/**
 * Saves the shared salon database to the server so all devices share the same data
 */
export async function saveServerData(payload: SalonSyncPayload): Promise<boolean> {
  try {
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}
