// Zero-dependency HTTP server: serves the UI and exposes the agent + tool APIs.

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';
import { handleMessage } from './agent.js';
import { rankRails } from './forex.js';
import { estimateTax } from './tax.js';
import { buildInvoice } from './invoice.js';
import { reviewContract } from './contract.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, '..', 'public');
const PORT = process.env.PORT || 3000;

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

function send(res, code, body, type = 'application/json') {
  res.writeHead(code, { 'Content-Type': type, 'Access-Control-Allow-Origin': '*' });
  res.end(type === 'application/json' ? JSON.stringify(body) : body);
}

function readBody(req) {
  return new Promise((resolve) => {
    let d = '';
    req.on('data', (c) => (d += c));
    req.on('end', () => {
      try {
        resolve(d ? JSON.parse(d) : {});
      } catch {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (req.method === 'POST' && url.pathname === '/api/chat') {
      const { message, ctx } = await readBody(req);
      const out = await handleMessage(message, ctx || {});
      return send(res, 200, out);
    }
    if (req.method === 'POST' && url.pathname === '/api/forex') {
      const { amountUsd } = await readBody(req);
      return send(res, 200, rankRails(Number(amountUsd) || 1000));
    }
    if (req.method === 'POST' && url.pathname === '/api/tax') {
      return send(res, 200, estimateTax(await readBody(req)));
    }
    if (req.method === 'POST' && url.pathname === '/api/invoice') {
      return send(res, 200, buildInvoice(await readBody(req)));
    }
    if (req.method === 'POST' && url.pathname === '/api/contract') {
      const { text } = await readBody(req);
      return send(res, 200, reviewContract(text));
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
  console.log(`Hisaab POC running → http://localhost:${PORT}`);
  console.log(`LLM mode: ${process.env.OPENAI_API_KEY ? 'ON (OpenAI)' : 'OFF (rule-based)'}`);
});
