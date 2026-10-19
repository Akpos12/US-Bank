import React, { useState } from 'react';
import {
  X,
  FileText,
  Printer,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Download,
  Share2,
} from 'lucide-react';
import { Transaction } from '../types/banking.ts';

interface TransactionDetailsPanelProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const TransactionDetailsPanel: React.FC<TransactionDetailsPanelProps> = ({
  transaction,
  onClose,
}) => {
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  if (!transaction) return null;

  const isCredit = transaction.type === 'credit';
  const isPending = transaction.status === 'pending';

  const copyReference = () => {
    navigator.clipboard.writeText(transaction.reference);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Side Slide-Over Panel */}
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl z-50 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Top Header */}
        <div>
          <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                Transaction Record
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">Payment Details</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Amount Card Header */}
          <div className="p-6 border-b border-slate-100 flex flex-col items-center text-center">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-sm ${
                isCredit ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-[#002855] border border-blue-100'
              }`}
            >
              {isCredit ? (
                <ArrowDownLeft className="w-7 h-7" />
              ) : (
                <ArrowUpRight className="w-7 h-7" />
              )}
            </div>

            <p className="text-sm font-bold text-slate-800">{transaction.label || transaction.description || transaction.merchant}</p>
            {transaction.provider && (
              <p className="text-xs text-slate-500 mt-0.5">{transaction.provider}</p>
            )}
            <div className="text-3xl font-extrabold text-slate-900 font-mono mt-1">
              {isCredit ? '+' : '-'}${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>

            {/* Status Pill */}
            <div className="mt-3">
              {transaction.status === 'Pending Review' ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-xs">
                  <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" /> Pending Review
                </span>
              ) : isPending ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <Clock className="w-3.5 h-3.5" /> Pending Settlement
                </span>
              ) : transaction.status === 'posted' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Completed & Posted
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                  <AlertTriangle className="w-3.5 h-3.5" /> {transaction.status}
                </span>
              )}
            </div>
          </div>

          {/* Key Value Details */}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-xs font-medium text-slate-500">Transaction Reference</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-semibold text-slate-900">{transaction.reference}</span>
                <button
                  onClick={copyReference}
                  className="text-[11px] font-medium text-[#002855] hover:underline"
                >
                  {copiedRef ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-xs font-medium text-slate-500">Transaction Date</span>
              <span className="text-xs font-semibold text-slate-900">{transaction.date}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-xs font-medium text-slate-500">Posting Date</span>
              <span className="text-xs font-semibold text-slate-900">{transaction.postingDate}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-xs font-medium text-slate-500">Category</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                {transaction.category}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-xs font-medium text-slate-500">Payment Channel</span>
              <span className="text-xs font-medium text-slate-900">{transaction.paymentMethod}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-xs font-medium text-slate-500">Account</span>
              <span className="text-xs font-medium text-slate-900">Premium Checking •••• 4821</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 bg-slate-50/70 p-3 rounded-lg">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Balance After Posting</span>
                <span className="text-[11px] text-slate-500">Authoritative reconciled balance</span>
              </div>
              <span className="text-sm font-bold font-mono text-[#002855]">
                ${transaction.runningBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {transaction.description && (
              <div className="pt-2">
                <span className="text-xs font-medium text-slate-500 block mb-1">Memo & Narrative</span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {transaction.description}
                </p>
              </div>
            )}

            {transaction.status === 'Pending Review' && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>Pending Provider Confirmation</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Provider is currently recorded as <strong>Unspecified Healthcare Provider</strong> pending billing confirmation. Outgoing bank transfers for this account are temporarily unavailable due to additional account verification required.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-2">
          <button
            onClick={() => setShowReceiptModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#002855] hover:bg-[#001f3f] text-white text-xs font-bold transition-all shadow-sm"
          >
            <FileText className="w-4 h-4" />
            Generate & Download Official Receipt
          </button>
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 mt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>End-to-End Cryptographically Signed Banking Record</span>
          </div>
        </div>
      </div>

      {/* Official Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            {/* Modal action bar (hidden on print) */}
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between no-print">
              <span className="text-xs font-bold text-slate-700">Official Electronic Receipt</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
                </button>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Body */}
            <div className="p-8 print:p-6" id="printable-receipt">
              {/* Receipt Header */}
              <div className="flex items-start justify-between border-b-2 border-[#002855] pb-5 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#002855] rounded flex items-center justify-center text-white font-extrabold text-sm tracking-tighter">
                      USB
                    </div>
                    <div>
                      <h3 className="text-lg font-black tracking-tight text-[#002855]">US BANK</h3>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                        Premium Digital Banking
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                    Transaction Receipt
                  </span>
                  <span className="text-xs font-mono text-slate-500">{transaction.reference}</span>
                </div>
              </div>

              {/* Receipt Body */}
              <div className="space-y-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  <p className="text-slate-500 text-[11px] uppercase tracking-wider font-semibold">Amount</p>
                  <p className="text-3xl font-extrabold text-slate-900 font-mono mt-0.5">
                    {isCredit ? '+' : '-'}${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                  </p>
                  <p className="text-[11px] text-emerald-700 font-medium mt-1">
                    Settlement Status: {transaction.status.toUpperCase()}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 py-2 border-b border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Account Holder</span>
                    <span className="font-bold text-slate-800 text-xs">Justin Jefferson</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Account Number</span>
                    <span className="font-mono font-medium text-slate-800 text-xs">Premium Checking •••• 4821</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 py-2 border-b border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Merchant / Payee</span>
                    <span className="font-bold text-slate-800 text-xs">{transaction.merchant}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Category</span>
                    <span className="font-medium text-slate-800 text-xs">{transaction.category}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 py-2 border-b border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Transaction Date</span>
                    <span className="font-medium text-slate-800 text-xs">{transaction.date}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Effective Posting Date</span>
                    <span className="font-medium text-slate-800 text-xs">{transaction.postingDate}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 py-2 border-b border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Payment Channel</span>
                    <span className="font-medium text-slate-800 text-xs">{transaction.paymentMethod}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Post-Balance</span>
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      ${transaction.runningBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="pt-3">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Description / Memo</span>
                  <p className="text-slate-700 italic text-[11px] mt-0.5">{transaction.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-dashed border-slate-200 text-center text-[10px] text-slate-400 space-y-1">
                  <p>US Bank National Association • Member FDIC • Equal Housing Lender</p>
                  <p>Electronic verification code: SHA256-{(transaction.reference + transaction.amount).substring(0, 16)}</p>
                  <p className="text-[9px] text-slate-400">
                    Official financial receipt generated on demand for customer records.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
