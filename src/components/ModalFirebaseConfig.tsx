import React, { useState, useEffect } from 'react';
import {
    Cloud,
    CheckCircle,
    AlertCircle,
    Copy,
    ExternalLink,
    RefreshCw,
    Trash2,
    X,
    UploadCloud,
    Check,
    Zap,
} from 'lucide-react';
import {
    FirebaseConfig,
    getSavedFirebaseConfig,
    saveFirebaseConfig,
    clearFirebaseConfig,
    isFirebaseConfigured,
    syncLocalDataToFirestore,
} from '../services/firebase';
import { Warga, IPLTransaction, IPLPaymentItem, KasTransaction } from '../types';

interface ModalFirebaseConfigProps {
    isOpen: boolean;
    onClose: () => void;
    wargaList: Warga[];
    iplTransactions: IPLTransaction[];
    iplItems: IPLPaymentItem[];
    kasTransactions: KasTransaction[];
    onConfigChanged: () => void;
}

const FIRESTORE_TEST_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

export const ModalFirebaseConfig: React.FC<ModalFirebaseConfigProps> = ({
    isOpen,
    onClose,
    wargaList,
    iplTransactions,
    iplItems,
    kasTransactions,
    onConfigChanged,
}) => {
    const [rawInput, setRawInput] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [projectId, setProjectId] = useState('');
    const [authDomain, setAuthDomain] = useState('');
    const [storageBucket, setStorageBucket] = useState('');
    const [messagingSenderId, setMessagingSenderId] = useState('');
    const [appId, setAppId] = useState('');

    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [hasCopiedRules, setHasCopiedRules] = useState(false);

    const handleCopyRules = () => {
        navigator.clipboard.writeText(FIRESTORE_TEST_RULES);
        setHasCopiedRules(true);
        setTimeout(() => setHasCopiedRules(false), 3000);
    };

    useEffect(() => {
        if (isOpen) {
            const cfg = getSavedFirebaseConfig();
            if (cfg) {
                setApiKey(cfg.apiKey || '');
                setProjectId(cfg.projectId || '');
                setAuthDomain(cfg.authDomain || '');
                setStorageBucket(cfg.storageBucket || '');
                setMessagingSenderId(cfg.messagingSenderId || '');
                setAppId(cfg.appId || '');
                setIsConnected(true);
            } else {
                setIsConnected(false);
            }
            setStatusMsg(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Auto-parse when user pastes standard snippet from Firebase Console
    const handlePasteRaw = (text: string) => {
        setRawInput(text);
        const extract = (key: string) => {
            const match = text.match(new RegExp(`${key}\\s*:\\s*["']([^"']+)["']`));
            return match ? match[1] : '';
        };

        const parsedApiKey = extract('apiKey');
        const parsedProjectId = extract('projectId');
        const parsedAuthDomain = extract('authDomain');
        const parsedStorageBucket = extract('storageBucket');
        const parsedSenderId = extract('messagingSenderId');
        const parsedAppId = extract('appId');

        if (parsedApiKey && parsedProjectId) {
            setApiKey(parsedApiKey);
            setProjectId(parsedProjectId);
            if (parsedAuthDomain) setAuthDomain(parsedAuthDomain);
            if (parsedStorageBucket) setStorageBucket(parsedStorageBucket);
            if (parsedSenderId) setMessagingSenderId(parsedSenderId);
            if (parsedAppId) setAppId(parsedAppId);

            setStatusMsg({
                type: 'info',
                text: 'Konfigurasi Firebase terdeteksi otomatis! Klik "Simpan & Sambungkan" di bawah.',
            });
        }
    };

    const handleSave = () => {
        if (!apiKey.trim() || !projectId.trim()) {
            setStatusMsg({
                type: 'error',
                text: 'Wajib mengisi minimal API Key dan Project ID Firebase.',
            });
            return;
        }

        const config: FirebaseConfig = {
            apiKey: apiKey.trim(),
            projectId: projectId.trim(),
            authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
            storageBucket: storageBucket.trim() || `${projectId.trim()}.firebasestorage.app`,
            messagingSenderId: messagingSenderId.trim(),
            appId: appId.trim(),
        };

        saveFirebaseConfig(config);
        setIsConnected(true);
        setStatusMsg({
            type: 'success',
            text: 'Konfigurasi Firebase berhasil disimpan! Database Cloud Firestore aktif.',
        });
        onConfigChanged();
    };

    const handleUploadCurrentData = async () => {
        setIsUploading(true);
        setStatusMsg({ type: 'info', text: 'Sedang menyinkronkan seluruh data ke Google Firestore...' });

        const res = await syncLocalDataToFirestore({
            warga: wargaList,
            iplTransactions,
            iplItems,
            kasTransactions,
        });

        setIsUploading(false);
        if (res.success) {
            setStatusMsg({
                type: 'success',
                text: `Sukses! Seluruh data (${wargaList.length} warga & ${iplTransactions.length} transaksi) berhasil diunggah ke Firestore Cloud!`,
            });
        } else {
            setStatusMsg({
                type: 'error',
                text: `Gagal mengunggah: ${res.error}. Pastikan Security Rules di Firebase Console sudah diatur ke 'allow read, write: if true;' (Test Mode).`,
            });
        }
    };

    const handleDisconnect = () => {
        if (confirm('Apakah Anda yakin ingin memutuskan sambungan Cloud Firebase dan kembali ke mode penyimpanan lokal?')) {
            clearFirebaseConfig();
            setApiKey('');
            setProjectId('');
            setAuthDomain('');
            setStorageBucket('');
            setMessagingSenderId('');
            setAppId('');
            setRawInput('');
            setIsConnected(false);
            setStatusMsg({ type: 'info', text: 'Firebase diputuskan. Aplikasi beralih ke penyimpanan lokal/browser.' });
            onConfigChanged();
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
                {/* Header */}
                <div className="bg-linear-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-xs border border-white/20">
                            <Cloud className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-white">Google Cloud Firestore (Sinkronisasi Real-Time)</h3>
                            <p className="text-xs text-amber-100">
                                Hubungkan agar data kas & IPL otomatis tersinkron ke seluruh HP warga & pengurus
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                    {/* Status Badge */}
                    <div
                        className={`p-4 rounded-xl border flex items-center justify-between ${isConnected
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                : 'bg-amber-50 border-amber-200 text-amber-900'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            {isConnected ? (
                                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse" />
                            ) : (
                                <div className="w-3.5 h-3.5 rounded-full bg-amber-500" />
                            )}
                            <div>
                                <p className="font-bold text-sm">
                                    {isConnected
                                        ? `Terhubung ke Firebase (Project: ${projectId || 'Aktif'})`
                                        : 'Mode Offline / Penyimpanan Lokal Aktif'}
                                </p>
                                <p className="text-xs text-slate-600">
                                    {isConnected
                                        ? 'Setiap ada perubahan kas / IPL akan langsung otomatis muncul di HP warga lain secara real-time.'
                                        : 'Data saat ini hanya tersimpan di perangkat lokal. Sambungkan Firebase untuk sinkronisasi antar perangkat.'}
                                </p>
                            </div>
                        </div>
                        {isConnected && (
                            <button
                                onClick={handleDisconnect}
                                className="text-xs font-semibold px-2.5 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg flex items-center gap-1 transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" /> Putuskan
                            </button>
                        )}
                    </div>

                    {/* Alert Message */}
                    {statusMsg && (
                        <div
                            className={`p-3.5 rounded-xl text-sm flex items-start gap-2.5 border ${statusMsg.type === 'success'
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                    : statusMsg.type === 'error'
                                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                                        : 'bg-blue-50 border-blue-200 text-blue-800'
                                }`}
                        >
                            {statusMsg.type === 'success' && <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />}
                            {statusMsg.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />}
                            {statusMsg.type === 'info' && <RefreshCw className="w-5 h-5 shrink-0 text-blue-600 mt-0.5" />}
                            <span className="leading-relaxed">{statusMsg.text}</span>
                        </div>
                    )}

                    {/* Quick Guide */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 space-y-2">
                        <div className="flex items-center justify-between font-bold text-slate-800 text-sm mb-1">
                            <span>📋 Cara Mendapatkan Firebase Gratis (2 Menit):</span>
                            <a
                                href="https://console.firebase.google.com"
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1 text-xs"
                            >
                                Buka Firebase Console <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                        <ol className="list-decimal list-inside space-y-1 text-slate-600 leading-relaxed">
                            <li>
                                Buka <strong>console.firebase.google.com</strong> dan login dengan akun Google Anda (100% Gratis).
                            </li>
                            <li>
                                Klik <strong>"Add project"</strong>, beri nama misalnya: <code>sweet-katapang</code>.
                            </li>
                            <li>
                                Pilih menu <strong>Build ➔ Firestore Database</strong> ➔ Klik <strong>Create Database</strong> ➔ Pilih{' '}
                                <strong>Start in test mode</strong>.
                            </li>
                            <li>
                                Klik ikon <strong>Project Settings (Gerigi)</strong> di kiri atas ➔ Scroll ke bawah pada bagian{' '}
                                <strong>"Your apps"</strong>, klik ikon Web <code>&lt;/&gt;</code>.
                            </li>
                            <li>Salin kode konfigurasi yang muncul dan tempelkan pada kotak di bawah ini!</li>
                        </ol>
                    </div>

                    {/* Rules Warning Box */}
                    <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs text-amber-950 space-y-3 shadow-xs">
                        <div className="flex items-start gap-2.5">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-bold text-amber-950 text-sm">
                                    Cara Mengatasi "Izin Ditolak (Permission Denied)" di Firebase:
                                </p>
                                <p className="text-amber-800 text-xs mt-1 leading-relaxed">
                                    Secara bawaan Google mengunci database. Anda cukup mengganti isi tab <strong>Rules</strong> di Firestore menjadi kode di bawah ini, lalu klik <strong>Publish</strong>.
                                </p>
                            </div>
                        </div>

                        {/* Code Box */}
                        <div className="relative bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-[11px] overflow-x-auto border border-slate-800">
                            <pre>{FIRESTORE_TEST_RULES}</pre>
                            <button
                                onClick={handleCopyRules}
                                className="absolute top-2 right-2 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-[10px] flex items-center gap-1 shadow-sm transition-all"
                            >
                                {hasCopiedRules ? (
                                    <>
                                        <Check className="w-3 h-3" />
                                        <span>Tersalin!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3 h-3" />
                                        <span>Salin Kode Rules</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-amber-900 pt-1">
                            <span>Setelah ditempel di Firebase, jangan lupa klik tombol <strong>Publish</strong>.</span>
                            {projectId && (
                                <a
                                    href={`https://console.firebase.google.com/project/${projectId}/firestore/rules`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-bold text-amber-900 hover:text-amber-950 underline flex items-center gap-1"
                                >
                                    Buka Tab Rules Langsung <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Paste Raw Snippet */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                            <span>Tempel Kode firebaseConfig (Otomatis Dibaca):</span>
                            <span className="text-[11px] font-normal text-slate-500">Bisa paste langsung seluruh blok kode</span>
                        </label>
                        <textarea
                            rows={3}
                            value={rawInput}
                            onChange={(e) => handlePasteRaw(e.target.value)}
                            placeholder={`const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  projectId: "sweet-katapang-...",\n  ...\n};`}
                            className="w-full text-xs font-mono p-3 bg-slate-900 text-emerald-400 rounded-xl border border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                        />
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Project ID <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={projectId}
                                onChange={(e) => setProjectId(e.target.value)}
                                placeholder="sweet-katapang-12345"
                                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                API Key <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="AIzaSy..."
                                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleSave}
                            className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                        >
                            <Zap className="w-4 h-4" /> Simpan & Sambungkan Cloud
                        </button>

                        {isConnected && (
                            <button
                                onClick={handleUploadCurrentData}
                                disabled={isUploading}
                                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                            >
                                {isUploading ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <UploadCloud className="w-4 h-4" />
                                )}
                                Unggah Data Saat Ini ke Cloud
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};
