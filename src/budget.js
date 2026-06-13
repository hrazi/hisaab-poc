import { getDb } from './db.js';

export function setBudget({ name, monthly_limit }) {
  return getDb().prepare(`
    INSERT INTO budget_categories (name, monthly_limit) VALUES (?, ?)
    ON CONFLICT(name) DO UPDATE SET monthly_limit = excluded.monthly_limit
  `).run(name.toLowerCase(), monthly_limit);
}

export function getBudgets() {
  return getDb().prepare('SELECT * FROM budget_categories ORDER BY name').all();
}

export function getBudgetWithSpending(month) {
  const budgets = getBudgets();
  const spending = getDb().prepare(
    'SELECT category, SUM(amount) as spent FROM expenses WHERE date LIKE ? GROUP BY category'
  ).all(`${month}%`);

  const spendMap = Object.fromEntries(spending.map(s => [s.category, s.spent]));
  return budgets.map(b => ({
    ...b,
    spent: spendMap[b.name] || 0,
    pct: Math.min(100, Math.round(((spendMap[b.name] || 0) / b.monthly_limit) * 100))
  }));
}
