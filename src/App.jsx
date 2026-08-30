import React, { useState } from 'react';
import { WalletProvider, useWallet } from './context/WalletContext';
import Navbar from './components/Navbar';
import OverviewTab from './components/OverviewTab';
import SendTab from './components/SendTab';
import ReceiveTab from './components/ReceiveTab';
import HistoryTab from './components/HistoryTab';
import RewardsTab from './components/RewardsTab';
import BadgesTab from './components/BadgesTab';
import ToastContainer from './components/ToastContainer';
import {
  ExternalLink,
  BookOpen,
  Code2,
  ShieldCheck,
  Zap,
  Globe2,
  Coins
} from 'lucide-react';
import { STELLAR_CONFIG } from './lib/stellar';

function AppContent() {
  const [activeTab, setActiveTab] = useState('overview');
  const { isFunded } = useWallet();

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-x-hidden">
      {/* Dynamic Cosmic Glow Effects */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-slow" />
      <div className="fixed top-1/3 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-slow" />
      <div className="fixed bottom-10 left-1/3 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Top Header */}
      <div>
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Notice for unfunded testnet account */}
        {!isFunded && (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border-b border-amber-500/20 py-2 px-4 text-center text-xs text-amber-300">
            <span className="font-semibold">Testnet Account Notice:</span> Your account is not yet funded on Stellar Testnet.{' '}
            <button
              onClick={() => setActiveTab('overview')}
              className="underline font-bold text-amber-200 hover:text-white"
            >
              Click here to claim 10,000 Free Testnet XLM via Friendbot.
            </button>
          </div>
        )}

        {/* Main Tab Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && <OverviewTab setActiveTab={setActiveTab} />}
          {activeTab === 'send' && <SendTab setActiveTab={setActiveTab} />}
          {activeTab === 'receive' && <ReceiveTab />}
          {activeTab === 'history' && <HistoryTab />}
          {activeTab === 'rewards' && <RewardsTab setActiveTab={setActiveTab} />}
          {activeTab === 'badges' && <BadgesTab />}
        </main>
      </div>

      {/* Global Toast Alert Notifications */}
      <ToastContainer />

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs">
            <div className="space-y-2">
              <span className="font-bold text-white tracking-wide uppercase text-[11px] block">
                Stellar Student Wallet
              </span>
              <p className="text-slate-400 leading-relaxed">
                An educational decentralized application demonstrating wallet connections, payment transactions, and reward systems on Stellar Testnet.
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-white tracking-wide uppercase text-[11px] block">
                Stellar Protocol
              </span>
              <ul className="space-y-1.5 text-slate-400">
                <li>
                  <a href="https://developers.stellar.org" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition inline-flex items-center gap-1">
                    <span>Developer Documentation</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a href="https://freighter.app" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition inline-flex items-center gap-1">
                    <span>Freighter Wallet Extension</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a href="https://stellar.expert/explorer/testnet" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition inline-flex items-center gap-1">
                    <span>Stellar.Expert Explorer</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-white tracking-wide uppercase text-[11px] block">
                Network Endpoints
              </span>
              <ul className="space-y-1.5 text-slate-400 font-mono text-[11px]">
                <li className="truncate">Horizon: horizon-testnet.stellar.org</li>
                <li className="truncate">Soroban RPC: soroban-testnet.stellar.org</li>
                <li className="truncate">Passphrase: Test SDF Network ; September 2015</li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-white tracking-wide uppercase text-[11px] block">
                Student Perks
              </span>
              <p className="text-slate-400 leading-relaxed">
                Solve weekly quizzes and submit testnet transactions to earn reward points redeemable for on-chain XLM and campus perks.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <div>
              Built for <span className="text-slate-300 font-medium">Stellar Developer Workshop</span> • Testnet Environment
            </div>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Horizon Testnet Online
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
}
