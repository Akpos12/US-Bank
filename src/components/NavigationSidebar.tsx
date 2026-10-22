import React from 'react';
import {
  LayoutDashboard,
  CreditCard,
  Receipt,
  ArrowRightLeft,
  FileText,
  Bell,
  Shield,
  User,
  HelpCircle,
  LogOut,
  ChevronRight,
  PieChart,
} from 'lucide-react';
import { Customer } from '../types/banking.ts';
import { UsBankLogo } from './UsBankLogo.tsx';

interface NavigationSidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
  unreadNotificationsCount: number;
  customer: Customer;
  onOpenHelp: () => void;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  currentTab,
  onNavigate,
  onLogout,
  unreadNotificationsCount,
  customer,
  onOpenHelp,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts', label: 'Accounts Portfolio', icon: CreditCard },
    { id: 'transfers', label: 'Transfer & Pay', icon: ArrowRightLeft },
    { id: 'plan-track', label: 'Plan & Learn', icon: PieChart },
    { id: 'transactions', label: 'Transactions & Ledger', icon: Receipt },
    { id: 'statements', label: 'eStatements & Tax', icon: FileText },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null,
    },
    { id: 'security', label: 'Security Center', icon: Shield },
    { id: 'profile', label: 'Profile & Security', icon: User },
  ];

  return (
    <aside className="w-64 bg-[#0C2340] text-white flex flex-col justify-between shrink-0 min-h-screen border-r border-[#001830] select-none">
      {/* Brand & Logo Header */}
      <div>
        <div className="p-4 border-b border-white/10 flex items-center justify-center">
          <div className="bg-white rounded-xl py-2 px-4 flex items-center justify-center shadow-xs w-full">
            <UsBankLogo size="md" />
          </div>
        </div>

        {/* User Mini Profile Badge */}
        <div
          onClick={() => onNavigate('profile')}
          className="mx-3 mt-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-all flex items-center gap-3"
          title="View Profile & Security"
        >
          <img
            src={customer.avatarUrl || '/avatar.jpg'}
            alt={customer.name}
            onError={(e) => {
              e.currentTarget.src = '/avatar.jpg';
            }}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white/20"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate">{customer.name}</div>
            <div className="text-[11px] text-slate-300 font-mono truncate">ID: {customer.id}</div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 mt-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#005A9C] text-white shadow-sm font-bold'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#DA291C] text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Auxiliary Links & Sign Out */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <button
          onClick={onOpenHelp}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Customer Service</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-white hover:bg-[#DA291C]/30 transition-colors"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>Log Out</span>
        </button>

        <div className="pt-2 text-[10px] text-slate-400 text-center font-mono">
          U.S. Bank TLS • Member FDIC
        </div>
      </div>
    </aside>
  );
};
