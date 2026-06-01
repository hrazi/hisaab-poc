# Hisaab — AI back-office for Pakistani freelancers (POC)

An AI-native agent that runs a freelancer's entire back office: **getting paid across
borders, invoicing, and FBR tax** — the most economically significant tech gap for
Pakistan's 2M+ freelancers.

Incumbents (banks) show you a dashboard. Hisaab **does the work** through a chat agent.

## Why this wedge
Pakistan has leapfrogged in domestic P2P payments (JazzCash, Easypaisa, Raast) but
still lags in **cross-border money-in, consumer credit, and compliance**. PayPal isn't
available; freelancers lose 4–8% per payment and navigate FBR rules alone. That gap is
the wedge.

## What the POC demonstrates
1. **💱 Payment-rail optimizer** — given a USD amount, ranks Payoneer / Wise / Bank /
   Raast / PayPal by what you *actually* receive in PKR, with availability + fees.
2. **🧾 Invoice generation** — natural language → printable, export-tax-aware invoice.
3. **📊 FBR tax estimator** — final-tax regime for IT/ITeS exports (0.25% PSEB vs 1%),
   monthly reserve, and actionable tips.
4. **📄 Contract red-flag review** — heuristically flags clauses that hurt freelancers
   (unlimited revisions, termination without kill fee, IP-on-signing, Net 60, etc.).
5. **🤖 Agent router** — one chat box understands intent and calls the right tool.

## Run it
```bash
cd hisaab-poc
npm start          # zero dependencies — Node 18+
# open http://localhost:3000
```

Optional LLM mode for free-form Q&A (structured actions stay deterministic):
```bash
$env:OPENAI_API_KEY="sk-..."   # PowerShell
npm start
```

## Try these
- "What's the best way to receive $2000 from a US client?"
- "Invoice Acme Corp for $800"
- "Tax on $1500 per month, PSEB registered"
- Paste a contract to review

## Architecture
```
src/
  server.js    zero-dep HTTP server (UI + /api/*)
  agent.js     intent router + optional LLM hook
  forex.js     payment-rail ranking
  tax.js       FBR final-tax estimator
  invoice.js   invoice builder + printable HTML
  contract.js  red-flag heuristics
public/        chat UI + live results panel
```

## POC scope / honesty
- FX rates, fees, and tax rates are **illustrative defaults** for demonstration — wire
  them to live FX APIs and current FBR rules for production.
- Contract review is heuristic; pair with an LLM for nuanced clauses.
- Not financial or tax advice.

## What "real" looks like next
Live FX feeds, Payoneer/Wise APIs, automated FBR e-filing, WhatsApp interface, and an
agent that *initiates* withdrawals and files returns — not just advises.
