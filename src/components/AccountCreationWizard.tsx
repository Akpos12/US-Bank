import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Lock,
  Wallet,
  PiggyBank,
  CreditCard,
  Building2,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Sparkles,
  X,
} from 'lucide-react';
import { UsBankLogo } from './UsBankLogo.tsx';
import confetti from 'canvas-confetti';
import { Customer, Account } from '../types/banking.ts';

interface AccountCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountCreated: (customer: Customer, accounts: Account[]) => void;
  initialAccountType?: 'checking' | 'savings' | 'credit' | 'business';
}

export const AccountCreationWizard: React.FC<AccountCreationWizardProps> = ({
  isOpen,
  onClose,
  onAccountCreated,
  initialAccountType = 'checking',
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Form State
  const [selectedType, setSelectedType] = useState<string>(initialAccountType);

  // Step 2: Personal Details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 3: Address & Identity
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('MN');
  const [zip, setZip] = useState('');
  const [dob, setDob] = useState('');
  const [ssnLast4, setSsnLast4] = useState('');
  const [income, setIncome] = useState('$100,000 - $250,000');

  // Step 4: Consent & Agreements
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeCredit, setAgreeCredit] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(true);

  // Validation errors
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate Password Strength
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score; // 0 to 4
  };

  const passwordStrength = getPasswordStrength(password);

  const accountTypes = [
    {
      id: 'checking',
      title: 'U.S. Bank Smartly® Checking',
      tagline: 'Best for daily banking, bills & debit purchases',
      badge: '$450 Cash Bonus Offer',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: Wallet,
      features: [
        'Score up to $450 with qualifying direct deposits',
        'Zelle® instant money transfers & mobile check deposit',
        'Overdraft protection with $0 transfer fees',
        'No monthly maintenance fee with qualifying activities',
      ],
    },
    {
      id: 'savings',
      title: 'U.S. Bank High-Yield Savings',
      tagline: 'Best for growing emergency reserves & wealth',
      badge: '4.50% APY Special Rate',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: PiggyBank,
      features: [
        'Competitive 4.50% Annual Percentage Yield',
        'FDIC insured up to federal maximum of $250,000',
        'Automated recurring deposit schedules',
        'Zero monthly service fee when paired with Checking',
      ],
    },
    {
      id: 'credit',
      title: 'U.S. Bank Altitude® Reserve Visa',
      tagline: 'Best for luxury travel, dining & cash back',
      badge: '50,000 Bonus Points',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: CreditCard,
      features: [
        'Earn 50,000 points after $4,500 in 90 days ($750 travel value)',
        '3X points on travel and mobile wallet spending',
        'Annual $325 automatic travel and dining credit',
        'Complimentary Priority Pass™ Select airport lounge access',
      ],
    },
    {
      id: 'business',
      title: 'U.S. Bank Business Essentials',
      tagline: 'Best for entrepreneurs, small business & commerce',
      badge: '$500 Business Incentive',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: Building2,
      features: [
        'Dedicated commercial treasury & payroll management',
        'Up to 150 free monthly business ledger transactions',
        'Free employee debit cards with customized spending limits',
        'Integration with QuickBooks, Xero, and payment gateways',
      ],
    },
  ];

  const handleStep1Next = () => {
    setError(null);
    if (!selectedType) {
      setError('Please choose an account type to begin.');
      return;
    }
    setCurrentStep(2);
  };

  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please provide your full legal name.');
      return;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile phone number.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setCurrentStep(3);
  };

  const handleStep3Next = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!street.trim() || !city.trim() || !zip.trim()) {
      setError('Please provide your complete residential street address.');
      return;
    }
    if (!dob) {
      setError('Please enter your date of birth.');
      return;
    }
    if (!ssnLast4 || ssnLast4.length !== 4 || !/^\d{4}$/.test(ssnLast4)) {
      setError('Please enter 4 digits for demo verification.');
      return;
    }

    setCurrentStep(4);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreeTerms || !agreeCredit) {
      setError('You must accept the terms of service and identity verification agreement.');
      return;
    }

    setLoading(true);

    // Simulate authentic bank provisioning
    setTimeout(() => {
      setLoading(false);
      setCurrentStep(5);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#002855', '#005A9C', '#DA291C', '#10B981'],
      });
    }, 1800);
  };

  const handleCompleteAndSignIn = () => {
    // Generate clean client model based on registration
    const newCust: Customer = {
      id: `10${Math.floor(100 + Math.random() * 900)}`,
      name: `${firstName} ${lastName}`,
      email,
      phone,
      address: {
        street,
        city,
        state,
        zip,
      },
      memberSince: '2026',
      accountType: 'Private Wealth Preferred Tier',
      accountStatus: 'Active',
      avatarUrl: '/avatar.jpg',
      preferences: {
        dailyTransferLimit: 100000,
        paperlessStatements: true,
        twoFactorEnabled: true,
        sessionTimeoutMinutes: 15,
        currency: 'USD',
        emailAlerts: true,
        smsAlerts: true,
      },
    };

    const now = new Date().toISOString();
    const newAccs: Account[] = [
      {
        id: 'acc_checking_4821',
        name: 'U.S. Bank Smartly® Checking',
        accountNumber: `48210984${ssnLast4 || '4821'}`,
        accountNumberMasked: `•••• ${ssnLast4 || '4821'}`,
        routingNumber: '091000022',
        routingNumberMasked: '•••• 0022',
        type: 'checking',
        availableBalance: 5000.0,
        ledgerBalance: 5000.0,
        openingBalance: 5000.0,
        openedDate: '2026-01-15',
        lastUpdated: now,
        currency: 'USD',
        interestRate: 0.05,
        status: 'Active',
        isPrimary: true,
      },
      {
        id: 'acc_savings_6194',
        name: 'U.S. Bank High-Yield Savings',
        accountNumber: '619488102934',
        accountNumberMasked: '•••• 6194',
        routingNumber: '091000022',
        routingNumberMasked: '•••• 0022',
        type: 'savings',
        availableBalance: 25000.0,
        ledgerBalance: 25000.0,
        openingBalance: 25000.0,
        openedDate: '2026-01-15',
        lastUpdated: now,
        currency: 'USD',
        interestRate: 4.5,
        status: 'Active',
        isPrimary: false,
      },
    ];

    onAccountCreated(newCust, newAccs);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <UsBankLogo size="sm" variant="dark" />
            <div className="border-l border-slate-200 pl-3">
              <span className="text-xs font-bold text-[#0C2340] uppercase tracking-wider block">
                Online Account Opening
              </span>
              <span className="text-[11px] text-slate-500">
                Step {currentStep} of 5 • Fast & Secure Application
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar Indicator */}
        <div className="h-1.5 w-full bg-slate-100">
          <div
            className="h-full bg-[#005A9C] transition-all duration-300"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#DA291C] shrink-0 mt-0.5" />
              <div className="font-medium">{error}</div>
            </div>
          )}

          {/* STEP 1: CHOOSE ACCOUNT TYPE */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-extrabold text-[#0C2340] tracking-tight">
                  Choose Your Account Type
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Select the product that best aligns with your financial lifestyle. You can link additional accounts anytime.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {accountTypes.map((item) => {
                  const isSelected = selectedType === item.id;
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedType(item.id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#005A9C] bg-blue-50/50 shadow-sm ring-1 ring-[#005A9C]'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              isSelected ? 'bg-[#005A9C] text-white' : 'bg-blue-50 text-[#005A9C]'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.badgeColor}`}
                          >
                            {item.badge}
                          </span>
                        </div>

                        <h3 className="font-bold text-sm text-[#0C2340]">{item.title}</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.tagline}</p>

                        <ul className="mt-3 space-y-1.5 text-[11px] text-slate-600">
                          {item.features.slice(0, 2).map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-500">Selected</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-[#005A9C] bg-[#005A9C] text-white' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>FDIC Insured up to $250,000</span>
                </div>
                <button
                  onClick={handleStep1Next}
                  className="px-6 py-2.5 rounded-xl bg-[#005A9C] hover:bg-[#004578] text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PERSONAL DETAILS */}
          {currentStep === 2 && (
            <form onSubmit={handleStep2Next} className="space-y-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#0C2340] tracking-tight">
                  Personal Details
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Tell us a bit about yourself. We use this to verify identity and safeguard your account.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Justin"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jefferson"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. justin.jefferson@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mobile Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    placeholder="(612) 555-0199"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Create Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimum 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Strength Bar */}
                  {password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1 h-1">
                        <div
                          className={`flex-1 rounded-full ${
                            passwordStrength >= 1 ? 'bg-red-500' : 'bg-slate-200'
                          }`}
                        />
                        <div
                          className={`flex-1 rounded-full ${
                            passwordStrength >= 2 ? 'bg-amber-500' : 'bg-slate-200'
                          }`}
                        />
                        <div
                          className={`flex-1 rounded-full ${
                            passwordStrength >= 3 ? 'bg-blue-500' : 'bg-slate-200'
                          }`}
                        />
                        <div
                          className={`flex-1 rounded-full ${
                            passwordStrength >= 4 ? 'bg-emerald-500' : 'bg-slate-200'
                          }`}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {passwordStrength <= 1
                          ? 'Weak password'
                          : passwordStrength <= 2
                          ? 'Moderate strength'
                          : passwordStrength === 3
                          ? 'Strong password'
                          : 'Excellent password security'}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#005A9C] hover:bg-[#004578] text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: ADDRESS & IDENTITY */}
          {currentStep === 3 && (
            <form onSubmit={handleStep3Next} className="space-y-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#0C2340] tracking-tight">
                  Address & Identity Verification
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Federal banking regulations (USA PATRIOT Act) require identity and residential verification.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Residential Street Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1201 Nicollet Mall, Suite 400"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Minneapolis"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    State
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  >
                    <option value="MN">Minnesota (MN)</option>
                    <option value="IL">Illinois (IL)</option>
                    <option value="OH">Ohio (OH)</option>
                    <option value="CO">Colorado (CO)</option>
                    <option value="CA">California (CA)</option>
                    <option value="WA">Washington (WA)</option>
                    <option value="NY">New York (NY)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="55403"
                    value={zip}
                    onChange={(e) => setZip(e.target.value.replace(/\D/g, ''))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Social Security Number (Last 4 Digits)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      maxLength={4}
                      required
                      placeholder="••••"
                      value={ssnLast4}
                      onChange={(e) => setSsnLast4(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Used strictly for identity verification. 256-bit encrypted.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Estimated Annual Household Income
                </label>
                <select
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                >
                  <option value="Under $50,000">Under $50,000</option>
                  <option value="$50,000 - $100,000">$50,000 - $100,000</option>
                  <option value="$100,000 - $250,000">$100,000 - $250,000</option>
                  <option value="$250,000 - $500,000">$250,000 - $500,000</option>
                  <option value="Over $500,000 (Private Wealth Tier)">Over $500,000 (Private Wealth Tier)</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#005A9C] hover:bg-[#004578] text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all"
                >
                  <span>Review Application</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: REVIEW & CONSENT */}
          {currentStep === 4 && (
            <form onSubmit={handleFinalSubmit} className="space-y-5">
              <div>
                <h2 className="text-xl font-extrabold text-[#0C2340] tracking-tight">
                  Review & Electronic Consent
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Please confirm your application details and accept regulatory agreements.
                </p>
              </div>

              {/* Application Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Selected Product:</span>
                  <span className="font-bold text-[#0C2340] capitalize">{selectedType} Account</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account Holder:</span>
                  <span className="font-semibold text-slate-900">{firstName} {lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-semibold text-slate-900">{email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-mono text-slate-900">{phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Address:</span>
                  <span className="text-right text-slate-900 font-medium">{street}, {city}, {state} {zip}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-500">Minneapolis HQ Routing:</span>
                  <span className="font-mono font-bold text-[#005A9C]">091000022</span>
                </div>
              </div>

              {/* Consent Checkboxes */}
              <div className="space-y-3 pt-1 text-xs text-slate-700">
                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[#005A9C] focus:ring-[#005A9C]"
                  />
                  <div className="text-[11px] leading-relaxed">
                    <span className="font-bold text-slate-900">Deposit Account & E-Sign Disclosure: </span>
                    I agree to the U.S. Bank Terms of Service, Electronic Funds Transfer Agreement, and Privacy Policy.
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={agreeCredit}
                    onChange={(e) => setAgreeCredit(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[#005A9C] focus:ring-[#005A9C]"
                  />
                  <div className="text-[11px] leading-relaxed">
                    <span className="font-bold text-slate-900">Identity & Credit Inquiry Authorization: </span>
                    I authorize U.S. Bank National Association to verify my identity and obtain consumer reports as needed.
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={agreeMarketing}
                    onChange={(e) => setAgreeMarketing(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[#005A9C] focus:ring-[#005A9C]"
                  />
                  <div className="text-[11px] text-slate-500 leading-relaxed">
                    Optional: Keep me updated on interest rate promotions, cash bonus opportunities, and financial advisory alerts.
                  </div>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={loading || !agreeTerms || !agreeCredit}
                  className="px-7 py-3 rounded-xl bg-[#005A9C] hover:bg-[#004578] text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Provisioning Account & Ledger...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Application & Open Account</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 5: SUCCESS & CONFIRMATION */}
          {currentStep === 5 && (
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                  Application Approved & Account Active
                </span>
                <h2 className="text-2xl font-black text-[#0C2340] mt-3">
                  Welcome to U.S. Bank, {firstName}!
                </h2>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 leading-relaxed">
                  Your new account has been successfully provisioned on the authoritative banking ledger. You can now transfer funds, deposit checks, and activate Zelle®.
                </p>
              </div>

              {/* Provisioned Account Card */}
              <div className="max-w-md mx-auto p-5 rounded-2xl bg-gradient-to-br from-[#0C2340] to-[#001830] text-white text-left space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
                    {selectedType.toUpperCase()} ACCOUNT
                  </span>
                  <span className="text-xs font-bold text-emerald-400">STATUS: ACTIVE</span>
                </div>
                <div className="text-xl font-mono tracking-wider font-bold">
                  •••• •••• •••• {ssnLast4 || '4821'}
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between text-xs text-slate-300">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider block text-slate-400">Account Holder</span>
                    <span className="font-bold text-white uppercase">{firstName} {lastName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-wider block text-slate-400">Routing Transit</span>
                    <span className="font-mono font-bold text-white">091000022</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleCompleteAndSignIn}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#005A9C] hover:bg-[#004578] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Launch Online Banking Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs"
                >
                  Return to Homepage
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
