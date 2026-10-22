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
  Filter,
} from 'lucide-react';
import { StatementSummary, Account, Customer, Transaction } from '../types/banking.ts';
import { api } from '../services/api.ts';
import { UsBankLogo, EqualHousingLenderIcon } from './UsBankLogo.tsx';

export const StatementsPage: React.FC = () => {
  const [statements, setStatements] = useState<StatementSummary[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('acc_checking_4821');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
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
  const months = [
    { value: 'All', label: 'All Months' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const fetchStatements = async () => {
    setLoading(true);
    setStatementError(null);
    try {
      const data = await api.getStatements(selectedAccount);
      setStatements(data);
    } catch (err) {
      console.error('Failed to load statements:', err);
      setStatementError('Unable to load statement archives. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatements();
  }, [selectedAccount]);

  const filteredStatements = statements.filter((s) => {
    const yearMatch = s.year === selectedYear;
    const monthMatch = selectedMonth === 'All' || s.month === Number(selectedMonth);
    return yearMatch && monthMatch;
  });

  const openStatementDetail = async (stmt: StatementSummary) => {
    setDetailLoading(true);
    setStatementError(null);
    try {
      const detail = await api.getStatementDetail(stmt.year, stmt.month, selectedAccount);
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
      <div>
        <h1 className="text-2xl font-extrabold text-[#0C2340] tracking-tight">eStatements & Documents</h1>
        <p className="text-xs text-slate-500 mt-1">
          Access, download, and reconcile official monthly bank statements and tax records.
        </p>
      </div>

      {/* Standard U.S. Bank Dropdown Selectors */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-5">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-[#005A9C]" />
          Statement Document Filters
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Account Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Account
            </label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
            >
              <option value="acc_checking_4821">U.S. Bank Premium Checking (•••• 4821)</option>
              <option value="acc_savings_6194">U.S. Bank High-Yield Savings (•••• 6194)</option>
              <option value="acc_credit_9920">U.S. Bank Altitude Reserve Visa (•••• 9920)</option>
            </select>
          </div>

          {/* Tax Year Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tax Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
            >
              {years.map((yr) => (
                <option key={yr} value={yr}>
                  Calendar Year {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Month Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Statement Cycle Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reconciliation Assurance Banner */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-[#002855] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#005A9C] shrink-0" />
          <span>
            <strong>Official Record Guarantee:</strong> Every eStatement reconciles with posted transactions and is legally admissible for audit purposes.
          </span>
        </div>
        <span className="hidden md:inline text-[11px] font-mono font-bold text-[#005A9C]">Archive 2021–2026</span>
      </div>

      {/* Statements Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          <div className="w-5 h-5 border-2 border-[#005A9C] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading statements...
        </div>
      ) : filteredStatements.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-xs">
          No statements recorded for the selected filter combination.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStatements.map((stmt) => (
            <div
              key={stmt.id}
              className="bg-white rounded-2xl border border-[#E2E8F0] hover:border-slate-300 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#005A9C] flex items-center justify-center font-bold text-xs">
                      {stmt.monthName.substring(0, 3)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0C2340]">
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
                    <span className="font-mono font-bold tabular-nums text-slate-800">
                      ${stmt.openingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-emerald-700">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Total Deposits
                    </span>
                    <span className="font-mono font-bold tabular-nums">
                      +${stmt.totalDeposits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5 text-slate-400" /> Total Debits
                    </span>
                    <span className="font-mono font-medium tabular-nums">
                      -${stmt.totalWithdrawals.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 font-bold text-slate-900">
                    <span>Closing Ledger Balance</span>
                    <span className="font-mono text-sm tabular-nums text-[#0C2340]">
                      ${stmt.closingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">{stmt.transactionCount} transactions</span>
                <button
                  onClick={() => openStatementDetail(stmt)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#005A9C] text-white hover:bg-[#004578] font-semibold transition-colors shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" /> View PDF
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
                <FileText className="w-4 h-4 text-[#005A9C]" />
                <span className="text-xs font-bold text-slate-800">
                  U.S. Bank Official Monthly Statement • {activeStatement.summary.monthName} {activeStatement.summary.year}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs"
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
              {/* Bank Header with Official Logo */}
              <div className="flex items-start justify-between border-b-2 border-[#0C2340] pb-6 mb-6">
                <div>
                  <UsBankLogo size="lg" variant="dark" />
                  <p className="text-[11px] text-slate-600 font-medium mt-2">
                    U.S. Bank National Association • Member FDIC
                  </p>
                  <p className="text-[11px] text-slate-500">800 Nicollet Mall, Suite 100, Minneapolis, MN 55402</p>
                </div>

                <div className="text-right">
                  <div className="text-xs uppercase font-bold tracking-wider text-slate-800">Official eStatement</div>
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
                  <div className="text-slate-600">Routing (ABA): {activeStatement.account.routingNumberMasked}</div>
                  <div className="text-slate-600">Annual Percentage Yield (APY): 0.45%</div>
                  <div className="text-slate-500 mt-1">Cycle: Monthly Calendar</div>
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
                    <span className="text-sm font-bold font-mono tabular-nums text-slate-900 mt-1 block">
                      ${activeStatement.summary.openingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Total Deposits (+)</span>
                    <span className="text-sm font-bold font-mono tabular-nums text-emerald-700 mt-1 block">
                      +${activeStatement.summary.totalDeposits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Withdrawals (-)</span>
                    <span className="text-sm font-bold font-mono tabular-nums text-slate-900 mt-1 block">
                      -${activeStatement.summary.totalWithdrawals.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-200">
                    <span className="text-[10px] uppercase font-bold text-[#0C2340] block">Ending Balance</span>
                    <span className="text-sm font-black font-mono tabular-nums text-[#0C2340] mt-1 block">
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
                      {activeStatement.transactions.map((tx) => (
                        <tr key={tx.id}>
                          <td className="py-2 px-3 text-slate-600">{tx.date}</td>
                          <td className="py-2 px-3 font-sans text-slate-900 font-medium">
                            {tx.merchant} - {tx.description}
                          </td>
                          <td className="py-2 px-3 text-slate-400">{tx.reference}</td>
                          <td
                            className={`py-2 px-3 text-right tabular-nums font-bold ${
                              tx.type === 'credit' ? 'text-emerald-700' : 'text-slate-900'
                            }`}
                          >
                            {tx.type === 'credit' ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums text-slate-800">
                            ${tx.runningBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Legal & Regulatory Footer */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 gap-2">
                <div className="flex items-center gap-2">
                  <EqualHousingLenderIcon className="w-4 h-4 text-slate-500" />
                  <span>Member FDIC | Equal Housing Lender</span>
                </div>
                <span>© 2026 U.S. Bank National Association. All rights reserved.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
