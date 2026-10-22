import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Eye,
  EyeOff,
  TrendingUp,
  ArrowRightLeft,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  CreditCard,
  ShieldCheck,
  Send,
  Plus,
  Clock,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Lock,
  HelpCircle,
  LogOut,
  ExternalLink,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';
import { Account, Customer, Transaction } from '../types/banking.ts';
import { BalanceHistoryChart } from './BalanceHistoryChart.tsx';
import { SportsPromoSection } from './SportsPromoSection.tsx';
import { AccountRestrictionBanner } from './AccountRestrictionBanner.tsx';
import { api } from '../services/api.ts';

interface DashboardProps {
  customer: Customer;
  accounts: Account[];
  onNavigate: (tab: string) => void;
  onSelectTx: (tx: Transaction) => void;
  onRefreshData: () => void;
  onLogout?: () => void;
  onOpenHelp?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  customer,
  accounts,
  onNavigate,
  onSelectTx,
  onRefreshData,
  onLogout,
  onOpenHelp,
}) => {
  const [hideBalance, setHideBalance] = useState(false);
  const [chartRange, setChartRange] = useState('30D');
  const [chartData, setChartData] = useState<Array<{ date: string; balance: number }>>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [metrics, setMetrics] = useState({
    recentDeposits: 0,
    recentSpending: 0,
  });

  const primaryChecking = accounts.find((a) => a.id === 'acc_checking_4821') || accounts[0];
  const savingsAccount = accounts.find((a) => a.id === 'acc_savings_6194') || accounts[1];
  const creditCardAccount = accounts.find((a) => a.id === 'acc_credit_9920') || accounts[2];

  // Time-based dynamic greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const fetchChart = async (range: string) => {
    setChartLoading(true);
    try {
      const res = await api.getBalanceHistory(range);
      setChartData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setChartLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const txRes = await api.getTransactions({ limit: 6, sortBy: 'date', sortOrder: 'desc' });
      setRecentTransactions(txRes.data);

      const thirtyDaysAgo = new Date('2026-10-18T12:00:00Z');
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const cutoffStr = thirtyDaysAgo.toISOString().split('T')[0];

      const allRes = await api.getTransactions({ startDate: cutoffStr, limit: 100 });
      const deposits = allRes.data
        .filter((t) => t.type === 'credit' && t.status === 'posted')
        .reduce((sum, t) => sum + t.amount, 0);
      const spending = allRes.data
        .filter((t) => t.type === 'debit' && t.status === 'posted')
        .reduce((sum, t) => sum + t.amount, 0);

      setMetrics({
        recentDeposits: deposits,
        recentSpending: spending,
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [accounts]);

  useEffect(() => {
    fetchChart(chartRange);
  }, [chartRange]);

  const totalLedger = accounts.reduce((sum, a) => sum + a.ledgerBalance, 0);

  return (
    <div className="space-y-6">
      {/* Prominent Account-Level Security Review Banner */}
      <AccountRestrictionBanner
        account={primaryChecking}
        onNavigateToTransactions={() => onNavigate('transactions')}
        onNavigateToTransfers={() => onNavigate('transfers')}
        onSelectPendingTx={() => {
          const hospTx = recentTransactions.find((t) => t.id === 'TXN-300K-HOSP');
          if (hospTx) {
            onSelectTx(hospTx);
          } else {
            onNavigate('transactions');
          }
        }}
      />

      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0C2340] tracking-tight">
            {getGreeting()}, {customer.name.split(' ')[0]}.
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Welcome to U.S. Bank Private Wealth Online Banking. Client ID: <span className="font-mono font-bold text-slate-700">{customer.id}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setHideBalance(!hideBalance)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E2E8F0] text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-colors"
          >
            {hideBalance ? <Eye className="w-4 h-4 text-slate-500" /> : <EyeOff className="w-4 h-4 text-slate-500" />}
            {hideBalance ? 'Show Balances' : 'Privacy Mode'}
          </button>
          <button
            onClick={() => {
              onRefreshData();
              fetchDashboardData();
              fetchChart(chartRange);
            }}
            className="p-2 rounded-xl bg-white border border-[#E2E8F0] text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-xs transition-colors"
            title="Refresh Account Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AUTHENTIC U.S. BANK ACCOUNT SUMMARY CARDS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#0C2340]">
            Accounts & Balances
          </h2>
          <button
            onClick={() => onNavigate('accounts')}
            className="text-xs font-bold text-[#005A9C] hover:underline"
          >
            View Account Portfolio →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Checking Account */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#005A9C] bg-blue-50 px-2 py-0.5 rounded">
                    Checking
                  </span>
                  <h3 className="text-sm font-bold text-[#0C2340] mt-1.5">
                    {primaryChecking?.name || 'U.S. Bank Premium Checking'}
                  </h3>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    {primaryChecking?.accountNumberMasked || '•••• 4821'}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                  Temporary Security Hold
                </span>
              </div>

              {/* Balances Display */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500">Available Balance:</span>
                  <span className="text-base font-bold font-mono tabular-nums text-slate-900">
                    {hideBalance ? '••••••••' : '$0.00'}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500">Current Ledger Balance:</span>
                  <span className="text-lg font-extrabold font-mono tabular-nums text-[#0C2340]">
                    {hideBalance
                      ? '••••••••'
                      : `$${(primaryChecking?.ledgerBalance || 3386370.46).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
              <button
                onClick={() => onNavigate('transactions')}
                className="text-[#005A9C] hover:text-[#004578] font-bold hover:underline"
              >
                View Activity
              </button>
              <button
                onClick={() => onNavigate('transfers')}
                className="text-[#005A9C] hover:text-[#004578] font-bold hover:underline"
              >
                Transfer
              </button>
              <button
                onClick={() => onNavigate('transfers')}
                className="text-[#7414CA] hover:text-[#5c0fa3] font-bold hover:underline"
              >
                Zelle®
              </button>
            </div>
          </div>

          {/* Card 2: Savings Account */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    Savings
                  </span>
                  <h3 className="text-sm font-bold text-[#0C2340] mt-1.5">
                    {savingsAccount?.name || 'U.S. Bank High-Yield Savings'}
                  </h3>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    {savingsAccount?.accountNumberMasked || '•••• 6194'}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  Active • 4.50% APY
                </span>
              </div>

              {/* Balances Display */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500">Available Balance:</span>
                  <span className="text-lg font-extrabold font-mono tabular-nums text-emerald-700">
                    {hideBalance
                      ? '••••••••'
                      : `$${(savingsAccount?.availableBalance || 486420.5).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500">Interest Accrued YTD:</span>
                  <span className="text-xs font-semibold font-mono tabular-nums text-slate-700">
                    {hideBalance ? '••••••' : '+$18,450.25'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
              <button
                onClick={() => onNavigate('transactions')}
                className="text-[#005A9C] hover:text-[#004578] font-bold hover:underline"
              >
                View Activity
              </button>
              <button
                onClick={() => onNavigate('transfers')}
                className="text-[#005A9C] hover:text-[#004578] font-bold hover:underline"
              >
                Transfer
              </button>
              <button
                onClick={() => onNavigate('accounts')}
                className="text-slate-600 hover:text-slate-900 hover:underline"
              >
                Details
              </button>
            </div>
          </div>

          {/* Card 3: Altitude Reserve Visa Credit Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-50 px-2 py-0.5 rounded">
                    Credit Card
                  </span>
                  <h3 className="text-sm font-bold text-[#0C2340] mt-1.5">
                    {creditCardAccount?.name || 'U.S. Bank Altitude® Reserve Visa'}
                  </h3>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    {creditCardAccount?.accountNumberMasked || '•••• 9920'}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
                  Infinite® Tier
                </span>
              </div>

              {/* Balances Display */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500">Current Balance:</span>
                  <span className="text-lg font-extrabold font-mono tabular-nums text-slate-900">
                    {hideBalance ? '••••••••' : '$14,820.30'}
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-500">Available Credit:</span>
                  <span className="font-semibold font-mono tabular-nums text-slate-700">
                    {hideBalance ? '••••••••' : '$85,179.70 of $100,000'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
              <button
                onClick={() => onNavigate('transfers')}
                className="text-[#005A9C] hover:text-[#004578] font-bold hover:underline"
              >
                Pay Bill
              </button>
              <button
                onClick={() => onNavigate('accounts')}
                className="text-[#005A9C] hover:text-[#004578] font-bold hover:underline"
              >
                Card Controls
              </button>
              <button
                onClick={() => onNavigate('transactions')}
                className="text-slate-600 hover:text-slate-900 hover:underline"
              >
                Statements
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts Bar */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-[#0C2340] mr-2 uppercase tracking-wider">Quick Links:</span>
          <button
            onClick={() => onNavigate('transfers')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#005A9C] hover:bg-[#004578] text-white text-xs font-bold transition-colors shadow-xs"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Transfer & Pay
          </button>
          <button
            onClick={() => onNavigate('transfers')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#7414CA]/10 hover:bg-[#7414CA]/20 text-[#7414CA] text-xs font-bold transition-colors border border-[#7414CA]/30"
          >
            <Send className="w-3.5 h-3.5" />
            Send Money with Zelle®
          </button>
          <button
            onClick={() => onNavigate('statements')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-[#005A9C]" />
            Statements & Documents
          </button>
          <button
            onClick={() => onOpenHelp && onOpenHelp()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#005A9C]" />
            Customer Service
          </button>
          <button
            onClick={() => onLogout && onLogout()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-rose-50 text-[#DA291C] text-xs font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log Out
          </button>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>U.S. Bank 256-Bit TLS Secured</span>
        </div>
      </div>

      {/* Balance Trend Chart */}
      <BalanceHistoryChart
        data={chartData}
        range={chartRange}
        onRangeChange={setChartRange}
        isLoading={chartLoading}
      />

      {/* Interactive Sports & Community Promo Section */}
      <SportsPromoSection onNavigateToTransfers={() => onNavigate('transfers')} />

      {/* Two Column Section: Accounts List & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Linked Accounts Portfolio */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-[#0C2340]">Your Accounts Portfolio</h3>
              <p className="text-[11px] text-slate-500">Deposit & credit accounts</p>
            </div>
            <button
              onClick={() => onNavigate('accounts')}
              className="text-xs font-bold text-[#005A9C] hover:underline"
            >
              Details →
            </button>
          </div>

          <div className="space-y-3">
            {accounts.map((acc) => {
              const isChecking = acc.id === 'acc_checking_4821';
              const isRestricted = acc.status === 'Transfers Temporarily Restricted' || acc.restriction?.restriction_active;

              return (
                <div
                  key={acc.id}
                  onClick={() => onNavigate('accounts')}
                  className="p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isRestricted ? 'bg-amber-50 text-amber-800' : 'bg-blue-50 text-[#005A9C]'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{acc.name}</span>
                        {isRestricted ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5 text-amber-700" />
                            Security Hold
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">{acc.accountNumberMasked}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold font-mono tabular-nums text-slate-900">
                      {hideBalance
                        ? '••••••••'
                        : isChecking && isRestricted
                        ? '$0.00'
                        : `$${acc.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    </div>
                    <div className={`text-[10px] font-semibold ${isRestricted ? 'text-amber-700' : 'text-slate-400'}`}>
                      {isRestricted ? 'Restricted' : 'Available'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span className="font-medium">Total Portfolio Ledger Assets:</span>
            <span className="font-mono font-bold tabular-nums text-[#0C2340]">
              {hideBalance ? '••••••••••' : `$${totalLedger.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </span>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-[#0C2340]">Recent Transactions</h3>
              <p className="text-[11px] text-slate-500">Live ledger postings & clearances</p>
            </div>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs font-bold text-[#005A9C] hover:underline"
            >
              View All Activity →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentTransactions.map((tx) => {
              const isCredit = tx.type === 'credit';
              const isPending = tx.status === 'pending';
              const isPendingReview = tx.status === 'Pending Review';

              return (
                <div
                  key={tx.id}
                  onClick={() => onSelectTx(tx)}
                  className="py-3 flex items-center justify-between hover:bg-slate-50 p-2 rounded-xl cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isPendingReview
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : isCredit
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-[#005A9C]'
                      }`}
                    >
                      {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {tx.label || tx.description || tx.merchant}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium truncate max-w-[220px] sm:max-w-[340px]">
                        {tx.provider || tx.merchant}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span>{tx.category}</span>
                        {isPendingReview ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            Pending Review
                          </span>
                        ) : isPending ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Pending
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-xs font-bold font-mono tabular-nums ${
                        isPendingReview
                          ? 'text-amber-800'
                          : isCredit
                          ? 'text-emerald-700'
                          : 'text-slate-900'
                      }`}
                    >
                      {isCredit ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono tabular-nums">
                      {isPendingReview ? (
                        <span className="text-amber-600 font-sans font-semibold">Pending Settlement</span>
                      ) : (
                        `Bal: $${tx.runningBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
