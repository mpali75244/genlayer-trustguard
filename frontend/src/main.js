import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { TransactionStatus } from 'genlayer-js/types';

const CONTRACT_ADDRESS = import.meta.env.VITE_TRUSTGUARD_CONTRACT;
const statusEl = document.querySelector('#status');
const resultEl = document.querySelector('#result');
const button = document.querySelector('#verify');

function setStatus(text) {
  statusEl.textContent = text;
}

function showResult(value) {
  resultEl.textContent = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
}

button.addEventListener('click', async () => {
  const url = document.querySelector('#url').value.trim();
  const claim = document.querySelector('#claim').value.trim();

  if (!CONTRACT_ADDRESS) return setStatus('Set VITE_TRUSTGUARD_CONTRACT to the deployed contract address.');
  if (!url.startsWith('https://')) return setStatus('Only HTTPS URLs are accepted.');
  if (claim.length < 10 || claim.length > 1000) return setStatus('Claim must contain 10–1000 characters.');

  button.disabled = true;
  showResult('');

  try {
    if (!window.ethereum) throw new Error('Install/connect a browser wallet such as MetaMask.');

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts?.[0]) throw new Error('No wallet account was returned.');

    const client = createClient({ chain: studionet, account: accounts[0] });
    await client.connect('studionet');

    setStatus('1/4 Wallet connected. Submit the verification transaction in your wallet...');
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
      retries: 60,
    });

    if (receipt.txExecutionResultName && receipt.txExecutionResultName !== 'FINISHED_WITH_RETURN') {
      throw new Error(`Consensus accepted but contract execution was ${receipt.txExecutionResultName}.`);
    }

    setStatus('3/4 Consensus accepted. Reading the recorded on-chain result...');
    const stored = await client.readContract({
      address: CONTRACT_ADDRESS,
      functionName: 'get_last_result',
      args: [],
    });

    let parsed = stored;
    if (typeof stored === 'string') {
      try { parsed = JSON.parse(stored); } catch (_) { /* keep raw result */ }
    }

    showResult(parsed);
    setStatus(`4/4 Verification complete.\nTransaction: ${txHash}`);
  } catch (error) {
    setStatus(`Verification failed:\n${error?.message ?? error}`);
  } finally {
    button.disabled = false;
  }
});
