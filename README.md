# GenLayer TrustGuard

TrustGuard is a trust-minimized web-claim verification dApp powered by a GenLayer Intelligent Contract.

## The trust problem

Important announcements and claims are often copied, paraphrased, or presented without reliable attribution. A conventional smart contract cannot independently inspect live web evidence. TrustGuard moves the core evidence decision into GenLayer so independent validators can verify a leader's result before the state transition is accepted.

## Core workflow

1. The user submits an HTTPS source URL and a claim.
2. The frontend connects a browser wallet and sends `verify_claim(url, claim)` through GenLayerJS.
3. The Intelligent Contract renders the live page in a non-deterministic block.
4. The leader extracts a structured decision: `SUPPORTED`, `NOT_SUPPORTED`, or `INCONCLUSIVE`, plus a confidence score and evidence reason.
5. Each validator independently reruns the evidence analysis against the same live source.
6. Consensus requires the discrete status to match exactly and the confidence scores to remain within a bounded tolerance.
7. Only the consensus-approved leader result is written to persistent contract state.
8. The frontend waits for acceptance, checks the execution result, and reads the recorded result back from the contract.

This follows GenLayer's leader/validator Equivalence Principle rather than trusting the leader's JSON shape alone. citeturn1search0turn1search2

## Why GenLayer is central

The application's primary trust decision depends on non-deterministic web access and independent validator agreement. The Intelligent Contract performs the live evidence retrieval, analysis, consensus validation, and on-chain state transition. The frontend is an interface to that workflow, not a replacement for it.

GenLayer's web-access model allows Intelligent Contracts to fetch and render external web content, while validators independently execute non-deterministic operations to reach consensus. citeturn0search0turn0search1

## Repository

- `contracts/trust_guard.py` — Intelligent Contract and consensus logic
- `frontend/index.html` — dApp UI
- `frontend/src/main.js` — wallet, transaction lifecycle, execution-result handling, and state readback
- `frontend/package.json` — Vite + GenLayerJS dependencies

## Run the frontend

```bash
cd frontend
npm install
VITE_TRUSTGUARD_CONTRACT=0xYourContractAddress npm run dev
```

For a persistent local setup, put the variable in `frontend/.env.local`.

The current frontend is configured for GenLayer Studio (`studionet`). Before a public testnet demo, switch the chain configuration to the target deployed network and contract address. GenLayerJS supports transaction submission and waiting for accepted/finalized receipts. citeturn0search11turn0search14

## Development and validation

Use GenLayer Studio or GLSim for local development, then validate the exact contract against the target testnet before submission. GenLayer documents Studio as the full GenVM/consensus environment and Bradbury as the realistic testnet environment. citeturn0search7

The repository intentionally does **not** claim a live deployment until the contract has been deployed and a real transaction has been verified.

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

GenLayer's documentation specifically warns that schema-only validation does not constitute meaningful consensus; independent verification of the leader result is required. citeturn1search0turn1search3

## Limitations

TrustGuard verifies whether a supplied source provides evidence supporting a claim. It does not mathematically prove that the underlying real-world claim is true. Users should prefer primary/official sources, and a production version should add explicit source-domain policies, historical evidence snapshots, and multi-source corroboration.

## Builder readiness

The repository contains the core application, Intelligent Contract, frontend transaction lifecycle, and documentation. **Final Builder submission should only be made after:**

- contract lint/test passes in the current GenLayer runtime;
- deployment succeeds on the target GenLayer testnet;
- a real verification transaction reaches consensus;
- the frontend successfully reads the resulting on-chain state;
- the deployed contract address and live demo are added to the submission evidence.
