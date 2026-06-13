import { addExpense, getMonthSummary, guessCategory } from './expenses.js';
import { addIncome, getMonthIncome } from './income.js';
import { setBudget, getBudgetWithSpending } from './budget.js';
import { createGoal, contributeToGoal, getGoals } from './savings.js';
import { getPartnerNames, setSetting } from './db.js';

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function extractAmount(text) {
  // Match "$123.45" or "123 dollars" patterns
  const dollar = text.match(/\$\s*([\d,]+(?:\.\d{1,2})?)/);
  if (dollar) return parseFloat(dollar[1].replace(/,/g, ''));
  const word = text.match(/\b([\d,]+(?:\.\d{1,2})?)\s*(?:dollars?|bucks?)\b/i);
  if (word) return parseFloat(word[1].replace(/,/g, ''));
  const plain = text.match(/\b([\d,]+(?:\.\d{1,2})?)\b/);
  if (plain) { const n = parseFloat(plain[1].replace(/,/g, '')); return n > 0 ? n : null; }
  return null;
}

function extractDate(text) {
  if (/yesterday/i.test(text)) {
    const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10);
  }
  const iso = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (iso) return iso[1];
  return new Date().toISOString().slice(0, 10);
}

function whoPaid(text, names) {
  if (new RegExp(`\\b${names.p2}\\b`, 'i').test(text)) return 'p2';
  if (new RegExp(`\\b${names.p1}\\b`, 'i').test(text)) return 'p1';
  if (/\b(partner\s*2|p2)\b/i.test(text)) return 'p2';
  return 'p1';
}

function buildDashboard(month, names) {
  const expSummary = getMonthSummary(month);
  const income = getMonthIncome(month);
  const budgets = getBudgetWithSpending(month);
  const goals = getGoals();
  const totalIncome = income.reduce((s, i) => s + i.amount, 0);
  const byCategory = Object.entries(expSummary.byCategory)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);
  return {
    type: 'dashboard',
    data: {
      month, names,
      totalExpenses: expSummary.total,
      totalIncome,
      netBalance: totalIncome - expSummary.total,
      expenseCount: expSummary.count,
      byCategory, budgets, goals,
      recentExpenses: expSummary.expenses.slice(0, 20),
      incomeBreakdown: {
        p1: income.filter(i => i.partner === 'p1').reduce((s, i) => s + i.amount, 0),
        p2: income.filter(i => i.partner === 'p2').reduce((s, i) => s + i.amount, 0)
      }
    }
  };
}

