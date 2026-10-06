import React from 'react';
import {
  Building2,
  Wallet,
  RefreshCw,
  Download,
  Database,
  Users,
  LayoutDashboard,
  Grid3X3,
  BookOpen,
  FileSpreadsheet,
  Lock,
  LogOut,
  ShieldCheck,
  UserCheck,
  Cloud,
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import { AppTab, AuthUser } from '../types';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  realAllTimeBalance: number;
  isLoggedIn: boolean;
  currentUser: AuthUser | null;
  isFirebaseConnected: boolean;
  onOpenFirebaseConfig?: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onResetData: () => void;
  onExportBackup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  realAllTimeBalance,
  isLoggedIn,
  currentUser,
  isFirebaseConnected,
  onOpenFirebaseConfig,
  onOpenLogin,
  onLogout,
  onResetData,
  onExportBackup,
}) => {
  const isSuperAdmin = currentUser?.role === 'superadmin';
  const isAdmin = currentUser?.role === 'admin';
  const isPengurus = Boolean(isLoggedIn && currentUser && (currentUser.role === 'admin' || currentUser.role === 'superadmin'));

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  SWEET KATAPANG RESIDENCE
                </h1>
                <span className="text-[10px] px-2 py-0.5 font-semibold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Sistem Lingkungan
                </span>
                {isSuperAdmin ? (
                  <span className="text-[10px] px-2 py-0.5 font-bold rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1 shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                    <span>Super Admin: {currentUser.username}</span>
                  </span>
                ) : isAdmin ? (
                  <span className="text-[10px] px-2 py-0.5 font-semibold rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-blue-400" />
                    <span>Pengurus (Bendahara)</span>
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 font-semibold rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    Mode Warga
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Sistem Buku Kas & Iuran Pengelolaan Lingkungan (IPL)
              </p>
            </div>
          </div>

          {/* Right Controls: Balance + Auth Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Real All-Time Balance Card */}
            <div className="bg-slate-800/90 rounded-xl px-3 py-1.5 border border-slate-700/80 flex items-center gap-2 shadow-inner">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Wallet className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-medium leading-tight">Saldo Kas Riil</div>
                <div className="text-sm font-extrabold text-emerald-400 font-mono tracking-tight leading-tight">
                  {formatRupiah(realAllTimeBalance)}
                </div>
              </div>
            </div>

            {/* Cloud Sync: Khusus Super Admin bisa klik untuk Pengaturan Cloud Sync, role lain hanya badge status */}
            {isSuperAdmin ? (
              <button
                onClick={onOpenFirebaseConfig}
                title={
                  isFirebaseConnected
                    ? 'Cloud Firebase Aktif (Klik untuk Pengaturan Cloud Sync)'
                    : 'Hubungkan ke Database Cloud Firebase (Super Admin)'
                }
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${isFirebaseConnected
                    ? 'bg-emerald-950/70 text-emerald-300 border-emerald-600/60 hover:bg-emerald-900/80 shadow-xs'
                    : 'bg-slate-800 text-amber-300 border-amber-500/40 hover:bg-slate-700'
                  }`}
              >
                <div className="relative flex items-center">
                  <Cloud className="w-3.5 h-3.5" />
                  {isFirebaseConnected && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  )}
                </div>
                <span className="hidden sm:inline">
                  {isFirebaseConnected ? 'Cloud Aktif' : 'Cloud Sync'}
                </span>
              </button>
            ) : (
              <div
                title={
                  isFirebaseConnected
                    ? 'Status: Cloud Firebase Aktif & Terhubung'
                    : 'Status: Mode Penyimpanan Lokal (db.json)'
                }
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border select-none cursor-default pointer-events-none ${isFirebaseConnected
                    ? 'bg-emerald-950/70 text-emerald-300 border-emerald-600/60 shadow-xs'
                    : 'bg-slate-800 text-amber-300 border-amber-500/40'
                  }`}
              >
                <div className="relative flex items-center">
                  <Cloud className="w-3.5 h-3.5" />
                  {isFirebaseConnected && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  )}
                </div>
                <span className="hidden sm:inline">
                  {isFirebaseConnected ? 'Cloud Aktif' : 'Cloud Sync'}
                </span>
              </div>
            )}

            {/* Login / Logout Button */}
            {isLoggedIn ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onLogout}
                  title="Keluar dari akun pengurus"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-700/50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Login Pengurus</span>
              </button>
            )}

            {/* Backup & Reset Controls (Khusus Pengurus / Admin) */}
            {isPengurus && (
              <div className="flex items-center gap-1 pl-1 border-l border-slate-800">
                <button
                  onClick={onExportBackup}
                  title="Unduh Cadangan Data (JSON)"
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1 transition-colors border border-transparent hover:border-slate-700"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Backup</span>
                </button>

                <button
                  onClick={onResetData}
                  title="Kembalikan ke Contoh Data Default (Hanya Pengurus)"
                  className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1 transition-colors border border-transparent hover:border-slate-700"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto space-x-1 py-2 -mb-px text-sm font-medium scrollbar-none items-center">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs sm:text-sm whitespace-nowrap ${activeTab === 'dashboard'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard & Arus Kas
          </button>

          <button
            onClick={() => setActiveTab('matriks')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs sm:text-sm whitespace-nowrap ${activeTab === 'matriks'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
          >
            <Grid3X3 className="w-4 h-4" />
            Matriks IPL Bulanan
          </button>

          {/* Pengurus-only tabs: Buku Kas, Master Warga, Arsitektur, Sheets */}
          {isPengurus && (
            <>
              <button
                onClick={() => setActiveTab('kas')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs sm:text-sm whitespace-nowrap ${activeTab === 'kas'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
              >
                <BookOpen className="w-4 h-4" />
                Buku Kas (Jurnal Mutasi)
              </button>

              <button
                onClick={() => setActiveTab('warga')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs sm:text-sm whitespace-nowrap ${activeTab === 'warga'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
              >
                <Users className="w-4 h-4" />
                Master Warga & Kavling
              </button>

              {/* Super Admin only tabs: Arsitektur & Template Sheets */}
              {isSuperAdmin && (
                <>
                  <button
                    onClick={() => setActiveTab('arsitektur')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs sm:text-sm whitespace-nowrap ${activeTab === 'arsitektur'
                      ? 'bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/20'
                      : 'text-indigo-300 hover:text-white hover:bg-indigo-950/50'
                      }`}
                  >
                    <Database className="w-4 h-4 text-indigo-200" />
                    Arsitektur & Skema DB
                  </button>

                  <button
                    onClick={() => setActiveTab('nocode')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs sm:text-sm whitespace-nowrap ${activeTab === 'nocode'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                      : 'text-amber-300 hover:text-white hover:bg-amber-950/40'
                      }`}
                  >
                    <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                    <span>Template Sheets (Opsi A)</span>
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};
