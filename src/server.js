import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';
import { handleMessage } from './agent.js';
import { getMonthSummary, getExpenses } from './expenses.js';
import { getMonthIncome } from './income.js';
import { getBudgetWithSpending } from './budget.js';
import { getGoals } from './savings.js';
import { getPartnerNames } from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, '..', 'public');
const PORT = process.env.PORT || 3000;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

function send(res, code, body, type = 'application/json') {
  res.writeHead(code, { 'Content-Type': type, 'Access-Control-Allow-Origin': '*' });
  res.end(type === 'application/json' ? JSON.stringify(body) : body);
}

function readBody(req) {
  return new Promise(resolve => {
    let d = '';
    req.on('data', c => (d += c));
    req.on('end', () => { try { resolve(d ? JSON.parse(d) : {}); } catch { resolve({}); } });
  });
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (req.method === 'POST' && url.pathname === '/api/chat') {
      const { message, ctx } = await readBody(req);
      return send(res, 200, await handleMessage(message, ctx || {}));
    }

    if (req.method === 'GET' && url.pathname === '/api/dashboard') {
      const month = url.searchParams.get('month') || currentMonth();
      const names = getPartnerNames();
      const expSummary = getMonthSummary(month);
      const income = getMonthIncome(month);
      const budgets = getBudgetWithSpending(month);
      const goals = getGoals();
      const totalIncome = income.reduce((s, i) => s + i.amount, 0);
      const byCategory = Object.entries(expSummary.byCategory)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total);
      return send(res, 200, {
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
      });
    }

    if (req.method === 'GET' && url.pathname === '/api/expenses') {
      const month = url.searchParams.get('month') || currentMonth();
      return send(res, 200, getExpenses(month));
    }

    if (req.method === 'GET' && url.pathname === '/api/goals') {
      return send(res, 200, getGoals());
    }

    // Static files
    let p = url.pathname === '/' ? '/index.html' : url.pathname;
    p = p.replace(/\.\./g, '');
    const file = join(PUBLIC, p);
    const data = await readFile(file);
    return send(res, 200, data, MIME[extname(file)] || 'application/octet-stream');
  } catch (e) {
    if (e.code === 'ENOENT') return send(res, 404, { error: 'not found' });
    return send(res, 500, { error: String(e.message || e) });
  }
});

server.listen(PORT, () => {
  console.log(`Hisaab — Couples Budget → http://localhost:${PORT}`);
  console.log(`LLM mode: ${process.env.OPENAI_API_KEY ? 'ON (OpenAI)' : 'OFF (rule-based)'}`);
});
