import fs from 'fs';
import path from 'path';
import {
  Account,
  Customer,
  Transaction,
  BankNotification,
  SecuritySession,
  StatementSummary,
  Payee,
  TransferRequest,
  AccountRestriction,
  AccountStatusData,
} from '../types/banking.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'banking_ledger.json');

export const DEFAULT_ACCOUNT_RESTRICTION: AccountRestriction = {
  restriction_active: true,
  status_label: 'Account Locked',
  reason: 'Additional branch verification required to lift security hold.',
  affected_services: [
    'Outgoing bank transfers',
    'Incoming bank transfers',
    'Debit card purchases',
    'External withdrawals',
  ],
  unaffected_services: ['Historical statement viewing', 'Account balance review', 'Document access'],
  notification_message:
    'Transfers and outgoing debits are temporarily restricted pending in-person branch verification.',
  resolution_instructions:
    'Please visit your local U.S. Bank branch with valid government-issued photo identification to verify your identity and resolve this security hold.',
};

export const SAVINGS_ACCOUNT_RESTRICTION: AccountRestriction = {
  restriction_active: true,
  status_label: 'Account Locked',
  reason: 'Additional branch verification required to lift security hold.',
  affected_services: ['Outgoing bank transfers', 'Incoming bank transfers', 'Account withdrawals'],
  unaffected_services: ['Historical statement viewing', 'Interest accrual review'],
  notification_message: 'Transfers and outgoing debits are temporarily restricted pending in-person branch verification.',
  resolution_instructions: 'Please visit your local U.S. Bank branch with valid government-issued photo identification to verify your identity and resolve this security hold.',
};

export const CREDIT_ACCOUNT_RESTRICTION: AccountRestriction = {
  restriction_active: true,
  status_label: 'Temporary Security Hold',
  reason: 'Additional branch verification required to lift security hold.',
  affected_services: ['Card purchases', 'Outgoing bank transfers', 'Cash advances'],
  unaffected_services: ['Historical statement viewing'],
  notification_message: 'Transfers and outgoing debits are temporarily restricted pending in-person branch verification.',
  resolution_instructions: 'Please visit your local U.S. Bank branch with valid government-issued photo identification to verify your identity and resolve this security hold.',
};

export const PENDING_HOSPITAL_TRANSACTION: Transaction = {
  id: 'TXN-300K-HOSP',
  reference: 'REF-202610-HOSP300K',
  accountId: 'acc_checking_4821',
  date: '2026-10-19',
  postingDate: 'Pending Review',
  time: '08:15:00',
  merchant: 'Unspecified Healthcare Provider (Pending provider confirmation)',
  provider: 'Unspecified Healthcare Provider',
  label: 'Hospital Bill Payment',
  description: 'Hospital Bill Payment',
  category: 'Health',
  type: 'debit',
  amount: 300000.0,
  status: 'Pending Review',
  runningBalance: 3386370.46,
  paymentMethod: 'Electronic Healthcare Settlement',
  notes: 'Pending provider confirmation and account verification.',
};

interface LedgerData {
  customer: Customer;
  accounts: Account[];
  transactions: Transaction[];
  notifications: BankNotification[];
  securitySessions: SecuritySession[];
  payees: Payee[];
  auth: {
    passwordHash: string; // bcrypt-like or sha256 hash
    failedAttempts: number;
    lockedUntil: number | null;
  };
}

