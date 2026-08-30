import React, { useState } from 'react';
import {
  Wallet,
  Sparkles,
  Coins,
  RefreshCw,
  Award,
  ChevronDown,
  Globe2,
  GraduationCap
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { formatAddress } from '../lib/stellar';
import AccountModal from './AccountModal';
import FaucetModal from './FaucetModal';

export default function Navbar({ activeTab, setActiveTab }) {
  const {
    address,
    isFreighter,
    network,
    xlmBalance,
    profile,
    isLoadingAccount,
    refreshAccount
  } = useWallet();

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isFaucetModalOpen, setIsFaucetModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-lg shadow-blue-500/20 text-white">
                <GraduationCap className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                    Stellar<span className="text-gradient">Student</span>
                  </span>
                  <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Testnet
                  </span>
                </div>
                <p className="hidden sm:block text-[11px] text-slate-400 font-medium -mt-0.5">
                  Wallet & Educational Reward Protocol
                </p>
              </div>
            </div>

            {/* Nav Tabs (Desktop) */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              {[
                { id: 'overview', label: 'Dashboard' },
                { id: 'send', label: 'Send XLM' },
                { id: 'receive', label: 'Receive' },
                { id: 'history', label: 'Transactions' },
                { id: 'rewards', label: 'Quests & Perks' },
                { id: 'badges', label: 'Badges' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Right Side Stats & Actions */}
            <div className="flex items-center gap-2.5">
              {/* Student Points Pill */}
              <button
                onClick={() => setActiveTab('rewards')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/40 text-purple-300 transition group"
                title="View Student Rewards"
              >
                <Award className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                <div className="text-left leading-none">
                  <span className="text-[10px] text-purple-400 block font-medium">REWARD PTS</span>
                  <span className="text-xs font-bold text-white code-font">
                    {profile ? profile.points : '100'} PTS
                  </span>
                </div>
              </button>

              {/* Faucet Quick Trigger */}
              <button
                onClick={() => setIsFaucetModalOpen(true)}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 text-xs font-semibold transition"
                title="Claim 10,000 Free Testnet XLM"
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>Faucet</span>
              </button>

              {/* Refresh Horizon Balance */}
              <button
                onClick={refreshAccount}
                disabled={isLoadingAccount}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-50"
                title="Refresh Ledger Balance"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingAccount ? 'animate-spin text-blue-400' : ''}`} />
              </button>

              {/* Wallet Button / Account Modal Opener */}
              <button
                onClick={() => setIsAccountModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700/80 hover:border-blue-500/50 transition group shadow-sm"
              >
                <div className={`w-2 h-2 rounded-full ${isFreighter ? 'bg-blue-400' : 'bg-emerald-400'} animate-pulse`} />
                <span className="text-xs font-semibold text-slate-200 code-font">
                  {formatAddress(address, 4)}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden border-t border-slate-800/80 bg-slate-950/90 px-4 py-2 flex items-center justify-around overflow-x-auto gap-2">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'send', label: 'Send' },
            { id: 'receive', label: 'Receive' },
            { id: 'history', label: 'History' },
            { id: 'rewards', label: 'Quests' },
            { id: 'badges', label: 'Badges' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Account Switcher Modal */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />

      {/* Friendbot Faucet Modal */}
      <FaucetModal
        isOpen={isFaucetModalOpen}
        onClose={() => setIsFaucetModalOpen(false)}
      />
    </>
  );
}
