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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Account, Payee, TransferRequest, Transaction } from '../types/banking.ts';
import { api } from '../services/api.ts';

interface TransfersPageProps {
  accounts: Account[];
  onTransferSuccess: () => void;
}

export const TransfersPage: React.FC<TransfersPageProps> = ({ accounts, onTransferSuccess }) => {
  const [payees, setPayees] = useState<Payee[]>([]);
  const [step, setStep] = useState<'form' | 'review' | 'confirmed'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [fromAccountId, setFromAccountId] = useState<string>(accounts[0]?.id || 'acc_checking_4821');
  const [transferType, setTransferType] = useState<'internal' | 'payee'>('internal');
  const [toAccountId, setToAccountId] = useState<string>(accounts[1]?.id || 'acc_savings_6194');
  const [toPayeeId, setToPayeeId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [speed, setSpeed] = useState<'standard' | 'instant'>('instant');
  const [transferDate, setTransferDate] = useState<string>(new Date().toISOString().split('T')[0]);

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

  const handleQuickAmount = (val: number) => {
    setAmount(String(val));
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (fromAccount?.status === 'Transfers Temporarily Restricted' || fromAccount?.restriction?.restriction_active) {
      setError(
        'Outgoing bank transfers are temporarily unavailable for this account due to additional account verification required. Please contact customer support or visit your local branch with valid identification to complete the required verification process.'
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
        `Insufficient funds. Available balance in ${fromAccount.name} is $${fromAccount.availableBalance.toLocaleString(
          'en-US',
          { minimumFractionDigits: 2 }
        )}.`
      );
      return;
    }

    if (transferType === 'internal' && fromAccountId === toAccountId) {
      setError('Origin and destination accounts cannot be identical.');
      return;
    }

    if (transferType === 'payee' && !toPayeeId) {
      setError('Please select or add an authorized recipient payee.');
      return;
    }

    setStep('review');
  };

  const handleConfirmTransfer = async () => {
    setLoading(true);
    setError(null);

    try {
      const req: TransferRequest = {
        fromAccountId,
        toType: transferType,
        toAccountId: transferType === 'internal' ? toAccountId : undefined,
        toPayeeId: transferType === 'payee' ? toPayeeId : undefined,
        amount: numAmount,
        description: description.trim() || (transferType === 'internal' ? `Transfer to ${toAccount?.name}` : `Payment to ${selectedPayee?.name}`),
        category: 'Transfer',
        transferDate,
        speed,
      };

      const result = await api.executeTransfer(req);
      setTransferResult(result);
      setStep('confirmed');
      onTransferSuccess();

      // Confetti burst for successful authentic money movement
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#002855', '#2563eb', '#10b981', '#f59e0b'],
      });
    } catch (err: any) {
      setError(err.message || 'Transfer failed to process. Please try again.');
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayeeName || !newPayeeBank || !newPayeeAccNum || !newPayeeRouting) return;
    setAddPayeeLoading(true);
    try {
      const res = await api.addPayee({
        name: newPayeeName,
        bankName: newPayeeBank,
        accountNumber: newPayeeAccNum,
        routingNumber: newPayeeRouting,
      });
      setPayees((prev) => [...prev, res.payee]);
      setToPayeeId(res.payee.id);
      setShowAddPayeeModal(false);
      setNewPayeeName('');
      setNewPayeeBank('');
      setNewPayeeAccNum('');
      setNewPayeeRouting('');
    } catch (err: any) {
      setAddPayeeError(err.message || 'Failed to add verified payee. Please check routing and account details.');
    } finally {
      setAddPayeeLoading(false);
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
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Transfers & Payments</h1>
        <p className="text-xs text-slate-500 mt-1">
          Secure ACH and real-time internal fund transfers with instantaneous ledger posting.
        </p>
      </div>

      {/* Progress Wizard Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-6 text-xs font-semibold">
          <div
            className={`flex items-center gap-2 ${
              step === 'form' ? 'text-[#002855] font-bold' : 'text-slate-400'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step === 'form' ? 'bg-[#002855] text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              1
            </span>
            <span>Configure Transfer</span>
          </div>

          <div
            className={`flex items-center gap-2 ${
              step === 'review' ? 'text-[#002855] font-bold' : 'text-slate-400'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step === 'review' ? 'bg-[#002855] text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              2
            </span>
            <span>Review & Authorization</span>
          </div>

          <div
            className={`flex items-center gap-2 ${
              step === 'confirmed' ? 'text-emerald-700 font-bold' : 'text-slate-400'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step === 'confirmed' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              3
            </span>
            <span>Confirmation</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Transaction Authorization Error</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Account Transfer Restriction Notice */}
      {fromAccount?.status === 'Transfers Temporarily Restricted' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-slate-800 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200 mt-0.5">
              <ShieldCheck className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900">
                  Account Status: Transfers Temporarily Restricted
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                  Additional Verification Required
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-1 font-medium leading-relaxed">
                This transfer restriction is limited specifically to this account. Additional verification is required by the bank before outgoing transfers can resume.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-3 rounded-xl bg-rose-50/90 border border-rose-200 text-rose-900">
              <div className="font-bold text-[11px] uppercase tracking-wider text-rose-800">Affected Services</div>
              <div className="mt-0.5 text-xs font-medium">Outgoing bank transfers are temporarily unavailable for this account.</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-900">
              <div className="font-bold text-[11px] uppercase tracking-wider text-emerald-800">Unaffected Services</div>
              <div className="mt-0.5 text-xs font-medium">Account login, transaction history, and other standard banking features remain accessible.</div>
            </div>
          </div>

          <div className="text-xs text-slate-700 bg-white/90 p-3 rounded-xl border border-amber-200 leading-relaxed">
            <span className="font-bold text-slate-900">Resolution Action: </span>
            Please contact customer support or visit your local branch with valid identification to complete the required verification process.
          </div>
        </div>
      )}

      {/* STEP 1: FORM */}
      {step === 'form' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <form onSubmit={handleProceedToReview} className="space-y-6">
            {/* Origin & Destination Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* From Account */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  From Account (Funding Source)
                </label>
                <div className="space-y-2">
                  {accounts.map((acc) => (
                    <div
                      key={acc.id}
                      onClick={() => setFromAccountId(acc.id)}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                        fromAccountId === acc.id
                          ? 'border-[#002855] bg-blue-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-900">{acc.name}</div>
                          <div className="text-[11px] font-mono text-slate-500">{acc.accountNumberMasked}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold font-mono text-slate-900">
                            ${acc.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-[10px] text-slate-400">Available</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Destination */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    To Destination
                  </label>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px]">
                    <button
                      type="button"
                      onClick={() => setTransferType('internal')}
                      className={`px-2.5 py-1 rounded font-semibold transition-all ${
                        transferType === 'internal' ? 'bg-white text-[#002855] shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      Internal Account
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransferType('payee')}
                      className={`px-2.5 py-1 rounded font-semibold transition-all ${
                        transferType === 'payee' ? 'bg-white text-[#002855] shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      External Payee
                    </button>
                  </div>
                </div>

                {transferType === 'internal' ? (
                  <div className="space-y-2">
                    {accounts.map((acc) => (
                      <div
                        key={acc.id}
                        onClick={() => setToAccountId(acc.id)}
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                          fromAccountId === acc.id
                            ? 'opacity-40 pointer-events-none border-slate-100'
                            : toAccountId === acc.id
                            ? 'border-[#002855] bg-blue-50/40 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-slate-900">{acc.name}</div>
                            <div className="text-[11px] font-mono text-slate-500">{acc.accountNumberMasked}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-bold font-mono text-slate-900">
                              ${acc.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-[10px] text-slate-400">Current Balance</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {payees.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => setToPayeeId(p.id)}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            toPayeeId === p.id
                              ? 'border-[#002855] bg-blue-50/40 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-slate-900">{p.name}</div>
                              <div className="text-[11px] text-slate-500">
                                {p.bankName} • {p.accountNumberMasked}
                              </div>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase font-mono">
                              ACH
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAddPayeeModal(true)}
                      className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 hover:border-[#002855] hover:bg-blue-50/50 text-[#002855] text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add New Verified Payee
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Amount Section */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Transfer Amount (USD)
              </label>
              <div className="relative max-w-md">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400 font-mono">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={fromAccount ? fromAccount.availableBalance : 100000}
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-2xl font-mono font-bold text-slate-900 focus:outline-none focus:border-[#002855] focus:bg-white transition-all"
                  required
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex items-center gap-2 mt-2">
                {[100, 500, 1000, 5000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickAmount(val)}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    +${val}
                  </button>
                ))}
                {fromAccount && (
                  <button
                    type="button"
                    onClick={() => setAmount(String(fromAccount.availableBalance))}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-blue-50 text-[#002855] hover:bg-blue-100 transition-colors"
                  >
                    Transfer Max
                  </button>
                )}
              </div>
            </div>

            {/* Description & Speed */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description / Memo (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monthly Savings Allocation, Rent, Services"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#002855]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Transfer Speed
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSpeed('instant')}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      speed === 'instant'
                        ? 'border-[#002855] bg-blue-50/50 text-[#002855]'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Instant</div>
                      <div className="text-[10px] text-slate-500">Immediate posting</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSpeed('standard')}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      speed === 'standard'
                        ? 'border-[#002855] bg-blue-50/50 text-[#002855]'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Standard ACH</div>
                      <div className="text-[10px] text-slate-500">1-2 business days</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={numAmount <= 0 || fromAccount?.status === 'Transfers Temporarily Restricted'}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#002855] hover:bg-[#001f3f] text-white text-xs font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {fromAccount?.status === 'Transfers Temporarily Restricted' ? (
                  <>Transfers Restricted on Selected Account</>
                ) : (
                  <>
                    Continue to Review <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 2: REVIEW */}
      {step === 'review' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Review Transfer Authorization</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Please verify all payment specifics before providing final cryptographic authorization.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs text-slate-500">Transfer Amount</span>
              <span className="text-2xl font-black text-slate-900 font-mono">
                ${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold block">From Account</span>
                <span className="font-bold text-slate-900 block mt-0.5">{fromAccount?.name}</span>
                <span className="font-mono text-slate-500 text-[11px]">{fromAccount?.accountNumberMasked}</span>
              </div>

              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold block">To Recipient</span>
                <span className="font-bold text-slate-900 block mt-0.5">
                  {transferType === 'internal' ? toAccount?.name : selectedPayee?.name}
                </span>
                <span className="font-mono text-slate-500 text-[11px]">
                  {transferType === 'internal' ? toAccount?.accountNumberMasked : selectedPayee?.accountNumberMasked}
                </span>
              </div>

              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold block">Effective Date</span>
                <span className="font-medium text-slate-800 block mt-0.5">{transferDate}</span>
              </div>

              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold block">Speed & Rail</span>
                <span className="font-medium text-slate-800 block mt-0.5">
                  {speed === 'instant' ? 'Instant Relationship Credit' : 'Standard Automated Clearing House'}
                </span>
              </div>
            </div>

            {description && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-400 uppercase text-[10px] font-semibold block">Memo / Narrative</span>
                <p className="text-xs text-slate-700 italic mt-0.5">{description}</p>
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-3 text-xs text-slate-700">
            <ShieldCheck className="w-5 h-5 text-[#002855] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#002855]">Two-Factor Authorization Enforced</p>
              <p className="mt-0.5 text-slate-600">
                This transaction has been pre-authorized via Justin Jefferson’s biometric device credentials. Submitting will immediately update your authoritative account ledger.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep('form')}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Back to Edit
            </button>

            <button
              type="button"
              onClick={handleConfirmTransfer}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#002855] hover:bg-[#001f3f] text-white text-xs font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Recording to Ledger...
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  Confirm & Execute Transfer
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CONFIRMED */}
      {step === 'confirmed' && transferResult && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border-2 border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Transfer Settled & Posted
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-3 font-mono">
              ${transferResult.transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">{transferResult.message}</p>
          </div>

          <div className="max-w-md mx-auto bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2.5 text-left">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Reference Code</span>
              <span className="font-mono font-bold text-slate-900">{transferResult.transaction.reference}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Date & Timestamp</span>
              <span className="font-mono text-slate-700">{transferResult.transaction.date} {transferResult.transaction.time}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">New {transferResult.fromAccount.name} Balance</span>
              <span className="font-mono font-bold text-[#002855]">
                ${transferResult.fromAccount.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {transferResult.toAccount && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">New {transferResult.toAccount.name} Balance</span>
                <span className="font-mono font-bold text-emerald-700">
                  ${transferResult.toAccount.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleResetForNewTransfer}
              className="px-5 py-2.5 rounded-xl bg-[#002855] hover:bg-[#001f3f] text-white text-xs font-bold transition-all shadow-xs"
            >
              Make Another Transfer
            </button>
          </div>
        </div>
      )}

      {/* ADD PAYEE MODAL */}
      {showAddPayeeModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add New Recipient Payee</h3>
              <button
                onClick={() => setShowAddPayeeModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addPayeeError && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{addPayeeError}</span>
              </div>
            )}

            <form onSubmit={handleCreatePayee} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Payee Legal / Business Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Minneapolis Wealth Partners"
                  value={newPayeeName}
                  onChange={(e) => setNewPayeeName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002855]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Recipient Financial Institution</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JPMorgan Chase Bank"
                  value={newPayeeBank}
                  onChange={(e) => setNewPayeeBank(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002855]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Routing Transit Number (9 Digits)</label>
                <input
                  type="text"
                  required
                  maxLength={9}
                  placeholder="091000022"
                  value={newPayeeRouting}
                  onChange={(e) => setNewPayeeRouting(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#002855]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Number</label>
                <input
                  type="text"
                  required
                  placeholder="1048291024"
                  value={newPayeeAccNum}
                  onChange={(e) => setNewPayeeAccNum(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#002855]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddPayeeModal(false)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addPayeeLoading}
                  className="px-4 py-2 bg-[#002855] text-white font-bold rounded-lg hover:bg-[#001f3f] transition-colors"
                >
                  {addPayeeLoading ? 'Verifying...' : 'Save Payee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
