import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { INITIAL_WARGA, INITIAL_KAS_TRANSACTIONS, generateInitialIPLPayments } from './src/data/seedData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

app.use(express.json());

// Ensure data folder and db.json exists
function getDatabase() {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const { transactions, items, extraKas } = generateInitialIPLPayments();
    const defaultData = {
      warga: INITIAL_WARGA,
      iplTransactions: transactions,
      iplItems: items,
      kasTransactions: [...INITIAL_KAS_TRANSACTIONS, ...extraKas],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }

  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content);
  if (parsed.warga) {
    parsed.warga = parsed.warga.map((w: any) => ({
      ...w,
      statusHunian: w.statusHunian === 'Kosong' ? 'Kosong' : (w.statusHunian || 'Dihuni'),
    }));
  }
  if (parsed.iplTransactions) {
    parsed.iplTransactions = parsed.iplTransactions.map((t: any) => ({
      ...t,
      status: t.status || 'Lunas',
    }));
  }
  if (parsed.iplItems) {
    parsed.iplItems = parsed.iplItems.map((item: any) => ({
      ...item,
      status: item.status || 'Lunas',
    }));
  }
  return parsed;
} catch (err) {
  console.error('Error reading db.json, recreating with defaults:', err);
  const { transactions, items, extraKas } = generateInitialIPLPayments();
  const defaultData = {
    warga: INITIAL_WARGA,
    iplTransactions: transactions,
    iplItems: items,
    kasTransactions: [...INITIAL_KAS_TRANSACTIONS, ...extraKas],
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
  return defaultData;
}
}

function saveDatabase(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db.json:', err);
  }
}

// -------------------------------------------------------------
// BACKEND REST API ROUTES
// -------------------------------------------------------------

// 1. Health check & Server Status
app.get('/api/status', (req, res) => {
  const db = getDatabase();
  res.json({
    status: 'online',
    version: '1.0.0',
    serverTime: new Date().toISOString(),
    totalWarga: db.warga.length,
    totalMutasiKas: db.kasTransactions.length,
    totalIPLItems: db.iplItems.length,
  });
});

// 2. Get All System Data
app.get('/api/data', (req, res) => {
  const db = getDatabase();
  res.json(db);
});

