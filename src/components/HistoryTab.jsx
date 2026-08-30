import React, { useState } from 'react';
import {
  History,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  Search,
  Filter,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Calendar,
  Layers
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { formatAddress, formatXLM, STELLAR_CONFIG } from '../lib/stellar';

export default function HistoryTab() {
  const { history, isLoadingHistory, refreshAccount, address, addToast } = useWallet();
  const [filterType, setFilterType] = useState('all'); // all | incoming | outgoing | create
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedHash, setCopiedHash] = useState(null);

  const handleCopyHash = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    addToast('Copied', 'Transaction hash copied to clipboard', 'info');
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredHistory = history.filter((item) => {
    // Filter by type
    if (filterType === 'incoming' && !item.isIncoming) return false;
    if (filterType === 'outgoing' && !item.isOutgoing) return false;
    if (filterType === 'create' && !item.isCreateAccount) return false;

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchHash = item.hash?.toLowerCase().includes(q);
      const matchParty = item.counterparty?.toLowerCase().includes(q);
      const matchMemo = item.memo?.toLowerCase().includes(q);
      const matchType = item.type?.toLowerCase().includes(q);
      return matchHash || matchParty || matchMemo || matchType;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl glass-panel relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-md">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Stellar Ledger Transactions</h2>
            <p className="text-xs text-slate-400">
              Verified testnet payments, settlements, and account events on Horizon.
            </p>
          </div>
        </div>

        <button
          onClick={refreshAccount}
          disabled={isLoadingHistory}
          className="self-start sm:self-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHistory ? 'animate-spin text-blue-400' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Transactions' },
            { id: 'incoming', label: 'Incoming (+)' },
            { id: 'outgoing', label: 'Outgoing (-)' },
            { id: 'create', label: 'Account Created' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterType === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by address, hash, memo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs glass-input rounded-xl text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Transaction List */}
      <div className="rounded-3xl glass-card divide-y divide-slate-800/80 overflow-hidden shadow-xl">
        {isLoadingHistory && history.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-400" />
            <p className="text-xs">Querying Stellar Testnet Horizon server...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Layers className="w-8 h-8 text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-300">No Transactions Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? 'No transactions match your current search criteria.'
                : 'No payments recorded on testnet for this account yet. Send or claim lumens to see live records.'}
            </p>
          </div>
        ) : (
          filteredHistory.map((item) => {
            const dateObj = new Date(item.createdAt);
            const formattedDate = dateObj.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });
            const formattedTime = dateObj.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-850/50 transition group"
              >
                {/* Left Side: Icon & Address/Type */}
                <div className="flex items-start sm:items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0 ${
                      item.isOutgoing
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {item.isOutgoing ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : (
                      <ArrowDownLeft className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {item.isCreateAccount
                          ? 'Account Created & Funded'
                          : item.isOutgoing
                          ? 'Payment Sent'
                          : 'Payment Received'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] uppercase font-mono">
                        {item.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{item.isOutgoing ? 'To:' : 'From:'}</span>
                      <span className="code-font text-slate-300 font-mono">
                        {formatAddress(item.counterparty, 6)}
                      </span>
                      {item.memo && (
                        <span className="px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/40 text-[10px]">
                          Memo: {item.memo}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Amount & Explorer Link */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                  <div
                    className={`text-sm font-extrabold font-mono ${
                      item.isOutgoing ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {item.isOutgoing ? '-' : '+'}{formatXLM(item.amount)} {item.asset}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                    <span>{formattedDate} {formattedTime}</span>
                    <span>•</span>
                    <button
                      onClick={() => handleCopyHash(item.hash)}
                      className="hover:text-slate-300 transition"
                      title="Copy Tx Hash"
                    >
                      {copiedHash === item.hash ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    <a
                      href={`${STELLAR_CONFIG.explorerBaseUrl}/tx/${item.hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition inline-flex items-center gap-0.5"
                      title="View on Stellar.Expert"
                    >
                      <span>Explorer</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
