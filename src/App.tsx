import React, { useState, useEffect, useMemo } from 'react';
import { Lock, KeyRound, CheckCircle, AlertCircle, RefreshCw, X } from 'lucide-react';
import {
  Warga,
  IPLTransaction,
  IPLPaymentItem,
  KasTransaction,
  TipeTransaksi,
  KategoriKas,
  MetodePembayaran,
  AppTab,
  RecordIPLData,
  AuthUser,
} from './types';
import {
  loadInitialData,
  saveStateToStorage,
  resetToDefaultData,
} from './utils/storage';
import {
  fetchBackendData,
  apiRecordIPL,
  apiValidateIPL,
  apiRejectIPL,
  apiAddKas,
  apiDeleteKas,
  apiSaveWarga,
  apiDeleteWarga,
  apiResetData,
} from './utils/api';
import { formatRupiah } from './utils/formatters';
import {
  calculateRunningBalances,
  computeSummaryKeuangan,
  executeRapelPayment,
} from './utils/calculations';
import { Header } from './components/Header';
import { PeriodFilter } from './components/PeriodFilter';
import { DashboardView } from './components/DashboardView';
import { IPLMatrixView } from './components/IPLMatrixView';
import { CashBookView } from './components/CashBookView';
import { WargaMasterView } from './components/WargaMasterView';
import { ArchitectureDocsView } from './components/ArchitectureDocsView';
import { GoogleSheetsOptionView } from './components/GoogleSheetsOptionView';

import { ModalCatatIPL } from './components/ModalCatatIPL';
import { ModalTambahKas } from './components/ModalTambahKas';
import { ModalWarga } from './components/ModalWarga';
import { ModalKwitansi } from './components/ModalKwitansi';
import { ModalReminderWA } from './components/ModalReminderWA';
import { ModalLogin } from './components/ModalLogin';
import { ModalFirebaseConfig } from './components/ModalFirebaseConfig';
import {
  isFirebaseConfigured,
  subscribeToFirebaseData,
  saveWargaToFirestore,
  deleteWargaFromFirestore,
  saveIPLToFirestore,
  deleteIPLFromFirestore,
  saveKasToFirestore,
  deleteKasFromFirestore,
  ensureFirestoreCollectionsExist,
  syncLocalDataToFirestore,
} from './services/firebase';

