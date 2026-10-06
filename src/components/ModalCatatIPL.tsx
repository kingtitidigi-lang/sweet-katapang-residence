import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Calendar,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Receipt,
  Sparkles,
  Clock,
  ShieldCheck,
  User,
} from 'lucide-react';
import { Warga, IPLPaymentItem, MetodePembayaran, RecordIPLData, AuthUser } from '../types';
import { NAMA_BULAN, formatRupiah, getTodayDateStr } from '../utils/formatters';

interface ModalCatatIPLProps {
  isOpen: boolean;
  onClose: () => void;
  wargaList: Warga[];
  iplItems: IPLPaymentItem[];
  preSelectedWarga?: Warga | null;
  preSelectedMonth?: number | null;
  activeYear: number;
  isLoggedIn?: boolean;
  currentUser?: AuthUser | null;
  onSubmit: (data: RecordIPLData) => void;
}

export const ModalCatatIPL: React.FC<ModalCatatIPLProps> = ({
  isOpen,
  onClose,
  wargaList,
  iplItems,
  preSelectedWarga,
  preSelectedMonth,
  activeYear,
  isLoggedIn = false,
  currentUser = null,
  onSubmit,
}) => {
  const isPengurus = Boolean(isLoggedIn && currentUser && currentUser.role !== 'warga');

  const [selectedWargaId, setSelectedWargaId] = useState<string>('');
  const [tahun, setTahun] = useState<number>(activeYear);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [tanggalBayar, setTanggalBayar] = useState<string>(getTodayDateStr());
  const [metode, setMetode] = useState<MetodePembayaran>('Transfer Bank');
  const [diterimaOleh, setDiterimaOleh] = useState<string>(isPengurus ? (currentUser?.roleLabel || 'Bendahara') : 'Warga (Konfirmasi Mandiri)');
  const [catatan, setCatatan] = useState<string>('');

  // Helper to find unpaid months
  const isMonthPaid = (wId: string, yr: number, month: number) => {
    return iplItems.some(
      (item) => item.wargaId === wId && item.tahun === yr && item.bulan === month
    );
  };

  const findFirstUnpaidMonth = (wId: string, yr: number): number | null => {
    for (let m = 1; m <= 12; m++) {
      if (!isMonthPaid(wId, yr, m)) return m;
    }
    return null;
  };

  // Sync when modal opens
  useEffect(() => {
    if (isOpen) {
      setTanggalBayar(getTodayDateStr());
      const defaultWarga =
        preSelectedWarga ||
        wargaList.find((w) => w.statusHunian !== 'Kosong') ||
        wargaList[0];

      if (defaultWarga) {
        setSelectedWargaId(defaultWarga.id);
      }
      setTahun(activeYear);

      if (preSelectedMonth) {
        setSelectedMonths([preSelectedMonth]);
      } else {
        // Auto select sesuai waktu yang berjalan (current running month)
        const currentRunningMonth = new Date().getMonth() + 1;
        if (defaultWarga) {
          const isPaid = isMonthPaid(defaultWarga.id, activeYear, currentRunningMonth);
          if (!isPaid) {
            setSelectedMonths([currentRunningMonth]);
          } else {
            const firstUnpaid = findFirstUnpaidMonth(defaultWarga.id, activeYear);
            setSelectedMonths(firstUnpaid ? [firstUnpaid] : [currentRunningMonth]);
          }
        } else {
          setSelectedMonths([currentRunningMonth]);
        }
      }
    }
  }, [isOpen, preSelectedWarga, preSelectedMonth, activeYear, wargaList]);

  const activeWarga = wargaList.find((w) => w.id === selectedWargaId);

  const toggleMonth = (m: number) => {
    if (!activeWarga) return;
    if (isMonthPaid(activeWarga.id, tahun, m)) return; // Already paid, cannot select

    if (selectedMonths.includes(m)) {
      setSelectedMonths(selectedMonths.filter((x) => x !== m));
    } else {
      setSelectedMonths([...selectedMonths, m].sort((a, b) => a - b));
    }
  };

  const handleSelectQuickRapel = (count: number) => {
    if (!activeWarga) return;
    const unpaid: number[] = [];
    for (let m = 1; m <= 12; m++) {
      if (!isMonthPaid(activeWarga.id, tahun, m)) {
        unpaid.push(m);
        if (unpaid.length === count) break;
      }
    }
    setSelectedMonths(unpaid);
  };

  if (!isOpen || !activeWarga) return null;

  const tarif = activeWarga.tarifIPL || 210000;
  const totalNominal = selectedMonths.length * tarif;
  const isRapel = selectedMonths.length > 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWarga) return;
    if (selectedMonths.length === 0) {
      alert('Pilih minimal 1 bulan untuk pembayaran IPL.');
      return;
    }

    onSubmit({
      warga: activeWarga,
      tahun,
      bulanList: selectedMonths,
      tanggalBayar,
      metode,
      catatan: catatan.trim() || undefined,
      diterimaOleh: isPengurus ? (diterimaOleh.trim() || 'Bendahara') : 'Warga (Konfirmasi Mandiri)',
      status: isPengurus ? 'Lunas' : 'Menunggu Validasi',
      submittedBy: isPengurus ? 'pengurus' : 'warga',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPengurus ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {isPengurus ? <ShieldCheck className="w-4 h-4" /> : <Receipt className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold">
                {isPengurus ? 'Catat Pembayaran IPL (Bendahara)' : 'Konfirmasi Pembayaran IPL Warga'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isPengurus
                  ? 'Status otomatis Lunas & langsung menambah mutasi kas penerimaan'
                  : 'Lapor pembayaran mandiri (Akan diverifikasi & divalidasi oleh Bendahara)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Status Explanation Banner */}
          {isPengurus ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-emerald-950">Mode Bendahara:</span> Pembayaran akan{' '}
                <strong>langsung berstatus Lunas</strong> dan otomatis dicatat ke Buku Kas.
              </div>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-950">Mode Warga (Konfirmasi Mandiri)</p>
                <p className="mt-0.5 text-slate-700">
                  Setelah Anda kirim, data akan tercatat dengan status{' '}
                  <strong className="text-amber-800">Menunggu Validasi</strong> sampai Bendahara
                  memeriksa dan menyetujuinya.
                </p>
              </div>
            </div>
          )}
          {/* Unit / Warga Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Pilih Kavling / Warga:
            </label>
            <select
              value={selectedWargaId}
              onChange={(e) => {
                const newWargaId = e.target.value;
                setSelectedWargaId(newWargaId);
                const currentRunningMonth = new Date().getMonth() + 1;
                const isPaid = isMonthPaid(newWargaId, tahun, currentRunningMonth);
                if (!isPaid) {
                  setSelectedMonths([currentRunningMonth]);
                } else {
                  const first = findFirstUnpaidMonth(newWargaId, tahun);
                  setSelectedMonths(first ? [first] : []);
                }
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            >
              {wargaList.map((w) => {
                const displayStatus =
                  w.statusHunian === 'Tetap' || w.statusHunian === 'Kontrak' || w.statusHunian === 'Dihuni'
                    ? 'Dihuni'
                    : w.statusHunian;
                return (
                  <option key={w.id} value={w.id}>
                    Blok {w.blok} - {w.nama} ({displayStatus}) - {formatRupiah(w.tarifIPL)}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Tahun & Tanggal Bayar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tahun Buku:
              </label>
              <select
                value={tahun}
                onChange={(e) => {
                  const newYear = Number(e.target.value);
                  setTahun(newYear);
                  if (activeWarga) {
                    const currentRunningMonth = new Date().getMonth() + 1;
                    const isPaid = isMonthPaid(activeWarga.id, newYear, currentRunningMonth);
                    if (!isPaid) {
                      setSelectedMonths([currentRunningMonth]);
                    } else {
                      const first = findFirstUnpaidMonth(activeWarga.id, newYear);
                      setSelectedMonths(first ? [first] : []);
                    }
                  } else {
                    setSelectedMonths([]);
                  }
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900"
              >
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tanggal Pembayaran:
              </label>
              <input
                type="date"
                value={tanggalBayar}
                onChange={(e) => setTanggalBayar(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900"
              />
            </div>
          </div>

          {/* Month Checkboxes with Multi-Month / Rapel Support */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-700">
                Pilih Bulan yang Dibayarkan:
              </label>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">Pilih Cepat:</span>
                <button
                  type="button"
                  onClick={() => handleSelectQuickRapel(1)}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-medium"
                >
                  1 Bln
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectQuickRapel(3)}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-medium"
                >
                  3 Bln
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectQuickRapel(6)}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-medium"
                >
                  6 Bln
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectQuickRapel(12)}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-medium"
                >
                  1 Thn
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              {NAMA_BULAN.map((bulanNama, idx) => {
                const monthNum = idx + 1;
                const paid = isMonthPaid(activeWarga.id, tahun, monthNum);
                const isSelected = selectedMonths.includes(monthNum);

                return (
                  <button
                    key={monthNum}
                    type="button"
                    disabled={paid}
                    onClick={() => toggleMonth(monthNum)}
                    className={`p-2 rounded-lg text-left transition-all border flex flex-col justify-between ${paid
                        ? 'bg-slate-200/70 border-slate-300 text-slate-400 cursor-not-allowed'
                        : isSelected
                          ? 'bg-emerald-500 border-emerald-600 text-white shadow-xs font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-400'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono">
                        {String(monthNum).padStart(2, '0')}
                      </span>
                      {paid ? (
                        <CheckCircle2 className="w-3 h-3 text-slate-400" />
                      ) : isSelected ? (
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      ) : null}
                    </div>
                    <div className="text-xs font-semibold mt-1 truncate">
                      {bulanNama}
                    </div>
                    <div className="text-[9px] mt-0.5 opacity-80">
                      {paid ? 'Sudah Lunas' : formatRupiah(tarif)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Metode & PIC Penerima */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Metode Pembayaran:
              </label>
              <select
                value={metode}
                onChange={(e) => setMetode(e.target.value as MetodePembayaran)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900"
              >
                <option value="Transfer Bank">Transfer Bank (BCA / Mandiri / BRI)</option>
                <option value="Tunai / Cash">Tunai / Cash (Langsung ke Bendahara)</option>
                <option value="QRIS">QRIS</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {isPengurus ? 'Diterima Oleh (Bendahara / PIC):' : 'Status Pelaporan:'}
              </label>
              <input
                type="text"
                value={isPengurus ? diterimaOleh : 'Menunggu Validasi Bendahara'}
                onChange={(e) => isPengurus && setDiterimaOleh(e.target.value)}
                readOnly={!isPengurus}
                required
                className={`w-full border rounded-lg px-3 py-2 text-xs font-medium ${isPengurus
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500'
                    : 'bg-amber-50/80 border-amber-200 text-amber-800 cursor-not-allowed font-semibold'
                  }`}
              />
            </div>
          </div>

          {/* Catatan Tambahan */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {isPengurus
                ? 'Catatan / Referensi Transfer (Opsional):'
                : 'Bukti / Keterangan Pembayaran (No. Ref / Nama Pengirim):'}
            </label>
            <input
              type="text"
              placeholder={
                isPengurus
                  ? 'Contoh: Transfer via m-BCA a.n Bpk. Budi, ref #98234'
                  : 'Contoh: Transfer BCA an Irwan Syahputra jam 09:30, ref 8721'
              }
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900"
            />
          </div>

          {/* Calculation Summary Box */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-emerald-800 font-semibold">
                Rincian Pembayaran {isRapel ? '(Rapel Multi-Bulan)' : '(1 Bulan)'}:
              </div>
              <div className="text-xs text-emerald-700 mt-0.5">
                {selectedMonths.length} Bulan x {formatRupiah(tarif)} (Kavling Blok {activeWarga.blok})
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-emerald-800 uppercase font-semibold">
                {isPengurus ? 'Total Setoran Kas:' : 'Total Tagihan:'}
              </div>
              <div className="text-lg font-extrabold text-emerald-900 font-mono">
                {formatRupiah(totalNominal)}
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={selectedMonths.length === 0}
              className={`px-5 py-2 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${isPengurus
                  ? 'bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300'
                  : 'bg-amber-600 hover:bg-amber-500 disabled:bg-slate-300'
                }`}
            >
              {isPengurus ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Pembayaran Lunas ({formatRupiah(totalNominal)})</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Kirim Konfirmasi Bayar ({formatRupiah(totalNominal)})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
