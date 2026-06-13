const messages = document.getElementById('messages');
const input = document.getElementById('input');
const month = new Date().toISOString().slice(0, 7);

document.getElementById('month-label').textContent =
  new Date().toLocaleString('en', { month: 'long', year: 'numeric' });

// Tab switching
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
  });
});

function md(s) {
  return s
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

function fmt(n) {
  if (typeof n !== 'number') return '$0.00';
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function pctBar(pct) {
  const cls = pct >= 100 ? 'over' : pct >= 80 ? 'warn' : 'ok';
  return `<div class="bar-track"><div class="bar-fill ${cls}" style="width:${Math.min(100, pct)}%"></div></div>`;
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
  messages.scrollTop = messages.scrollHeight;
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    typing.remove();
    addMsg(data.reply, 'bot');
    if (data.card) applyCard(data.card);
  } catch {
    typing.remove();
    addMsg('Error reaching agent. Is the server running?', 'bot');
  }
}

function applyCard(card) {
  if (card.type === 'dashboard') {
    const d = card.data;
    renderOverview(d);
    renderExpenses(d);
    renderGoals(d);
    document.querySelector('.tab[data-tab="overview"]').click();
  }
}

function renderOverview(d) {
  const net = d.netBalance;
  const netClass = net >= 0 ? 'positive' : 'negative';
  const netStr = net >= 0 ? `+${fmt(net)}` : `-${fmt(Math.abs(net))}`;

  const incomeRows = [
    { name: d.names.p1, amount: d.incomeBreakdown.p1 },
    { name: d.names.p2, amount: d.incomeBreakdown.p2 }
  ].filter(r => r.amount > 0)
    .map(r => `<tr><td>${r.name}</td><td class="num">${fmt(r.amount)}</td></tr>`).join('') ||
    '<tr><td colspan="2" class="muted-cell">No income logged yet</td></tr>';

  const catRows = d.byCategory.length
    ? d.byCategory.map(c => `<tr><td>${c.name}</td><td class="num">${fmt(c.total)}</td></tr>`).join('')
    : '<tr><td colspan="2" class="muted-cell">No expenses yet</td></tr>';

  const budgetSection = d.budgets.length ? `
    <h4>Budget vs. actual</h4>
    ${d.budgets.map(b => `
      <div class="budget-row">
        <div class="budget-label"><span>${b.name}</span><span>${fmt(b.spent)} / ${fmt(b.monthly_limit)}</span></div>
        ${pctBar(b.pct)}
      </div>`).join('')}` : '';

  document.getElementById('tab-overview').innerHTML = `
    <div class="kpi">
      <div class="box"><b>${fmt(d.totalIncome)}</b><span>Income</span></div>
      <div class="box"><b>${fmt(d.totalExpenses)}</b><span>Expenses</span></div>
      <div class="box ${netClass}"><b>${netStr}</b><span>${net >= 0 ? 'Saved' : 'Over budget'}</span></div>
    </div>
    <h4>Income breakdown</h4>
    <table><tbody>${incomeRows}</tbody></table>
    <h4>Spending by category</h4>
    <table><tbody>${catRows}</tbody></table>
    ${budgetSection}`;
}

function renderExpenses(d) {
  const pane = document.getElementById('tab-expenses');
  if (!d.recentExpenses.length) {
    pane.innerHTML = '<div class="empty-state"><p>No expenses this month yet.</p><p>Try: <em>"spent $45 on groceries"</em></p></div>';
    return;
  }
  const rows = d.recentExpenses.map(e => `
    <tr>
      <td>${e.date.slice(5)}</td>
      <td>${e.description}</td>
      <td><span class="cat-tag">${e.category}</span></td>
      <td class="num">${fmt(e.amount)}</td>
    </tr>`).join('');
  pane.innerHTML = `
    <p class="summary-line">${d.expenseCount} expense${d.expenseCount !== 1 ? 's' : ''} · ${fmt(d.totalExpenses)} total</p>
    <table>
      <thead><tr><th>Date</th><th>Description</th><th>Category</th><th class="num">Amount</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function renderGoals(d) {
  const pane = document.getElementById('tab-goals');
  if (!d.goals.length) {
    pane.innerHTML = '<div class="empty-state"><p>No savings goals yet.</p><p>Try: <em>"save $5000 for vacation"</em></p></div>';
    return;
  }
  const goalCards = d.goals.map(g => {
    const pct = g.target_amount > 0 ? Math.round((g.current_amount / g.target_amount) * 100) : 0;
    return `
      <div class="goal-card">
        <div class="goal-header">
          <strong>${g.name}</strong>
          <span class="goal-pct ${pct >= 100 ? 'done' : ''}">${pct}%</span>
        </div>
        ${pctBar(pct)}
        <div class="goal-amounts">${fmt(g.current_amount)} of ${fmt(g.target_amount)}${g.deadline ? ` · by ${g.deadline}` : ''}</div>
      </div>`;
  }).join('');
  pane.innerHTML = `<div class="goals-list">${goalCards}</div>`;
}

async function loadDashboard() {
  try {
    const res = await fetch(`/api/dashboard?month=${month}`);
    const d = await res.json();
    renderOverview(d);
    renderExpenses(d);
    renderGoals(d);
  } catch { /* server not ready */ }
}

document.getElementById('composer').addEventListener('submit', e => {
  e.preventDefault();
  const t = input.value.trim();
  if (t) send(t);
});

document.querySelectorAll('.quick button').forEach(b =>
  b.addEventListener('click', () => send(b.dataset.q)));

addMsg("Hi! I'm **Hisaab**, your couples budgeting assistant. Log expenses, track income, set budgets, and build savings goals — all from chat.", 'bot');

loadDashboard();
