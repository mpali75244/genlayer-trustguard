# GenLayer TrustGuard

TrustGuard is a trust-minimized web claim verification dApp powered by a GenLayer Intelligent Contract.

## Problem

Online claims can be copied, manipulated, or interpreted without reliable attribution. A normal smart contract cannot independently inspect live web pages. TrustGuard moves the evidence check into a GenLayer Intelligent Contract so validators independently evaluate external evidence before the result is persisted on-chain.

## Workflow

1. User enters an HTTPS source URL and a claim.
2. The frontend connects to a browser wallet.
3. GenLayerJS submits `verify_claim(url, claim)` to the Intelligent Contract.
4. The contract renders the live source page inside a non-deterministic block.
5. A leader extracts a structured evidence judgment.
6. Validators independently fetch the same source and validate the leader's result using GenLayer's Equivalence Principle.
7. Only the consensus-approved result is written to contract storage.
8. The frontend tracks transaction submission and consensus acceptance.

## Why GenLayer is central

The core trust decision depends on live web data and independent validator agreement. This is not a conventional CRUD dApp with an AI feature added on top: the Intelligent Contract is responsible for the authoritative evidence retrieval, non-deterministic analysis, consensus validation, and on-chain state transition.

## Repository

- `contracts/trust_guard.py` — Intelligent Contract
- `frontend/index.html` — dApp UI
- `frontend/src/main.js` — wallet + GenLayerJS transaction lifecycle
- `frontend/package.json` — frontend dependencies

## Run frontend

```bash
cd frontend
npm install
npm run dev
```

Set the deployed contract address before running:

```bash
VITE_TRUSTGUARD_CONTRACT=0xYourContractAddress npm run dev
```

For a persistent setup, put the variable in `frontend/.env.local`.

## Contract development

Use the current GenLayer CLI/Studio workflow to lint and test the contract before deployment:

```bash
genvm-lint check contracts/trust_guard.py
```

Then deploy the contract with the GenLayer CLI or Studio and configure the frontend with the resulting address.

## Security design

- HTTPS-only sources.
- Input length limits.
- Web pages are treated as untrusted data; page instructions are explicitly ignored.
- Web access is confined to GenLayer non-deterministic execution.
- State writes happen only after the consensus result is produced.
- Validator checks validate structure, status range, and evidence support rather than trusting arbitrary model output.

## Limitations

TrustGuard verifies whether a source provides evidence supporting a claim; it does not prove that every statement on the source is objectively true. Source ownership and authority remain important inputs for a production deployment. The first version intentionally keeps the scope narrow so the verification path is auditable.

## Status

Prototype / Builder submission candidate. Contract linting, testnet deployment, live demo, and production hardening should be completed before treating the deployment as production-ready.
