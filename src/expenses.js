import { getDb } from './db.js';

const CATEGORY_KEYWORDS = {
  food: ['food', 'grocer', 'restaurant', 'dinner', 'lunch', 'breakfast', 'takeout', 'coffee', 'cafe', 'pizza', 'burger', 'meal', 'eat', 'snack', 'sushi', 'taco'],
  transport: ['uber', 'lyft', 'taxi', 'bus', 'metro', 'gas', 'fuel', 'parking', 'train', 'flight', 'car', 'transit', 'toll', 'subway'],
  utilities: ['electricity', 'water', 'internet', 'phone', 'wifi', 'utility', 'cable', 'bill'],
  entertainment: ['movie', 'netflix', 'spotify', 'gaming', 'game', 'concert', 'show', 'streaming', 'hulu', 'disney', 'ticket', 'theatre'],
  health: ['doctor', 'medicine', 'pharmacy', 'gym', 'health', 'dental', 'hospital', 'medical', 'fitness', 'yoga'],
  shopping: ['clothes', 'clothing', 'amazon', 'shop', 'store', 'mall', 'shoes', 'apparel', 'fashion', 'ikea'],
  rent: ['rent', 'mortgage', 'housing', 'lease'],
};

export function guessCategory(text) {
  const low = text.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(k => low.includes(k))) return cat;
  }
  return 'other';
}

export function addExpense({ description, amount, category, paid_by, split, date }) {
  const today = date || new Date().toISOString().slice(0, 10);
  const cat = category || guessCategory(description);
  return getDb().prepare(
    'INSERT INTO expenses (description, amount, category, paid_by, split, date) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(description, amount, cat, paid_by || 'p1', split || 'equal', today);
}

export function getExpenses(month) {
  const db = getDb();
  if (month) {
    return db.prepare('SELECT * FROM expenses WHERE date LIKE ? ORDER BY date DESC').all(`${month}%`);
  }
  return db.prepare('SELECT * FROM expenses ORDER BY date DESC LIMIT 50').all();
}

export function getMonthSummary(month) {
  const db = getDb();
  const expenses = db.prepare('SELECT * FROM expenses WHERE date LIKE ? ORDER BY date DESC').all(`${month}%`);
  const byCategory = {};
  let total = 0;
  for (const e of expenses) {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    total += e.amount;
  }
  return { expenses, byCategory, total, count: expenses.length };
}
