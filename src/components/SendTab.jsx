import React, { useState } from 'react';
import {
  Send,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Copy,
  Info,
  QrCode,
  UserCheck
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import {
  isValidStellarAddress,
  formatAddress,
  formatXLM,
  buildPaymentTransaction,
  submitSignedTransaction,
  STELLAR_CONFIG
} from '../lib/stellar';
import { signWithFreighter } from '../lib/freighter';

export default function SendTab({ setActiveTab }) {
  const {
    address,
    isFreighter,
    isFunded,
    xlmBalance,
    subentryCount,
    refreshAccount,
    addToast,
    triggerConfetti
  } = useWallet();

  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [memoType, setMemoType] = useState('text');

  const [loading, setLoading] = useState(false);
  const [stepStatus, setStepStatus] = useState('');
  const [successTx, setSuccessTx] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Suggested Demo Student Recipient addresses for quick testing
  const demoRecipients = [
    { label: 'Campus Faucet', address: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5' },
    { label: 'Lab Partner (Alex)', address: 'GCKAZ7KNYW2P2Z4B7S5NMDOHW2XUUKDPLX26N2FVT2OYYK53P72R52Z5' },
    { label: 'Library Canteen', address: 'GA2C5RFPE6GCKMYYLMSZRMUSJVIDGGR2Z4OA65QW5O63TXENZJ5EBPNR' },
  ];

  const reserveBalance = (2 + (subentryCount || 0) * 0.5);
  const maxSpendable = Math.max(0, parseFloat(xlmBalance || 0) - reserveBalance - 0.0001);

  const handleMaxAmount = () => {
    setAmount(maxSpendable > 0 ? maxSpendable.toFixed(4) : '0');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessTx(null);

    const dest = destination.trim();
    if (!isValidStellarAddress(dest)) {
      setErrorMsg('Invalid destination Stellar address. Must be a 56-character public key starting with G.');
      return;
    }

    if (dest === address) {
      setErrorMsg('Destination cannot be your own wallet address.');
      return;
    }

    const sendAmt = parseFloat(amount);
    if (isNaN(sendAmt) || sendAmt <= 0) {
      setErrorMsg('Please enter a valid positive XLM amount.');
      return;
    }

    if (sendAmt > maxSpendable) {
      setErrorMsg(`Amount exceeds spendable balance (${maxSpendable.toFixed(4)} XLM). Stellar accounts require a minimum reserve.`);
      return;
    }

    setLoading(true);

    try {
      setStepStatus('Building transaction XDR...');
      const xdr = await buildPaymentTransaction({
        sourceAddress: address,
        destinationAddress: dest,
        amount: sendAmt.toString(),
        memoText: memo,
        memoType
      });

      let signedXdr = xdr;

      if (isFreighter) {
        setStepStatus('Please approve and sign in your Freighter wallet...');
        signedXdr = await signWithFreighter(xdr);
      } else {
        setStepStatus('Simulating student payment authorization...');
      }

      setStepStatus('Submitting payment to Stellar Horizon Testnet...');
      const result = await submitSignedTransaction(signedXdr);

      setSuccessTx({
        hash: result.hash,
        ledger: result.ledger,
        amount: sendAmt,
        destination: dest,
        timestamp: new Date().toISOString()
      });

      addToast('Payment Successful! 🚀', `Sent ${sendAmt} XLM on Stellar Testnet`, 'success');
      triggerConfetti();

      // Reset form
      setDestination('');
      setAmount('');
      setMemo('');
      refreshAccount();
    } catch (err) {
      console.error('Send error:', err);
      let msg = err.message || 'Transaction submission failed.';
      if (err.response?.data?.extras?.result_codes) {
        msg = `Stellar Error: ${JSON.stringify(err.response.data.extras.result_codes)}`;
      }
      setErrorMsg(msg);
      addToast('Transaction Failed', msg, 'error');
    } finally {
      setLoading(false);
      setStepStatus('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl glass-panel relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-md">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Send Stellar Lumens</h2>
            <p className="text-xs text-slate-400">
              Transfer native XLM securely on the Stellar Testnet in 3-5 seconds.
            </p>
          </div>
        </div>
      </div>

      {/* Main Payment Card */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card relative">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Destination Address Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Recipient Public Key (G...)
              </label>
              <span className="text-[11px] text-slate-500">Stellar G-Address</span>
            </div>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. GCKAZ7KNYW2P2Z4B7S5NMDOHW2XUUKDPLX26N2FVT2OYYK53P72R52Z5"
                value={destination}
                onChange={(e) => setDestination(e.target.value.trim())}
                className="w-full px-4 py-3 text-xs code-font glass-input rounded-xl text-white placeholder-slate-600 focus:outline-none"
              />
              {isValidStellarAddress(destination) && (
                <span className="absolute right-3 top-3 text-emerald-400">
                  <UserCheck className="w-4 h-4" />
                </span>
              )}
            </div>

            {/* Quick Peer Recipient chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-500 mr-1">Quick Select:</span>
              {demoRecipients.map((demo) => (
                <button
                  type="button"
                  key={demo.address}
                  onClick={() => setDestination(demo.address)}
                  className="px-2 py-0.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 text-[11px] transition"
                >
                  {demo.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Amount (XLM)
              </label>
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <span>Spendable: <b className="text-white font-mono">{maxSpendable.toFixed(2)}</b> XLM</span>
                <button
                  type="button"
                  onClick={handleMaxAmount}
                  className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 text-[10px] font-bold uppercase transition"
                >
                  MAX
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="number"
                step="0.0001"
                min="0.0001"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 text-base font-mono font-bold glass-input rounded-xl text-white placeholder-slate-600 focus:outline-none"
              />
              <span className="absolute right-4 top-3.5 text-xs font-bold text-blue-400">
                XLM
              </span>
            </div>
          </div>

          {/* Memo Field (Optional) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Transaction Memo (Optional)
              </label>
              <div className="flex gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setMemoType('text')}
                  className={`font-semibold ${memoType === 'text' ? 'text-blue-400' : 'text-slate-500'}`}
                >
                  Text (28 char)
                </button>
                <span className="text-slate-600">|</span>
                <button
                  type="button"
                  onClick={() => setMemoType('id')}
                  className={`font-semibold ${memoType === 'id' ? 'text-blue-400' : 'text-slate-500'}`}
                >
                  ID (uint64)
                </button>
              </div>
            </div>
            <input
              type="text"
              maxLength={memoType === 'text' ? 28 : 20}
              placeholder={memoType === 'text' ? "e.g. Workshop payment / Lunch" : "e.g. 102488"}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full px-4 py-2.5 text-xs glass-input rounded-xl text-white placeholder-slate-600 focus:outline-none"
            />
          </div>

          {/* Transaction Summary Card */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Network Base Fee:</span>
              <span className="text-slate-200 font-mono">0.00001 XLM (100 Stroops)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Estimated Settlement:</span>
              <span className="text-emerald-400 font-medium">~3.5 seconds</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Wallet Signer:</span>
              <span className="text-purple-300">{isFreighter ? 'Freighter Browser Extension' : 'Simulated Testnet Key'}</span>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Banner */}
          {successTx && (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 space-y-2 text-xs animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Transaction Confirmed on Stellar Testnet!</span>
              </div>
              <p className="text-slate-300">
                Transferred <b className="text-white font-mono">{successTx.amount} XLM</b> to{' '}
                <span className="font-mono">{formatAddress(successTx.destination, 6)}</span>.
              </p>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Tx: {formatAddress(successTx.hash, 8)}
                </span>
                <a
                  href={`${STELLAR_CONFIG.explorerBaseUrl}/tx/${successTx.hash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  <span>View on Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isFunded}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{stepStatus || 'Processing Payment...'}</span>
              </>
            ) : !isFunded ? (
              <span>Account Needs Funding via Faucet First</span>
            ) : (
              <>
                <span>Sign & Send Payment</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
