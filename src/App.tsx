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
import { Phone, ShieldCheck, X, Building2, MapPin, ExternalLink, ArrowRight } from 'lucide-react';

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

  const checkInitialAuth = async () => {
    setIsLoadingAuth(true);
    const token = api.getToken();
    if (!token) {
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
      return;
    }

    try {
      const [meRes, notifRes] = await Promise.all([
        api.getMe(),
        api.getNotifications(),
      ]);
      setCustomer(meRes.customer);
      setAccounts(meRes.accounts);
      setNotifications(notifRes);
      setIsAuthenticated(true);
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
    // Fetch notifications
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

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="flex items-center font-extrabold text-3xl tracking-tight text-[#0c2340] justify-center select-none">
            <span
              style={{ backgroundColor: '#da291c', color: 'white', padding: '3px 8px', borderRadius: '5px', marginRight: '3px' }}
              className="text-xl font-black"
            >
              us
            </span>
            <span>bank</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0c2340]">
            <div className="w-4 h-4 border-2 border-[#0c2340] border-t-transparent rounded-full animate-spin"></div>
            Connecting to U.S. Bank Secure Portal...
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
        <div className="bg-[#0c2340] text-white py-2.5 px-4 sm:px-8 text-xs flex items-center justify-between sticky top-0 z-50 border-b border-[#133a6f] shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              Secure session active for <strong>Justin Jefferson</strong> (Premium Checking •••• 4821)
            </span>
          </div>
          <button
            onClick={() => setViewMode('portal')}
            className="bg-white text-[#0c2340] hover:bg-slate-100 px-3.5 py-1 rounded-lg font-bold transition-all shadow-xs flex items-center gap-1.5"
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
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
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
            <div className="relative w-72 max-w-[80vw] bg-[#002855] z-10">
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

          {/* Persistent Sub-Footer with Compliance & FDIC Badge */}
          <footer className="mt-auto py-5 px-6 border-t border-slate-200 bg-white text-slate-500 text-xs">
            <div className="max-w-7xl mx-auto text-center font-medium">
              Member FDIC | Equal Housing Lender © 2026 U.S. Bank
            </div>
          </footer>
        </div>
      </div>

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
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#002855] flex items-center justify-center font-black">
                  USB
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Executive Relationship Concierge</h3>
                  <p className="text-[11px] text-slate-500">Dedicated assistance for Justin Jefferson</p>
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
                <Phone className="w-5 h-5 text-[#002855] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 text-sm">24/7 Dedicated Concierge</div>
                  <div className="font-mono text-sm text-[#002855] font-extrabold mt-0.5">
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
                className="px-5 py-2.5 bg-[#002855] hover:bg-[#001f3f] text-white font-bold rounded-xl transition-colors shadow-xs"
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
