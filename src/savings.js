import { getDb } from './db.js';

export function createGoal({ name, target_amount, deadline }) {
  return getDb().prepare(
    'INSERT INTO savings_goals (name, target_amount, deadline) VALUES (?, ?, ?)'
  ).run(name, target_amount, deadline ?? null);
}

export function contributeToGoal(nameFragment, amount) {
  const db = getDb();
  const goal = db.prepare(
    'SELECT * FROM savings_goals WHERE LOWER(name) LIKE ? ORDER BY id DESC LIMIT 1'
  ).get(`%${nameFragment.toLowerCase()}%`);
  if (!goal) return null;
  const newAmount = goal.current_amount + amount;
  db.prepare('UPDATE savings_goals SET current_amount = ? WHERE id = ?').run(newAmount, goal.id);
  return { ...goal, current_amount: newAmount };
}

export function getGoals() {
  return getDb().prepare('SELECT * FROM savings_goals ORDER BY created_at DESC').all();
}
