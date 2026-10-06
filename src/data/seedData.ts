import { Warga, IPLTransaction, IPLPaymentItem, KasTransaction } from '../types';

export const INITIAL_WARGA: Warga[] = [
  { id: 'w-A01', blok: 'A01', nama: 'Teh Keny', statusHunian: 'Dihuni', noHp: '081234567801', tarifIPL: 210000, keterangan: '', createdAt: '2025-01-01' },
  { id: 'w-A02', blok: 'A02', nama: 'Bu Suhartati', statusHunian: 'Dihuni', noHp: '081234567802', tarifIPL: 210000, keterangan: '', createdAt: '2025-01-01' },
  { id: 'w-A05', blok: 'A05', nama: 'Pa Harry', statusHunian: 'Dihuni', noHp: '081234567805', tarifIPL: 210000, keterangan: '', createdAt: '2025-01-01' },
  { id: 'w-A07', blok: 'A07', nama: 'Pa Jajang', statusHunian: 'Dihuni', noHp: '081234567807', tarifIPL: 210000, keterangan: '', createdAt: '2025-01-01' },
  { id: 'w-A08', blok: 'A08', nama: 'Pa Teja', statusHunian: 'Dihuni', noHp: '081234567808', tarifIPL: 210000, keterangan: '', createdAt: '2025-01-01' },
  { id: 'w-A09', blok: 'A09', nama: 'Bu cucu', statusHunian: 'Dihuni', noHp: '081234567809', tarifIPL: 210000, keterangan: '', createdAt: '2025-01-01' },
  { id: 'w-A10', blok: 'A10', nama: 'Pa Mondi', statusHunian: 'Dihuni', noHp: '081234567810', tarifIPL: 210000, keterangan: '', createdAt: '2025-01-01' },
  { id: 'w-A11', blok: 'A11', nama: 'Pa Sidik', statusHunian: 'Dihuni', noHp: '081234567811', tarifIPL: 210000, keterangan: '', createdAt: '2025-01-01' },
  { id: 'w-A12', blok: 'A12', nama: 'Pa Iyan', statusHunian: 'Dihuni', noHp: '081234567812', tarifIPL: 210000, keterangan: '', createdAt: '2025-01-01' },
  { id: 'w-A15', blok: 'A15', nama: 'Th Dillah', statusHunian: 'Dihuni', noHp: '081234567815', tarifIPL: 210000, keterangan: '', createdAt: '2025-01-01' },
  { id: 'w-A16', blok: 'A16', nama: 'Rosa', statusHunian: 'Dihuni', noHp: '081234567816', tarifIPL: 210000, keterangan: '', createdAt: '2025-01-01' },
  { id: 'w-A18', blok: 'A18', nama: 'Pa Riki', statusHunian: 'Dihuni', noHp: '081234567818', tarifIPL: 210000, keterangan: '', createdAt: '2025-01-01' },
  { id: 'w-B01', blok: 'B01', nama: 'Teh Martha', statusHunian: 'Dihuni', noHp: '081234567821', tarifIPL: 210000, keterangan: '', createdAt: '2025-01-01' },
  { id: 'w-B02', blok: 'B02', nama: 'Pa Ghani', statusHunian: 'Dihuni', noHp: '081234567822', tarifIPL: 210000, keterangan: '', createdAt: '2025-01-01' },
  { id: 'w-B03', blok: 'B03', nama: 'BPK Penabur', statusHunian: 'Dihuni', noHp: '081234567823', tarifIPL: 210000, keterangan: '', createdAt: '2025-01-01' },
  { id: 'w-C01', blok: 'C01', nama: 'Pa Farid', statusHunian: 'Dihuni', noHp: '081234567831', tarifIPL: 210000, keterangan: '', createdAt: '2025-01-01' },
  { id: 'w-C03', blok: 'C03', nama: 'Pa Sahid', statusHunian: 'Dihuni', noHp: '081234567833', tarifIPL: 210000, keterangan: '', createdAt: '2025-01-01' },
  { id: 'w-C05', blok: 'C05', nama: 'Pa Bakti', statusHunian: 'Dihuni', noHp: '081234567835', tarifIPL: 210000, keterangan: '', createdAt: '2025-01-01' },
  { id: 'w-C06', blok: 'C06', nama: 'Pa Afif', statusHunian: 'Dihuni', noHp: '081234567836', tarifIPL: 210000, keterangan: '', createdAt: '2025-01-01' },
  { id: 'w-C07', blok: 'C07', nama: 'Pa Encep', statusHunian: 'Dihuni', noHp: '081234567837', tarifIPL: 210000, keterangan: '', createdAt: '2025-01-01' },
  { id: 'w-C08', blok: 'C08', nama: 'Pa dede', statusHunian: 'Dihuni', noHp: '081234567838', tarifIPL: 210000, keterangan: '', createdAt: '2025-01-01' },
  { id: 'w-C09', blok: 'C09', nama: 'Pa Alfin', statusHunian: 'Dihuni', noHp: '081234567839', tarifIPL: 210000, keterangan: '', createdAt: '2025-01-01' },
  { id: 'w-C10', blok: 'C10', nama: 'Teh Dewi', statusHunian: 'Dihuni', noHp: '081234567840', tarifIPL: 210000, keterangan: '', createdAt: '2025-01-01' },
  { id: 'w-C11', blok: 'C11', nama: 'Pa Tio', statusHunian: 'Dihuni', noHp: '081234567841', tarifIPL: 210000, keterangan: '', createdAt: '2025-01-01' },
  { id: 'w-C12', blok: 'C12', nama: 'Pa wim', statusHunian: 'Dihuni', noHp: '081234567842', tarifIPL: 210000, keterangan: '', createdAt: '2025-01-01' },
  { id: 'w-C15', blok: 'C15', nama: 'Teh Niknik', statusHunian: 'Dihuni', noHp: '081234567845', tarifIPL: 210000, keterangan: '', createdAt: '2025-01-01' },
  { id: 'w-C16', blok: 'C16', nama: 'Th Wida', statusHunian: 'Dihuni', noHp: '081234567846', tarifIPL: 210000, keterangan: '', createdAt: '2025-01-01' },
  { id: 'w-C17', blok: 'C17', nama: 'Th Ria', statusHunian: 'Dihuni', noHp: '081234567847', tarifIPL: 210000, keterangan: '', createdAt: '2025-01-01' },
  { id: 'w-ZA03', blok: 'ZA03', nama: 'A3', statusHunian: 'Kosong', noHp: '', tarifIPL: 210000, keterangan: 'Kavling Kosong A3', createdAt: '2025-01-01' },
  { id: 'w-ZA06', blok: 'ZA06', nama: 'A6', statusHunian: 'Kosong', noHp: '', tarifIPL: 210000, keterangan: 'Kavling Kosong A6', createdAt: '2025-01-01' },
  { id: 'w-ZC02', blok: 'ZC02', nama: 'C2', statusHunian: 'Kosong', noHp: '', tarifIPL: 210000, keterangan: 'Kavling Kosong C2', createdAt: '2025-01-01' },
];

// Transaksi kas awal dikosongkan sesuai permintaan pengguna
export const INITIAL_KAS_TRANSACTIONS: KasTransaction[] = [];

// Transaksi pembayaran awal dikosongkan sesuai permintaan pengguna
export function generateInitialIPLPayments(): {
  transactions: IPLTransaction[];
  items: IPLPaymentItem[];
  extraKas: KasTransaction[];
} {
  return {
    transactions: [],
    items: [],
    extraKas: [],
  };
}
