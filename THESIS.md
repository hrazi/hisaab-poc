# Hisaab — Investment Thesis

**AI-native back-office for Pakistan's freelance export economy.**
The agent that *does the work* — gets you paid, invoices clients, and files your tax —
instead of handing you another dashboard.

---

## The one-liner
Pakistan exports ~$3B/year in IT & freelance services, but the people earning it lose
4–8% on every payment and navigate FBR compliance alone. Hisaab is an AI agent that
runs their entire money back-office over chat.

---

## Why now
- **Domestic payments are solved; cross-border money-in is not.** JazzCash, Easypaisa,
  and state-backed Raast fixed local P2P. The remaining gap — receiving foreign income,
  credit, and compliance — is exactly where freelancers live. PayPal still isn't
  available in Pakistan.
- **AI crossed the "does it" threshold.** LLM agents can now *take actions* (draft
  invoices, choose rails, prepare filings), not just advise. The product that was
  impossible in 2021 ships in 2026.
- **The export base is large and growing.** Pakistan is a top-5 global freelancer market
  by headcount, with a young, English-capable, mobile-first workforce.

---

## The pain (real, validated, recurring)
- **~2M+ freelancers** earning foreign income.
- **4–8% leakage per payment** from FX spreads + fees across Payoneer / Wise / SWIFT,
  with PayPal absent entirely.
- **FBR complexity** — final-tax regime, PSEB registration (0.25% vs 1%), Active
  Taxpayer List, proper-banking-channel rules — handled manually or via expensive,
  inconsistent accountants.
- It happens **every single payment cycle**, not once. High frequency = high retention.

**Illustrative pool:** 2M users × ~$6,000 avg annual foreign income × 5% blended
leakage ≈ **$600M/year** of value bleeding out — the pool Hisaab recaptures and shares.

---

## The wedge: an agent that *does the work*
Every incumbent stops at advice or a dashboard. Hisaab acts:
| Job | Incumbent today | Hisaab |
| --- | --- | --- |
| Get paid | You pick a rail, eat the fee | Agent ranks rails by net PKR + compliance, then routes |
| Invoice | Word/Excel template | NL → export-tax-aware invoice, sent |
| Tax | Hire an accountant | Agent estimates, reserves, and (next) e-files with FBR |
| Contracts | You read the fine print | Agent flags freelancer-hostile clauses |

Land with the highest-frequency pain (**getting paid**), expand into invoicing, tax, and
credit — each new job deepens the moat and raises switching cost.

---

## Why incumbents structurally can't serve it
- **Banks & Payoneer/Wise have no incentive to optimize *away from their own rails*** —
  Hisaab's core value (telling you the cheapest route) is adversarial to their margin.
- **Compliance liability + thin margins** make freelancer-grade personalization
  uneconomic for a bank to build.
- **Dashboards are their ceiling.** Doing the work — filing, routing, negotiating — is a
  different product DNA (agentic, vernacular, WhatsApp-first) that legacy orgs don't ship.

---

## Business model
- **Take-rate on payments** routed/optimized (share of the leakage saved).
- **SaaS subscription** for invoicing + tax automation.
- **Compliance-as-a-service** (PSEB registration, annual filing) — high willingness to pay.
- Future: **credit & USD cards** underwritten on observed cash-flow data — the real
  margin expansion.

---

## Moat (compounds over time)
1. **Proprietary cash-flow data** on a hard-to-bank segment → underwriting edge.
2. **Compliance integrations** (FBR, PSEB, banking partners) — slow, defensible to build.
3. **Workflow lock-in** — once the agent runs your invoicing + filing, leaving means
   re-doing your back office.
4. **Vernacular + WhatsApp distribution** — meets users where they already are.

---

## Risks & mitigations
| Risk | Mitigation |
| --- | --- |
| Regulatory shifts (SBP/FBR) | Build *on* compliant rails (Raast, banking channel); partner early |
| Banking partnerships gate scale | Start advisory/SaaS (no license needed), layer money movement later |
| Thin per-user revenue | Frequency + multi-product (pay → invoice → tax → credit) lifts LTV |
| Trust on money + tax | Deterministic core (verifiable math), human-in-loop for filings, transparency |

---

## Why this team / why a POC
Working proof-of-concept already demonstrates the full loop — rail optimization, invoice
generation, FBR estimation, and contract review behind one agent (see `README.md`). The
thesis isn't a deck; the wedge runs.

**The ask:** capital to wire live FX + Payoneer/Wise APIs, ship the WhatsApp interface,
and secure banking + FBR e-filing partnerships — turning the agent from *advises* to
*executes*.

> *Illustrative figures for a POC narrative; validate against live market data before
> diligence. Not financial advice.*
