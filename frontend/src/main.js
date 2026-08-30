import { createClient } from 'genlayer-js';
import { testnetBradbury } from 'genlayer-js/chains';
import { TransactionStatus } from 'genlayer-js/types';

const CONTRACT_ADDRESS = import.meta.env.VITE_TRUSTGUARD_CONTRACT;
const statusEl = document.querySelector('#status');
const resultEl = document.querySelector('#result');
const button = document.querySelector('#verify');
const networkEl = document.querySelector('#network');
const contractEl = document.querySelector('#contract');

const BRADBURY_CHAIN_ID = '0x107d'; // 4221
const BRADBURY_RPC_URL = 'https://rpc-bradbury.genlayer.com';
const BRADBURY_CHAIN_NAME = 'GenLayer Testnet Bradbury';

if (networkEl) networkEl.textContent = BRADBURY_CHAIN_NAME;
if (contractEl) contractEl.textContent = CONTRACT_ADDRESS || 'Not configured';

function setStatus(text) {
  if (statusEl) statusEl.textContent = text;
}

function showResult(value) {
  if (resultEl) {
    resultEl.textContent = typeof value === 'string'
      ? value
      : JSON.stringify(value, null, 2);
  }
}

async function ensureBradbury(ethereum) {
  const currentChainId = await ethereum.request({ method: 'eth_chainId' });

  if (currentChainId?.toLowerCase() === BRADBURY_CHAIN_ID) return;

  setStatus('Switching wallet to GenLayer Testnet Bradbury...');

  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: BRADBURY_CHAIN_ID }],
    });
  } catch (error) {
    // 0x4902 means the chain is not present in the wallet.
    if (error?.code !== 4902) throw error;

    await ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: BRADBURY_CHAIN_ID,
        chainName: BRADBURY_CHAIN_NAME,
        nativeCurrency: {
          name: 'GEN',
          symbol: 'GEN',
          decimals: 18,
        },
        rpcUrls: [BRADBURY_RPC_URL],
      }],
    });
  }

  const verifiedChainId = await ethereum.request({ method: 'eth_chainId' });
  if (verifiedChainId?.toLowerCase() !== BRADBURY_CHAIN_ID) {
    throw new Error('Wallet did not switch to GenLayer Testnet Bradbury (chain ID 4221).');
  }
}

async function getWalletAccount(ethereum) {
  const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
  if (!accounts?.[0]) throw new Error('No wallet account was returned.');
  return accounts[0];
}

button.addEventListener('click', async () => {
  const url = document.querySelector('#url').value.trim();
  const claim = document.querySelector('#claim').value.trim();

  if (!CONTRACT_ADDRESS) {
    setStatus('Contract address is not configured. Set VITE_TRUSTGUARD_CONTRACT.');
    return;
  }

  if (!url.startsWith('https://')) {
    setStatus('Only HTTPS URLs are accepted.');
    return;
  }

  if (claim.length < 10 || claim.length > 1000) {
    setStatus('Claim must contain 10–1000 characters.');
    return;
  }

  if (!window.ethereum) {
    setStatus('No browser wallet detected. Install MetaMask or another EIP-1193 wallet.');
    return;
  }

  button.disabled = true;
  showResult('');

  try {
    const ethereum = window.ethereum;

    setStatus('Connecting wallet...');
    const account = await getWalletAccount(ethereum);

    await ensureBradbury(ethereum);

    setStatus('Wallet connected to Bradbury. Preparing verification transaction...');

    // The wallet provider is used only for signing/sending transactions.
    // GenLayerJS is configured for Bradbury so contract reads and receipt polling
    // use the GenLayer network rather than an arbitrary wallet RPC.
    const client = createClient({
      chain: testnetBradbury,
      account,
      provider: ethereum,
    });

    // Keep the SDK's network configuration synchronized with the wallet.
    await client.connect('testnetBradbury');

    setStatus('Submit the verification transaction in your wallet...');

    const txHash = await client.writeContract({
      address: CONTRACT_ADDRESS,
      functionName: 'verify_claim',
      args: [url, claim],
      value: BigInt(0),
    });

    setStatus(`2/4 Transaction submitted.\n${txHash}\n\nWaiting for GenLayer consensus...`);

    const receipt = await client.waitForTransactionReceipt({
      hash: txHash,
      status: TransactionStatus.ACCEPTED,
      interval: 5000,
      retries: 120,
    });

    if (
      receipt.txExecutionResultName &&
      receipt.txExecutionResultName !== 'FINISHED_WITH_RETURN'
    ) {
      throw new Error(
        `Consensus accepted but contract execution was ${receipt.txExecutionResultName}.`
      );
    }

    setStatus('3/4 Consensus accepted. Reading the recorded on-chain result...');

    const stored = await client.readContract({
      address: CONTRACT_ADDRESS,
      functionName: 'get_last_result',
      args: [],
    });

    let parsed = stored;
    if (typeof stored === 'string') {
      try {
        parsed = JSON.parse(stored);
      } catch (_) {
        // Keep the raw result when it is not JSON.
      }
    }

    showResult(parsed);
    setStatus(`4/4 Verification complete.\nTransaction: ${txHash}`);
  } catch (error) {
    console.error('TrustGuard verification failed:', error);
    setStatus(`Verification failed: ${error?.message ?? error}`);
  } finally {
    button.disabled = false;
  }
});
