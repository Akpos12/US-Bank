export type TransactionCategory =
  | 'Income'
  | 'Groceries'
  | 'Dining'
  | 'Utilities'
  | 'Shopping'
  | 'Travel'
  | 'Health'
  | 'Entertainment'
  | 'Transfer'
  | 'Services'
  | 'Interest'
  | 'Fees';

export type TransactionType = 'credit' | 'debit';
export type TransactionStatus = 'posted' | 'pending' | 'Pending Review' | 'failed' | 'reversed';

export interface AccountRestriction {
  restriction_active: boolean;
  status_label: string;
  reason: string;
  affected_services: string[];
  unaffected_services: string[];
  notification_message: string;
  resolution_instructions: string;
}

export interface PendingTransactionSchema {
  id: string;
  label: string;
  provider: string;
  amount: number;
  currency: string;
  status: string;
}

export interface AccountStatusData {
  account_status: AccountRestriction;
  pending_transactions: PendingTransactionSchema[];
}

export interface Transaction {
  id: string;
  reference: string;
  accountId: string;
  date: string; // YYYY-MM-DD
  postingDate: string; // YYYY-MM-DD
  time: string;
  merchant: string;
  description: string;
  category: TransactionCategory;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  runningBalance: number;
  paymentMethod: string;
  notes?: string;
  checkNumber?: string;
  provider?: string;
  label?: string;
}

export interface Account {
  id: string;
  name: string;
  accountNumber: string;
  accountNumberMasked: string;
  routingNumber: string;
  routingNumberMasked: string;
  type: 'checking' | 'savings' | 'credit';
  status: 'Active' | 'Dormant' | 'Frozen' | 'Transfers Temporarily Restricted';
  currency: 'USD';
  availableBalance: number;
  ledgerBalance: number;
  openingBalance: number;
  openedDate: string;
  lastUpdated: string;
  interestRate?: number;
  isPrimary: boolean;
  restriction?: AccountRestriction;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  memberSince: string;
  accountType: string;
  accountStatus: string;
  avatarUrl: string;
  preferences: {
    dailyTransferLimit: number;
    paperlessStatements: boolean;
    twoFactorEnabled: boolean;
    sessionTimeoutMinutes: number;
    currency: string;
    emailAlerts: boolean;
    smsAlerts: boolean;
  };
}

export interface BankNotification {
  id: string;
  title: string;
  message: string;
  category: 'security' | 'transaction' | 'statement' | 'account';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface SecuritySession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface StatementSummary {
  id: string;
  year: number;
  month: number;
  monthName: string;
  periodLabel: string;
  openingBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  closingBalance: number;
  transactionCount: number;
  generatedDate: string;
  status: 'Available';
}

export interface Payee {
  id: string;
  name: string;
  accountType: 'checking' | 'savings';
  accountNumberMasked: string;
  bankName: string;
  routingNumberMasked: string;
  lastUsedDate?: string;
}

export interface TransferRequest {
  fromAccountId: string;
  toType: 'internal' | 'payee';
  toAccountId?: string;
  toPayeeId?: string;
  amount: number;
  description: string;
  category: TransactionCategory;
  transferDate: string; // immediate or date
  speed: 'standard' | 'instant';
}
