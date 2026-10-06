import { KasTransaction, SummaryKeuangan, Warga, IPLPaymentItem, IPLTransaction, RecordIPLData } from '../types';

export function calculateRunningBalances(transactions: KasTransaction[]): KasTransaction[] {
  // Sort chronologically (oldest first)
  const sorted = [...transactions].sort((a, b) => {
    const diff = new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime();
    if (diff !== 0) return diff;
    return a.id.localeCompare(b.id);
  });

  let currentBalance = 0;
  const withBalance: KasTransaction[] = sorted.map((tx) => {
    if (tx.tipe === 'PEMASUKAN') {
      currentBalance += tx.nominal;
    } else {
      currentBalance -= tx.nominal;
    }
    return {
      ...tx,
      runningBalance: currentBalance,
    };
  });

  return withBalance;
}

export function computeSummaryKeuangan(
  allTransactions: KasTransaction[],
  wargaList: Warga[],
  iplItems: IPLPaymentItem[],
  selectedYear: number,
  selectedMonth: number // 0 = Semua Bulan, 1-12 = Bulan tertentu
): {
  summary: SummaryKeuangan;
  filteredTransactions: KasTransaction[];
} {
  // 1. Calculate Real All-Time Balance (never clipped by date filter)
  let realAllTimeBalance = 0;
  allTransactions.forEach((tx) => {
    if (tx.tipe === 'PEMASUKAN') {
      realAllTimeBalance += tx.nominal;
    } else {
      realAllTimeBalance -= tx.nominal;
    }
  });

  // 2. Identify start date of chosen period
  // If selectedMonth === 0, period is selectedYear-01-01 to selectedYear-12-31
  // If selectedMonth > 0, period is selectedYear-MM-01 to selectedYear-MM-lastDay
  const periodStartDate =
    selectedMonth === 0
      ? `${selectedYear}-01-01`
      : `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;

  // Ending date condition
  const nextMonthYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
  const nextMonth = selectedMonth === 0 ? 1 : selectedMonth === 12 ? 1 : selectedMonth + 1;
  const periodEndDateExclusive =
    selectedMonth === 0
      ? `${selectedYear + 1}-01-01`
      : `${nextMonthYear}-${String(nextMonth).padStart(2, '0')}-01`;

  // 3. Calculate Saldo Awal Periode (all transactions strictly BEFORE periodStartDate)
  let saldoAwalPeriode = 0;
  allTransactions.forEach((tx) => {
    if (tx.tanggal < periodStartDate) {
      if (tx.tipe === 'PEMASUKAN') {
        saldoAwalPeriode += tx.nominal;
      } else {
        saldoAwalPeriode -= tx.nominal;
      }
    }
  });

  // 4. Filter transactions within selected period
  const filteredTransactions = allTransactions.filter((tx) => {
    if (selectedMonth === 0) {
      const txYear = parseInt(tx.tanggal.split('-')[0], 10);
      return txYear === selectedYear;
    } else {
      return tx.tanggal >= periodStartDate && tx.tanggal < periodEndDateExclusive;
    }
  });

  // Sort filtered transactions newest first for display in ledger table
  const sortedFiltered = [...filteredTransactions].sort((a, b) => {
    const diff = new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
    if (diff !== 0) return diff;
    return b.id.localeCompare(a.id);
  });

  // 5. Calculate Period Totals
  let totalPemasukanPeriode = 0;
  let totalPengeluaranPeriode = 0;

  filteredTransactions.forEach((tx) => {
    if (tx.tipe === 'PEMASUKAN') {
      totalPemasukanPeriode += tx.nominal;
    } else {
      totalPengeluaranPeriode += tx.nominal;
    }
  });

  const surplusDefisitPeriode = totalPemasukanPeriode - totalPengeluaranPeriode;
  const saldoAkhirPeriode = saldoAwalPeriode + surplusDefisitPeriode;

  // 6. Demographics & IPL Stats
  const totalKavling = wargaList.length;
  const kavlingKosong = wargaList.filter((w) => w.statusHunian === 'Kosong').length;
  const kavlingTerisi = totalKavling - kavlingKosong;

  // Target IPL for the active month (or annualized if all months)
  // Non-empty units pay full tarifIPL; if empty, management might exempt or charge maintenance
  // Here we calculate target based on active inhabited units
  const targetPerBulan = wargaList
    .filter((w) => w.statusHunian !== 'Kosong')
    .reduce((sum, w) => sum + (w.tarifIPL || 210000), 0);

  const targetPeriode = selectedMonth === 0 ? targetPerBulan * 12 : targetPerBulan;

  // Real collected IPL for the specific period months (only verified Lunas items)
  let iplTerkumpul = 0;
  if (selectedMonth === 0) {
    iplTerkumpul = iplItems
      .filter((item) => item.tahun === selectedYear && item.status !== 'Menunggu Validasi')
      .reduce((sum, item) => sum + item.nominal, 0);
  } else {
    iplTerkumpul = iplItems
      .filter((item) => item.tahun === selectedYear && item.bulan === selectedMonth && item.status !== 'Menunggu Validasi')
      .reduce((sum, item) => sum + item.nominal, 0);
  }

  const persentaseKolektibilitas =
    targetPeriode > 0 ? Math.min(100, Math.round((iplTerkumpul / targetPeriode) * 100)) : 0;

  return {
    summary: {
      realAllTimeBalance,
      saldoAwalPeriode,
      totalPemasukanPeriode,
      totalPengeluaranPeriode,
      surplusDefisitPeriode,
      saldoAkhirPeriode,
      totalKavling,
      kavlingTerisi,
      kavlingKosong,
      iplTerkumpulBulanIni: iplTerkumpul,
      iplTargetBulanIni: targetPeriode,
      persentaseKolektibilitas,
    },
    filteredTransactions: sortedFiltered,
  };
}

export function executeRapelPayment(params: RecordIPLData): {
  transaction: IPLTransaction;
  items: IPLPaymentItem[];
  kasRecord: KasTransaction;
} {
  const warga = params?.warga || ({} as Warga);
  const tahun = params?.tahun || new Date().getFullYear();
  const bulanList = Array.isArray(params?.bulanList) && params.bulanList.length > 0 ? params.bulanList : [1];
  const sortedMonths = [...bulanList].sort((a, b) => a - b);

  const tarif = Number(warga.tarifIPL) || 210000;
  const totalNominal = sortedMonths.length * tarif;
  const isRapel = sortedMonths.length > 1;
  const blok = warga.blok || 'A00';
  const nama = warga.nama || 'Warga';
  const wargaId = warga.id || `w-${blok}`;
  const tanggalBayar = params?.tanggalBayar || new Date().toISOString().split('T')[0];
  const metode = params?.metode || 'Transfer Bank';
  const status = params?.status || (params?.submittedBy === 'warga' ? 'Menunggu Validasi' : 'Lunas');
  const submittedBy = params?.submittedBy || (status === 'Menunggu Validasi' ? 'warga' : 'pengurus');
  const diterimaOleh = params?.diterimaOleh || (status === 'Menunggu Validasi' ? 'Warga (Konfirmasi Mandiri)' : 'Bendahara');
  const catatan = params?.catatan;

  const txId = `ipl-${blok}-${tahun}-${Date.now().toString(36)}`;

  const transaction: IPLTransaction = {
    id: txId,
    wargaId,
    blok,
    nama,
    tahun,
    bulanList: sortedMonths,
    totalNominal,
    tanggalBayar,
    metode,
    keterangan: isRapel
      ? `Bayar rapel ${sortedMonths.length} bulan (${sortedMonths.map((m) => `Bln ${m}`).join(', ')}) ${catatan ? '- ' + catatan : ''}`
      : catatan || `Iuran IPL Bulan ${sortedMonths[0] || 1}/${tahun}`,
    status,
    kasTransactionId: status === 'Lunas' ? `kas-${txId}` : undefined,
    diterimaOleh,
    submittedBy,
  };

  const items: IPLPaymentItem[] = sortedMonths.map((bulan) => ({
    id: `item-${blok}-${tahun}-${bulan}-${Date.now().toString(36)}`,
    transactionId: txId,
    wargaId,
    blok,
    nama,
    tahun,
    bulan,
    nominal: tarif,
    tanggalBayar,
    metode,
    isRapel,
    status,
    catatan: isRapel ? `Rapel ${sortedMonths.length} bulan` : catatan,
    buktiRef: `KWT/${tahun}/${String(bulan).padStart(2, '0')}/${blok}`,
  }));

  const kasRecord: KasTransaction = {
    id: `kas-${txId}`,
    tanggal: tanggalBayar,
    tipe: 'PEMASUKAN',
    kategori: 'Iuran IPL',
    nominal: totalNominal,
    deskripsi: `IPL Blok ${blok} - ${nama} (${sortedMonths.length} bln: ${sortedMonths.join(', ')})`,
    metode,
    refId: txId,
    penanggungJawab: diterimaOleh,
  };

  return { transaction, items, kasRecord };
}
