# MoltShield Scanner

Free AI agent security scanner. Part of the MoltCops defense ecosystem.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/moltcops/scanner)

Or manually:

```bash
npm install -g vercel
vercel
```

## Features

- **🔍 Free Scanner** — 20-rule security engine, runs client-side
- **🛡️ Badge Application** — Founding Operative NFT application flow
- **🎫 Waitlist** — $MCOP token waitlist with referral mechanics

## Structure

```
scanner-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout + metadata
│   │   ├── page.tsx        # Main page (tabs)
│   │   └── globals.css     # Global styles
│   ├── components/
│   │   ├── Scanner.tsx     # MoltShield scanner
│   │   ├── BadgeApplication.tsx  # Founding Operative form
│   │   └── Waitlist.tsx    # Token waitlist + referral
│   └── lib/
│       └── scan-engine.ts  # 20-rule detection engine
├── package.json
└── next.config.js
```

## Scanner Rules (Free Tier)

The free tier runs 20 of 79 total rules:

- **CRITICAL** — Key export, drain patterns, unlimited approvals, sleeper triggers
- **HIGH** — Prompt injection, identity spoofing, authority bypass, jailbreaks
- **MEDIUM** — Context poisoning, data exfil, sandbox escape, code injection
- **LOW** — Hardcoded addresses

Full 79-rule engine available via $MCOP staking or x402 micropayment.

## Links

- [MoltCops Docs](https://docs.moltcops.com)
- [GitHub](https://github.com/moltcops)
- [Twitter](https://twitter.com/moltcops)
- [Litepaper](https://moltcops.com/litepaper)

---

*To Protect and Serve (Humanity)* 🚨
