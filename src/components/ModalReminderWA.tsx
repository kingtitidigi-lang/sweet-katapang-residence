import React, { useState } from 'react';
import { X, MessageCircle, Copy, Check, ExternalLink } from 'lucide-react';
import { Warga } from '../types';
import { NAMA_BULAN, formatRupiah, cleanPhoneForWA, generateWATextReminder } from '../utils/formatters';

interface ModalReminderWAProps {
  isOpen: boolean;
  onClose: () => void;
  warga?: Warga | null;
  unpaidMonths: number[];
  selectedYear: number;
}

export const ModalReminderWA: React.FC<ModalReminderWAProps> = ({
  isOpen,
  onClose,
  warga,
  unpaidMonths,
  selectedYear,
}) => {
  const [copied, setCopied] = useState(false);
  const [bankInfo, setBankInfo] = useState('BCA 8730-2219-01 a.n KAS SWEET KATAPANG RESIDENCE');

  if (!isOpen || !warga) return null;

  const monthNames = unpaidMonths.map((m) => NAMA_BULAN[m - 1]).join(', ');
  const totalDue = unpaidMonths.length * (warga.tarifIPL || 210000);

  const rawMessage =
    `*PENGINGAT IURAN IPL SWEET KATAPANG RESIDENCE*\n\n` +
    `Yth. ${warga.nama} (Blok ${warga.blok}),\n` +
    `Semoga Bpk/Ibu dan keluarga senantiasa sehat wal'afiat.\n\n` +
    `Kami dari pengurus menginformasikan terkait tagihan Iuran Pengelolaan Lingkungan (IPL):\n` +
    `🗓 Periode: ${monthNames} ${selectedYear} (${unpaidMonths.length} Bulan)\n` +
    `💰 Total Tagihan: ${formatRupiah(totalDue)}\n\n` +
    `Iuran digunakan untuk operasional satpam keamanan 24 jam, kebersihan/sampah, token listrik PJU fasum, dan pemeliharaan komplek.\n\n` +
    `Pembayaran dapat ditransfer melalui:\n` +
    `🏦 ${bankInfo}\n` +
    `atau tunai kepada Bendahara.\n\n` +
    `Mohon kirimkan bukti transfer setelah pembayaran. Terima kasih banyak atas partisipasi Bpk/Ibu demi lingkungan yang nyaman dan tertata.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(rawMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWA = () => {
    const encoded = encodeURIComponent(rawMessage);
    const phone = cleanPhoneForWA(warga.noHp || '');
    const url = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-green-700 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Kirim Pengingat Tagihan IPL WhatsApp</h3>
              <p className="text-[11px] text-green-100">
                Pesan sopan otomatis untuk warga Blok {warga.blok}
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

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Tagihan Summary */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <div className="font-bold text-amber-900">
                {warga.nama} · Blok {warga.blok}
              </div>
              <div className="text-[11px] text-amber-800 mt-0.5">
                Belum lunas: <span className="font-semibold">{monthNames}</span> ({unpaidMonths.length} bulan)
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-amber-700 font-semibold uppercase">Total Tagihan:</div>
              <div className="text-base font-extrabold text-amber-950 font-mono">
                {formatRupiah(totalDue)}
              </div>
            </div>
          </div>

          {/* Rekening Form */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Rekening Tujuan Transfer:
            </label>
            <input
              type="text"
              value={bankInfo}
              onChange={(e) => setBankInfo(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900"
            />
          </div>

          {/* Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">
                Pratinjau Pesan WhatsApp:
              </label>
              <button
                onClick={handleCopy}
                className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Salin Teks</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-[11px] leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap border border-slate-800">
              {rawMessage}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleOpenWA}
              className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka WhatsApp Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
