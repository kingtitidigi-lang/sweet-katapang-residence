import { Warga, IPLTransaction, IPLPaymentItem, KasTransaction } from '../types';
import {
  INITIAL_WARGA,
  INITIAL_KAS_TRANSACTIONS,
  generateInitialIPLPayments,
} from '../data/seedData';

const STORAGE_KEYS = {
  WARGA: 'ipl_buku_kas_warga_v2',
  IPL_TRANSACTIONS: 'ipl_buku_kas_ipl_tx_v2',
  IPL_ITEMS: 'ipl_buku_kas_ipl_items_v2',
  KAS_TRANSACTIONS: 'ipl_buku_kas_kas_tx_v2',
  INITIALIZED: 'ipl_buku_kas_init_v2',
};

export interface AppStateData {
  warga: Warga[];
  iplTransactions: IPLTransaction[];
  iplItems: IPLPaymentItem[];
  kasTransactions: KasTransaction[];
}

export function loadInitialData(): AppStateData {
  try {
    const isInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!isInit) {
      return resetToDefaultData();
    }

    const wargaStr = localStorage.getItem(STORAGE_KEYS.WARGA);
    const iplTxStr = localStorage.getItem(STORAGE_KEYS.IPL_TRANSACTIONS);
    const iplItemsStr = localStorage.getItem(STORAGE_KEYS.IPL_ITEMS);
    const kasTxStr = localStorage.getItem(STORAGE_KEYS.KAS_TRANSACTIONS);

    return {
      warga: wargaStr ? JSON.parse(wargaStr) : INITIAL_WARGA,
      iplTransactions: iplTxStr ? JSON.parse(iplTxStr) : [],
      iplItems: iplItemsStr ? JSON.parse(iplItemsStr) : [],
      kasTransactions: kasTxStr ? JSON.parse(kasTxStr) : [],
    };
  } catch (err) {
    console.error('Failed reading localStorage, resetting to default', err);
    return resetToDefaultData();
  }
}

export function resetToDefaultData(): AppStateData {
  const { transactions, items, extraKas } = generateInitialIPLPayments();
  const allKas = [...INITIAL_KAS_TRANSACTIONS, ...extraKas];

  localStorage.setItem(STORAGE_KEYS.WARGA, JSON.stringify(INITIAL_WARGA));
  localStorage.setItem(STORAGE_KEYS.IPL_TRANSACTIONS, JSON.stringify(transactions));
  localStorage.setItem(STORAGE_KEYS.IPL_ITEMS, JSON.stringify(items));
  localStorage.setItem(STORAGE_KEYS.KAS_TRANSACTIONS, JSON.stringify(allKas));
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');

  return {
    warga: INITIAL_WARGA,
    iplTransactions: transactions,
    iplItems: items,
    kasTransactions: allKas,
  };
}

export function saveStateToStorage(data: AppStateData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WARGA, JSON.stringify(data.warga));
    localStorage.setItem(STORAGE_KEYS.IPL_TRANSACTIONS, JSON.stringify(data.iplTransactions));
    localStorage.setItem(STORAGE_KEYS.IPL_ITEMS, JSON.stringify(data.iplItems));
    localStorage.setItem(STORAGE_KEYS.KAS_TRANSACTIONS, JSON.stringify(data.kasTransactions));
  } catch (err) {
    console.error('Error saving state to localStorage', err);
  }
}