// 3. Record IPL Payment (Single or Rapel)
app.post('/api/ipl/pay', (req, res) => {
  const { warga, tahun, bulanList, tanggalBayar, metode, catatan, diterimaOleh, status, submittedBy } = req.body || {};
  if (!warga) {
    return res.status(400).json({ error: 'Data pembayaran tidak lengkap: data warga wajib ada' });
  }

  const db = getDatabase();
  const safeTahun = Number(tahun) || new Date().getFullYear();
  const safeBulanList = Array.isArray(bulanList) && bulanList.length > 0 ? bulanList : [1];
  const sortedMonths = [...safeBulanList].sort((a: number, b: number) => a - b);
  const safeTarif = Number(warga.tarifIPL) || 210000;
  const totalNominal = sortedMonths.length * safeTarif;
  const isRapel = sortedMonths.length > 1;
  const blok = warga.blok || 'A00';
  const nama = warga.nama || 'Warga';
  const wargaId = warga.id || `w-${blok}`;
  const safeTanggal = tanggalBayar || new Date().toISOString().split('T')[0];
  const safeMetode = metode || 'Transfer Bank';
  const txStatus = status || (submittedBy === 'warga' ? 'Menunggu Validasi' : 'Lunas');
  const safeSubmittedBy = submittedBy || (txStatus === 'Menunggu Validasi' ? 'warga' : 'pengurus');
  const safeDiterimaOleh = diterimaOleh || (txStatus === 'Menunggu Validasi' ? 'Warga (Konfirmasi Mandiri)' : 'Bendahara');
  const txId = `ipl-${blok}-${safeTahun}-${Date.now().toString(36)}`;

  const transaction = {
    id: txId,
    wargaId,
    blok,
    nama,
    tahun: safeTahun,
    bulanList: sortedMonths,
    totalNominal,
    tanggalBayar: safeTanggal,
    metode: safeMetode,
    keterangan: isRapel
      ? `Bayar rapel ${sortedMonths.length} bulan (${sortedMonths.map((m: number) => `Bln ${m}`).join(', ')}) ${catatan ? '- ' + catatan : ''}`
      : catatan || `Iuran IPL Bulan ${sortedMonths[0] || 1}/${safeTahun}`,
    status: txStatus,
    kasTransactionId: txStatus === 'Lunas' ? `kas-${txId}` : undefined,
    diterimaOleh: safeDiterimaOleh,
    submittedBy: safeSubmittedBy,
  };

  const newItems = sortedMonths.map((bulan: number) => ({
    id: `item-${blok}-${safeTahun}-${bulan}-${Date.now().toString(36)}`,
    transactionId: txId,
    wargaId,
    blok,
    nama,
    tahun: safeTahun,
    bulan,
    nominal: safeTarif,
    tanggalBayar: safeTanggal,
    metode: safeMetode,
    isRapel,
    status: txStatus,
    catatan: isRapel ? `Rapel ${sortedMonths.length} bulan` : catatan,
    buktiRef: `KWT/${safeTahun}/${String(bulan).padStart(2, '0')}/${blok}`,
  }));

  const kasRecord = {
    id: `kas-${txId}`,
    tanggal: safeTanggal,
    tipe: 'PEMASUKAN',
    kategori: 'Iuran IPL',
    nominal: totalNominal,
    deskripsi: `IPL Blok ${warga.blok} - ${warga.nama} (${sortedMonths.length} bln: ${sortedMonths.join(', ')})`,
    metode: safeMetode,
    refId: txId,
    penanggungJawab: safeDiterimaOleh,
  };

  db.iplTransactions.unshift(transaction);
  db.iplItems.unshift(...newItems);

  // Jika status Lunas (misal dicatat langsung oleh Bendahara), catat mutasi ke Buku Kas
  if (txStatus === 'Lunas') {
    db.kasTransactions.unshift(kasRecord);
  }

  saveDatabase(db);
  res.json({ success: true, transaction, items: newItems, kasRecord: txStatus === 'Lunas' ? kasRecord : null });
});

// 3b. Validate Pending IPL Payment (Bendahara approval)
app.post('/api/ipl/validate', (req, res) => {
  const { transactionId, validatedBy } = req.body || {};
  if (!transactionId) {
    return res.status(400).json({ error: 'ID transaksi wajib disertakan' });
  }

  const db = getDatabase();
  const txIndex = db.iplTransactions.findIndex((t: any) => t.id === transactionId);
  if (txIndex === -1) {
    return res.status(404).json({ error: 'Transaksi IPL tidak ditemukan' });
  }

  const tx = db.iplTransactions[txIndex];
  tx.status = 'Lunas';
  tx.validatedAt = new Date().toISOString();
  tx.validatedBy = validatedBy || 'Bendahara';
  tx.kasTransactionId = `kas-${tx.id}`;

  const updatedItems: any[] = [];
  db.iplItems.forEach((item: any) => {
    if (item.transactionId === transactionId) {
      item.status = 'Lunas';
      updatedItems.push(item);
    }
  });

  // Tambahkan ke kasTransactions jika belum ada
  let kasRecord = db.kasTransactions.find((k: any) => k.refId === transactionId);
  if (!kasRecord) {
    kasRecord = {
      id: `kas-${tx.id}`,
      tanggal: tx.tanggalBayar || new Date().toISOString().split('T')[0],
      tipe: 'PEMASUKAN',
      kategori: 'Iuran IPL',
      nominal: tx.totalNominal,
      deskripsi: `IPL Blok ${tx.blok} - ${tx.nama} (${tx.bulanList.length} bln: ${tx.bulanList.join(', ')})`,
      metode: tx.metode,
      refId: tx.id,
      penanggungJawab: validatedBy || 'Bendahara',
    };
    db.kasTransactions.unshift(kasRecord);
  }

  saveDatabase(db);
  res.json({ success: true, transaction: tx, items: updatedItems, kasRecord });
});

