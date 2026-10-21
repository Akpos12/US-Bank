import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
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
}

export const Dashboard: React.FC<DashboardProps> = ({
  customer,
  accounts,
  onNavigate,
  onSelectTx,
  onRefreshData,
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

  const primaryAccount = accounts.find((a) => a.isPrimary) || accounts[0];

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
      // Recent transactions
      const txRes = await api.getTransactions({ limit: 6, sortBy: 'date', sortOrder: 'desc' });
      setRecentTransactions(txRes.data);

      // Compute last 30-day deposits and spending
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

  const totalAvailable = accounts.reduce((sum, a) => sum + a.availableBalance, 0);
  const totalLedger = accounts.reduce((sum, a) => sum + a.ledgerBalance, 0);

  return (
    <div className="space-y-6">
      {/* Prominent Account-Level Alert Banner */}
      <AccountRestrictionBanner
        account={primaryAccount}
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {getGreeting()}, {customer.name.split(' ')[0]}.
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Welcome to your US Bank Banking dashboard. Here is your unified relationship summary.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setHideBalance(!hideBalance)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-colors"
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
            className="p-2 rounded-xl bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-xs transition-colors"
            title="Sync Ledger"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 SUMMARY CARDS: Total Available, Ledger Balance, Recent Deposits, Recent Spending */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card A: Total Available Balance */}
        <div className="bg-gradient-to-br from-[#002855] to-[#001f3f] rounded-2xl p-5 text-white shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-3 top-3 opacity-10">
            <DollarSign className="w-20 h-20 text-white" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-300">
                {primaryAccount.status === 'Frozen' ? 'Available Balance (Unavailable)' : 'Total Available Balance'}
              </span>
              {primaryAccount.status === 'Frozen' ? (
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" title="Account Inactive & Frozen"></span>
              ) : primaryAccount.status === 'Transfers Temporarily Restricted' ? (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" title="Transfers Restricted"></span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              )}
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono mt-3 tracking-tight">
              {hideBalance
                ? '••••••••••'
                : primaryAccount.status === 'Frozen'
                ? '$0.00'
                : `$${primaryAccount.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-300 flex items-center justify-between">
            <span>{primaryAccount.name} •••• 4821</span>
            {primaryAccount.status === 'Frozen' ? (
              <span className="font-semibold text-rose-300 flex items-center gap-1.5 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-300/30 text-[10px]">
                <Lock className="w-2.5 h-2.5 text-rose-400" />
                Account Inactive & Frozen
              </span>
            ) : primaryAccount.status === 'Transfers Temporarily Restricted' ? (
              <span className="font-semibold text-amber-300 flex items-center gap-1.5 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-300/30 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                Transfers Restricted
              </span>
            ) : (
              <span className="font-semibold text-emerald-300">Active</span>
            )}
          </div>
        </div>

        {/* Card B: Current Ledger Balance */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                Current Ledger Balance
              </span>
              <ShieldCheck className="w-4 h-4 text-[#002855]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 mt-3 tracking-tight">
              {hideBalance
                ? '••••••••••'
                : `$${primaryAccount.ledgerBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Posted settlement balance</span>
            <span className="font-mono text-slate-400">USD</span>
          </div>
        </div>

        {/* Card C: Recent Deposits */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                Recent Deposits (30D)
              </span>
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ArrowDownLeft className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-700 mt-3 tracking-tight">
              {hideBalance
                ? '••••••••••'
                : `+$${metrics.recentDeposits.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Direct deposits & income</span>
            <span className="font-semibold text-emerald-700">Reconciled</span>
          </div>
        </div>

        {/* Card D: Recent Spending */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                Recent Outflows (30D)
              </span>
              <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 mt-3 tracking-tight">
              {hideBalance
                ? '••••••••••'
                : `-$${metrics.recentSpending.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Transfers & debit activity</span>
            <span className="font-semibold text-slate-600">Calculated</span>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 mr-2 uppercase tracking-wider">Quick Actions:</span>
          <button
            onClick={() => onNavigate('transfers')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#002855] text-xs font-bold transition-colors"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Transfer Funds
          </button>
          <button
            onClick={() => onNavigate('transfers')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-blue-600" />
            Send via Zelle
          </button>
          <button
            onClick={() => onNavigate('statements')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            eStatements
          </button>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>US Bank Secure Portal 256-bit TLS</span>
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
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Your Accounts Portfolio</h3>
              <p className="text-[11px] text-slate-500">Deposit & credit accounts</p>
            </div>
            <button
              onClick={() => onNavigate('accounts')}
              className="text-xs font-bold text-[#002855] hover:underline"
            >
              Details →
            </button>
          </div>

          <div className="space-y-3">
            {accounts.map((acc) => {
              const isFrozen = acc.status === 'Frozen';
              return (
                <div
                  key={acc.id}
                  onClick={() => onNavigate('accounts')}
                  className="p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/70 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isFrozen ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-[#002855]'
                      }`}
                    >
                      {isFrozen ? <Lock className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{acc.name}</span>
                        {isFrozen ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            Inactive • Frozen
                          </span>
                        ) : acc.status === 'Transfers Temporarily Restricted' ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            Restricted
                          </span>
                        ) : null}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">{acc.accountNumberMasked}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold font-mono text-slate-900">
                      {hideBalance
                        ? '••••••••'
                        : acc.id === 'acc_checking_4821' && isFrozen
                        ? '$0.00'
                        : `$${acc.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    </div>
                    <div className={`text-[10px] font-semibold ${isFrozen ? 'text-rose-600' : 'text-slate-400'}`}>
                      {isFrozen ? 'Unavailable' : 'Available'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
            <span className="font-medium">Total Portfolio Net Assets:</span>
            <span className="font-mono font-bold text-slate-900">
              {hideBalance ? '••••••••••' : `$${totalAvailable.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </span>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Transactions</h3>
              <p className="text-[11px] text-slate-500">Live ledger postings & clearances</p>
            </div>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs font-bold text-[#002855] hover:underline"
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
                          : 'bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-[#002855]'
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
                      className={`text-xs font-bold font-mono ${
                        isPendingReview
                          ? 'text-amber-800'
                          : isCredit
                          ? 'text-emerald-700'
                          : 'text-slate-900'
                      }`}
                    >
                      {isCredit ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
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
