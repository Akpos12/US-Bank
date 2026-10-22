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
  Unlock,
  ArrowUpRight,
  ArrowDownLeft,
  Edit3,
  X,
  AlertCircle,
  CheckCircle2,
  Building,
  Smartphone,
  AlertTriangle,
  FileText,
  Wifi,
} from 'lucide-react';
import { Account, Transaction } from '../types/banking.ts';
import { BalanceHistoryChart } from './BalanceHistoryChart.tsx';
import { AccountRestrictionBanner } from './AccountRestrictionBanner.tsx';
import { UsBankLogo } from './UsBankLogo.tsx';
import { api } from '../services/api.ts';

const USBANK_ROUTING_PRESETS = [
  {
    number: '091000022',
    city: 'Minneapolis, MN',
    region: 'U.S. Bank Headquarters & Private Wealth (Minneapolis / Nicollet Mall)',
    recommended: true,
  },
  {
    number: '071000288',
    city: 'Chicago, IL',
    region: 'U.S. Bank Midwest Banking Division (Chicago / IL)',
  },
  {
    number: '042000013',
    city: 'Cincinnati, OH',
    region: 'U.S. Bank National Association Main (Cincinnati / OH)',
  },
  {
    number: '102000021',
    city: 'Denver, CO',
    region: 'U.S. Bank Mountain Regional Center (Denver / CO)',
  },
  {
    number: '121000249',
    city: 'Los Angeles / San Francisco, CA',
    region: 'U.S. Bank California & West Division',
  },
  {
    number: '123000220',
    city: 'Portland, OR / Seattle, WA',
    region: 'U.S. Bank Pacific Northwest Center',
  },
];

interface AccountOverviewProps {
  accounts: Account[];
  onNavigateToTransfers: () => void;
  onNavigateToTransactions: () => void;
  onSelectTx: (tx: Transaction) => void;
  onRefreshAccounts?: () => Promise<void> | void;
}