// 3c. Reject / Delete Pending IPL Payment
app.post('/api/ipl/reject', (req, res) => {
  const { transactionId } = req.body || {};
  if (!transactionId) {
    return res.status(400).json({ error: 'ID transaksi wajib disertakan' });
  }

  const db = getDatabase();
  db.iplTransactions = db.iplTransactions.filter((t: any) => t.id !== transactionId);
  db.iplItems = db.iplItems.filter((i: any) => i.transactionId !== transactionId);
  db.kasTransactions = db.kasTransactions.filter((k: any) => k.refId !== transactionId);

  saveDatabase(db);
  res.json({ success: true, deletedId: transactionId });
});

// 4. Add Cash Mutation (General Income or Expense)
app.post('/api/kas', (req, res) => {
  const { tipe, kategori, nominal, tanggal, deskripsi, metode, penanggungJawab } = req.body;
  if (!nominal || !tanggal || !deskripsi) {
    return res.status(400).json({ error: 'Data transaksi kas tidak lengkap' });
  }

  const db = getDatabase();
  const newTx = {
    id: `kas-${Date.now().toString(36)}`,
    tanggal,
    tipe,
    kategori,
    nominal: Number(nominal),
    deskripsi,
    metode,
    penanggungJawab,
  };

  db.kasTransactions.unshift(newTx);
  saveDatabase(db);
  res.json({ success: true, transaction: newTx });
});

// 5. Delete Cash Mutation
app.delete('/api/kas/:id', (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  const target = db.kasTransactions.find((k: any) => k.id === id);

  if (!target) {
    return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
  }

  // If connected to IPL, also remove IPL items and transaction
  if (target.refId) {
    db.iplTransactions = db.iplTransactions.filter((t: any) => t.id !== target.refId);
    db.iplItems = db.iplItems.filter((i: any) => i.transactionId !== target.refId);
  }

  db.kasTransactions = db.kasTransactions.filter((k: any) => k.id !== id);
  saveDatabase(db);
  res.json({ success: true, deletedId: id });
});

// 6. Add or Update Warga
app.post('/api/warga', (req, res) => {
  const { id, blok, nama, statusHunian, noHp, tarifIPL, keterangan } = req.body;
  if (!blok || !nama) {
    return res.status(400).json({ error: 'Blok dan Nama Warga wajib diisi' });
  }

  const db = getDatabase();
  if (id) {
    // Update
    const idx = db.warga.findIndex((w: any) => w.id === id);
    if (idx !== -1) {
      db.warga[idx] = {
        ...db.warga[idx],
        blok,
        nama,
        statusHunian: statusHunian === 'Kosong' ? 'Kosong' : 'Dihuni',
        noHp,
        tarifIPL: Number(tarifIPL),
        keterangan,
      };
      saveDatabase(db);
      return res.json({ success: true, warga: db.warga[idx] });
    }
  }

  // Create new
  const newW = {
    id: `w-${blok.replace(/[^A-Za-z0-9]/g, '')}-${Date.now().toString(36)}`,
    blok,
    nama,
    statusHunian: statusHunian === 'Kosong' ? 'Kosong' : 'Dihuni',
    noHp,
    tarifIPL: Number(tarifIPL) || 210000,
    keterangan,
    createdAt: new Date().toISOString().split('T')[0],
  };

  db.warga.push(newW);
  saveDatabase(db);
  res.json({ success: true, warga: newW });
});

// 7. Delete Warga
app.delete('/api/warga/:id', (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  db.warga = db.warga.filter((w: any) => w.id !== id);
  saveDatabase(db);
  res.json({ success: true, deletedId: id });
});

// 8. Reset to default demo data
app.post('/api/reset', (req, res) => {
  const { transactions, items, extraKas } = generateInitialIPLPayments();
  const defaultData = {
    warga: INITIAL_WARGA,
    iplTransactions: transactions,
    iplItems: items,
    kasTransactions: [...INITIAL_KAS_TRANSACTIONS, ...extraKas],
  };
  saveDatabase(defaultData);
  res.json({ success: true, data: defaultData });
});

// -------------------------------------------------------------
// VITE DEV SERVER / PRODUCTION STATIC ASSETS
// -------------------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // In development mode, mount Vite middleware to serve hot modules & SPA
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the built dist directory
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`🚀 [Full-Stack Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
