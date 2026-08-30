import React, { useState } from 'react';
import { X, Wallet, Key, Check, Copy, ExternalLink, ShieldCheck, RefreshCw } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { formatAddress, isValidStellarAddress, STELLAR_CONFIG } from '../lib/stellar';

const USER_PRESET_ADDRESS = 'GCU6YXRJV3FWXM5ALSBLE7QPFM7UTFIIU56TVDNKRFPQXPKZ5HONA2DR';

export default function AccountModal({ isOpen, onClose }) {
  const {
    address,
    isFreighter,
    freighterInstalled,
    connectFreighter,
    switchAddress,
    addToast
  } = useWallet();

  const [inputAddress, setInputAddress] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    addToast('Copied', 'Wallet address copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCustomSwitch = (e) => {
    e.preventDefault();
    if (!inputAddress.trim()) return;
    if (switchAddress(inputAddress.trim())) {
      setInputAddress('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg p-6 bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden">
        {/* Decorative ambient background */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Stellar Account Manager</h3>
              <p className="text-xs text-slate-400">Manage your Stellar Testnet keys & connection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Account Card */}
        <div className="mt-5 p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold text-slate-300">ACTIVE TESTNET ACCOUNT</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {isFreighter ? 'Freighter Extension' : 'Custom / Preset Key'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="code-font text-xs text-slate-200 break-all select-all font-mono">
              {address}
            </span>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-md transition"
              title="Copy Address"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs">
            <a
              href={`${STELLAR_CONFIG.explorerBaseUrl}/account/${address}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition"
            >
              <span>View on Stellar.Expert Testnet</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Quick Connect & Switch Presets */}
        <div className="mt-5 space-y-3">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Switch Account Source
          </label>

          {/* Freighter Extension Button */}
          <button
            onClick={async () => {
              await connectFreighter();
              onClose();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 transition text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
                F
              </div>
              <div>
                <div className="text-sm font-semibold text-white group-hover:text-blue-300 transition">
                  Connect Freighter Wallet
                </div>
                <div className="text-xs text-slate-400">
                  {freighterInstalled ? 'Extension detected ready' : 'Requires Freighter extension'}
                </div>
              </div>
            </div>
            {isFreighter && (
              <span className="text-xs font-semibold text-blue-400 bg-blue-500/20 px-2 py-1 rounded-md">
                Active
              </span>
            )}
          </button>

          {/* User Preset Account Button */}
          <button
            onClick={() => {
              switchAddress(USER_PRESET_ADDRESS);
              onClose();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 transition text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white shadow-md">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white group-hover:text-purple-300 transition">
                  Student Default Preset
                </div>
                <div className="text-xs text-slate-400 code-font">
                  {formatAddress(USER_PRESET_ADDRESS, 6)}
                </div>
              </div>
            </div>
            {address === USER_PRESET_ADDRESS && !isFreighter && (
              <span className="text-xs font-semibold text-purple-400 bg-purple-500/20 px-2 py-1 rounded-md">
                Active
              </span>
            )}
          </button>
        </div>

        {/* Custom Stellar Address Input */}
        <form onSubmit={handleCustomSwitch} className="mt-5 pt-4 border-t border-slate-800">
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Load Any Stellar Public Key (G...)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. GCU6YXRJV3FW..."
              value={inputAddress}
              onChange={(e) => setInputAddress(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputAddress.trim()}
              className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg transition"
            >
              Load
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
