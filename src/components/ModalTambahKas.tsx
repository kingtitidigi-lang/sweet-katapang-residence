import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';
import { TipeTransaksi, KategoriKas, KategoriPemasukan, KategoriPengeluaran } from '../types';
import { formatRupiah, getTodayDateStr } from '../utils/formatters';

interface ModalTambahKasProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: TipeTransaksi;
  onSubmit: (data: {
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

  // Reset when initialType or isOpen changes
  React.useEffect(() => {
    if (isOpen) {
      setTipe(initialType);
      setKategori(initialType === 'PEMASUKAN' ? 'Donasi Warga' : 'Keamanan / Satpam');
      setTanggal(getTodayDateStr());
      setNominal('');
      setDeskripsi('');
    }
  }, [initialType, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedNominal = parseFloat(nominal.replace(/[^0-9]/g, ''));
    if (isNaN(parsedNominal) || parsedNominal <= 0) {
      alert('Masukkan nominal kas yang valid.');
      return;
    }

    onSubmit({
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
          className={`px-5 py-4 flex items-center justify-between text-white ${tipe === 'PEMASUKAN' ? 'bg-emerald-700' : 'bg-rose-700'
            }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              {tipe === 'PEMASUKAN' ? (
                <TrendingUp className="w-4 h-4 text-white" />
              ) : (
                <TrendingDown className="w-4 h-4 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold">
                {tipe === 'PEMASUKAN' ? 'Catat Pemasukan Kas' : 'Catat Biaya Pengeluaran'}
              </h3>
              <p className="text-[11px] text-white/80">
                Mutasi otomatis memperbarui buku kas & saldo berjalan komplek
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
                <option value="Transfer Bank">Rekening Bank RT</option>
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
              className={`px-5 py-2 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${tipe === 'PEMASUKAN'
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-rose-600 hover:bg-rose-500'
                }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan ke Jurnal Buku Kas</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
