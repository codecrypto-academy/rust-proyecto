# PFM Rust — Solana: Community Voting Program

Solana smart contract for managing community membership and polls using Anchor.

### Quickstart
```
anchor build && yarn install && anchor test
```

## Prerequisites

Install Solana CLI:

```bash
curl --proto '=https' --tlsv1.2 -sSfL https://solana-install.solana.workers.dev | bash
```

## Commands & Config

### Build & Install dependencies for tests

```
anchor build && yarn install
```

### Test

```
anchor test
```

### Deploy on local validator

On a separate terminal run:
```
solana-test-validator
```
Ensure local validator setup:
```
solana config set --ul
solana airdrop 2
```
Then deploy:
```
anchor deploy
```
