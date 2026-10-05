import React, { useState, useEffect, useMemo } from 'react';
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
} from './types';
import {
  loadInitialData,
  saveStateToStorage,
  resetToDefaultData,
} from './utils/storage';
import {
  fetchBackendData,
  apiRecordIPL,
  apiAddKas,
  apiDeleteKas,
  apiSaveWarga,
  apiDeleteWarga,
  apiResetData,
} from './utils/api';
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

  // 3. Authentication State (Pengurus vs Guest/Warga)
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>(() => {
    try {
      const stored = localStorage.getItem('sweet_katapang_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginReason, setLoginReason] = useState<string>('');

  const isLoggedIn = currentUser !== null;

  const handleLoginSuccess = (user: { username: string; role: string }) => {
    setCurrentUser(user);
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

  const handleRequireLogin = (reason = 'Hanya Pengurus RT yang dapat mencatat atau mengubah data.') => {
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

  // 5. Initial Load (Try Backend API first, fallback to localStorage)
  useEffect(() => {
    async function init() {
      const backendData = await fetchBackendData();
      if (backendData && backendData.warga.length > 0) {
        setWargaList(backendData.warga);
        setIplTransactions(backendData.iplTransactions);
        setIplItems(backendData.iplItems);
        setKasTransactions(backendData.kasTransactions);
        setIsBackendConnected(true);
        saveStateToStorage(backendData);
      } else {
        const localData = loadInitialData();
        setWargaList(localData.warga);
        setIplTransactions(localData.iplTransactions);
        setIplItems(localData.iplItems);
        setKasTransactions(localData.kasTransactions);
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

  // --- Handlers ---

  // Handle Recording IPL Payment (Single or Rapel)
  const handleRecordIPL = async (data: RecordIPLData) => {
    // Call backend API
    const apiResult = await apiRecordIPL(data);

    let transaction: IPLTransaction;
    let items: IPLPaymentItem[];
    let kasRecord: KasTransaction;

    if (apiResult) {
      transaction = apiResult.transaction;
      items = apiResult.items;
      kasRecord = apiResult.kasRecord;
    } else {
      const localResult = executeRapelPayment(data);
      transaction = localResult.transaction;
      items = localResult.items;
      kasRecord = localResult.kasRecord;
    }

    const newTxList = [transaction, ...iplTransactions];
    const newItemsList = [...items, ...iplItems];
    const newKasList = [kasRecord, ...kasTransactions];

    persistState(wargaList, newTxList, newItemsList, newKasList);

    // Prompt user to view digital receipt right away
    if (items.length > 0) {
      setKwitansiItem(items[0]);
      setKwitansiTx(transaction);
      setIsKwitansiOpen(true);
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
    const apiResult = await apiAddKas(data);
    const newTx: KasTransaction = apiResult || {
      id: `kas-${Date.now().toString(36)}`,
      tanggal: data.tanggal,
      tipe: data.tipe,
      kategori: data.kategori,
      nominal: data.nominal,
      deskripsi: data.deskripsi,
      metode: data.metode,
      penanggungJawab: data.penanggungJawab,
    };

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

      await apiDeleteKas(id);
      const newTxList = iplTransactions.filter((t) => t.id !== target.refId);
      const newItemsList = iplItems.filter((i) => i.transactionId !== target.refId);
      const newKasList = kasTransactions.filter((k) => k.id !== id);
      persistState(wargaList, newTxList, newItemsList, newKasList);
    } else {
      if (window.confirm('Yakin ingin menghapus mutasi kas ini?')) {
        await apiDeleteKas(id);
        const newKasList = kasTransactions.filter((k) => k.id !== id);
        persistState(wargaList, iplTransactions, iplItems, newKasList);
      }
    }
  };

  // Handle CRUD Warga
  const handleSaveWarga = async (data: Omit<Warga, 'id' | 'createdAt'> & { id?: string }) => {
    const saved = await apiSaveWarga(data);
    if (data.id) {
      // Edit
      const updated = wargaList.map((w) =>
        w.id === data.id
          ? saved || {
            ...w,
            blok: data.blok,
            nama: data.nama,
            statusHunian: data.statusHunian,
            noHp: data.noHp,
            tarifIPL: data.tarifIPL,
            keterangan: data.keterangan,
          }
          : w
      );
      persistState(updated, iplTransactions, iplItems, kasTransactions);
    } else {
      // Create new
      const newW: Warga = saved || {
        id: `w-${data.blok.replace(/[^A-Za-z0-9]/g, '')}-${Date.now().toString(36)}`,
        blok: data.blok,
        nama: data.nama,
        statusHunian: data.statusHunian,
        noHp: data.noHp,
        tarifIPL: data.tarifIPL,
        keterangan: data.keterangan,
        createdAt: new Date().toISOString().split('T')[0],
      };
      persistState([...wargaList, newW], iplTransactions, iplItems, kasTransactions);
    }
    // Tetap di tab master warga setelah update / save
    setActiveTab('warga');
  };

  const handleDeleteWarga = async (id: string) => {
    const w = wargaList.find((item) => item.id === id);
    if (!w) return;
    if (window.confirm(`Hapus data kavling ${w.blok} (${w.nama}) dari master data?`)) {
      await apiDeleteWarga(id);
      const updated = wargaList.filter((item) => item.id !== id);
      persistState(updated, iplTransactions, iplItems, kasTransactions);
      setActiveTab('warga');
    }
  };

  // Reset to default sample
  const handleResetData = async () => {
    if (!isLoggedIn) {
      handleRequireLogin('Hanya Pengurus RT yang berwenang mereset data keuangan.');
      return;
    }

    if (
      window.confirm(
        'Kembalikan seluruh data ke kondisi default komplek SWEET KATAPANG RESIDENCE?'
      )
    ) {
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
            onOpenIPLModal={() => {
              if (!isLoggedIn) {
                handleRequireLogin('Silakan login sebagai Pengurus RT untuk mencatat pembayaran iuran IPL.');
                return;
              }
              setPreSelectedWargaForIPL(null);
              setPreSelectedMonthForIPL(null);
              setIsIPLModalOpen(true);
            }}
            onOpenKasModal={(type) => {
              if (!isLoggedIn) {
                handleRequireLogin('Silakan login sebagai Pengurus RT untuk mencatat kas masuk atau keluar.');
                return;
              }
              setKasModalType(type);
              setIsKasModalOpen(true);
            }}
            onNavigateToTab={setActiveTab}
            onRequireLogin={() => handleRequireLogin('Silakan login sebagai Pengurus RT untuk mencatat transaksi keuangan.')}
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
            onOpenIPLModalForWarga={(w, month) => {
              if (!isLoggedIn) {
                handleRequireLogin('Silakan login sebagai Pengurus RT untuk mencatat pembayaran iuran IPL warga.');
                return;
              }
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
            onRequireLogin={() => handleRequireLogin('Silakan login sebagai Pengurus RT untuk mencatat pembayaran iuran IPL.')}
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
            onOpenKasModal={(type) => {
              if (!isLoggedIn) {
                handleRequireLogin('Silakan login sebagai Pengurus RT untuk mencatat transaksi kas.');
                return;
              }
              setKasModalType(type);
              setIsKasModalOpen(true);
            }}
            onDeleteTransaction={(id) => {
              if (!isLoggedIn) {
                handleRequireLogin('Hanya Pengurus RT yang dapat menghapus transaksi kas.');
                return;
              }
              handleDeleteKas(id);
            }}
            onRequireLogin={() => handleRequireLogin('Silakan login sebagai Pengurus RT untuk mengelola Buku Kas.')}
          />
        )}

        {/* Tab 4: Master Data Warga */}
        {activeTab === 'warga' && (
          <WargaMasterView
            wargaList={wargaList}
            isLoggedIn={isLoggedIn}
            onOpenAddModal={() => {
              if (!isLoggedIn) {
                handleRequireLogin('Silakan login sebagai Pengurus RT untuk menambah warga baru.');
                return;
              }
              setWargaToEdit(null);
              setIsWargaModalOpen(true);
            }}
            onOpenEditModal={(w) => {
              if (!isLoggedIn) {
                handleRequireLogin('Silakan login sebagai Pengurus RT untuk mengubah data warga.');
                return;
              }
              setWargaToEdit(w);
              setIsWargaModalOpen(true);
            }}
            onDeleteWarga={(id) => {
              if (!isLoggedIn) {
                handleRequireLogin('Silakan login sebagai Pengurus RT untuk menghapus data warga.');
                return;
              }
              handleDeleteWarga(id);
            }}
            onRequireLogin={() => handleRequireLogin('Silakan login sebagai Pengurus RT untuk mengelola Master Data Warga.')}
          />
        )}

        {/* Tab 5: Arsitektur & Skema DB */}
        {activeTab === 'arsitektur' && <ArchitectureDocsView />}

        {/* Tab 6: Template Google Sheets (Opsi A) */}
        {activeTab === 'nocode' && <GoogleSheetsOptionView />}
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
      />

      <ModalReminderWA
        isOpen={isReminderOpen}
        onClose={() => setIsReminderOpen(false)}
        warga={reminderWarga}
        unpaidMonths={reminderUnpaidMonths}
        selectedYear={selectedYear}
      />
    </div>
  );
}
