import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Lock,
  Search,
  HelpCircle,
  LogOut,
  User,
  ShieldCheck,
  ChevronDown,
  X,
  ArrowRightLeft,
  FileText,
  Building2,
} from 'lucide-react';
import { Customer, BankNotification } from '../types/banking.ts';

interface HeaderBarProps {
  customer: Customer;
  onToggleMobileNav: () => void;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
  notifications: BankNotification[];
  onOpenHelp: () => void;
  onViewPublicSite?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  customer,
  onToggleMobileNav,
  onNavigate,
  onLogout,
  notifications,
  onOpenHelp,
  onViewPublicSite,
}) => {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.isRead);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
      {/* Left: Mobile Nav Button & Logo / Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileNav}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Official U.S. Bank logo mark for mobile / portal header */}
        <div
          onClick={onViewPublicSite}
          className="flex items-center font-extrabold text-xl tracking-tight text-[#0c2340] cursor-pointer mr-1 select-none"
          title="Visit Public Bank Home"
        >
          <span
            style={{ backgroundColor: '#da291c', color: 'white', padding: '1px 5px', borderRadius: '4px', marginRight: '2px' }}
            className="text-xs font-black"
          >
            us
          </span>
          <span>bank</span>
        </div>

        <div className="hidden sm:flex items-center gap-2 border-l border-slate-200 pl-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-bold text-slate-700">
            Online Banking
          </span>
          <span className="hidden md:inline text-slate-300">•</span>
          <span className="hidden md:inline text-xs text-slate-500 font-medium">
            Minneapolis Private Client Group
          </span>
        </div>
      </div>

      {/* Right: Security Status, Notification Bell, User Menu */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Secure Session Lock Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-Bit Encrypted Session</span>
        </div>

        {/* Support Help Button */}
        <button
          onClick={onOpenHelp}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Client Concierge Support"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#cc0000] rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in zoom-in-95 duration-150">
              <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Alerts & Messages</span>
                <button
                  onClick={() => {
                    setShowNotifDropdown(false);
                    onNavigate('notifications');
                  }}
                  className="text-[11px] font-bold text-[#002855] hover:underline"
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
                      !n.isRead ? 'bg-blue-50/40' : ''
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
                  className="text-xs font-bold text-[#002855] hover:underline"
                >
                  Open Notification Center
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <img
              src={customer.avatarUrl || '/avatar.jpg'}
              alt={customer.name}
              onError={(e) => {
                e.currentTarget.src = '/avatar.jpg';
              }}
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
            />
            <span className="hidden sm:inline text-xs font-bold text-slate-800">
              {customer.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-2 space-y-1 text-xs animate-in zoom-in-95 duration-150">
              <div className="p-2.5 border-b border-slate-100">
                <div className="font-bold text-slate-900">{customer.name}</div>
                <div className="text-[11px] font-mono text-slate-500">ID: {customer.id}</div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Premium Checking Tier</div>
              </div>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onNavigate('profile');
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 font-medium text-slate-700 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-slate-400" />
                Profile Settings
              </button>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onNavigate('security');
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 font-medium text-slate-700 flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                Security Center
              </button>

              {onViewPublicSite && (
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onViewPublicSite();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 font-medium text-slate-700 flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-slate-400" />
                  Public Banking Site
                </button>
              )}

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 font-bold text-red-600 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
