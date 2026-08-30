import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  Zap,
  Coffee,
  Shirt,
  Key,
  GraduationCap,
  CheckCircle2,
  Coins,
  ArrowRight,
  Trophy,
  CalendarCheck,
  Code2,
  Send,
  Loader2,
  Check,
  Gift
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { formatAddress } from '../lib/stellar';
import QuizModal from './QuizModal';
import FaucetModal from './FaucetModal';

export default function RewardsTab({ setActiveTab }) {
  const {
    address,
    profile,
    quests,
    rewards,
    leaderboard,
    claimQuest,
    redeemReward,
    addToast
  } = useWallet();

  const [activeQuizQuest, setActiveQuizQuest] = useState(null);
  const [isFaucetOpen, setIsFaucetOpen] = useState(false);
  const [workshopCode, setWorkshopCode] = useState('');
  const [isClaimingCode, setIsClaimingCode] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(null);
  const [redeemedVouchers, setRedeemedVouchers] = useState([]);

  const points = profile?.points || 100;
  const completedQuests = profile?.completedQuests || [];

  const handleWorkshopSubmit = async (e) => {
    e.preventDefault();
    if (!workshopCode.trim()) return;

    setIsClaimingCode(true);
    const res = await claimQuest('workshop-attendance', null, workshopCode);
    setIsClaimingCode(false);
    if (res.success) {
      setWorkshopCode('');
    }
  };

  const handleRedeem = async (reward) => {
    if (points < reward.cost) {
      addToast('Insufficient Points', `You need ${reward.cost} PTS. You currently have ${points} PTS. Complete more quests!`, 'warning');
      return;
    }

    setIsRedeeming(reward.id);
    const res = await redeemReward(reward.id);
    setIsRedeeming(null);

    if (res.success && res.redemption) {
      setRedeemedVouchers(prev => [res.redemption, ...prev]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Rewards Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900/90 to-blue-950/80 border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Web3 Rewards Hub</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Student Quests & Point Perks
            </h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Complete educational challenges, attend campus workshops, test payments, and redeem points for real on-chain Testnet XLM, student perks, and verified certifications.
            </p>
          </div>

          {/* Points Highlight Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-purple-500/30 text-center min-w-[180px] shadow-xl">
            <span className="text-[11px] text-purple-300 uppercase font-semibold block">Your Point Balance</span>
            <div className="text-3xl font-extrabold text-white font-mono mt-1">
              {points} <span className="text-sm font-bold text-purple-400">PTS</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Tier: <b className="text-white">{profile?.rankTitle || 'Stellar Cadet'}</b>
            </span>
          </div>
        </div>
      </div>

      {/* Quests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Active Student Quests</h3>
          </div>
          <span className="text-xs text-slate-400">
            {completedQuests.length} of {quests.length} Completed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quests.map((quest) => {
            const isCompleted = completedQuests.includes(quest.id);

            return (
              <div
                key={quest.id}
                className={`p-5 rounded-2xl glass-card transition-all relative overflow-hidden flex flex-col justify-between ${
                  isCompleted ? 'border-emerald-500/30 bg-emerald-950/10' : 'hover:border-purple-500/40'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-semibold border border-slate-700">
                      {quest.category}
                    </span>
                    <span className="font-extrabold text-xs text-purple-400 code-font">
                      +{quest.points} PTS
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>{quest.title}</span>
                    {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </h4>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {quest.description}
                  </p>
                </div>

                {/* Quest Action Area */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Difficulty: {quest.difficulty}</span>

                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                      <Check className="w-3.5 h-3.5" />
                      <span>Completed</span>
                    </span>
                  ) : quest.type === 'quiz' ? (
                    <button
                      onClick={() => setActiveQuizQuest(quest)}
                      className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-purple-600/20 flex items-center gap-1.5"
                    >
                      <span>Take Quiz</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : quest.id === 'fund-faucet' ? (
                    <button
                      onClick={() => setIsFaucetOpen(true)}
                      className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-amber-600/20 flex items-center gap-1.5"
                    >
                      <span>Claim Faucet</span>
                      <Coins className="w-3.5 h-3.5" />
                    </button>
                  ) : quest.id === 'first-payment' ? (
                    <button
                      onClick={() => setActiveTab('send')}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <span>Send XLM</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  ) : quest.type === 'code' ? (
                    <form onSubmit={handleWorkshopSubmit} className="flex gap-1.5 items-center">
                      <input
                        type="text"
                        placeholder="Code: STELLAR2026"
                        value={workshopCode}
                        onChange={(e) => setWorkshopCode(e.target.value)}
                        className="px-2.5 py-1 text-xs glass-input rounded-lg text-white uppercase font-mono w-32 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={isClaimingCode || !workshopCode.trim()}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
                      >
                        {isClaimingCode ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Check-in'}
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rewards Catalog Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">Rewards Store & Redemption</h3>
          </div>
          <span className="text-xs text-slate-400">
            Redeem points for instant campus perks & on-chain payouts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {rewards.map((item) => {
            const canAfford = points >= item.cost;
            const isSelected = isRedeeming === item.id;

            let iconComponent = <Coffee className="w-6 h-6 text-amber-400" />;
            if (item.id === 'xlm-payout-10') iconComponent = <Zap className="w-6 h-6 text-blue-400" />;
            if (item.id === 'stellar-swag-kit') iconComponent = <Shirt className="w-6 h-6 text-purple-400" />;
            if (item.id === 'library-lab-pass') iconComponent = <Key className="w-6 h-6 text-emerald-400" />;
            if (item.id === 'nft-certificate') iconComponent = <Award className="w-6 h-6 text-pink-400" />;

            return (
              <div
                key={item.id}
                className="p-5 rounded-3xl glass-card flex flex-col justify-between space-y-4 hover:border-slate-600 transition group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-md">
                      {iconComponent}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold border border-slate-700">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition">
                      {item.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Cost</span>
                    <span className="text-sm font-bold text-amber-400 font-mono">
                      {item.cost} PTS
                    </span>
                  </div>

                  <button
                    onClick={() => handleRedeem(item)}
                    disabled={!canAfford || isSelected}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
                      canAfford
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Redeeming...</span>
                      </>
                    ) : (
                      <>
                        <span>{canAfford ? 'Redeem Item' : 'Need More PTS'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Redeemed Vouchers History */}
      {redeemedVouchers.length > 0 && (
        <div className="p-5 rounded-3xl glass-panel space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Gift className="w-4 h-4 text-emerald-400" />
            <span>Active Student Vouchers & Redemptions</span>
          </h4>
          <div className="space-y-2">
            {redeemedVouchers.map((v) => (
              <div
                key={v.id}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-white">{v.rewardName}</span>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Voucher Code: <b className="text-amber-300">{v.voucherCode}</b>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                    {v.status}
                  </span>
                  {v.txHash && (
                    <div className="text-[10px] text-blue-400 font-mono mt-0.5">
                      On-Chain XLM Sent
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student Leaderboard */}
      <div className="p-6 rounded-3xl glass-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Campus Student Leaderboard</h3>
          </div>
          <span className="text-xs text-slate-400">Top Stellar Learners</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="pb-3 px-2">Rank</th>
                <th className="pb-3 px-2">Student Name</th>
                <th className="pb-3 px-2">Tier / Level</th>
                <th className="pb-3 px-2">Badges</th>
                <th className="pb-3 px-2 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {leaderboard.map((student, idx) => {
                const isCurrent = student.fullAddress === address;

                return (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-850/50 transition ${
                      isCurrent ? 'bg-purple-950/30 text-white font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-[11px] ${
                          idx === 0
                            ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                            : idx === 1
                            ? 'bg-slate-300 text-slate-950'
                            : idx === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <span>{student.name}</span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{student.address}</span>
                    </td>
                    <td className="py-3 px-2 text-slate-300">
                      {student.rankTitle} (Lvl {student.level})
                    </td>
                    <td className="py-3 px-2 font-mono text-slate-400">
                      {student.badgesCount || 1} 🎖️
                    </td>
                    <td className="py-3 px-2 text-right font-bold text-amber-400 font-mono">
                      {student.points} PTS
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quiz Modal */}
      {activeQuizQuest && (
        <QuizModal
          quest={activeQuizQuest}
          isOpen={!!activeQuizQuest}
          onClose={() => setActiveQuizQuest(null)}
        />
      )}

      {/* Faucet Modal */}
      <FaucetModal isOpen={isFaucetOpen} onClose={() => setIsFaucetOpen(false)} />
    </div>
  );
}
