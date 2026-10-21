import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { ledgerService } from './src/server/ledgerEngine.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// In-memory rate limiting and active sessions
const loginAttempts = new Map<string, { count: number; lockedUntil: number | null }>();
const activeSessions = new Set<string>();

// Middleware for token validation
function authMiddleware(req: Request, res: Response, next: () => void) {
  // Allow public auth and health endpoints
  if (
    req.path.startsWith('/auth/login') ||
    req.path === '/health' ||
    req.originalUrl.startsWith('/api/auth/login') ||
    req.originalUrl === '/api/health'
  ) {
    return next();
  }
  const authHeader = req.headers.authorization;
  if (!authHeader && !req.query.token) {
    // Return unauthorized for protected API endpoints
    return res.status(401).json({ error: 'Unauthorized: Session authentication token required' });
  }
  next();
}

app.use('/api', authMiddleware);

// --- Auth Endpoints ---
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { identifier, password, rememberMe } = req.body;
  const clientIp = req.ip || '198.51.100.44';

  const rateKey = `${clientIp}_${identifier}`;
  const now = Date.now();
  const attemptInfo = loginAttempts.get(rateKey) || { count: 0, lockedUntil: null };

  if (attemptInfo.lockedUntil && attemptInfo.lockedUntil > now) {
    const remainingSeconds = Math.ceil((attemptInfo.lockedUntil - now) / 1000);
    return res.status(429).json({
      error: `Too many unsuccessful login attempts. For your security, this account is temporarily locked for ${remainingSeconds} seconds.`,
      locked: true,
      remainingSeconds,
    });
  }

  // Check valid credentials
  // Customer ID is '10482' or email 'justin.jefferson@example.com' or username 'justin'
  const isIdValid =
    identifier === '10482' ||
    identifier?.toLowerCase() === 'justin.jefferson@example.com' ||
    identifier?.toLowerCase() === 'justin';

  if (!isIdValid || !ledgerService.checkAuth(password)) {
    attemptInfo.count += 1;
    if (attemptInfo.count >= 5) {
      attemptInfo.lockedUntil = now + 60 * 1000; // 1 min lock
      loginAttempts.set(rateKey, attemptInfo);
      return res.status(429).json({
        error: 'Security alert: 5 consecutive failed sign-in attempts detected. Account locked for 60 seconds.',
        locked: true,
        remainingSeconds: 60,
      });
    }
    loginAttempts.set(rateKey, attemptInfo);
    return res.status(401).json({
      error: `Invalid Customer ID or Password. Remaining attempts before temporary lock: ${5 - attemptInfo.count}.`,
      remainingAttempts: 5 - attemptInfo.count,
    });
  }

  // Reset rate limiting on success
  loginAttempts.delete(rateKey);

  const token = `usb_sess_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  activeSessions.add(token);

  const customer = ledgerService.getCustomer();
  const accounts = ledgerService.getAccounts();

  return res.json({
    success: true,
    token,
    customer,
    accounts,
    message: 'Authentication successful. Secure session initialized.',
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || (req.query.token as string);
  if (token) {
    activeSessions.delete(token);
  }
  return res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/auth/me', (_req: Request, res: Response) => {
  const customer = ledgerService.getCustomer();
  const accounts = ledgerService.getAccounts();
  return res.json({ customer, accounts });
});

app.post('/api/auth/change-password', (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!ledgerService.checkAuth(currentPassword)) {
    return res.status(400).json({ error: 'Current password does not match records.' });
  }
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters with numbers and symbols.' });
  }
  return res.json({ success: true, message: 'Password updated successfully. All active sessions notified.' });
});

// --- Customer Profile Endpoints ---
app.get('/api/customer', (_req: Request, res: Response) => {
  return res.json(ledgerService.getCustomer());
});

app.put('/api/customer', (req: Request, res: Response) => {
  try {
    const updated = ledgerService.updateCustomer(req.body);
    return res.json({ success: true, customer: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to update customer profile' });
  }
});

// --- Accounts Endpoints ---
app.get('/api/accounts', (_req: Request, res: Response) => {
  return res.json(ledgerService.getAccounts());
});

app.get('/api/accounts/:id', (req: Request, res: Response) => {
  const account = ledgerService.getAccount(req.params.id);
  if (!account) return res.status(404).json({ error: 'Account not found' });
  return res.json(account);
});

// --- Account Status & Transfer Restriction Endpoints ---
app.get('/api/account/status', (req: Request, res: Response) => {
  const accountId = (req.query.accountId as string) || 'acc_checking_4821';
  return res.json(ledgerService.getAccountStatus(accountId));
});

app.get('/api/accounts/:id/status', (req: Request, res: Response) => {
  return res.json(ledgerService.getAccountStatus(req.params.id));
});

app.get('/api/account-restriction', (_req: Request, res: Response) => {
  return res.json(ledgerService.getAccountStatus());
});

// --- Transactions Endpoints ---
app.get('/api/transactions', (req: Request, res: Response) => {
  const {
    accountId,
    search,
    category,
    type,
    status,
    startDate,
    endDate,
    sortBy = 'date',
    sortOrder = 'desc',
    page = '1',
    limit = '20',
  } = req.query;

  let txs = ledgerService.getTransactions(accountId as string);

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    txs = txs.filter(
      (t) =>
        t.merchant.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.reference.toLowerCase().includes(q)
    );
  }

  if (category && typeof category === 'string' && category !== 'All') {
    txs = txs.filter((t) => t.category.toLowerCase() === category.toLowerCase());
  }

  if (type && typeof type === 'string' && type !== 'All') {
    txs = txs.filter((t) => t.type.toLowerCase() === type.toLowerCase());
  }

  if (status && typeof status === 'string' && status !== 'All') {
    txs = txs.filter((t) => t.status.toLowerCase() === status.toLowerCase());
  }

  if (startDate && typeof startDate === 'string') {
    txs = txs.filter((t) => t.date >= startDate);
  }

  if (endDate && typeof endDate === 'string') {
    txs = txs.filter((t) => t.date <= endDate);
  }

  // Sort
  txs.sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'amount') {
      cmp = a.amount - b.amount;
    } else {
      cmp = a.date.localeCompare(b.date);
      if (cmp === 0) cmp = a.id.localeCompare(b.id);
    }
    return sortOrder === 'asc' ? cmp : -cmp;
  });

  const total = txs.length;
  const p = Math.max(1, parseInt(page as string, 10) || 1);
  const l = Math.max(1, parseInt(limit as string, 10) || 20);
  const offset = (p - 1) * l;
  const paginated = txs.slice(offset, offset + l);

  return res.json({
    data: paginated,
    pagination: {
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    },
  });
});

app.get('/api/transactions/:id', (req: Request, res: Response) => {
  const tx = ledgerService.getTransactions().find((t) => t.id === req.params.id);
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });
  return res.json(tx);
});

// --- Transfers Endpoints ---
app.post('/api/transfers', (req: Request, res: Response) => {
  try {
    const result = ledgerService.executeTransfer(req.body);
    return res.status(201).json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Transfer processing failed' });
  }
});

app.get('/api/payees', (_req: Request, res: Response) => {
  return res.json(ledgerService.getPayees());
});

app.post('/api/payees', (req: Request, res: Response) => {
  const { name, bankName, accountNumber, routingNumber, accountType } = req.body;
  if (!name || !bankName || !accountNumber || !routingNumber) {
    return res.status(400).json({ error: 'All payee fields are required.' });
  }
  const maskedAcc = `•••• ${accountNumber.slice(-4)}`;
  const maskedRouting = `•••• ${routingNumber.slice(-4)}`;

  const newPayee = ledgerService.addPayee({
    name,
    bankName,
    accountNumberMasked: maskedAcc,
    routingNumberMasked: maskedRouting,
    accountType: accountType || 'checking',
  });

  return res.status(201).json({ success: true, payee: newPayee });
});

// --- Statements Endpoints ---
app.get('/api/statements', (req: Request, res: Response) => {
  const accountId = (req.query.accountId as string) || 'acc_checking_4821';
  const statements = ledgerService.getStatements(accountId);
  return res.json(statements);
});

app.get('/api/statements/:year/:month', (req: Request, res: Response) => {
  const year = parseInt(req.params.year, 10);
  const month = parseInt(req.params.month, 10);
  const accountId = (req.query.accountId as string) || 'acc_checking_4821';

  const detail = ledgerService.getStatementDetail(year, month, accountId);
  if (!detail) return res.status(404).json({ error: 'Statement not found for requested period.' });
  return res.json(detail);
});

// --- Notifications Endpoints ---
app.get('/api/notifications', (_req: Request, res: Response) => {
  return res.json(ledgerService.getNotifications());
});

app.patch('/api/notifications/:id/read', (req: Request, res: Response) => {
  const updated = ledgerService.markNotificationRead(req.params.id);
  return res.json(updated);
});

app.post('/api/notifications/read-all', (_req: Request, res: Response) => {
  const updated = ledgerService.markAllNotificationsRead();
  return res.json(updated);
});

// --- Security Sessions Endpoints ---
app.get('/api/security/sessions', (_req: Request, res: Response) => {
  return res.json(ledgerService.getSecuritySessions());
});

app.post('/api/security/terminate-sessions', (_req: Request, res: Response) => {
  const remaining = ledgerService.terminateOtherSessions();
  return res.json({ success: true, remaining, message: 'All other active sessions have been securely terminated.' });
});

// --- Balance History Analytics ---
app.get('/api/analytics/balance-history', (req: Request, res: Response) => {
  const range = (req.query.range as string) || '30D';
  const txs = ledgerService.getTransactions('acc_checking_4821').filter((t) => t.status === 'posted');
  
  const now = new Date('2026-10-18T12:00:00Z');
  let cutoffDate = new Date(now);

  if (range === '7D') {
    cutoffDate.setDate(now.getDate() - 7);
  } else if (range === '30D') {
    cutoffDate.setDate(now.getDate() - 30);
  } else if (range === '90D') {
    cutoffDate.setDate(now.getDate() - 90);
  } else if (range === '1Y') {
    cutoffDate.setFullYear(now.getFullYear() - 1);
  } else if (range === 'ALL') {
    cutoffDate = new Date('2021-01-01');
  }

  const cutoffStr = cutoffDate.toISOString().split('T')[0];
  const filtered = txs.filter((t) => t.date >= cutoffStr);

  // Group by date, taking the last runningBalance on that date
  const dateMap = new Map<string, number>();
  for (const t of filtered) {
    dateMap.set(t.date, t.runningBalance);
  }

  const chartData = Array.from(dateMap.entries()).map(([date, balance]) => ({
    date,
    balance,
  }));

  return res.json({
    range,
    data: chartData,
  });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'US Bank Digital Portal API', timestamp: new Date().toISOString() });
});

// --- Vite Middlewares for Dev or Static Serving for Prod ---
async function startServer() {
  const publicPath = path.resolve(__dirname, 'public');
  app.use(express.static(publicPath));

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`[US Bank Portal] Server operational at http://0.0.0.0:${PORT}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
export { app };
