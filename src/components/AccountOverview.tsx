import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Check,
  TrendingUp,
  Clock,
  ArrowRightLeft,
  Building2,
  Calendar,
  Lock,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { Account, Transaction } from '../types/banking.ts';
import { BalanceHistoryChart } from './BalanceHistoryChart.tsx';
import { AccountRestrictionBanner } from './AccountRestrictionBanner.tsx';
import { api } from '../services/api.ts';

interface AccountOverviewProps {
  accounts: Account[];
  onNavigateToTransfers: () => void;
  onNavigateToTransactions: () => void;
  onSelectTx: (tx: Transaction) => void;
}

export const AccountOverview: React.FC<AccountOverviewProps> = ({
  accounts,
  onNavigateToTransfers,
  onNavigateToTransactions,
  onSelectTx,
}) => {
  const [selectedAccId, setSelectedAccId] = useState<string>(accounts[0]?.id || 'acc_checking_4821');
  const [showFullAccount, setShowFullAccount] = useState(false);
  const [showFullRouting, setShowFullRouting] = useState(false);
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [copiedRouting, setCopiedRouting] = useState(false);

  // Balance history state
  const [chartRange, setChartRange] = useState('30D');
  const [chartData, setChartData] = useState<Array<{ date: string; balance: number }>>([]);
  const [chartLoading, setChartLoading] = useState(false);

  // Recent transactions for this account
  const [recentTxs, setRecentTxs] = useState<Transaction[]>([]);

  const currentAccount = accounts.find((a) => a.id === selectedAccId) || accounts[0];

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

  const fetchRecentTxs = async () => {
    try {
      const res = await api.getTransactions({
        accountId: selectedAccId,
        limit: 5,
        sortBy: 'date',
        sortOrder: 'desc',
      });
      setRecentTxs(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchChart(chartRange);
    fetchRecentTxs();
  }, [selectedAccId, chartRange]);

  const copyAccountNum = () => {
    navigator.clipboard.writeText(currentAccount.accountNumber);
    setCopiedAcc(true);
    setTimeout(() => setCopiedAcc(false), 2000);
  };

  const copyRoutingNum = () => {
    navigator.clipboard.writeText(currentAccount.routingNumber);
    setCopiedRouting(true);
    setTimeout(() => setCopiedRouting(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Account Portfolio Overview</h1>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative ledger balance, interest accruals, transit routing credentials, and real-time activity.
          </p>
        </div>

        {/* Account Selector Pill */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
          {accounts.map((acc) => {
            const isFrozen = acc.status === 'Frozen';
            return (
              <button
                key={acc.id}
                onClick={() => setSelectedAccId(acc.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedAccId === acc.id
                    ? 'bg-[#002855] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {isFrozen && <Lock className="w-3 h-3 text-rose-500 shrink-0" />}
                <span>{acc.name} ({acc.accountNumberMasked})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Account Details Card */}
      <div className="bg-gradient-to-br from-[#002855] via-[#001f3f] to-[#0a192f] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none blur-2xl"></div>
        <div className="absolute right-12 top-6 opacity-20 pointer-events-none">
          <Building2 className="w-48 h-48 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-500/20 text-blue-200 border border-blue-400/30 uppercase tracking-wider">
                {currentAccount.type}
              </span>
              <span className="text-xs text-slate-300 font-medium">US Bank Relationship Tier</span>
              {currentAccount.status === 'Frozen' ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] text-rose-300 font-bold bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-400/30">
                  <Lock className="w-3 h-3 text-rose-400" />
                  Account Inactive & Frozen
                </span>
              ) : currentAccount.status === 'Transfers Temporarily Restricted' ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-300 font-bold bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  Transfers Temporarily Restricted
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {currentAccount.status}
                </span>
              )}
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{currentAccount.name}</h2>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-300">
                {/* Account Number Toggle */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Account:</span>
                  <span className="font-mono font-bold text-white">
                    {showFullAccount ? currentAccount.accountNumber : currentAccount.accountNumberMasked}
                  </span>
                  <button
                    onClick={() => setShowFullAccount(!showFullAccount)}
                    className="p-1 hover:text-white text-slate-400"
                    title={showFullAccount ? 'Hide' : 'Reveal'}
                  >
                    {showFullAccount ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={copyAccountNum} className="p-1 hover:text-white text-slate-400" title="Copy">
                    {copiedAcc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <span>•</span>

                {/* Routing Number Toggle */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Routing:</span>
                  <span className="font-mono font-bold text-white">
                    {showFullRouting ? currentAccount.routingNumber : currentAccount.routingNumberMasked}
                  </span>
                  <button
                    onClick={() => setShowFullRouting(!showFullRouting)}
                    className="p-1 hover:text-white text-slate-400"
                    title={showFullRouting ? 'Hide' : 'Reveal'}
                  >
                    {showFullRouting ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={copyRoutingNum} className="p-1 hover:text-white text-slate-400" title="Copy">
                    {copiedRouting ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Balances Display */}
            <div className="pt-2 flex flex-wrap items-baseline gap-6 sm:gap-10">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-300 block font-semibold">
                  {currentAccount.status === 'Frozen' ? 'Available Balance (Unavailable)' : 'Total Available Balance'}
                </span>
                <span className="text-3xl sm:text-4xl font-black font-mono text-white mt-0.5 block">
                  ${currentAccount.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                {currentAccount.status === 'Frozen' && (
                  <span className="text-xs text-rose-300 font-semibold flex items-center gap-1 mt-1">
                    <Lock className="w-3 h-3" /> Inactive • Transfers Disabled
                  </span>
                )}
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Current Ledger Balance
                </span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-slate-200 mt-0.5 block">
                  ${currentAccount.ledgerBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="flex flex-col justify-between sm:items-end gap-4 shrink-0">
            <div className="text-left sm:text-right text-xs text-slate-300 space-y-1">
              <div>
                <span className="text-slate-400">Member Since:</span> <span className="font-bold">2021</span>
              </div>
              <div>
                <span className="text-slate-400">APY:</span> <span className="font-bold">{currentAccount.interestRate || '0.45'}%</span>
              </div>
              <div>
                <span className="text-slate-400">Ledger Verified:</span>{' '}
                <span className="font-mono text-[11px]">Today 12:00 PM</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {currentAccount.status === 'Frozen' ? (
                <button
                  disabled
                  className="px-4 py-2.5 rounded-xl bg-slate-300/20 text-slate-300 text-xs font-bold border border-white/10 cursor-not-allowed flex items-center gap-1.5 shadow-sm"
                  title="Transfers are completely disabled for this account."
                >
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                  Transfers Disabled
                </button>
              ) : (
                <button
                  onClick={onNavigateToTransfers}
                  className="px-4 py-2.5 rounded-xl bg-white text-[#002855] text-xs font-bold hover:bg-slate-100 transition-colors shadow-sm"
                >
                  Transfer Funds
                </button>
              )}
              <button
                onClick={onNavigateToTransactions}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-colors"
              >
                Full Activity
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Account Restriction Alert Banner */}
      <AccountRestrictionBanner
        account={currentAccount}
        onNavigateToTransactions={onNavigateToTransactions}
        onNavigateToTransfers={onNavigateToTransfers}
      />

      {/* Balance History Chart */}
      <BalanceHistoryChart
        data={chartData}
        range={chartRange}
        onRangeChange={setChartRange}
        isLoading={chartLoading}
      />

      {/* Recent Activity Snippet */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Account Activity</h3>
            <p className="text-xs text-slate-500">Most recent transactions for {currentAccount.name}</p>
          </div>
          <button
            onClick={onNavigateToTransactions}
            className="text-xs font-bold text-[#002855] hover:underline"
          >
            View all transactions →
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentTxs.map((tx) => {
            const isCredit = tx.type === 'credit';
            const isPendingReview = tx.status === 'Pending Review';

            return (
              <div
                key={tx.id}
                onClick={() => onSelectTx(tx)}
                className="py-3 flex items-center justify-between hover:bg-slate-50 p-2 rounded-xl cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isPendingReview
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : isCredit
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{tx.label || tx.description || tx.merchant}</span>
                      {isPendingReview && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          Pending Review
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {tx.provider || tx.merchant} • {tx.date}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-xs font-bold font-mono ${
                      isCredit ? 'text-emerald-700' : 'text-slate-900'
                    }`}
                  >
                    {isCredit ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Bal: ${tx.runningBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
