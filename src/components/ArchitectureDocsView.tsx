import React, { useState } from 'react';
import {
  Database,
  Layers,
  Code2,
  FileCode,
  CheckCircle2,
  Copy,
  Check,
  Server,
  Sparkles,
  GitBranch,
  BookOpen,
  ArrowRight,
  Shield,
  Table as TableIcon,
} from 'lucide-react';

export const ArchitectureDocsView: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'erd' | 'rapel' | 'stack' | 'sql'>('erd');

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sqlDDL = `-- ========================================================
-- SISTEM MANAJEMEN BUKU KAS & IURAN IPL WARGA
-- Database Dialect: PostgreSQL / Supabase
-- ========================================================

-- 1. ENUM TYPES
CREATE TYPE enum_status_hunian AS ENUM ('Dihuni', 'Kosong');
CREATE TYPE enum_metode_bayar AS ENUM ('Transfer Bank', 'Tunai / Cash', 'QRIS');
CREATE TYPE enum_tipe_kas AS ENUM ('PEMASUKAN', 'PENGELUARAN');

-- 2. TABEL: master_warga
-- Menyimpan unit kavling/rumah, identitas kepala keluarga, dan konfigurasi tarif IPL
CREATE TABLE master_warga (
    id VARCHAR(36) PRIMARY KEY,
    blok VARCHAR(10) NOT NULL UNIQUE, -- Contoh: 'A01', 'B02', 'C11'
    nama VARCHAR(150) NOT NULL,
    status_hunian enum_status_hunian NOT NULL DEFAULT 'Dihuni',
    no_hp VARCHAR(20),
    tarif_ipl NUMERIC(12, 2) NOT NULL DEFAULT 210000.00,
    keterangan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_master_warga_blok ON master_warga(blok);
CREATE INDEX idx_master_warga_status ON master_warga(status_hunian);

-- 3. TABEL: ipl_transactions (Header Pembayaran Induk)
-- Mencatat 1 peristiwa transaksi pembayaran dari warga (bisa 1 bulan atau N bulan rapel)
CREATE TABLE ipl_transactions (
    id VARCHAR(36) PRIMARY KEY,
    warga_id VARCHAR(36) NOT NULL REFERENCES master_warga(id) ON DELETE RESTRICT,
    blok VARCHAR(10) NOT NULL,
    tahun_ajaran INT NOT NULL, -- e.g. 2026
    bulan_list INT[] NOT NULL, -- e.g. ARRAY[1, 2, 3] untuk rapel Jan-Mar
    total_nominal NUMERIC(12, 2) NOT NULL, -- e.g. 630000.00
    tanggal_bayar DATE NOT NULL,
    metode_bayar enum_metode_bayar NOT NULL,
    keterangan TEXT,
    bukti_transfer_url TEXT,
    diterima_oleh VARCHAR(100) NOT NULL,
    kas_transaction_id VARCHAR(36), -- Relasi 1-to-1 opsional ke buku kas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ipl_tx_warga ON ipl_transactions(warga_id);
CREATE INDEX idx_ipl_tx_tanggal ON ipl_transactions(tanggal_bayar);

-- 4. TABEL: ipl_payment_items (Rincian Item Per Bulan)
-- Normalisasi level bulan: penting untuk audit trail, rekonsiliasi matriks, dan penagihan
CREATE TABLE ipl_payment_items (
    id VARCHAR(36) PRIMARY KEY,
    transaction_id VARCHAR(36) NOT NULL REFERENCES ipl_transactions(id) ON DELETE CASCADE,
    warga_id VARCHAR(36) NOT NULL REFERENCES master_warga(id) ON DELETE RESTRICT,
    tahun INT NOT NULL,
    bulan SMALLINT NOT NULL CHECK (bulan BETWEEN 1 AND 12),
    nominal NUMERIC(12, 2) NOT NULL,
    tanggal_bayar DATE NOT NULL,
    metode_bayar enum_metode_bayar NOT NULL,
    is_rapel BOOLEAN NOT NULL DEFAULT FALSE,
    no_kwitansi VARCHAR(50) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_warga_tahun_bulan UNIQUE (warga_id, tahun, bulan) -- Mencegah double bayar bulan yang sama!
);

CREATE INDEX idx_ipl_items_period ON ipl_payment_items(tahun, bulan);
CREATE INDEX idx_ipl_items_warga ON ipl_payment_items(warga_id);

-- 5. TABEL: buku_kas (Jurnal Mutasi Arus Kas)
-- Sumber kebenaran tunggal untuk laporan keuangan pengurus & audit warga
CREATE TABLE buku_kas (
    id VARCHAR(36) PRIMARY KEY,
    tanggal DATE NOT NULL,
    tipe enum_tipe_kas NOT NULL,
    kategori VARCHAR(80) NOT NULL, -- 'Iuran IPL', 'Keamanan', 'Kebersihan', dll.
    nominal NUMERIC(14, 2) NOT NULL CHECK (nominal > 0),
    deskripsi TEXT NOT NULL,
    metode_kas VARCHAR(30) NOT NULL, -- 'Transfer Bank' / 'Tunai / Cash'
    ref_id VARCHAR(50), -- Menghubungkan ke ipl_transactions(id) jika dari IPL
    penanggung_jawab VARCHAR(100) NOT NULL,
    bukti_kwitansi_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_buku_kas_tanggal ON buku_kas(tanggal);
CREATE INDEX idx_buku_kas_tipe ON buku_kas(tipe);
CREATE INDEX idx_buku_kas_ref ON buku_kas(ref_id);`;

  const sqlRunningBalance = `-- Query Filter Periode + Saldo Awal + Running Balance Otomatis
-- Menggunakan Window Function (PostgreSQL / MySQL 8.0+)

WITH filtered_ledger AS (
    SELECT 
        id,
        tanggal,
        tipe,
        kategori,
        deskripsi,
        metode_kas,
        penanggung_jawab,
        CASE WHEN tipe = 'PEMASUKAN' THEN nominal ELSE 0 END AS masuk,
        CASE WHEN tipe = 'PENGELUARAN' THEN nominal ELSE 0 END AS keluar,
        -- Running Balance All-Time
        SUM(CASE WHEN tipe = 'PEMASUKAN' THEN nominal ELSE -nominal END) 
            OVER (ORDER BY tanggal ASC, created_at ASC, id ASC) AS running_balance
    FROM buku_kas
)
SELECT * 
FROM filtered_ledger
WHERE EXTRACT(YEAR FROM tanggal) = 2026 
  AND EXTRACT(MONTH FROM tanggal) = 1 -- Opsional, ganti/hapus untuk Semua Bulan
ORDER BY tanggal DESC, id DESC;`;

  return (
    <div className="space-y-6">
      {/* Blueprint Header Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded text-[11px] font-bold">
                Senior System Architecture & DB Design
              </span>
              <span className="text-xs text-slate-400">Versi 1.0.0</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white mt-1">
              Dokumentasi Arsitektur Sistem "Buku Kas & IPL Warga"
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Cetak biru relasional database, tata kelola pembayaran rapel multi-bulan, perhitungan running balance, serta komparasi implementasi No-Code vs Full-Stack Web App.
            </p>
          </div>

          {/* Section switcher */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700/80">
            <button
              onClick={() => setActiveSection('erd')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeSection === 'erd'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
                }`}
            >
              1. Skema Tabel & ERD
            </button>
            <button
              onClick={() => setActiveSection('rapel')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeSection === 'rapel'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
                }`}
            >
              2. Logika Rapel & Kas
            </button>
            <button
              onClick={() => setActiveSection('stack')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeSection === 'stack'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
                }`}
            >
              3. Tech Stack Opsi A & B
            </button>
            <button
              onClick={() => setActiveSection('sql')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeSection === 'sql'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
                }`}
            >
              4. DDL & Query SQL
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: SKEMA DATABASE & ERD */}
      {activeSection === 'erd' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TableIcon className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Struktur Entitas & Relasi (Relational ERD Architecture)
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">4 Core Tables</span>
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Sistem dirancang dengan normalisasi relasional untuk menjamin integritas data (ACID) dan mencegah anomali saat warga membayar beberapa bulan sekaligus (rapel) atau ketika ada kavling kosong.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              {/* Entity 1 */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    master_warga
                  </span>
                  <span className="text-[11px] text-slate-500">1 unit = 1 kavling</span>
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-2">
                  Master Data Kavling & Warga
                </div>
                <ul className="text-xs text-slate-600 mt-2 space-y-1 font-mono text-[11px]">
                  <li>• <strong className="text-slate-900">id</strong> (PK, UUID)</li>
                  <li>• <strong className="text-slate-900">blok</strong> (UNIQUE, indexed, e.g. 'A01')</li>
                  <li>• nama, status_hunian (Dihuni/Kosong)</li>
                  <li>• no_hp (WhatsApp untuk kwitansi/reminder)</li>
                  <li>• tarif_ipl (Numeric, default Rp 210.000)</li>
                </ul>
              </div>

              {/* Entity 2 */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ipl_transactions
                  </span>
                  <span className="text-[11px] text-slate-500">Parent Transaksi Bayar</span>
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-2">
                  Header Pembayaran (Event 1x Bayar)
                </div>
                <ul className="text-xs text-slate-600 mt-2 space-y-1 font-mono text-[11px]">
                  <li>• <strong className="text-slate-900">id</strong> (PK, UUID)</li>
                  <li>• <strong className="text-slate-900">warga_id</strong> (FK → master_warga.id)</li>
                  <li>• bulan_list (ARRAY[1,2,3] jika bayar rapel)</li>
                  <li>• total_nominal (Total kas riil masuk, misal Rp 630.000)</li>
                  <li>• tanggal_bayar, metode_bayar, bukti_transfer_url</li>
                </ul>
              </div>

              {/* Entity 3 */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    ipl_payment_items
                  </span>
                  <span className="text-[11px] text-slate-500">Child Mutasi Bulanan</span>
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-2">
                  Pecahan Granular Iuran Per Bulan
                </div>
                <ul className="text-xs text-slate-600 mt-2 space-y-1 font-mono text-[11px]">
                  <li>• <strong className="text-slate-900">id</strong> (PK, UUID)</li>
                  <li>• <strong className="text-slate-900">transaction_id</strong> (FK → ipl_transactions.id)</li>
                  <li>• <strong className="text-slate-900">warga_id</strong> (FK → master_warga.id)</li>
                  <li>• tahun, bulan (1-12), nominal (Rp 210.000)</li>
                  <li>• <span className="text-rose-600">CONSTRAINT UNIQUE (warga_id, tahun, bulan)</span></li>
                </ul>
              </div>

              {/* Entity 4 */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-800 bg-slate-200 px-2 py-0.5 rounded border border-slate-300">
                    buku_kas
                  </span>
                  <span className="text-[11px] text-slate-500">General Ledger (Arus Kas)</span>
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-2">
                  Buku Kas Besar (Pemasukan & Pengeluaran)
                </div>
                <ul className="text-xs text-slate-600 mt-2 space-y-1 font-mono text-[11px]">
                  <li>• <strong className="text-slate-900">id</strong> (PK, UUID)</li>
                  <li>• tanggal, tipe (PEMASUKAN / PENGELUARAN)</li>
                  <li>• kategori ('Iuran IPL', 'Satpam', 'Sampah', dll.)</li>
                  <li>• nominal (Checked &gt; 0)</li>
                  <li>• ref_id (Link ke ipl_transactions.id jika bersumber dari IPL)</li>
                </ul>
              </div>
            </div>

            {/* Visual Flow diagram */}
            <div className="mt-6 bg-slate-900 text-slate-200 rounded-xl p-4 font-mono text-xs">
              <div className="text-indigo-400 font-bold mb-2">// RELATIONAL WORKFLOW OVERVIEW</div>
              <div className="space-y-1 text-slate-300">
                <div>[master_warga] (1) ──&lt; (N) [ipl_transactions] (Header 1x Bayar: Rp 630rb)</div>
                <div className="pl-28">│</div>
                <div className="pl-28">├─── (N) [ipl_payment_items] (Jan: 210rb, Feb: 210rb, Mar: 210rb)</div>
                <div className="pl-28">│</div>
                <div className="pl-28">└─── (1) [buku_kas] (Otomatis masuk kas: +Rp 630.000)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: LOGIKA RAPEL MULTI-BULAN */}
      {activeSection === 'rapel' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <GitBranch className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                Arsitektur Alur Logika Penanganan Pembayaran Rapel
              </h3>
            </div>

            <div className="mt-4 space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900">
                <strong>Tantangan Akuntansi Iuran Lingkungan:</strong> Saat seorang warga membayar 3 bulan sekaligus (misal Januari, Februari, Maret) pada tanggal 5 Januari sebesar <strong>Rp 630.000</strong>:
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li><strong>Kas Riil (Cash-Basis):</strong> Uang Rp 630.000 fisik diterima dan masuk rekening pada bulan Januari. Maka buku kas harus mencatat pemasukan Rp 630.000 pada Januari agar saldo bank klop.</li>
                  <li><strong>Laporan Bulanan (Accrual/Matriks):</strong> Pada bulan Februari dan Maret, warga tersebut tidak boleh ditagih lagi ("LUNAS"). Matriks pembayaran harus menampilkan status Lunas untuk ketiga bulan tersebut.</li>
                </ul>
              </div>

              <h4 className="text-sm font-bold text-slate-900 mt-4">
                Solusi Arsitektur Dua-Tingkat (Two-Tier Ledger):
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                  <span className="font-bold text-indigo-700">Langkah 1: Header Pembayaran</span>
                  <p className="mt-1 text-[11px] text-slate-600">
                    Sistem membuat 1 rekor di <code>ipl_transactions</code> dengan total Rp 630.000, metode pembayaran, dan bukti transfer.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                  <span className="font-bold text-indigo-700">Langkah 2: Dekomposisi Item</span>
                  <p className="mt-1 text-[11px] text-slate-600">
                    Sistem otomatis mengurai (decompose) menjadi 3 rekor di <code>ipl_payment_items</code>:
                    Bulan 1 (210k), Bulan 2 (210k), Bulan 3 (210k) dengan bendera <code>is_rapel = true</code>.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                  <span className="font-bold text-indigo-700">Langkah 3: Sinkronisasi Buku Kas</span>
                  <p className="mt-1 text-[11px] text-slate-600">
                    Sistem otomatis membuat 1 mutasi kas masuk di <code>buku_kas</code> sebesar Rp 630.000 pada tanggal transaksi sehingga saldo kas riil 100% akurat.
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-100 rounded-lg">
                <div className="font-semibold text-slate-800">
                  Logika Penanganan Kavling Kosong:
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Kavling dengan <code>status_hunian = 'Kosong'</code> memiliki logika khusus:
                  target kolektibilitas IPL otomatis mengecualikan kavling kosong dari denominator persentase kepatuhan (atau pengurus dapat menetapkan biaya pemeliharaan parsial), sehingga laporan keuangan tidak mencatat defisit semu.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: TECH STACK RECOMMENDATION */}
      {activeSection === 'stack' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Server className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                Rekomendasi Tech Stack: Opsi A vs Opsi B
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              {/* Opsi A */}
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    OPSI A: No-Code / Low-Code
                  </span>
                  <span className="text-xs text-slate-500">Biaya: Rp 0 (Free Tier)</span>
                </div>

                <h4 className="text-base font-bold text-slate-900 mt-2">
                  Google Workspace Ecosystem
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Cocok untuk komplek lingkungan skala kecil (&lt; 80 rumah) dengan bendahara non-programmer yang mengutamakan kemudahan operasional langsung.
                </p>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-800">Database & Ledger:</span>
                    <span className="text-slate-600 ml-1">Google Sheets (Sheet "MasterWarga", Sheet "TransaksiIPL", Sheet "BukuKas")</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-800">Input Form / UI Mobile:</span>
                    <span className="text-slate-600 ml-1">AppSheet (auto-generate CRUD mobile app) atau Google Forms</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-800">Automasi & WA Kwitansi:</span>
                    <span className="text-slate-600 ml-1">Google Apps Script (Trigger <code>onEdit</code>, generate PDF kwitansi & kirim email/WA via API Fonnte/Wablas)</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-800">Dashboard Warga:</span>
                    <span className="text-slate-600 ml-1">Looker Studio (laporan publik transparan, read-only bagi warga)</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500">
                  <span className="font-bold text-slate-700">Kelebihan:</span> Tidak butuh server hosting, dapat diedit langsung di spreadsheet, backup otomatis Google Drive.
                </div>
              </div>

              {/* Opsi B */}
              <div className="border border-indigo-200 rounded-xl p-5 bg-indigo-50/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                    OPSI B: Custom Modern Web App
                  </span>
                  <span className="text-xs text-indigo-600 font-semibold">Recommended (High Control)</span>
                </div>

                <h4 className="text-base font-bold text-slate-900 mt-2">
                  React + TypeScript + Tailwind + Supabase
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Cocok untuk komplek cluster modern, apartemen, atau RW dengan kebutuhan UX cepat, filter instan, validasi ketat, dan cetak kwitansi rapi.
                </p>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-indigo-100">
                    <span className="font-bold text-slate-800">Frontend:</span>
                    <span className="text-slate-600 ml-1">React 19 / Next.js + Tailwind CSS + Lucide Icons (seperti aplikasi ini)</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-indigo-100">
                    <span className="font-bold text-slate-800">Backend & API:</span>
                    <span className="text-slate-600 ml-1">Node.js (Express / Next.js Server Actions) atau Edge Functions Supabase</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-indigo-100">
                    <span className="font-bold text-slate-800">Database:</span>
                    <span className="text-slate-600 ml-1">PostgreSQL dengan Row-Level Security (RLS) untuk isolasi role Pengurus vs Warga</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-indigo-100">
                    <span className="font-bold text-slate-800">Hosting:</span>
                    <span className="text-slate-600 ml-1">Vercel / Cloud Run (Frontend & Backend) + Supabase (Database & Auth)</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-indigo-100 text-xs text-slate-600">
                  <span className="font-bold text-slate-700">Kelebihan:</span> Performa ultra cepat, zero spreadsheet formatting error, validasi data otomatis, UX interaktif untuk bendahara.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: SQL DDL & RUNNING BALANCE QUERIES */}
      {activeSection === 'sql' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Skrip SQL DDL Lengkap (PostgreSQL / Supabase)
                </h3>
              </div>
              <button
                onClick={() => handleCopy('ddl', sqlDDL)}
                className="flex items-center gap-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md transition-colors"
              >
                {copiedKey === 'ddl' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin SQL DDL</span>
                  </>
                )}
              </button>
            </div>

            <pre className="mt-4 p-4 bg-slate-950 text-slate-200 rounded-xl overflow-x-auto text-xs font-mono leading-relaxed border border-slate-800">
              <code>{sqlDDL}</code>
            </pre>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Query Saldo Berjalan (Running Balance dengan Window Function)
                </h3>
              </div>
              <button
                onClick={() => handleCopy('calc', sqlRunningBalance)}
                className="flex items-center gap-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md transition-colors"
              >
                {copiedKey === 'calc' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Query</span>
                  </>
                )}
              </button>
            </div>

            <pre className="mt-4 p-4 bg-slate-950 text-slate-200 rounded-xl overflow-x-auto text-xs font-mono leading-relaxed border border-slate-800">
              <code>{sqlRunningBalance}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
