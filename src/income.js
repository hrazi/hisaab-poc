import { getDb } from './db.js';

export function addIncome({ partner, source, amount, date }) {
  const today = date || new Date().toISOString().slice(0, 10);
  return getDb().prepare(
    'INSERT INTO income (partner, source, amount, date) VALUES (?, ?, ?, ?)'
  ).run(partner || 'p1', source || 'salary', amount, today);
}

export function getMonthIncome(month) {
  return getDb().prepare('SELECT * FROM income WHERE date LIKE ? ORDER BY date DESC').all(`${month}%`);
}
