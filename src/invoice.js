// Invoice generation. Produces a structured invoice object + printable HTML.

let counter = 1;

export function buildInvoice(input) {
  const {
    freelancerName = 'Your Name',
    freelancerEmail = '',
    clientName = 'Client',
    clientCountry = '',
    items = [],
    currency = 'USD',
    notes = '',
    taxNote = 'IT/ITeS export of services — zero-rated for sales tax where applicable.'
  } = input;

  const lineItems = items.map((it) => ({
    description: it.description || 'Professional services',
    qty: Number(it.qty) || 1,
    rate: Number(it.rate) || 0,
    amount: (Number(it.qty) || 1) * (Number(it.rate) || 0)
  }));

  const subtotal = lineItems.reduce((s, it) => s + it.amount, 0);
  const number = `INV-${new Date().getFullYear()}-${String(counter++).padStart(4, '0')}`;
  const date = new Date().toISOString().slice(0, 10);
  const due = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);

  const invoice = {
    number,
    date,
    due,
    currency,
    freelancerName,
    freelancerEmail,
    clientName,
    clientCountry,
    lineItems,
    subtotal,
    total: subtotal,
    notes,
    taxNote
  };
  invoice.html = renderHtml(invoice);
  return invoice;
}

function renderHtml(inv) {
  const rows = inv.lineItems
    .map(
      (it) =>
        `<tr><td>${esc(it.description)}</td><td class="num">${it.qty}</td><td class="num">${money(
          it.rate,
          inv.currency
        )}</td><td class="num">${money(it.amount, inv.currency)}</td></tr>`
    )
    .join('');

  return `<!doctype html><html><head><meta charset="utf-8"><title>${inv.number}</title>
<style>
  body{font-family:system-ui,Segoe UI,Arial,sans-serif;color:#1a1a2e;max-width:720px;margin:24px auto;padding:0 16px}
  .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0b6e4f;padding-bottom:12px}
  h1{margin:0;font-size:26px;color:#0b6e4f}
  .muted{color:#666;font-size:13px}
  table{width:100%;border-collapse:collapse;margin-top:20px}
  th,td{padding:10px;border-bottom:1px solid #eee;text-align:left}
  .num{text-align:right}
  .total{font-size:18px;font-weight:700;color:#0b6e4f}
  .foot{margin-top:24px;font-size:12px;color:#666}
</style></head><body>
  <div class="head">
    <div><h1>INVOICE</h1><div class="muted">${esc(inv.number)} · Issued ${inv.date} · Due ${inv.due}</div></div>
    <div style="text-align:right">
      <strong>${esc(inv.freelancerName)}</strong><br>
      <span class="muted">${esc(inv.freelancerEmail)}</span>
    </div>
  </div>
  <p><strong>Bill to:</strong> ${esc(inv.clientName)}${inv.clientCountry ? ' · ' + esc(inv.clientCountry) : ''}</p>
  <table>
    <thead><tr><th>Description</th><th class="num">Qty</th><th class="num">Rate</th><th class="num">Amount</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr><td colspan="3" class="num total">Total</td><td class="num total">${money(inv.total, inv.currency)}</td></tr></tfoot>
  </table>
  ${inv.notes ? `<p class="muted"><strong>Notes:</strong> ${esc(inv.notes)}</p>` : ''}
  <div class="foot">${esc(inv.taxNote)}</div>
</body></html>`;
}

function money(n, cur) {
  return `${cur} ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
