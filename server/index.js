import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as StellarSdk from '@stellar/stellar-sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const FRIENDBOT_URL = 'https://friendbot.stellar.org';
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

const server = new StellarSdk.Horizon.Server(HORIZON_URL);

// Server-side distributor keypair for automated on-chain reward payouts
let distributorKeypair = null;

async function initDistributor() {
  try {
    const keyPath = path.join(__dirname, 'data', 'distributor.json');
    if (fs.existsSync(keyPath)) {
      const data = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      distributorKeypair = StellarSdk.Keypair.fromSecret(data.secret);
      console.log(`[Stellar Distributor] Loaded existing distributor: ${distributorKeypair.publicKey()}`);
    } else {
      distributorKeypair = StellarSdk.Keypair.random();
      fs.writeFileSync(keyPath, JSON.stringify({
        publicKey: distributorKeypair.publicKey(),
        secret: distributorKeypair.secret()
      }, null, 2));
      console.log(`[Stellar Distributor] Created new distributor: ${distributorKeypair.publicKey()}`);
    }

    // Check if distributor has funds, else fund via friendbot
    try {
      await server.loadAccount(distributorKeypair.publicKey());
      console.log(`[Stellar Distributor] Account is active and funded.`);
    } catch (e) {
      console.log(`[Stellar Distributor] Funding distributor via Friendbot...`);
      const res = await fetch(`${FRIENDBOT_URL}?addr=${distributorKeypair.publicKey()}`);
      if (res.ok) {
        console.log(`[Stellar Distributor] Successfully funded distributor.`);
      }
    }
  } catch (err) {
    console.warn(`[Stellar Distributor] Warning during initialization:`, err.message);
  }
}

// Data store helpers
const STORE_PATH = path.join(__dirname, 'data', 'store.json');

function getStore() {
  try {
    if (!fs.existsSync(STORE_PATH)) {
      return { quests: [], rewards: [], quizQuestions: {}, profiles: {}, redemptions: [] };
    }
    return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
  } catch (e) {
    console.error('Error reading store:', e);
    return { quests: [], rewards: [], quizQuestions: {}, profiles: {}, redemptions: [] };
  }
}

function saveStore(store) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
  } catch (e) {
    console.error('Error writing store:', e);
  }
}

// Helper to get or create student profile
function getOrCreateProfile(address) {
  const store = getStore();
  if (!store.profiles) store.profiles = {};

  if (!store.profiles[address]) {
    store.profiles[address] = {
      address,
      name: 'Stellar Explorer',
      studentId: `STU-${address.slice(0, 4)}-${address.slice(-4)}`,
      points: 100, // Welcome bonus
      completedQuests: [],
      badges: [
        {
          id: 'stellar-cadet',
          name: 'Stellar Cadet',
          description: 'Joined the Stellar Student Network',
          icon: 'Sparkles',
          unlockedAt: new Date().toISOString()
        }
      ],
      level: 1,
      rankTitle: 'Stellar Cadet',
      joinedAt: new Date().toISOString()
    };
    saveStore(store);
  }

  // Calculate level based on points
  const profile = store.profiles[address];
  const pts = profile.points || 0;
  if (pts >= 1000) {
    profile.level = 4;
    profile.rankTitle = 'Supernova Master';
  } else if (pts >= 600) {
    profile.level = 3;
    profile.rankTitle = 'Soroban Scholar';
  } else if (pts >= 300) {
    profile.level = 2;
    profile.rankTitle = 'Orbit Pioneer';
  } else {
    profile.level = 1;
    profile.rankTitle = 'Stellar Cadet';
  }

  return profile;
}

// ==================== ROUTES ====================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    network: 'testnet',
    horizonUrl: HORIZON_URL,
    distributor: distributorKeypair ? distributorKeypair.publicKey() : null,
    timestamp: new Date().toISOString()
  });
});

