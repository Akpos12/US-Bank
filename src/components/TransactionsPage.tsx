import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  RefreshCw,
  SlidersHorizontal,
  X,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { Transaction, TransactionCategory, TransactionType, TransactionStatus } from '../types/banking.ts';
import { api } from '../services/api.ts';
import { TransactionDetailsPanel } from './TransactionDetailsPanel.tsx';

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [type, setType] = useState<string>('All');
  const [status, setStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [dateRange, setDateRange] = useState<string>('All');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Selected Transaction for Detail Panel
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const categories: string[] = [
    'All',
    'Income',
    'Groceries',
    'Dining',
    'Utilities',
    'Shopping',
    'Travel',
    'Health',
    'Entertainment',
    'Transfer',
    'Services',
    'Interest',
  ];

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let startDate: string | undefined;
      let endDate: string | undefined;

      const now = new Date('2026-10-18T12:00:00Z');

      if (dateRange === '30D') {
        const d = new Date(now);
        d.setDate(now.getDate() - 30);
        startDate = d.toISOString().split('T')[0];
      } else if (dateRange === '90D') {
        const d = new Date(now);
        d.setDate(now.getDate() - 90);
        startDate = d.toISOString().split('T')[0];
      } else if (dateRange === '1Y') {
        const d = new Date(now);
        d.setFullYear(now.getFullYear() - 1);
        startDate = d.toISOString().split('T')[0];
      } else if (dateRange === 'Custom') {
        if (customStartDate) startDate = customStartDate;
        if (customEndDate) endDate = customEndDate;
      }

      const res = await api.getTransactions({
        search: search.trim(),
        category: category !== 'All' ? category : undefined,
        type: type !== 'All' ? type : undefined,
        status: status !== 'All' ? status : undefined,
        startDate,
        endDate,
        sortBy,
        sortOrder,
        page,
        limit,
      });

      setTransactions(res.data);
      setTotalCount(res.pagination.total);
      setTotalPages(res.pagination.totalPages || 1);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, limit, category, type, status, sortBy, sortOrder, dateRange, customStartDate, customEndDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchTransactions();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const resetFilters = () => {
    setSearch('');
    setCategory('All');
    setType('All');
    setStatus('All');
    setDateRange('All');
    setCustomStartDate('');
    setCustomEndDate('');
    setSortBy('date');
    setSortOrder('desc');
    setPage(1);
  };

  const exportToCSV = () => {
    if (transactions.length === 0) return;
    const headers = [
      'Date',
      'Posting Date',
      'Merchant',
      'Description',
      'Category',
      'Type',
      'Amount',
      'Status',
      'Running Balance',
      'Reference',
    ];
    const rows = transactions.map((t) => [
      t.date,
      t.postingDate,
      `"${t.merchant.replace(/"/g, '""')}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.category,
      t.type,
      t.amount,
      t.status,
      t.runningBalance,
      t.reference,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `US_Bank_Transactions_Justin_Jefferson_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Group transactions by Date Header ("Today", "Yesterday", or formatted date)
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {};

    transactions.forEach((tx) => {
      const txDate = tx.date; // e.g. "2026-10-18"
      let header = txDate;

      const dateObj = new Date(txDate + 'T00:00:00');
      if (!isNaN(dateObj.getTime())) {
        header = dateObj.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      }

      if (!groups[header]) {
        groups[header] = [];
      }
      groups[header].push(tx);
    });

    return groups;
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-extrabold text-[#0C2340] tracking-tight">Account Activity & Ledger</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#005A9C] border border-blue-200">
              Premium Checking •••• 4821
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative, mathematically reconciled transaction ledger with real-time clearance tags.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Download CSV</span>
          </button>
          <button
            onClick={fetchTransactions}
            className="p-2 rounded-xl bg-white border border-[#E2E8F0] text-slate-600 hover:bg-slate-50 shadow-xs transition-colors"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by merchant, description, reference, or amount..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="md:col-span-2">
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
            >
              <option value="All">All Types</option>
              <option value="credit">Income / Credits (+)</option>
              <option value="debit">Expenses / Debits (-)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
            >
              <option value="All">All Statuses</option>
              <option value="posted">Posted Only</option>
              <option value="pending">Pending Only</option>
            </select>
          </div>
        </div>

        {/* Secondary Row: Date Range & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500 font-medium mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Date Range:
            </span>
            {['All', '30D', '90D', '1Y', 'Custom'].map((r) => (
              <button
                key={r}
                onClick={() => {
                  setDateRange(r);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  dateRange === r
                    ? 'bg-[#005A9C] text-white shadow-xs font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r === 'All' ? 'All (2021–2026)' : r === '1Y' ? 'Last 1 Year' : r}
              </button>
            ))}

            {dateRange === 'Custom' && (
              <div className="flex items-center gap-1.5 ml-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-2 py-0.5 border border-slate-200 rounded text-xs"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-2 py-0.5 border border-slate-200 rounded text-xs"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Sort:</span>
              <button
                onClick={() => {
                  if (sortBy === 'date') {
                    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                  } else {
                    setSortBy('date');
                    setSortOrder('desc');
                  }
                }}
                className={`px-2.5 py-1 rounded-md font-semibold ${
                  sortBy === 'date' ? 'text-[#005A9C] bg-blue-50 font-bold' : 'text-slate-600'
                }`}
              >
                Date {sortBy === 'date' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
              </button>
              <button
                onClick={() => {
                  if (sortBy === 'amount') {
                    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                  } else {
                    setSortBy('amount');
                    setSortOrder('desc');
                  }
                }}
                className={`px-2.5 py-1 rounded-md font-semibold ${
                  sortBy === 'amount' ? 'text-[#005A9C] bg-blue-50 font-bold' : 'text-slate-600'
                }`}
              >
                Amount {sortBy === 'amount' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
              </button>
            </div>

            {(search || category !== 'All' || type !== 'All' || status !== 'All' || dateRange !== 'All') && (
              <button
                onClick={resetFilters}
                className="text-[#DA291C] hover:text-red-700 font-semibold underline text-xs"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AUTHENTIC U.S. BANK HIGH-DENSITY TRANSACTION TABLE */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="text-xs text-slate-600">
            Showing <span className="font-bold text-slate-900">{transactions.length}</span> of{' '}
            <span className="font-bold text-slate-900">{totalCount}</span> authoritative transactions
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-medium"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-slate-50 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                <th className="py-3 px-4">Description / Merchant</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Amount (USD)</th>
                <th className="py-3 px-4 text-right">Running Balance</th>
                <th className="py-3 px-4 text-right">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#005A9C] border-t-transparent rounded-full animate-spin"></div>
                      Loading transaction ledger...
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No transactions match your current filters.
                  </td>
                </tr>
              ) : (
                Object.entries(groupedTransactions).map(([dateHeader, txs]) => (
                  <React.Fragment key={dateHeader}>
                    {/* Date Section Header */}
                    <tr className="bg-slate-50/80 border-y border-slate-200/70">
                      <td colSpan={6} className="py-2 px-4 text-[11px] font-extrabold text-[#0C2340] uppercase tracking-wider">
                        {dateHeader}
                      </td>
                    </tr>

                    {/* Transaction Rows within this date section */}
                    {txs.map((tx) => {
                      const isCredit = tx.type === 'credit';
                      const isPending = tx.status === 'pending';
                      const isPendingReview = tx.status === 'Pending Review';

                      return (
                        <tr
                          key={tx.id}
                          onClick={() => setSelectedTx(tx)}
                          className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                        >
                          {/* Merchant & Icon */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                  isCredit
                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {isCredit ? (
                                  <ArrowDownLeft className="w-3.5 h-3.5" />
                                ) : (
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 group-hover:text-[#005A9C] transition-colors">
                                  {tx.merchant}
                                </div>
                                <div className="text-[11px] text-slate-500 line-clamp-1">{tx.description}</div>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                              {tx.category}
                            </span>
                          </td>

                          {/* Status Tag Chip */}
                          <td className="py-3 px-4">
                            {isPendingReview ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                                Pending Review
                              </span>
                            ) : isPending ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-500" />
                                Pending
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Posted
                              </span>
                            )}
                          </td>

                          {/* Amount with Tabular Lining Figures */}
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`font-mono font-bold text-xs tabular-nums ${
                                isCredit ? 'text-emerald-700' : 'text-slate-900'
                              }`}
                            >
                              {isCredit ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                          </td>

                          {/* Running Balance with Tabular Lining Figures */}
                          <td className="py-3 px-4 text-right">
                            <span className="font-mono text-slate-700 tabular-nums">
                              ${tx.runningBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                          </td>

                          {/* Reference */}
                          <td className="py-3 px-4 text-right">
                            <span className="font-mono text-[11px] text-slate-400">{tx.reference}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500">
            Page <span className="font-bold text-slate-800">{page}</span> of{' '}
            <span className="font-bold text-slate-800">{totalPages}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                    page === p
                      ? 'bg-[#005A9C] text-white shadow-xs font-bold'
                      : 'border border-slate-200 hover:bg-white text-slate-700'
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      <TransactionDetailsPanel
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </div>
  );
};