export default function App() {
  // 1. Core State
  const [wargaList, setWargaList] = useState<Warga[]>([]);
  const [iplTransactions, setIplTransactions] = useState<IPLTransaction[]>([]);
  const [iplItems, setIplItems] = useState<IPLPaymentItem[]>([]);
  const [kasTransactions, setKasTransactions] = useState<KasTransaction[]>([]);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');

  // 2. Period Filter State: defaults to current running month and year
  const now = new Date();
  const currentRunningYear = now.getFullYear();
  const currentRunningMonth = now.getMonth() + 1; // 1-12

  const [selectedYear, setSelectedYear] = useState<number>(currentRunningYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentRunningMonth);

  // 3. Authentication State (Superadmin vs Admin vs Guest/Warga)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('sweet_katapang_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginReason, setLoginReason] = useState<string>('');
  const [restrictedNotice, setRestrictedNotice] = useState<string | null>(null);

  // Toast Notification State
  const [toast, setToast] = useState<{
    id: number;
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string, duration = 5000) => {
    const id = Date.now();
    setToast({ id, type, message });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, duration);
  };

  const isLoggedIn = currentUser !== null;
  const isSuperAdmin = currentUser?.role === 'superadmin';
  const isAdmin = currentUser?.role === 'admin';

  const isPengurus = Boolean(isLoggedIn && currentUser && (currentUser.role === 'admin' || currentUser.role === 'superadmin'));

  // Pastikan tab buku kas, master warga, arsitektur dan template sheets (nocode) hanya bisa diakses oleh pengurus / superadmin
  useEffect(() => {
    if ((activeTab === 'kas' || activeTab === 'warga') && !isPengurus) {
      setActiveTab('dashboard');
    } else if ((activeTab === 'arsitektur' || activeTab === 'nocode') && !isSuperAdmin) {
      setActiveTab('dashboard');
    }
  }, [activeTab, isPengurus, isSuperAdmin]);

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    if ((activeTab === 'arsitektur' || activeTab === 'nocode') && user.role !== 'superadmin') {
      setActiveTab('dashboard');
    }
    try {
      localStorage.setItem('sweet_katapang_auth_user', JSON.stringify(user));
    } catch (e) {
      console.warn('Could not store auth user', e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('sweet_katapang_auth_user');
    } catch (e) {
      console.warn('Could not remove auth user', e);
    }
    // Return to dashboard if on protected tab
    if (activeTab !== 'dashboard' && activeTab !== 'matriks') {
      setActiveTab('dashboard');
    }
  };

  const handleRequireLogin = (reason = 'Hanya Pengurus yang dapat mencatat atau mengubah data.') => {
    setLoginReason(reason);
    setIsLoginModalOpen(true);
  };

  // 4. Modals State
  const [isIPLModalOpen, setIsIPLModalOpen] = useState(false);
  const [preSelectedWargaForIPL, setPreSelectedWargaForIPL] = useState<Warga | null>(null);
  const [preSelectedMonthForIPL, setPreSelectedMonthForIPL] = useState<number | null>(null);

  const [isKasModalOpen, setIsKasModalOpen] = useState(false);
  const [kasModalType, setKasModalType] = useState<TipeTransaksi>('PENGELUARAN');

  const [isWargaModalOpen, setIsWargaModalOpen] = useState(false);
  const [wargaToEdit, setWargaToEdit] = useState<Warga | null>(null);

  const [isKwitansiOpen, setIsKwitansiOpen] = useState(false);
  const [kwitansiItem, setKwitansiItem] = useState<IPLPaymentItem | null>(null);
  const [kwitansiTx, setKwitansiTx] = useState<IPLTransaction | null>(null);

  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [reminderWarga, setReminderWarga] = useState<Warga | null>(null);
  const [reminderUnpaidMonths, setReminderUnpaidMonths] = useState<number[]>([]);

  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(() => isFirebaseConfigured());

  // Real-time Firebase Sync listener & Auto Collection Creation
  useEffect(() => {
    if (!isFirebaseConnected) return;

    // Otomatis pastikan koleksi ipl_transactions, ipl_items, kas_transactions, warga terbentuk di Firebase
    if (wargaList.length > 0 || iplTransactions.length > 0 || kasTransactions.length > 0) {
      ensureFirestoreCollectionsExist({
        warga: wargaList,
        iplTransactions,
        iplItems,
        kasTransactions,
      }).then((res) => {
        if (res.initialized && res.collections.length > 0) {
          showToast('success', `Koleksi Firebase (${res.collections.join(', ')}) otomatis dibuat & disinkronkan!`);
        }
      });
    }

    const unsubscribe = subscribeToFirebaseData({
      onWarga: (wargas) => {
        if (wargas && wargas.length > 0) {
          setWargaList(wargas);
        }
      },
      onIPLTransactions: (txs) => {
        if (txs) setIplTransactions(txs);
      },
      onIPLItems: (items) => {
        if (items) setIplItems(items);
      },
      onKas: (kas) => {
        if (kas) setKasTransactions(kas);
      },
      onError: (err) => {
        console.warn('Firebase sync warning:', err);
      },
    });

    return () => unsubscribe();
  }, [isFirebaseConnected]);

  // 5. Initial Load (Try Backend API first, fallback to localStorage)
  useEffect(() => {
    async function init() {
      let loadedWarga: Warga[] = [];
      let loadedTxs: IPLTransaction[] = [];
      let loadedItems: IPLPaymentItem[] = [];
      let loadedKas: KasTransaction[] = [];

      if (!isFirebaseConfigured()) {
        const backendData = await fetchBackendData();
        if (backendData && backendData.warga.length > 0) {
          loadedWarga = backendData.warga;
          loadedTxs = backendData.iplTransactions;
          loadedItems = backendData.iplItems;
          loadedKas = backendData.kasTransactions;
          setWargaList(loadedWarga);
          setIplTransactions(loadedTxs);
          setIplItems(loadedItems);
          setKasTransactions(loadedKas);
          setIsBackendConnected(true);
          saveStateToStorage(backendData);
        } else {
          const localData = loadInitialData();
          loadedWarga = localData.warga;
          loadedTxs = localData.iplTransactions;
          loadedItems = localData.iplItems;
          loadedKas = localData.kasTransactions;
          setWargaList(loadedWarga);
          setIplTransactions(loadedTxs);
          setIplItems(loadedItems);
          setKasTransactions(loadedKas);
        }
      } else {
        // Firebase aktif: ambil cache lokal sebentar sambil menunggu stream realtime Firestore
        const localData = loadInitialData();
        loadedWarga = localData.warga;
        loadedTxs = localData.iplTransactions;
        loadedItems = localData.iplItems;
        loadedKas = localData.kasTransactions;
        setWargaList(loadedWarga);
        setIplTransactions(loadedTxs);
        setIplItems(loadedItems);
        setKasTransactions(loadedKas);

        ensureFirestoreCollectionsExist({
          warga: loadedWarga,
          iplTransactions: loadedTxs,
          iplItems: loadedItems,
          kasTransactions: loadedKas,
        }).then((res) => {
          if (res.initialized && res.collections.length > 0) {
            console.log('Firebase collections auto-created on init:', res.collections);
          }
        });
      }
    }
    init();
  }, []);

  // 5. Save on changes
  const persistState = (
    newWarga: Warga[],
    newTx: IPLTransaction[],
    newItems: IPLPaymentItem[],
    newKas: KasTransaction[]
  ) => {
    setWargaList(newWarga);
    setIplTransactions(newTx);
    setIplItems(newItems);
    setKasTransactions(newKas);
    saveStateToStorage({
      warga: newWarga,
      iplTransactions: newTx,
      iplItems: newItems,
      kasTransactions: newKas,
    });
  };

  // 6. Running Balance computation across all cash transactions
  const transactionsWithRunningBalance = useMemo(() => {
    return calculateRunningBalances(kasTransactions);
  }, [kasTransactions]);

  // 7. Period Summary Calculations
  const { summary, filteredTransactions } = useMemo(() => {
    return computeSummaryKeuangan(
      transactionsWithRunningBalance,
      wargaList,
      iplItems,
      selectedYear,
      selectedMonth
    );
  }, [transactionsWithRunningBalance, wargaList, iplItems, selectedYear, selectedMonth]);

  // 8. Pending validation items for Bendahara review
  const pendingIPLTransactions = useMemo(() => {
    return iplTransactions.filter((t) => t.status === 'Menunggu Validasi');
  }, [iplTransactions]);

  // --- Handlers ---

  // Handle Recording IPL Payment (Single or Rapel)
  const handleRecordIPL = async (data: RecordIPLData) => {
    const isPengurus = Boolean(isLoggedIn && currentUser && currentUser.role !== 'warga');
    const finalData: RecordIPLData = {
      ...data,
      status: isPengurus ? 'Lunas' : 'Menunggu Validasi',
      submittedBy: isPengurus ? 'pengurus' : 'warga',
      diterimaOleh: isPengurus
        ? data.diterimaOleh || currentUser?.roleLabel || 'Bendahara'
        : 'Menunggu Validasi Bendahara',
    };

    let transaction: IPLTransaction;
    let items: IPLPaymentItem[];
    let kasRecord: KasTransaction | null = null;

    if (isFirebaseConfigured()) {
      // 1. MODE CLOUD AKTIF: Langsung simpan ke Firebase Firestore saja (tanpa db.json)
      const localResult = executeRapelPayment(finalData);
      transaction = localResult.transaction;
      items = localResult.items;
      kasRecord = localResult.kasRecord;

      if (transaction.status === 'Lunas' && kasRecord) {
        showToast('info', `Menyimpan pembayaran IPL Kavling ${transaction.blok} ke Cloud Firebase...`, 2000);
        saveIPLToFirestore(transaction, items, kasRecord).then((res) => {
          if (res.success) {
            showToast(
              'success',
              `Pembayaran IPL Kavling ${transaction.blok} (${items.length} bulan) LUNAS & langsung tersimpan ke Firebase!`
            );
          } else {
            showToast(
              'error',
              `Gagal menyimpan ke Firebase: ${res.error}`
            );
          }
        });
      } else {
        showToast('info', `Mengirim konfirmasi IPL Kavling ${transaction.blok} ke Cloud Firebase...`, 2000);
        saveIPLToFirestore(transaction, items).then((res) => {
          if (res.success) {
            showToast(
              'success',
              `Konfirmasi IPL Kavling ${transaction.blok} (${items.length} bulan) tersimpan di Firebase! Menunggu validasi.`
            );
          } else {
            showToast(
              'error',
              `Gagal mengirim konfirmasi ke Firebase: ${res.error}`
            );
          }
        });
      }
    } else {
      // 2. MODE LOKAL: Fallback simpan ke Backend lokal (db.json)
      const apiResult = await apiRecordIPL(finalData);
      if (apiResult) {
        transaction = apiResult.transaction;
        items = apiResult.items;
        kasRecord = apiResult.kasRecord;
      } else {
        const localResult = executeRapelPayment(finalData);
        transaction = localResult.transaction;
        items = localResult.items;
        kasRecord = localResult.kasRecord;
      }

      if (transaction.status === 'Lunas') {
        showToast('success', `Pembayaran IPL Kavling ${transaction.blok} LUNAS & tercatat di Buku Kas lokal.`);
      } else {
        showToast(
          'info',
          `Konfirmasi pembayaran IPL Kavling ${transaction.blok} tersimpan di lokal (Menunggu validasi Bendahara).`
        );
      }
    }

    const newTxList = [transaction, ...iplTransactions];
    const newItemsList = [...items, ...iplItems];
    // Masukkan ke Buku Kas HANYA jika status Lunas
    const newKasList =
      transaction.status === 'Lunas' && kasRecord
        ? [kasRecord, ...kasTransactions]
        : kasTransactions;

    persistState(wargaList, newTxList, newItemsList, newKasList);

    // Prompt user to view digital receipt right away
    if (items.length > 0) {
      setKwitansiItem(items[0]);
      setKwitansiTx(transaction);
      setIsKwitansiOpen(true);
    }
  };

  // Handle Admin / Pengurus Validating Pending IPL Payment
  const handleValidateIPL = async (txId: string) => {
    if (!isLoggedIn) {
      handleRequireLogin('Hanya Admin / Pengurus yang dapat memvalidasi pembayaran IPL.');
      return;
    }
    if (currentUser?.role === 'warga') {
      handleRequireLogin('Akun Warga tidak memiliki izin untuk memvalidasi pembayaran.');
      return;
    }

    const targetTx = iplTransactions.find((t) => t.id === txId);
    if (!targetTx) return;

    const validatorName =
      currentUser?.roleLabel ||
      (currentUser?.role === 'admin' ? 'Admin' : 'Bendahara');

    const updatedTx: IPLTransaction = {
      ...targetTx,
      status: 'Lunas',
      validatedAt: new Date().toISOString(),
      validatedBy: validatorName,
      diterimaOleh: validatorName,
      kasTransactionId: `kas-${targetTx.id}`,
    };

    const updatedItems: IPLPaymentItem[] = iplItems
      .filter((item) => item.transactionId === txId)
      .map((item) => ({ ...item, status: 'Lunas' as const }));

    const newKasRecord: KasTransaction = {
      id: `kas-${targetTx.id}`,
      tanggal: targetTx.tanggalBayar || new Date().toISOString().split('T')[0],
      tipe: 'PEMASUKAN',
      kategori: 'Iuran IPL',
      nominal: targetTx.totalNominal,
      deskripsi: `IPL Blok ${targetTx.blok} - ${targetTx.nama} (${targetTx.bulanList.length} bln: ${targetTx.bulanList.join(', ')})`,
      metode: targetTx.metode,
      refId: targetTx.id,
      penanggungJawab: validatorName,
    };

    if (isFirebaseConfigured()) {
      // 1. MODE CLOUD AKTIF: Langsung simpan ke Firebase Firestore saja (tanpa db.json)
      showToast('info', `Menyimpan validasi pembayaran ke Firebase...`, 2000);
      saveIPLToFirestore(updatedTx, updatedItems, newKasRecord).then((res) => {
        if (res.success) {
          showToast(
            'success',
            `Validasi IPL Kavling ${updatedTx.blok} LUNAS & langsung tersimpan ke Firebase!`
          );
        } else {
          showToast('error', `Gagal validasi ke Firebase: ${res.error}`);
        }
      });
    } else {
      // 2. MODE LOKAL: Fallback simpan ke Backend lokal (db.json)
      await apiValidateIPL(txId, validatorName);
      showToast(
        'success',
        `Pembayaran IPL Kavling ${updatedTx.blok} berhasil divalidasi LUNAS dan dicatat ke Buku Kas lokal!`
      );
    }

    const newTxList = iplTransactions.map((t) => (t.id === txId ? updatedTx : t));
    const newItemsList: IPLPaymentItem[] = iplItems.map((item) =>
      item.transactionId === txId ? { ...item, status: 'Lunas' as const } : item
    );
    const existingKasIndex = kasTransactions.findIndex((k) => k.refId === txId);
    const newKasList =
      existingKasIndex >= 0
        ? kasTransactions.map((k) => (k.refId === txId ? newKasRecord : k))
        : [newKasRecord, ...kasTransactions];

    persistState(wargaList, newTxList, newItemsList, newKasList);

    if (kwitansiTx?.id === txId) {
      setKwitansiTx(updatedTx);
      const firstItem = updatedItems.find((i) => i.transactionId === txId);
      if (firstItem) setKwitansiItem(firstItem);
    }
  };

  // Handle Rejecting / Deleting Pending IPL Submission
  const handleRejectIPL = async (txId: string) => {
    if (!isLoggedIn) {
      handleRequireLogin('Hanya Admin / Pengurus yang dapat menolak pengajuan pembayaran IPL.');
      return;
    }
    if (currentUser?.role === 'warga') {
      handleRequireLogin('Akun Warga tidak memiliki izin untuk menolak pembayaran.');
      return;
    }

    const targetTx = iplTransactions.find((t) => t.id === txId);
    if (!targetTx) return;

    if (
      !window.confirm(
        `Tolak pengajuan pembayaran IPL Kavling ${targetTx.blok} (${targetTx.nama}) sebesar ${formatRupiah(targetTx.totalNominal)}?`
      )
    ) {
      return;
    }

    const targetItemIds = iplItems.filter((i) => i.transactionId === txId).map((i) => i.id);
    const newTxList = iplTransactions.filter((t) => t.id !== txId);
    const newItemsList = iplItems.filter((i) => i.transactionId !== txId);
    const newKasList = kasTransactions.filter((k) => k.refId !== txId);

    persistState(wargaList, newTxList, newItemsList, newKasList);

    if (isFirebaseConfigured()) {
      // 1. MODE CLOUD AKTIF: Hapus di Firebase saja (tanpa apiRejectIPL / db.json)
      deleteIPLFromFirestore(txId, targetItemIds).then((res) => {
        if (res.success) {
          showToast(
            'success',
            `Pengajuan IPL Kavling ${targetTx.blok} berhasil ditolak & dihapus dari Firebase.`
          );
        } else {
          showToast('error', `Gagal menghapus pengajuan di Firebase: ${res.error}`);
        }
      });
    } else {
      // 2. MODE LOKAL: Hapus di db.json
      await apiRejectIPL(txId);
    }

    if (isKwitansiOpen && kwitansiTx?.id === txId) {
      setIsKwitansiOpen(false);
    }
  };

  // Handle Adding Manual Cash Transaction (General Income or Expense)
  const handleAddKas = async (data: {
    tipe: TipeTransaksi;
    kategori: KategoriKas;
    nominal: number;
    tanggal: string;
    deskripsi: string;
    metode: 'Transfer Bank' | 'Tunai / Cash';
    penanggungJawab: string;
  }) => {
    let newTx: KasTransaction;

    if (isFirebaseConfigured()) {
      // 1. MODE CLOUD AKTIF: Langsung simpan ke Firebase Firestore saja (tanpa db.json)
      newTx = {
        id: `kas-${Date.now().toString(36)}`,
        tanggal: data.tanggal,
        tipe: data.tipe,
        kategori: data.kategori,
        nominal: data.nominal,
        deskripsi: data.deskripsi,
        metode: data.metode,
        penanggungJawab: data.penanggungJawab,
      };

      showToast('info', `Menyimpan ${newTx.kategori} ke Cloud Firebase...`, 2000);
      saveKasToFirestore(newTx).then((res) => {
        if (res.success) {
          showToast(
            'success',
            `${newTx.kategori} (${formatRupiah(newTx.nominal)}) berhasil tersimpan langsung ke Firebase!`
          );
        } else {
          showToast(
            'error',
            `Gagal menyimpan ke Firebase: ${res.error}`
          );
        }
      });
    } else {
      // 2. MODE LOKAL: Fallback simpan ke Backend lokal (db.json)
      const apiResult = await apiAddKas(data);
      newTx = apiResult || {
        id: `kas-${Date.now().toString(36)}`,
        tanggal: data.tanggal,
        tipe: data.tipe,
        kategori: data.kategori,
        nominal: data.nominal,
        deskripsi: data.deskripsi,
        metode: data.metode,
        penanggungJawab: data.penanggungJawab,
      };

      showToast(
        'info',
        `${newTx.kategori} (${formatRupiah(newTx.nominal)}) tersimpan di lokal (db.json).`
      );
    }

    const newKasList = [newTx, ...kasTransactions];
    persistState(wargaList, iplTransactions, iplItems, newKasList);
  };

  // Handle Delete Cash Transaction
  const handleDeleteKas = async (id: string) => {
    const target = kasTransactions.find((k) => k.id === id);
    if (!target) return;

    if (target.refId) {
      const confirmDelete = window.confirm(
        'Transaksi ini terkait dengan pembayaran IPL warga. Menghapus mutasi ini akan membatalkan status bayar iuran pada matriks warga. Lanjutkan?'
      );
      if (!confirmDelete) return;

      const newTxList = iplTransactions.filter((t) => t.id !== target.refId);
      const newItemsList = iplItems.filter((i) => i.transactionId !== target.refId);
      const newKasList = kasTransactions.filter((k) => k.id !== id);
      persistState(wargaList, newTxList, newItemsList, newKasList);

      if (isFirebaseConfigured()) {
        // 1. MODE CLOUD AKTIF: Hapus di Firebase saja (tanpa apiDeleteKas / db.json)
        const targetItemIds = iplItems
          .filter((i) => i.transactionId === target.refId)
          .map((i) => i.id);
        deleteIPLFromFirestore(target.refId, targetItemIds);
        deleteKasFromFirestore(id).then((res) => {
          if (res.success) {
            showToast('success', 'Transaksi kas berhasil dihapus dari Firebase!');
          } else {
            showToast('error', `Gagal menghapus kas di Firebase: ${res.error}`);
          }
        });
      } else {
        // 2. MODE LOKAL: Hapus di db.json
        await apiDeleteKas(id);
        showToast('info', 'Transaksi kas berhasil dihapus dari data lokal.');
      }
    } else {
      if (window.confirm('Yakin ingin menghapus mutasi kas ini?')) {
        const newKasList = kasTransactions.filter((k) => k.id !== id);
        persistState(wargaList, iplTransactions, iplItems, newKasList);

        if (isFirebaseConfigured()) {
          // 1. MODE CLOUD AKTIF: Hapus di Firebase saja (tanpa apiDeleteKas / db.json)
          deleteKasFromFirestore(id).then((res) => {
            if (res.success) {
              showToast('success', 'Transaksi kas berhasil dihapus dari Firebase!');
            } else {
              showToast('error', `Gagal menghapus kas di Firebase: ${res.error}`);
            }
          });
        } else {
          // 2. MODE LOKAL: Hapus di db.json
          await apiDeleteKas(id);
          showToast('info', 'Transaksi kas berhasil dihapus dari data lokal.');
        }
      }
    }
  };

  // Handle CRUD Warga
  const handleSaveWarga = async (data: Omit<Warga, 'id' | 'createdAt'> & { id?: string }) => {
    let savedWargaObj: Warga;

    if (data.id) {
      // Edit
      savedWargaObj = {
        id: data.id,
        blok: data.blok,
        nama: data.nama,
        statusHunian: data.statusHunian,
        noHp: data.noHp,
        tarifIPL: data.tarifIPL,
        keterangan: data.keterangan,
        createdAt: wargaList.find((w) => w.id === data.id)?.createdAt || new Date().toISOString().split('T')[0],
      };
    } else {
      // Create new
      savedWargaObj = {
        id: `w-${data.blok.replace(/[^A-Za-z0-9]/g, '')}-${Date.now().toString(36)}`,
        blok: data.blok,
        nama: data.nama,
        statusHunian: data.statusHunian,
        noHp: data.noHp,
        tarifIPL: data.tarifIPL,
        keterangan: data.keterangan,
        createdAt: new Date().toISOString().split('T')[0],
      };
    }

    if (isFirebaseConfigured()) {
      // 1. MODE CLOUD AKTIF: Langsung simpan ke Firebase Firestore saja (tanpa apiSaveWarga / db.json)
      saveWargaToFirestore(savedWargaObj).then((res) => {
        if (res.success) {
          showToast(
            'success',
            `Data warga kavling ${savedWargaObj.blok} (${savedWargaObj.nama}) tersimpan langsung ke Firebase!`
          );
        } else {
          showToast(
            'error',
            `Gagal menyimpan ke Firebase: ${res.error}`
          );
        }
      });
    } else {
      // 2. MODE LOKAL: Fallback simpan ke Backend lokal (db.json)
      const saved = await apiSaveWarga(data);
      if (saved) savedWargaObj = saved;
      showToast('info', `Data warga ${savedWargaObj.blok} tersimpan di lokal (db.json).`);
    }

    if (data.id) {
      const updated = wargaList.map((w) => (w.id === data.id ? savedWargaObj : w));
      persistState(updated, iplTransactions, iplItems, kasTransactions);
    } else {
      persistState([...wargaList, savedWargaObj], iplTransactions, iplItems, kasTransactions);
    }

    // Tetap di tab master warga setelah update / save
    setActiveTab('warga');
  };

  const handleDeleteWarga = async (id: string) => {
    const w = wargaList.find((item) => item.id === id);
    if (!w) return;
    if (window.confirm(`Hapus data kavling ${w.blok} (${w.nama}) dari master data?`)) {
      const updated = wargaList.filter((item) => item.id !== id);
      persistState(updated, iplTransactions, iplItems, kasTransactions);

      if (isFirebaseConfigured()) {
        // 1. MODE CLOUD AKTIF: Hapus di Firebase saja (tanpa apiDeleteWarga / db.json)
        deleteWargaFromFirestore(id).then((res) => {
          if (res.success) {
            showToast('success', `Data kavling ${w.blok} berhasil dihapus dari Firebase!`);
          } else {
            showToast('error', `Gagal menghapus warga di Firebase: ${res.error}`);
          }
        });
      } else {
        // 2. MODE LOKAL: Hapus di db.json
        await apiDeleteWarga(id);
        showToast('info', `Data kavling ${w.blok} dihapus dari lokal.`);
      }
      setActiveTab('warga');
    }
  };

  // Reset to default sample
  const handleResetData = async () => {
    if (!isLoggedIn) {
      handleRequireLogin('Hanya Pengurus yang berwenang mereset data keuangan.');
      return;
    }

    if (
      window.confirm(
        'Kembalikan seluruh data ke kondisi default komplek SWEET KATAPANG RESIDENCE?'
      )
    ) {
      if (isFirebaseConfigured()) {
        const reset = resetToDefaultData();
        setWargaList(reset.warga);
        setIplTransactions(reset.iplTransactions);
        setIplItems(reset.iplItems);
        setKasTransactions(reset.kasTransactions);
        syncLocalDataToFirestore(reset).then((res) => {
          if (res.success) {
            showToast('success', 'Data di Firebase berhasil di-reset ke kondisi default!');
          }
        });
      } else {
        const apiReset = await apiResetData();
        if (apiReset) {
          setWargaList(apiReset.warga);
          setIplTransactions(apiReset.iplTransactions);
          setIplItems(apiReset.iplItems);
          setKasTransactions(apiReset.kasTransactions);
          saveStateToStorage(apiReset);
        } else {
          const reset = resetToDefaultData();
          setWargaList(reset.warga);
          setIplTransactions(reset.iplTransactions);
          setIplItems(reset.iplItems);
          setKasTransactions(reset.kasTransactions);
        }
        showToast('info', 'Data lokal berhasil di-reset.');
      }
    }
  };

  // Export full JSON backup
  const handleExportBackup = () => {
    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      komplek: 'SWEET KATAPANG RESIDENCE',
      warga: wargaList,
      iplTransactions,
      iplItems,
      kasTransactions,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Backup_Keuangan_SWEET_KATAPANG_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        realAllTimeBalance={summary.realAllTimeBalance}
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        isFirebaseConnected={isFirebaseConnected}
        onOpenFirebaseConfig={() => {
          if (currentUser?.role === 'superadmin') {
            setIsFirebaseModalOpen(true);
          }
        }}
        onOpenLogin={() => handleRequireLogin()}
        onLogout={handleLogout}
        onResetData={handleResetData}
        onExportBackup={handleExportBackup}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dynamic Period Filter (Visible on Dashboard, Matriks, and Buku Kas) */}
        {activeTab !== 'warga' && activeTab !== 'arsitektur' && activeTab !== 'nocode' && (
          <PeriodFilter
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
          />
        )}

        {/* Tab 1: Dashboard & Arus Kas */}
        {activeTab === 'dashboard' && (
          <DashboardView
            summary={summary}
            filteredTransactions={filteredTransactions}
            wargaList={wargaList}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            isLoggedIn={isLoggedIn}
            currentUser={currentUser}
            pendingIPLTransactions={pendingIPLTransactions}
            onOpenIPLModal={() => {
              setPreSelectedWargaForIPL(null);
              setPreSelectedMonthForIPL(null);
              setIsIPLModalOpen(true);
            }}
            onOpenKasModal={(type) => {
              if (!isLoggedIn) {
                handleRequireLogin('Silakan login sebagai Pengurus untuk mencatat kas masuk atau keluar.');
                return;
              }
              setKasModalType(type);
              setIsKasModalOpen(true);
            }}
            onValidateIPL={handleValidateIPL}
            onRejectIPL={handleRejectIPL}
            onViewKwitansiForTx={(tx) => {
              const item = iplItems.find((i) => i.transactionId === tx.id);
              if (item) {
                setKwitansiItem(item);
                setKwitansiTx(tx);
                setIsKwitansiOpen(true);
              }
            }}
            onNavigateToTab={setActiveTab}
            onRequireLogin={() => handleRequireLogin('Silakan login sebagai Pengurus / Bendahara untuk mengelola transaksi kas.')}
          />
        )}

        {/* Tab 2: Matriks IPL Bulanan */}
        {activeTab === 'matriks' && (
          <IPLMatrixView
            wargaList={wargaList}
            iplItems={iplItems}
            iplTransactions={iplTransactions}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            isLoggedIn={isLoggedIn}
            currentUser={currentUser}
            onOpenIPLModalForWarga={(w, month) => {
              setPreSelectedWargaForIPL(w);
              setPreSelectedMonthForIPL(month || null);
              setIsIPLModalOpen(true);
            }}
            onViewKwitansi={(item, tx) => {
              setKwitansiItem(item);
              setKwitansiTx(tx || null);
              setIsKwitansiOpen(true);
            }}
            onOpenReminderWA={(w, unpaid) => {
              setReminderWarga(w);
              setReminderUnpaidMonths(unpaid);
              setIsReminderOpen(true);
            }}
            onRequireLogin={() => handleRequireLogin('Silakan login sebagai Pengurus untuk mencatat pembayaran iuran IPL.')}
            onValidateIPL={handleValidateIPL}
            onRejectIPL={handleRejectIPL}
          />
        )}

        {/* Tab 3: Buku Kas Lengkap (Jurnal Mutasi) */}
        {activeTab === 'kas' && (
          <CashBookView
            transactions={transactionsWithRunningBalance}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            summary={summary}
            isLoggedIn={isLoggedIn}
            currentUser={currentUser}
            onOpenKasModal={(type) => {
              if (!isLoggedIn) {
                handleRequireLogin('Silakan login sebagai Pengurus untuk mencatat transaksi kas.');
                return;
              }
              setKasModalType(type);
              setIsKasModalOpen(true);
            }}
            onDeleteTransaction={(id) => {
              if (!isLoggedIn) {
                handleRequireLogin('Hanya Pengurus yang dapat menghapus transaksi kas.');
                return;
              }
              handleDeleteKas(id);
            }}
            onRequireLogin={() => handleRequireLogin('Silakan login sebagai Pengurus untuk mengelola Buku Kas.')}
          />
        )}

        {/* Tab 4: Master Data Warga */}
        {activeTab === 'warga' && (
          <WargaMasterView
            wargaList={wargaList}
            isLoggedIn={isLoggedIn}
            currentUser={currentUser}
            onOpenAddModal={() => {
              if (!isLoggedIn) {
                handleRequireLogin('Silakan login sebagai Pengurus untuk menambah warga baru.');
                return;
              }
              setWargaToEdit(null);
              setIsWargaModalOpen(true);
            }}
            onOpenEditModal={(w) => {
              if (!isLoggedIn) {
                handleRequireLogin('Silakan login sebagai Pengurus untuk mengubah data warga.');
                return;
              }
              setWargaToEdit(w);
              setIsWargaModalOpen(true);
            }}
            onDeleteWarga={(id) => {
              if (!isLoggedIn) {
                handleRequireLogin('Silakan login sebagai Pengurus untuk menghapus data warga.');
                return;
              }
              handleDeleteWarga(id);
            }}
            onRequireLogin={() => handleRequireLogin('Silakan login sebagai Pengurus untuk mengelola Master Data Warga.')}
          />
        )}

        {/* Tab 5: Arsitektur & Skema DB (Khusus Super Admin) */}
        {activeTab === 'arsitektur' && isSuperAdmin && <ArchitectureDocsView />}

        {/* Tab 6: Template Google Sheets (Opsi A) (Khusus Super Admin) */}
        {activeTab === 'nocode' && isSuperAdmin && <GoogleSheetsOptionView />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs text-center no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-1">
          <p className="font-medium text-slate-300">
            Sistem Manajemen Keuangan SWEET KATAPANG RESIDENCE
          </p>
          <p className="text-slate-500 text-[11px]">
            Dirancang dengan prinsip transparansi akuntansi lingkungan, verifikasi pembayaran rapel, dan ketahanan data.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <ModalLogin
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        reason={loginReason}
      />

      <ModalCatatIPL
        isOpen={isIPLModalOpen}
        onClose={() => setIsIPLModalOpen(false)}
        wargaList={wargaList}
        iplItems={iplItems}
        preSelectedWarga={preSelectedWargaForIPL}
        preSelectedMonth={preSelectedMonthForIPL}
        activeYear={selectedYear}
        onSubmit={handleRecordIPL}
      />

      <ModalTambahKas
        isOpen={isKasModalOpen}
        onClose={() => setIsKasModalOpen(false)}
        initialType={kasModalType}
        onSubmit={handleAddKas}
      />

      <ModalWarga
        isOpen={isWargaModalOpen}
        onClose={() => setIsWargaModalOpen(false)}
        wargaToEdit={wargaToEdit}
        onSubmit={handleSaveWarga}
      />

      <ModalKwitansi
        isOpen={isKwitansiOpen}
        onClose={() => setIsKwitansiOpen(false)}
        item={kwitansiItem}
        parentTx={kwitansiTx}
        wargaPhone={
          kwitansiItem
            ? wargaList.find((w) => w.id === kwitansiItem.wargaId)?.noHp
            : undefined
        }
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        userRole={currentUser?.role}
        onValidate={handleValidateIPL}
        onReject={handleRejectIPL}
      />

      <ModalReminderWA
        isOpen={isReminderOpen}
        onClose={() => setIsReminderOpen(false)}
        warga={reminderWarga}
        unpaidMonths={reminderUnpaidMonths}
        selectedYear={selectedYear}
      />

      {/* Modal Pengaturan Cloud Sync (Khusus Super Admin) */}
      <ModalFirebaseConfig
        isOpen={isFirebaseModalOpen && currentUser?.role === 'superadmin'}
        onClose={() => setIsFirebaseModalOpen(false)}
        wargaList={wargaList}
        iplTransactions={iplTransactions}
        iplItems={iplItems}
        kasTransactions={kasTransactions}
        onConfigChanged={() => setIsFirebaseConnected(isFirebaseConfigured())}
      />

      {/* Modal Notifikasi Pembatasan Hak Akses Super Admin */}
      {restrictedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3.5 mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center mb-1">
              Akses Khusus Super Admin
            </h3>
            <p className="text-xs text-slate-600 text-center leading-relaxed mb-5">
              {restrictedNotice}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setRestrictedNotice(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
              >
                Mengerti
              </button>
              <button
                onClick={() => {
                  setRestrictedNotice(null);
                  handleRequireLogin('Silakan login sebagai Super Admin untuk membuka konfigurasi Google Cloud Firestore.');
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Login Super Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Real-Time Sync Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-200 pointer-events-auto">
          <div
            className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-3 backdrop-blur-md ${toast.type === 'success'
                ? 'bg-slate-900/95 text-emerald-300 border-emerald-500/40 shadow-emerald-950/20'
                : toast.type === 'error'
                  ? 'bg-slate-900/95 text-rose-300 border-rose-500/40 shadow-rose-950/20'
                  : 'bg-slate-900/95 text-slate-200 border-slate-700 shadow-slate-950/30'
              }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {toast.type === 'info' && <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />}
            </div>
            <div className="flex-1 text-xs leading-relaxed text-white">
              <p className="font-semibold">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
