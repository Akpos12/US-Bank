import React, { useState } from 'react';
import {
  Bell,
  Search,
  HelpCircle,
  LogOut,
  User,
  ShieldCheck,
  ChevronDown,
  X,
  CreditCard,
  ArrowRightLeft,
  PieChart,
  LayoutDashboard,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { Customer, BankNotification } from '../types/banking.ts';

interface HeaderBarProps {
  customer: Customer;
  currentTab: string;
  onToggleMobileNav: () => void;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
  notifications: BankNotification[];
  onOpenHelp: () => void;
  onViewPublicSite?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  customer,
  currentTab,
  onToggleMobileNav,
  onNavigate,
  onLogout,
  notifications,
  onOpenHelp,
  onViewPublicSite,
}) => {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadNotifs = notifications.filter((n) => !n.isRead);

  // Main navigation categories
  const navCategories = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts', label: 'Accounts', icon: CreditCard },
    { id: 'transfers', label: 'Transfer & Pay', icon: ArrowRightLeft },
    { id: 'plan-track', label: 'Plan & Learn', icon: PieChart },
  ];

  return (
    <>
      <div className="sticky top-0 z-40 bg-white">
        {/* Main White Header Bar inspired by reference screenshot */}
        <header className="px-3 sm:px-6 py-2.5 max-w-7xl mx-auto flex items-center justify-between min-h-[64px] select-none">
          {/* Left: 3-bar Hamburger Menu Button + Category Tabs for Desktop */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1">
            <button
              onClick={onToggleMobileNav}
              className="p-1.5 -ml-1.5 text-[#40455A] hover:text-[#0C2340] rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Menu"
              aria-label="Open Navigation Menu"
            >
              {/* Clean 3-bar hamburger matching reference screenshot */}
              <svg
                className="w-7 h-7 sm:w-8 sm:h-8"
                viewBox="0 0 28 28"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              >
                <line x1="4" y1="7" x2="24" y2="7" />
                <line x1="4" y1="14" x2="24" y2="14" />
                <line x1="4" y1="21" x2="24" y2="21" />
              </svg>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1 pl-2 border-l border-slate-200">
              {navCategories.map((cat) => {
                const isActive = currentTab === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onNavigate(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                      isActive
                        ? 'text-[#0C2340] font-bold bg-slate-100'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#005A9C] rounded-full"></span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Center: Official Centered U.S. Bank Logo from uploaded image */}
          <div className="flex items-center justify-center shrink-0 px-2">
            <img
              src="/assets/usbank_logo_transparent.png"
              alt="U.S. Bank"
              className="h-8 sm:h-10 md:h-11 w-auto object-contain cursor-pointer select-none transition-transform hover:scale-[1.01]"
              onClick={() => onNavigate('dashboard')}
              title="U.S. Bank Online Banking"
            />
          </div>

          {/* Right: Controls & Log out button matching reference image */}
          <div className="flex items-center justify-end gap-1 sm:gap-2 flex-1">
            {/* Quick Search */}
            <button
              onClick={() => setShowSearchModal(true)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Search"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
                title="Notifications"
                aria-label="Alerts"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#DA291C] rounded-full ring-2 ring-white"></span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in zoom-in-95 duration-150">
                  <div className="p-3.5 bg-[#0C2340] text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold">Alerts & Messages</span>
                    </div>
                    <button
                      onClick={() => {
                        setShowNotifDropdown(false);
                        onNavigate('notifications');
                      }}
                      className="text-[11px] font-bold text-blue-200 hover:text-white hover:underline"
                    >
                      View All ({notifications.length})
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
                    {notifications.slice(0, 4).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          setShowNotifDropdown(false);
                          onNavigate('notifications');
                        }}
                        className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                          !n.isRead ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-[11px]">{n.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(n.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                    <button
                      onClick={() => {
                        setShowNotifDropdown(false);
                        onNavigate('notifications');
                      }}
                      className="text-xs font-bold text-[#005A9C] hover:underline"
                    >
                      Open Notification Center
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Profile and Security Settings"
              >
                <img
                  src={customer.avatarUrl || '/avatar.jpg'}
                  alt={customer.name}
                  onError={(e) => {
                    e.currentTarget.src = '/avatar.jpg';
                  }}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-300"
                />
                <span className="hidden lg:inline text-xs font-semibold text-slate-800">
                  {customer.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-60 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 z-50 p-2 space-y-1 text-xs animate-in zoom-in-95 duration-150">
                  <div className="p-3 border-b border-slate-100">
                    <div className="font-bold text-slate-900">{customer.name}</div>
                    <div className="text-[11px] font-mono text-slate-500">Client ID: {customer.id}</div>
                    <div className="text-[10px] text-[#005A9C] font-semibold mt-0.5">
                      Private Wealth Banking Tier
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onNavigate('profile');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 font-medium text-slate-700 flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-[#005A9C]" />
                    Profile & Security
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onNavigate('security');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 font-medium text-slate-700 flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4 text-[#005A9C]" />
                    Security Center
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onNavigate('statements');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 font-medium text-slate-700 flex items-center gap-2"
                  >
                    <CreditCard className="w-4 h-4 text-[#005A9C]" />
                    Statements & Documents
                  </button>

                  {onViewPublicSite && (
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onViewPublicSite();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 font-medium text-slate-700 flex items-center gap-2 border-t border-slate-100"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                      U.S. Bank Public Portal
                    </button>
                  )}

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 font-bold text-[#DA291C] flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-[#DA291C]" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Prominent Right Action: "Log out" / "Sign Out" styled like reference image */}
            <button
              onClick={onLogout}
              className="text-[#395ACE] hover:text-[#162B7C] font-bold text-sm sm:text-base px-2 py-1 transition-colors cursor-pointer select-none"
              title="Safely end your banking session"
            >
              Log out
            </button>
          </div>
        </header>

        {/* Authentic Dark Blue Horizontal Strip matching the uploaded reference image */}
        <div
          className="h-3 sm:h-3.5 w-full shadow-inner"
          style={{
            backgroundImage:
              'linear-gradient(180deg, #585d85 0%, #314287 25%, #162b7c 55%, #081e74 100%)',
          }}
        />
      </div>

      {/* Quick Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 shadow-2xl border border-slate-200 text-xs space-y-3 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-sm">Search U.S. Bank Services & Accounts</span>
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions, routing numbers, Zelle®, statements..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                autoFocus
              />
            </div>
            <div className="pt-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Common Shortcuts
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setShowSearchModal(false);
                    onNavigate('transfers');
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-50 flex items-center justify-between text-slate-700"
                >
                  <span className="font-semibold">Send Money with Zelle®</span>
                  <span className="text-[10px] text-[#7414CA] font-bold">Transfer & Pay</span>
                </button>
                <button
                  onClick={() => {
                    setShowSearchModal(false);
                    onNavigate('accounts');
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-50 flex items-center justify-between text-slate-700"
                >
                  <span className="font-semibold">Routing Transit Numbers & ABA Credentials</span>
                  <span className="text-[10px] text-[#005A9C] font-bold">Accounts</span>
                </button>
                <button
                  onClick={() => {
                    setShowSearchModal(false);
                    onNavigate('statements');
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-50 flex items-center justify-between text-slate-700"
                >
                  <span className="font-semibold">eStatements & Tax Documents</span>
                  <span className="text-[10px] text-slate-500 font-bold">Documents</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
