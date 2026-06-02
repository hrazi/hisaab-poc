const messages = document.getElementById('messages');
const card = document.getElementById('card');
const input = document.getElementById('input');

function md(s) {
  return s
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

function addMsg(text, who) {
  const div = document.createElement('div');
  div.className = `msg ${who}`;
  div.innerHTML = md(text);
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

async function send(text) {
  addMsg(text, 'user');
  input.value = '';
  const typing = document.createElement('div');
  typing.className = 'msg bot';
  typing.textContent = '…';
  messages.appendChild(typing);
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    typing.remove();
    addMsg(data.reply, 'bot');
    if (data.card) renderCard(data.card);
  } catch (e) {
    typing.remove();
    addMsg('⚠️ Error reaching agent. Is the server running?', 'bot');
  }
}

function tag(av) {
  const m = { available: ['green', '🟢 available'], limited: ['yellow', '🟡 limited'], unavailable: ['red', '🔴 unavailable'] };
  const [c, l] = m[av] || ['', av];
  return `<span class="tag ${c}">${l}</span>`;
}

function renderCard(c) {
  card.classList.remove('empty');
  if (c.type === 'forex') {
    const d = c.data;
    const rows = d.results.map(r => `
      <tr class="${r.id === d.best.id ? 'best' : ''}">
        <td>${r.name}</td><td>${tag(r.availability)}</td>
        <td class="num">PKR ${r.netPkr.toLocaleString()}</td>
        <td class="num">${r.totalCostPct}%</td><td class="num">${r.speedDays}d</td>
      </tr>`).join('');
    card.innerHTML = `<h3>💱 Payment rail comparison — $${d.amountUsd.toLocaleString()}</h3>
      ${d.rate ? `<p style="font-size:12px;margin:0 0 6px">${d.rate.live
        ? `🟢 Live interbank <strong>${d.rate.rate.toFixed(2)} PKR/USD</strong> · ${d.rate.source}${d.rate.updated ? ' · ' + d.rate.updated : ''}`
        : `🟠 Offline fallback rate <strong>${d.rate.rate} PKR/USD</strong>`}</p>` : ''}
      <div class="kpi">
        <div class="box"><b>${d.best.name}</b><span>best compliant rail</span></div>
        <div class="box"><b>PKR ${d.savingsPkr.toLocaleString()}</b><span>saved vs worst option</span></div>
      </div>
      <table><thead><tr><th>Rail</th><th>Status</th><th class="num">You receive</th><th class="num">Cost</th><th class="num">Speed</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <p style="font-size:12px;color:#6b7280;margin-top:12px">FX rate is live; rail fees/spreads are illustrative defaults. PayPal’s unavailability is the core market gap.</p>`;
  } else if (c.type === 'tax') {
    const d = c.data;
    card.innerHTML = `<h3>📊 FBR tax estimate</h3>
      <div class="kpi">
        <div class="box"><b>PKR ${d.finalTaxPkr.toLocaleString()}</b><span>annual tax (${d.rateLabel})</span></div>
        <div class="box"><b>${d.effectivePct}%</b><span>effective rate</span></div>
        <div class="box"><b>PKR ${d.monthlyReservePkr.toLocaleString()}</b><span>set aside / month</span></div>
      </div>
      <p style="font-size:13px"><strong>Annual export income:</strong> PKR ${d.annualPkr.toLocaleString()}</p>
      ${d.tips.map(t => `<div class="flag info">${t}</div>`).join('')}
      <p style="font-size:12px;color:#6b7280">Illustrative — not tax advice.</p>`;
  } else if (c.type === 'invoice') {
    const d = c.data;
    const blob = new Blob([d.html], { type: 'text/html' });
    const urlObj = URL.createObjectURL(blob);
    card.innerHTML = `<h3>🧾 ${d.number}</h3>
      <iframe srcdoc="${d.html.replace(/"/g, '&quot;')}"></iframe>
      <a class="dl" href="${urlObj}" target="_blank">Open / Print to PDF →</a>`;
  } else if (c.type === 'contract') {
    const d = c.data;
    card.innerHTML = `<h3>📄 Contract review — ${d.score}/100</h3>
      ${d.findings.length ? d.findings.map(f => `<div class="flag ${f.severity}"><strong>${f.flag}</strong><br>${f.why}</div>`).join('')
        : '<p>No common red flags detected.</p>'}`;
  }
}

document.getElementById('composer').addEventListener('submit', (e) => {
  e.preventDefault();
  const t = input.value.trim();
  if (t) send(t);
});
document.querySelectorAll('.quick button').forEach(b =>
  b.addEventListener('click', () => send(b.dataset.q)));

addMsg("👋 I'm **Hisaab**, your AI back-office. Try a quick action below, or ask me how to get paid, invoice a client, or estimate your FBR tax.", 'bot');