// Generate realistic transactions spanning 2021 to 2026
function generateSeedData(): LedgerData {
  const customer: Customer = {
    id: '10482',
    name: 'Justin Jefferson',
    email: 'justin.jefferson@example.com',
    phone: '+1 (555) 010-4821',
    address: {
      street: '1200 Nicollet Mall, Suite 1800',
      city: 'Minneapolis',
      state: 'MN',
      zip: '55403',
    },
    memberSince: '2021',
    accountType: 'Premium Checking',
    accountStatus: 'Active',
    avatarUrl: '/avatar.jpg',
    preferences: {
      dailyTransferLimit: 25000,
      paperlessStatements: true,
      twoFactorEnabled: true,
      sessionTimeoutMinutes: 15,
      currency: 'USD',
      emailAlerts: true,
      smsAlerts: true,
    },
  };

  const initialOpeningBalance = 42500.0;
  let currentRunningBalance = initialOpeningBalance;

  const rawTxTemplates: Array<{
    day: number;
    merchant: string;
    description: string;
    category: Transaction['category'];
    type: Transaction['type'];
    amount: number;
    paymentMethod: string;
    status?: Transaction['status'];
  }> = [
    // Standard monthly recurring pattern
    { day: 1, merchant: 'Minnesota Vikings FC', description: 'Semi-Monthly Direct Deposit Payroll', category: 'Income', type: 'credit', amount: 35000.0, paymentMethod: 'Direct Deposit' },
    { day: 3, merchant: 'Minneapolis Luxury Lofts', description: 'Residential Lease Auto-Debit', category: 'Utilities', type: 'debit', amount: 6200.0, paymentMethod: 'ACH Electronic Transfer' },
    { day: 4, merchant: 'Xcel Energy', description: 'Electric & Gas Residential Service', category: 'Utilities', type: 'debit', amount: 284.5, paymentMethod: 'Online Bill Pay' },
    { day: 6, merchant: 'Whole Foods Market Minneapolis', description: 'Organic Grocery Provisions', category: 'Groceries', type: 'debit', amount: 342.18, paymentMethod: 'Debit Card •••• 4821' },
    { day: 8, merchant: 'Equinox Gym & Spa', description: 'Executive Tier Health & Wellness Membership', category: 'Health', type: 'debit', amount: 360.0, paymentMethod: 'Debit Card •••• 4821' },
    { day: 10, merchant: 'Target Supercenter #0219', description: 'Household Essentials & Supplies', category: 'Shopping', type: 'debit', amount: 189.64, paymentMethod: 'Debit Card •••• 4821' },
    { day: 12, merchant: 'Manny’s Steakhouse', description: 'Client Dinner & Hospitality', category: 'Dining', type: 'debit', amount: 485.2, paymentMethod: 'Debit Card •••• 4821' },
    { day: 15, merchant: 'Minnesota Vikings FC', description: 'Semi-Monthly Direct Deposit Payroll', category: 'Income', type: 'credit', amount: 35000.0, paymentMethod: 'Direct Deposit' },
    { day: 16, merchant: 'US Bank High-Yield Savings', description: 'Scheduled Monthly Wealth Allocation Transfer', category: 'Transfer', type: 'debit', amount: 20000.0, paymentMethod: 'ACH Electronic Transfer' },
    { day: 18, merchant: 'Apple Store Mall of America', description: 'Hardware Equipment & App Subscriptions', category: 'Shopping', type: 'debit', amount: 249.99, paymentMethod: 'Debit Card •••• 4821' },
    { day: 20, merchant: 'Delta Air Lines', description: 'First Class Flight Booking - MSP to LAX', category: 'Travel', type: 'debit', amount: 1420.8, paymentMethod: 'Debit Card •••• 4821' },
    { day: 22, merchant: 'Bar La Grassa', description: 'Culinary Dinner Hospitality', category: 'Dining', type: 'debit', amount: 215.4, paymentMethod: 'Debit Card •••• 4821' },
    { day: 24, merchant: 'Shell Oil Minneapolis', description: 'Premium Fuel Service Station', category: 'Services', type: 'debit', amount: 76.5, paymentMethod: 'Debit Card •••• 4821' },
    { day: 27, merchant: 'Nike Inc Sponsorship', description: 'Endorsement Royalty Disbursement', category: 'Income', type: 'credit', amount: 12500.0, paymentMethod: 'Wire Transfer' },
    { day: 28, merchant: 'US Bank ATM #401 Nicollet', description: 'Cash Withdrawal - Concierge ATM', category: 'Services', type: 'debit', amount: 500.0, paymentMethod: 'ATM Withdrawal' },
    { day: 30, merchant: 'US Bank Deposit Interest', description: 'Premium Tier Relationship Interest Credit', category: 'Interest', type: 'credit', amount: 18.42, paymentMethod: 'System Interest Credit' },
  ];

  const transactions: Transaction[] = [];
  let txCounter = 1001;

  // Generate spanning from 2021 through October 2026
  for (let year = 2021; year <= 2026; year++) {
    const maxMonth = year === 2026 ? 10 : 12;
    for (let month = 1; month <= maxMonth; month++) {
      const monthStr = month < 10 ? `0${month}` : `${month}`;

      // Pick subset of templates for natural variation
      for (const t of rawTxTemplates) {
        // Skip some variable items to create dynamic months
        if ((t.merchant.includes('Delta') && (month % 3 !== 0)) ||
            (t.merchant.includes('Nike') && (month % 2 !== 0)) ||
            (t.merchant.includes('Apple') && (month % 4 !== 0))) {
          continue;
        }

        const dayPadded = t.day < 10 ? `0${t.day}` : `${t.day}`;
        // If October 2026, don't generate beyond current date (Oct 18, 2026)
        if (year === 2026 && month === 10 && t.day > 18) {
          continue;
        }

        const txDate = `${year}-${monthStr}-${dayPadded}`;
        const refId = `REF-${year}${monthStr}-${txCounter++}`;
        const txId = `txn_${year}_${monthStr}_${txCounter}`;

        // Vary amount slightly per month for realism (except fixed salary)
        let txAmount = t.amount;
        if (t.category === 'Groceries' || t.category === 'Dining' || t.category === 'Shopping' || t.category === 'Services') {
          const jitter = ((txCounter % 17) - 8) * 3.75;
          txAmount = Math.max(15, Math.round((t.amount + jitter) * 100) / 100);
        } else if (t.category === 'Interest') {
          txAmount = Math.round((currentRunningBalance * 0.00035) * 100) / 100;
        }

        // Determine if pending (only for latest 2 transactions on Oct 16-17, 2026)
        const isPending = year === 2026 && month === 10 && t.day >= 16 && t.type === 'debit';
        const status: Transaction['status'] = isPending ? 'pending' : 'posted';

        if (status === 'posted') {
          if (t.type === 'credit') {
            currentRunningBalance = Math.round((currentRunningBalance + txAmount) * 100) / 100;
          } else {
            currentRunningBalance = Math.round((currentRunningBalance - txAmount) * 100) / 100;
          }
        }

        transactions.push({
          id: txId,
          reference: refId,
          accountId: 'acc_checking_4821',
          date: txDate,
          postingDate: isPending ? 'Pending Settlement' : txDate,
          time: `${10 + (txCounter % 10)}:${(txCounter % 50).toString().padStart(2, '0')}:00`,
          merchant: t.merchant,
          description: t.description,
          category: t.category,
          type: t.type,
          amount: txAmount,
          status: status,
          runningBalance: currentRunningBalance,
          paymentMethod: t.paymentMethod,
        });
      }
    }
  }

  // Sort transactions chronologically
  transactions.sort((a, b) => {
    const cmp = a.date.localeCompare(b.date);
    if (cmp !== 0) return cmp;
    return a.id.localeCompare(b.id);
  });

  // Re-verify exact running balance sequentially
  let verifiedBalance = initialOpeningBalance;
  for (const tx of transactions) {
    if (tx.status === 'posted') {
      if (tx.type === 'credit') {
        verifiedBalance = Math.round((verifiedBalance + tx.amount) * 100) / 100;
      } else {
        verifiedBalance = Math.round((verifiedBalance - tx.amount) * 100) / 100;
      }
      tx.runningBalance = verifiedBalance;
    } else {
      // Pending debit does not decrease ledger balance yet, but will decrease available
      tx.runningBalance = verifiedBalance;
    }
  }

  // Add simulated pending hospital bill transaction to recent activity feed
  transactions.unshift(PENDING_HOSPITAL_TRANSACTION);

  // Calculate pending debits
  const pendingDebits = transactions
    .filter((t) => (t.status === 'pending' || t.status === 'Pending Review') && t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const availableBalance = Math.round((verifiedBalance - pendingDebits) * 100) / 100;

  const accounts: Account[] = [
    {
      id: 'acc_checking_4821',
      name: 'Premium Checking',
      accountNumber: '1048214821',
      accountNumberMasked: '•••• 4821',
      routingNumber: '091000022',
      routingNumberMasked: '•••• 0022',
      type: 'checking',
      status: 'Frozen',
      currency: 'USD',
      availableBalance: 0.0,
      ledgerBalance: verifiedBalance,
      openingBalance: initialOpeningBalance,
      openedDate: '2021-01-05',
      lastUpdated: '2026-10-19T08:15:00.000Z',
      interestRate: 0.45,
      isPrimary: true,
      restriction: DEFAULT_ACCOUNT_RESTRICTION,
    },
    {
      id: 'acc_savings_6194',
      name: 'US Bank High-Yield Savings',
      accountNumber: '1048216194',
      accountNumberMasked: '•••• 6194',
      routingNumber: '091000022',
      routingNumberMasked: '•••• 0022',
      type: 'savings',
      status: 'Frozen',
      currency: 'USD',
      availableBalance: 486420.5,
      ledgerBalance: 486420.5,
      openingBalance: 50000.0,
      openedDate: '2021-03-12',
      lastUpdated: '2026-10-18T12:00:00.000Z',
      interestRate: 4.25,
      isPrimary: false,
      restriction: SAVINGS_ACCOUNT_RESTRICTION,
    },
    {
      id: 'acc_credit_9920',
      name: 'US Bank Altitude Reserve Visa',
      accountNumber: '400012349920',
      accountNumberMasked: '•••• 9920',
      routingNumber: '091000022',
      routingNumberMasked: '•••• 0022',
      type: 'credit',
      status: 'Frozen',
      currency: 'USD',
      availableBalance: 46850.0,
      ledgerBalance: 3150.0,
      openingBalance: 0,
      openedDate: '2022-06-15',
      lastUpdated: '2026-10-18T12:00:00.000Z',
      isPrimary: false,
      restriction: CREDIT_ACCOUNT_RESTRICTION,
    },
  ];

  const notifications: BankNotification[] = [
    {
      id: 'notif_1',
      title: 'Salary Deposit Confirmed',
      message: 'Direct deposit from Minnesota Vikings FC for $35,000.00 was posted to Premium Checking •••• 4821.',
      category: 'transaction',
      timestamp: '2026-10-15T08:00:00.000Z',
      isRead: false,
      actionUrl: '/transactions',
    },
    {
      id: 'notif_2',
      title: 'September 2026 Statement Ready',
      message: 'Your official monthly account statement for September 2026 is now available for download.',
      category: 'statement',
      timestamp: '2026-10-01T09:30:00.000Z',
      isRead: false,
      actionUrl: '/statements',
    },
    {
      id: 'notif_3',
      title: 'New Secure Sign-In',
      message: 'Successful authentication detected from macOS Safari in Minneapolis, MN.',
      category: 'security',
      timestamp: '2026-10-18T11:45:00.000Z',
      isRead: true,
      actionUrl: '/security',
    },
    {
      id: 'notif_4',
      title: 'High-Yield Interest Paid',
      message: 'Your savings account earned $1,720.88 in monthly interest at an APY of 4.25%.',
      category: 'account',
      timestamp: '2026-09-30T23:59:00.000Z',
      isRead: true,
      actionUrl: '/accounts',
    },
  ];

  const securitySessions: SecuritySession[] = [
    {
      id: 'sess_1',
      device: 'MacBook Pro 16" M3 Max',
      browser: 'Google Chrome 130.0',
      location: 'Minneapolis, MN (United States)',
      ip: '198.51.100.44',
      lastActive: 'Active Now (Current Session)',
      isCurrent: true,
    },
    {
      id: 'sess_2',
      device: 'iPhone 16 Pro Max',
      browser: 'US Bank Mobile App v12.4',
      location: 'Minneapolis, MN (United States)',
      ip: '172.56.21.90',
      lastActive: '2 hours ago',
      isCurrent: false,
    },
    {
      id: 'sess_3',
      device: 'iPad Pro 13"',
      browser: 'Safari 18.0',
      location: 'Wayzata, MN (United States)',
      ip: '198.51.100.78',
      lastActive: '3 days ago',
      isCurrent: false,
    },
  ];

  const payees: Payee[] = [
    {
      id: 'payee_1',
      name: 'Dr. Marcus Vance (Wealth Management Advisory)',
      accountType: 'checking',
      accountNumberMasked: '•••• 7712',
      bankName: 'JPMorgan Chase Bank',
      routingNumberMasked: '•••• 0021',
      lastUsedDate: '2026-09-20',
    },
    {
      id: 'payee_2',
      name: 'Apex Athletic Performance & Training LLC',
      accountType: 'checking',
      accountNumberMasked: '•••• 4419',
      bankName: 'Wells Fargo Bank',
      routingNumberMasked: '•••• 1220',
      lastUsedDate: '2026-10-02',
    },
    {
      id: 'payee_3',
      name: 'Nicollet Title & Escrow Co',
      accountType: 'checking',
      accountNumberMasked: '•••• 8820',
      bankName: 'US Bank',
      routingNumberMasked: '•••• 9210',
      lastUsedDate: '2026-08-14',
    },
  ];

  return {
    customer,
    accounts,
    transactions,
    notifications,
    securitySessions,
    payees,
    auth: {
      passwordHash: 'Password123!',
      failedAttempts: 0,
      lockedUntil: null,
    },
  };
}

class LedgerService {
  private data: LedgerData;

  constructor() {
    this.data = this.loadOrInitialize();
  }

  private loadOrInitialize(): LedgerData {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const content = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed: LedgerData = JSON.parse(content);

        // Ensure pending hospital transaction is present
        const hospIdx = parsed.transactions.findIndex((t) => t.id === 'TXN-300K-HOSP');
        if (hospIdx === -1) {
          parsed.transactions.unshift(PENDING_HOSPITAL_TRANSACTION);
        } else {
          parsed.transactions[hospIdx] = {
            ...parsed.transactions[hospIdx],
            merchant: 'Unspecified Healthcare Provider (Pending provider confirmation)',
            provider: 'Unspecified Healthcare Provider',
            label: 'Hospital Bill Payment',
            description: 'Hospital Bill Payment',
            amount: 300000.0,
            status: 'Pending Review',
          };
        }

        // Ensure checking account is inactive, frozen, unavailable and transfers blocked
        const checking = parsed.accounts.find((a) => a.id === 'acc_checking_4821');
        if (checking) {
          checking.status = 'Frozen';
          checking.availableBalance = 0.0;
          checking.restriction = DEFAULT_ACCOUNT_RESTRICTION;
        }

        // Ensure High-Yield Savings and Altitude Reserve Visa are inactive, frozen, and cannot transfer
        const savings = parsed.accounts.find((a) => a.id === 'acc_savings_6194');
        if (savings) {
          savings.status = 'Frozen';
          savings.availableBalance = 486420.5;
          savings.ledgerBalance = 486420.5;
          savings.restriction = SAVINGS_ACCOUNT_RESTRICTION;
        }

        const credit = parsed.accounts.find((a) => a.id === 'acc_credit_9920');
        if (credit) {
          credit.status = 'Frozen';
          credit.availableBalance = 46850.0;
          credit.restriction = CREDIT_ACCOUNT_RESTRICTION;
        }

        // Ensure accurate US Bank routing number for Justin Jefferson's accounts
        parsed.accounts.forEach((acc) => {
          if (!acc.routingNumber || acc.routingNumber === '071000288' || acc.routingNumberMasked === '•••• 0288' || acc.routingNumberMasked === '•••• 9210') {
            acc.routingNumber = '091000022';
            acc.routingNumberMasked = '•••• 0022';
          }
        });

        // Ensure restriction notification is present
        if (!parsed.notifications.some((n) => n.id === 'notif_restriction_300k')) {
          parsed.notifications.unshift({
            id: 'notif_restriction_300k',
            title: 'Account Status: Transfers Temporarily Restricted',
            message: 'This transfer restriction is limited to this account. The bank must verify the account before outgoing transfers can resume.',
            category: 'security',
            timestamp: '2026-10-19T08:15:00.000Z',
            isRead: false,
            actionUrl: '/transfers',
          });
        }

        this.persist(parsed);
        return parsed;
      }
    } catch (err) {
      console.warn('Failed to read ledger file, generating fresh seed data', err);
    }

    const seed = generateSeedData();
    this.persist(seed);
    return seed;
  }

  private persist(dataToSave: LedgerData = this.data) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write ledger data:', err);
    }
  }

  public getCustomer(): Customer {
    return this.data.customer;
  }

  public updateCustomer(update: Partial<Customer>): Customer {
    this.data.customer = {
      ...this.data.customer,
      ...update,
      address: {
        ...this.data.customer.address,
        ...(update.address || {}),
      },
      preferences: {
        ...this.data.customer.preferences,
        ...(update.preferences || {}),
      },
    };
    this.persist();
    return this.data.customer;
  }

  public getAccounts(): Account[] {
    return this.data.accounts;
  }

  public getAccount(id: string): Account | undefined {
    return this.data.accounts.find((a) => a.id === id);
  }

  public updateAccountRouting(accountId: string, newRoutingNumber: string, applyToAll: boolean = false): Account {
    const trimmed = newRoutingNumber.trim();
    if (!trimmed) throw new Error('Routing number cannot be empty');
    const masked = `•••• ${trimmed.slice(-4)}`;

    if (applyToAll || accountId === 'all') {
      this.data.accounts.forEach((acc) => {
        acc.routingNumber = trimmed;
        acc.routingNumberMasked = masked;
      });
      this.persist();
      const target = this.data.accounts.find((a) => a.id === accountId) || this.data.accounts[0];
      return target;
    }

    const acc = this.data.accounts.find((a) => a.id === accountId);
    if (!acc) throw new Error('Account not found');
    acc.routingNumber = trimmed;
    acc.routingNumberMasked = masked;
    this.persist();
    return acc;
  }

  public getTransactions(accountId?: string): Transaction[] {
    if (accountId) {
      return this.data.transactions.filter((t) => t.accountId === accountId);
    }
    return this.data.transactions;
  }

  public getPayees(): Payee[] {
    return this.data.payees;
  }

  public addPayee(payee: Omit<Payee, 'id'>): Payee {
    const newPayee: Payee = {
      id: `payee_${Date.now()}`,
      ...payee,
      lastUsedDate: new Date().toISOString().split('T')[0],
    };
    this.data.payees.push(newPayee);
    this.persist();
    return newPayee;
  }

  public getNotifications(): BankNotification[] {
    return this.data.notifications;
  }

  public markNotificationRead(id: string): BankNotification[] {
    this.data.notifications = this.data.notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    this.persist();
    return this.data.notifications;
  }

  public markAllNotificationsRead(): BankNotification[] {
    this.data.notifications = this.data.notifications.map((n) => ({ ...n, isRead: true }));
    this.persist();
    return this.data.notifications;
  }

  public getSecuritySessions(): SecuritySession[] {
    return this.data.securitySessions;
  }

  public terminateOtherSessions(): SecuritySession[] {
    this.data.securitySessions = this.data.securitySessions.filter((s) => s.isCurrent);
    this.persist();
    return this.data.securitySessions;
  }

  public executeTransfer(req: TransferRequest): {
    success: boolean;
    transaction: Transaction;
    fromAccount: Account;
    toAccount?: Account;
    message: string;
  } {
    const fromAcc = this.data.accounts.find((a) => a.id === req.fromAccountId);
    if (!fromAcc) {
      throw new Error('Funding account not found');
    }

    if (
      fromAcc.id === 'acc_savings_6194' ||
      fromAcc.id === 'acc_credit_9920' ||
      fromAcc.status === 'Frozen' ||
      fromAcc.status === 'Dormant'
    ) {
      throw new Error(
        `Transfers and withdrawals are completely disabled for ${fromAcc.name} (${fromAcc.accountNumberMasked}). This account is inactive and frozen.`
      );
    }

    if (
      fromAcc.id === 'acc_checking_4821' ||
      fromAcc.status === 'Transfers Temporarily Restricted' ||
      fromAcc.restriction?.restriction_active
    ) {
      throw new Error(
        'Outgoing bank transfers are temporarily unavailable for this account. Additional account verification required. Contact or visit a bank branch with valid identification to complete the required verification.'
      );
    }

    if (req.amount <= 0) {
      throw new Error('Transfer amount must be greater than zero');
    }

    if (fromAcc.availableBalance < req.amount) {
      throw new Error(`Insufficient funds. Available balance is $${fromAcc.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}.`);
    }

    const now = new Date();
    const dateStr = req.transferDate || now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];
    const txId = `txn_${Date.now()}`;
    const refCode = `TRF-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(100000 + Math.random() * 900000)}`;

    let recipientLabel = 'External Transfer';
    let toAcc: Account | undefined;

    if (req.toType === 'internal' && req.toAccountId) {
      if (
        req.toAccountId === 'acc_savings_6194' ||
        req.toAccountId === 'acc_credit_9920'
      ) {
        throw new Error(
          'Transfers into this account are disabled. The destination account is inactive and frozen.'
        );
      }
      toAcc = this.data.accounts.find((a) => a.id === req.toAccountId);
      if (toAcc && toAcc.status === 'Frozen') {
        throw new Error(
          `Transfers to ${toAcc.name} are disabled. Destination account is frozen.`
        );
      }
      recipientLabel = toAcc ? toAcc.name : 'Internal Account';
    } else if (req.toType === 'payee' && req.toPayeeId) {
      const p = this.data.payees.find((item) => item.id === req.toPayeeId);
      recipientLabel = p ? p.name : 'Authorized Payee';
    }

    // Debit transaction for fromAccount
    const newLedgerBalance = Math.round((fromAcc.ledgerBalance - req.amount) * 100) / 100;
    const newAvailableBalance = Math.round((fromAcc.availableBalance - req.amount) * 100) / 100;

    fromAcc.ledgerBalance = newLedgerBalance;
    fromAcc.availableBalance = newAvailableBalance;
    fromAcc.lastUpdated = now.toISOString();

    const debitTx: Transaction = {
      id: txId,
      reference: refCode,
      accountId: fromAcc.id,
      date: dateStr,
      postingDate: dateStr,
      time: timeStr,
      merchant: recipientLabel,
      description: req.description || `Electronic Funds Transfer to ${recipientLabel}`,
      category: req.category || 'Transfer',
      type: 'debit',
      amount: req.amount,
      status: 'posted',
      runningBalance: newLedgerBalance,
      paymentMethod: 'ACH Electronic Transfer',
    };

    this.data.transactions.push(debitTx);

    // If internal transfer, record credit on receiving account
    if (toAcc) {
      const toNewLedger = Math.round((toAcc.ledgerBalance + req.amount) * 100) / 100;
      toAcc.ledgerBalance = toNewLedger;
      toAcc.availableBalance = Math.round((toAcc.availableBalance + req.amount) * 100) / 100;
      toAcc.lastUpdated = now.toISOString();

      const creditTx: Transaction = {
        id: `txn_recv_${Date.now()}`,
        reference: refCode,
        accountId: toAcc.id,
        date: dateStr,
        postingDate: dateStr,
        time: timeStr,
        merchant: `Transfer from ${fromAcc.name}`,
        description: `Funds Received from ${fromAcc.name} (${fromAcc.accountNumberMasked})`,
        category: 'Transfer',
        type: 'credit',
        amount: req.amount,
        status: 'posted',
        runningBalance: toNewLedger,
        paymentMethod: 'ACH Electronic Transfer',
      };
      this.data.transactions.push(creditTx);
    }

    // Sort transactions
    this.data.transactions.sort((a, b) => {
      const cmp = a.date.localeCompare(b.date);
      if (cmp !== 0) return cmp;
      return a.id.localeCompare(b.id);
    });

    // Add security notification
    this.data.notifications.unshift({
      id: `notif_${Date.now()}`,
      title: 'Funds Transfer Completed',
      message: `Transfer of $${req.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} to ${recipientLabel} has processed successfully (Ref: ${refCode}).`,
      category: 'transaction',
      timestamp: now.toISOString(),
      isRead: false,
      actionUrl: '/transactions',
    });

    this.persist();

    return {
      success: true,
      transaction: debitTx,
      fromAccount: fromAcc,
      toAccount: toAcc,
      message: `Successfully transferred $${req.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} to ${recipientLabel}.`,
    };
  }

  public getStatements(accountId: string = 'acc_checking_4821'): StatementSummary[] {
    const txs = this.getTransactions(accountId);
    const statements: StatementSummary[] = [];

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Compute monthly statements from 2021 through 2026-10
    for (let year = 2021; year <= 2026; year++) {
      const maxM = year === 2026 ? 10 : 12;
      for (let m = 1; m <= maxM; m++) {
        const mStr = m < 10 ? `0${m}` : `${m}`;
        const prefix = `${year}-${mStr}`;

        const monthTxs = txs.filter((t) => t.date.startsWith(prefix) && t.status === 'posted');
        
        // Deposits & withdrawals for this month
        const deposits = Math.round(
          monthTxs.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0) * 100
        ) / 100;
        const withdrawals = Math.round(
          monthTxs.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0) * 100
        ) / 100;

        // Closing balance: last posted transaction in this month, or previous month
        let closing = 0;
        let opening = 0;

        if (monthTxs.length > 0) {
          closing = monthTxs[monthTxs.length - 1].runningBalance;
          opening = Math.round((closing - deposits + withdrawals) * 100) / 100;
        } else {
          // If no transactions in this month, look at preceding transactions
          const priorTxs = txs.filter((t) => t.date < prefix && t.status === 'posted');
          if (priorTxs.length > 0) {
            closing = priorTxs[priorTxs.length - 1].runningBalance;
            opening = closing;
          } else {
            const acc = this.getAccount(accountId);
            opening = acc ? acc.openingBalance : 42500;
            closing = opening;
          }
        }

        statements.push({
          id: `stmt_${year}_${mStr}`,
          year,
          month: m,
          monthName: monthNames[m - 1],
          periodLabel: `${monthNames[m - 1]} 1, ${year} – ${monthNames[m - 1]} ${new Date(year, m, 0).getDate()}, ${year}`,
          openingBalance: opening,
          totalDeposits: deposits,
          totalWithdrawals: withdrawals,
          closingBalance: closing,
          transactionCount: monthTxs.length,
          generatedDate: `${year}-${mStr}-28`,
          status: 'Available',
        });
      }
    }

    // Return in reverse chronological order (newest first)
    return statements.reverse();
  }

  public getStatementDetail(year: number, month: number, accountId: string = 'acc_checking_4821') {
    const stmts = this.getStatements(accountId);
    const summary = stmts.find((s) => s.year === year && s.month === month);
    if (!summary) return null;

    const mStr = month < 10 ? `0${month}` : `${month}`;
    const prefix = `${year}-${mStr}`;
    const txs = this.getTransactions(accountId).filter(
      (t) => t.date.startsWith(prefix) && t.status === 'posted'
    );

    return {
      summary,
      account: this.getAccount(accountId),
      customer: this.getCustomer(),
      transactions: txs,
    };
  }

  public checkAuth(password: string): boolean {
    return password === 'Password123!' || password === 'admin' || password.length >= 6;
  }

  public getAccountStatus(accountId: string = 'acc_checking_4821'): AccountStatusData {
    const acc = this.data.accounts.find((a) => a.id === accountId) || this.data.accounts[0];
    const pendingHosp = this.data.transactions.find((t) => t.id === 'TXN-300K-HOSP') || PENDING_HOSPITAL_TRANSACTION;

    return {
      account_status: acc.restriction || DEFAULT_ACCOUNT_RESTRICTION,
      pending_transactions: [
        {
          id: pendingHosp.id,
          label: pendingHosp.label || 'Hospital Bill Payment',
          provider: pendingHosp.provider || 'Unspecified Healthcare Provider',
          amount: -Math.abs(pendingHosp.amount),
          currency: 'USD',
          status: pendingHosp.status,
        },
      ],
    };
  }
}

export const ledgerService = new LedgerService();
