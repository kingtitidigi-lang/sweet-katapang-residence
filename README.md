# Buku Kas & Iuran IPL Warga (Full-Stack)

Sistem manajemen keuangan lingkungan komplek perumahan end-to-end:
- **Master Data Warga & Kavling (CRUD)**: Status hunian (Tetap, Kontrak, Kosong), no HP WhatsApp, tarif IPL.
- **Matriks Pembayaran IPL Bulanan**: Grid 12 bulan per unit, verifikasi lunas/belum, pembayaran rapel multi-bulan, bukti kwitansi digital, dan pengingat WhatsApp.
- **Buku Kas Arus Kas (General Ledger)**: Pemasukan & pengeluaran operasional (Satpam, Sampah, Listrik PJU, Maintenance, ATK) dengan saldo berjalan (*running balance*) otomatis.
- **Filter Periode Dinamis**: Ringkasan kas bulanan & tahunan tanpa memotong kartu saldo kas fisik riil (All-Time).
- **Backend Node.js Express REST API**: Terintegrasi langsung dengan database persisten disk di `data/db.json`.

---

## 🛠 Prasyarat Sistem Lokal

Sebelum menjalankan di komputer / laptop Anda, pastikan telah terpasang:
1. **Node.js** (Rekomendasi versi **v18.x**, **v20.x**, atau **v22.x LTS**)  
   Unduh gratis di: [https://nodejs.org](https://nodejs.org)
2. **Git** (Opsional, jika ingin meng-clone repositori) atau ekstrak file ZIP.
3. **Web Browser Modern** (Google Chrome, Microsoft Edge, Mozilla Firefox, atau Safari).

Verifikasi instalasi Node.js dan npm di terminal/CMD:
```bash
node -v
npm -v
```

---

## 🚀 Panduan Menjalankan di Komputer Lokal

### 1. Masuk ke Direktori Proyek
Buka aplikasi **Terminal** (macOS/Linux) atau **Command Prompt / PowerShell** (Windows), lalu arahkan ke folder proyek ini:
```bash
cd path/ke/folder-proyek
```

### 2. Siapkan File Konfigurasi Lingkungan (`.env`)
Salin file `.env.example` menjadi `.env`:
- **Linux / macOS / Git Bash:**
  ```bash
  cp .env.example .env
  ```
- **Windows (Command Prompt):**
  ```cmd
  copy .env.example .env
  ```

### 3. Pasang Semua Dependensi (Packages)
Jalankan perintah berikut untuk mengunduh semua pustaka yang dibutuhkan (`react`, `express`, `tailwindcss`, dll.):
```bash
npm install
```

### 4. Jalankan Server Aplikasi (Mode Development)
Jalankan server aplikasi (Express Backend + Vite Frontend):
```bash
npm run dev
```

Output di terminal akan menampilkan:
```
🚀 [Full-Stack Server] Running on http://localhost:3000
```

### 5. Buka di Browser
Buka browser Anda dan akses tautan:
👉 **[http://localhost:3000](http://localhost:3000)**

Aplikasi sudah berjalan penuh dengan backend dan database lokal!

---

## 📁 Di Mana Data Disimpan di Komputer Saya?

Database tersimpan secara lokal dan persisten di file:
```
/data/db.json
```
- File ini otomatis terbuat saat pertama kali server dijalankan dan sudah terisi data awal (26 unit kavling warga, transaksi rapel, dan mutasi kas).
- Setiap kali Anda menambah warga, mencatat pembayaran IPL, atau memasukkan biaya kas, perubahan langsung disimpan ke `data/db.json`.
- **Cara Backup:** Anda cukup menyalin file `data/db.json` ke flashdisk/Google Drive, atau klik tombol **"Backup"** di bilah atas aplikasi untuk mengunduh snapshot JSON.

---

## 📦 Menjalankan Mode Production (Opsional)

Jika ingin menjalankan aplikasi secara permanen atau di VPS / server lokal:
```bash
# 1. Kompilasi aset frontend
npm run build

# 2. Jalankan server production
npm start
```
Aplikasi akan melayani file teroptimasi di `http://localhost:3000`.

---

## 📑 Struktur Direktori Proyek

```
├── data/
│   └── db.json               # Database lokal persisten
├── src/
│   ├── components/           # Komponen UI (Dashboard, Matriks, Kas, Warga, Kwitansi, dll.)
│   ├── data/seedData.ts      # Template data master warga & mutasi awal
│   ├── types/index.ts        # Tipe TypeScript (Warga, IPL, Buku Kas)
│   ├── utils/                # Logika kalkulasi running balance, rapel & REST client
│   ├── App.tsx               # Root aplikasi
│   ├── main.tsx              # Entry React
│   └── index.css             # Tailwind CSS konfigurasi
├── server.ts                 # Backend Express REST API & Vite middleware
├── package.json              # Dependensi & skrip npm
└── vite.config.ts            # Konfigurasi Vite
```
