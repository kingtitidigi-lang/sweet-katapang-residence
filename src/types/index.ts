export type AppTab = 'dashboard' | 'matriks' | 'kas' | 'warga' | 'arsitektur' | 'nocode';

export type StatusHunian = 'Tetap' | 'Kontrak' | 'Kosong';

export type MetodePembayaran = 'Transfer Bank' | 'Tunai / Cash' | 'QRIS RT';

export type TipeTransaksi = 'PEMASUKAN' | 'PENGELUARAN';

export type KategoriPemasukan =
  | 'Iuran IPL'
  | 'Saldo Awal'
  | 'Donasi Warga'
  | 'Sewa Balai & Lapangan'
  | 'Bunga Bank / Lainnya';

export type KategoriPengeluaran =
  | 'Keamanan / Satpam'
  | 'Kebersihan / Sampah'
  | 'Listrik PJU & Fasum'
  | 'Perbaikan & Maintenance'
  | 'Operasional & ATK'
  | 'Kegiatan & Sosial Warga';

export type KategoriKas = KategoriPemasukan | KategoriPengeluaran;

export interface Warga {
  id: string;
  blok: string; // e.g. A01, B05, C11
  nama: string;
  statusHunian: StatusHunian;
  noHp: string;
  tarifIPL: number; // default: 210000
  keterangan?: string;
  createdAt: string;
}

// Rekor pemecahan IPL per bulan (granular item for audit and matrix)
export interface IPLPaymentItem {
  id: string;
  transactionId: string; // ID transaksi induk (penting untuk rapel!)
  wargaId: string;
  blok: string;
  nama: string;
  tahun: number;
  bulan: number; // 1 - 12
  nominal: number; // e.g. 210000
  tanggalBayar: string; // YYYY-MM-DD
  metode: MetodePembayaran;
  isRapel: boolean;
  catatan?: string;
  buktiRef?: string;
}

// Transaksi induk saat warga membayar (bisa 1 bulan atau N bulan sekaligus)
export interface IPLTransaction {
  id: string;
  wargaId: string;
  blok: string;
  nama: string;
  tahun: number;
  bulanList: number[]; // e.g. [1, 2, 3] = Jan, Feb, Mar
  totalNominal: number;
  tanggalBayar: string;
  metode: MetodePembayaran;
  keterangan: string;
  kasTransactionId?: string; // id transaksi di Buku Kas
  diterimaOleh: string;
}

export interface RecordIPLData {
  warga: Warga;
  tahun: number;
  bulanList: number[];
  tanggalBayar: string;
  metode: MetodePembayaran;
  catatan?: string;
  diterimaOleh: string;
}

// Rekor Buku Kas Arus Kas (Pemasukan / Pengeluaran)
export interface KasTransaction {
  id: string;
  tanggal: string; // YYYY-MM-DD
  tipe: TipeTransaksi;
  kategori: KategoriKas;
  nominal: number;
  deskripsi: string;
  metode: MetodePembayaran;
  refId?: string; // Menghubungkan ke IPLTransaction.id jika dari IPL
  penanggungJawab: string;
  runningBalance?: number; // dihitung dinamis
}

export interface SummaryKeuangan {
  realAllTimeBalance: number;
  saldoAwalPeriode: number;
  totalPemasukanPeriode: number;
  totalPengeluaranPeriode: number;
  surplusDefisitPeriode: number;
  saldoAkhirPeriode: number;
  totalKavling: number;
  kavlingTerisi: number;
  kavlingKosong: number;
  iplTerkumpulBulanIni: number;
  iplTargetBulanIni: number;
  persentaseKolektibilitas: number;
}
