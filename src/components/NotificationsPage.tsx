import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRightLeft,
  FileText,
  CreditCard,
  CheckCheck,
  Filter,
} from 'lucide-react';
import { BankNotification } from '../types/banking.ts';
import { api } from '../services/api.ts';

interface NotificationsPageProps {
  onNavigate: (tab: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState<BankNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'transaction' | 'security' | 'statement'>('all');
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (e) {
      console.error('Failed to load notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      const updated = await api.markNotificationRead(id);
      setNotifications(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const updated = await api.markAllNotificationsRead();
      setNotifications(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'transaction') return n.category === 'transaction';
    if (filter === 'security') return n.category === 'security';
    if (filter === 'statement') return n.category === 'statement';
    return true;
  });

  const getIcon = (category: string) => {
    switch (category) {
      case 'transaction':
        return <ArrowRightLeft className="w-4 h-4 text-emerald-600" />;
      case 'security':
        return <ShieldAlert className="w-4 h-4 text-amber-600" />;
      case 'statement':
        return <FileText className="w-4 h-4 text-[#002855]" />;
      default:
        return <CreditCard className="w-4 h-4 text-slate-600" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Notification Center</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#cc0000] text-white">
                {unreadCount} New
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time automated alerts for deposits, outgoing transfers, monthly statements, and sign-ins.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filter === 'all' ? 'bg-[#002855] text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Alerts ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filter === 'unread' ? 'bg-[#002855] text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('transaction')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filter === 'transaction' ? 'bg-[#002855] text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Transactions
        </button>
        <button
          onClick={() => setFilter('security')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filter === 'security' ? 'bg-[#002855] text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Security
        </button>
        <button
          onClick={() => setFilter('statement')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filter === 'statement' ? 'bg-[#002855] text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Statements
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading notifications...</div>
        ) : filteredNotifs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No notifications match this filter.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifs.map((n) => (
              <div
                key={n.id}
                className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                  !n.isRead ? 'bg-blue-50/40 hover:bg-blue-50/60' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(n.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#cc0000]"></span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-mono">
                      <span>{new Date(n.timestamp).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {n.actionUrl && (
                        <>
                          <span>•</span>
                          <button
                            onClick={() => {
                              if (!n.isRead) handleMarkAsRead(n.id);
                              onNavigate(n.actionUrl?.replace('/', '') || 'dashboard');
                            }}
                            className="font-sans font-bold text-[#002855] hover:underline"
                          >
                            View details →
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-[#002855] shrink-0"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
