import { AppStateData } from './storage';
import { Warga, IPLTransaction, IPLPaymentItem, KasTransaction, MetodePembayaran, TipeTransaksi, KategoriKas, RecordIPLData } from '../types';

export const API_BASE = '/api';

export async function fetchBackendData(): Promise<AppStateData | null> {
  try {
    const res = await fetch(`${API_BASE}/data`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return {
      warga: data.warga || [],
      iplTransactions: data.iplTransactions || [],
      iplItems: data.iplItems || [],
      kasTransactions: data.kasTransactions || [],
    };
  } catch (err) {
    console.warn('Backend API not reachable, falling back to local state:', err);
    return null;
  }
}

export async function apiRecordIPL(params: RecordIPLData): Promise<{ transaction: IPLTransaction; items: IPLPaymentItem[]; kasRecord: KasTransaction } | null> {
  try {
    const res = await fetch(`${API_BASE}/ipl/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return {
      transaction: data.transaction,
      items: data.items,
      kasRecord: data.kasRecord,
    };
  } catch (err) {
    console.warn('API error on record IPL:', err);
    return null;
  }
}

export async function apiAddKas(params: {
  tipe: TipeTransaksi;
  kategori: KategoriKas;
  nominal: number;
  tanggal: string;
  deskripsi: string;
  metode: 'Transfer Bank' | 'Tunai / Cash';
  penanggungJawab: string;
}): Promise<KasTransaction | null> {
  try {
    const res = await fetch(`${API_BASE}/kas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.transaction;
  } catch (err) {
    console.warn('API error on add kas:', err);
    return null;
  }
}

export async function apiDeleteKas(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/kas/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('API error on delete kas:', err);
    return false;
  }
}

export async function apiSaveWarga(params: Omit<Warga, 'id' | 'createdAt'> & { id?: string }): Promise<Warga | null> {
  try {
    const res = await fetch(`${API_BASE}/warga`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.warga;
  } catch (err) {
    console.warn('API error on save warga:', err);
    return null;
  }
}

export async function apiDeleteWarga(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/warga/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('API error on delete warga:', err);
    return false;
  }
}

export async function apiResetData(): Promise<AppStateData | null> {
  try {
    const res = await fetch(`${API_BASE}/reset`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('API error on reset:', err);
    return null;
  }
}