export const AccountOverview: React.FC<AccountOverviewProps> = ({
  accounts,
  onNavigateToTransfers,
  onNavigateToTransactions,
  onSelectTx,
  onRefreshAccounts,
}) => {
  const [selectedAccId, setSelectedAccId] = useState<string>(accounts[0]?.id || 'acc_checking_4821');
  const [showFullAccount, setShowFullAccount] = useState(false);
  const [showFullRouting, setShowFullRouting] = useState(false);
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [copiedRouting, setCopiedRouting] = useState(false);

  // Card Controls state
  const [cardLocked, setCardLocked] = useState(false);
  const [showLostStolenModal, setShowLostStolenModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  // Change Routing Number Modal State
  const [showRoutingModal, setShowRoutingModal] = useState(false);
  const [selectedRoutingPreset, setSelectedRoutingPreset] = useState<string>('091000022');
  const [customRoutingInput, setCustomRoutingInput] = useState<string>('');
  const [applyToAllAccounts, setApplyToAllAccounts] = useState(true);
  const [isUpdatingRouting, setIsUpdatingRouting] = useState(false);
  const [routingUpdateSuccess, setRoutingUpdateSuccess] = useState<string | null>(null);
  const [routingUpdateError, setRoutingUpdateError] = useState<string | null>(null);

  // Balance history state
  const [chartRange, setChartRange] = useState('30D');
  const [chartData, setChartData] = useState<Array<{ date: string; balance: number }>>([]);
  const [chartLoading, setChartLoading] = useState(false);

  // Recent transactions for this account
  const [recentTxs, setRecentTxs] = useState<Transaction[]>([]);

  const currentAccount = accounts.find((a) => a.id === selectedAccId) || accounts[0];
  const isChecking = currentAccount.id === 'acc_checking_4821';
  const isRestricted =
    currentAccount.status === 'Transfers Temporarily Restricted' ||
    currentAccount.restriction?.restriction_active;

  const handleOpenRoutingModal = () => {
    const cur = currentAccount.routingNumber;
    const isPreset = USBANK_ROUTING_PRESETS.some((p) => p.number === cur);
    if (isPreset) {
      setSelectedRoutingPreset(cur);
      setCustomRoutingInput('');
    } else {
      setSelectedRoutingPreset('custom');
      setCustomRoutingInput(cur);
    }
    setRoutingUpdateSuccess(null);
    setRoutingUpdateError(null);
    setShowRoutingModal(true);
  };

  const handleSaveRouting = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingRouting(true);
    setRoutingUpdateError(null);
    setRoutingUpdateSuccess(null);

    const targetRouting =
      selectedRoutingPreset === 'custom'
        ? customRoutingInput.trim()
        : selectedRoutingPreset;

    if (!/^\d{9}$/.test(targetRouting)) {
      setRoutingUpdateError('Routing number must contain exactly 9 numeric digits.');
      setIsUpdatingRouting(false);
      return;
    }

    try {
      await api.updateAccountRouting(currentAccount.id, targetRouting, applyToAllAccounts);
      setRoutingUpdateSuccess(`Routing transit number successfully updated to ${targetRouting}`);
      if (onRefreshAccounts) {
        await onRefreshAccounts();
      }
      setTimeout(() => {
        setShowRoutingModal(false);
        setRoutingUpdateSuccess(null);
      }, 1800);
    } catch (err: any) {
      setRoutingUpdateError(err.message || 'Failed to update routing number.');
    } finally {
      setIsUpdatingRouting(false);
    }
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
      {/* Title & Account Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0C2340] tracking-tight">Account Portfolio</h1>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative ledger balance, interest accruals, transit routing credentials, and real-time activity.
          </p>
        </div>

        {/* Account Selector Pill */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#E2E8F0] shadow-xs overflow-x-auto">
          {accounts.map((acc) => {
            const isSelected = selectedAccId === acc.id;
            return (
              <button
                key={acc.id}
                onClick={() => setSelectedAccId(acc.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#005A9C] text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{acc.name} ({acc.accountNumberMasked})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Account Details Card */}
      <div className="bg-[#0C2340] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/5 to-transparent pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-500/20 text-blue-200 border border-blue-400/30 uppercase tracking-wider">
                {currentAccount.type}
              </span>
              <span className="text-xs text-slate-300 font-medium">U.S. Bank Private Wealth Tier</span>
              {isRestricted ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-300 font-bold bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  Temporary Security Hold
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Active
                </span>
              )}
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{currentAccount.name}</h2>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-300">
                {/* Account Number Toggle */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Account:</span>
                  <span className="font-mono font-bold text-white tabular-nums">
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
                  <span className="text-slate-400">Routing (ABA):</span>
                  <span className="font-mono font-bold text-white tabular-nums">
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
                  <button
                    onClick={handleOpenRoutingModal}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors text-[11px] font-semibold border border-white/20 ml-1.5 cursor-pointer"
                    title="Change routing number"
                  >
                    <Edit3 className="w-3 h-3 text-amber-300" />
                    <span>Change Routing</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Balances Display */}
            <div className="pt-2 flex flex-wrap items-baseline gap-6 sm:gap-10">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-300 block font-semibold">
                  {isChecking && isRestricted ? 'Available Balance (Restricted)' : 'Available Balance'}
                </span>
                <span className="text-3xl sm:text-4xl font-black font-mono tabular-nums text-white mt-0.5 block">
                  ${(isChecking && isRestricted ? 0 : currentAccount.availableBalance).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}
                </span>
                {isRestricted && (
                  <span className="text-xs text-amber-300 font-semibold flex items-center gap-1 mt-1">
                    <Lock className="w-3 h-3 text-amber-400" /> In-Person Branch Verification Required
                  </span>
                )}
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Current Ledger Balance
                </span>
                <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-200 mt-0.5 block">
                  ${currentAccount.ledgerBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="flex flex-col justify-between sm:items-end gap-4 shrink-0">
            <div className="text-left sm:text-right text-xs text-slate-300 space-y-1">
              <div>
                <span className="text-slate-400">Account Status:</span>{' '}
                <span className="font-bold text-white">{isRestricted ? 'Security Hold' : 'Normal'}</span>
              </div>
              <div>
                <span className="text-slate-400">Client:</span>{' '}
                <span className="font-bold text-white">Justin Jefferson (10482)</span>
              </div>
              <div>
                <span className="text-slate-400">HQ Routing:</span>{' '}
                <span className="font-mono text-[11px]">091000022</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={onNavigateToTransfers}
                className="px-4 py-2.5 rounded-xl bg-[#005A9C] hover:bg-[#004578] text-white text-xs font-bold transition-colors shadow-sm"
              >
                Transfer & Pay
              </button>
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

      {/* AUTHENTIC U.S. BANK CARD CONTROLS & MANAGEMENT UI */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-[#0C2340]">Card Management & Digital Controls</h3>
            <p className="text-xs text-slate-500">Security features, mobile wallet, and card status controls</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#005A9C] border border-blue-200">
            Instant Card Lock Protected
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Card Artwork */}
          <div className="lg:col-span-5">
            <div className="w-full max-w-sm mx-auto aspect-[1.586/1] rounded-2xl p-5 text-white shadow-xl relative overflow-hidden flex flex-col justify-between bg-gradient-to-tr from-[#0C2340] via-[#002244] to-[#005A9C]">
              {/* Card Header: U.S. Bank logo + Contactless Waves */}
              <div className="flex items-center justify-between">
                <UsBankLogo size="sm" variant="light" />
                <Wifi className="w-5 h-5 text-white/80 rotate-90" />
              </div>

              {/* EMV Chip */}
              <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 to-amber-400 border border-amber-300 shadow-xs flex items-center justify-center opacity-90">
                <div className="w-6 h-4 border border-amber-600/30 rounded-xs"></div>
              </div>

              {/* Card Number & Details */}
              <div className="space-y-2">
                <div className="font-mono text-base tracking-widest text-slate-100 drop-shadow-sm tabular-nums">
                  •••• •••• •••• {currentAccount.accountNumberMasked.replace(/\D/g, '') || '4821'}
                </div>
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-300">
                  <div>
                    <span className="text-[8px] block opacity-75">Cardholder</span>
                    <span className="font-bold text-white">JUSTIN JEFFERSON</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] block opacity-75">Expires</span>
                    <span className="font-mono font-bold text-white">09/29</span>
                  </div>
                  <div className="font-black italic text-sm text-white">
                    {currentAccount.type === 'credit' ? 'VISA' : 'DEBIT'}
                  </div>
                </div>
              </div>

              {cardLocked && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4">
                  <Lock className="w-8 h-8 text-rose-400 mb-1" />
                  <span className="text-sm font-bold text-white">Card Temporarily Locked</span>
                  <span className="text-[10px] text-slate-300">Transactions are currently blocked</span>
                </div>
              )}
            </div>
          </div>

          {/* Card Control Actions */}
          <div className="lg:col-span-7 space-y-3">
            {/* Toggle: Lock / Unlock Card */}
            <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cardLocked ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {cardLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Lock / Unlock Card</div>
                  <div className="text-[11px] text-slate-500">
                    {cardLocked ? 'Card is currently locked. Outgoing purchases will be declined.' : 'Card is active for retail and contactless transactions.'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setCardLocked(!cardLocked)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  cardLocked
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                }`}
              >
                {cardLocked ? 'Unlock Card' : 'Lock Card'}
              </button>
            </div>

            {/* Digital Wallet */}
            <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Digital Wallet (Apple Pay & Google Wallet)</div>
                  <div className="text-[11px] text-slate-500">Card is provisioned and verified on client devices</div>
                </div>
              </div>
              <button
                onClick={() => setShowWalletModal(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#005A9C] hover:bg-[#004578] text-white"
              >
                View Details
              </button>
            </div>

            {/* Report Lost or Stolen */}
            <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Report Lost or Stolen</div>
                  <div className="text-[11px] text-slate-500">Deactivate current card and request an expedited replacement</div>
                </div>
              </div>
              <button
                onClick={() => setShowLostStolenModal(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#DA291C] hover:bg-rose-50 border border-[#DA291C]/30"
              >
                Report Card
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Balance History Chart */}
      <BalanceHistoryChart
        data={chartData}
        range={chartRange}
        onRangeChange={setChartRange}
        isLoading={chartLoading}
      />

      {/* Recent Activity Snippet */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-base font-bold text-[#0C2340]">Recent Account Activity</h3>
            <p className="text-xs text-slate-500">Most recent transactions for {currentAccount.name}</p>
          </div>
          <button
            onClick={onNavigateToTransactions}
            className="text-xs font-bold text-[#005A9C] hover:underline"
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
                    className={`text-xs font-bold font-mono tabular-nums ${
                      isCredit ? 'text-emerald-700' : 'text-slate-900'
                    }`}
                  >
                    {isCredit ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                    Bal: ${tx.runningBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Change Routing Number Modal */}
      {showRoutingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-slate-800 space-y-5 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#005A9C] flex items-center justify-center font-black">
                  <Building className="w-5 h-5 text-[#005A9C]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Change Account Routing Number</h3>
                  <p className="text-[11px] text-slate-500">
                    Client: <strong>Justin Jefferson</strong> • {currentAccount.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRoutingModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Routing Summary */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[11px] block">Current Routing Number:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{currentAccount.routingNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[11px] block">Account Number:</span>
                <span className="font-mono font-bold text-slate-700">{currentAccount.accountNumberMasked}</span>
              </div>
            </div>

            {routingUpdateSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{routingUpdateSuccess}</span>
              </div>
            )}

            {routingUpdateError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{routingUpdateError}</span>
              </div>
            )}

            <form onSubmit={handleSaveRouting} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Select U.S. Bank Routing Transit Number
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {USBANK_ROUTING_PRESETS.map((preset) => {
                    const isSelected = selectedRoutingPreset === preset.number;
                    return (
                      <label
                        key={preset.number}
                        className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50/70 border-[#005A9C] text-slate-900 shadow-xs ring-1 ring-[#005A9C]'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="routingPreset"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedRoutingPreset(preset.number);
                            setCustomRoutingInput('');
                          }}
                          className="mt-0.5 text-[#005A9C] focus:ring-[#005A9C]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono font-extrabold text-[#005A9C] text-sm">
                              {preset.number}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500">
                              {preset.city}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            {preset.region}
                          </p>
                          {preset.recommended && (
                            <span className="inline-block mt-1 px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Primary Headquarters & Concierge Branch
                            </span>
                          )}
                        </div>
                      </label>
                    );
                  })}

                  {/* Custom Option */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedRoutingPreset === 'custom'
                        ? 'bg-blue-50/70 border-[#005A9C] text-slate-900 shadow-xs ring-1 ring-[#005A9C]'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="routingPreset"
                      checked={selectedRoutingPreset === 'custom'}
                      onChange={() => setSelectedRoutingPreset('custom')}
                      className="mt-0.5 text-[#005A9C] focus:ring-[#005A9C]"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-slate-900 block">Custom 9-Digit Routing Number</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Manually enter a custom ABA 9-digit routing transit code
                      </p>
                      {selectedRoutingPreset === 'custom' && (
                        <div className="mt-2.5">
                          <input
                            type="text"
                            maxLength={9}
                            value={customRoutingInput}
                            onChange={(e) => setCustomRoutingInput(e.target.value.replace(/\D/g, ''))}
                            placeholder="Enter 9 digits (e.g. 091000022)"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005A9C] font-mono text-sm tracking-widest text-slate-900"
                            autoFocus
                          />
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Apply to All Accounts Checkbox */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyToAllAccounts}
                    onChange={(e) => setApplyToAllAccounts(e.target.checked)}
                    className="rounded text-[#005A9C] focus:ring-[#005A9C] w-4 h-4"
                  />
                  <span>Apply updated routing number to all Justin Jefferson accounts</span>
                </label>
              </div>

              {/* Footer Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRoutingModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingRouting}
                  className="px-5 py-2.5 rounded-xl bg-[#005A9C] hover:bg-[#004578] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 disabled:opacity-50"
                >
                  {isUpdatingRouting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Update Routing Number</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Wallet Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-sm">Digital Wallet Credentials</span>
              <button onClick={() => setShowWalletModal(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-800">Apple Pay</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Provisioned on iPhone 16 Pro
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-800">Google Pay</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Active
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowWalletModal(false)}
              className="w-full py-2.5 bg-[#005A9C] text-white font-bold rounded-xl"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Report Lost or Stolen Modal */}
      {showLostStolenModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-[#DA291C] font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                Report Lost or Stolen Card
              </div>
              <button onClick={() => setShowLostStolenModal(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-600 leading-relaxed">
              If your card ending in <strong>{currentAccount.accountNumberMasked.replace(/\D/g, '') || '4821'}</strong> has been misplaced or compromised, we can immediately deactivate it and dispatch an expedited replacement card to your registered address at <strong>1201 Nicollet Mall, Minneapolis, MN</strong>.
            </p>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowLostStolenModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 font-semibold hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setCardLocked(true);
                  setShowLostStolenModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#DA291C] hover:bg-red-700 text-white font-bold"
              >
                Deactivate & Replace Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
