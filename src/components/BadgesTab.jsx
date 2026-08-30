import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  Trophy,
  CheckCircle2,
  Coins,
  ShieldCheck,
  GraduationCap,
  Printer,
  Edit2,
  Check
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { formatAddress, STELLAR_CONFIG } from '../lib/stellar';

export default function BadgesTab() {
  const { profile, address, updateStudentName } = useWallet();
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.name || 'Stellar Explorer');

  const badges = profile?.badges || [];
  const studentName = profile?.name || 'Stellar Explorer';

  const allPossibleBadges = [
    {
      id: 'stellar-cadet',
      name: 'Stellar Cadet',
      description: 'Connected and registered your student wallet on Stellar Testnet',
      icon: 'Sparkles',
      category: 'Onboarding'
    },
    {
      id: 'faucet-funder',
      name: 'Friendbot Pioneer',
      description: 'Claimed testnet lumens from Friendbot for learning & experimentation',
      icon: 'Coins',
      category: 'Testnet'
    },
    {
      id: 'quiz-master-101',
      name: 'Stellar 101 Scholar',
      description: 'Demonstrated mastery of Stellar consensus and fast payment finality',
      icon: 'Award',
      category: 'Education'
    },
    {
      id: 'workshop-pioneer',
      name: 'Campus Workshop Attendee',
      description: 'Checked into the weekly Stellar Web3 Campus Developer Workshop',
      icon: 'Trophy',
      category: 'Campus'
    },
    {
      id: 'soroban-pioneer',
      name: 'Soroban Smart Contract Pioneer',
      description: 'Explored Rust WebAssembly smart contracts on Stellar',
      icon: 'ShieldCheck',
      category: 'Smart Contracts'
    }
  ];

  const handleSaveName = (e) => {
    e.preventDefault();
    if (nameInput.trim()) {
      updateStudentName(nameInput.trim());
      setIsEditingName(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl glass-panel relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-pink-500/10 text-pink-400 border border-pink-500/20 shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Student Badges & Certifications</h2>
              <p className="text-xs text-slate-400">
                Unlock verifiable digital credentials as you progress through Stellar Web3 milestones.
              </p>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Certificate</span>
          </button>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Achievement Badges</span>
          </h3>
          <span className="text-xs text-slate-400">
            {badges.length} of {allPossibleBadges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allPossibleBadges.map((badgeDef) => {
            const earned = badges.find((b) => b.id === badgeDef.id);

            return (
              <div
                key={badgeDef.id}
                className={`p-5 rounded-3xl transition-all border flex flex-col justify-between ${
                  earned
                    ? 'bg-gradient-to-br from-slate-900/90 to-purple-950/40 border-purple-500/40 shadow-xl shadow-purple-500/10'
                    : 'bg-slate-950/40 border-slate-800 opacity-60'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg ${
                        earned
                          ? 'bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-purple-500/30'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {badgeDef.id === 'stellar-cadet' ? '🚀' : badgeDef.id === 'faucet-funder' ? '🪙' : badgeDef.id === 'quiz-master-101' ? '📜' : badgeDef.id === 'workshop-pioneer' ? '🎓' : '🛡️'}
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        earned
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {earned ? 'UNLOCKED' : 'LOCKED'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white">{badgeDef.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {badgeDef.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
                  {earned ? (
                    <span className="text-purple-300 font-mono">
                      Unlocked: {new Date(earned.unlockedAt || Date.now()).toLocaleDateString()}
                    </span>
                  ) : (
                    <span>Complete quests in Rewards Hub to unlock</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Verifiable Student Certificate */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 border-2 border-indigo-500/30 shadow-2xl relative overflow-hidden text-center space-y-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Certificate Watermark Header */}
        <div className="flex items-center justify-center gap-2 text-indigo-400 uppercase tracking-widest text-xs font-extrabold">
          <GraduationCap className="w-5 h-5" />
          <span>Stellar Student Web3 Network Certificate</span>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-white">
            Certificate of Blockchain Achievement
          </h2>
          <p className="text-xs text-slate-400">This credential certifies that</p>
        </div>

        {/* Student Name */}
        <div className="py-2">
          {!isEditingName ? (
            <div className="inline-flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingName(true)}>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gradient underline decoration-indigo-500/40 underline-offset-8">
                {studentName}
              </h3>
              <Edit2 className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
            </div>
          ) : (
            <form onSubmit={handleSaveName} className="inline-flex items-center gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="px-4 py-2 rounded-xl text-base bg-slate-950 border border-blue-500 text-white focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl"
              >
                <Check className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
          Has actively participated in the <b className="text-white">Stellar Testnet Student Developer Protocol</b>, demonstrated competency with Stellar Consensus, Freighter wallet operations, and accumulated <b className="text-amber-400 font-mono">{profile?.points || 100} Reward Points</b>.
        </p>

        {/* Footer info & signatures */}
        <div className="pt-6 border-t border-indigo-500/20 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Stellar Public Key</span>
            <span className="font-mono text-slate-300 code-font text-[11px] truncate block">
              {address}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Current Rank Title</span>
            <span className="font-semibold text-purple-300">
              {profile?.rankTitle || 'Stellar Cadet'} (Level {profile?.level || 1})
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Network & Status</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified Stellar Testnet
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
