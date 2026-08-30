import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { checkFreighterInstalled, connectFreighterWallet, signWithFreighter } from '../lib/freighter';
import { isValidStellarAddress, horizonServer } from '../lib/stellar';

// User's default wallet address
const DEFAULT_ADDRESS = 'GCU6YXRJV3FWXM5ALSBLE7QPFM7UTFIIU56TVDNKRFPQXPKZ5HONA2DR';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(() => {
    return localStorage.getItem('stellar_student_address') || DEFAULT_ADDRESS;
  });
  const [isConnected, setIsConnected] = useState(true);
  const [isFreighter, setIsFreighter] = useState(false);
  const [freighterInstalled, setFreighterInstalled] = useState(false);
  const [network, setNetwork] = useState('TESTNET');

  // Account State
  const [isFunded, setIsFunded] = useState(false);
  const [balances, setBalances] = useState([]);
  const [xlmBalance, setXlmBalance] = useState('0.00');
  const [subentryCount, setSubentryCount] = useState(0);
  const [isLoadingAccount, setIsLoadingAccount] = useState(false);
  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Student Rewards State
  const [profile, setProfile] = useState(null);
  const [quests, setQuests] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);

  // Toast Notifications
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((title, message, type = 'info') => {
    const id = Date.now() + Math.random().toString();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Trigger celebration confetti
  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#eab308']
      });
    } catch (e) {
      console.log('Confetti error:', e);
    }
  }, []);

  // Check Freighter installation on mount
  useEffect(() => {
    checkFreighterInstalled().then(installed => {
      setFreighterInstalled(installed);
    });
  }, []);

  // Fetch account data from Horizon testnet via server API
  const fetchAccount = useCallback(async (targetAddress = address) => {
    if (!targetAddress || !isValidStellarAddress(targetAddress)) return;

    setIsLoadingAccount(true);
    try {
      const res = await fetch(`/api/account/${targetAddress}`);
      const data = await res.json();

      if (data.exists) {
        setIsFunded(true);
        setBalances(data.balances || []);
        const native = data.balances?.find(b => b.isNative || b.asset === 'XLM');
        setXlmBalance(native ? native.balance : '0.00');
        setSubentryCount(data.subentryCount || 0);
      } else {
        setIsFunded(false);
        setBalances([]);
        setXlmBalance('0.00');
        setSubentryCount(0);
      }
    } catch (err) {
      console.warn('Error fetching account:', err);
    } finally {
      setIsLoadingAccount(false);
    }
  }, [address]);

  // Fetch transaction history
  const fetchHistory = useCallback(async (targetAddress = address) => {
    if (!targetAddress || !isValidStellarAddress(targetAddress)) return;

    setIsLoadingHistory(true);
    try {
      const res = await fetch(`/api/history/${targetAddress}?limit=25`);
      const data = await res.json();
      setHistory(data.payments || []);
    } catch (err) {
      console.warn('Error fetching history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [address]);

  // Fetch Rewards profile & quests
  const fetchRewards = useCallback(async (targetAddress = address) => {
    if (!targetAddress) return;
    try {
      const res = await fetch(`/api/rewards/profile/${targetAddress}`);
      const data = await res.json();
      if (data.profile) setProfile(data.profile);
      if (data.quests) setQuests(data.quests);
      if (data.rewards) setRewards(data.rewards);
      if (data.quizQuestions) setQuizQuestions(data.quizQuestions);
    } catch (err) {
      console.warn('Error fetching rewards profile:', err);
    }
  }, [address]);

  // Fetch Leaderboard
  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch('/api/rewards/leaderboard');
      const data = await res.json();
      if (data.leaderboard) setLeaderboard(data.leaderboard);
    } catch (err) {
      console.warn('Error fetching leaderboard:', err);
    }
  }, []);

  // Initial and reactive refresh
  useEffect(() => {
    if (address) {
      localStorage.setItem('stellar_student_address', address);
      fetchAccount(address);
      fetchHistory(address);
      fetchRewards(address);
      fetchLeaderboard();
    }
  }, [address, fetchAccount, fetchHistory, fetchRewards, fetchLeaderboard]);

  // Connect Freighter
  const connectFreighter = async () => {
    try {
      const result = await connectFreighterWallet();
      if (result.success) {
        setAddress(result.address);
        setIsConnected(true);
        setIsFreighter(true);
        setNetwork(result.network || 'TESTNET');
        addToast('Freighter Connected', `Connected to ${result.address.slice(0, 4)}...${result.address.slice(-4)}`, 'success');
        return true;
      } else {
        addToast('Freighter Connection', result.error || 'Could not connect', 'error');
        return false;
      }
    } catch (err) {
      addToast('Connection Error', err.message, 'error');
      return false;
    }
  };

  // Switch to custom address or preset address
  const switchAddress = (newAddress) => {
    if (!isValidStellarAddress(newAddress)) {
      addToast('Invalid Address', 'Please provide a valid 56-character Stellar public key starting with G.', 'error');
      return false;
    }
    setAddress(newAddress.trim());
    setIsConnected(true);
    setIsFreighter(false);
    addToast('Account Switched', `Active account is now ${newAddress.slice(0, 4)}...${newAddress.slice(-4)}`, 'info');
    return true;
  };

  // Fund account using Friendbot (10,000 testnet XLM)
  const fundAccount = async () => {
    if (!address) return;
    try {
      addToast('Requesting Friendbot', 'Contacting Stellar Testnet Friendbot...', 'info');
      const res = await fetch(`/api/fund/${address}`, { method: 'POST' });
      const data = await res.json();

      if (res.ok && data.success) {
        addToast('Account Funded!', 'Received 10,000 Testnet XLM into your wallet.', 'success');
        triggerConfetti();
        await fetchAccount(address);
        await fetchHistory(address);
        await fetchRewards(address);
        return true;
      } else {
        addToast('Funding Notice', data.error || 'Account could not be funded. It may already be funded on testnet.', 'warning');
        await fetchAccount(address);
        return false;
      }
    } catch (err) {
      addToast('Faucet Error', err.message || 'Error reaching Friendbot faucet', 'error');
      return false;
    }
  };

  // Claim Quest points
  const claimQuest = async (questId, answers = null, workshopCode = null) => {
    if (!address) return { success: false, error: 'No wallet connected' };

    try {
      const res = await fetch('/api/rewards/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, questId, answers, workshopCode })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        addToast('Quest Completed! 🎉', `Earned +${data.pointsAwarded} Student Points!`, 'success');
        triggerConfetti();
        setProfile(data.profile);
        fetchLeaderboard();
        return { success: true, pointsAwarded: data.pointsAwarded };
      } else {
        addToast('Quest Incomplete', data.error || 'Failed to claim quest points', 'error');
        return { success: false, error: data.error };
      }
    } catch (err) {
      addToast('Error', err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  // Redeem Reward item
  const redeemReward = async (rewardId) => {
    if (!address) return { success: false, error: 'No wallet connected' };

    try {
      const res = await fetch('/api/rewards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, rewardId })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        addToast('Reward Redeemed! 🎁', data.message, 'success');
        triggerConfetti();
        setProfile(data.profile);
        fetchAccount(address);
        fetchHistory(address);
        return { success: true, redemption: data.redemption };
      } else {
        addToast('Redemption Failed', data.error || 'Unable to redeem reward', 'error');
        return { success: false, error: data.error };
      }
    } catch (err) {
      addToast('Error', err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  // Update Student Name
  const updateStudentName = async (name) => {
    if (!address || !name) return;
    try {
      const res = await fetch(`/api/rewards/profile/${address}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
        addToast('Profile Updated', 'Student name saved!', 'success');
      }
    } catch (e) {
      console.warn('Update name error:', e);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        isFreighter,
        freighterInstalled,
        network,
        isFunded,
        balances,
        xlmBalance,
        subentryCount,
        isLoadingAccount,
        history,
        isLoadingHistory,
        profile,
        quests,
        rewards,
        quizQuestions,
        leaderboard,
        toasts,
        addToast,
        removeToast,
        connectFreighter,
        switchAddress,
        fundAccount,
        refreshAccount: () => {
          fetchAccount(address);
          fetchHistory(address);
          fetchRewards(address);
          fetchLeaderboard();
        },
        claimQuest,
        redeemReward,
        updateStudentName,
        triggerConfetti
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
