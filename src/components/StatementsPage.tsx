import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Printer,
  X,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { StatementSummary, Account, Customer, Transaction } from '../types/banking.ts';
import { api } from '../services/api.ts';

export const StatementsPage: React.FC = () => {
  const [statements, setStatements] = useState<StatementSummary[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [loading, setLoading] = useState(true);

  // Statement Detail Modal
  const [activeStatement, setActiveStatement] = useState<{
    summary: StatementSummary;
    account: Account;
    customer: Customer;
    transactions: Transaction[];
  } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [statementError, setStatementError] = useState<string | null>(null);

  const years = [2026, 2025, 2024, 2023, 2022, 2021];

  const fetchStatements = async () => {
    setLoading(true);
    setStatementError(null);
    try {
      const data = await api.getStatements('acc_checking_4821');
      setStatements(data);
    } catch (err) {
      console.error('Failed to load statements:', err);
      setStatementError('Unable to load statements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatements();
  }, []);

  const filteredStatements = statements.filter((s) => s.year === selectedYear);

  const openStatementDetail = async (stmt: StatementSummary) => {
    setDetailLoading(true);
    setStatementError(null);
    try {
      const detail = await api.getStatementDetail(stmt.year, stmt.month, 'acc_checking_4821');
      setActiveStatement(detail);
    } catch (err) {
      setStatementError('Official statement document temporarily unavailable.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">eStatements & Documents</h1>
          <p className="text-xs text-slate-500 mt-1">
            Access, reconcile, and download official monthly financial statements for Premium Checking •••• 4821.
          </p>
        </div>

        {/* Year Filter */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs self-start sm:self-auto">
          {years.map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedYear === yr
                  ? 'bg-[#002855] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>

      {/* Reconciliation Assurance Banner */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-[#002855] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#002855] shrink-0" />
          <span>
            <strong>Mathematical Reconciliation Guarantee:</strong> Every monthly statement reconciles precisely with all posted ledger transactions.
          </span>
        </div>
        <span className="hidden md:inline text-[11px] font-mono text-blue-900">Archive 2021–2026</span>
      </div>

      {/* Statements Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          <div className="w-5 h-5 border-2 border-[#002855] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading statement archives...
        </div>
      ) : filteredStatements.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-xs">
          No statements recorded for year {selectedYear}.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStatements.map((stmt) => (
            <div
              key={stmt.id}
              className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#002855] flex items-center justify-center font-bold text-xs">
                      {stmt.monthName.substring(0, 3)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {stmt.monthName} {stmt.year}
                      </h3>
                      <p className="text-[10px] text-slate-400">Statement #{stmt.id.replace('stmt_', '')}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {stmt.status}
                  </span>
                </div>

                <div className="py-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Opening Balance</span>
                    <span className="font-mono font-medium text-slate-800">
                      ${stmt.openingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-emerald-700">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Total Deposits
                    </span>
                    <span className="font-mono font-bold">
                      +${stmt.totalDeposits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5 text-slate-400" /> Total Debits
                    </span>
                    <span className="font-mono font-medium">
                      -${stmt.totalWithdrawals.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 font-bold text-slate-900">
                    <span>Closing Ledger Balance</span>
                    <span className="font-mono text-sm text-[#002855]">
                      ${stmt.closingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">{stmt.transactionCount} posted transactions</span>
                <button
                  onClick={() => openStatementDetail(stmt)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#002855] text-white hover:bg-[#001f3f] font-semibold transition-colors shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5" /> View Statement
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULL STATEMENT VIEWER MODAL */}
      {activeStatement && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl my-8 overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            {/* Action Bar (hidden on print) */}
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#002855]" />
                <span className="text-xs font-bold text-slate-800">
                  US Bank Official Monthly Statement • {activeStatement.summary.monthName} {activeStatement.summary.year}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </button>
                <button
                  onClick={() => setActiveStatement(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Statement Document Content */}
            <div className="p-8 sm:p-10 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-6" id="printable-statement">
              {/* Bank Header */}
              <div className="flex items-start justify-between border-b-2 border-[#002855] pb-6 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 bg-[#002855] rounded flex items-center justify-center text-white font-black text-sm">
                      USB
                    </div>
                    <span className="text-2xl font-black text-[#002855] tracking-tight">US BANK</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">U.S. Bank National Association • Member FDIC</p>
                  <p className="text-[11px] text-slate-500">800 Nicollet Mall, Minneapolis, MN 55402</p>
                </div>

                <div className="text-right">
                  <div className="text-xs uppercase font-bold tracking-wider text-slate-800">Account Statement</div>
                  <div className="text-xs font-semibold text-slate-600 mt-1">{activeStatement.summary.periodLabel}</div>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                    Account: {activeStatement.account.accountNumberMasked}
                  </div>
                </div>
              </div>

              {/* Customer & Account Info Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-200 mb-6 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Customer Details</span>
                  <div className="text-sm font-bold text-slate-900 mt-1">{activeStatement.customer.name}</div>
                  <div className="text-slate-600">{activeStatement.customer.address.street}</div>
                  <div className="text-slate-600">
                    {activeStatement.customer.address.city}, {activeStatement.customer.address.state} {activeStatement.customer.address.zip}
                  </div>
                  <div className="text-slate-500 mt-1">Customer ID: {activeStatement.customer.id}</div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Account Profile</span>
                  <div className="text-sm font-bold text-slate-900 mt-1">{activeStatement.account.name}</div>
                  <div className="text-slate-600">Status: {activeStatement.account.status} • Routing: {activeStatement.account.routingNumberMasked}</div>
                  <div className="text-slate-600">Annual Percentage Yield (APY): 0.45%</div>
                  <div className="text-slate-500 mt-1">Statement Cycle: Calendar Month</div>
                </div>
              </div>

              {/* Monthly Mathematical Summary Table */}
              <div className="mb-8">
                <h4 className="text-xs uppercase font-bold text-slate-700 tracking-wider mb-3">
                  Account Balance Summary
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Starting Balance</span>
                    <span className="text-sm font-bold font-mono text-slate-900 mt-1 block">
                      ${activeStatement.summary.openingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Total Deposits (+)</span>
                    <span className="text-sm font-bold font-mono text-emerald-700 mt-1 block">
                      +${activeStatement.summary.totalDeposits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Withdrawals (-)</span>
                    <span className="text-sm font-bold font-mono text-slate-900 mt-1 block">
                      -${activeStatement.summary.totalWithdrawals.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-200">
                    <span className="text-[10px] uppercase font-bold text-[#002855] block">Ending Balance</span>
                    <span className="text-sm font-black font-mono text-[#002855] mt-1 block">
                      ${activeStatement.summary.closingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Itemized Transactions Table */}
              <div className="mb-6">
                <h4 className="text-xs uppercase font-bold text-slate-700 tracking-wider mb-3">
                  Itemized Posted Transactions
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-[10px] uppercase font-bold text-slate-600 border-b border-slate-200">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Description / Merchant</th>
                        <th className="py-2.5 px-3">Reference</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                        <th className="py-2.5 px-3 text-right">Running Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {activeStatement.transactions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400 font-sans">
                            No posted transactions recorded during this calendar period.
                          </td>
                        </tr>
                      ) : (
                        activeStatement.transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50">
                            <td className="py-2 px-3 text-slate-600 whitespace-nowrap">{tx.date}</td>
                            <td className="py-2 px-3 font-sans">
                              <span className="font-bold text-slate-900 block">{tx.merchant}</span>
                              <span className="text-[10px] text-slate-500">{tx.description}</span>
                            </td>
                            <td className="py-2 px-3 text-slate-400">{tx.reference}</td>
                            <td
                              className={`py-2 px-3 text-right font-bold whitespace-nowrap ${
                                tx.type === 'credit' ? 'text-emerald-700' : 'text-slate-900'
                              }`}
                            >
                              {tx.type === 'credit' ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-2 px-3 text-right text-slate-800 font-semibold whitespace-nowrap">
                              ${tx.runningBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Statement Footer Legal Disclaimers */}
              <div className="mt-8 pt-6 border-t border-slate-200 text-[10px] text-slate-400 space-y-1 text-center">
                <p className="font-semibold text-slate-700 uppercase tracking-wider">
                  Official Account Statement • Certified Banking Record
                </p>
                <p>
                  In Case of Errors or Questions About Your Electronic Transfers, call 800-USBANKS or write to U.S. Bank Electronic Funds Services, P.O. Box 790064, St. Louis, MO 63179.
                </p>
                <p>US Bank National Association • Equal Housing Lender • Member FDIC</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
