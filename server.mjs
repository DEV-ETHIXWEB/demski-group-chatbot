// Amplify Hosting compute entrypoint. Serves /api/chat and /api/send-lead by
// invoking the existing Vercel-style handlers unmodified, via a thin
// compatibility shim over Node's raw http module: req.body (manual JSON
// parsing) and res.status()/res.json() (Vercel Node runtime helpers that
// don't exist on raw http.ServerResponse). Static files (index.html,
// widget.js, etc.) are handled separately by Amplify's Static primitive —
// see deploy-manifest.json — this process only ever serves /api/*.
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import chatHandler from './api/chat.js';
import sendLeadHandler from './api/send-lead.js';

// Amplify Hosting's app-level "Environment variables" are confirmed to
// reach the BUILD phase (npm run build), but empirically do NOT show up in
// this compute resource's process.env at request time (production returned
// {"error":"API key not configured"} despite OPENAI_API_KEY being set in
// the console, and the deploy-manifest.json spec has no per-compute
// "environment" field to request it either). prepare-amplify.mjs snapshots
// the build-time values into .runtime-secrets.json next to this file; load
// them here, before the server starts accepting requests, as a fallback so
// api/chat.js and api/send-lead.js's own process.env.* reads (evaluated
// lazily per-request, not at import time) keep working unmodified.
function loadBuildTimeSecrets() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const secretsPath = join(__dirname, '.runtime-secrets.json');
  if (!existsSync(secretsPath)) return;
  try {
    const secrets = JSON.parse(readFileSync(secretsPath, 'utf8'));
    for (const [key, value] of Object.entries(secrets)) {
      if (value && !process.env[key]) process.env[key] = value;
    }
  } catch (e) {
    console.error('[server] Failed to load .runtime-secrets.json:', e.message);
  }
}
loadBuildTimeSecrets();

const PORT = process.env.PORT || 3000;

function readJsonBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

// Adds Vercel's res.status()/res.json() convenience methods on top of the
// raw http.ServerResponse so chat.js/send-lead.js run completely unmodified.
function enhanceResponse(res) {
  res.status = function (code) {
    res.statusCode = code;
    return res;
  };
  res.json = function (payload) {
    if (!res.getHeader('Content-Type')) res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(payload));
    return res;
  };
  return res;
}

const routes = {
  '/api/chat': chatHandler,
  '/api/send-lead': sendLeadHandler,
};

// Lightweight in-memory rate limiter — defense-in-depth BEHIND AWS WAF (the
// primary rate control at the CloudFront edge). This is best-effort: state is
// per compute instance and resets on cold start, and it is strictly
// FAIL-OPEN — any error in the check lets the request through, so a limiter
// bug can never block real traffic. Limits sit far above real usage (a normal
// visitor sends a few chats and at most one lead), so legitimate users are
// never affected; only crude flooding from a single IP is slowed.
const RATE_LIMITS = {
  '/api/chat': { max: 40, windowMs: 60_000 },
  '/api/send-lead': { max: 8, windowMs: 60_000 },
};
const rateHits = new Map(); // key -> { count, resetAt }

function clientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length) return xff.split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

function isRateLimited(req, pathname) {
  try {
    const cfg = RATE_LIMITS[pathname];
    if (!cfg) return false;
    const now = Date.now();
    const key = pathname + '|' + clientIp(req);
    let entry = rateHits.get(key);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + cfg.windowMs };
      rateHits.set(key, entry);
    }
    entry.count += 1;
    // Opportunistic cleanup so the map can't grow unbounded.
    if (rateHits.size > 5000) {
      for (const [k, v] of rateHits) if (now > v.resetAt) rateHits.delete(k);
    }
    return entry.count > cfg.max;
  } catch {
    return false; // fail-open
  }
}

const server = createServer(async (req, res) => {
  enhanceResponse(res);

  // vercel.json previously applied this globally to every /api/* response
  // (not just OPTIONS preflights). Set it as a default here so
  // chat.js/send-lead.js's own OPTIONS-only header calls stay authoritative
  // (they run after this and win), while every other response still gets it.
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { pathname } = new URL(req.url, 'http://localhost');
  const handler = routes[pathname];

  if (!handler) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  if (req.method === 'POST' && isRateLimited(req, pathname)) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Too many requests, please slow down.' }));
    return;
  }

  req.body = req.method === 'POST' ? await readJsonBody(req) : {};

  try {
    await handler(req, res);
  } catch (e) {
    console.error('[server] Unhandled error:', e);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }
});

server.listen(PORT, () => {
  console.log(`Chatbot compute server listening on port ${PORT}`);
});
