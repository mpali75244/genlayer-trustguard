# TrustGuard Deployment Evidence

## GenLayer Intelligent Contract

Contract: `TrustGuard`

Network: **GenLayer Testnet Bradbury** (chain ID 4221)

Deployed contract address:

`0xB2704Cd0814012B882F052546Bd184e06c74C6c8`

> Redeployed on Sep 12, 2026. Earlier instances (`0x7f8926Bf458C071D271A39F8e165Dc9B737846b0`,
> `0x237e6B02d5006A1163E51490e21AD511B62d8439`) were lost in a Bradbury testnet reset or superseded.

## Verification

Deployment reached GenLayer consensus and was accepted. A live `verify_claim` call
(https://www.genlayer.com/ + claim) executed through full validator consensus and
recorded a result on-chain (total_checks: 1).

Public methods:

- `verify_claim(url, claim)` — write method that fetches the live HTTPS source, runs the evidence analysis, and records the consensus-approved result.
- `get_last_result()` — view method returning the stored result.

## Builder Submission Evidence

This document provides deployment evidence for the GenLayer Builder contribution.
The repository contains the Intelligent Contract implementation and documentation
for TrustGuard.
