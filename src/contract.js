// Contract red-flag review for freelance/client agreements.
// Heuristic pattern scan — flags clauses that commonly hurt freelancers.

const RULES = [
  {
    id: 'unlimited_revisions',
    test: /unlimited\s+revisions?|as\s+many\s+revisions/i,
    severity: 'high',
    flag: 'Unlimited revisions',
    why: 'Open-ended scope — caps your effective hourly rate at zero. Define a revision count.'
  },
  {
    id: 'ip_before_payment',
    test: /(all\s+)?(intellectual\s+property|ip|rights).*(transfer|assign|belong)/i,
    severity: 'medium',
    flag: 'IP assignment',
    why: 'Ensure IP transfers only AFTER full payment is received, not on signing.'
  },
  {
    id: 'no_kill_fee',
    test: /(terminate|cancel).*(any\s+time|without\s+cause|sole\s+discretion)/i,
    severity: 'high',
    flag: 'Termination without kill fee',
    why: 'Client can cancel anytime with no compensation. Add a kill fee / payment for work done.'
  },
  {
    id: 'net_60_90',
    test: /net\s*(45|60|75|90|120)/i,
    severity: 'medium',
    flag: 'Long payment terms (Net 45+)',
    why: 'Slow payment hurts cash flow. Negotiate Net 14/30 + late-payment interest.'
  },
  {
    id: 'no_late_fee',
    test: /late\s+(fee|payment|interest)/i,
    severity: 'info',
    invert: true,
    flag: 'No late-payment clause',
    why: 'No penalty for late payment. Add 1.5%/month interest on overdue invoices.'
  },
  {
    id: 'broad_noncompete',
    test: /non[-\s]?compete|shall\s+not\s+work\s+(for|with)/i,
    severity: 'medium',
    flag: 'Non-compete',
    why: 'May restrict future work. Limit scope, duration, and geography — or strike it.'
  },
  {
    id: 'indemnify',
    test: /indemnif(y|ication)|hold\s+harmless/i,
    severity: 'medium',
    flag: 'Broad indemnification',
    why: 'You may be liable for the client’s losses. Cap liability to fees paid.'
  },
  {
    id: 'no_deposit',
    test: /(deposit|advance|upfront|milestone)/i,
    severity: 'info',
    invert: true,
    flag: 'No upfront deposit',
    why: 'No advance protects the client, not you. Ask for 30–50% upfront.'
  },
  {
    id: 'jurisdiction',
    test: /governed\s+by\s+the\s+laws|jurisdiction|venue/i,
    severity: 'info',
    flag: 'Foreign jurisdiction',
    why: 'Disputes resolved abroad are hard to pursue from Pakistan. Prefer neutral arbitration.'
  }
];

export function reviewContract(text) {
  const t = String(text || '');
  const findings = [];
  for (const r of RULES) {
    const present = r.test.test(t);
    const trigger = r.invert ? !present : present;
    if (trigger) {
      findings.push({ id: r.id, severity: r.severity, flag: r.flag, why: r.why });
    }
  }
  const order = { high: 0, medium: 1, info: 2 };
  findings.sort((a, b) => order[a.severity] - order[b.severity]);
  const score = Math.max(0, 100 - findings.reduce((s, f) => s + ({ high: 25, medium: 12, info: 4 }[f.severity]), 0));
  return { score, findings };
}
