# GenLayer TrustGuard

TrustGuard is a trust-minimized web-claim verification dApp powered by a GenLayer Intelligent Contract.

## The trust problem

Important announcements and claims are often copied, paraphrased, or presented without reliable attribution. A conventional smart contract cannot independently inspect live web evidence. TrustGuard moves the core evidence decision into GenLayer so independent validators can verify a leader's result before the state transition is accepted.

## Core workflow

1. The user submits an HTTPS source URL and a claim.
2. The deployed frontend connects a browser wallet and sends `verify_claim(url, claim)` through GenLayerJS.
3. The Intelligent Contract renders the live page in a non-deterministic block.
4. The leader extracts a structured decision: `SUPPORTED`, `NOT_SUPPORTED`, or `INCONCLUSIVE`, plus a confidence score and evidence reason.
5. Each validator independently reruns the evidence analysis against the same live source.
6. Consensus requires the discrete status to match exactly and the confidence scores to remain within a bounded tolerance.
7. Only the consensus-approved leader result is written to persistent contract state.
8. The frontend waits for transaction acceptance, checks the execution result, and reads the recorded result back from the contract.

## Why GenLayer is central

The application's primary trust decision depends on non-deterministic web access and independent validator agreement. The Intelligent Contract performs the live evidence retrieval, analysis, consensus validation, and on-chain state transition. The frontend is an interface to that workflow, not a replacement for it.

## Repository

- `contracts/trust_guard.py` — Intelligent Contract and consensus logic
- `frontend/index.html` — deployed dApp UI
- `frontend/src/main.js` — wallet, Bradbury network connection, transaction lifecycle, execution-result handling, and state readback
- `frontend/package.json` — Vite + GenLayerJS dependencies

## Run the frontend

```bash
cd frontend
npm install
VITE_TRUSTGUARD_CONTRACT=0xYourBradburyContractAddress npm run dev
```

For a persistent local setup, create `frontend/.env.local` with:

```text
VITE_TRUSTGUARD_CONTRACT=0xYourBradburyContractAddress
```

The frontend is configured for **GenLayer Testnet Bradbury**, the production-like testnet with real AI/LLM workloads. The contract address must be the TrustGuard contract actually deployed on Bradbury; the previous Studionet address must not be reused as a Bradbury deployment address.

## Testnet validation checklist

Before the Builder Project resubmission, verify all of the following:

1. TrustGuard is deployed on Testnet Bradbury.
2. `VITE_TRUSTGUARD_CONTRACT` points to that Bradbury deployment.
3. The public frontend is deployed to a hosting platform such as Vercel or Cloudflare Pages.
4. A browser wallet can switch to/connect to Bradbury.
5. A real `verify_claim` transaction is submitted from the deployed frontend.
6. The transaction reaches GenLayer consensus and finishes successfully.
7. `get_last_result` returns the stored result from the deployed contract.
8. The live URL, GitHub repository, and Bradbury contract address are included as submission evidence.

## Security design

- HTTPS-only source URLs.
- URL and claim length limits.
- Source pages are treated as untrusted data; instructions embedded in pages are explicitly ignored.
- Web access and LLM calls are confined to GenLayer non-deterministic execution.
- Validators independently rerun the evidence analysis rather than merely checking the leader's output schema.
- The discrete verification decision must agree exactly across leader and validator.
- Confidence scores use a bounded tolerance because LLM scoring can vary slightly.
- Contract state is updated only after consensus returns an accepted result.
- Frontend checks the transaction execution result before trusting the stored result.

## Limitations

TrustGuard verifies whether a supplied source provides evidence supporting a claim. It does not mathematically prove that the underlying real-world claim is true. Users should prefer primary/official sources, and a production version should add explicit source-domain policies, historical evidence snapshots, and multi-source corroboration.

## Builder readiness

The Project submission is ready only after the Bradbury deployment, a successful real verification transaction, and a public live frontend have all been verified. Do not submit the old Studionet-only deployment as a Projects submission.
