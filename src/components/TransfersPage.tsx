import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  Building2,
  UserCheck,
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
  Calculator,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Account, Payee, TransferRequest, Transaction, RegisteredRecipient } from '../types/banking.ts';
import { api } from '../services/api.ts';

interface TransfersPageProps {
  accounts: Account[];
  onTransferSuccess: () => void;
}

const PRECONFIGURED_RECIPIENTS: RegisteredRecipient[] = [
  {
    accountNumber: '4892018437',
    routingNumber: '021000021',
    bankName: 'Chase Bank',
    code: 'ACC_001',
    name: 'Elaine Jefferson',
    accountType: 'Individual',
    description: 'Registered Beneficiary • Chase Bank Checking',
  },
  {
    accountNumber: '8104928371',
    routingNumber: '121000248',
    bankName: 'Wells Fargo Bank',
    code: 'ACC_002',
    name: "Children's Hospital of Philadelphia",
    accountType: 'Institutional / Donation',
    description: 'Pediatric Healthcare Foundation • Wells Fargo Institutional Account',
  },
  {
    accountNumber: '3751920482',
    routingNumber: '051000017',
    bankName: 'Bank of America',
    code: 'ACC_003',
    name: 'Stephan A. Grupp',
    accountType: 'Individual',
    description: 'Registered Beneficiary • Bank of America Checking',
  },
];

