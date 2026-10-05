import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Phone,
  Edit2,
  Trash2,
  Home,
  Download,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { Warga } from '../types';
import { formatRupiah, cleanPhoneForWA } from '../utils/formatters';

interface WargaMasterViewProps {
  wargaList: Warga[];
  isLoggedIn?: boolean;
  onOpenAddModal: () => void;
  onOpenEditModal: (warga: Warga) => void;
  onDeleteWarga: (id: string) => void;
  onRequireLogin?: () => void;
}

export const WargaMasterView: React.FC<WargaMasterViewProps> = ({
  wargaList,
  isLoggedIn = false,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteWarga,
  onRequireLogin,
}) => {
  if (!isLoggedIn) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-sm max-w-md mx-auto my-12">
        <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">Akses Khusus Pengurus RT</h3>
        <p className="text-xs text-slate-500 mb-5 leading-relaxed">
          Master data warga dan kavling SWEET KATAPANG RESIDENCE dilindungi dan hanya dapat diakses oleh Pengurus atau Bendahara RT.
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
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [blokFilter, setBlokFilter] = useState('ALL');

  // Blocks
  const blockLetters = useMemo(() => {
    const set = new Set<string>();
    wargaList.forEach((w) => set.add(w.blok.charAt(0).toUpperCase()));
    return Array.from(set).sort();
  }, [wargaList]);

  // Filtered list
  const filteredList = useMemo(() => {
    return wargaList.filter((w) => {
      const matchSearch =
        w.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.blok.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.noHp.includes(searchTerm);

      const matchStatus = statusFilter === 'ALL' || w.statusHunian === statusFilter;
      const matchBlok =
        blokFilter === 'ALL' || w.blok.toUpperCase().startsWith(blokFilter);

      return matchSearch && matchStatus && matchBlok;
    });
  }, [wargaList, searchTerm, statusFilter, blokFilter]);

  const handleExportCSV = () => {
    let csv = 'ID,Blok,Nama Warga,Status Hunian,No HP/WhatsApp,Tarif IPL (IDR),Keterangan\n';
    wargaList.forEach((w) => {
      csv += `"${w.id}","${w.blok}","${w.nama}","${w.statusHunian}","${w.noHp}",${w.tarifIPL},"${(w.keterangan || '').replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Master_Data_Warga_RT04.csv`;
    link.click();
  };

  const countTetap = wargaList.filter((w) => w.statusHunian === 'Tetap').length;
  const countKontrak = wargaList.filter((w) => w.statusHunian === 'Kontrak').length;
  const countKosong = wargaList.filter((w) => w.statusHunian === 'Kosong').length;

  return (
    <div className="space-y-6">
      {/* Top Banner and Quick Summary */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Master Data Warga & Kavling Komplek
            </h2>
            <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-700">
              {wargaList.length} Unit Kavling
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengelolaan kepemilikan kavling, status hunian tetap/kontrak/kosong, dan pengaturan tarif IPL.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Tambah Warga / Kavling</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1.5 rounded-lg text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Total Kavling</div>
            <div className="text-lg font-bold text-slate-900 font-mono">
              {wargaList.length} Unit
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Warga Tetap</div>
            <div className="text-lg font-bold text-emerald-700 font-mono">
              {countTetap} Unit
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Warga Kontrak</div>
            <div className="text-lg font-bold text-blue-700 font-mono">
              {countKontrak} Unit
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Kavling Kosong</div>
            <div className="text-lg font-bold text-amber-700 font-mono">
              {countKosong} Unit
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari Blok, Nama Warga, atau Nomor HP WhatsApp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        {/* Blok Filter */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Blok:</span>
          <select
            value={blokFilter}
            onChange={(e) => setBlokFilter(e.target.value)}
            aria-label="Filter Blok"
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Blok</option>
            {blockLetters.map((b) => (
              <option key={b} value={b}>
                Blok {b}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter Status Hunian"
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="Tetap">Tetap</option>
            <option value="Kontrak">Kontrak</option>
            <option value="Kosong">Kosong</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold text-[11px]">
                <th className="py-3 px-4 w-24">Nomor Blok</th>
                <th className="py-3 px-4 min-w-[180px]">Nama Lengkap Warga</th>
                <th className="py-3 px-4 w-32">Status Hunian</th>
                <th className="py-3 px-4 w-40">Kontak WhatsApp</th>
                <th className="py-3 px-4 text-right w-32">Tarif IPL / Bulan</th>
                <th className="py-3 px-4 min-w-[160px]">Catatan / Keterangan</th>
                <th className="py-3 px-4 text-center w-24">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredList.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {w.blok}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{w.nama}</div>
                    <div className="text-[10px] text-slate-400 font-mono">ID: {w.id}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${w.statusHunian === 'Tetap'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : w.statusHunian === 'Kontrak'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                    >
                      {w.statusHunian}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {w.noHp ? (
                      <a
                        href={`https://wa.me/${cleanPhoneForWA(w.noHp)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-slate-700 hover:text-emerald-700 font-mono transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{w.noHp}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                      </a>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {formatRupiah(w.tarifIPL)}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">
                    {w.keterangan || '-'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onOpenEditModal(w)}
                        title="Edit Data Warga"
                        className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteWarga(w.id)}
                        title="Hapus Warga"
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ditemukan warga yang sesuai dengan pencarian.
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
