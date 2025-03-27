# Harbor Frontend

This package contains the React + Vite frontend for Harbor.

For the full project overview, architecture, privacy model, and contract layout, see the [root README](../README.md).

## What Lives Here

- Landing page and product positioning
- Issuer dashboard
- Investor dashboard
- Marketplace flows
- Wallet integration
- Companion `zPass` runtime integration

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

## Environment Variables

Optional settlement token IDs:

```bash
VITE_USDCX_TOKEN_ID=...
VITE_USAD_TOKEN_ID=...
```

If these are not set, Harbor can still run ALEO-denominated settlement flows.