// Friendbot Faucet Proxy (Solves CORS and handles initial account creation)
app.post('/api/fund/:address', async (req, res) => {
  const { address } = req.params;
  if (!address || !StellarSdk.StrKey.isValidEd25519PublicKey(address)) {
    return res.status(400).json({ error: 'Invalid Stellar public key format.' });
  }

  try {
    const friendbotResponse = await fetch(`${FRIENDBOT_URL}?addr=${encodeURIComponent(address)}`);
    const data = await friendbotResponse.json();

    if (!friendbotResponse.ok) {
      return res.status(400).json({
        error: data.detail || data.title || 'Friendbot funding request failed. Account may already be funded.'
      });
    }

    // Award quest points for funding faucet
    const store = getStore();
    const profile = getOrCreateProfile(address);
    if (!profile.completedQuests.includes('fund-faucet')) {
      profile.completedQuests.push('fund-faucet');
      profile.points = (profile.points || 0) + 100;
      profile.badges.push({
        id: 'faucet-funder',
        name: 'Friendbot Explorer',
        description: 'Successfully claimed testnet lumens from Friendbot',
        icon: 'Coins',
        unlockedAt: new Date().toISOString()
      });
      store.profiles[address] = profile;
      saveStore(store);
    }

    return res.json({
      success: true,
      message: 'Account funded with 10,000 Testnet XLM!',
      result: data
    });
  } catch (err) {
    console.error('Faucet proxy error:', err);
    return res.status(500).json({ error: err.message || 'Internal error funding testnet account' });
  }
});

// Account Balances & Sequence
app.get('/api/account/:address', async (req, res) => {
  const { address } = req.params;
  if (!address || !StellarSdk.StrKey.isValidEd25519PublicKey(address)) {
    return res.status(400).json({ error: 'Invalid Stellar address.' });
  }

  try {
    const account = await server.loadAccount(address);
    const balances = account.balances.map(b => ({
      asset: b.asset_type === 'native' ? 'XLM' : `${b.asset_code}:${b.asset_issuer}`,
      balance: b.balance,
      isNative: b.asset_type === 'native',
      limit: b.limit,
      buyingLiabilities: b.buying_liabilities,
      sellingLiabilities: b.selling_liabilities,
    }));

    return res.json({
      exists: true,
      id: account.id,
      sequence: account.sequence,
      subentryCount: account.subentry_count,
      balances,
      thresholds: account.thresholds,
      flags: account.flags,
    });
  } catch (err) {
    if (err.name === 'NotFoundError' || err.response?.status === 404) {
      return res.json({
        exists: false,
        message: 'Account is not yet funded on Stellar Testnet.',
        balances: []
      });
    }
    return res.status(500).json({ error: err.message });
  }
});