export const TransfersPage: React.FC<TransfersPageProps> = ({ accounts, onTransferSuccess }) => {
  const [activeTab, setActiveTab] = useState<'registered' | 'internal' | 'billpay' | 'zelle'>('registered');
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

  // Registered Recipient Fields with realistic account & routing details
  const [recipientInput, setRecipientInput] = useState<string>('');
  const [routingInput, setRoutingInput] = useState<string>('');
  const [matchedRecipient, setMatchedRecipient] = useState<RegisteredRecipient | null>(null);

  // Bill Pay Fields
  const [selectedBiller, setSelectedBiller] = useState<string>('Xcel Energy');
  const [billerAccountNumber, setBillerAccountNumber] = useState<string>('5421-9920-1123');

  // Security Transfer PIN
  const [transferPin, setTransferPin] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Confirmed Result
  const [transferResult, setTransferResult] = useState<{
    transaction: Transaction;
    fromAccount: Account;
    toAccount?: Account;
    recipient?: {
      name: string;
      accountNumber: string;
      routingNumber?: string;
      bankName?: string;
      accountType: string;
    };
    balanceCalculation?: {
      oldAvailableBalance: number;
      transferAmount: number;
      newAvailableBalance: number;
      verificationFormula: string;
    };
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

  // Background Name Inquiry API call when typing account number or routing number
  useEffect(() => {
    const rawAcc = recipientInput.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const rawRouting = routingInput.trim().replace(/[^0-9]/g, '');

    if (!rawAcc && !rawRouting) {
      setMatchedRecipient(null);
      return;
    }

    let isMounted = true;
    const performLookup = async () => {
      try {
        const res = await api.lookupAccountV1(rawAcc);
        if (isMounted && res && res.status === 'success') {
          const rec: RegisteredRecipient = {
            accountNumber: rawAcc,
            routingNumber: res.routing_number || rawRouting || '021000021',
            bankName: res.bank_name || 'Chase Bank',
            code: rawAcc === '8104928371' ? 'ACC_002' : rawAcc === '3751920482' ? 'ACC_003' : 'ACC_001',
            name: res.account_name,
            accountType: (res.account_name.includes('Hospital') ? 'Institutional / Donation' : 'Individual') as any,
            description: `Registered Beneficiary • ${res.bank_name}`,
          };
          setMatchedRecipient(rec);
          return;
        }
      } catch (e) {
        // Fallback to pre-configured list if API endpoint returns 404 or fails
      }

      if (!isMounted) return;
      const found = PRECONFIGURED_RECIPIENTS.find((r) => {
        const acc = r.accountNumber.replace(/[^A-Z0-9]/g, '');
        const code = r.code.replace(/[^A-Z0-9]/g, '');
        const name = r.name.toUpperCase().replace(/[^A-Z0-9]/g, '');
        const bank = r.bankName.toUpperCase().replace(/[^A-Z0-9]/g, '');
        const routing = r.routingNumber.replace(/[^0-9]/g, '');

        const accMatch = rawAcc && (rawAcc === acc || rawAcc === code || rawAcc === name || name.includes(rawAcc) || bank.includes(rawAcc));
        const legacyMatch =
          (rawAcc === '1001234501' && r.code === 'ACC_001') ||
          (rawAcc === '1001234502' && r.code === 'ACC_002') ||
          (rawAcc === '1001234503' && r.code === 'ACC_003');
        const routingMatch = rawRouting && rawRouting === routing;

        return accMatch || legacyMatch || (rawRouting && routingMatch && (!rawAcc || accMatch));
      });
      setMatchedRecipient(found || null);
    };

    performLookup();
    return () => {
      isMounted = false;
    };
  }, [recipientInput, routingInput]);

  const fromAccount = accounts.find((a) => a.id === fromAccountId) || accounts[0];
  const toAccount = accounts.find((a) => a.id === toAccountId);
  const numAmount = parseFloat(amount) || 0;

  // Real-time Balance Calculation Math (Rule 1)
  const currentAvailableBalance = fromAccount?.availableBalance ?? 0;
  const projectedRemainingBalance = Math.max(
    0,
    Math.round((currentAvailableBalance - numAmount) * 100) / 100
  );

  const isFrozen = fromAccount?.status === 'Frozen' || fromAccount?.status === 'Dormant';

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPinError(null);

    // Completely frozen accounts (savings/credit) cannot transfer
    if (isFrozen) {
      setError(
        `Transfers and withdrawals are disabled for ${fromAccount.name} (${fromAccount.accountNumberMasked}). This account is inactive and frozen.`
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

    // Balance verification: funds must be sufficient from available balance
    if (numAmount > fromAccount.availableBalance) {
      const restBal = fromAccount.restrictedBalance || 3086370.46;
      setError(
        `Transfer amount ($${numAmount.toLocaleString('en-US', {
          minimumFractionDigits: 2,
        })}) exceeds available balance ($${fromAccount.availableBalance.toLocaleString('en-US', {
          minimumFractionDigits: 2,
        })}). Your existing balance of $${restBal.toLocaleString('en-US', {
          minimumFractionDigits: 2,
        })} is locked under Restricted Balance Mode and cannot be transferred or withdrawn.`
      );
      return;
    }

    // Beneficiary validation for registered accounts
    if (activeTab === 'registered') {
      if (!matchedRecipient) {
        setError(
          'Invalid or unrecognized recipient account. Please verify the account number and routing number and try again.'
        );
        return;
      }
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
    setPinError(null);

    // Validate 4-digit Security Transfer PIN
    if (!transferPin || transferPin.trim() !== '2580') {
      setPinError('Invalid Security Transfer PIN. Please enter authorized 4-digit PIN to approve this transfer.');
      setLoading(false);
      return;
    }

    try {
      let desc = description.trim();
      let targetRecipientName = 'Registered Recipient';
      let targetAccNum = recipientInput;
      let targetRouting = routingInput;
      let targetBank = 'U.S. Bank';
      let targetType: 'Individual' | 'Institutional / Donation' = 'Individual';

      if (activeTab === 'registered' && matchedRecipient) {
        targetRecipientName = matchedRecipient.name;
        targetAccNum = matchedRecipient.accountNumber;
        targetRouting = matchedRecipient.routingNumber;
        targetBank = matchedRecipient.bankName;
        targetType = matchedRecipient.accountType;
        if (!desc) {
          desc = `Transfer to ${matchedRecipient.name} (${matchedRecipient.bankName})`;
        }
      } else if (activeTab === 'internal') {
        targetRecipientName = toAccount?.name || 'Internal Account';
        if (!desc) desc = `Internal Transfer to ${toAccount?.name}`;
      } else if (activeTab === 'zelle') {
        targetRecipientName = zelleRecipient;
        if (!desc) desc = `Zelle® payment to ${zelleRecipient}`;
      } else {
        targetRecipientName = selectedBiller;
        if (!desc) desc = `Bill Pay to ${selectedBiller}`;
      }

      const req: TransferRequest = {
        fromAccountId,
        toType: activeTab === 'registered' ? 'registered_account' : activeTab === 'internal' ? 'internal' : 'payee',
        toAccountId: activeTab === 'internal' ? toAccountId : undefined,
        toPayeeId: activeTab === 'internal' ? undefined : toPayeeId,
        recipientAccountNumber: activeTab === 'registered' ? targetAccNum : undefined,
        recipientRoutingNumber: activeTab === 'registered' ? targetRouting : undefined,
        recipientBankName: activeTab === 'registered' ? targetBank : undefined,
        recipientName: targetRecipientName,
        recipientType: targetType,
        amount: numAmount,
        description: desc,
        category: 'Transfer',
        transferDate,
        speed,
        pin: transferPin,
      };

      const result = await api.executeTransfer(req);
      setTransferResult(result);
      setStep('confirmed');

      // Immediately notify parent to update all account balances across the app
      onTransferSuccess();

      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0C2340', '#005A9C', '#10B981'],
      });
    } catch (err: any) {
      setError(err.message || 'Transfer failed to process.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetForNewTransfer = () => {
    setStep('form');
    setAmount('');
    setDescription('');
    setTransferPin('');
    setPinError(null);
    setTransferResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0C2340] tracking-tight">Transfer & Pay Hub</h1>
        <p className="text-xs text-slate-500 mt-1">
          Direct balance transfers with automatic beneficiary resolution, bank and routing verification, and real-time balance calculations.
        </p>
      </div>

      {/* Main Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 p-1 bg-slate-100 rounded-2xl border border-slate-200 gap-1">
        <button
          onClick={() => {
            setActiveTab('registered');
            setStep('form');
            setError(null);
          }}
          className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'registered'
              ? 'bg-white text-[#0C2340] shadow-sm ring-1 ring-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4 text-[#005A9C]" />
          <span>Beneficiary Transfer</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('internal');
            setStep('form');
            setError(null);
          }}
          className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
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
          className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'billpay'
              ? 'bg-white text-[#0C2340] shadow-sm ring-1 ring-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4 text-[#005A9C]" />
          <span>Pay Bills</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('zelle');
            setStep('form');
            setError(null);
          }}
          className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'zelle'
              ? 'bg-[#7414CA] text-white shadow-md'
              : 'text-slate-600 hover:text-[#7414CA]'
          }`}
        >
          <span className="font-black text-xs bg-white/20 w-4 h-4 rounded-full flex items-center justify-center leading-none">
            z
          </span>
          <span>Send with Zelle®</span>
        </button>
      </div>

      {/* Origin Account Status Notice if Frozen */}
      {isFrozen && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-sm">Account Inactive — Temporary Security Hold</div>
            <p className="leading-relaxed">
              Transfers and outgoing debits for <strong>{fromAccount?.name} ({fromAccount?.accountNumberMasked})</strong> are disabled.
            </p>
            <p className="font-semibold text-amber-800">
              Please visit your local U.S. Bank branch with valid photo ID to complete verification.
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
                  if (acc.status === 'Restricted balance mode' || acc.id === 'acc_checking_4821') {
                    return (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.accountNumberMasked}) — Available to Transfer: ${acc.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </option>
                    );
                  }
                  const isCurFrozen = acc.status === 'Frozen' || acc.status === 'Dormant';
                  return (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.accountNumberMasked}) — Available:{' '}
                      {isCurFrozen ? '$0.00 (Locked)' : `$${acc.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    </option>
                  );
                })}
              </select>

              {/* Balance Breakdown Strip for Checking */}
              {(fromAccount?.status === 'Restricted balance mode' || fromAccount?.id === 'acc_checking_4821') && (
                <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/80 border border-emerald-200/60">
                    <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Available to Transfer:
                    </span>
                    <span className="font-bold font-mono text-emerald-800 text-sm">
                      ${fromAccount.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-100 border border-slate-200/80">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-500" /> Restricted Existing Balance:
                    </span>
                    <span className="font-bold font-mono text-slate-700 text-sm">
                      ${(fromAccount.restrictedBalance || 3086370.46).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* TAB 1: BENEFICIARY TRANSFERS WITH REALISTIC U.S. BANKING DETAILS */}
            {activeTab === 'registered' && (
              <div className="space-y-4 pt-1">
                {/* Account & Routing Number Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Recipient Account Number
                    </label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={recipientInput}
                        onChange={(e) => setRecipientInput(e.target.value)}
                        placeholder="e.g. 4892018437"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Routing Transit Number (ABA)
                    </label>
                    <input
                      type="text"
                      maxLength={9}
                      value={routingInput}
                      onChange={(e) => setRoutingInput(e.target.value.replace(/\D/g, '').slice(0, 9))}
                      placeholder="e.g. 021000021"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                    />
                  </div>
                </div>



                {/* Instant Live Recipient Confirmation Display with Bank and Registered Name */}
                {matchedRecipient ? (
                  <div className="p-4 rounded-2xl bg-emerald-50/95 border border-emerald-300 text-xs space-y-2.5 animate-in fade-in-50 duration-150 shadow-xs">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 text-emerald-800 font-bold uppercase text-[10px] tracking-wider">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Beneficiary Bank & Account Verified
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                        {matchedRecipient.bankName}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1.5 border-t border-emerald-200/60">
                      <div>
                        <span className="text-slate-500 text-[10px] block font-sans">Registered Name</span>
                        <span className="font-extrabold text-sm text-[#0C2340]">{matchedRecipient.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block font-sans">Bank Name</span>
                        <span className="font-bold text-xs text-[#005A9C]">{matchedRecipient.bankName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block font-sans">Account Number</span>
                        <span className="font-mono font-bold text-xs text-slate-800">{matchedRecipient.accountNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block font-sans">Routing Number</span>
                        <span className="font-mono font-bold text-xs text-slate-800">{matchedRecipient.routingNumber}</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* TAB 2: INTERNAL TRANSFERS */}
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

            {/* TAB 3: BILL PAY */}
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

            {/* TAB 4: ZELLE */}
            {activeTab === 'zelle' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#7414CA] to-[#540899] text-white text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white text-[#7414CA] flex items-center justify-center font-black text-sm">
                      z
                    </div>
                    <div>
                      <div className="font-bold">Send Money with Zelle®</div>
                      <div className="text-purple-200 text-[10px]">Instant bank clearance</div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Send to (Recipient Mobile or Email)
                  </label>
                  <input
                    type="text"
                    value={zelleRecipient}
                    onChange={(e) => setZelleRecipient(e.target.value)}
                    placeholder="e.g. recipient@example.com or (612) 555-0199"
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#7414CA]"
                  />
                </div>
              </div>
            )}

            {/* Amount Input with Step-by-Step Mathematical Computation (Rule 1) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Transfer Amount (USD)
                </label>
                <span className="text-[11px] font-mono font-semibold text-emerald-700">
                  Available to Transfer: ${currentAvailableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

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
              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                {[100, 500, 1000, 5000, 10000, 25000].map((val) => (
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
                placeholder="e.g. Scheduled transfer, medical contribution, beneficiary allocation"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl font-bold text-xs text-white bg-[#005A9C] hover:bg-[#004578] transition-all shadow-md flex items-center gap-2"
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
              <h2 className="text-lg font-bold text-[#0C2340]">Review Transfer & Authorize</h2>
              <p className="text-xs text-slate-500">
                Please verify the beneficiary and transfer details, then enter your security PIN to authorize.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="font-medium leading-relaxed">{error}</div>
              </div>
            )}

            {/* Transfer Summary Table */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 divide-y divide-slate-200 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Method:</span>
                <span className="font-bold text-[#0C2340]">
                  {activeTab === 'registered'
                    ? 'Beneficiary Wire / Instant ACH Settlement'
                    : activeTab === 'internal'
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
                <span className="text-slate-500">Registered Beneficiary:</span>
                <span className="font-extrabold text-slate-900">
                  {activeTab === 'registered' && matchedRecipient
                    ? matchedRecipient.name
                    : activeTab === 'internal'
                    ? toAccount?.name
                    : activeTab === 'zelle'
                    ? zelleRecipient
                    : selectedBiller}
                </span>
              </div>
              {activeTab === 'registered' && matchedRecipient && (
                <>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500">Beneficiary Bank:</span>
                    <span className="font-bold text-[#005A9C]">
                      {matchedRecipient.bankName}
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500">Account Number:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {matchedRecipient.accountNumber}
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500">Routing Number:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {matchedRecipient.routingNumber}
                    </span>
                  </div>
                </>
              )}
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Transfer Amount:</span>
                <span className="text-base font-black font-mono tabular-nums text-slate-900">
                  ${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>



            {/* Security Transfer PIN Card */}
            <div className="p-5 rounded-2xl bg-white border-2 border-[#005A9C]/30 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#005A9C]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#0C2340]">
                  Transfer PIN Verification
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your 4-digit security PIN to authorize this transfer from your available funds. Your existing balance of <strong>${(fromAccount.restrictedBalance || 3086370.46).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong> remains locked.
              </p>

              <div className="max-w-xs mx-auto text-center pt-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Enter 4-Digit Security PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={transferPin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setTransferPin(val);
                    setPinError(null);
                  }}
                  placeholder="••••"
                  className="w-44 text-center tracking-[0.6em] font-mono font-bold text-2xl py-2 px-3 bg-slate-50 border-2 border-slate-300 rounded-xl focus:border-[#005A9C] focus:bg-white focus:outline-none transition-all shadow-inner"
                  autoFocus
                />
                {pinError && (
                  <p className="text-xs text-rose-600 font-bold mt-2 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>{pinError}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Review Action Buttons */}
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
                className="px-6 py-3 rounded-xl font-bold text-xs text-white bg-[#005A9C] hover:bg-[#004578] transition-all shadow-md flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deducting Balance & Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize & Execute Transfer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 'confirmed' && transferResult && (
          <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
                Successful & Posted
              </span>
              <h2 className="text-xl font-extrabold text-[#0C2340] mt-2">Transfer Successfully Completed</h2>
              <p className="text-xs text-slate-500 mt-1">
                Transferred to <strong className="text-slate-800">{transferResult.recipient?.name || transferResult.transaction.merchant}</strong> at <strong className="text-slate-800">{transferResult.recipient?.bankName || 'Beneficiary Bank'}</strong>.
              </p>
            </div>

            {/* RULE 1 CONFIRMATION BREAKDOWN BOX */}
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2.5 text-left font-mono">
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-sans">Confirmation Ref:</span>
                <span className="font-bold text-slate-900">{transferResult.transaction.reference}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-sans">Registered Name:</span>
                <span className="font-bold text-slate-900 font-sans">
                  {transferResult.recipient?.name || transferResult.transaction.merchant}
                </span>
              </div>
              {transferResult.recipient?.bankName && (
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500 font-sans">Bank:</span>
                  <span className="font-bold text-[#005A9C] font-sans">
                    {transferResult.recipient.bankName}
                  </span>
                </div>
              )}
              {transferResult.recipient?.accountNumber && (
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500 font-sans">Account:</span>
                  <span className="font-semibold text-slate-700">
                    {transferResult.recipient.accountNumber}
                  </span>
                </div>
              )}
              {transferResult.recipient?.routingNumber && (
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500 font-sans">Routing (ABA):</span>
                  <span className="font-semibold text-slate-700">
                    {transferResult.recipient.routingNumber}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-sans">Transferred Amount:</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  ${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Available Balance Status */}
              {transferResult.balanceCalculation && (
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500 font-sans">Updated Available Balance:</span>
                  <span className="font-bold text-emerald-700 tabular-nums">
                    ${transferResult.balanceCalculation.newAvailableBalance.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}

              <div className="flex justify-between pt-0.5">
                <span className="text-slate-500 font-sans">Restricted Existing Balance:</span>
                <span className="font-bold text-slate-700 tabular-nums flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-500" />
                  ${(transferResult.fromAccount.restrictedBalance || 3086370.46).toLocaleString('en-US', { minimumFractionDigits: 2 })} (Protected)
                </span>
              </div>
            </div>

            <button
              onClick={handleResetForNewTransfer}
              className="px-6 py-2.5 rounded-xl bg-[#005A9C] text-white text-xs font-bold hover:bg-[#004578] shadow-sm transition-colors"
            >
              Done / Start Another Transfer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
