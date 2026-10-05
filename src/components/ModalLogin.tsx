import React, { useState } from 'react';
import { X, Lock, KeyRound, AlertCircle } from 'lucide-react';

interface ModalLoginProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: (user: { username: string; role: string }) => void;
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

        // Username dan password ditetapkan: admin / admin
        if (u === 'admin' && p === 'admin') {
            onLoginSuccess({ username: 'admin', role: 'Pengurus RT' });
            setUsername('');
            setPassword('');
            onClose();
        } else {
            setErrorMsg('Username atau Password salah. Silakan periksa kembali.');
        }
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
                            <h3 className="font-extrabold text-base text-white">Login Pengurus RT</h3>
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

                    <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                        Silakan masukkan kredensial pengurus untuk dapat melakukan pencatatan transaksi, mengelola buku kas, dan mengubah data warga.
                    </p>

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
                            <span>Masuk sebagai Pengurus</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
