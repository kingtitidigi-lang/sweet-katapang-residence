import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Zap,
  Trash2,
  Wrench,
  FileSpreadsheet,
  Users,
  Home,
  Check,
  ChevronRight,
} from 'lucide-react';
import { SummaryKeuangan, KasTransaction, Warga, AppTab } from '../types';
import { formatRupiah, formatTanggalIndo, NAMA_BULAN } from '../utils/formatters';

interface DashboardViewProps {
  summary: SummaryKeuangan;
  filteredTransactions: KasTransaction[];
  wargaList: Warga[];
  selectedYear: number;
  selectedMonth: number;
  isLoggedIn?: boolean;
  onOpenIPLModal: () => void;
  onOpenKasModal: (type: 'PEMASUKAN' | 'PENGELUARAN') => void;
  onNavigateToTab: (tab: AppTab) => void;
  onRequireLogin?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  filteredTransactions,
  wargaList,
  selectedYear,
  selectedMonth,
  isLoggedIn = false,
  onOpenIPLModal,
  onOpenKasModal,
  onNavigateToTab,
  onRequireLogin,
}) => {
  const periodeLabel =
    selectedMonth === 0
      ? `Tahun ${selectedYear}`
      : `${NAMA_BULAN[selectedMonth - 1]} ${selectedYear}`;

  // Breakdown expenses by category in filtered transactions
  const expensesByCategory: Record<string, number> = {};
  filteredTransactions
    .filter((tx) => tx.tipe === 'PENGELUARAN')
    .forEach((tx) => {
      expensesByCategory[tx.kategori] = (expensesByCategory[tx.kategori] || 0) + tx.nominal;
    });

  // Breakdown income by category in filtered transactions
  const incomeByCategory: Record<string, number> = {};
  filteredTransactions
    .filter((tx) => tx.tipe === 'PEMASUKAN')
    .forEach((tx) => {
      incomeByCategory[tx.kategori] = (incomeByCategory[tx.kategori] || 0) + tx.nominal;
    });

  const getCategoryIcon = (kat: string) => {
    switch (kat) {
      case 'Keamanan / Satpam':
        return <ShieldCheck className="w-4 h-4 text-blue-600" />;
      case 'Kebersihan / Sampah':
        return <Trash2 className="w-4 h-4 text-emerald-600" />;
      case 'Listrik PJU & Fasum':
        return <Zap className="w-4 h-4 text-amber-600" />;
      case 'Perbaikan & Maintenance':
        return <Wrench className="w-4 h-4 text-purple-600" />;
      default:
        return <FileSpreadsheet className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Action Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-md border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs uppercase tracking-wider text-slate-300 font-semibold">
              {isLoggedIn ? 'Panel Cepat Pengurus RT' : 'Transparansi Keuangan Warga'}
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">
            Ringkasan Keuangan {periodeLabel}
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            {isLoggedIn
              ? 'Kelola penerimaan IPL, catat operasional satpam & sampah, dan pantau saldo berjalan.'
              : 'Laporan arus kas dan kolektibilitas IPL transparan untuk seluruh warga komplek.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isLoggedIn ? (
            <>
              <button
                onClick={onOpenIPLModal}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Catat Bayar IPL (Rapel/Bulanan)</span>
              </button>

              <button
                onClick={() => onOpenKasModal('PENGELUARAN')}
                className="flex items-center gap-2 bg-rose-500 hover:bg-rose-400 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>Catat Pengeluaran</span>
              </button>

              <button
                onClick={() => onOpenKasModal('PEMASUKAN')}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-3 py-2 rounded-xl text-xs transition-colors"
              >
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                <span>Pemasukan Lain</span>
              </button>
            </>
          ) : (
            <button
              onClick={onRequireLogin}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Login Pengurus untuk Catat Kas</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Saldo Kas Riil (All-Time) */}
        <div className="bg-white rounded-xl p-4 border-2 border-emerald-500/20 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Saldo Kas Riil (Saat Ini)</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
              All-Time
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono tracking-tight">
            {formatRupiah(summary.realAllTimeBalance)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-600 inline" />
            <span>Total dana riil di rekening bank & kas fisik</span>
          </p>
        </div>

        {/* Card 2: Saldo Awal Periode */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Saldo Awal ({periodeLabel})</span>
            <PiggyBank className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-800 mt-2 font-mono tracking-tight">
            {formatRupiah(summary.saldoAwalPeriode)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Saldo akumulasi sebelum {selectedMonth === 0 ? `1 Jan ${selectedYear}` : `${NAMA_BULAN[selectedMonth - 1]}`}
          </p>
        </div>

        {/* Card 3: Total Pemasukan Periode */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pemasukan Periode Ini</span>
            <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2 font-mono tracking-tight">
            +{formatRupiah(summary.totalPemasukanPeriode)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            IPL + donasi & pos pemasukan lainnya
          </p>
        </div>

        {/* Card 4: Total Pengeluaran Periode */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pengeluaran Periode Ini</span>
            <div className="w-6 h-6 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600 mt-2 font-mono tracking-tight">
            -{formatRupiah(summary.totalPengeluaranPeriode)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Satpam, sampah, PJU & operasional
          </p>
        </div>
      </div>

      {/* Row 2: Surplus/Defisit Banner & Kolektibilitas IPL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Surplus / Defisit & Saldo Akhir Periode */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Surplus / Defisit Periode
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${summary.surplusDefisitPeriode >= 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                  }`}
              >
                {summary.surplusDefisitPeriode >= 0 ? 'SURPLUS' : 'DEFISIT'}
              </span>
            </div>

            <div className="mt-3">
              <div
                className={`text-3xl font-extrabold font-mono tracking-tight ${summary.surplusDefisitPeriode >= 0 ? 'text-emerald-700' : 'text-rose-600'
                  }`}
              >
                {summary.surplusDefisitPeriode >= 0 ? '+' : ''}
                {formatRupiah(summary.surplusDefisitPeriode)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Selisih kas masuk vs kas keluar selama {periodeLabel}.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-600 font-medium">Saldo Akhir Periode Ini:</span>
            <span className="text-base font-bold font-mono text-slate-900">
              {formatRupiah(summary.saldoAkhirPeriode)}
            </span>
          </div>
        </div>

        {/* Kolektibilitas IPL & Tracking Warga */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Kolektibilitas IPL {periodeLabel}
              </span>
              <span className="text-xs font-bold text-slate-700 font-mono">
                {summary.persentaseKolektibilitas}%
              </span>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                {formatRupiah(summary.iplTerkumpulBulanIni)}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                dari target potensi {formatRupiah(summary.iplTargetBulanIni)}
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${summary.persentaseKolektibilitas >= 80
                    ? 'bg-emerald-500'
                    : summary.persentaseKolektibilitas >= 50
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                style={{ width: `${Math.min(100, summary.persentaseKolektibilitas)}%` }}
              ></div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Kavling Terisi:</span>
            <span className="font-semibold text-slate-700">
              {summary.kavlingTerisi} dari {summary.totalKavling} Unit ({summary.kavlingKosong} Kosong)
            </span>
          </div>
        </div>

        {/* Status Hunian & Kavling Quick Info */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Profil Master Kavling
            </span>
            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              <div className="bg-emerald-50 rounded-lg p-2.5 border border-emerald-100">
                <div className="text-lg font-bold text-emerald-700">
                  {wargaList.filter((w) => w.statusHunian === 'Tetap').length}
                </div>
                <div className="text-[11px] text-emerald-800 font-medium">Tetap</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-2.5 border border-blue-100">
                <div className="text-lg font-bold text-blue-700">
                  {wargaList.filter((w) => w.statusHunian === 'Kontrak').length}
                </div>
                <div className="text-[11px] text-blue-800 font-medium">Kontrak</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-2.5 border border-amber-100">
                <div className="text-lg font-bold text-amber-700">
                  {summary.kavlingKosong}
                </div>
                <div className="text-[11px] text-amber-800 font-medium">Kosong</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigateToTab('matriks')}
              className="w-full text-xs font-semibold text-slate-700 hover:text-emerald-700 flex items-center justify-center gap-1.5 py-1 transition-colors"
            >
              <span>Buka Matriks Pembayaran IPL Lengkap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Pengeluaran Breakdown & Pemasukan Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rincian Pengeluaran Berdasarkan Kategori */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-bold text-slate-800">
                Pos Pengeluaran ({periodeLabel})
              </h3>
            </div>
            <span className="text-xs font-bold text-rose-600 font-mono">
              {formatRupiah(summary.totalPengeluaranPeriode)}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {Object.keys(expensesByCategory).length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-6">
                Tidak ada mutasi pengeluaran pada periode ini.
              </div>
            ) : (
              Object.entries(expensesByCategory).map(([kategori, nominal]) => {
                const percent =
                  summary.totalPengeluaranPeriode > 0
                    ? Math.round((nominal / summary.totalPengeluaranPeriode) * 100)
                    : 0;

                return (
                  <div key={kategori} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-medium text-slate-700">
                        {getCategoryIcon(kategori)}
                        <span>{kategori}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px]">{percent}%</span>
                        <span className="font-bold text-slate-900 font-mono">
                          {formatRupiah(nominal)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Rincian Pemasukan Berdasarkan Kategori */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-800">
                Pos Pemasukan ({periodeLabel})
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-600 font-mono">
              {formatRupiah(summary.totalPemasukanPeriode)}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {Object.keys(incomeByCategory).length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-6">
                Tidak ada mutasi pemasukan pada periode ini.
              </div>
            ) : (
              Object.entries(incomeByCategory).map(([kategori, nominal]) => {
                const percent =
                  summary.totalPemasukanPeriode > 0
                    ? Math.round((nominal / summary.totalPemasukanPeriode) * 100)
                    : 0;

                return (
                  <div key={kategori} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-medium text-slate-700">
                        <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                        <span>{kategori}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px]">{percent}%</span>
                        <span className="font-bold text-slate-900 font-mono">
                          {formatRupiah(nominal)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Row 4: Transaksi Terbaru di Periode Terpilih */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Mutasi Kas Terkini ({filteredTransactions.length} Transaksi)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Jurnal transaksi pada {periodeLabel}
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('kas')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
          >
            <span>Buku Kas Lengkap</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Tanggal</th>
                <th className="py-2.5 px-4">Uraian Transaksi</th>
                <th className="py-2.5 px-4">Kategori Pos</th>
                <th className="py-2.5 px-4">Metode</th>
                <th className="py-2.5 px-4 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.slice(0, 6).map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                    {formatTanggalIndo(tx.tanggal)}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">
                    {tx.deskripsi}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] text-slate-600">
                      {tx.kategori}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[11px] text-slate-500">
                    {tx.metode}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-mono font-bold ${tx.tipe === 'PEMASUKAN' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                  >
                    {tx.tipe === 'PEMASUKAN' ? '+' : '-'}
                    {formatRupiah(tx.nominal)}
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Belum ada transaksi di periode ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
