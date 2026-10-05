import React, { useState } from 'react';
import {
    FileSpreadsheet,
    Download,
    Copy,
    Check,
    Smartphone,
    BarChart3,
    Code2,
    ExternalLink,
    Table,
    Sparkles,
    ArrowRight,
    ShieldCheck,
    CheckCircle2,
} from 'lucide-react';

export const GoogleSheetsOptionView: React.FC = () => {
    const [activeSheetTab, setActiveSheetTab] = useState<'warga' | 'transaksi' | 'kas' | 'matriks' | 'script'>('warga');
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const handleCopy = (key: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const downloadFile = (filename: string, content: string, mime: string = 'text/csv;charset=utf-8;') => {
        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
    };

    const csvMasterWarga = `ID_Warga,Blok,Nama_Warga,Status_Hunian,No_WhatsApp,Tarif_IPL,Keterangan
W-01,A01,Teh Keny,Tetap,081234567801,210000,
W-02,A02,Bu Suhartati,Tetap,081234567802,210000,
W-03,A05,Pa Harry,Tetap,081234567805,210000,
W-04,A07,Pa Jajang,Tetap,081234567807,210000,
W-05,A08,Pa Teja,Tetap,081234567808,210000,
W-06,A09,Bu cucu,Tetap,081234567809,210000,
W-07,A10,Pa Mondi,Tetap,081234567810,210000,
W-08,A11,Pa Sidik,Tetap,081234567811,210000,
W-09,A12,Pa Iyan,Tetap,081234567812,210000,
W-10,A15,Th Dillah,Tetap,081234567815,210000,
W-11,A16,Rosa,Tetap,081234567816,210000,
W-12,A18,Pa Riki,Tetap,081234567818,210000,
W-13,B01,Teh Martha,Tetap,081234567821,210000,
W-14,B02,Pa Ghani,Tetap,081234567822,210000,
W-15,B03,BPK Penabur,Tetap,081234567823,210000,
W-16,C01,Pa Farid,Tetap,081234567831,210000,
W-17,C03,Pa Sahid,Tetap,081234567833,210000,
W-18,C05,Pa Bakti,Tetap,081234567835,210000,
W-19,C06,Pa Afif,Tetap,081234567836,210000,
W-20,C07,Pa Encep,Tetap,081234567837,210000,
W-21,C08,Pa dede,Tetap,081234567838,210000,
W-22,C09,Pa Alfin,Tetap,081234567839,210000,
W-23,C10,Teh Dewi,Tetap,081234567840,210000,
W-24,C11,Pa Tio,Tetap,081234567841,210000,
W-25,C12,Pa wim,Tetap,081234567842,210000,
W-26,C15,Teh Niknik,Tetap,081234567845,210000,
W-27,C16,Th Wida,Kontrak,081234567846,210000,Kontrak
W-28,C17,Th Ria,Kontrak,081234567847,210000,Kontrak
W-29,ZA03,A3,Kosong,,210000,Kavling Kosong A3
W-30,ZA06,A6,Kosong,,210000,Kavling Kosong A6
W-31,ZC02,C2,Kosong,,210000,Kavling Kosong C2`;

    const csvTransaksiIPL = `ID_Transaksi,Tanggal_Bayar,Blok,Nama_Warga,Tahun,Bulan_Mulai,Bulan_Selesai,Jumlah_Bulan,Tarif_Per_Bulan,Total_Nominal,Metode,Status,Catatan
TX-2026-001,2026-01-03,A01,Bpk. Budi Santoso,2026,1,6,6,210000,1260000,Transfer Bank,Lunas,Rapel Semester 1 (Jan - Jun)
TX-2026-002,2026-01-04,A02,Ibu Ratna Dewi,2026,1,12,12,210000,2520000,Transfer Bank,Lunas,Lunas 1 Tahun Penuh 2026
TX-2026-003,2026-01-05,A03,Bpk. Irwan Syahputra,2026,1,1,1,210000,210000,QRIS RT,Lunas,IPL Januari 2026
TX-2026-004,2026-01-07,A05,Bpk. Hendra Gunawan,2026,1,3,3,210000,630000,Transfer Bank,Lunas,Rapel Triwulan 1 (Jan - Mar)
TX-2026-005,2026-01-10,A06,Ibu Siti Rahmawati,2026,1,1,1,210000,210000,Tunai / Cash,Lunas,IPL Januari 2026
TX-2026-006,2026-01-02,B01,Bpk. Agus Prasetyo,2026,1,3,3,210000,630000,Transfer Bank,Lunas,Rapel Jan - Mar
TX-2026-007,2026-01-08,B02,Ibu Maya Indah,2026,1,1,1,210000,210000,Transfer Bank,Lunas,IPL Januari 2026
TX-2026-008,2026-01-09,B03,Bpk. Anton Nugroho,2026,1,2,2,210000,420000,QRIS RT,Lunas,Rapel Jan - Feb
TX-2026-009,2026-01-06,C01,Bpk. Wawan Kurniawan,2026,1,4,4,210000,840000,Transfer Bank,Lunas,Rapel 4 Bulan (Jan - Apr)
TX-2026-010,2026-02-04,A03,Bpk. Irwan Syahputra,2026,2,2,1,210000,210000,QRIS RT,Lunas,IPL Februari 2026
TX-2026-011,2026-02-09,A06,Ibu Siti Rahmawati,2026,2,2,1,210000,210000,Tunai / Cash,Lunas,IPL Februari 2026`;

    const csvBukuKas = `Tanggal,Tipe,Kategori,Uraian_Transaksi,Masuk,Keluar,Saldo_Berjalan,Metode,Penanggung_Jawab,Ref_Transaksi
2026-01-01,Pemasukan,Saldo Awal,Saldo kas tutup buku kas RT tahun 2025,14500000,0,14500000,Transfer Bank,Ibu Ratna Dewi (Bendahara),SALDO-2025
2026-01-02,Pemasukan,Iuran IPL,IPL Blok B01 - Bpk. Agus Prasetyo (Rapel Jan - Mar),630000,0,15130000,Transfer Bank,Ibu Ratna Dewi (Bendahara),TX-2026-006
2026-01-03,Pemasukan,Iuran IPL,IPL Blok A01 - Bpk. Budi Santoso (Rapel 6 Bulan Jan - Jun),1260000,0,16390000,Transfer Bank,Ibu Ratna Dewi (Bendahara),TX-2026-001
2026-01-04,Pemasukan,Iuran IPL,IPL Blok A02 - Ibu Ratna Dewi (Lunas 1 Tahun Penuh 2026),2520000,0,18910000,Transfer Bank,Ibu Ratna Dewi (Bendahara),TX-2026-002
2026-01-05,Pemasukan,Iuran IPL,IPL Blok A03 - Bpk. Irwan Syahputra (Januari 2026),210000,0,19120000,QRIS RT,Ibu Ratna Dewi (Bendahara),TX-2026-003
2026-01-05,Pengeluaran,Keamanan / Satpam,Honor Gaji 2 Petugas Satpam Komplek Periode Januari 2026,0,4500000,14620000,Transfer Bank,Bpk. Agus Prasetyo (Keamanan),OPR-001
2026-01-06,Pemasukan,Iuran IPL,IPL Blok C01 - Bpk. Wawan Kurniawan (Rapel Jan - Apr),840000,0,15460000,Transfer Bank,Ibu Ratna Dewi (Bendahara),TX-2026-009
2026-01-06,Pengeluaran,Kebersihan / Sampah,Retribusi Armada Truk Sampah DLH & Upah Petugas Jan 2026,0,1800000,13660000,Transfer Bank,Ibu Ratna Dewi (Bendahara),OPR-002
2026-01-07,Pemasukan,Iuran IPL,IPL Blok A05 - Bpk. Hendra Gunawan (Rapel Triwulan 1),630000,0,14290000,Transfer Bank,Ibu Ratna Dewi (Bendahara),TX-2026-004
2026-01-08,Pemasukan,Iuran IPL,IPL Blok B02 - Ibu Maya Indah (Januari 2026),210000,0,14500000,Transfer Bank,Ibu Ratna Dewi (Bendahara),TX-2026-007
2026-01-08,Pengeluaran,Listrik PJU & Fasum,Token Listrik Lampu Jalan Komplek & Pompa Air Taman Fasum,0,685000,13815000,Transfer Bank,Bpk. Budi Santoso (Ketua RT),OPR-003
2026-01-09,Pemasukan,Iuran IPL,IPL Blok B03 - Bpk. Anton Nugroho (Rapel Jan - Feb),420000,0,14235000,QRIS RT,Ibu Ratna Dewi (Bendahara),TX-2026-008
2026-01-10,Pemasukan,Iuran IPL,IPL Blok A06 - Ibu Siti Rahmawati (Januari 2026),210000,0,14445000,Tunai / Cash,Ibu Ratna Dewi (Bendahara),TX-2026-005
2026-01-14,Pemasukan,Donasi Warga,Donasi swadaya warga Blok A untuk penanaman tabebuya fasum,1500000,0,15945000,Transfer Bank,Ibu Ratna Dewi (Bendahara),DON-001
2026-01-20,Pengeluaran,Perbaikan & Maintenance,Service motor palang gerbang otomatis & ganti kabel sensor,0,750000,15195000,Tunai / Cash,Bpk. Agus Prasetyo (Keamanan),OPR-004
2026-02-04,Pemasukan,Iuran IPL,IPL Blok A03 - Bpk. Irwan Syahputra (Februari 2026),210000,0,15405000,QRIS RT,Ibu Ratna Dewi (Bendahara),TX-2026-010
2026-02-05,Pengeluaran,Keamanan / Satpam,Honor Gaji 2 Petugas Satpam Komplek Periode Februari 2026,0,4500000,10905000,Transfer Bank,Bpk. Agus Prasetyo (Keamanan),OPR-005
2026-02-07,Pengeluaran,Kebersihan / Sampah,Iuran Retribusi Truk Sampah Februari 2026,0,1800000,9105000,Transfer Bank,Ibu Ratna Dewi (Bendahara),OPR-006
2026-02-09,Pemasukan,Iuran IPL,IPL Blok A06 - Ibu Siti Rahmawati (Februari 2026),210000,0,9315000,Tunai / Cash,Ibu Ratna Dewi (Bendahara),TX-2026-011
2026-02-10,Pengeluaran,Listrik PJU & Fasum,Token Listrik PJU Lampu Jalan & Pos Satpam Feb 2026,0,620000,8695000,Transfer Bank,Bpk. Budi Santoso (Ketua RT),OPR-007
2026-02-15,Pengeluaran,Operasional RT & ATK,Kertas HVS Tinta Print Laporan Amplop & Buku Kas,0,280000,8415000,Tunai / Cash,Ibu Ratna Dewi (Bendahara),OPR-008`;

    const appsScriptCode = `function onOpen() {
  SpreadsheetApp.getUi().createMenu('⚙️ Keuangan RT 04')
    .addItem('🔄 Hitung Ulang Saldo Kas', 'hitungUlangSaldoKas')
    .addItem('📋 Buka Matriks Pembayaran', 'bukaSheetMatriks')
    .addToUi();
}

function onEdit(e) {
  if (!e || !e.range) return;
  const sheet = e.source.getActiveSheet();
  const range = e.range;
  
  if (sheet.getName() === 'Transaksi_IPL' && range.getColumn() === 12 && range.getValue() === 'Lunas') {
    const row = range.getRow();
    const tgl = sheet.getRange(row, 2).getValue();
    const blok = sheet.getRange(row, 3).getValue();
    const nama = sheet.getRange(row, 4).getValue();
    const blnAwal = sheet.getRange(row, 6).getValue();
    const blnAkhir = sheet.getRange(row, 7).getValue();
    const totalNominal = sheet.getRange(row, 10).getValue();
    const metode = sheet.getRange(row, 11).getValue();
    const refId = sheet.getRange(row, 1).getValue();
    
    const kasSheet = e.source.getSheetByName('Buku_Kas');
    if (!kasSheet) return;
    
    // Cegah duplikasi
    const existing = kasSheet.getDataRange().getValues();
    for (let i = 1; i < existing.length; i++) {
      if (existing[i][9] === refId) return;
    }
    
    const uraian = 'IPL Blok ' + blok + ' - ' + nama + ' (' + (blnAwal === blnAkhir ? 'Bulan ' + blnAwal : 'Rapel ' + blnAwal + ' s/d ' + blnAkhir) + ')';
    const lastRow = kasSheet.getLastRow();
    const prevSaldo = lastRow > 1 ? Number(kasSheet.getRange(lastRow, 7).getValue()) || 0 : 0;
    
    kasSheet.appendRow([tgl, 'Pemasukan', 'Iuran IPL', uraian, totalNominal, 0, prevSaldo + Number(totalNominal), metode, 'Bendahara RT', refId]);
    SpreadsheetApp.getActiveSpreadsheet().toast('Otomatis dicatat ke Buku Kas!', 'Berhasil ✅', 4);
  }
}

function hitungUlangSaldoKas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Buku_Kas');
  if (!sheet) return;
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const range = sheet.getRange(2, 1, lastRow - 1, 10);
  const values = range.getValues();
  let currentSaldo = 0;
  for (let i = 0; i < values.length; i++) {
    currentSaldo += (Number(values[i][4]) || 0) - (Number(values[i][5]) || 0);
    values[i][6] = currentSaldo;
  }
  sheet.getRange(2, 1, values.length, 10).setValues(values);
  ss.toast('Saldo kas diperbarui: Rp ' + currentSaldo.toLocaleString('id-ID'), 'Selesai 💰', 4);
}

function bukaSheetMatriks() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const m = ss.getSheetByName('Matriks_Bulanan');
  if (m) ss.setActiveSheet(m);
}`;

    const handleDownloadAll = () => {
        downloadFile('Master_Warga.csv', csvMasterWarga);
        setTimeout(() => downloadFile('Transaksi_IPL.csv', csvTransaksiIPL), 300);
        setTimeout(() => downloadFile('Buku_Kas.csv', csvBukuKas), 600);
        setTimeout(() => downloadFile('Kode_Otomasi_RT.gs', appsScriptCode, 'text/plain;charset=utf-8;'), 900);
    };

    return (
        <div className="space-y-6">
            {/* Top Banner */}
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white border border-emerald-800 shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[11px] font-bold">
                                Opsi A: No-Code / Low-Code Ecosystem
                            </span>
                            <span className="text-xs text-emerald-200">100% Gratis Tanpa Server</span>
                        </div>
                        <h2 className="text-2xl font-extrabold text-white mt-1">
                            Paket Template Siap Pakai: Google Sheets + Apps Script + Looker Studio
                        </h2>
                        <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                            Semua berkas spreadsheet telah disiapkan lengkap dengan 26 data kavling RT 04, histori pembayaran rapel, rumus saldo kas berjalan, dan script otomatisasi WhatsApp.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDownloadAll}
                            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg transition-all hover:scale-105 active:scale-95"
                        >
                            <Download className="w-4 h-4" />
                            <span>Unduh Semua Berkas (4 CSV + Script)</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 3-Minute Quick Setup Walkthrough */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Cara Setup ke Google Drive dalam 3 Menit:</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">1</span>
                            <span>Buat Spreadsheet</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">
                            Buka Google Drive, buat Google Sheet baru: <code>Sistem Keuangan RT 04</code>.
                        </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">2</span>
                            <span>Import 4 File CSV</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">
                            Klik <strong>File &gt; Import</strong> lalu masukkan file <code>Master_Warga.csv</code>, <code>Transaksi_IPL.csv</code>, dan <code>Buku_Kas.csv</code>.
                        </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">3</span>
                            <span>Pasang Apps Script</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">
                            Klik <strong>Extensions &gt; Apps Script</strong>, tempelkan kode otomasi untuk sinkronisasi kas dan kwitansi WA.
                        </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">4</span>
                            <span>Publikasi Looker / AppSheet</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">
                            Hubungkan ke <strong>Looker Studio</strong> untuk portal warga dan <strong>AppSheet</strong> untuk aplikasi mobile bendahara.
                        </p>
                    </div>
                </div>
            </div>

            {/* Interactive Sheet & Script Viewer */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                {/* Navigation Tabs */}
                <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-3 overflow-x-auto gap-2">
                    <button
                        onClick={() => setActiveSheetTab('warga')}
                        className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 ${activeSheetTab === 'warga'
                                ? 'bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <Table className="w-3.5 h-3.5" />
                        <span>Sheet 1: Master_Warga.csv</span>
                    </button>

                    <button
                        onClick={() => setActiveSheetTab('transaksi')}
                        className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 ${activeSheetTab === 'transaksi'
                                ? 'bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <Table className="w-3.5 h-3.5" />
                        <span>Sheet 2: Transaksi_IPL.csv</span>
                    </button>

                    <button
                        onClick={() => setActiveSheetTab('kas')}
                        className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 ${activeSheetTab === 'kas'
                                ? 'bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <Table className="w-3.5 h-3.5" />
                        <span>Sheet 3: Buku_Kas.csv</span>
                    </button>

                    <button
                        onClick={() => setActiveSheetTab('script')}
                        className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 ${activeSheetTab === 'script'
                                ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Kode_Otomasi_RT.gs</span>
                    </button>
                </div>

                {/* Content Viewer */}
                <div className="p-5">
                    {activeSheetTab === 'warga' && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">Sheet: Master_Warga</h4>
                                    <p className="text-xs text-slate-500">22 unit kavling siap pakai (Blok A, B, C) dengan status Tetap, Kontrak, dan Kosong.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleCopy('warga', csvMasterWarga)}
                                        className="flex items-center gap-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        {copiedKey === 'warga' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>Salin Data</span>
                                    </button>
                                    <button
                                        onClick={() => downloadFile('Master_Warga.csv', csvMasterWarga)}
                                        className="flex items-center gap-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Unduh CSV</span>
                                    </button>
                                </div>
                            </div>
                            <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto text-xs font-mono max-h-72 border border-slate-800">
                                <code>{csvMasterWarga}</code>
                            </pre>
                        </div>
                    )}

                    {activeSheetTab === 'transaksi' && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">Sheet: Transaksi_IPL (Dengan Logika Rapel)</h4>
                                    <p className="text-xs text-slate-500">Mencatat pembayaran bulanan dan rapel (kolom Bulan_Mulai &amp; Bulan_Selesai).</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleCopy('transaksi', csvTransaksiIPL)}
                                        className="flex items-center gap-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        {copiedKey === 'transaksi' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>Salin Data</span>
                                    </button>
                                    <button
                                        onClick={() => downloadFile('Transaksi_IPL.csv', csvTransaksiIPL)}
                                        className="flex items-center gap-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Unduh CSV</span>
                                    </button>
                                </div>
                            </div>
                            <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto text-xs font-mono max-h-72 border border-slate-800">
                                <code>{csvTransaksiIPL}</code>
                            </pre>
                        </div>
                    )}

                    {activeSheetTab === 'kas' && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">Sheet: Buku_Kas (Arus Kas &amp; Running Balance)</h4>
                                    <p className="text-xs text-slate-500">Mutasi masuk &amp; keluar dengan perhitungan saldo berjalan kronologis.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleCopy('kas', csvBukuKas)}
                                        className="flex items-center gap-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        {copiedKey === 'kas' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>Salin Data</span>
                                    </button>
                                    <button
                                        onClick={() => downloadFile('Buku_Kas.csv', csvBukuKas)}
                                        className="flex items-center gap-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Unduh CSV</span>
                                    </button>
                                </div>
                            </div>
                            <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto text-xs font-mono max-h-72 border border-slate-800">
                                <code>{csvBukuKas}</code>
                            </pre>
                        </div>
                    )}

                    {activeSheetTab === 'script' && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">Google Apps Script: Kode_Otomasi_RT.gs</h4>
                                    <p className="text-xs text-slate-500">Trigger otomatis saat transaksi diubah menjadi 'Lunas', sinkronisasi kas &amp; generator WA.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleCopy('script', appsScriptCode)}
                                        className="flex items-center gap-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        {copiedKey === 'script' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>Salin Kode Apps Script</span>
                                    </button>
                                    <button
                                        onClick={() => downloadFile('Kode_Otomasi_RT.gs', appsScriptCode, 'text/plain;charset=utf-8;')}
                                        className="flex items-center gap-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Unduh .gs</span>
                                    </button>
                                </div>
                            </div>
                            <pre className="p-4 bg-slate-950 text-emerald-400 rounded-xl overflow-x-auto text-xs font-mono max-h-80 border border-slate-800">
                                <code>{appsScriptCode}</code>
                            </pre>
                        </div>
                    )}
                </div>
            </div>

            {/* Looker Studio & AppSheet Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* AppSheet Card */}
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                <Smartphone className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900">Aplikasi Mobile Bendahara (AppSheet)</h4>
                                <p className="text-[11px] text-slate-500">Input transaksi langsung lewat smartphone Android / iOS</p>
                            </div>
                        </div>

                        <ul className="text-xs text-slate-600 mt-4 space-y-1.5">
                            <li>• Klik <strong>Extensions &gt; AppSheet &gt; Create an app</strong> di Google Sheets.</li>
                            <li>• Formulir otomatis mengenali dropdown Warga, Nominal, dan tombol kamera untuk foto bukti transfer atau bon belanja.</li>
                            <li>• Bendahara tidak perlu membuka laptop untuk catat kas masuk/keluar.</li>
                        </ul>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
                        <span className="font-semibold text-blue-700">Status:</span> Siap langsung diaktifkan dari Google Sheets Anda tanpa coding.
                    </div>
                </div>

                {/* Looker Studio Card */}
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                                <BarChart3 className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900">Dashboard Warga Transparan (Looker Studio)</h4>
                                <p className="text-[11px] text-slate-500">Laporan keuangan online publik (Read-Only) yang aman</p>
                            </div>
                        </div>

                        <ul className="text-xs text-slate-600 mt-4 space-y-1.5">
                            <li>• Kunjungi <strong>lookerstudio.google.com</strong> &gt; hubungkan ke file Google Sheet kas RT.</li>
                            <li>• Pasang kartu metrik: <code>Saldo Kas Riil</code>, <code>Kas Masuk</code>, <code>Kas Keluar</code>.</li>
                            <li>• Warga cukup klik link untuk memantau kas komplek tanpa bisa mengubah atau merusak rumus.</li>
                        </ul>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
                        <span className="font-semibold text-emerald-700">Keamanan:</span> Rumus dan data aman terlindungi dari pengeditan tidak sengaja.
                    </div>
                </div>
            </div>
        </div>
    );
};
