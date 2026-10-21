import {
  Account,
  Customer,
  Transaction,
  BankNotification,
  SecuritySession,
  StatementSummary,
  Payee,
  TransferRequest,
  AccountStatusData,
  AccountRestriction,
} from '../types/banking.ts';

const DEFAULT_ACCOUNT_RESTRICTION: AccountRestriction = {
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

const SAVINGS_ACCOUNT_RESTRICTION: AccountRestriction = {
  restriction_active: true,
  status_label: 'Account Locked',
  reason: 'Additional branch verification required to lift security hold.',
  affected_services: [
    'Outgoing bank transfers',
    'Incoming bank transfers',
    'Account withdrawals',
  ],
  unaffected_services: ['Historical statement viewing', 'Interest accrual review'],
  notification_message:
    'Transfers and outgoing debits are temporarily restricted pending in-person branch verification.',
  resolution_instructions:
    'Please visit your local U.S. Bank branch with valid government-issued photo identification to verify your identity and resolve this security hold.',
};

const CREDIT_ACCOUNT_RESTRICTION: AccountRestriction = {
  restriction_active: true,
  status_label: 'Temporary Security Hold',
  reason: 'Additional branch verification required to lift security hold.',
  affected_services: [
    'Card purchases',
    'Outgoing bank transfers',
    'Cash advances',
  ],
  unaffected_services: ['Historical statement viewing'],
  notification_message:
    'Transfers and outgoing debits are temporarily restricted pending in-person branch verification.',
  resolution_instructions:
    'Please visit your local U.S. Bank branch with valid government-issued photo identification to verify your identity and resolve this security hold.',
};

const LOCAL_STORAGE_KEY = 'usbank_local_ledger_state_v2';

interface LocalState {
  customer: Customer;
  accounts: Account[];
  transactions: Transaction[];
  notifications: BankNotification[];
  securitySessions: SecuritySession[];
  payees: Payee[];
}

function getInitialState(): LocalState {
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
      ledgerBalance: 3386370.46,
      openingBalance: 42500.0,
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

  const transactions: Transaction[] = [
    {
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
    },
    {
      id: 'txn_2026_10_1042',
      reference: 'REF-202610-1042',
      accountId: 'acc_checking_4821',
      date: '2026-10-15',
      postingDate: '2026-10-15',
      time: '09:00:00',
      merchant: 'Minnesota Vikings FC',
      description: 'Semi-Monthly Direct Deposit Payroll',
      category: 'Income',
      type: 'credit',
      amount: 35000.0,
      status: 'posted',
      runningBalance: 3386370.46,
      paymentMethod: 'Direct Deposit',
    },
    {
      id: 'txn_2026_10_1041',
      reference: 'REF-202610-1041',
      accountId: 'acc_checking_4821',
      date: '2026-10-12',
      postingDate: '2026-10-12',
      time: '20:15:00',
      merchant: 'Manny’s Steakhouse',
      description: 'Client Dinner & Hospitality',
      category: 'Dining',
      type: 'debit',
      amount: 485.2,
      status: 'posted',
      runningBalance: 3351370.46,
      paymentMethod: 'Debit Card •••• 4821',
    },
    {
      id: 'txn_2026_10_1040',
      reference: 'REF-202610-1040',
      accountId: 'acc_checking_4821',
      date: '2026-10-10',
      postingDate: '2026-10-10',
      time: '14:22:00',
      merchant: 'Target Supercenter #0219',
      description: 'Household Essentials & Supplies',
      category: 'Shopping',
      type: 'debit',
      amount: 189.64,
      status: 'posted',
      runningBalance: 3351855.66,
      paymentMethod: 'Debit Card •••• 4821',
    },
    {
      id: 'txn_2026_10_1039',
      reference: 'REF-202610-1039',
      accountId: 'acc_checking_4821',
      date: '2026-10-06',
      postingDate: '2026-10-06',
      time: '11:10:00',
      merchant: 'Whole Foods Market Minneapolis',
      description: 'Organic Grocery Provisions',
      category: 'Groceries',
      type: 'debit',
      amount: 342.18,
      status: 'posted',
      runningBalance: 3352045.3,
      paymentMethod: 'Debit Card •••• 4821',
    },
    {
      id: 'txn_2026_10_1038',
      reference: 'REF-202610-1038',
      accountId: 'acc_checking_4821',
      date: '2026-10-03',
      postingDate: '2026-10-03',
      time: '08:00:00',
      merchant: 'Minneapolis Luxury Lofts',
      description: 'Residential Lease Auto-Debit',
      category: 'Utilities',
      type: 'debit',
      amount: 6200.0,
      status: 'posted',
      runningBalance: 3352387.48,
      paymentMethod: 'ACH Electronic Transfer',
    },
    {
      id: 'txn_2026_10_1037',
      reference: 'REF-202610-1037',
      accountId: 'acc_checking_4821',
      date: '2026-10-01',
      postingDate: '2026-10-01',
      time: '09:00:00',
      merchant: 'Minnesota Vikings FC',
      description: 'Semi-Monthly Direct Deposit Payroll',
      category: 'Income',
      type: 'credit',
      amount: 35000.0,
      status: 'posted',
      runningBalance: 3358587.48,
      paymentMethod: 'Direct Deposit',
    },
  ];

  const notifications: BankNotification[] = [
    {
      id: 'notif_restriction_300k',
      title: 'Account Status: Accounts Inactive & Frozen',
      message: 'All accounts are currently frozen and unavailable. Transfers into or out of these accounts are completely disabled.',
      category: 'security',
      timestamp: '2026-10-19T08:15:00.000Z',
      isRead: false,
      actionUrl: '/transfers',
    },
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
  ];

  const securitySessions: SecuritySession[] = [
    {
      id: 'sess_1',
      device: 'Apple iPhone 15 Pro',
      browser: 'Safari Mobile 18.0',
      ip: '198.51.100.44',
      location: 'Minneapolis, MN, United States',
      lastActive: 'Just now',
      isCurrent: true,
    },
    {
      id: 'sess_2',
      device: 'MacBook Pro 16"',
      browser: 'Chrome 130',
      ip: '198.51.100.89',
      location: 'Edina, MN, United States',
      lastActive: '2 hours ago',
      isCurrent: false,
    },
  ];

  const payees: Payee[] = [
    {
      id: 'payee_1',
      name: 'Minneapolis Luxury Lofts LLC',
      bankName: 'US Bank Commercial',
      accountNumberMasked: '•••• 8820',
      routingNumberMasked: '•••• 9210',
      accountType: 'checking',
      lastUsedDate: '2026-10-03',
    },
    {
      id: 'payee_2',
      name: 'Xcel Energy Minnesota',
      bankName: 'Wells Fargo Bank',
      accountNumberMasked: '•••• 3190',
      routingNumberMasked: '•••• 4410',
      accountType: 'checking',
      lastUsedDate: '2026-10-04',
    },
  ];

  return { customer, accounts, transactions, notifications, securitySessions, payees };
}

class LocalLedgerService {
  private state: LocalState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): LocalState {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure checking account is frozen with 0 available balance
        const chk = parsed.accounts?.find((a: Account) => a.id === 'acc_checking_4821');
        if (chk) {
          chk.status = 'Frozen';
          chk.availableBalance = 0.0;
          chk.restriction = DEFAULT_ACCOUNT_RESTRICTION;
        }
        const sav = parsed.accounts?.find((a: Account) => a.id === 'acc_savings_6194');
        if (sav) {
          sav.status = 'Frozen';
          sav.availableBalance = 486420.5;
          sav.ledgerBalance = 486420.5;
          sav.restriction = SAVINGS_ACCOUNT_RESTRICTION;
        }
        const crd = parsed.accounts?.find((a: Account) => a.id === 'acc_credit_9920');
        if (crd) {
          crd.status = 'Frozen';
          crd.availableBalance = 46850.0;
          crd.restriction = CREDIT_ACCOUNT_RESTRICTION;
        }

        // Migrate routing numbers to Minneapolis HQ 091000022
        parsed.accounts?.forEach((acc: Account) => {
          if (!acc.routingNumber || acc.routingNumber === '071000288' || acc.routingNumberMasked === '•••• 0288') {
            acc.routingNumber = '091000022';
            acc.routingNumberMasked = '•••• 0022';
          }
        });

        return parsed;
      }
    } catch {
      // fallback
    }
    const fresh = getInitialState();
    this.saveState(fresh);
    return fresh;
  }

  private saveState(st: LocalState = this.state) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(st));
    } catch {
      // ignore
    }
  }

  public getAccounts(): Account[] {
    return this.state.accounts;
  }

  public updateAccountRouting(accountId: string, newRoutingNumber: string, applyToAll: boolean = false): Account {
    const trimmed = newRoutingNumber.trim();
    const masked = `•••• ${trimmed.slice(-4)}`;
    if (applyToAll || accountId === 'all') {
      this.state.accounts.forEach((acc) => {
        acc.routingNumber = trimmed;
        acc.routingNumberMasked = masked;
      });
    } else {
      const acc = this.state.accounts.find((a) => a.id === accountId);
      if (acc) {
        acc.routingNumber = trimmed;
        acc.routingNumberMasked = masked;
      }
    }
    this.saveState();
    return this.state.accounts.find((a) => a.id === accountId) || this.state.accounts[0];
  }

  public handleFallback(endpoint: string, options: RequestInit = {}): any {
    const url = new URL(endpoint, 'http://localhost');
    const path = url.pathname;
    const method = (options.method || 'GET').toUpperCase();
    const body = options.body ? JSON.parse(options.body as string) : {};

    // Routing patch route
    if (path.startsWith('/api/accounts/') && path.endsWith('/routing') && method === 'PATCH') {
      const parts = path.split('/');
      const accId = parts[3];
      const { routingNumber, applyToAll } = body;
      const updated = this.updateAccountRouting(accId, routingNumber, !!applyToAll);
      return { success: true, account: updated, accounts: this.state.accounts };
    }

    // Auth Login
    if (path === '/api/auth/login' && method === 'POST') {
      return {
        token: `mock_jwt_session_${Date.now()}`,
        customer: this.state.customer,
        accounts: this.state.accounts,
        message: 'Authentication successful',
      };
    }

    // Auth Me
    if (path === '/api/auth/me' && method === 'GET') {
      return {
        customer: this.state.customer,
        accounts: this.state.accounts,
      };
    }

    // Auth Logout
    if (path === '/api/auth/logout') {
      return { success: true };
    }

    // Accounts
    if (path === '/api/accounts' && method === 'GET') {
      return this.state.accounts;
    }

    if (path.startsWith('/api/accounts/') && path.endsWith('/status')) {
      const accId = path.split('/')[3];
      const acc = this.state.accounts.find((a) => a.id === accId) || this.state.accounts[0];
      return {
        account_status: acc.restriction || DEFAULT_ACCOUNT_RESTRICTION,
        pending_transactions: [
          {
            id: 'TXN-300K-HOSP',
            label: 'Hospital Bill Payment',
            provider: 'Unspecified Healthcare Provider',
            amount: -300000.0,
            currency: 'USD',
            status: 'Pending Review',
          },
        ],
      };
    }

    if (path.startsWith('/api/accounts/')) {
      const id = path.split('/')[3];
      return this.state.accounts.find((a) => a.id === id) || this.state.accounts[0];
    }

    // Account Status
    if (path === '/api/account/status' || path === '/api/account-restriction') {
      return {
        account_status: DEFAULT_ACCOUNT_RESTRICTION,
        pending_transactions: [
          {
            id: 'TXN-300K-HOSP',
            label: 'Hospital Bill Payment',
            provider: 'Unspecified Healthcare Provider',
            amount: -300000.0,
            currency: 'USD',
            status: 'Pending Review',
          },
        ],
      };
    }

    // Transactions
    if (path === '/api/transactions' && method === 'GET') {
      return {
        data: this.state.transactions,
        pagination: {
          total: this.state.transactions.length,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      };
    }

    // Transfers
    if (path === '/api/transfers' && method === 'POST') {
      throw new Error(
        'All accounts are currently inactive and frozen. Transfers into or out of these accounts are completely disabled.'
      );
    }

    // Payees
    if (path === '/api/payees' && method === 'GET') {
      return this.state.payees;
    }

    // Notifications
    if (path === '/api/notifications' && method === 'GET') {
      return this.state.notifications;
    }

    // Balance History
    if (path === '/api/analytics/balance-history') {
      return {
        range: '30D',
        data: [
          { date: '2026-09-20', balance: 3350000 },
          { date: '2026-10-01', balance: 3358587 },
          { date: '2026-10-15', balance: 3386370 },
          { date: '2026-10-19', balance: 3386370 },
        ],
      };
    }

    // Statements
    if (path === '/api/statements') {
      return [
        {
          id: 'stmt_2026_10',
          year: 2026,
          month: 10,
          monthName: 'October',
          periodLabel: 'October 1, 2026 – October 31, 2026',
          openingBalance: 3350000,
          totalDeposits: 70000,
          totalWithdrawals: 33629.54,
          closingBalance: 3386370.46,
          transactionCount: 16,
          generatedDate: '2026-10-28',
          status: 'Available',
        },
        {
          id: 'stmt_2026_09',
          year: 2026,
          month: 9,
          monthName: 'September',
          periodLabel: 'September 1, 2026 – September 30, 2026',
          openingBalance: 3320000,
          totalDeposits: 70000,
          totalWithdrawals: 40000,
          closingBalance: 3350000,
          transactionCount: 18,
          generatedDate: '2026-09-28',
          status: 'Available',
        },
      ];
    }

    // Default empty success
    return {};
  }
}

export const localLedger = new LocalLedgerService();
