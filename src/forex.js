// Cross-border payment rail optimization for Pakistani freelancers.
// All FX rates/fees are illustrative POC defaults (configurable). Not financial advice.

export const PKR_PER_USD_INTERBANK = 278.5; // illustrative mid-market rate

// Each rail: how a freelancer receives USD from an overseas client into PKR.
// fxSpreadPct = markup taken off the mid-market rate.
// flatFeeUsd / percentFeePct = fees deducted before conversion.
// availabilityNote captures real-world friction (the actual gap vs. US).
const RAILS = [
  {
    id: 'payoneer',
    name: 'Payoneer',
    percentFeePct: 2.0,
    flatFeeUsd: 0,
    fxSpreadPct: 2.0,
    speedDays: 2,
    availability: 'available',
    note: 'Most common for PK freelancers. Withdrawal to local bank in PKR.'
  },
  {
    id: 'wise',
    name: 'Wise',
    percentFeePct: 0.6,
    flatFeeUsd: 1.0,
    fxSpreadPct: 0.4,
    speedDays: 1,
    availability: 'limited',
    note: 'Best FX, but receiving USD into PK accounts is restricted; works best client-side.'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    percentFeePct: 4.4,
    flatFeeUsd: 0.3,
    fxSpreadPct: 3.5,
    speedDays: 1,
    availability: 'unavailable',
    note: 'Not officially supported in Pakistan — the core gap. Workarounds are risky.'
  },
  {
    id: 'bank_wire',
    name: 'Bank Wire (SWIFT)',
    percentFeePct: 0,
    flatFeeUsd: 25,
    fxSpreadPct: 1.5,
    speedDays: 4,
    availability: 'available',
    note: 'Eligible for IT export tax incentives if routed through proper banking channel.'
  },
  {
    id: 'raast_remit',
    name: 'Bank + Roshan Digital / Raast',
    percentFeePct: 0,
    flatFeeUsd: 5,
    fxSpreadPct: 1.0,
    speedDays: 2,
    availability: 'available',
    note: 'State-backed rails; cheapest compliant on-ramp, qualifies for export incentives.'
  }
];

export function rankRails(amountUsd, opts = {}) {
  const interbank = opts.interbankRate || PKR_PER_USD_INTERBANK;
  const results = RAILS.map((r) => {
    const percentFee = (amountUsd * r.percentFeePct) / 100;
    const afterFees = Math.max(0, amountUsd - percentFee - r.flatFeeUsd);
    const effectiveRate = interbank * (1 - r.fxSpreadPct / 100);
    const netPkr = afterFees * effectiveRate;
    const grossPkr = amountUsd * interbank;
    const totalCostPkr = grossPkr - netPkr;
    return {
      id: r.id,
      name: r.name,
      availability: r.availability,
      speedDays: r.speedDays,
      note: r.note,
      effectiveRate: round2(effectiveRate),
      netPkr: Math.round(netPkr),
      totalCostPkr: Math.round(totalCostPkr),
      totalCostPct: round2((totalCostPkr / grossPkr) * 100)
    };
  });

  // Sort: available rails first, then by most PKR received.
  const rank = { available: 0, limited: 1, unavailable: 2 };
  results.sort((a, b) => {
    if (rank[a.availability] !== rank[b.availability]) {
      return rank[a.availability] - rank[b.availability];
    }
    return b.netPkr - a.netPkr;
  });

  const best = results.find((r) => r.availability === 'available') || results[0];
  const worstAvailable = [...results]
    .filter((r) => r.availability !== 'unavailable')
    .sort((a, b) => a.netPkr - b.netPkr)[0];
  const savingsPkr = worstAvailable ? best.netPkr - worstAvailable.netPkr : 0;

  return { interbankRate: interbank, amountUsd, results, best, savingsPkr: Math.max(0, savingsPkr) };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}
