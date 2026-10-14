import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, CheckCircle2, Edit3, AlertCircle } from 'lucide-react';
import { TipeTransaksi, KategoriKas, KategoriPemasukan, KategoriPengeluaran, KasTransaction } from '../types';
import { formatRupiah, getTodayDateStr } from '../utils/formatters';

interface ModalTambahKasProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: TipeTransaksi;
  kasToEdit?: KasTransaction | null;
  onSubmit: (data: {
    id?: string;
    tipe: TipeTransaksi;
    kategori: KategoriKas;
    nominal: number;
    tanggal: string;
    deskripsi: string;
    metode: 'Transfer Bank' | 'Tunai / Cash';
    penanggungJawab: string;
  }) => void;
}

const KATEGORI_PEMASUKAN: KategoriPemasukan[] = [
  'Saldo Awal',
  'Donasi Warga',
  'Sewa Balai & Lapangan',
  'Bunga Bank / Lainnya',
  'Iuran IPL',
];

const KATEGORI_PENGELUARAN: KategoriPengeluaran[] = [
  'Keamanan / Satpam',
  'Kebersihan / Sampah',
  'Listrik PJU & Fasum',
  'Perbaikan & Maintenance',
  'Operasional & ATK',
  'Kegiatan & Sosial Warga',
];

export const ModalTambahKas: React.FC<ModalTambahKasProps> = ({
  isOpen,
  onClose,
  initialType = 'PENGELUARAN',
  kasToEdit = null,
  onSubmit,
}) => {
  const [tipe, setTipe] = useState<TipeTransaksi>(initialType);
  const [kategori, setKategori] = useState<KategoriKas>(
    initialType === 'PEMASUKAN' ? 'Donasi Warga' : 'Keamanan / Satpam'
  );
  const [nominal, setNominal] = useState<string>('');
  const [tanggal, setTanggal] = useState<string>(getTodayDateStr());
  const [deskripsi, setDeskripsi] = useState<string>('');
  const [metode, setMetode] = useState<'Transfer Bank' | 'Tunai / Cash'>('Transfer Bank');
  const [penanggungJawab, setPenanggungJawab] = useState<string>('Bendahara');

  // Reset or fill when initialType, kasToEdit or isOpen changes
  useEffect(() => {
    if (isOpen) {
      if (kasToEdit) {
        setTipe(kasToEdit.tipe);
        setKategori(kasToEdit.kategori);
        setTanggal(kasToEdit.tanggal);
        setNominal(String(kasToEdit.nominal));
        setDeskripsi(kasToEdit.deskripsi);
        setMetode(
          kasToEdit.metode === 'Tunai / Cash' ? 'Tunai / Cash' : 'Transfer Bank'
        );
        setPenanggungJawab(kasToEdit.penanggungJawab || 'Bendahara');
      } else {
        setTipe(initialType);
        setKategori(initialType === 'PEMASUKAN' ? 'Donasi Warga' : 'Keamanan / Satpam');
        setTanggal(getTodayDateStr());
        setNominal('');
        setDeskripsi('');
        setMetode('Transfer Bank');
        setPenanggungJawab('Bendahara');
      }
    }
  }, [initialType, isOpen, kasToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedNominal = parseFloat(nominal.replace(/[^0-9]/g, ''));
    if (isNaN(parsedNominal) || parsedNominal <= 0) {
      alert('Masukkan nominal kas yang valid.');
      return;
    }

    onSubmit({
      id: kasToEdit ? kasToEdit.id : undefined,
      tipe,
      kategori,
      nominal: parsedNominal,
      tanggal,
      deskripsi,
      metode,
      penanggungJawab,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div
          className={`px-5 py-4 flex items-center justify-between text-white ${
            kasToEdit
              ? 'bg-slate-900 border-b border-slate-800'
              : tipe === 'PEMASUKAN'
              ? 'bg-emerald-700'
              : 'bg-rose-700'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              kasToEdit ? 'bg-blue-500/20 text-blue-400' : 'bg-white/20 text-white'
            }`}>
              {kasToEdit ? (
                <Edit3 className="w-4 h-4" />
              ) : tipe === 'PEMASUKAN' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold">
                {kasToEdit
                  ? `Edit Transaksi Mutasi Kas (#${kasToEdit.id})`
                  : tipe === 'PEMASUKAN'
                  ? 'Catat Pemasukan Kas'
                  : 'Catat Biaya Pengeluaran'}
              </h3>
              <p className="text-[11px] text-white/80">
                {kasToEdit
                  ? 'Perbarui rincian transaksi kas untuk menyesuaikan jurnal & saldo buku kas'
                  : 'Mutasi otomatis memperbarui buku kas & saldo berjalan komplek'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Notification for IPL linked mutation */}
          {kasToEdit?.refId && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Transaksi Pembayaran IPL Warga:</span> Mutasi ini terhubung dengan setoran IPL. Mengubah nominal atau rincian di sini akan memperbarui catatan di Jurnal Buku Kas.
              </div>
            </div>
          )}
          {/* Tipe Selector Switch */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Jenis Transaksi:
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setTipe('PEMASUKAN');
                  setKategori('Donasi Warga');
                }}
                className={`py-2 rounded-lg font-bold transition-all text-xs flex items-center justify-center gap-1.5 ${tipe === 'PEMASUKAN'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Pemasukan (+)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTipe('PENGELUARAN');
                  setKategori('Keamanan / Satpam');
                }}
                className={`py-2 rounded-lg font-bold transition-all text-xs flex items-center justify-center gap-1.5 ${tipe === 'PENGELUARAN'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Pengeluaran (-)</span>
              </button>
            </div>
          </div>

          {/* Pos Kategori */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Pos Kategori Anggaran:
            </label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value as KategoriKas)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900"
            >
              {tipe === 'PEMASUKAN'
                ? KATEGORI_PEMASUKAN.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))
                : KATEGORI_PENGELUARAN.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
            </select>
          </div>

          {/* Tanggal & Nominal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tanggal Mutasi:
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nominal (Rupiah):
              </label>
              <input
                type="number"
                placeholder="misal: 1500000"
                value={nominal}
                onChange={(e) => setNominal(e.target.value)}
                required
                min={1}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Uraian / Keterangan Transaksi */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Uraian Lengkap / Deskripsi Bukti:
            </label>
            <textarea
              rows={2}
              placeholder={
                tipe === 'PEMASUKAN'
                  ? 'Contoh: Donasi swadaya warga Blok B untuk penataan taman fasum'
                  : 'Contoh: Honor 2 petugas satpam komplek shift pagi & malam'
              }
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900"
            />
          </div>

          {/* Metode Kas & Penanggung Jawab */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Arus Kas Melalui:
              </label>
              <select
                value={metode}
                onChange={(e) => setMetode(e.target.value as 'Transfer Bank' | 'Tunai / Cash')}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900"
              >
                <option value="Transfer Bank">Rekening Bank Lingkungan</option>
                <option value="Tunai / Cash">Kas Tunai / Fisik</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Penanggung Jawab / Pengaju:
              </label>
              <input
                type="text"
                value={penanggungJawab}
                onChange={(e) => setPenanggungJawab(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900"
              />
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
              className={`px-5 py-2 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${
                kasToEdit
                  ? 'bg-blue-600 hover:bg-blue-500'
                  : tipe === 'PEMASUKAN'
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-rose-600 hover:bg-rose-500'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{kasToEdit ? 'Simpan Perubahan Transaksi' : 'Simpan ke Jurnal Buku Kas'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
