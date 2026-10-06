import React, { useState } from 'react';
import { X, Lock, KeyRound, AlertCircle, ShieldCheck, UserCheck } from 'lucide-react';
import { AuthUser } from '../types';

interface ModalLoginProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: (user: AuthUser) => void;
    reason?: string;
}

export const ModalLogin: React.FC<ModalLoginProps> = ({
    isOpen,
    onClose,
    onLoginSuccess,
    reason,
}) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        const u = username.trim().toLowerCase();
        const p = password.trim();

        // 1. Akun Super Admin (Administrator IT) -> Punya akses Google Cloud Firestore
        if (
            (u === 'superadmin' && (p === 'superadmin' || p === 'superadmin123')) ||
            (u === 'ketua' && (p === 'superadmin' || p === 'ketua'))
        ) {
            onLoginSuccess({
                username: u,
                role: 'superadmin',
                roleLabel: 'Super Admin (Administrator IT)',
            });
            setUsername('');
            setPassword('');
            onClose();
            return;
        }

        // 2. Akun Admin (Bendahara / Pengurus) -> Tidak bisa membuka konfigurasi Cloud Firestore
        if (
            (u === 'admin' && (p === 'admin' || p === 'admin123')) ||
            (u === 'bendahara' && (p === 'bendahara' || p === 'admin'))
        ) {
            onLoginSuccess({
                username: u,
                role: 'admin',
                roleLabel: 'Pengurus (Bendahara)',
            });
            setUsername('');
            setPassword('');
            onClose();
            return;
        }

        setErrorMsg('Username atau Password salah. Gunakan kredensial resmi pengurus atau tombol bantuan di bawah.');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-slate-900 text-white px-6 py-5 flex items-start justify-between relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-md">
                            <Lock className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-base text-white">Login Pengurus</h3>
                            <p className="text-xs text-emerald-400 font-medium">SWEET KATAPANG RESIDENCE</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors relative z-10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {reason && (
                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-amber-900">Akses Dibatasi</p>
                                <p className="mt-0.5">{reason}</p>
                            </div>
                        </div>
                    )}

                    {errorMsg && (
                        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Masukkan username"
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Masukkan password"
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 mt-2"
                        >
                            <KeyRound className="w-4 h-4" />
                            <span>Masuk Sekarang</span>
                        </button>
                    </form>

                    {/* Quick preset buttons */}
                    <div className="mt-5 pt-4 border-t border-slate-100">
                        <p className="text-[11px] font-semibold text-slate-500 mb-2">Pilih Akun Cepat:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setUsername('superadmin');
                                    setPassword('superadmin');
                                }}
                                className="p-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 rounded-xl text-left transition-colors"
                            >
                                <div className="flex items-center gap-1.5 font-bold text-xs">
                                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                                    <span>Super Admin</span>
                                </div>
                                <div className="text-[10px] text-purple-700 mt-0.5">
                                    <code>superadmin</code> / <code>superadmin</code> <br />
                                    <span className="font-semibold text-purple-900">Akses Penuh + Tab Arsitektur & Template</span>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setUsername('admin');
                                    setPassword('admin');
                                }}
                                className="p-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 rounded-xl text-left transition-colors"
                            >
                                <div className="flex items-center gap-1.5 font-bold text-xs">
                                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Admin (Bendahara)</span>
                                </div>
                                <div className="text-[10px] text-blue-700 mt-0.5">
                                    <code>admin</code> / <code>admin</code> <br />
                                    <span className="text-slate-600">Validasi Lunas, Kas & Warga (Tanpa Tab Arsitektur)</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

