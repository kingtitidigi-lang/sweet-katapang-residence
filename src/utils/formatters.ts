export const NAMA_BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const NAMA_BULAN_PENDEK = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTanggalIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const [y, m, d] = dateStr.split('-');
    if (!y || !m || !d) return dateStr;
    const monthIdx = parseInt(m, 10) - 1;
    return `${parseInt(d, 10)} ${NAMA_BULAN[monthIdx] || m} ${y}`;
  } catch {
    return dateStr;
  }
}

export function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function cleanPhoneForWA(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

export function generateWATextKwitansi(data: {
  nama: string;
  blok: string;
  bulanStr: string;
  tahun: number;
  nominal: number;
  tanggal: string;
  kwitansiNo: string;
  metode: string;
}): string {
  return encodeURIComponent(
    `*BUKTI PEMBAYARAN IURAN IPL SWEET KATAPANG RESIDENCE*\n\n` +
    `Halo ${data.nama} (Blok ${data.blok}),\n` +
    `Terima kasih, pembayaran Iuran Pengelolaan Lingkungan (IPL) Anda telah kami terima dan tercatat dalam buku kas warga:\n\n` +
    `📄 No. Ref: ${data.kwitansiNo}\n` +
    `🗓 Periode: ${data.bulanStr} ${data.tahun}\n` +
    `💰 Nominal: ${formatRupiah(data.nominal)}\n` +
    `💳 Metode: ${data.metode}\n` +
    `📅 Tgl Bayar: ${formatTanggalIndo(data.tanggal)}\n` +
    `Status: *LUNAS (Terverifikasi)*\n\n` +
    `Semoga lingkungan komplek SWEET KATAPANG RESIDENCE senantiasa aman, asri, dan guyub rukun. Salam hangat pengurus.`
  );
}

export function generateWATextReminder(data: {
  nama: string;
  blok: string;
  bulanStr: string;
  tahun: number;
  nominal: number;
  norek: string;
}): string {
  return encodeURIComponent(
    `*PENGINGAT IURAN IPL SWEET KATAPANG RESIDENCE*\n\n` +
    `Yth. ${data.nama} (Blok ${data.blok}),\n` +
    `Semoga Bpk/Ibu dan keluarga senantiasa sehat dan bahagia.\n\n` +
    `Kami dari pengurus menginformasikan terkait tagihan Iuran Pengelolaan Lingkungan (IPL):\n` +
    `🗓 Periode: ${data.bulanStr} ${data.tahun}\n` +
    `💰 Nominal: ${formatRupiah(data.nominal)}\n\n` +
    `Iuran digunakan untuk operasional keamanan (Satpam 24 Jam), kebersihan & sampah, penerangan jalan (PJU), dan pemeliharaan fasum komplek.\n\n` +
    `Pembayaran dapat ditransfer melalui:\n` +
    `🏦 ${data.norek}\n` +
    `atau tunai melalui Bendahara.\n\n` +
    `Mohon konfirmasi setelah melakukan pembayaran. Terima kasih atas kerja sama dan kepedulian Bpk/Ibu demi kenyamanan lingkungan SWEET KATAPANG RESIDENCE.`
  );
}
