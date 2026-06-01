// FBR tax estimation for Pakistani freelancers exporting IT / IT-enabled services.
// POC model based on the final-tax regime for IT/ITeS export remittances.
// Figures are illustrative for demonstration — not tax advice.

import { PKR_PER_USD_INTERBANK } from './forex.js';

// Final tax on export proceeds brought through proper banking channels.
const RATE_PSEB_REGISTERED = 0.0025; // 0.25% if registered with PSEB
const RATE_DEFAULT = 0.01; // 1% otherwise

// Illustrative sales-tax-on-services note threshold (province-dependent).
export function estimateTax(input) {
  const {
    monthlyUsd = 0,
    psebRegistered = false,
    interbankRate = PKR_PER_USD_INTERBANK,
    properBankingChannel = true
  } = input;

  const annualUsd = monthlyUsd * 12;
  const annualPkr = annualUsd * interbankRate;

  const rate = psebRegistered ? RATE_PSEB_REGISTERED : RATE_DEFAULT;
  const finalTaxApplies = properBankingChannel;

  // Final tax regime: tax is a % of export proceeds (not slab-based).
  const finalTaxPkr = finalTaxApplies ? annualPkr * rate : annualPkr * 0.29; // fallback: normal regime ~ higher
  const effectivePct = annualPkr > 0 ? (finalTaxPkr / annualPkr) * 100 : 0;

  const tips = [];
  if (!psebRegistered) {
    const savings = annualPkr * (RATE_DEFAULT - RATE_PSEB_REGISTERED);
    tips.push(
      `Register with PSEB to drop your rate from 1% to 0.25% — saves ~PKR ${Math.round(savings).toLocaleString()} / year.`
    );
  }
  if (!properBankingChannel) {
    tips.push(
      'Route payments through a proper banking channel (Payoneer-to-bank, Wise, Roshan Digital). Cash/informal routes lose the export tax incentive and risk normal-regime taxation (~29%+).'
    );
  }
  tips.push('File an annual return to stay on the Active Taxpayers List (ATL) — non-filers face higher withholding on banking transactions.');

  return {
    annualUsd,
    annualPkr: Math.round(annualPkr),
    rateLabel: psebRegistered ? '0.25% (PSEB-registered)' : '1% (standard export)',
    finalTaxPkr: Math.round(finalTaxPkr),
    effectivePct: Math.round(effectivePct * 100) / 100,
    monthlyReservePkr: Math.round(finalTaxPkr / 12),
    tips
  };
}
