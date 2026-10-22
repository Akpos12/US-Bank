import React, { useState, useEffect } from 'react';
import {
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  Building2,
  UserPlus,
  ShieldCheck,
  Send,
  Zap,
  Clock,
  ArrowRight,
  Plus,
  X,
  CreditCard,
  FileCheck,
  Lock,
  Smartphone,
  Receipt,
  Search,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Account, Payee, TransferRequest, Transaction } from '../types/banking.ts';
import { api } from '../services/api.ts';

interface TransfersPageProps {
  accounts: Account[];
  onTransferSuccess: () => void;
}

export const TransfersPage: React.FC<TransfersPageProps> = ({ accounts, onTransferSuccess }) => {
  const [activeTab, setActiveTab] = useState<'internal' | 'billpay' | 'zelle'>('internal');
  const [payees, setPayees] = useState<Payee[]>([]);
  const [step, setStep] = useState<'form' | 'review' | 'confirmed'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Accounts
  const primaryChecking = accounts.find((a) => a.id === 'acc_checking_4821') || accounts[0];
  const savingsAccount = accounts.find((a) => a.id === 'acc_savings_6194') || accounts[1];
  const creditCardAccount = accounts.find((a) => a.id === 'acc_credit_9920') || accounts[2];

  // Transfer Fields
  const [fromAccountId, setFromAccountId] = useState<string>(primaryChecking?.id || 'acc_checking_4821');
  const [toAccountId, setToAccountId] = useState<string>(savingsAccount?.id || '');
  const [toPayeeId, setToPayeeId] = useState<string>('');
  const [zelleRecipient, setZelleRecipient] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [speed, setSpeed] = useState<'standard' | 'instant'>('instant');
  const [transferDate, setTransferDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Bill Pay Fields
  const [selectedBiller, setSelectedBiller] = useState<string>('Xcel Energy');
  const [billerAccountNumber, setBillerAccountNumber] = useState<string>('5421-9920-1123');

  // Add Payee Modal
  const [showAddPayeeModal, setShowAddPayeeModal] = useState(false);
  const [newPayeeName, setNewPayeeName] = useState('');
  const [newPayeeBank, setNewPayeeBank] = useState('');
  const [newPayeeAccNum, setNewPayeeAccNum] = useState('');
  const [newPayeeRouting, setNewPayeeRouting] = useState('');
  const [addPayeeLoading, setAddPayeeLoading] = useState(false);
  const [addPayeeError, setAddPayeeError] = useState<string | null>(null);

  // Confirmed Result
  const [transferResult, setTransferResult] = useState<{
    transaction: Transaction;
    fromAccount: Account;
    toAccount?: Account;
    message: string;
  } | null>(null);

  const fetchPayees = async () => {
    try {
      const data = await api.getPayees();
      setPayees(data);
      if (data.length > 0 && !toPayeeId) {
        setToPayeeId(data[0].id);
      }
    } catch (e) {
      console.error('Failed to load payees:', e);
    }
  };

  useEffect(() => {
    fetchPayees();
  }, []);

  const fromAccount = accounts.find((a) => a.id === fromAccountId) || accounts[0];
  const toAccount = accounts.find((a) => a.id === toAccountId);
  const selectedPayee = payees.find((p) => p.id === toPayeeId);
  const numAmount = parseFloat(amount) || 0;

  const isOriginRestricted =
    fromAccount?.status === 'Transfers Temporarily Restricted' ||
    fromAccount?.restriction?.restriction_active;

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // If attempting to transfer from an account under branch security hold
    if (isOriginRestricted) {
      setError(
        'Transfers and outgoing debits are temporarily restricted pending identity verification. Please visit your local U.S. Bank branch with valid government-issued photo ID to verify your identity and complete verification.'
      );
      return;
    }

    if (numAmount <= 0) {
      setError('Please enter a valid transfer amount greater than $0.00.');
      return;
    }

    if (!fromAccount) {
      setError('Please select a valid funding account.');
      return;
    }

    if (fromAccount.availableBalance < numAmount) {
      setError(
        `Insufficient available funds. Available balance in ${fromAccount.name} is $${fromAccount.availableBalance.toLocaleString(
          'en-US',
          { minimumFractionDigits: 2 }
        )}.`
      );
      return;
    }

    if (activeTab === 'internal') {
      if (!toAccountId) {
        setError('Please select a destination account.');
        return;
      }
      if (fromAccountId === toAccountId) {
        setError('Funding and destination accounts cannot be the same.');
        return;
      }
    }

    if (activeTab === 'billpay' && !selectedBiller) {
      setError('Please choose a registered payee / utility provider.');
      return;
    }

    if (activeTab === 'zelle' && !zelleRecipient.trim()) {
      setError('Please provide a valid U.S. mobile number or email address registered with Zelle®.');
      return;
    }

    setStep('review');
  };

  const handleConfirmTransfer = async () => {
    setLoading(true);
    setError(null);

    try {
      const desc =
        description.trim() ||
        (activeTab === 'internal'
          ? `Internal Transfer to ${toAccount?.name}`
          : activeTab === 'zelle'
          ? `Zelle® payment to ${zelleRecipient}`
          : `Bill Pay to ${selectedBiller}`);

      const req: TransferRequest = {
        fromAccountId,
        toType: activeTab === 'internal' ? 'internal' : 'payee',
        toAccountId: activeTab === 'internal' ? toAccountId : undefined,
        toPayeeId: activeTab === 'internal' ? undefined : toPayeeId,
        amount: numAmount,
        description: desc,
        category: 'Transfer',
        transferDate,
        speed,
      };

      const result = await api.executeTransfer(req);
      setTransferResult(result);
      setStep('confirmed');
      onTransferSuccess();

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0C2340', '#005A9C', '#7414CA', '#10B981'],
      });
    } catch (err: any) {
      setError(err.message || 'Transfer failed to process. Please check branch verification instructions.');
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  const handleResetForNewTransfer = () => {
    setStep('form');
    setAmount('');
    setDescription('');
    setTransferResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0C2340] tracking-tight">Transfer & Pay Hub</h1>
        <p className="text-xs text-slate-500 mt-1">
          Move funds securely with U.S. Bank real-time internal transfers, electronic Bill Pay, and Send Money with Zelle®.
        </p>
      </div>

      {/* Main Tabs matching U.S. Bank Architecture */}
      <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-2xl border border-slate-200">
        <button
          onClick={() => {
            setActiveTab('internal');
            setStep('form');
            setError(null);
          }}
          className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'internal'
              ? 'bg-white text-[#0C2340] shadow-sm ring-1 ring-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4 text-[#005A9C]" />
          <span>Internal Transfers</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('billpay');
            setStep('form');
            setError(null);
          }}
          className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'billpay'
              ? 'bg-white text-[#0C2340] shadow-sm ring-1 ring-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4 text-[#005A9C]" />
          <span>Pay Bills (Bill Pay)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('zelle');
            setStep('form');
            setError(null);
          }}
          className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'zelle'
              ? 'bg-[#7414CA] text-white shadow-md'
              : 'text-slate-600 hover:text-[#7414CA]'
          }`}
        >
          <span className="font-black text-sm bg-white/20 w-5 h-5 rounded-full flex items-center justify-center leading-none">
            z
          </span>
          <span>Send Money with Zelle®</span>
        </button>
      </div>

      {/* Origin Account Status Notice if Restricted */}
      {isOriginRestricted && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-sm">Account Locked — Temporary Security Hold</div>
            <p className="leading-relaxed">
              Transfers and outgoing debits for <strong>{fromAccount?.name} ({fromAccount?.accountNumberMasked})</strong> are temporarily restricted pending identity verification.
            </p>
            <p className="font-semibold text-amber-800">
              Please visit your local U.S. Bank branch with valid government-issued photo ID to complete verification and remove restrictions.
            </p>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm p-6 sm:p-8">
        {step === 'form' && (
          <form onSubmit={handleProceedToReview} className="space-y-6">
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="font-medium leading-relaxed">{error}</div>
              </div>
            )}

            {/* ZELLE BRAND HEADER BANNER IF ZELLE TAB ACTIVE */}
            {activeTab === 'zelle' && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#7414CA] to-[#540899] text-white text-xs flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white text-[#7414CA] flex items-center justify-center font-black text-lg shadow-xs">
                    z
                  </div>
                  <div>
                    <div className="font-bold text-sm">Send Money with Zelle®</div>
                    <div className="text-purple-200 text-[11px]">
                      Fast, safe and easy way to send money in minutes
                    </div>
                  </div>
                </div>
                <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-white/15 text-white text-[10px] font-bold">
                  Instant ACH Clearance
                </span>
              </div>
            )}

            {/* From Account Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Pay From (Funding Account)
              </label>
              <select
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
              >
                {accounts.map((acc) => {
                  const isCurRestricted =
                    acc.status === 'Transfers Temporarily Restricted' ||
                    acc.restriction?.restriction_active;
                  return (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.accountNumberMasked}) — Available:{' '}
                      {isCurRestricted ? '$0.00 (Locked)' : `$${acc.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Destination Selection based on Active Tab */}
            {activeTab === 'internal' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Transfer To (Destination Account)
                </label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                >
                  {accounts
                    .filter((a) => a.id !== fromAccountId)
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.accountNumberMasked}) — Balance: ${acc.ledgerBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {activeTab === 'billpay' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Select Biller / Company
                  </label>
                  <select
                    value={selectedBiller}
                    onChange={(e) => setSelectedBiller(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                  >
                    <option value="Xcel Energy">Xcel Energy — Electric & Gas (Account: 5421-9920-1123)</option>
                    <option value="CenterPoint Energy">CenterPoint Energy — Minneapolis Gas (Account: 8812-4410-0982)</option>
                    <option value="U.S. Bank Altitude Reserve">U.S. Bank Altitude® Reserve Card (•••• 9920)</option>
                    <option value="City of Minneapolis">City of Minneapolis — Water & Utilities (Account: 9021-3310)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Biller Account Reference Number
                  </label>
                  <input
                    type="text"
                    value={billerAccountNumber}
                    onChange={(e) => setBillerAccountNumber(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
                  />
                </div>
              </div>
            )}

            {activeTab === 'zelle' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Send to (Recipient Mobile or Email)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={zelleRecipient}
                      onChange={(e) => setZelleRecipient(e.target.value)}
                      placeholder="e.g. recipient@example.com or (612) 555-0199"
                      className="w-full p-3.5 pl-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#7414CA]"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Enrolled recipients will receive money directly into their bank account in minutes.
                  </p>
                </div>
              </div>
            )}

            {/* Amount Input with Currency Tabular Format */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Transfer Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-slate-400 font-bold text-lg">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xl font-bold font-mono tabular-nums text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-2 mt-2.5">
                {[50, 100, 500, 1000, 5000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(String(val))}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold font-mono tabular-nums text-slate-700 transition-colors"
                  >
                    ${val.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Memo / Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Memo / Note (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Monthly maintenance, reimbursement, invoice payment"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                className={`px-6 py-3 rounded-xl font-bold text-xs text-white transition-all shadow-md flex items-center gap-2 ${
                  activeTab === 'zelle'
                    ? 'bg-[#7414CA] hover:bg-[#5e0ea7]'
                    : 'bg-[#005A9C] hover:bg-[#004578]'
                }`}
              >
                <span>Review Transfer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {step === 'review' && (
          <div className="space-y-6 animate-in fade-in-50 duration-150">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-[#0C2340]">Review Transfer Details</h2>
              <p className="text-xs text-slate-500">
                Please verify the payment instructions below before submitting.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 divide-y divide-slate-200 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Method:</span>
                <span className="font-bold text-[#0C2340]">
                  {activeTab === 'internal'
                    ? 'Internal U.S. Bank Transfer'
                    : activeTab === 'zelle'
                    ? 'Send Money with Zelle®'
                    : 'Electronic Bill Pay'}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Funding Account:</span>
                <span className="font-mono font-bold text-slate-800">
                  {fromAccount.name} ({fromAccount.accountNumberMasked})
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Recipient / Destination:</span>
                <span className="font-bold text-slate-800">
                  {activeTab === 'internal'
                    ? `${toAccount?.name} (${toAccount?.accountNumberMasked})`
                    : activeTab === 'zelle'
                    ? zelleRecipient
                    : selectedBiller}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="text-base font-black font-mono tabular-nums text-slate-900">
                  ${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleConfirmTransfer}
                disabled={loading}
                className={`px-6 py-3 rounded-xl font-bold text-xs text-white transition-all shadow-md flex items-center gap-2 ${
                  activeTab === 'zelle'
                    ? 'bg-[#7414CA] hover:bg-[#5e0ea7]'
                    : 'bg-[#005A9C] hover:bg-[#004578]'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Transfer...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize & Send</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 'confirmed' && transferResult && (
          <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-[#0C2340]">Transfer Successfully Processed</h2>
              <p className="text-xs text-slate-500 mt-1">
                Your transfer was posted and reconciled against the U.S. Bank authoritative ledger.
              </p>
            </div>

            <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-left font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Confirmation:</span>
                <span className="font-bold text-slate-900">{transferResult.transaction.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  ${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <button
              onClick={handleResetForNewTransfer}
              className="px-6 py-2.5 rounded-xl bg-[#005A9C] text-white text-xs font-bold hover:bg-[#004578]"
            >
              Done / Start Another Transfer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
