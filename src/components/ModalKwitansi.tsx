import React from 'react';
import { X, Printer, Share2, CheckCircle2, Building2 } from 'lucide-react';
import { IPLPaymentItem, IPLTransaction } from '../types';
import { formatRupiah, formatTanggalIndo, NAMA_BULAN, cleanPhoneForWA, generateWATextKwitansi } from '../utils/formatters';

interface ModalKwitansiProps {
  isOpen: boolean;
  onClose: () => void;
  item?: IPLPaymentItem | null;
  parentTx?: IPLTransaction | null;
  wargaPhone?: string;
}

export const ModalKwitansi: React.FC<ModalKwitansiProps> = ({
  isOpen,
  onClose,
  item,
  parentTx,
  wargaPhone,
}) => {
  if (!isOpen || !item) return null;

  const handlePrint = () => {
    window.print();
  };

  const kwitansiNo =
    item.buktiRef ||
    `KWT/${item.tahun}/${String(item.bulan).padStart(2, '0')}/${item.blok}`;

  // If this item was paid as part of a rapel transaction, show full rapel details
  const isRapel = item.isRapel && parentTx && parentTx.bulanList.length > 1;
  const displayMonths = isRapel
    ? parentTx.bulanList.map((m) => NAMA_BULAN[m - 1]).join(', ')
    : NAMA_BULAN[item.bulan - 1];

  const totalNominal = isRapel ? parentTx.totalNominal : item.nominal;

  const handleSendWA = () => {
    const waText = generateWATextKwitansi({
      nama: item.nama,
      blok: item.blok,
      bulanStr: displayMonths,
      tahun: item.tahun,
      nominal: totalNominal,
      tanggal: item.tanggalBayar,
      kwitansiNo,
      metode: item.metode,
    });

    const phone = cleanPhoneForWA(wargaPhone || '');
    const waUrl = phone ? `https://wa.me/${phone}?text=${waText}` : `https://wa.me/?text=${waText}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Top Control Bar (Hidden on print) */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 font-mono">
              {kwitansiNo}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSendWA}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Kirim WhatsApp</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Kwitansi Body (Printable Area) */}
        <div className="p-6 text-slate-800 space-y-4">
          {/* Header Surat Kwitansi */}
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-950 uppercase tracking-tight">
                  SWEET KATAPANG RESIDENCE
                </h3>
                <p className="text-[10px] text-slate-600">
                  Komplek Perumahan SWEET KATAPANG RESIDENCE
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono text-slate-500">NO. BUKTI:</div>
              <div className="text-xs font-extrabold font-mono text-slate-900">
                {kwitansiNo}
              </div>
            </div>
          </div>

          <div className="text-center py-1">
            <span className="text-sm font-extrabold tracking-wide uppercase border-b-2 border-slate-900 pb-0.5">
              BUKTI PENERIMAAN IURAN IPL
            </span>
          </div>

          {/* Details Table */}
          <div className="space-y-2 text-xs border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-500 font-medium">Telah Diterima Dari:</span>
              <span className="col-span-2 font-bold text-slate-900">
                {item.nama} (Blok {item.blok})
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-500 font-medium">Periode Pembayaran:</span>
              <span className="col-span-2 font-bold text-slate-900">
                {displayMonths} {item.tahun}
                {isRapel && (
                  <span className="ml-1 text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                    Bayar Rapel {parentTx.bulanList.length} Bulan
                  </span>
                )}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-500 font-medium">Tanggal Transaksi:</span>
              <span className="col-span-2 text-slate-800 font-mono">
                {formatTanggalIndo(item.tanggalBayar)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-500 font-medium">Metode Pembayaran:</span>
              <span className="col-span-2 text-slate-800">
                {item.metode}
              </span>
            </div>

            {parentTx?.keterangan && (
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-medium">Catatan:</span>
                <span className="col-span-2 text-slate-600 italic">
                  {parentTx.keterangan}
                </span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
              <span className="text-slate-700 font-bold self-center">Jumlah Pembayaran:</span>
              <span className="col-span-2 text-lg font-extrabold font-mono text-emerald-700">
                {formatRupiah(totalNominal)}
              </span>
            </div>
          </div>

          {/* Stamp and Signatures */}
          <div className="pt-3 grid grid-cols-2 gap-4 text-center text-xs">
            <div>
              <div className="text-[10px] text-slate-500">Warga Pembayar,</div>
              <div className="h-12 flex items-center justify-center text-slate-400 font-serif italic text-xs">
                (Telah Terverifikasi)
              </div>
              <div className="font-semibold text-slate-900 border-t border-slate-300 pt-1">
                {item.nama}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500">Bendahara Penerima,</div>
              <div className="h-12 flex items-center justify-center">
                <div className="border border-emerald-600/40 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>LUNAS VALID</span>
                </div>
              </div>
              <div className="font-semibold text-slate-900 border-t border-slate-300 pt-1">
                {parentTx?.diterimaOleh || 'Bendahara RT'}
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-2 text-[10px] text-slate-400 text-center">
            Dokumen ini merupakan bukti sah pencatatan kas SWEET KATAPANG RESIDENCE.
          </div>
        </div>
      </div>
    </div>
  );
};
