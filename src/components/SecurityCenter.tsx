import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Key,
  Smartphone,
  Laptop,
  Globe,
  Lock,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Shield,
  Activity,
} from 'lucide-react';
import { SecuritySession } from '../types/banking.ts';
import { api } from '../services/api.ts';

export const SecurityCenter: React.FC = () => {
  const [sessions, setSessions] = useState<SecuritySession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [terminating, setTerminating] = useState(false);
  const [terminateMsg, setTerminateMsg] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      const data = await api.getSecuritySessions();
      setSessions(data);
    } catch (e) {
      console.error('Failed to load security sessions:', e);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleTerminateOthers = async () => {
    setTerminating(true);
    setTerminateMsg(null);
    setSessionError(null);
    try {
      const res = await api.terminateOtherSessions();
      setSessions(res.remaining);
      setTerminateMsg(res.message);
      setTimeout(() => setTerminateMsg(null), 4000);
    } catch (err: any) {
      setSessionError(err.message || 'Failed to terminate other sessions.');
      setTimeout(() => setSessionError(null), 4000);
    } finally {
      setTerminating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must contain at least 8 characters.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await api.changePassword(currentPassword, newPassword);
      setPasswordSuccess(res.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Security & Privacy Center</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your account defenses, two-factor authentication, active login sessions, and credential security.
        </p>
      </div>

      {/* Security Health Score Banner */}
      <div className="bg-gradient-to-r from-[#002855] to-[#001f3f] rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative w-16 h-16 rounded-full bg-white/10 border-4 border-emerald-400 flex items-center justify-center shrink-0">
            <span className="text-xl font-black font-mono">96</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">Security Posture: Excellent</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Strong Defense
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-md">
              Justin Jefferson’s portal is protected with hardware-bound 2FA, 256-bit TLS transport encryption, and automated anomaly detection.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs shrink-0 w-full sm:w-auto">
          <div className="bg-white/10 px-3 py-2 rounded-lg border border-white/10 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>2FA Active</span>
          </div>
          <div className="bg-white/10 px-3 py-2 rounded-lg border border-white/10 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Biometrics On</span>
          </div>
          <div className="bg-white/10 px-3 py-2 rounded-lg border border-white/10 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>TLS 1.3 Strict</span>
          </div>
          <div className="bg-white/10 px-3 py-2 rounded-lg border border-white/10 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>FDIC Protected</span>
          </div>
        </div>
      </div>

      {/* Grid: Active Sessions and Password Change */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Sessions List */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Laptop className="w-4 h-4 text-[#002855]" />
                Authorized Device Sessions
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Review active devices currently logged into your US Bank account.
              </p>
            </div>
            <button
              onClick={handleTerminateOthers}
              disabled={terminating || sessions.length <= 1}
              className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all disabled:opacity-40"
            >
              {terminating ? 'Terminating...' : 'Sign Out Others'}
            </button>
          </div>

          {terminateMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{terminateMsg}</span>
            </div>
          )}

          {sessionError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{sessionError}</span>
            </div>
          )}

          <div className="space-y-3">
            {loadingSessions ? (
              <div className="text-center py-8 text-xs text-slate-400">Loading session telemetry...</div>
            ) : (
              sessions.map((sess) => (
                <div
                  key={sess.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                    sess.isCurrent
                      ? 'border-[#002855] bg-blue-50/40 shadow-2xs'
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        sess.isCurrent ? 'bg-[#002855] text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {sess.device.includes('iPhone') || sess.device.includes('iPad') ? (
                        <Smartphone className="w-4 h-4" />
                      ) : (
                        <Laptop className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{sess.device}</span>
                        {sess.isCurrent && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {sess.browser} • {sess.location}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        IP: {sess.ip} • {sess.lastActive}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Change Password Form */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-[#002855]" />
              Update Banking Password
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Secure your account credentials using cryptographic hash storage.
            </p>
          </div>

          {passwordSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Current Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002855]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">New Password (Min 8 chars)</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter strong new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002855]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Re-type new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002855]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={passwordLoading || !newPassword}
                className="w-full py-2.5 px-4 rounded-xl bg-[#002855] hover:bg-[#001f3f] text-white font-bold transition-all disabled:opacity-50 shadow-xs"
              >
                {passwordLoading ? 'Encrypting & Updating...' : 'Save New Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