// Live Transaction & Payment History
app.get('/api/history/:address', async (req, res) => {
  const { address } = req.params;
  const limit = parseInt(req.query.limit) || 20;

  if (!address || !StellarSdk.StrKey.isValidEd25519PublicKey(address)) {
    return res.status(400).json({ error: 'Invalid Stellar address.' });
  }

  try {
    const paymentsCall = await server.payments()
      .forAccount(address)
      .order('desc')
      .limit(limit)
      .call();

    const payments = paymentsCall.records.map(record => {
      const isOutgoing = record.from === address || record.source_account === address;
      const isCreateAccount = record.type === 'create_account';
      
      let amount = '0';
      let asset = 'XLM';
      let counterparty = '';

      if (isCreateAccount) {
        amount = record.starting_balance;
        counterparty = record.funder === address ? record.account : record.funder;
      } else {
        amount = record.amount || '0';
        asset = record.asset_type === 'native' ? 'XLM' : record.asset_code;
        counterparty = isOutgoing ? record.to : record.from;
      }

      return {
        id: record.id,
        hash: record.transaction_hash,
        type: record.type,
        isOutgoing,
        isIncoming: !isOutgoing,
        isCreateAccount,
        amount,
        asset,
        counterparty,
        createdAt: record.created_at,
        memo: record.transaction ? record.transaction.memo : undefined
      };
    });

    return res.json({ payments });
  } catch (err) {
    if (err.name === 'NotFoundError' || err.response?.status === 404) {
      return res.json({ payments: [] });
    }
    console.error('Error fetching history:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Get Student Profile
app.get('/api/rewards/profile/:address', (req, res) => {
  const { address } = req.params;
  if (!address) return res.status(400).json({ error: 'Address required' });
  const profile = getOrCreateProfile(address);
  const store = getStore();

  res.json({
    profile,
    quests: store.quests,
    rewards: store.rewards,
    quizQuestions: store.quizQuestions
  });
});

// Update Student Profile Name/Details
app.post('/api/rewards/profile/:address', (req, res) => {
  const { address } = req.params;
  const { name } = req.body;
  if (!address) return res.status(400).json({ error: 'Address required' });

  const store = getStore();
  const profile = getOrCreateProfile(address);
  if (name) profile.name = name.trim();
  store.profiles[address] = profile;
  saveStore(store);

  res.json({ success: true, profile });
});

// Submit Quiz & Claim Quest
app.post('/api/rewards/claim', async (req, res) => {
  const { address, questId, answers, workshopCode } = req.body;
  if (!address || !questId) {
    return res.status(400).json({ error: 'Missing address or questId' });
  }

  const store = getStore();
  const profile = getOrCreateProfile(address);

  if (profile.completedQuests.includes(questId)) {
    return res.status(400).json({ error: 'Quest already completed!' });
  }

  const quest = store.quests.find(q => q.id === questId);
  if (!quest) {
    return res.status(404).json({ error: 'Quest not found' });
  }

  // Quiz Verification
  if (quest.type === 'quiz') {
    const questions = store.quizQuestions[questId];
    if (!questions) return res.status(400).json({ error: 'No questions configured for this quiz' });

    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (answers && answers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    if (correctCount < questions.length) {
      return res.status(400).json({
        error: `You scored ${correctCount}/${questions.length}. You need a perfect score to claim points. Try again!`,
        score: correctCount,
        total: questions.length
      });
    }
  }

  // Workshop Verification
  if (quest.type === 'code') {
    const validCodes = ['STELLAR2026', 'CAMPUS_XLM', 'SOROBAN_BUILD', 'DEV_WORKSHOP'];
    if (!workshopCode || !validCodes.includes(workshopCode.toUpperCase().trim())) {
      return res.status(400).json({ error: 'Invalid Workshop Attendance Code. Use STELLAR2026 or ask your workshop lead!' });
    }
  }

  // Action / Transaction Verification
  if (quest.id === 'first-payment') {
    // Check Horizon for transactions
    try {
      const txs = await server.payments().forAccount(address).limit(1).call();
      if (txs.records.length === 0) {
        return res.status(400).json({ error: 'No transactions found for this account on testnet yet. Send a payment first!' });
      }
    } catch (e) {
      return res.status(400).json({ error: 'Account not active on testnet yet.' });
    }
  }

  // Award Points & Badges
  profile.completedQuests.push(questId);
  profile.points = (profile.points || 0) + quest.points;

  // Milestone Badges
  if (quest.id === 'stellar-quiz-101') {
    profile.badges.push({
      id: 'quiz-master-101',
      name: 'Stellar 101 Scholar',
      description: 'Passed the Stellar 101 knowledge test with 100% accuracy',
      icon: 'Award',
      unlockedAt: new Date().toISOString()
    });
  }

  if (quest.id === 'workshop-attendance') {
    profile.badges.push({
      id: 'workshop-pioneer',
      name: 'Workshop Pioneer',
      description: 'Attended the Campus Stellar Workshop',
      icon: 'Trophy',
      unlockedAt: new Date().toISOString()
    });
  }

  store.profiles[address] = profile;
  saveStore(store);

  return res.json({
    success: true,
    pointsAwarded: quest.points,
    newTotalPoints: profile.points,
    profile
  });
});

// Redeem Reward (with real on-chain XLM payout if requested!)
app.post('/api/rewards/redeem', async (req, res) => {
  const { address, rewardId } = req.body;
  if (!address || !rewardId) {
    return res.status(400).json({ error: 'Missing address or rewardId' });
  }

  const store = getStore();
  const profile = getOrCreateProfile(address);
  const reward = store.rewards.find(r => r.id === rewardId);

  if (!reward) {
    return res.status(404).json({ error: 'Reward item not found' });
  }

  if ((profile.points || 0) < reward.cost) {
    return res.status(400).json({
      error: `Insufficient student points! You have ${profile.points} PTS, but this item costs ${reward.cost} PTS.`
    });
  }

  let txHash = null;
  let onChainSuccess = false;

  // If it's an on-chain crypto payout, send real Testnet XLM to student!
  if (reward.isCrypto && reward.xlmAmount && distributorKeypair) {
    try {
      console.log(`[Payout] Sending ${reward.xlmAmount} XLM to student ${address}...`);
      const distAccount = await server.loadAccount(distributorKeypair.publicKey());
      
      const transaction = new StellarSdk.TransactionBuilder(distAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: address,
            asset: StellarSdk.Asset.native(),
            amount: reward.xlmAmount.toString()
          })
        )
        .addMemo(StellarSdk.Memo.text('Student Reward Payout'))
        .setTimeout(30)
        .build();

      transaction.sign(distributorKeypair);
      const submitRes = await server.submitTransaction(transaction);
      txHash = submitRes.hash;
      onChainSuccess = true;
      console.log(`[Payout] Payout sent successfully! Tx: ${txHash}`);
    } catch (payoutErr) {
      console.error('[Payout] On-chain payout error:', payoutErr);
      // If payment failed because destination not funded, use friendbot fallback
      try {
        await fetch(`${FRIENDBOT_URL}?addr=${encodeURIComponent(address)}`);
        onChainSuccess = true;
      } catch (e) {
        console.warn('Fallback funding error:', e);
      }
    }
  }

  // Deduct points
  profile.points -= reward.cost;

  const redemptionRecord = {
    id: `RED-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    address,
    rewardId: reward.id,
    rewardName: reward.name,
    cost: reward.cost,
    redeemedAt: new Date().toISOString(),
    txHash,
    status: 'Completed',
    voucherCode: `STU-PERK-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
  };

  if (!store.redemptions) store.redemptions = [];
  store.redemptions.unshift(redemptionRecord);
  store.profiles[address] = profile;
  saveStore(store);

  return res.json({
    success: true,
    message: `Successfully redeemed ${reward.name}!`,
    redemption: redemptionRecord,
    profile
  });
});

// Student Leaderboard
app.get('/api/rewards/leaderboard', (req, res) => {
  const store = getStore();
  const profiles = Object.values(store.profiles || {});
  
  // Add some demo peer student entries if list is small
  const demoStudents = [
    { address: 'GA2C...STUDENT1', name: 'Alex Rivera (CS Major)', points: 950, rankTitle: 'Soroban Scholar', level: 3, badgesCount: 4 },
    { address: 'GB7X...STUDENT2', name: 'Priya Sharma (FinTech)', points: 820, rankTitle: 'Soroban Scholar', level: 3, badgesCount: 3 },
    { address: 'GD9M...STUDENT3', name: 'Marcus Chen (Web3 Club)', points: 540, rankTitle: 'Orbit Pioneer', level: 2, badgesCount: 2 },
    { address: 'GCOK...STUDENT4', name: 'Elena Rostova (Data Science)', points: 410, rankTitle: 'Orbit Pioneer', level: 2, badgesCount: 2 },
  ];

  const actualList = profiles.map(p => ({
    address: `${p.address.slice(0, 4)}...${p.address.slice(-4)}`,
    fullAddress: p.address,
    name: p.name || 'Anonymous Scholar',
    points: p.points || 0,
    rankTitle: p.rankTitle,
    level: p.level,
    badgesCount: (p.badges || []).length
  }));

  const combined = [...actualList];
  demoStudents.forEach(demo => {
    if (!combined.some(c => c.name === demo.name)) {
      combined.push(demo);
    }
  });

  combined.sort((a, b) => b.points - a.points);

  res.json({ leaderboard: combined.slice(0, 15) });
});

// Start Server
app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`🚀 Stellar Student Wallet API listening on port ${PORT}`);
  console.log(`🌐 Stellar Horizon Testnet: ${HORIZON_URL}`);
  console.log(`====================================================`);
  await initDistributor();
});
