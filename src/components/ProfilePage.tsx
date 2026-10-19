import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Bell,
  Sliders,
  CheckCircle2,
  Lock,
  Save,
  LogOut,
  AlertCircle,
  Building,
} from 'lucide-react';
import { Customer } from '../types/banking.ts';
import { api } from '../services/api.ts';

interface ProfilePageProps {
  customer: Customer;
  onCustomerUpdate: (updated: Customer) => void;
  onLogout: () => void;
  onNavigateToSecurity: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  customer,
  onCustomerUpdate,
  onLogout,
  onNavigateToSecurity,
}) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'preferences' | 'notifications'>('personal');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState(customer.email);
  const [phone, setPhone] = useState(customer.phone);
  const [street, setStreet] = useState(customer.address.street);
  const [city, setCity] = useState(customer.address.city);
  const [state, setState] = useState(customer.address.state);
  const [zip, setZip] = useState(customer.address.zip);

  // Preferences State
  const [dailyLimit, setDailyLimit] = useState(customer.preferences.dailyTransferLimit);
  const [paperless, setPaperless] = useState(customer.preferences.paperlessStatements);
  const [emailAlerts, setEmailAlerts] = useState(customer.preferences.emailAlerts);
  const [smsAlerts, setSmsAlerts] = useState(customer.preferences.smsAlerts);
  const [sessionTimeout, setSessionTimeout] = useState(customer.preferences.sessionTimeoutMinutes);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const res = await api.updateCustomer({
        email,
        phone,
        address: { street, city, state, zip },
        preferences: {
          ...customer.preferences,
          dailyTransferLimit: Number(dailyLimit),
          paperlessStatements: paperless,
          emailAlerts,
          smsAlerts,
          sessionTimeoutMinutes: Number(sessionTimeout),
        },
      });

      onCustomerUpdate(res.customer);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner / Customer Identity Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-blue-50 shadow-md">
            <img
              src={customer.avatarUrl || '/avatar.jpg'}
              alt={customer.name}
              onError={(e) => {
                e.currentTarget.src = '/avatar.jpg';
              }}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white" title="Active Relationship">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-black text-slate-900">{customer.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#002855] border border-blue-200">
                  {customer.accountType}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Customer ID: <span className="font-mono font-bold text-slate-700">{customer.id}</span> • Member Since {customer.memberSince}
              </p>
            </div>

            <div className="mt-3 sm:mt-0 flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {customer.accountStatus} Account
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600 justify-center sm:justify-start">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{customer.email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 justify-center sm:justify-start">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="font-mono">{customer.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 justify-center sm:justify-start">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{customer.address.city}, {customer.address.state}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('personal')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'personal'
              ? 'bg-[#002855] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Personal Information
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'preferences'
              ? 'bg-[#002855] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Account Preferences
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'notifications'
              ? 'bg-[#002855] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Notification Settings
        </button>
      </div>

      {/* Notification Toast */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile preferences saved and synchronized with US Bank central records.</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        {activeTab === 'personal' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Primary Contact & Mailing Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002855]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Phone (SMS Enabled)</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#002855]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Residential Street Address</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002855]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002855]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002855]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Zip Code</label>
                  <input
                    type="text"
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#002855]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Account Limits & Operational Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Daily Electronic Transfer Limit (USD)</label>
                <input
                  type="number"
                  step="1000"
                  min="5000"
                  max="100000"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#002855]"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Maximum authorized per 24-hour cycle</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Inactivity Session Timeout</label>
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002855]"
                >
                  <option value={15}>15 minutes (High Security)</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>

              <div className="sm:col-span-2 pt-2">
                <label className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paperless}
                    onChange={(e) => setPaperless(e.target.checked)}
                    className="w-4 h-4 text-[#002855] rounded focus:ring-[#002855]"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Enroll in Paperless eStatements</span>
                    <span className="text-[11px] text-slate-500">
                      Receive monthly statements securely online. Eco-friendly and instantly archived.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Real-Time Security & Financial Alerts
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 text-[#002855] rounded focus:ring-[#002855]"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Email Transaction & Deposit Alerts</span>
                  <span className="text-[11px] text-slate-500">
                    Receive email receipts for any incoming credit exceeding $500 or withdrawals over $100.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="w-4 h-4 text-[#002855] rounded focus:ring-[#002855]"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">SMS Urgent Security Alerts</span>
                  <span className="text-[11px] text-slate-500">
                    Instant text notifications for unrecognized device logins, password resets, and high-value wire transfers.
                  </span>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Action Row */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onNavigateToSecurity}
              className="px-3.5 py-2 text-xs font-semibold text-[#002855] hover:bg-blue-50 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Shield className="w-4 h-4" /> Go to Security Center
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#002855] hover:bg-[#001f3f] text-white text-xs font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Changes...' : 'Save Profile Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
