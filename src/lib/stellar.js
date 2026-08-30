import * as StellarSdk from '@stellar/stellar-sdk';

export const STELLAR_CONFIG = {
  network: 'TESTNET',
  horizonUrl: 'https://horizon-testnet.stellar.org',
  rpcUrl: 'https://soroban-testnet.stellar.org',
  networkPassphrase: StellarSdk.Networks.TESTNET,
  friendbotUrl: 'https://friendbot.stellar.org',
  explorerBaseUrl: 'https://stellar.expert/explorer/testnet'
};

export const horizonServer = new StellarSdk.Horizon.Server(STELLAR_CONFIG.horizonUrl);

/**
 * Validates a Stellar Public Key (G...)
 */
export function isValidStellarAddress(address) {
  if (!address || typeof address !== 'string') return false;
  return StellarSdk.StrKey.isValidEd25519PublicKey(address.trim());
}

/**
 * Shortens a Stellar address for display (e.g. GCU6...A2DR)
 */
export function formatAddress(address, chars = 4) {
  if (!address) return '';
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Formats a number/string to 2-7 decimal places with commas
 */
export function formatXLM(amount, decimals = 2) {
  const num = parseFloat(amount);
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: 7
  });
}

/**
 * Builds an unsigned Payment transaction XDR string
 */
export async function buildPaymentTransaction({
  sourceAddress,
  destinationAddress,
  amount,
  memoText = '',
  memoType = 'text'
}) {
  if (!isValidStellarAddress(sourceAddress)) {
    throw new Error('Invalid source address.');
  }
  if (!isValidStellarAddress(destinationAddress)) {
    throw new Error('Invalid destination Stellar address.');
  }
  if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
    throw new Error('Please enter a valid positive payment amount.');
  }

  // Load account from Horizon to get sequence number
  const account = await horizonServer.loadAccount(sourceAddress);
  const baseFee = await horizonServer.fetchBaseFee();

  let builder = new StellarSdk.TransactionBuilder(account, {
    fee: (baseFee || StellarSdk.BASE_FEE).toString(),
    networkPassphrase: STELLAR_CONFIG.networkPassphrase
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: destinationAddress.trim(),
        asset: StellarSdk.Asset.native(),
        amount: amount.toString()
      })
    )
    .setTimeout(60);

  if (memoText && memoText.trim()) {
    if (memoType === 'id' && /^\d+$/.test(memoText.trim())) {
      builder = builder.addMemo(StellarSdk.Memo.id(memoText.trim()));
    } else {
      // Memo text maximum length is 28 bytes
      builder = builder.addMemo(StellarSdk.Memo.text(memoText.trim().slice(0, 28)));
    }
  }

  const transaction = builder.build();
  return transaction.toXDR();
}

/**
 * Submits a signed transaction XDR to the Horizon Testnet
 */
export async function submitSignedTransaction(signedXDR) {
  const tx = StellarSdk.TransactionBuilder.fromXDR(signedXDR, STELLAR_CONFIG.networkPassphrase);
  const response = await horizonServer.submitTransaction(tx);
  return response;
}
