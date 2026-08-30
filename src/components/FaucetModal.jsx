import React, { useState } from 'react';
import { X, Sparkles, Coins, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { formatAddress } from '../lib/stellar';

export default function FaucetModal({ isOpen, onClose }) {
  const { address, fundAccount, isFunded, xlmBalance } = useWallet();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFund = async () => {
    setLoading(true);
    setSuccess(false);
    const result = await fundAccount();
    setLoading(false);
    if (result) {
      setSuccess(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md p-6 bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -z-10" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Stellar Friendbot Faucet</h3>
              <p className="text-xs text-slate-400">Claim 10,000 Free Testnet XLM</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-blue-500/20 border border-amber-500/30 text-amber-400 shadow-xl mb-3">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>

          <h4 className="text-xl font-bold text-white">Top Up 10,000 Testnet Lumens</h4>
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
            Friendbot is Stellar's automated testnet faucet for developers and students. Get free XLM to test payments and explore Soroban contracts.
          </p>

          <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-left">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Target Wallet:</span>
              <span className="font-mono text-slate-200">{formatAddress(address, 6)}</span>
            </div>
            <div className="mt-1 flex justify-between text-xs text-slate-400">
              <span>Current Balance:</span>
              <span className="font-semibold text-amber-400">{xlmBalance} XLM</span>
            </div>
          </div>

          {success ? (
            <div className="mt-5 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>10,000 XLM successfully credited! +100 Student Points unlocked!</span>
            </div>
          ) : null}

          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition"
            >
              Close
            </button>
            <button
              onClick={handleFund}
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Contacting Faucet...</span>
                </>
              ) : (
                <>
                  <span>Claim 10,000 XLM</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
