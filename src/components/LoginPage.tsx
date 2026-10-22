import React, { useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  Building2,
  HelpCircle,
  Phone,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ArrowRight,
  ShieldAlert,
  X,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { Customer, Account } from '../types/banking.ts';
import { UsBankLogo, EqualHousingLenderIcon } from './UsBankLogo.tsx';

interface LoginPageProps {
  onLoginSuccess: (customer: Customer, accounts: Account[]) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('10482');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('justin.jefferson@example.com');
  const [forgotSent, setForgotSent] = useState(false);

  // Help & Support Drawer
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.login(identifier, password, rememberMe);
      onLoginSuccess(res.customer, res.accounts);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col justify-between py-8 px-4 sm:px-6">
      {/* Top Bank Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between pb-6 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-3">
          <UsBankLogo size="lg" variant="dark" />
          <div className="hidden sm:block border-l border-slate-300 pl-3">
            <span className="text-[11px] text-slate-500 uppercase tracking-widest block font-bold">
              Private Wealth Online Banking
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#005A9C] transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-[#005A9C]" />
            <span>Customer Service</span>
          </button>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="max-w-md w-full mx-auto my-8">
        <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-xl p-8 sm:p-10 space-y-6">
          {/* Card Top Title */}
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#005A9C] flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-[#0C2340] tracking-tight">Secure Sign In</h1>
            <p className="text-xs text-slate-500">
              Access your accounts, transfers, and real-time ledger.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-[#DA291C] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Authentication Notice</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                Client ID or Registered Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Enter 10482 or email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#005A9C] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-semibold text-[#005A9C] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#005A9C] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#005A9C] focus:ring-[#005A9C] border-slate-300"
                />
                <span className="text-slate-600 font-medium">Remember My User ID</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#005A9C] hover:bg-[#004578] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to U.S. Bank</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Verification Assurance */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-500 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-Bit TLS Bank Encryption</span>
          </div>
        </div>
      </main>

      {/* Official Legal Footer */}
      <footer className="max-w-6xl w-full mx-auto pt-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <div className="flex items-center gap-2">
          <EqualHousingLenderIcon className="w-4 h-4 text-slate-500" />
          <span>Member FDIC | Equal Housing Lender</span>
        </div>
        <div>© 2026 U.S. Bank National Association. All rights reserved.</div>
      </footer>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-sm">Reset Password</span>
              <button onClick={() => setShowForgotModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            {forgotSent ? (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 space-y-2 text-center">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
                <p className="font-bold">Verification Link Dispatched</p>
                <p className="text-[11px]">Instructions have been sent to {forgotEmail}.</p>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="mt-2 px-4 py-1.5 bg-[#005A9C] text-white rounded-lg font-bold"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-slate-600">
                  Enter your registered client email to receive a secure identity verification link.
                </p>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full p-2.5 border rounded-lg"
                />
                <button
                  onClick={() => setForgotSent(true)}
                  className="w-full py-2.5 bg-[#005A9C] text-white font-bold rounded-lg"
                >
                  Send Verification Link
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-sm">Client Assistance</span>
              <button onClick={() => setShowHelpModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 space-y-1">
              <div className="font-bold text-slate-900">24/7 Priority Support</div>
              <div className="font-mono font-bold text-[#005A9C] text-sm">1-800-USBANKS (1-800-872-2657)</div>
              <p className="text-[11px] text-slate-600">Assistance with online banking access and credentials.</p>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
