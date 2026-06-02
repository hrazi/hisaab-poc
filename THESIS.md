# Hisaab — Investment Thesis

**AI-native back-office for Pakistan's freelance export economy.**
The agent that *does the work* — gets you paid, invoices clients, and files your tax —
instead of handing you another dashboard.

---

## The one-liner
Pakistan exported a record **$3.8B in IT & ITeS services in FY2024-25** (+18% YoY), of
which freelancers contributed **~$750M** — but the people earning it lose 4–8% on every
payment and navigate FBR compliance alone. Hisaab is an AI agent that runs their entire
money back-office over chat.

---

## Why now
- **Domestic payments are solved; cross-border money-in is not.** JazzCash, Easypaisa,
  and state-backed Raast fixed local P2P. The remaining gap — receiving foreign income,
  credit, and compliance — is exactly where freelancers live. PayPal still isn't
  available in Pakistan.
- **AI crossed the "does it" threshold.** LLM agents can now *take actions* (draft
  invoices, choose rails, prepare filings), not just advise. The product that was
  impossible in 2021 ships in 2026.
- **The export base is large and growing fast.** Pakistan is a **top-5 global freelance
  market** with **~2.32M freelancers**; IT/ITeS exports grew ~18% YoY to a record $3.8B,
  and freelance exports jumped ~90%+ YoY to ~$750M.

---

## The pain (real, validated, recurring)
- **~2.32M freelancers** earning foreign income (top-5 globally).
- **~$750M/yr** in freelance export remittances flowing through fee-heavy rails — part of
  a **$3.8B/yr** total IT/ITeS export base.
- **4–8% leakage per payment** from FX spreads + fees across Payoneer / Wise / SWIFT,
  with PayPal absent entirely.
- **FBR complexity** — final-tax regime, PSEB registration (0.25% vs 1%), Active
  Taxpayer List, proper-banking-channel rules — handled manually or via expensive,
  inconsistent accountants.
- It happens **every single payment cycle**, not once. High frequency = high retention.

**Value pool (grounded estimate):**
- *Serviceable today (freelancers):* ~$750M flow × ~5% blended leakage ≈ **$38M/yr** of
  value bleeding out — the pool Hisaab recaptures and shares.
- *Expansion (full IT/ITeS export base):* $3.8B × ~5% ≈ **$190M/yr** as the product moves
  from freelancers to small IT firms and agencies.

*Figures: PSEB / SBP / Ministry of IT, FY2024-25 (reported mid-2025). Leakage % is an
illustrative blended assumption — validate per-rail before diligence.*

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
