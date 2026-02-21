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

## GitHub Action

Add MoltCops to your CI pipeline — scans every PR for agent vulnerabilities:

```yaml
# .github/workflows/moltcops-scan.yml
name: MoltCops Security Scan
on:
  pull_request:
    paths: ['**/*.ts', '**/*.js', '**/*.py', '**/*.md']

permissions:
  contents: read
  pull-requests: write

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: Adamthompson33/moltshield@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          # api-key: ${{ secrets.MOLTCOPS_PRO_KEY }}  # Optional: Pro tier
          # fail-on: CRITICAL  # Optional: block PRs with critical findings
```

**Free tier:** 10 rules — catches drains, sleepers, prompt injection, code injection, exfil.
**Pro tier:** 20 rules — adds jailbreak, encoding tricks, context poisoning, sandbox escape, and more.

## Scanner Rules

### Free Tier (10 rules)
- **CRITICAL** — Key export, drain patterns, unlimited approvals, sleeper triggers
- **HIGH** — Prompt injection, safety removal
- **MEDIUM** — Data exfil, stealth operations, code injection
- **LOW** — Hardcoded addresses

### Pro Tier (+10 rules)
- **CRITICAL** — MAX_UINT256 detection
- **HIGH** — Identity spoofing, authority bypass, jailbreaks, encoding tricks, false authority
- **MEDIUM** — Context poisoning, sandbox escape, time/count triggers, config exposure

Pro tier available via API key ($5/month).

## Links

- [MoltCops Docs](https://docs.moltcops.com)
- [GitHub](https://github.com/moltcops)
- [Twitter](https://twitter.com/moltcops)
- [Litepaper](https://moltcops.com/litepaper)

---

*To Protect and Serve (Humanity)* 🚨