export async function handleMessage(message, ctx = {}) {
  const text = String(message || '').trim();
  const low = text.toLowerCase();
  const names = getPartnerNames();
  const month = currentMonth();

  // 1. Set partner names — "our names are Alex and Jamie"
  if (/(our names|call us|i'?m\s+[A-Z]|my (name|partner) is)/i.test(text)) {
    const words = text.match(/\b[A-Z][a-z]{1,15}\b/g) || [];
    if (words.length >= 2) {
      setSetting('p1_name', words[0]);
      setSetting('p2_name', words[1]);
      return {
        reply: `Got it! I'll call you **${words[0]}** and **${words[1]}**. Ready to track your finances together!`,
        card: { type: 'names', data: { p1: words[0], p2: words[1] } }
      };
    }
  }

  // 2. Contribute to savings goal — check before expense since both use "add"
  if (/(add|put|contribute|deposit|toward|into).{0,40}\$?\d.{0,60}(goal|fund|saving|vacation|house|car|wedding|emergency|trip)/i.test(low) ||
      /(vacation|house|car|wedding|emergency|trip)\s.{0,30}fund.{0,30}\$?\d/i.test(low)) {
    const amount = extractAmount(text);
    if (amount) {
      const goalWords = text.match(/\b(vacation|house|car|wedding|emergency|trip|[a-z]+ fund|[a-z]+ goal)\b/i);
      if (goalWords) {
        const keyword = goalWords[1].replace(/\s+(fund|goal)$/i, '').trim();
        const updated = contributeToGoal(keyword, amount);
        if (updated) {
          const pct = Math.round((updated.current_amount / updated.target_amount) * 100);
          return {
            reply: `Added **$${amount.toFixed(2)}** to **${updated.name}**. Now at $${updated.current_amount.toFixed(2)} of $${updated.target_amount.toFixed(2)} (**${pct}%**).`,
            card: buildDashboard(month, names)
          };
        }
      }
    }
  }

  // 3. Add expense
  if (/(spent|paid|bought|purchased|charged|expense|cost|groceri|dinner|lunch|coffee|uber|taxi|gas)\b/i.test(low) && /\$?\d/.test(text)) {
    const amount = extractAmount(text);
    if (amount) {
      const paid_by = whoPaid(text, names);
      const paidByName = paid_by === 'p1' ? names.p1 : names.p2;

      let description = text
        .replace(/\$\s*[\d,]+(?:\.\d{1,2})?/g, '')
        .replace(/\b[\d,]+(?:\.\d{1,2})?\s*(?:dollars?|bucks?)?\b/gi, '')
        .replace(/\b(spent|paid|bought|purchased|expense|cost|on|for|at|yesterday|today|split|equally|equal|together|both|from|the|a|an)\b/gi, '')
        .replace(new RegExp(`\\b(${names.p1}|${names.p2})\\b`, 'gi'), '')
        .replace(/[^a-z0-9 '&-]/gi, ' ')
        .trim().replace(/\s+/g, ' ') || 'Expense';

      const category = guessCategory(text);
      addExpense({ description, amount, category, paid_by, split: 'equal', date: extractDate(text) });
      return {
        reply: `Added **${description}** — $${amount.toFixed(2)} (${category}, paid by **${paidByName}**).`,
        card: buildDashboard(month, names)
      };
    }
  }

  // 4. Add income
  if (/(income|salary|earned|received|got paid|paycheck|wage|freelance|deposit)/i.test(low) && /\$?\d/.test(text)) {
    const amount = extractAmount(text);
    if (amount) {
      const partner = whoPaid(text, names);
      const source = /salary/i.test(low) ? 'salary' : /freelance|client|contract/i.test(low) ? 'freelance' : 'income';
      const partnerName = partner === 'p1' ? names.p1 : names.p2;
      addIncome({ partner, source, amount, date: extractDate(text) });
      return {
        reply: `Logged **$${amount.toFixed(2)}** ${source} for **${partnerName}**.`,
        card: buildDashboard(month, names)
      };
    }
  }

  // 5. Set budget
  if (/(budget|limit)\s.{0,30}\$?\d/i.test(low) || /\$?\d.{0,30}(budget|limit)/i.test(low)) {
    const amount = extractAmount(text);
    if (amount) {
      const catRaw = text.match(/\b(food|grocer|transport|utilities?|entertainment|health|shopping|rent|dining|travel|fitness|clothing|coffee)\b/i);
      let catName = 'other';
      if (catRaw) {
        const c = catRaw[1].toLowerCase();
        catName = ['grocer', 'groceries', 'dining', 'coffee'].includes(c) ? 'food'
          : c === 'travel' ? 'transport'
          : c === 'fitness' ? 'health'
          : c === 'clothing' ? 'shopping'
          : c.replace(/s$/, '');
      }
      setBudget({ name: catName, monthly_limit: amount });
      return {
        reply: `Set **${catName}** budget to **$${amount.toFixed(2)}/month**.`,
        card: buildDashboard(month, names)
      };
    }
  }

  // 6. Create savings goal
  if (/(save|saving up|new goal|create.{0,10}goal)/i.test(low) && /\$?\d/.test(text) && !/(spent|paid|bought|expense|budget)/i.test(low)) {
    const amount = extractAmount(text);
    if (amount) {
      let goalName = text
        .replace(/\$?\s*[\d,]+(?:\.\d{1,2})?/g, '')
        .replace(/\b(save|saving|goal|create|new|add|set|up|for|a|an|by|target|to|the)\b/gi, '')
        .replace(/[^a-z0-9 '-]/gi, ' ')
        .trim().replace(/\s+/g, ' ') || 'Savings Goal';

      const deadlineMatch = text.match(/by\s+((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|\d{4}-\d{2}-\d{2})/i);
      const deadline = deadlineMatch?.[1] ?? null;

      createGoal({ name: goalName, target_amount: amount, deadline });
      return {
        reply: `Created goal **${goalName}** — target **$${amount.toFixed(2)}**${deadline ? ` by ${deadline}` : ''}.`,
        card: buildDashboard(month, names)
      };
    }
  }

  // 7. Summary / dashboard
  if (/(summary|how are we|this month|dashboard|overview|spending|balance|total|show me|status|report)/i.test(low)) {
    const card = buildDashboard(month, names);
    const d = card.data;
    const net = d.netBalance;
    const netStr = net >= 0 ? `+$${net.toFixed(2)} saved` : `-$${Math.abs(net).toFixed(2)} overspent`;
    const catStr = d.byCategory.slice(0, 3).map(c => `${c.name} $${c.total.toFixed(2)}`).join(', ');
    return {
      reply:
        `**${month} Summary**\n\n` +
        `• Income: $${d.totalIncome.toFixed(2)}\n` +
        `• Expenses: $${d.totalExpenses.toFixed(2)} (${d.expenseCount} transactions)\n` +
        `• Net: **${netStr}**` +
        (catStr ? `\n\nTop spending: ${catStr}` : '') +
        (d.goals.length ? `\n\nSavings: ${d.goals.slice(0, 2).map(g => `${g.name} ${g.target_amount > 0 ? Math.round((g.current_amount / g.target_amount) * 100) : 0}%`).join(', ')}` : ''),
      card
    };
  }

  // 8. List goals
  if (/\b(goals?|saving)\b/i.test(low) && !(/\$?\d/.test(text))) {
    const goals = getGoals();
    if (!goals.length) {
      return { reply: "No savings goals yet. Try: *\"save $5000 for vacation\"*", card: null };
    }
    const list = goals.map(g => {
      const pct = g.target_amount > 0 ? Math.round((g.current_amount / g.target_amount) * 100) : 0;
      return `• **${g.name}** — $${g.current_amount.toFixed(2)} / $${g.target_amount.toFixed(2)} (${pct}%)${g.deadline ? ` by ${g.deadline}` : ''}`;
    }).join('\n');
    return { reply: `**Your Savings Goals:**\n\n${list}`, card: buildDashboard(month, names) };
  }

  // 9. LLM fallback if configured
  const llm = await tryLlm(text, names);
  if (llm) return { reply: llm, card: null };

  // 10. Help
  return {
    reply:
      `I'm **Hisaab**, your couples budgeting assistant. Here's what I can help with:\n\n` +
      `• **Log expenses** — *"spent $45 on groceries"* or *"${names.p2} paid $120 for dinner"*\n` +
      `• **Track income** — *"${names.p1} earned $3000 salary"*\n` +
      `• **Set budgets** — *"set food budget to $600/month"*\n` +
      `• **Savings goals** — *"save $10000 for vacation"* or *"add $200 to vacation fund"*\n` +
      `• **Monthly summary** — *"how are we doing this month?"*\n\n` +
      `Tip: *"our names are Alex and Jamie"* to personalize.`,
    card: null
  };
}

async function tryLlm(text, names) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: `You are Hisaab, a couples budgeting assistant for ${names.p1} and ${names.p2}. Be concise and helpful about budgeting, expenses, and savings.` },
          { role: 'user', content: text }
        ],
        max_tokens: 300,
        temperature: 0.4
      })
    });
    const j = await res.json();
    return j?.choices?.[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  }
}
