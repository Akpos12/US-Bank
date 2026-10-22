import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  Building2,
  FileCheck,
  Phone,
  Clock,
  ExternalLink,
  X,
  Info,
} from 'lucide-react';
import { Account, Transaction } from '../types/banking.ts';

interface AccountRestrictionBannerProps {
  account: Account;
  onNavigateToTransactions?: () => void;
  onNavigateToTransfers?: () => void;
  onSelectPendingTx?: () => void;
}

export const AccountRestrictionBanner: React.FC<AccountRestrictionBannerProps> = ({
  account,
  onNavigateToTransactions,
  onNavigateToTransfers,
  onSelectPendingTx,
}) => {
  const [showModal, setShowModal] = useState(false);

  // If the account is undefined or does not have restriction active, do not render
  if (!account) {
    return null;
  }

  const isRestricted =
    account.status === 'Transfers Temporarily Restricted' ||
    account.restriction?.restriction_active;

  if (!isRestricted) {
    return null;
  }

  const isFrozen = account.status === 'Frozen';

  const restriction = account.restriction || {
    restriction_active: true,
    status_label: 'Account Locked',
    reason: 'Additional branch verification required to lift security hold.',
    affected_services: [
      'Outgoing bank transfers',
      'Incoming bank transfers',
      'Debit card purchases',
      'External withdrawals',
    ],
    unaffected_services: ['Historical statement viewing', 'Account balance review'],
    notification_message: 'Transfers and outgoing debits are temporarily restricted pending in-person branch verification.',
    resolution_instructions: 'Please visit your local U.S. Bank branch with valid government-issued photo identification to verify your identity and resolve this security hold.',
  };

  return (
    <>
      {/* Prominent Alert Banner at the top of the Account Dashboard */}
      <div
        className={`relative overflow-hidden rounded-2xl border-2 shadow-md transition-all ${
          isFrozen ? 'bg-rose-50/95 border-rose-300' : 'bg-amber-50/95 border-amber-300'
        }`}
      >
        {/* Subtle patterned header strip */}
        <div
          className={`px-4 sm:px-6 py-2.5 text-white flex flex-wrap items-center justify-between gap-2 text-xs ${
            isFrozen
              ? 'bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700'
              : 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600'
          }`}
        >
          <div className="flex items-center gap-2 font-bold tracking-wide">
            <ShieldAlert className="w-4 h-4 text-white shrink-0" />
            <span className="uppercase text-[11px] tracking-wider">Account Security Notice</span>
            <span className="opacity-60">•</span>
            <span>{account.name} ({account.accountNumberMasked})</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs ${
                isFrozen ? 'bg-white text-rose-900' : 'bg-white text-amber-900'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isFrozen ? 'bg-rose-600' : 'bg-amber-500 animate-pulse'
                }`}
              ></span>
              {restriction.status_label}
            </span>
          </div>
        </div>

        {/* Main Banner Body */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
            {/* Left Content */}
            <div className="space-y-3 flex-1">
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                    isFrozen
                      ? 'bg-rose-100 text-rose-800 border-rose-200'
                      : 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}
                >
                  <AlertTriangle className={`w-5 h-5 ${isFrozen ? 'text-rose-700' : 'text-amber-700'}`} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                      Account Status: {restriction.status_label}
                    </h2>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        isFrozen
                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}
                    >
                      Reason: {restriction.reason}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 mt-1.5 leading-relaxed font-medium">
                    {restriction.notification_message}
                  </p>
                </div>
              </div>

              {/* Service Impact Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Affected Services */}
                <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200/80 flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[11px] uppercase tracking-wider font-bold text-rose-900">
                      Affected Services
                    </div>
                    <div className="text-xs text-rose-800 mt-0.5 font-medium leading-snug">
                      {restriction.affected_services?.join(', ') || 'All account operations and transfers are disabled.'}
                    </div>
                  </div>
                </div>

                {/* Unaffected Services */}
                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[11px] uppercase tracking-wider font-bold text-emerald-900">
                      Unaffected Services
                    </div>
                    <div className="text-xs text-emerald-800 mt-0.5 font-medium leading-snug">
                      {restriction.unaffected_services?.join(', ') || 'Historical statement viewing only.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Resolution Instructions Text */}
              <div
                className={`flex items-start gap-2 text-xs text-slate-600 bg-white/70 p-3 rounded-xl border ${
                  isFrozen ? 'border-rose-200/60' : 'border-amber-200/60'
                }`}
              >
                <Info className={`w-4 h-4 shrink-0 mt-0.5 ${isFrozen ? 'text-rose-600' : 'text-amber-600'}`} />
                <div className="leading-relaxed">
                  <span className="font-bold text-slate-800">Resolution Instructions: </span>
                  {restriction.resolution_instructions}
                </div>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex lg:flex-col items-stretch justify-center gap-2 shrink-0 sm:min-w-[220px]">
              <button
                onClick={() => setShowModal(true)}
                className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white font-bold text-xs shadow-sm transition-colors cursor-pointer ${
                  isFrozen ? 'bg-rose-700 hover:bg-rose-800' : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                <span>Security Notice Details</span>
              </button>

              {onSelectPendingTx && (
                <button
                  onClick={onSelectPendingTx}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-50 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <span>Review Hospital Bill</span>
                  <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resolution & Verification Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div
              className={`px-6 py-5 text-white flex items-center justify-between ${
                isFrozen
                  ? 'bg-gradient-to-r from-rose-700 to-rose-800'
                  : 'bg-gradient-to-r from-amber-600 to-amber-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isFrozen ? 'Account Deactivation & Security Notice' : 'Account Verification Resolution'}
                  </h3>
                  <p className="text-[11px] text-white/80">
                    {isFrozen ? 'Official account status and service impact' : 'Step-by-step identity review procedure'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
              {/* Status Summary Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-amber-900">
                  <span>Current Account Status</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-200/80 text-amber-900">
                    Transfers Temporarily Restricted
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                  {restriction.notification_message}
                </p>
              </div>

              {/* Scope of Restriction */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Restriction Scope
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                    <div className="font-bold text-rose-800 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      Unavailable
                    </div>
                    <p className="text-[11px] text-rose-700">Outgoing bank transfers</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                    <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Available
                    </div>
                    <p className="text-[11px] text-emerald-700">Login, history viewing, cards, and deposits</p>
                  </div>
                </div>
              </div>

              {/* Pending Transaction Information */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-slate-500">Related Activity</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    Pending Review
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">Hospital Bill Payment</div>
                    <div className="text-[11px] text-slate-500">
                      Unspecified Healthcare Provider (Pending provider confirmation)
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold text-slate-900">-$300,000.00</div>
                </div>
              </div>

              {/* Resolution Instructions */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Resolution Steps
                </h4>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-xs">
                      1
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Gather Acceptable Identification</div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Please present a valid government-issued photo ID (State Driver's License or U.S. Passport) and a secondary document (recent utility bill or lease agreement).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-xs">
                      2
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Contact or Visit a Bank Branch</div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Visit your nearest branch location or reach our dedicated verification desk to confirm identity and complete the required account verification.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-xs">
                      3
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Transfer Privileges Restored</div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Once account verification is reviewed and approved, outgoing transfer capabilities will be immediately reinstated on this account.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Assistance Box */}
              <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800">Support Desk: </span>
                    <span className="font-mono text-slate-700">1-800-555-0199</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500">Mon–Fri 8am–8pm CT</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
