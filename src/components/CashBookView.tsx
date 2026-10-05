import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PlusCircle,
  Search,
  Filter,
  Download,
  Printer,
  Trash2,
  Calendar,
  CreditCard,
  Building,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { KasTransaction, SummaryKeuangan } from '../types';
import { formatRupiah, formatTanggalIndo, NAMA_BULAN } from '../utils/formatters';

interface CashBookViewProps {
  transactions: KasTransaction[]; // should already have runningBalance computed
  selectedYear: number;
  selectedMonth: number;
  summary: SummaryKeuangan;
  isLoggedIn?: boolean;
  onOpenKasModal: (type: 'PEMASUKAN' | 'PENGELUARAN') => void;
  onDeleteTransaction: (id: string) => void;
  onRequireLogin?: () => void;
}

export const CashBookView: React.FC<CashBookViewProps> = ({
  transactions,
  selectedYear,
  selectedMonth,
  summary,
  isLoggedIn = false,
  onOpenKasModal,
  onDeleteTransaction,
  onRequireLogin,
}) => {
  if (!isLoggedIn) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-sm max-w-md mx-auto my-12">
        <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">Buku Kas Khusus Pengurus RT</h3>
        <p className="text-xs text-slate-500 mb-5 leading-relaxed">
          Pencatatan mutasi kas masuk dan keluar secara terperinci dilindungi untuk menjaga integritas data bendahara.
        </p>
        <button
          onClick={onRequireLogin}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 mx-auto"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Login Pengurus RT</span>
        </button>
      </div>
    );
  }
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'PEMASUKAN' | 'PENGELUARAN'>('ALL');
  const [kategoriFilter, setKategoriFilter] = useState('ALL');

  const periodeLabel =
    selectedMonth === 0
      ? `Tahun ${selectedYear}`
      : `${NAMA_BULAN[selectedMonth - 1]} ${selectedYear}`;

  // Unique categories list
  const categoryList = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((tx) => set.add(tx.kategori));
    return Array.from(set).sort();
  }, [transactions]);

  // Filter transactions
  const displayTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Date filter
      if (selectedMonth === 0) {
        const txYear = parseInt(tx.tanggal.split('-')[0], 10);
        if (txYear !== selectedYear) return false;
      } else {
        const [y, m] = tx.tanggal.split('-');
        if (parseInt(y, 10) !== selectedYear || parseInt(m, 10) !== selectedMonth) {
          return false;
        }
      }

      // Type filter
      if (typeFilter !== 'ALL' && tx.tipe !== typeFilter) {
        return false;
      }

      // Category filter
      if (kategoriFilter !== 'ALL' && tx.kategori !== kategoriFilter) {
        return false;
      }

      // Search term
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        const matchDesc = tx.deskripsi.toLowerCase().includes(q);
        const matchPIC = tx.penanggungJawab.toLowerCase().includes(q);
        const matchKat = tx.kategori.toLowerCase().includes(q);
        if (!matchDesc && !matchPIC && !matchKat) return false;
      }

      return true;
    });
  }, [transactions, selectedYear, selectedMonth, typeFilter, kategoriFilter, searchTerm]);

  // Totals for the currently displayed filtered slice
  const { totalMasukSlice, totalKeluarSlice } = useMemo(() => {
    let masuk = 0;
    let keluar = 0;
    displayTransactions.forEach((tx) => {
      if (tx.tipe === 'PEMASUKAN') masuk += tx.nominal;
      else keluar += tx.nominal;
    });
    return { totalMasukSlice: masuk, totalKeluarSlice: keluar };
  }, [displayTransactions]);

  const handleExportCSV = () => {
    let csv = 'ID,Tanggal,Tipe,Kategori,Deskripsi,Metode,Penanggung Jawab,Masuk (IDR),Keluar (IDR),Saldo Berjalan (IDR)\n';
    displayTransactions.forEach((tx) => {
      const masuk = tx.tipe === 'PEMASUKAN' ? tx.nominal : 0;
      const keluar = tx.tipe === 'PENGELUARAN' ? tx.nominal : 0;
      csv += `"${tx.id}","${tx.tanggal}","${tx.tipe}","${tx.kategori}","${tx.deskripsi.replace(/"/g, '""')}","${tx.metode}","${tx.penanggungJawab}",${masuk},${keluar},${tx.runningBalance || 0}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Buku_Kas_RT04_${selectedYear}_${selectedMonth || 'Semua'}.csv`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Quick Actions */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Buku Kas & Jurnal Mutasi Keuangan
            </h2>
            <span className="text-xs px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-700">
              {periodeLabel}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar kronologis mutasi kas masuk dan kas keluar dengan perhitungan saldo berjalan otomatis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          <button
            onClick={() => onOpenKasModal('PEMASUKAN')}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-xs"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+ Catat Pemasukan</span>
          </button>

          <button
            onClick={() => onOpenKasModal('PENGELUARAN')}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-xs"
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>+ Catat Biaya Keluar</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1.5 rounded-lg text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1.5 rounded-lg text-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* Mini KPI Bar for this Period */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
          <div className="text-[11px] text-slate-500">Saldo Awal Periode</div>
          <div className="text-sm font-bold font-mono text-slate-800 mt-1">
            {formatRupiah(summary.saldoAwalPeriode)}
          </div>
        </div>

        <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100">
          <div className="text-[11px] text-emerald-800">Total Masuk (Periode Ini)</div>
          <div className="text-sm font-bold font-mono text-emerald-700 mt-1">
            +{formatRupiah(summary.totalPemasukanPeriode)}
          </div>
        </div>

        <div className="bg-rose-50/50 rounded-xl p-3 border border-rose-100">
          <div className="text-[11px] text-rose-800">Total Keluar (Periode Ini)</div>
          <div className="text-sm font-bold font-mono text-rose-700 mt-1">
            -{formatRupiah(summary.totalPengeluaranPeriode)}
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-xl p-3 shadow-xs">
          <div className="text-[11px] text-slate-400">Saldo Kas All-Time</div>
          <div className="text-sm font-bold font-mono text-emerald-400 mt-1">
            {formatRupiah(summary.realAllTimeBalance)}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3 no-print">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari transaksi, deskripsi kuitansi, atau nama penerima..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        {/* Tipe Selector */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 border border-slate-200 text-xs w-full sm:w-auto">
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${typeFilter === 'ALL'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Semua
          </button>
          <button
            onClick={() => setTypeFilter('PEMASUKAN')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${typeFilter === 'PEMASUKAN'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Masuk
          </button>
          <button
            onClick={() => setTypeFilter('PENGELUARAN')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${typeFilter === 'PENGELUARAN'
                ? 'bg-rose-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Keluar
          </button>
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Pos:</span>
          <select
            value={kategoriFilter}
            onChange={(e) => setKategoriFilter(e.target.value)}
            aria-label="Filter Pos Kategori Transaksi"
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Pos Kategori</option>
            {categoryList.map((kat) => (
              <option key={kat} value={kat}>
                {kat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold text-[11px]">
                <th className="py-3 px-3.5 w-24">Tanggal</th>
                <th className="py-3 px-3.5 min-w-[200px]">Uraian Mutasi</th>
                <th className="py-3 px-3 w-36">Kategori Pos</th>
                <th className="py-3 px-3 w-28">Metode & PIC</th>
                <th className="py-3 px-3.5 text-right w-32">Masuk (Debit)</th>
                <th className="py-3 px-3.5 text-right w-32">Keluar (Kredit)</th>
                <th className="py-3 px-3.5 text-right w-36 bg-slate-800">
                  Saldo Berjalan
                </th>
                <th className="py-3 px-2 text-center w-12 no-print">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {displayTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/90 transition-colors">
                  <td className="py-3 px-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {formatTanggalIndo(tx.tanggal)}
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="font-semibold text-slate-900">
                      {tx.deskripsi}
                    </div>
                    {tx.refId && (
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Ref: {tx.refId}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[11px] font-medium text-slate-700">
                      {tx.kategori}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-[11px] text-slate-600 font-medium">
                      {tx.metode}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                      {tx.penanggungJawab}
                    </div>
                  </td>

                  {/* Masuk */}
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-emerald-600">
                    {tx.tipe === 'PEMASUKAN' ? `+${formatRupiah(tx.nominal)}` : '-'}
                  </td>

                  {/* Keluar */}
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-rose-600">
                    {tx.tipe === 'PENGELUARAN' ? `-${formatRupiah(tx.nominal)}` : '-'}
                  </td>

                  {/* Saldo Berjalan */}
                  <td className="py-3 px-3.5 text-right font-mono font-extrabold text-slate-900 bg-slate-50/60">
                    {formatRupiah(tx.runningBalance || 0)}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-2 text-center no-print">
                    <button
                      onClick={() => onDeleteTransaction(tx.id)}
                      title="Hapus / Void Transaksi"
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {displayTransactions.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Tidak ada mutasi yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              )}
            </tbody>

            {/* Total Row */}
            <tfoot>
              <tr className="bg-slate-100 font-bold text-[11px] text-slate-800 border-t-2 border-slate-300">
                <td colSpan={4} className="py-3 px-3.5">
                  Total Mutasi Tampil ({displayTransactions.length} transaksi)
                </td>
                <td className="py-3 px-3.5 text-right font-mono text-emerald-700">
                  +{formatRupiah(totalMasukSlice)}
                </td>
                <td className="py-3 px-3.5 text-right font-mono text-rose-700">
                  -{formatRupiah(totalKeluarSlice)}
                </td>
                <td colSpan={2} className="py-3 px-3.5 text-right font-mono text-slate-900 bg-slate-200">
                  Surplus: {formatRupiah(totalMasukSlice - totalKeluarSlice)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
