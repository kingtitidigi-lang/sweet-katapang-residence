import React, { useState, useEffect } from 'react';
import { X, UserPlus, Edit2, CheckCircle2 } from 'lucide-react';
import { Warga, StatusHunian } from '../types';

interface ModalWargaProps {
  isOpen: boolean;
  onClose: () => void;
  wargaToEdit?: Warga | null;
  onSubmit: (data: Omit<Warga, 'id' | 'createdAt'> & { id?: string }) => void;
}

export const ModalWarga: React.FC<ModalWargaProps> = ({
  isOpen,
  onClose,
  wargaToEdit,
  onSubmit,
}) => {
  const [blok, setBlok] = useState('');
  const [nama, setNama] = useState('');
  const [statusHunian, setStatusHunian] = useState<StatusHunian>('Dihuni');
  const [noHp, setNoHp] = useState('');
  const [tarifIPL, setTarifIPL] = useState<number>(210000);
  const [keterangan, setKeterangan] = useState('');

  useEffect(() => {
    if (wargaToEdit) {
      setBlok(wargaToEdit.blok);
      setNama(wargaToEdit.nama);
      setStatusHunian(wargaToEdit.statusHunian || 'Dihuni');
      setNoHp(wargaToEdit.noHp || '');
      setTarifIPL(wargaToEdit.tarifIPL || 210000);
      setKeterangan(wargaToEdit.keterangan || '');
    } else {
      setBlok('');
      setNama('');
      setStatusHunian('Dihuni');
      setNoHp('');
      setTarifIPL(210000);
      setKeterangan('');
    }
  }, [wargaToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blok.trim() || !nama.trim()) {
      alert('Nomor Blok dan Nama Warga wajib diisi.');
      return;
    }

    onSubmit({
      id: wargaToEdit ? wargaToEdit.id : undefined,
      blok: blok.toUpperCase().trim(),
      nama: nama.trim(),
      statusHunian,
      noHp: noHp.trim(),
      tarifIPL: Number(tarifIPL),
      keterangan: keterangan.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              {wargaToEdit ? <Edit2 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold">
                {wargaToEdit ? 'Edit Data Warga & Kavling' : 'Tambah Warga / Kavling Baru'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Master data acuan iuran IPL dan kontak warga
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
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nomor Blok:
              </label>
              <input
                type="text"
                placeholder="Contoh: A01, B12"
                value={blok}
                onChange={(e) => setBlok(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Status Hunian:
              </label>
              <select
                value={statusHunian}
                onChange={(e) => setStatusHunian(e.target.value as StatusHunian)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold"
              >
                <option value="Dihuni">Dihuni</option>
                <option value="Tetap">Tetap (Dihuni)</option>
                <option value="Kontrak">Kontrak (Dihuni)</option>
                <option value="Kosong">Kosong (Belum Dihuni)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nama Lengkap Warga / Penghuni:
            </label>
            <input
              type="text"
              placeholder="Contoh: Bpk. Budi Santoso"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                No. HP / WhatsApp:
              </label>
              <input
                type="text"
                placeholder="Contoh: 081234567890"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tarif IPL / Bulan:
              </label>
              <input
                type="number"
                value={tarifIPL}
                onChange={(e) => setTarifIPL(Number(e.target.value))}
                required
                min={0}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Keterangan / Catatan Tambahan:
            </label>
            <input
              type="text"
              placeholder="Contoh: Pengurus, seksi keamanan, rumah sewa"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{wargaToEdit ? 'Perbarui Data Warga' : 'Simpan Warga Baru'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
