import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Download,
  Copy,
  Check,
  ExternalLink,
  Coins,
  QrCode,
  Share2,
  GraduationCap,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { formatAddress, STELLAR_CONFIG } from '../lib/stellar';
import FaucetModal from './FaucetModal';

export default function ReceiveTab() {
  const { address, profile, xlmBalance, addToast } = useWallet();
  const [copied, setCopied] = useState(false);
  const [reqAmount, setReqAmount] = useState('');
  const [reqMemo, setReqMemo] = useState('');
  const [isFaucetOpen, setIsFaucetOpen] = useState(false);

  // Generate Stellar SEP-0007 / standard payment URI
  let qrValue = `stellar:pay?destination=${address}`;
  if (reqAmount && parseFloat(reqAmount) > 0) {
    qrValue += `&amount=${reqAmount}`;
  }
  if (reqMemo.trim()) {
    qrValue += `&memo=${encodeURIComponent(reqMemo.trim())}`;
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    addToast('Copied to Clipboard', 'Your Stellar testnet public key is ready to share.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPayLink = () => {
    navigator.clipboard.writeText(qrValue);
    addToast('Payment Link Copied', 'Payment request link copied to clipboard.', 'info');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl glass-panel relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-md">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Receive XLM & Student ID</h2>
            <p className="text-xs text-slate-400">
              Share your Stellar address or QR code to receive lumens and campus rewards.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: QR Code Card */}
        <div className="md:col-span-6 p-6 sm:p-8 rounded-3xl glass-card text-center flex flex-col items-center justify-between space-y-6">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              <QrCode className="w-3.5 h-3.5" />
              Stellar Testnet QR Code
            </span>
            <p className="text-xs text-slate-400 pt-1">
              Scan with Freighter Mobile or any Stellar-compatible wallet
            </p>
          </div>

          {/* High-Contrast QR Frame */}
          <div className="p-4 bg-white rounded-2xl shadow-2xl border-4 border-slate-700/50 inline-block transition-transform hover:scale-105 duration-300">
            <QRCodeSVG
              value={qrValue}
              size={190}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Quick Copy Box */}
          <div className="w-full space-y-2">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-left flex items-center justify-between gap-2">
              <span className="code-font text-xs text-slate-300 truncate font-mono">
                {address}
              </span>
              <button
                onClick={handleCopyAddress}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                title="Copy Address"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyAddress}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Address Copied' : 'Copy Full Address'}</span>
              </button>

              <button
                onClick={() => setIsFaucetOpen(true)}
                className="py-2.5 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 rounded-xl text-xs font-semibold transition"
                title="Need testnet XLM? Claim faucet"
              >
                <Coins className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Student Digital Badge & Custom Request */}
        <div className="md:col-span-6 space-y-6">
          {/* Digital Student ID Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-purple-950/80 border border-indigo-500/30 shadow-2xl relative overflow-hidden space-y-4">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between pb-3 border-b border-indigo-500/20">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-bold text-white tracking-wider uppercase">
                  Stellar Campus ID
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                VERIFIED STUDENT
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">{profile?.name || 'Stellar Scholar'}</h3>
              <p className="text-xs text-indigo-300 font-mono mt-0.5">
                ID: {profile?.studentId || `STU-${address.slice(0, 4)}-${address.slice(-4)}`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-indigo-500/20">
                <span className="text-[10px] text-slate-400 block">Rank Title</span>
                <span className="font-semibold text-white">{profile?.rankTitle || 'Stellar Cadet'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-indigo-500/20">
                <span className="text-[10px] text-slate-400 block">Reward Points</span>
                <span className="font-bold text-amber-400 font-mono">{profile?.points || 100} PTS</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] text-indigo-300/80">
              <span>Network: Stellar Testnet</span>
              <a
                href={`${STELLAR_CONFIG.explorerBaseUrl}/account/${address}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-indigo-400 hover:text-white transition"
              >
                <span>Explorer View</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Payment Request Link Builder */}
          <div className="p-5 rounded-2xl glass-panel space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Create Payment Request
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Requested XLM</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 25"
                  value={reqAmount}
                  onChange={(e) => setReqAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono glass-input rounded-lg text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Memo Note</label>
                <input
                  type="text"
                  maxLength={28}
                  placeholder="e.g. Pizza split"
                  value={reqMemo}
                  onChange={(e) => setReqMemo(e.target.value)}
                  className="w-full px-3 py-2 text-xs glass-input rounded-lg text-white focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleCopyPayLink}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Copy Shareable Payment Link</span>
            </button>
          </div>
        </div>
      </div>

      {/* Faucet Modal */}
      <FaucetModal isOpen={isFaucetOpen} onClose={() => setIsFaucetOpen(false)} />
    </div>
  );
}
