import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { TransactionStatus } from 'genlayer-js/types';

const CONTRACT_ADDRESS = import.meta.env.VITE_TRUSTGUARD_CONTRACT;
const statusEl = document.querySelector('#status');
const button = document.querySelector('#verify');

function setStatus(text) { statusEl.textContent = text; }

button.addEventListener('click', async () => {
  const url = document.querySelector('#url').value.trim();
  const claim = document.querySelector('#claim').value.trim();
  if (!CONTRACT_ADDRESS) return setStatus('Set VITE_TRUSTGUARD_CONTRACT to the deployed contract address.');
  if (!url.startsWith('https://')) return setStatus('Only HTTPS URLs are accepted.');
  if (claim.length < 10) return setStatus('Claim is too short.');

  button.disabled = true;
  try {
    if (!window.ethereum) throw new Error('Install/connect a browser wallet such as MetaMask.');
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    const client = createClient({ chain: studionet, account });
    await client.connect('studionet');

    setStatus('1/3 Wallet connected. Submitting verification transaction...');
    const txHash = await client.writeContract({
      address: CONTRACT_ADDRESS,
      functionName: 'verify_claim',
      args: [url, claim],
      value: BigInt(0),
    });

    setStatus(`2/3 Transaction submitted.\n${txHash}\nWaiting for GenLayer consensus...`);
    const receipt = await client.waitForTransactionReceipt({
      hash: txHash,
      status: TransactionStatus.ACCEPTED,
      interval: 5000,
      retries: 60,
    });

    setStatus(`3/3 Consensus accepted.\nExecution: ${receipt.txExecutionResultName ?? 'unknown'}\n\nRefresh or query the contract to inspect the recorded result.`);
  } catch (error) {
    setStatus(`Verification failed:\n${error?.message ?? error}`);
  } finally {
    button.disabled = false;
  }
});
