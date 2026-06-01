// The agent "brain": parses a freelancer's natural-language message, routes to the
// right back-office tool, and returns a structured reply + UI card.
// Works fully offline (rule-based). If OPENAI_API_KEY is set, free-form questions
// are answered by the LLM while structured actions still run deterministically.

import { rankRails, PKR_PER_USD_INTERBANK } from './forex.js';
import { estimateTax } from './tax.js';
import { buildInvoice } from './invoice.js';
import { reviewContract } from './contract.js';

function extractUsd(text) {
  const m = text.match(/\$?\s*([\d,]+(?:\.\d+)?)\s*(k|usd|dollars?)?/i);
  if (!m) return null;
  let n = parseFloat(m[1].replace(/,/g, ''));
  if (m[2] && m[2].toLowerCase() === 'k') n *= 1000;
  return isNaN(n) ? null : n;
}

export async function handleMessage(message, ctx = {}) {
  const text = String(message || '').trim();
  const low = text.toLowerCase();

  // 1) Currency / payment rail optimization
  if (/(receive|withdraw|get paid|payoneer|paypal|wise|best (way|rail)|convert|currency|exchange)/i.test(low)) {
    const usd = extractUsd(text) || 1000;
    const r = rankRails(usd);
    const lines = r.results
      .map(
        (x) =>
          `${badge(x.availability)} **${x.name}** → PKR ${x.netPkr.toLocaleString()} ` +
          `(cost ${x.totalCostPct}% · ${x.speedDays}d)`
      )
      .join('\n');
    return {
      reply:
        `For **$${usd.toLocaleString()}**, here's what you'd actually receive in PKR ` +
        `(interbank ≈ ${PKR_PER_USD_INTERBANK}):\n\n${lines}\n\n` +
        `✅ Best compliant option: **${r.best.name}** — PKR ${r.best.netPkr.toLocaleString()}. ` +
        `Choosing it over the worst option saves ~PKR ${r.savingsPkr.toLocaleString()}.`,
      card: { type: 'forex', data: r }
    };
  }

  // 2) Tax estimation
  if (/(tax|fbr|pseb|filer|return|how much.*owe)/i.test(low)) {
    const usd = extractUsd(text) || 1500;
    const pseb = /pseb|registered/i.test(low) && !/not\s+registered|no pseb/i.test(low);
    const est = estimateTax({ monthlyUsd: usd, psebRegistered: pseb });
    return {
      reply:
        `On ~$${usd.toLocaleString()}/month (PKR ${est.annualPkr.toLocaleString()}/yr export income):\n\n` +
        `• Regime: final tax @ **${est.rateLabel}**\n` +
        `• Estimated annual tax: **PKR ${est.finalTaxPkr.toLocaleString()}** (effective ${est.effectivePct}%)\n` +
        `• Set aside ~PKR ${est.monthlyReservePkr.toLocaleString()}/month\n\n` +
        est.tips.map((t) => `→ ${t}`).join('\n'),
      card: { type: 'tax', data: est }
    };
  }

  // 3) Invoice generation
  if (/(invoice|bill|charge)/i.test(low)) {
    const usd = extractUsd(text) || 500;
    // Capture the client name between "invoice/bill" and "for/$amount".
    const clientMatch =
      text.match(/(?:invoice|bill|charge)\s+([A-Za-z][\w&. ]*?)\s+(?:for|\$|\d)/i) ||
      text.match(/(?:for|to|client)\s+([A-Z][\w&. ]{1,40})/);
    const inv = buildInvoice({
      freelancerName: ctx.name || 'Freelancer',
      clientName: clientMatch ? clientMatch[1].trim() : 'Client',
      items: [{ description: 'Professional services', qty: 1, rate: usd }]
    });
    return {
      reply:
        `Created **${inv.number}** for ${inv.clientName} — total ${inv.currency} ${inv.total.toLocaleString()}, ` +
        `due ${inv.due}. Preview it on the right, then download/print to PDF.`,
      card: { type: 'invoice', data: inv }
    };
  }

  // 4) Contract review
  if (/(contract|agreement|terms|clause|review this|red flag)/i.test(low) && text.length > 60) {
    const rev = reviewContract(text);
    const f = rev.findings.length
      ? rev.findings.map((x) => `${sev(x.severity)} **${x.flag}** — ${x.why}`).join('\n')
      : 'No common red flags detected. Still confirm payment terms and IP transfer timing.';
    return {
      reply: `Contract health score: **${rev.score}/100**.\n\n${f}`,
      card: { type: 'contract', data: rev }
    };
  }

  // 5) Fallback — LLM if configured, else guided help
  const llm = await tryLlm(text);
  if (llm) return { reply: llm, card: null };

  return {
    reply:
      "I'm your back-office agent. I can:\n" +
      '• 💱 Optimize how you receive payments — *“best way to receive $2000 from a US client?”*\n' +
      '• 🧾 Generate invoices — *“invoice Acme Corp for $800”*\n' +
      '• 📊 Estimate FBR tax — *“tax on $1500/month, PSEB registered”*\n' +
      '• 📄 Review a contract — *paste the clauses*\n\n' +
      'What do you need?',
    card: null
  };
}

async function tryLlm(text) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are Hisaab, an AI back-office assistant for Pakistani freelancers. Be concise and practical about invoicing, cross-border payments, and FBR tax.'
          },
          { role: 'user', content: text }
        ],
        temperature: 0.4
      })
    });
    const j = await res.json();
    return j?.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

function badge(a) {
  return a === 'available' ? '🟢' : a === 'limited' ? '🟡' : '🔴';
}
function sev(s) {
  return s === 'high' ? '🔴' : s === 'medium' ? '🟠' : '🔵';
}
