import React, { useState } from 'react';
import {
  Coins,
  Send,
  Download,
  Award,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  ShieldCheck,
  Zap,
  TrendingUp,
  Activity,
  Layers,
  GraduationCap
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { formatAddress, formatXLM, STELLAR_CONFIG } from '../lib/stellar';
import FaucetModal from './FaucetModal';
import QuizModal from './QuizModal';

export default function OverviewTab({ setActiveTab }) {
  const {
    address,
    isFreighter,
    isFunded,
    xlmBalance,
    subentryCount,
    history,
    profile,
    quests,
    addToast
  } = useWallet();

  const [isFaucetOpen, setIsFaucetOpen] = useState(false);
  const [activeQuizQuest, setActiveQuizQuest] = useState(null);

  // Approximate USD value (for educational display, 1 XLM ~ $0.12)
  const usdValue = (parseFloat(xlmBalance || 0) * 0.12).toFixed(2);
  const reserveBalance = (2 + (subentryCount || 0) * 0.5).toFixed(1);
  const spendableBalance = Math.max(0, parseFloat(xlmBalance || 0) - parseFloat(reserveBalance)).toFixed(2);

  // Student level progress
  const points = profile?.points || 100;
  const level = profile?.level || 1;
  const rankTitle = profile?.rankTitle || 'Stellar Cadet';

  let nextTarget = 300;
  let prevTarget = 0;
  if (level === 2) {
    prevTarget = 300;
    nextTarget = 600;
  } else if (level === 3) {
    prevTarget = 600;
    nextTarget = 1000;
  } else if (level >= 4) {
    prevTarget = 1000;
    nextTarget = 2000;
  }
  const progressPercent = Math.min(100, Math.max(10, ((points - prevTarget) / (nextTarget - prevTarget)) * 100));

  const pendingQuests = (quests || []).filter(
    q => !(profile?.completedQuests || []).includes(q.id)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-blue-950/40 border border-slate-800/80 shadow-2xl backdrop-blur-xl">
        {/* Glow Spheres */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Balance & Account Details */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Stellar Testnet Account
              </span>
              {!isFunded && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium animate-pulse">
                  Needs Funding
                </span>
              )}
            </div>

            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Total Available Lumens
              </p>
              <div className="flex items-baseline gap-3 mt-1">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-mono">
                  {formatXLM(xlmBalance)}
                </h1>
                <span className="text-xl sm:text-2xl font-bold text-blue-400">XLM</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                ≈ ${usdValue} USD <span className="text-slate-500">•</span> Reserve: {reserveBalance} XLM <span className="text-slate-500">•</span> Spendable: {spendableBalance} XLM
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              <button
                onClick={() => setActiveTab('send')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/30 hover:scale-[1.02]"
              >
                <Send className="w-4 h-4" />
                <span>Send XLM</span>
              </button>

              <button
                onClick={() => setActiveTab('receive')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition hover:scale-[1.02]"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Receive / QR</span>
              </button>

              <button
                onClick={() => setIsFaucetOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition hover:scale-[1.02]"
              >
                <Coins className="w-4 h-4 text-amber-400" />
                <span>Friendbot Faucet</span>
              </button>
            </div>
          </div>

          {/* Student Level & Quest Card */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-950/60 border border-slate-800/90 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{profile?.name || 'Stellar Scholar'}</h3>
                  <p className="text-xs text-purple-300 font-medium">Rank: {rankTitle}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Level</span>
                <span className="text-lg font-extrabold text-white font-mono">{level}</span>
              </div>
            </div>

            {/* Level Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-400">
                <span>{points} Points</span>
                <span>Next Tier: {nextTarget} PTS</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
              <span className="text-slate-400">Badges Unlocked: <b className="text-white font-mono">{(profile?.badges || []).length}</b></span>
              <button
                onClick={() => setActiveTab('rewards')}
                className="text-purple-400 hover:text-purple-300 font-semibold inline-flex items-center gap-1 transition"
              >
                <span>Reward Center</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Network & Live Ledger Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-panel space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Stellar Network</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-base font-bold text-white">Testnet Live</p>
          <p className="text-[11px] text-emerald-400 font-medium">Horizon 200 OK</p>
        </div>

        <div className="p-4 rounded-2xl glass-panel space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Settlement Time</span>
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-base font-bold text-white">3 - 5 Seconds</p>
          <p className="text-[11px] text-slate-400">SCP Consensus</p>
        </div>

        <div className="p-4 rounded-2xl glass-panel space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Standard Fee</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-base font-bold text-white">0.00001 XLM</p>
          <p className="text-[11px] text-slate-400">100 Stroops</p>
        </div>

        <div className="p-4 rounded-2xl glass-panel space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Wallet Client</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-base font-bold text-white">{isFreighter ? 'Freighter Ext.' : 'Web SDK'}</p>
          <p className="text-[11px] text-purple-400 code-font">{formatAddress(address, 4)}</p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Activity */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span>Recent Testnet Activity</span>
            </h3>
            <button
              onClick={() => setActiveTab('history')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="rounded-2xl glass-panel divide-y divide-slate-800/80 overflow-hidden">
            {history.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/60 text-slate-500 flex items-center justify-center mx-auto">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-300">No Transactions Yet</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Fund your account using the Friendbot faucet or make your first testnet transfer.
                  </p>
                </div>
                <button
                  onClick={() => setIsFaucetOpen(true)}
                  className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-semibold transition"
                >
                  Fund with Friendbot
                </button>
              </div>
            ) : (
              history.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-850/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        item.isOutgoing
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {item.isOutgoing ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200">
                        {item.isOutgoing ? 'Sent XLM' : item.isCreateAccount ? 'Account Created' : 'Received XLM'}
                      </div>
                      <div className="text-[11px] text-slate-500 code-font">
                        {formatAddress(item.counterparty, 4)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-xs font-bold font-mono ${
                        item.isOutgoing ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {item.isOutgoing ? '-' : '+'}{formatXLM(item.amount)} {item.asset}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Featured Quests */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              <span>Student Learning Quests</span>
            </h3>
            <button
              onClick={() => setActiveTab('rewards')}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition"
            >
              All Quests
            </button>
          </div>

          <div className="space-y-3">
            {pendingQuests.slice(0, 3).map((quest) => (
              <div
                key={quest.id}
                className="p-4 rounded-2xl glass-card glass-card-hover flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{quest.title}</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 text-[10px] font-semibold border border-purple-500/20">
                      +{quest.points} PTS
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {quest.description}
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (quest.type === 'quiz') {
                      setActiveQuizQuest(quest);
                    } else if (quest.id === 'fund-faucet') {
                      setIsFaucetOpen(true);
                    } else {
                      setActiveTab('rewards');
                    }
                  }}
                  className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 text-xs font-bold transition shadow-sm"
                >
                  Start
                </button>
              </div>
            ))}

            {pendingQuests.length === 0 && (
              <div className="p-6 rounded-2xl glass-panel text-center">
                <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-white">All Current Quests Completed!</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Visit the Rewards Store to redeem your student points for coffee vouchers, swag, or testnet XLM.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Faucet Modal */}
      <FaucetModal isOpen={isFaucetOpen} onClose={() => setIsFaucetOpen(false)} />

      {/* Quiz Modal */}
      {activeQuizQuest && (
        <QuizModal
          quest={activeQuizQuest}
          isOpen={!!activeQuizQuest}
          onClose={() => setActiveQuizQuest(null)}
        />
      )}
    </div>
  );
}
