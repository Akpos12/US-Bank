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
  Building2,
  Lock,
  ChevronRight,
  ExternalLink,
  PieChart,
} from 'lucide-react';
import { Customer } from '../types/banking.ts';

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
    { id: 'plan-track', label: 'Plan & Track', icon: PieChart },
    { id: 'accounts', label: 'Accounts Portfolio', icon: CreditCard },
    { id: 'transactions', label: 'Transactions & Ledger', icon: Receipt },
    { id: 'transfers', label: 'Transfers & Payments', icon: ArrowRightLeft },
    { id: 'statements', label: 'eStatements & Tax', icon: FileText },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null,
    },
    { id: 'security', label: 'Security Center', icon: Shield },
    { id: 'profile', label: 'Customer Profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-[#002855] text-white flex flex-col justify-between shrink-0 min-h-screen border-r border-[#001f3f] select-none">
      {/* Brand & Logo Header */}
      <div>
        <div className="p-6 border-b border-blue-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center font-extrabold text-2xl tracking-tight text-white select-none">
              <span
                style={{ backgroundColor: '#da291c', color: 'white', padding: '2px 7px', borderRadius: '4px', marginRight: '3px' }}
                className="text-base font-black uppercase tracking-tight"
              >
                us
              </span>
              <span>bank</span>
            </div>
          </div>
        </div>

        {/* User Mini Profile Badge */}
        <div
          onClick={() => onNavigate('profile')}
          className="mx-3 mt-4 p-3 rounded-2xl bg-blue-900/40 hover:bg-blue-900/60 border border-blue-800/40 cursor-pointer transition-colors flex items-center gap-3"
        >
          <img
            src={customer.avatarUrl || '/avatar.jpg'}
            alt={customer.name}
            onError={(e) => {
              e.currentTarget.src = '/avatar.jpg';
            }}
            className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/20"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate">{customer.name}</div>
            <div className="text-[11px] text-blue-200 font-mono truncate">ID: {customer.id}</div>
          </div>
          <ChevronRight className="w-4 h-4 text-blue-300 shrink-0" />
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 mt-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-[#002855] shadow-sm font-bold'
                    : 'text-blue-100 hover:text-white hover:bg-blue-900/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#002855]' : 'text-blue-300'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-[#cc0000] text-white' : 'bg-[#cc0000] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Auxiliary Links & Sign Out */}
      <div className="p-4 border-t border-blue-900/60 space-y-2">
        <button
          onClick={onOpenHelp}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-blue-200 hover:text-white hover:bg-blue-900/40 transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-blue-300" />
          <span>Help & 24/7 Support</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-red-200 hover:text-white hover:bg-red-950/40 transition-colors"
        >
          <LogOut className="w-4 h-4 text-red-400" />
          <span>Sign Out Session</span>
        </button>

        <div className="pt-2 text-[10px] text-blue-300 text-center font-mono">
          US Bank TLS • Member FDIC
        </div>
      </div>
    </aside>
  );
};
