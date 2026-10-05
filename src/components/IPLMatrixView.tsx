import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Search,
  Filter,
  PlusCircle,
  Download,
  Share2,
  Printer,
  Sparkles,
  Receipt,
  MessageCircle,
} from 'lucide-react';
import { Warga, IPLPaymentItem, IPLTransaction } from '../types';
import { NAMA_BULAN_PENDEK, NAMA_BULAN, formatRupiah } from '../utils/formatters';

interface IPLMatrixViewProps {
  wargaList: Warga[];
  iplItems: IPLPaymentItem[];
  iplTransactions: IPLTransaction[];
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  isLoggedIn?: boolean;
  onOpenIPLModalForWarga: (warga: Warga, defaultMonth?: number) => void;
  onViewKwitansi: (item: IPLPaymentItem, tx?: IPLTransaction) => void;
  onOpenReminderWA: (warga: Warga, unpaidMonths: number[]) => void;
  onRequireLogin?: () => void;
}

export const IPLMatrixView: React.FC<IPLMatrixViewProps> = ({
  wargaList,
  iplItems,
  iplTransactions,
  selectedYear,
  setSelectedYear,
  isLoggedIn = false,
  onOpenIPLModalForWarga,
  onViewKwitansi,
  onOpenReminderWA,
  onRequireLogin,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlokFilter, setSelectedBlokFilter] = useState('Semua');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('Semua');

  // Map to quickly lookup payment by `${wargaId}-${tahun}-${bulan}`
  const paymentMap = useMemo(() => {
    const map = new Map<string, IPLPaymentItem>();
    iplItems.forEach((item) => {
      map.set(`${item.wargaId}-${item.tahun}-${item.bulan}`, item);
    });
    return map;
  }, [iplItems]);

  // Extract unique blocks
  const blockList = useMemo(() => {
    const set = new Set<string>();
    wargaList.forEach((w) => {
      const blockLetter = w.blok.charAt(0).toUpperCase();
      set.add(blockLetter);
    });
    return Array.from(set).sort();
  }, [wargaList]);

  // Filtered warga list
  const filteredWarga = useMemo(() => {
    return wargaList.filter((w) => {
      const matchSearch =
        w.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.blok.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.noHp.includes(searchTerm);

      const matchBlok =
        selectedBlokFilter === 'Semua' ||
        w.blok.toUpperCase().startsWith(selectedBlokFilter);

      const matchStatus =
        selectedStatusFilter === 'Semua' || w.statusHunian === selectedStatusFilter;

      return matchSearch && matchBlok && matchStatus;
    });
  }, [wargaList, searchTerm, selectedBlokFilter, selectedStatusFilter]);

  // Compute monthly stats for columns
  const monthlyStats = useMemo(() => {
    const stats: { lunas: number; belumLunas: number; kosong: number }[] = [];
    for (let month = 1; month <= 12; month++) {
      let lunas = 0;
      let belumLunas = 0;
      let kosong = 0;

      filteredWarga.forEach((w) => {
        if (w.statusHunian === 'Kosong') {
          kosong++;
        } else {
          const item = paymentMap.get(`${w.id}-${selectedYear}-${month}`);
          if (item) {
            lunas++;
          } else {
            belumLunas++;
          }
        }
      });
      stats.push({ lunas, belumLunas, kosong });
    }
    return stats;
  }, [filteredWarga, paymentMap, selectedYear]);

  // Function to export Matrix to CSV
  const handleExportCSV = () => {
    let csv = `Blok,Nama Warga,Status Hunian,Tarif IPL,${NAMA_BULAN.join(',')},Total Lunas\n`;
    filteredWarga.forEach((w) => {
      const row = [
        `"${w.blok}"`,
        `"${w.nama}"`,
        `"${w.statusHunian}"`,
        w.tarifIPL,
      ];
      let paidCount = 0;
      for (let m = 1; m <= 12; m++) {
        if (w.statusHunian === 'Kosong') {
          row.push('"KOSONG"');
        } else {
          const item = paymentMap.get(`${w.id}-${selectedYear}-${m}`);
          if (item) {
            row.push(item.isRapel ? '"LUNAS (Rapel)"' : '"LUNAS"');
            paidCount++;
          } else {
            row.push('"BELUM LUNAS"');
          }
        }
      }
      row.push(paidCount);
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Matriks_IPL_SWEET_KATAPANG_${selectedYear}.csv`;
    link.click();
  };

  return (
    <div className="space-y-5">
      {/* Header and Filter Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Matriks Pembayaran IPL Tahun {selectedYear}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-700">
              {filteredWarga.length} Kavling
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tinjauan status pembayaran 12 bulan per kavling, verifikasi rapel, dan kwitansi digital.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Year selector buttons */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
            {[2025, 2026, 2027].map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${selectedYear === yr
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                {yr}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>

          {isLoggedIn && (
            <button
              onClick={() => onOpenIPLModalForWarga(filteredWarga[0] || wargaList[0])}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs shadow-xs transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Catat Bayar IPL</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Row: Search & Dropdowns */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari Blok (misal: A01), Nama Warga, atau No HP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        {/* Filter Blok */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Blok:</span>
          <select
            value={selectedBlokFilter}
            onChange={(e) => setSelectedBlokFilter(e.target.value)}
            aria-label="Filter Blok Kavling"
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Semua">Semua Blok</option>
            {blockList.map((b) => (
              <option key={b} value={b}>
                Blok {b}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Status Hunian */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Status:</span>
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            aria-label="Filter Status Hunian Warga"
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Semua">Semua Status</option>
            <option value="Tetap">Tetap</option>
            <option value="Kontrak">Kontrak</option>
            <option value="Kosong">Kosong</option>
          </select>
        </div>

        {/* Legend */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-600 border-l border-slate-200 pl-3">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
            <span>Lunas</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-amber-400"></span>
            <span>Rapel</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-rose-200"></span>
            <span>Belum</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-slate-200"></span>
            <span>Kosong</span>
          </div>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold text-[11px]">
                <th className="py-2.5 px-3 sticky left-0 z-20 bg-slate-900 w-16 border-r border-slate-800">
                  Blok
                </th>
                <th className="py-2.5 px-3 sticky left-16 z-20 bg-slate-900 min-w-[150px] border-r border-slate-800">
                  Warga & Status
                </th>
                {NAMA_BULAN_PENDEK.map((bln, idx) => (
                  <th
                    key={bln}
                    className="py-2.5 px-1.5 text-center min-w-[58px] border-r border-slate-800"
                  >
                    <div>{bln}</div>
                    <div className="text-[9px] font-normal text-slate-400 font-mono">
                      {idx + 1}
                    </div>
                  </th>
                ))}
                {isLoggedIn && (
                  <th className="py-2.5 px-3 text-center min-w-[140px]">
                    Aksi Cepat
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredWarga.map((w) => {
                // Find unpaid months for this resident
                const unpaidMonths: number[] = [];
                if (w.statusHunian !== 'Kosong') {
                  for (let m = 1; m <= 12; m++) {
                    if (!paymentMap.has(`${w.id}-${selectedYear}-${m}`)) {
                      unpaidMonths.push(m);
                    }
                  }
                }

                return (
                  <tr key={w.id} className="hover:bg-slate-50/90 transition-colors">
                    {/* Blok Column (Sticky) */}
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 sticky left-0 z-10 bg-white border-r border-slate-200">
                      <div className="bg-slate-100 rounded px-1.5 py-0.5 text-center text-xs">
                        {w.blok}
                      </div>
                    </td>

                    {/* Warga Name & Status (Sticky) */}
                    <td className="py-2.5 px-3 sticky left-16 z-10 bg-white border-r border-slate-200">
                      <div className="font-semibold text-slate-800 truncate max-w-[140px]">
                        {w.nama}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                        <span
                          className={`px-1 rounded ${w.statusHunian === 'Tetap'
                              ? 'text-emerald-700 bg-emerald-50'
                              : w.statusHunian === 'Kontrak'
                                ? 'text-blue-700 bg-blue-50'
                                : 'text-amber-700 bg-amber-50'
                            }`}
                        >
                          {w.statusHunian}
                        </span>
                        <span>·</span>
                        <span>{formatRupiah(w.tarifIPL)}</span>
                      </div>
                    </td>

                    {/* 12 Months Columns */}
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                      const item = paymentMap.get(`${w.id}-${selectedYear}-${month}`);

                      if (w.statusHunian === 'Kosong') {
                        return (
                          <td
                            key={month}
                            className="py-2 px-1 text-center border-r border-slate-100 bg-slate-50/60"
                          >
                            <span className="text-[10px] text-slate-400 font-mono">
                              -
                            </span>
                          </td>
                        );
                      }

                      if (item) {
                        return (
                          <td
                            key={month}
                            className="py-2 px-1 text-center border-r border-slate-100"
                          >
                            <button
                              onClick={() => {
                                const parentTx = iplTransactions.find(
                                  (t) => t.id === item.transactionId
                                );
                                onViewKwitansi(item, parentTx);
                              }}
                              title={`Lunas ${formatRupiah(item.nominal)} (${item.metode}) - Klik lihat kwitansi`}
                              className={`w-full py-1 rounded text-[11px] font-bold flex flex-col items-center justify-center transition-all ${item.isRapel
                                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/80'
                                }`}
                            >
                              <div className="flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
                                <span>Lunas</span>
                              </div>
                              {item.isRapel && (
                                <span className="text-[8px] text-amber-700 font-semibold leading-none">
                                  Rapel
                                </span>
                              )}
                            </button>
                          </td>
                        );
                      }

                      // Unpaid Cell
                      return (
                        <td
                          key={month}
                          className="py-2 px-1 text-center border-r border-slate-100 bg-rose-50/30"
                        >
                          {isLoggedIn ? (
                            <button
                              onClick={() => onOpenIPLModalForWarga(w, month)}
                              title={`Belum Lunas: Klik untuk catat bayar bulan ${month}`}
                              className="w-full py-1 text-[10px] font-semibold text-rose-600 hover:text-slate-900 hover:bg-rose-100/70 rounded transition-colors"
                            >
                              + Bayar
                            </button>
                          ) : (
                            <span
                              title="Belum Lunas"
                              className="inline-block px-1.5 py-0.5 text-[10px] font-semibold text-rose-600 bg-rose-100/60 rounded"
                            >
                              Belum
                            </span>
                          )}
                        </td>
                      );
                    })}

                    {/* Quick Action Column (Hanya ditampilkan untuk Pengurus / Login) */}
                    {isLoggedIn && (
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onOpenIPLModalForWarga(w)}
                            title="Bayar Rapel Multi-Bulan"
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <PlusCircle className="w-3 h-3" />
                            <span>Rapel</span>
                          </button>

                          {unpaidMonths.length > 0 && w.statusHunian !== 'Kosong' && (
                            <button
                              onClick={() => onOpenReminderWA(w, unpaidMonths)}
                              title="Kirim Pesan Pengingat WhatsApp"
                              className="p-1 bg-green-500 hover:bg-green-600 text-white rounded text-[11px] transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}

              {filteredWarga.length === 0 && (
                <tr>
                  <td colSpan={isLoggedIn ? 15 : 14} className="py-12 text-center text-slate-400">
                    Tidak ditemukan kavling yang sesuai dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>

            {/* Footer Totals */}
            <tfoot>
              <tr className="bg-slate-100 font-semibold text-[11px] text-slate-700 border-t-2 border-slate-300">
                <td colSpan={2} className="py-2.5 px-3 sticky left-0 z-10 bg-slate-100">
                  Total Lunas / Bulan
                </td>
                {monthlyStats.map((stat, idx) => (
                  <td key={idx} className="py-2 px-1 text-center font-mono">
                    <span className="text-emerald-700 font-bold">{stat.lunas}</span>
                    <span className="text-slate-400 text-[10px]">/{stat.lunas + stat.belumLunas}</span>
                  </td>
                ))}
                {isLoggedIn && (
                  <td className="py-2 px-3 text-center text-slate-500 text-[10px]">
                    Rekapitulasi RT
                  </td>
                )}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
