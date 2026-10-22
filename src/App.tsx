/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Customer, Account, Transaction, BankNotification } from './types/banking.ts';
import { api } from './services/api.ts';
import './services/firebase.ts';
import { LoginPage } from './components/LoginPage.tsx';
import { PublicHomePage } from './components/PublicHomePage.tsx';
import { NavigationSidebar } from './components/NavigationSidebar.tsx';
import { HeaderBar } from './components/HeaderBar.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { AccountOverview } from './components/AccountOverview.tsx';
import { TransactionsPage } from './components/TransactionsPage.tsx';
import { TransfersPage } from './components/TransfersPage.tsx';
import { StatementsPage } from './components/StatementsPage.tsx';
import { NotificationsPage } from './components/NotificationsPage.tsx';
import { SecurityCenter } from './components/SecurityCenter.tsx';
import { ProfilePage } from './components/ProfilePage.tsx';
import { TransactionDetailsPanel } from './components/TransactionDetailsPanel.tsx';
import { PlanAndTrackView } from './components/PlanAndTrackView.tsx';
import { UsBankLogo, EqualHousingLenderIcon } from './components/UsBankLogo.tsx';
import {
  Phone,
  ShieldCheck,
  X,
  Building2,
  MapPin,
  ExternalLink,
  ArrowRight,
  Home,
  ArrowRightLeft,
  Camera,
  PieChart,
  Menu,
  CheckCircle2,
  Upload,
} from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'portal' | 'public'>('portal');

  // Core Data Models
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [notifications, setNotifications] = useState<BankNotification[]>([]);

  // Global Transaction Modal
  const [activeTxDetail, setActiveTxDetail] = useState<Transaction | null>(null);

  // Global Help & Support Modal
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // Mobile Check Deposit Modal
  const [showMobileDepositModal, setShowMobileDepositModal] = useState<boolean>(false);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [depositAccount, setDepositAccount] = useState<string>('acc_checking_4821');
  const [frontCaptured, setFrontCaptured] = useState<boolean>(false);
  const [backCaptured, setBackCaptured] = useState<boolean>(false);
  const [depositSuccess, setDepositSuccess] = useState<boolean>(false);
  const [depositSubmitting, setDepositSubmitting] = useState<boolean>(false);

  const checkInitialAuth = async () => {
    setIsLoadingAuth(true);
    const token = api.getToken();
    if (!token) {
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
      return;
    }

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Auth check timeout')), 3500)
      );

      const [meRes, notifRes] = (await Promise.race([
        Promise.all([api.getMe(), api.getNotifications()]),
        timeoutPromise,
      ])) as any;

      if (meRes && meRes.customer) {
        setCustomer(meRes.customer);
        setAccounts(meRes.accounts || []);
        setNotifications(notifRes || []);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.warn('Session expired or invalid:', err);
      api.clearToken();
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  useEffect(() => {
    checkInitialAuth();

    const handleExpired = () => {
      setIsAuthenticated(false);
    };

    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const handleLoginSuccess = (cust: Customer, accs: Account[]) => {
    setCustomer(cust);
    setAccounts(accs);
    setIsAuthenticated(true);
    setViewMode('portal');
    setCurrentTab('dashboard');
    api.getNotifications().then(setNotifications).catch(console.error);
  };

  const handleLogout = async () => {
    await api.logout();
    setCustomer(null);
    setAccounts([]);
    setIsAuthenticated(false);
    setViewMode('public');
    setCurrentTab('dashboard');
  };

  const refreshAccountData = async () => {
    try {
      const [accs, notifs] = await Promise.all([
        api.getAccounts(),
        api.getNotifications(),
      ]);
      setAccounts(accs);
      setNotifications(notifs);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || !frontCaptured || !backCaptured) return;
    setDepositSubmitting(true);
    setTimeout(() => {
      setDepositSubmitting(false);
      setDepositSuccess(true);
      refreshAccountData();
    }, 1500);
  };

  const resetMobileDeposit = () => {
    setDepositAmount('');
    setFrontCaptured(false);
    setBackCaptured(false);
    setDepositSuccess(false);
    setShowMobileDepositModal(false);
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
        <div className="text-center space-y-4">
          <UsBankLogo size="xl" className="mx-auto" />
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0C2340] justify-center">
            <div className="w-4 h-4 border-2 border-[#005A9C] border-t-transparent rounded-full animate-spin"></div>
            Connecting to U.S. Bank Secure Systems...
          </div>
        </div>
      </div>
    );
  }

  // If not signed in, show public landing home page with login modal
  if (!isAuthenticated || !customer) {
    return <PublicHomePage onLoginSuccess={handleLoginSuccess} />;
  }

  // If signed in, but user toggled to view the public site
  if (viewMode === 'public') {
    return (
      <div>
        <div className="bg-[#0C2340] text-white py-2.5 px-4 sm:px-8 text-xs flex items-center justify-between sticky top-0 z-50 border-b border-[#001830] shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              Secure session active for <strong>Justin Jefferson</strong> (Client ID: 10482)
            </span>
          </div>
          <button
            onClick={() => setViewMode('portal')}
            className="bg-white text-[#0C2340] hover:bg-slate-100 px-3.5 py-1 rounded-lg font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            Return to Banking Portal <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <PublicHomePage onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col antialiased pb-16 lg:pb-0">
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <NavigationSidebar
            currentTab={currentTab}
            onNavigate={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onLogout={handleLogout}
            unreadNotificationsCount={unreadCount}
            customer={customer}
            onOpenHelp={() => setShowHelpModal(true)}
          />
        </div>

        {/* Mobile Sidebar Overlay Drawer */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] bg-[#0C2340] z-10 shadow-2xl">
              <NavigationSidebar
                currentTab={currentTab}
                onNavigate={(tab) => {
                  setCurrentTab(tab);
                  setMobileNavOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onLogout={handleLogout}
                unreadNotificationsCount={unreadCount}
                customer={customer}
                onOpenHelp={() => {
                  setMobileNavOpen(false);
                  setShowHelpModal(true);
                }}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <HeaderBar
            customer={customer}
            currentTab={currentTab}
            onToggleMobileNav={() => setMobileNavOpen(true)}
            onNavigate={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onLogout={handleLogout}
            notifications={notifications}
            onOpenHelp={() => setShowHelpModal(true)}
            onViewPublicSite={() => setViewMode('public')}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {currentTab === 'dashboard' && (
              <Dashboard
                customer={customer}
                accounts={accounts}
                onNavigate={setCurrentTab}
                onSelectTx={setActiveTxDetail}
                onRefreshData={refreshAccountData}
                onLogout={handleLogout}
                onOpenHelp={() => setShowHelpModal(true)}
              />
            )}

            {currentTab === 'plan-track' && (
              <PlanAndTrackView
                customer={customer}
                accounts={accounts}
                isAuthenticated={isAuthenticated}
                onNavigateToTransfers={() => setCurrentTab('transfers')}
                onSelectTx={setActiveTxDetail}
              />
            )}

            {currentTab === 'accounts' && (
              <AccountOverview
                accounts={accounts}
                onNavigateToTransfers={() => setCurrentTab('transfers')}
                onNavigateToTransactions={() => setCurrentTab('transactions')}
                onSelectTx={setActiveTxDetail}
                onRefreshAccounts={refreshAccountData}
              />
            )}

            {currentTab === 'transactions' && <TransactionsPage />}

            {currentTab === 'transfers' && (
              <TransfersPage accounts={accounts} onTransferSuccess={refreshAccountData} />
            )}

            {currentTab === 'statements' && <StatementsPage />}

            {currentTab === 'notifications' && <NotificationsPage onNavigate={setCurrentTab} />}

            {currentTab === 'security' && <SecurityCenter />}

            {currentTab === 'profile' && (
              <ProfilePage
                customer={customer}
                onCustomerUpdate={setCustomer}
                onLogout={handleLogout}
                onNavigateToSecurity={() => setCurrentTab('security')}
              />
            )}
          </main>

          {/* Official Regulatory & Legal Footer */}
          <footer className="mt-auto py-6 px-6 border-t border-[#E2E8F0] bg-white text-slate-500 text-xs">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <EqualHousingLenderIcon className="w-4 h-4 text-slate-500" />
                <span className="font-semibold text-slate-700">Member FDIC | Equal Housing Lender</span>
              </div>
              <div className="text-slate-500">
                © 2026 U.S. Bank National Association. All rights reserved.
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM NAVIGATION BAR (< 1024px) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0C2340] border-t border-[#001830] z-40 px-2 py-1.5 flex items-center justify-around shadow-2xl select-none">
        <button
          onClick={() => {
            setCurrentTab('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
            currentTab === 'dashboard' ? 'text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Home className={`w-5 h-5 ${currentTab === 'dashboard' ? 'text-[#005A9C]' : ''}`} />
          <span>Home</span>
        </button>

        <button
          onClick={() => {
            setCurrentTab('transfers');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
            currentTab === 'transfers' ? 'text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowRightLeft className={`w-5 h-5 ${currentTab === 'transfers' ? 'text-[#005A9C]' : ''}`} />
          <span>Transfer & Pay</span>
        </button>

        {/* Center Deposit Button */}
        <button
          onClick={() => setShowMobileDepositModal(true)}
          className="flex flex-col items-center gap-1 p-1 text-[10px] font-bold text-white relative -top-2"
        >
          <div className="w-11 h-11 rounded-full bg-[#005A9C] text-white flex items-center justify-center shadow-lg border-2 border-[#0C2340]">
            <Camera className="w-5 h-5" />
          </div>
          <span>Deposit</span>
        </button>

        <button
          onClick={() => {
            setCurrentTab('plan-track');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
            currentTab === 'plan-track' ? 'text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <PieChart className={`w-5 h-5 ${currentTab === 'plan-track' ? 'text-[#005A9C]' : ''}`} />
          <span>Plan</span>
        </button>

        <button
          onClick={() => setMobileNavOpen(true)}
          className="flex flex-col items-center gap-1 p-1.5 rounded-lg text-[10px] font-semibold text-slate-400 hover:text-white"
        >
          <Menu className="w-5 h-5" />
          <span>Menu</span>
        </button>
      </div>

      {/* MOBILE CHECK DEPOSIT MODAL */}
      {showMobileDepositModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#005A9C]" />
                <h3 className="text-base font-bold text-slate-900">Mobile Check Deposit</h3>
              </div>
              <button onClick={resetMobileDeposit} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            {depositSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Check Successfully Submitted</h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Deposit of <strong>${parseFloat(depositAmount || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong> has been received for processing. Funds will be credited to your account according to standard U.S. Bank funds availability schedules.
                </p>
                <button
                  onClick={resetMobileDeposit}
                  className="mt-3 px-6 py-2.5 bg-[#005A9C] text-white font-bold rounded-xl"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleDepositSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Deposit To Account
                  </label>
                  <select
                    value={depositAccount}
                    onChange={(e) => setDepositAccount(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="acc_checking_4821">Premium Checking •••• 4821</option>
                    <option value="acc_savings_6194">High-Yield Savings •••• 6194</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Check Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.00"
                    required
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold font-mono tabular-nums"
                  />
                </div>

                {/* Front & Back Check Photo Capture Viewfinders */}
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setFrontCaptured(!frontCaptured)}
                    className={`p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      frontCaptured
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-slate-300 hover:border-[#005A9C] bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="font-bold text-[11px]">
                      {frontCaptured ? 'Front Captured' : 'Front of Check'}
                    </span>
                    <span className="text-[9px] text-slate-400 mt-0.5">Tap to snap</span>
                  </div>

                  <div
                    onClick={() => setBackCaptured(!backCaptured)}
                    className={`p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      backCaptured
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-slate-300 hover:border-[#005A9C] bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="font-bold text-[11px]">
                      {backCaptured ? 'Back Captured' : 'Back of Check'}
                    </span>
                    <span className="text-[9px] text-slate-400 mt-0.5">Endorsed</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-[#0C2340]">
                  <strong>Endorsement Requirement:</strong> Sign back and write &quot;For mobile deposit only at U.S. Bank&quot;.
                </div>

                <button
                  type="submit"
                  disabled={depositSubmitting || !depositAmount || !frontCaptured || !backCaptured}
                  className="w-full py-3 bg-[#005A9C] hover:bg-[#004578] text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {depositSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying Check Alignment...</span>
                    </>
                  ) : (
                    <span>Submit Deposit</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Global Transaction Details Modal */}
      <TransactionDetailsPanel
        transaction={activeTxDetail}
        onClose={() => setActiveTxDetail(null)}
      />

      {/* 24/7 Client Support Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-xs space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <UsBankLogo size="sm" variant="dark" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Executive Relationship Concierge</h3>
                  <p className="text-[11px] text-slate-500">Dedicated assistance for Justin Jefferson (10482)</p>
                </div>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3.5">
                <Phone className="w-5 h-5 text-[#005A9C] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 text-sm">24/7 Dedicated Client Concierge</div>
                  <div className="font-mono text-sm text-[#005A9C] font-extrabold mt-0.5">
                    1-800-USBANKS (1-800-872-2657)
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Priority queuing with identity pre-verification for Justin Jefferson.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
                <Building2 className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">Assigned Private Banker</div>
                  <div className="text-slate-700 font-semibold mt-0.5">David Thornton, Senior Vice President</div>
                  <p className="text-[11px] text-slate-500">
                    Nicollet Mall Private Client Group • Minneapolis, MN
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">Primary Branch & Concierge ATM</div>
                  <p className="text-slate-600 mt-0.5">800 Nicollet Mall, Suite 100, Minneapolis, MN 55402</p>
                  <p className="text-[11px] text-slate-400">Full deposit automation, wire execution & notary</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-5 py-2.5 bg-[#005A9C] hover:bg-[#004578] text-white font-bold rounded-xl transition-colors shadow-xs"
              >
                Close Concierge Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
