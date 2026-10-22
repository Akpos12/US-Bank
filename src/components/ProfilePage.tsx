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
      setError(err.message || 'Failed to update personal details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner / Customer Identity Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
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
          <span
            className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white"
            title="Verified Client Relationship"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-black text-[#0C2340]">{customer.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#005A9C] border border-blue-200">
                  {customer.accountType}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Client ID: <span className="font-mono font-bold text-slate-700">{customer.id}</span> • Member Since {customer.memberSince}
              </p>
            </div>

            <div className="mt-3 sm:mt-0 flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {customer.accountStatus} Relationship
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600 justify-center sm:justify-start">
              <Mail className="w-4 h-4 text-[#005A9C]" />
              <span>{customer.email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 justify-center sm:justify-start">
              <Phone className="w-4 h-4 text-[#005A9C]" />
              <span className="font-mono">{customer.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 justify-center sm:justify-start">
              <MapPin className="w-4 h-4 text-[#005A9C]" />
              <span>
                {customer.address.city}, {customer.address.state}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('personal')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'personal'
              ? 'bg-[#005A9C] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Personal Details & Contact
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'preferences'
              ? 'bg-[#005A9C] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Transfer Limits & Statements
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'notifications'
              ? 'bg-[#005A9C] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Security & Delivery Alerts
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-6 sm:p-8">
        {saveSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profile and security preferences successfully updated and saved.</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Primary Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Direct Mobile Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Residential Street Address
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">ZIP Code</label>
                  <input
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Daily Transfer Limit ($)
                </label>
                <input
                  type="number"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-900">Paperless eStatements</div>
                  <div className="text-[11px] text-slate-500">Receive digital statements and tax forms</div>
                </div>
                <input
                  type="checkbox"
                  checked={paperless}
                  onChange={(e) => setPaperless(e.target.checked)}
                  className="w-4 h-4 text-[#005A9C] rounded"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-900">Session Inactivity Timeout (Minutes)</div>
                  <div className="text-[11px] text-slate-500">Auto sign-out time for security</div>
                </div>
                <input
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(Number(e.target.value))}
                  className="w-24 p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-center"
                />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-900">Email Real-Time Security Alerts</div>
                  <div className="text-[11px] text-slate-500">Receive transaction notices and verification alerts</div>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 text-[#005A9C] rounded"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-900">SMS Push Alerts</div>
                  <div className="text-[11px] text-slate-500">Instant texts for debits over $500</div>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="w-4 h-4 text-[#005A9C] rounded"
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onNavigateToSecurity}
              className="text-xs font-bold text-[#005A9C] hover:underline flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4" /> Go to Security Center →
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#005A9C] hover:bg-[#004578] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
