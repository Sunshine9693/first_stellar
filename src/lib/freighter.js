import {
  isConnected,
  requestAccess,
  getAddress,
  getNetwork,
  signTransaction,
} from '@stellar/freighter-api';
import { STELLAR_CONFIG } from './stellar';

/**
 * Checks if the Freighter browser extension is installed
 */
export async function checkFreighterInstalled() {
  try {
    const res = await isConnected();
    return !!res && (res.isConnected === true || res === true);
  } catch (err) {
    console.warn('Freighter isConnected check failed:', err);
    return false;
  }
}

/**
 * Requests wallet connection from Freighter
 */
export async function connectFreighterWallet() {
  try {
    const isInstalled = await checkFreighterInstalled();
    if (!isInstalled) {
      return {
        success: false,
        error: 'Freighter extension not detected. Please install Freighter from freighter.app or use demo mode.'
      };
    }

    const access = await requestAccess();
    if (access && access.error) {
      return { success: false, error: access.error };
    }

    const addressResult = await getAddress();
    const address = typeof addressResult === 'string' ? addressResult : addressResult?.address;

    if (!address) {
      return { success: false, error: 'Could not retrieve public key from Freighter.' };
    }

    let currentNetwork = 'TESTNET';
    try {
      const netRes = await getNetwork();
      currentNetwork = typeof netRes === 'string' ? netRes : netRes?.network || 'TESTNET';
    } catch (e) {
      console.warn('Could not fetch Freighter network:', e);
    }

    return {
      success: true,
      address,
      network: currentNetwork
    };
  } catch (err) {
    console.error('Freighter connection error:', err);
    return { success: false, error: err.message || 'Failed to connect Freighter wallet.' };
  }
}

/**
 * Signs an XDR transaction using Freighter
 */
export async function signWithFreighter(xdr) {
  try {
    const result = await signTransaction(xdr, {
      network: 'TESTNET',
      networkPassphrase: STELLAR_CONFIG.networkPassphrase
    });

    if (result && result.error) {
      throw new Error(result.error);
    }

    const signedXdr = typeof result === 'string' ? result : result?.signedTxXdr || result?.xdr;
    return signedXdr || result;
  } catch (err) {
    console.error('Freighter signing error:', err);
    throw err;
  }
}
