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
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import { AppTab } from '../types';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  realAllTimeBalance: number;
  isLoggedIn: boolean;
  currentUser: { username: string; role: string } | null;
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
  onOpenLogin,
  onLogout,
  onResetData,
  onExportBackup,
}) => {
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
                  Sistem RT
                </span>
                {isLoggedIn ? (
                  <span className="text-[10px] px-2 py-0.5 font-semibold rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-blue-400" />
                    <span>Mode Pengurus: {currentUser?.role || 'Bendahara'}</span>
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 font-semibold rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    Mode Warga (Lihat Saja)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Sistem Buku Kas & Iuran Pengelolaan Lingkungan (IPL)
              </p>
            </div>
          </div>

          {/* Right Controls: Balance + Auth Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Real All-Time Balance Card */}
            <div className="bg-slate-800/90 rounded-xl px-3.5 py-1.5 border border-slate-700/80 flex items-center gap-2.5 shadow-inner">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Wallet className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Saldo Kas Riil</div>
                <div className="text-sm font-extrabold text-emerald-400 font-mono tracking-tight">
                  {formatRupiah(realAllTimeBalance)}
                </div>
              </div>
            </div>

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

            {/* Backup & Reset Controls (Reset only visible to admin) */}
            <div className="flex items-center gap-1 pl-1 border-l border-slate-800">
              <button
                onClick={onExportBackup}
                title="Unduh Cadangan Data (JSON)"
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1 transition-colors border border-transparent hover:border-slate-700"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Backup</span>
              </button>

              {isLoggedIn && (
                <button
                  onClick={onResetData}
                  title="Kembalikan ke Contoh Data Default (Hanya Pengurus)"
                  className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1 transition-colors border border-transparent hover:border-slate-700"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}
            </div>
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
          {isLoggedIn ? (
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

              {/* <button
                onClick={() => setActiveTab('arsitektur')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs sm:text-sm whitespace-nowrap ${activeTab === 'arsitektur'
                    ? 'bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/20'
                    : 'text-indigo-300 hover:text-white hover:bg-indigo-950/50'
                  }`}
              >
                <Database className="w-4 h-4 text-indigo-200" />
                Arsitektur & Skema DB
              </button> */}

              {/* <button
                onClick={() => setActiveTab('nocode')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs sm:text-sm whitespace-nowrap ${activeTab === 'nocode'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                    : 'text-amber-300 hover:text-white hover:bg-amber-950/40'
                  }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                <span>Template Sheets (Opsi A)</span>
              </button> */}
            </>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-all text-xs sm:text-sm whitespace-nowrap border border-dashed border-slate-700 ml-1"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Tab Buku Kas & Warga (Khusus Pengurus)</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
