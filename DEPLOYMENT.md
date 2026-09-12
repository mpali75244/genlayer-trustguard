# TrustGuard Deployment Evidence

## GenLayer Intelligent Contract

Contract: `TrustGuard`

Network: **GenLayer Testnet Bradbury** (chain ID 4221)

Deployed contract address:

`0x7f8926Bf458C071D271A39F8e165Dc9B737846b0`

Deployer address:

`0x8d3563758C62EAb45cf084D48F5249b0A685Bbf3`

Deployment transaction:

`0x4aed191a8a453408969a4cf945185d1b85e362cd7a5cd40662e1f91294959736`

## Verification

Deployment reached GenLayer consensus and finalized successfully.

Transaction result:

- Status: `FINALIZED`
- Result: `SUCCESS`
- Result name: `MAJORITY_AGREE`
- Validators: 5 initial validators, no appeal

Public methods:

- `verify_claim(url, claim)` — write method that fetches the live HTTPS source, runs the evidence analysis, and records the consensus-approved result.
- `get_last_result()` — view method returning the stored result.

## Builder Submission Evidence

This document provides deployment evidence for the GenLayer Builder contribution.
The repository contains the Intelligent Contract implementation and documentation
for TrustGuard.
