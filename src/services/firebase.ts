import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
    initializeFirestore,
    getFirestore,
    Firestore,
    collection,
    doc,
    setDoc,
    deleteDoc,
    onSnapshot,
    getDocs,
    writeBatch,
} from 'firebase/firestore';
import { Warga, IPLTransaction, IPLPaymentItem, KasTransaction } from '../types';

export interface FirebaseConfig {
    apiKey: string;
    authDomain?: string;
    projectId: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
}

const FIREBASE_STORAGE_KEY = 'sweet_katapang_firebase_config_v1';

// Deep clean undefined values so Firestore never throws 'Unsupported field value: undefined'
export function sanitizeForFirestore<T>(data: T): T {
    if (data === null || data === undefined) {
        return null as any;
    }
    if (Array.isArray(data)) {
        return data.map((item) => sanitizeForFirestore(item)) as any;
    }
    if (typeof data === 'object') {
        const clean: Record<string, any> = {};
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                clean[key] = sanitizeForFirestore(value);
            }
        }
        return clean as T;
    }
    return data;
}

// Default config from env if present
export function getSavedFirebaseConfig(): FirebaseConfig | null {
    try {
        const raw = localStorage.getItem(FIREBASE_STORAGE_KEY);
        if (raw) {
            return JSON.parse(raw);
        }
    } catch (e) {
        console.error('Error reading saved firebase config:', e);
    }

    // Check Vite env vars
    const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (envApiKey && envProjectId) {
        return {
            apiKey: envApiKey,
            authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
            projectId: envProjectId,
            storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${envProjectId}.firebasestorage.app`,
            messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
            appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
        };
    }

    return null;
}

export function saveFirebaseConfig(config: FirebaseConfig): void {
    localStorage.setItem(FIREBASE_STORAGE_KEY, JSON.stringify(config));
    currentApp = null;
    currentDb = null;
}

export function clearFirebaseConfig(): void {
    localStorage.removeItem(FIREBASE_STORAGE_KEY);
    currentApp = null;
    currentDb = null;
}

let currentApp: FirebaseApp | null = null;
let currentDb: Firestore | null = null;

export function getFirebaseDb(): Firestore | null {
    const config = getSavedFirebaseConfig();
    if (!config || !config.apiKey || !config.projectId) {
        return null;
    }

    try {
        if (!currentApp) {
            const existingApps = getApps();
            if (existingApps.length > 0) {
                currentApp = getApp();
            } else {
                currentApp = initializeApp(config);
            }
        }
        if (!currentDb && currentApp) {
            try {
                currentDb = initializeFirestore(currentApp, {
                    ignoreUndefinedProperties: true,
                });
            } catch {
                currentDb = getFirestore(currentApp);
            }
        }
        return currentDb;
    } catch (err) {
        console.error('Failed to initialize Firebase Firestore:', err);
        return null;
    }
}

export function isFirebaseConfigured(): boolean {
    const config = getSavedFirebaseConfig();
    return Boolean(config && config.apiKey && config.projectId);
}

// Real-time Listeners
export function subscribeToFirebaseData(callbacks: {
    onWarga: (warga: Warga[]) => void;
    onIPLTransactions: (txs: IPLTransaction[]) => void;
    onIPLItems: (items: IPLPaymentItem[]) => void;
    onKas: (kas: KasTransaction[]) => void;
    onError?: (error: Error) => void;
}): () => void {
    const db = getFirebaseDb();
    if (!db) {
        return () => { };
    }

    const unsubWarga = onSnapshot(
        collection(db, 'warga'),
        (snapshot) => {
            const list: Warga[] = [];
            snapshot.forEach((d) => list.push(d.data() as Warga));
            callbacks.onWarga(list);
        },
        (err) => callbacks.onError?.(err)
    );

    const unsubTxs = onSnapshot(
        collection(db, 'ipl_transactions'),
        (snapshot) => {
            const list: IPLTransaction[] = [];
            snapshot.forEach((d) => list.push(d.data() as IPLTransaction));
            callbacks.onIPLTransactions(list);
        },
        (err) => callbacks.onError?.(err)
    );

    const unsubItems = onSnapshot(
        collection(db, 'ipl_items'),
        (snapshot) => {
            const list: IPLPaymentItem[] = [];
            snapshot.forEach((d) => list.push(d.data() as IPLPaymentItem));
            callbacks.onIPLItems(list);
        },
        (err) => callbacks.onError?.(err)
    );

    const unsubKas = onSnapshot(
        collection(db, 'kas_transactions'),
        (snapshot) => {
            const list: KasTransaction[] = [];
            snapshot.forEach((d) => list.push(d.data() as KasTransaction));
            callbacks.onKas(list);
        },
        (err) => callbacks.onError?.(err)
    );

    return () => {
        unsubWarga();
        unsubTxs();
        unsubItems();
        unsubKas();
    };
}

// Write Operations
export async function syncLocalDataToFirestore(data: {
    warga: Warga[];
    iplTransactions: IPLTransaction[];
    iplItems: IPLPaymentItem[];
    kasTransactions: KasTransaction[];
}): Promise<{ success: boolean; error?: string }> {
    const db = getFirebaseDb();
    if (!db) return { success: false, error: 'Firebase Firestore belum dikonfigurasi' };

    try {
        const batch = writeBatch(db);

        // Sync warga
        for (const w of data.warga) {
            const cleanW = sanitizeForFirestore(w);
            const ref = doc(db, 'warga', cleanW.id);
            batch.set(ref, cleanW, { merge: true });
        }

        // Sync ipl transactions
        for (const tx of data.iplTransactions) {
            const cleanTx = sanitizeForFirestore(tx);
            const ref = doc(db, 'ipl_transactions', cleanTx.id);
            batch.set(ref, cleanTx, { merge: true });
        }

        // Sync ipl items
        for (const item of data.iplItems) {
            const cleanItem = sanitizeForFirestore(item);
            const ref = doc(db, 'ipl_items', cleanItem.id);
            batch.set(ref, cleanItem, { merge: true });
        }

        // Sync kas
        for (const k of data.kasTransactions) {
            const cleanKas = sanitizeForFirestore(k);
            const ref = doc(db, 'kas_transactions', cleanKas.id);
            batch.set(ref, cleanKas, { merge: true });
        }

        // Safety timeout: 12 seconds
        const commitPromise = batch.commit();
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(
                () =>
                    reject(
                        new Error(
                            'Waktu habis (Timeout). Pastikan Anda sudah mengklik tombol "Create Database" di menu Firestore Firebase Console, dan Rules sudah diizinkan (Test Mode).'
                        )
                    ),
                12000
            )
        );

        await Promise.race([commitPromise, timeoutPromise]);
        return { success: true };
    } catch (err: any) {
        console.error('Failed to batch upload to Firestore:', err);
        let msg = err.message || 'Gagal menyimpan ke Firestore';
        if (err.code === 'permission-denied') {
            msg = 'Izin ditolak (Permission Denied). Buka tab "Rules" di Firestore Database Anda dan ubah menjadi: allow read, write: if true;';
        } else if (err.code === 'unavailable' || err.code === 'not-found') {
            msg = 'Database belum siap atau belum dibuat. Pastikan Anda sudah mengklik "Create Database" di menu Firestore Console.';
        }
        return { success: false, error: msg };
    }
}

// Auto-check and create collections (ipl_transactions, ipl_items, kas_transactions, warga)
export async function ensureFirestoreCollectionsExist(data: {
    warga: Warga[];
    iplTransactions: IPLTransaction[];
    iplItems: IPLPaymentItem[];
    kasTransactions: KasTransaction[];
}): Promise<{ initialized: boolean; collections: string[]; error?: string }> {
    const db = getFirebaseDb();
    if (!db) return { initialized: false, collections: [], error: 'Database belum terhubung' };

    try {
        const initializedCols: string[] = [];

        // Check each collection
        const [wargaSnap, iplSnap, itemsSnap, kasSnap] = await Promise.all([
            getDocs(collection(db, 'warga')),
            getDocs(collection(db, 'ipl_transactions')),
            getDocs(collection(db, 'ipl_items')),
            getDocs(collection(db, 'kas_transactions')),
        ]);

        const batch = writeBatch(db);
        let count = 0;

        if (wargaSnap.empty && data.warga.length > 0) {
            data.warga.forEach((w) => {
                const clean = sanitizeForFirestore(w);
                batch.set(doc(db, 'warga', clean.id), clean, { merge: true });
                count++;
            });
            initializedCols.push('warga');
        }

        if (iplSnap.empty && data.iplTransactions.length > 0) {
            data.iplTransactions.forEach((tx) => {
                const clean = sanitizeForFirestore(tx);
                batch.set(doc(db, 'ipl_transactions', clean.id), clean, { merge: true });
                count++;
            });
            initializedCols.push('ipl_transactions');
        }

        if (itemsSnap.empty && data.iplItems.length > 0) {
            data.iplItems.forEach((item) => {
                const clean = sanitizeForFirestore(item);
                batch.set(doc(db, 'ipl_items', clean.id), clean, { merge: true });
                count++;
            });
            initializedCols.push('ipl_items');
        }

        if (kasSnap.empty && data.kasTransactions.length > 0) {
            data.kasTransactions.forEach((k) => {
                const clean = sanitizeForFirestore(k);
                batch.set(doc(db, 'kas_transactions', clean.id), clean, { merge: true });
                count++;
            });
            initializedCols.push('kas_transactions');
        }

        if (count > 0) {
            await batch.commit();
            return { initialized: true, collections: initializedCols };
        }

        return { initialized: false, collections: [] };
    } catch (err: any) {
        console.warn('Auto ensure collections error:', err);
        return { initialized: false, collections: [], error: err.message };
    }
}

export async function saveWargaToFirestore(warga: Warga): Promise<{ success: boolean; error?: string }> {
    const db = getFirebaseDb();
    if (!db) return { success: false, error: 'Firebase Firestore belum dikonfigurasi. Hubungkan di menu Cloud Sync.' };
    try {
        const clean = sanitizeForFirestore(warga);
        await setDoc(doc(db, 'warga', clean.id), clean, { merge: true });
        return { success: true };
    } catch (err: any) {
        console.error('Firebase save Warga failed:', err);
        let msg = err.message || 'Gagal menyimpan data warga ke Firestore';
        if (err.code === 'permission-denied') {
            msg = 'Izin ditolak (Permission Denied). Security Rules di Firestore masih terkunci. Buka tab Rules dan ubah ke: allow read, write: if true;';
        }
        return { success: false, error: msg };
    }
}

export async function deleteWargaFromFirestore(wargaId: string): Promise<{ success: boolean; error?: string }> {
    const db = getFirebaseDb();
    if (!db) return { success: false, error: 'Firebase Firestore belum dikonfigurasi. Hubungkan di menu Cloud Sync.' };
    try {
        await deleteDoc(doc(db, 'warga', wargaId));
        return { success: true };
    } catch (err: any) {
        console.error('Firebase delete Warga failed:', err);
        return { success: false, error: err.message || 'Gagal menghapus warga dari Firestore' };
    }
}

export async function saveIPLToFirestore(
    transaction: IPLTransaction,
    items: IPLPaymentItem[],
    kasTx?: KasTransaction
): Promise<{ success: boolean; error?: string }> {
    const db = getFirebaseDb();
    if (!db) return { success: false, error: 'Firebase Firestore belum dikonfigurasi. Hubungkan di menu Cloud Sync.' };

    try {
        const batch = writeBatch(db);
        const cleanTx = sanitizeForFirestore(transaction);
        batch.set(doc(db, 'ipl_transactions', cleanTx.id), cleanTx, { merge: true });

        for (const item of items) {
            const cleanItem = sanitizeForFirestore(item);
            batch.set(doc(db, 'ipl_items', cleanItem.id), cleanItem, { merge: true });
        }

        if (kasTx) {
            const cleanKas = sanitizeForFirestore(kasTx);
            batch.set(doc(db, 'kas_transactions', cleanKas.id), cleanKas, { merge: true });
        }

        await batch.commit();
        return { success: true };
    } catch (err: any) {
        console.error('Firebase save IPL failed:', err);
        let msg = err.message || 'Gagal menyimpan transaksi IPL ke Firestore';
        if (err.code === 'permission-denied') {
            msg = 'Izin ditolak (Permission Denied). Security Rules di Firestore masih terkunci. Buka tab Rules dan ubah ke: allow read, write: if true;';
        }
        return { success: false, error: msg };
    }
}

export async function deleteIPLFromFirestore(
    txId: string,
    itemIds: string[]
): Promise<{ success: boolean; error?: string }> {
    const db = getFirebaseDb();
    if (!db) return { success: false, error: 'Firebase Firestore belum dikonfigurasi. Hubungkan di menu Cloud Sync.' };

    try {
        const batch = writeBatch(db);
        batch.delete(doc(db, 'ipl_transactions', txId));

        for (const itemId of itemIds) {
            batch.delete(doc(db, 'ipl_items', itemId));
        }

        await batch.commit();
        return { success: true };
    } catch (err: any) {
        console.error('Firebase delete IPL failed:', err);
        return { success: false, error: err.message || 'Gagal menghapus transaksi IPL dari Firestore' };
    }
}

export async function saveKasToFirestore(kas: KasTransaction): Promise<{ success: boolean; error?: string }> {
    const db = getFirebaseDb();
    if (!db) return { success: false, error: 'Firebase Firestore belum dikonfigurasi. Hubungkan di menu Cloud Sync.' };
    try {
        const cleanKas = sanitizeForFirestore(kas);
        await setDoc(doc(db, 'kas_transactions', cleanKas.id), cleanKas, { merge: true });
        return { success: true };
    } catch (err: any) {
        console.error('Firebase save Kas failed:', err);
        let msg = err.message || 'Gagal menyimpan kas ke Firestore';
        if (err.code === 'permission-denied') {
            msg = 'Izin ditolak (Permission Denied). Security Rules di Firestore masih terkunci. Buka tab Rules dan ubah ke: allow read, write: if true;';
        }
        return { success: false, error: msg };
    }
}

export async function deleteKasFromFirestore(kasId: string): Promise<{ success: boolean; error?: string }> {
    const db = getFirebaseDb();
    if (!db) return { success: false, error: 'Firebase Firestore belum dikonfigurasi. Hubungkan di menu Cloud Sync.' };
    try {
        await deleteDoc(doc(db, 'kas_transactions', kasId));
        return { success: true };
    } catch (err: any) {
        console.error('Firebase delete Kas failed:', err);
        return { success: false, error: err.message || 'Gagal menghapus kas dari Firestore' };
    }
}
