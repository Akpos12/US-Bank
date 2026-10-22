import React, { useState } from 'react';
import {
  Menu,
  X,
  CreditCard,
  Wallet,
  PiggyBank,
  BadgeDollarSign,
  Home,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Search,
  MapPin,
  HelpCircle,
  Lock,
  Eye,
  EyeOff,
  User,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Building2,
  CheckCircle2,
  Phone,
  Clock,
  Sparkles,
  Smartphone,
  Award,
  Zap,
} from 'lucide-react';
import { Customer, Account } from '../types/banking.ts';
import { api } from '../services/api.ts';
import { SportsPromoSection } from './SportsPromoSection.tsx';
import { UsBankLogo, EqualHousingLenderIcon } from './UsBankLogo.tsx';
import { AccountCreationWizard } from './AccountCreationWizard.tsx';

interface PublicHomePageProps {
  onLoginSuccess: (customer: Customer, accounts: Account[]) => void;
  initialShowLogin?: boolean;
}

interface SolutionDetail {
  id: 'checking' | 'savings' | 'credit' | 'business' | 'loan' | 'mortgage';
  title: string;
  tagline: string;
  desc: string;
  icon: any;
  highlight: string;
  features: string[];
  rateOrReward: string;
  feeInfo: string;
}

export const PublicHomePage: React.FC<PublicHomePageProps> = ({
  onLoginSuccess,
  initialShowLogin = false,
}) => {
  const [showLoginModal, setShowLoginModal] = useState(initialShowLogin);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [identifier, setIdentifier] = useState('10482');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Account Creation Wizard State
  const [showAccountWizard, setShowAccountWizard] = useState(false);
  const [wizardAccountType, setWizardAccountType] = useState<
    'checking' | 'savings' | 'credit' | 'business'
  >('checking');

  // Forgot password inline state
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('justin.jefferson@example.com');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Bonus modal state
  const [showBonusModal, setShowBonusModal] = useState(false);

  // Product Detail Modal
  const [activeProduct, setActiveProduct] = useState<SolutionDetail | null>(null);

  // Locations / ATM modal
  const [showLocationsModal, setShowLocationsModal] = useState(false);

  // Customer support modal
  const [showSupportModal, setShowSupportModal] = useState(false);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const openWizardFor = (type: 'checking' | 'savings' | 'credit' | 'business') => {
    setWizardAccountType(type);
    setShowAccountWizard(true);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.login(identifier, password, rememberMe);
      onLoginSuccess(res.customer, res.accounts);
    } catch (err: any) {
      setError(
        err.message || 'Authentication failed. Please verify your Customer ID and Password.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSubmitted(true);
  };

  const solutions: SolutionDetail[] = [
    {
      id: 'checking',
      title: 'Checking Accounts',
      tagline: 'U.S. Bank Smartly® Checking',
      desc: 'Simple, modern accounts with zero hidden fees, intuitive mobile money management, and cash bonus perks.',
      icon: Wallet,
      highlight: 'Earn up to $450 Bonus',
      rateOrReward: 'Score up to $450 with qualifying recurring direct deposits',
      feeInfo: '$0 Monthly Maintenance Fee with qualifying balance or direct deposit',
      features: [
        'Instant online application with immediate account issuance',
        'Zelle® integration for fast peer-to-peer transfers',
        'Real-time automated fraud alerts and debit card lock',
        'Fee waivers at thousands of partner ATMs nationwide',
      ],
    },
    {
      id: 'savings',
      title: 'Savings Accounts',
      tagline: 'U.S. Bank High-Yield Savings',
      desc: 'Accelerate your wealth building with highly competitive interest rates and full FDIC protection.',
      icon: PiggyBank,
      highlight: 'Special 4.50% APY',
      rateOrReward: 'Earn 4.50% Annual Percentage Yield with relationship tiering',
      feeInfo: '$0 Monthly Fee when linked with U.S. Bank Smartly® Checking',
      features: [
        'Automated recurring deposit schedules to grow reserves',
        'FDIC insured up to legal limit of $250,000 per depositor',
        'Real-time interest accrual and monthly crediting',
        'No lock-in duration; withdraw anytime without penalty',
      ],
    },
    {
      id: 'credit',
      title: 'Credit Cards',
      tagline: 'U.S. Bank Altitude® Reserve Visa',
      desc: 'Premium travel benefits, lucrative cash back categories, and zero fraud liability protection.',
      icon: CreditCard,
      highlight: '50,000 Bonus Points',
      rateOrReward: '3X points on travel and mobile wallet spending',
      feeInfo: '$325 Annual Travel & Dining Credit included',
      features: [
        '50,000 points after $4,500 spend in first 90 days ($750 value)',
        'Complimentary Priority Pass™ Select airport lounge access',
        'No foreign transaction fees on international travel',
        'Zero fraud liability protection with 24/7 security concierge',
      ],
    },
    {
      id: 'loan',
      title: 'Personal Loans',
      tagline: 'Fixed-Rate Unsecured Financing',
      desc: 'Consolidate high-interest debt or fund home improvements with predictable monthly payments.',
      icon: BadgeDollarSign,
      highlight: 'Rates from 6.99% APR',
      rateOrReward: 'Competitive fixed APR with relationship discount of 0.50%',
      feeInfo: '$0 Origination Fees • No Prepayment Penalties',
      features: [
        'Borrow up to $50,000 with flexible terms from 12 to 84 months',
        'Fast online credit decision often within minutes',
        'Funds deposited directly to your U.S. Bank checking account',
        'Fixed monthly payment that never changes over the loan life',
      ],
    },
    {
      id: 'mortgage',
      title: 'Mortgages & Lending',
      tagline: 'Home Purchase & Refinancing Solutions',
      desc: 'Turn your homeownership dreams into reality with dedicated mortgage specialists and relationship credits.',
      icon: Home,
      highlight: 'Competitive Fixed Rates',
      rateOrReward: 'Conventional, FHA, VA and Jumbo home loan programs',
      feeInfo: 'Exclusive closing cost credits for private wealth clients',
      features: [
        'Instant online pre-approval letter for competitive offers',
        'Dedicated personal loan officer throughout closing',
        'Custom rate lock protection while your loan is processed',
        'First-time homebuyer grant assistance programs available',
      ],
    },
    {
      id: 'business',
      title: 'Business Banking',
      tagline: 'Business Smartly® Checking & Treasury',
      desc: 'Powerful financial tools, merchant processing, and commercial credit lines designed for growing businesses.',
      icon: Building2,
      highlight: '$500 Business Incentive',
      rateOrReward: 'Earn up to $500 cash incentive upon qualifying deposits',
      feeInfo: 'Waivable monthly maintenance with minimum commercial balance',
      features: [
        'Up to 150 free monthly business ledger transactions',
        'Complimentary employee debit cards with spending controls',
        'Seamless integration with QuickBooks, Xero, and payroll',
        'Dedicated commercial treasury relationship manager',
      ],
    },
  ];

  const faqs = [
    {
      question: 'What do I need to open a U.S. Bank account online?',
      answer:
        'To open an account online, you must be at least 18 years old and a legal U.S. resident. Have your Social Security Number (or ITIN), government-issued ID (driver’s license or state ID), residential address, and routing/account information for your opening deposit ready. The online process takes less than 5 minutes.',
    },
    {
      question: 'How do I qualify for the $450 checking account bonus?',
      answer:
        'To earn the $450 cash reward, open a new U.S. Bank Smartly® Checking account online, enroll in online or mobile banking, and receive qualifying recurring direct deposits totaling $3,000 or more within 90 days of account opening. The bonus is deposited directly into your new checking account within 60 days of meeting requirements.',
    },
    {
      question: 'Are my deposits protected by FDIC insurance?',
      answer:
        'Yes. U.S. Bank is an FDIC-insured institution (FDIC Certificate #4821). Deposits in checking, savings, money market, and CD accounts are insured up to the standard maximum of $250,000 per depositor, for each account ownership category.',
    },
    {
      question: 'How quickly can I access my account and transfer funds after opening?',
      answer:
        'Upon submitting your application and passing electronic identity verification, your account number and routing transit (091000022) are generated immediately. You can instantly register your online banking credentials, activate Zelle®, deposit checks via mobile photo, and initiate external transfers right away.',
    },
    {
      question: 'What should I do if I notice an unrecognized charge or suspect fraud?',
      answer:
        'U.S. Bank provides a Zero Fraud Liability Guarantee on unauthorized transactions. You can instantly freeze or lock your debit or credit card inside your mobile app or online portal. For immediate assistance, contact our 24/7 Fraud Security Center at 1-877-595-6256.',
    },
  ];

  const locations = [
    {
      name: 'U.S. Bank Flagship Branch & Wealth Center',
      address: '800 Nicollet Mall, Suite 100, Minneapolis, MN 55402',
      phone: '(612) 303-4000',
      hours: 'Mon-Fri: 8:30 AM - 5:00 PM • Sat: 9:00 AM - 1:00 PM',
      services: ['Full Teller Service', 'Drive-Up ATM', '24/7 Smart Deposit', 'Notary & Wealth Advisory'],
    },
    {
      name: 'Uptown Minneapolis Branch',
      address: '3033 Excelsior Blvd, Minneapolis, MN 55416',
      phone: '(612) 927-1200',
      hours: 'Mon-Fri: 9:00 AM - 5:00 PM • Sat: 9:00 AM - 12:00 PM',
      services: ['Commercial Banking', '24/7 Walk-Up ATM', 'Safe Deposit Boxes', 'Mortgage Lending'],
    },
    {
      name: 'Minneapolis-Saint Paul International Airport (MSP)',
      address: 'Terminal 1, Concourse C & Baggage Claim, St. Paul, MN 55111',
      phone: '(800) 872-2657',
      hours: 'Open 24/7 (ATM Only)',
      services: ['24/7 ATM Cash Dispense', 'Multi-Currency Access', 'Debit Card Activation'],
    },
    {
      name: 'Wayzata Private Wealth Office',
      address: '1155 E Wayzata Blvd, Wayzata, MN 55391',
      phone: '(952) 473-8800',
      hours: 'Mon-Fri: 9:00 AM - 4:30 PM (By Appointment)',
      services: ['Private Client Group', 'Trust Administration', 'Commercial Credit'],
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* Utility Top Bar (Desktop) */}
      <div className="bg-slate-100 border-b border-slate-200 text-xs py-2 px-4 sm:px-8 hidden md:flex items-center justify-between text-slate-600">
        <div className="flex items-center gap-6">
          <span className="font-bold text-[#0c2340] border-b-2 border-[#da291c] pb-0.5">Personal</span>
          <span
            className="hover:text-slate-900 cursor-pointer transition-colors"
            onClick={() => openWizardFor('business')}
          >
            Business
          </span>
          <span
            className="hover:text-slate-900 cursor-pointer transition-colors"
            onClick={() => setShowLoginModal(true)}
          >
            Wealth Management
          </span>
          <span
            className="hover:text-slate-900 cursor-pointer transition-colors"
            onClick={() => setShowLoginModal(true)}
          >
            Commercial
          </span>
          <span className="hover:text-slate-900 cursor-pointer transition-colors">About Us</span>
        </div>
        <div className="flex items-center gap-5">
          <button
            onClick={() => setShowLocationsModal(true)}
            className="flex items-center gap-1.5 hover:text-slate-900 cursor-pointer transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-[#da291c]" /> Locations & ATMs
          </button>
          <button
            onClick={() => setShowSupportModal(true)}
            className="hover:text-slate-900 cursor-pointer transition-colors"
          >
            Customer Service
          </button>
          <span className="hover:text-slate-900 cursor-pointer transition-colors">Español</span>
        </div>
      </div>

      {/* Main Header / Sticky Navbar */}
      <div className="sticky top-0 z-40 bg-white shadow-xs">
        <header className="py-2.5 sm:py-3 px-3 sm:px-6 md:px-8 max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Hamburger menu + Optional desktop navigation */}
          <div className="w-24 sm:w-44 lg:w-56 flex items-center justify-start gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 -ml-1.5 text-[#40455A] hover:text-[#0C2340] rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Menu"
              aria-label="Open Navigation Menu"
            >
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
            <span className="hidden lg:inline text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer" onClick={() => setMobileMenuOpen(true)}>
              Products & Services
            </span>
          </div>

          {/* Center: Exactly Centered Official U.S. Bank Logo */}
          <div className="flex-1 flex items-center justify-center">
            <img
              src="/assets/usbank_logo_transparent.png"
              alt="U.S. Bank"
              className="h-7 sm:h-9 md:h-11 w-auto object-contain cursor-pointer select-none transition-transform hover:scale-[1.01]"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />
          </div>

          {/* Right: "Open an account" + "Log in" button */}
          <div className="w-24 sm:w-44 lg:w-56 flex items-center justify-end gap-1.5 sm:gap-3">
            <button
              onClick={() => openWizardFor('checking')}
              className="hidden sm:inline-flex items-center justify-center bg-[#005A9C] hover:bg-[#004578] text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors shadow-xs cursor-pointer whitespace-nowrap"
            >
              Open an account
            </button>

            <button
              onClick={() => setShowLoginModal(true)}
              className="text-[#395ACE] hover:text-[#162B7C] font-bold text-sm sm:text-base sm:text-lg transition-colors px-1 py-1 cursor-pointer select-none whitespace-nowrap"
            >
              Log in
            </button>
          </div>
        </header>

        {/* Authentic Dark Blue Horizontal Strip beneath Header */}
        <div
          className="h-3 sm:h-3.5 w-full shadow-inner"
          style={{
            backgroundImage:
              'linear-gradient(180deg, #585d85 0%, #314287 25%, #162b7c 55%, #081e74 100%)',
          }}
        />
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex">
          <div className="w-80 max-w-[85vw] bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <UsBankLogo size="md" variant="dark" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1.5 text-sm font-semibold text-slate-800">
                <div className="p-2.5 rounded-lg bg-blue-50 text-[#0c2340] font-bold flex items-center justify-between">
                  <span>Personal Banking</span>
                  <span className="text-[10px] uppercase font-bold text-[#005A9C] bg-white px-2 py-0.5 rounded-full border border-blue-100">
                    Active
                  </span>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openWizardFor('checking');
                  }}
                  className="w-full text-left p-2.5 hover:bg-slate-50 rounded-lg flex items-center justify-between"
                >
                  <span>Checking Accounts</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    $450 Bonus
                  </span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openWizardFor('savings');
                  }}
                  className="w-full text-left p-2.5 hover:bg-slate-50 rounded-lg flex items-center justify-between"
                >
                  <span>Savings & CDs</span>
                  <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded">
                    4.50% APY
                  </span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openWizardFor('credit');
                  }}
                  className="w-full text-left p-2.5 hover:bg-slate-50 rounded-lg"
                >
                  Credit Cards
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setActiveProduct(solutions[3]);
                  }}
                  className="w-full text-left p-2.5 hover:bg-slate-50 rounded-lg"
                >
                  Personal Loans
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setActiveProduct(solutions[4]);
                  }}
                  className="w-full text-left p-2.5 hover:bg-slate-50 rounded-lg"
                >
                  Mortgage & Lending
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openWizardFor('business');
                  }}
                  className="w-full text-left p-2.5 hover:bg-slate-50 rounded-lg"
                >
                  Business Banking
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowLocationsModal(true);
                  }}
                  className="w-full text-left p-2.5 hover:bg-slate-50 rounded-lg flex items-center gap-2 text-slate-600"
                >
                  <MapPin className="w-4 h-4 text-[#da291c]" /> Find Branch / ATM
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 space-y-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openWizardFor('checking');
                }}
                className="w-full py-3 rounded-xl bg-[#005A9C] hover:bg-[#004578] text-white font-bold text-sm shadow-md transition-colors"
              >
                Open an Account
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowLoginModal(true);
                }}
                className="w-full py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-sm transition-colors"
              >
                Sign In to Account
              </button>
              <div className="text-center text-[11px] text-slate-500">
                Member FDIC • Equal Housing Lender
              </div>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Hero Section */}
      <section
        style={{ background: 'linear-gradient(135deg, #0c2340 0%, #133a6f 100%)' }}
        className="text-white py-14 sm:py-20 lg:py-24 px-6 sm:px-10 lg:px-16 relative overflow-hidden"
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-2xl space-y-5 text-left">
            <span
              style={{ borderBottom: '3px solid #da291c' }}
              className="text-xs sm:text-sm uppercase tracking-widest font-extrabold pb-1 inline-block text-slate-100"
            >
              U.S. Bank Smartly® Banking
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Score up to $450 with U.S. Bank Smartly® Checking
            </h1>
            <p className="text-base sm:text-lg text-slate-200 opacity-95 leading-relaxed max-w-xl">
              Open a new account in minutes, set up qualifying direct deposits, and experience elite digital banking tools, personalized private wealth options, and 24/7 account protection.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                onClick={() => openWizardFor('checking')}
                className="bg-[#005A9C] hover:bg-[#004578] text-white font-extrabold px-7 py-3.5 rounded-xl text-sm sm:text-base transition-colors shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <span>Open an Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowBonusModal(true)}
                className="bg-white hover:bg-slate-100 text-[#0c2340] font-extrabold px-6 py-3.5 rounded-xl text-sm sm:text-base transition-colors shadow-md cursor-pointer"
              >
                Earn $450 bonus
              </button>
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-transparent hover:bg-white/10 text-white border border-white/60 hover:border-white font-semibold px-5 py-3.5 rounded-xl text-sm transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Hero visual card */}
          <div className="hidden lg:block shrink-0 w-84 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#da291c] text-white flex items-center justify-center font-bold text-xs">
                  USB
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider">
                    Exclusive Welcome Offer
                  </div>
                  <div className="text-[11px] text-blue-200">Checking Relationship</div>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                Active Offer
              </span>
            </div>

            <div className="text-4xl font-black text-white font-mono">$450 BONUS</div>
            <p className="text-xs text-slate-200 leading-relaxed">
              Earn $450 when you open an account and complete qualifying direct deposits totaling $3,000 within 90 days.
            </p>

            <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
              <div className="flex justify-between text-blue-100">
                <span>Monthly Maintenance:</span>
                <span className="font-bold text-white">$0 with qualification</span>
              </div>
              <div className="flex justify-between text-blue-100">
                <span>FDIC Insurance:</span>
                <span className="font-bold text-white">Up to $250,000</span>
              </div>
              <div className="flex justify-between text-blue-100">
                <span>Zelle® Transfers:</span>
                <span className="font-bold text-white">Instant & Free</span>
              </div>
            </div>

            <button
              onClick={() => openWizardFor('checking')}
              className="w-full py-2.5 bg-white text-[#0c2340] hover:bg-slate-100 font-extrabold rounded-xl text-xs transition-colors shadow-sm"
            >
              Start Application
            </button>
          </div>
        </div>
      </section>

      {/* Trust Badges Strip */}
      <section className="bg-slate-100 border-y border-slate-200 py-4 px-6 sm:px-10">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-around gap-4 sm:gap-8 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Member FDIC Protection up to $250,000</span>
          </div>
          <div className="flex items-center gap-2">
            <EqualHousingLenderIcon className="w-4 h-4 text-slate-700" />
            <span>Equal Housing Lender</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#005A9C]" />
            <span>256-Bit TLS Bank-Grade Encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#da291c]" />
            <span>Trusted by Over 12 Million Clients</span>
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="py-14 sm:py-20 px-6 sm:px-10 lg:px-16 bg-white">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-widest font-extrabold text-[#da291c]">
              Enterprise-Grade Financial Protection
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0c2340] tracking-tight">
              Banking Built on Uncompromising Security
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We employ military-grade encryption, continuous biometric safeguards, and round-the-clock fraud specialists to defend your accounts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#005A9C] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-bold text-base text-[#0c2340]">24/7 Fraud Monitoring</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated machine learning algorithms screen every debit and wire transaction in real time to intercept suspicious activity.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#005A9C] flex items-center justify-center">
                <Lock className="w-6 h-6 text-[#005A9C]" />
              </div>
              <h3 className="font-bold text-base text-[#0c2340]">Zero Fraud Liability</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You are never held responsible for unauthorized transactions when reported promptly. Complete financial peace of mind.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#005A9C] flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-[#da291c]" />
              </div>
              <h3 className="font-bold text-base text-[#0c2340]">Biometric & Card Controls</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instantly freeze misplaced debit cards, set custom merchant restrictions, and sign in with Face ID or Touch ID.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#005A9C] flex items-center justify-center">
                <Phone className="w-6 h-6 text-[#0c2340]" />
              </div>
              <h3 className="font-bold text-base text-[#0c2340]">Dedicated Client Concierge</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Access priority phone support and dedicated private bankers at our Nicollet Mall flagship center anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Grid Section (6 Comprehensive Product Cards) */}
      <section style={{ backgroundColor: '#f4f6f9' }} className="py-14 sm:py-20 px-6 sm:px-10 lg:px-16">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="relative inline-block mb-3">
                <h2 className="text-xs uppercase tracking-widest font-extrabold text-slate-500">
                  Comprehensive Banking Solutions
                </h2>
                <div className="w-10 h-0.5 bg-[#da291c] mt-1.5"></div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-[#0c2340] tracking-tight">
                Products Tailored to Your Financial Journey
              </p>
            </div>

            <button
              onClick={() => openWizardFor('checking')}
              className="bg-[#005A9C] hover:bg-[#004578] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors self-start sm:self-auto"
            >
              Open an Account Today
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0c2340] flex items-center justify-center group-hover:bg-[#0c2340] group-hover:text-white transition-colors">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-bold text-[#da291c] bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                        {item.highlight}
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold text-[#0c2340] group-hover:text-[#005A9C] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">{item.tagline}</p>
                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">{item.desc}</p>

                    <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
                      {item.features.slice(0, 2).map((feat, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          if (
                            item.id === 'checking' ||
                            item.id === 'savings' ||
                            item.id === 'credit' ||
                            item.id === 'business'
                          ) {
                            openWizardFor(item.id);
                          } else {
                            setActiveProduct(item);
                          }
                        }}
                        className="flex-1 py-2 bg-[#005A9C] hover:bg-[#004578] text-white text-xs font-bold rounded-lg transition-colors text-center shadow-xs"
                      >
                        Open Account
                      </button>
                      <button
                        onClick={() => setActiveProduct(item)}
                        className="py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                      >
                        Details
                      </button>
                    </div>

                    <div
                      onClick={() => setActiveProduct(item)}
                      className="flex items-center justify-between text-xs font-bold text-[#005A9C] cursor-pointer hover:underline"
                    >
                      <span>View full rates & disclosures</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-14 sm:py-20 px-6 sm:px-10 lg:px-16 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-widest font-extrabold text-[#005A9C]">
              Why Choose U.S. Bank
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0c2340] tracking-tight">
              A Smarter, More Rewarding Banking Experience
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              From our mobile check deposit and instant transfers to private wealth advisory, we provide the tools you need to thrive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#005A9C] flex items-center justify-center font-bold">
                <Zap className="w-5 h-5 text-[#005A9C]" />
              </div>
              <h3 className="font-bold text-base text-[#0c2340]">Digital Banking Convenience</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Deposit checks with your phone camera, transfer funds via Zelle®, set automated recurring savings, and view statements in real time.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-[#da291c] flex items-center justify-center font-bold">
                <Award className="w-5 h-5 text-[#da291c]" />
              </div>
              <h3 className="font-bold text-base text-[#0c2340]">Relationship Rate Boosts</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enjoy waived monthly maintenance fees, boosted annual percentage yields on high-yield savings, and exclusive discounts on personal and home loans.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="font-bold text-base text-[#0c2340]">Flagship & ATM Network</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect in-person at our flagship Nicollet Mall financial center or access cash fee-free at over 40,000 partner ATMs nationwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sports Partnership & Youth Athletics Community Section */}
      <section className="py-14 sm:py-20 px-6 sm:px-10 lg:px-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <div className="relative inline-block mb-3">
              <h2 className="text-xs uppercase tracking-widest font-extrabold text-[#da291c]">
                Community & Athletics Partnership
              </h2>
              <div className="w-10 h-0.5 bg-[#da291c] mt-1.5"></div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-[#0c2340] tracking-tight">
              Empowering the Next Generation: Justin Jefferson & Youth Flag Football
            </p>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
              U.S. Bank is proud to champion youth athletics and community wellness, funding over $2.8 million in sports equipment grants, free coaching clinics, and financial literacy programs across Minnesota and nationwide.
            </p>
          </div>

          <SportsPromoSection variant="public-feature" />
        </div>
      </section>

      {/* Interactive FAQ Section */}
      <section className="py-14 sm:py-20 px-6 sm:px-10 lg:px-16 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-widest font-extrabold text-slate-500">
              Questions & Answers
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0c2340] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Everything you need to know about opening and managing your U.S. Bank account.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 overflow-hidden transition-all bg-white"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <span className="font-bold text-sm sm:text-base text-[#0c2340]">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#005A9C]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 sm:pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-in fade-in duration-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-6 rounded-2xl bg-blue-50/70 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <h4 className="font-bold text-sm text-[#0c2340]">Still have questions?</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Our client specialists are ready to guide you 24 hours a day, 7 days a week.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSupportModal(true)}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs"
              >
                Call 1-800-USBANKS
              </button>
              <button
                onClick={() => openWizardFor('checking')}
                className="px-5 py-2 bg-[#005A9C] hover:bg-[#004578] text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Open Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#0c2340] text-white py-12 px-6 sm:px-10 lg:px-16 border-t border-[#133a6f] text-xs">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-white/10">
            <UsBankLogo size="lg" variant="light" />
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-slate-300">
              <span
                className="hover:text-white cursor-pointer"
                onClick={() => openWizardFor('checking')}
              >
                Open an Account
              </span>
              <span
                className="hover:text-white cursor-pointer"
                onClick={() => setShowLoginModal(true)}
              >
                Sign In
              </span>
              <span
                className="hover:text-white cursor-pointer"
                onClick={() => setShowLocationsModal(true)}
              >
                Locations & ATMs
              </span>
              <span
                className="hover:text-white cursor-pointer"
                onClick={() => setShowSupportModal(true)}
              >
                24/7 Client Service
              </span>
              <span className="text-blue-300 font-mono">Routing: 091000022</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-slate-300 text-xs">
            <div className="space-y-2">
              <div className="font-bold text-white uppercase tracking-wider text-[11px]">
                Banking Products
              </div>
              <p className="cursor-pointer hover:text-white" onClick={() => openWizardFor('checking')}>
                Smartly® Checking
              </p>
              <p className="cursor-pointer hover:text-white" onClick={() => openWizardFor('savings')}>
                High-Yield Savings
              </p>
              <p className="cursor-pointer hover:text-white" onClick={() => openWizardFor('credit')}>
                Altitude® Reserve Visa
              </p>
              <p className="cursor-pointer hover:text-white" onClick={() => openWizardFor('business')}>
                Business Banking
              </p>
            </div>
            <div className="space-y-2">
              <div className="font-bold text-white uppercase tracking-wider text-[11px]">
                Lending & Home
              </div>
              <p className="cursor-pointer hover:text-white" onClick={() => setActiveProduct(solutions[4])}>
                Mortgage Purchase
              </p>
              <p className="cursor-pointer hover:text-white" onClick={() => setActiveProduct(solutions[4])}>
                Home Refinance
              </p>
              <p className="cursor-pointer hover:text-white" onClick={() => setActiveProduct(solutions[3])}>
                Personal Loans
              </p>
              <p className="cursor-pointer hover:text-white" onClick={() => setActiveProduct(solutions[3])}>
                Lines of Credit
              </p>
            </div>
            <div className="space-y-2">
              <div className="font-bold text-white uppercase tracking-wider text-[11px]">
                Security & Support
              </div>
              <p className="cursor-pointer hover:text-white" onClick={() => setShowSupportModal(true)}>
                Security Guarantee
              </p>
              <p className="cursor-pointer hover:text-white" onClick={() => setShowSupportModal(true)}>
                Fraud Protection
              </p>
              <p className="cursor-pointer hover:text-white" onClick={() => setShowLocationsModal(true)}>
                Nicollet Mall Flagship
              </p>
              <p className="cursor-pointer hover:text-white" onClick={() => setShowSupportModal(true)}>
                Customer Assistance
              </p>
            </div>
            <div className="space-y-2">
              <div className="font-bold text-white uppercase tracking-wider text-[11px]">
                Corporate
              </div>
              <p className="cursor-pointer hover:text-white">About U.S. Bank</p>
              <p className="cursor-pointer hover:text-white">Investor Relations</p>
              <p className="cursor-pointer hover:text-white">Community & Youth Sports</p>
              <p className="cursor-pointer hover:text-white">Careers</p>
            </div>
          </div>

          <div className="space-y-2 text-slate-400 text-[11px] leading-relaxed pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-slate-300 font-semibold mb-1">
              <EqualHousingLenderIcon className="w-4 h-4 text-white" />
              <span>Member FDIC | Equal Housing Lender</span>
            </div>
            <p>
              © 2026 U.S. Bank National Association. Deposit products offered by U.S. Bank National Association. Member FDIC. Equal Housing Lender.
            </p>
            <p>
              Investment and insurance products and services including annuities are: NOT A DEPOSIT • NOT FDIC INSURED • MAY LOSE VALUE • NOT BANK GUARANTEED • NOT INSURED BY ANY FEDERAL GOVERNMENT AGENCY.
            </p>
          </div>
        </div>
      </footer>

      {/* ACCOUNT CREATION WIZARD (5 STEPS) */}
      <AccountCreationWizard
        isOpen={showAccountWizard}
        onClose={() => setShowAccountWizard(false)}
        initialAccountType={wizardAccountType}
        onAccountCreated={(newCust, newAccs) => {
          onLoginSuccess(newCust, newAccs);
        }}
      />

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-8 border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <UsBankLogo size="md" variant="dark" />
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setError(null);
                  setIsForgotMode(false);
                  setForgotSubmitted(false);
                }}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isForgotMode ? (
              <div className="mt-4 space-y-4 text-xs">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Reset Credentials</h3>
                  <p className="text-slate-500 mt-0.5">
                    Enter your registered email address or Customer ID to receive an encrypted security pass-code.
                  </p>
                </div>

                {forgotSubmitted ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <p className="font-bold">Security Verification Sent</p>
                    <p className="text-[11px] text-slate-600">
                      An encrypted one-time passcode has been dispatched to <strong>{forgotEmail}</strong>.
                    </p>
                    <button
                      onClick={() => {
                        setIsForgotMode(false);
                        setForgotSubmitted(false);
                      }}
                      className="mt-2 px-4 py-2 bg-[#0c2340] text-white font-bold rounded-lg"
                    >
                      Return to Sign In
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotSubmit} className="space-y-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Email or Customer ID</label>
                      <input
                        type="text"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0c2340]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#0c2340] hover:bg-[#133a6f] text-white font-bold rounded-xl shadow-xs"
                    >
                      Send Password Recovery Code
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsForgotMode(false)}
                      className="w-full text-center text-slate-500 hover:text-slate-800 text-[11px] font-semibold pt-1"
                    >
                      ← Back to Sign In
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <>
                <div className="mt-4 text-center space-y-1">
                  <h3 className="text-xl font-black text-slate-900">Sign In to Online Banking</h3>
                  <p className="text-xs text-slate-500">Enter your credentials to access your secure portal.</p>
                </div>

                {error && (
                  <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                      Customer ID or Registered Email
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="Enter Customer ID"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#0c2340] focus:bg-white transition-all"
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
                        onClick={() => setIsForgotMode(true)}
                        className="text-[11px] font-semibold text-[#1d4ed8] hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#0c2340] focus:bg-white transition-all"
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
                        className="w-4 h-4 text-[#0c2340] rounded border-slate-300 focus:ring-[#0c2340]"
                      />
                      <span className="text-slate-600 font-medium">Remember Customer ID</span>
                    </label>
                    <span className="text-[11px] text-slate-400">256-Bit TLS</span>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-4 rounded-xl bg-[#0c2340] hover:bg-[#133a6f] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? 'Establishing Session...' : 'Sign In Securely'}
                      {!loading && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" /> FDIC Insured
                    </span>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowLoginModal(false);
                        openWizardFor('checking');
                      }}
                      className="text-[#005A9C] font-bold hover:underline"
                    >
                      New user? Open an account
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* PRODUCT DETAILS MODAL */}
      {activeProduct && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl p-6 sm:p-8 border border-slate-200 animate-in zoom-in-95 duration-200 space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0c2340] flex items-center justify-center font-bold">
                  {React.createElement(activeProduct.icon, { className: 'w-5 h-5' })}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0c2340]">{activeProduct.title}</h3>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                    Product Specifications
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveProduct(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-bold text-[#da291c] bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100">
                  {activeProduct.highlight}
                </span>
                <h4 className="text-lg font-black text-slate-900 mt-2">{activeProduct.tagline}</h4>
                <p className="text-slate-600 mt-1 leading-relaxed">{activeProduct.desc}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Yield & Rates</span>
                  <div className="font-bold text-[#0c2340] mt-0.5">{activeProduct.rateOrReward}</div>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Fee Structure</span>
                  <div className="text-slate-700 font-medium mt-0.5">{activeProduct.feeInfo}</div>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-2">
                  Key Benefits & Protections
                </span>
                <div className="space-y-1.5">
                  {activeProduct.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setActiveProduct(null)}
                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const type =
                    activeProduct.id === 'checking' ||
                    activeProduct.id === 'savings' ||
                    activeProduct.id === 'credit' ||
                    activeProduct.id === 'business'
                      ? activeProduct.id
                      : 'checking';
                  setActiveProduct(null);
                  openWizardFor(type);
                }}
                className="px-5 py-2.5 bg-[#005A9C] hover:bg-[#004578] text-white font-bold rounded-xl shadow-xs"
              >
                Apply Online & Open Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOCATIONS & ATM MODAL */}
      {showLocationsModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl p-6 sm:p-8 border border-slate-200 animate-in zoom-in-95 duration-200 space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#da291c]" />
                <h3 className="text-base font-bold text-slate-900">U.S. Bank Branches & ATMs Near You</h3>
              </div>
              <button
                onClick={() => setShowLocationsModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {locations.map((loc, i) => (
                <div key={i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900 text-xs">{loc.name}</div>
                  <div className="text-slate-600">{loc.address}</div>
                  <div className="text-slate-500 font-mono text-[11px]">{loc.phone} • {loc.hours}</div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {loc.services.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-white border border-slate-200 text-slate-600">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowLocationsModal(false)}
                className="px-5 py-2 bg-[#0c2340] text-white font-bold rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER SUPPORT MODAL */}
      {showSupportModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-8 border border-slate-200 animate-in zoom-in-95 duration-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#0c2340]" />
                <h3 className="text-base font-bold text-slate-900">24/7 Client Support</h3>
              </div>
              <button
                onClick={() => setShowSupportModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#0c2340] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">General Customer Inquiries</div>
                  <div className="font-mono text-xs text-[#005A9C] font-bold">1-800-USBANKS (1-800-872-2657)</div>
                  <div className="text-[10px] text-slate-500">24 hours a day, 7 days a week</div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">Fraud Prevention & Card Security</div>
                  <div className="font-mono text-xs text-red-600 font-bold">1-877-595-6256</div>
                  <div className="text-[10px] text-slate-500">Immediate card freezing & unauthorized dispute triage</div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">Automated Telephone Banking</div>
                  <div className="font-mono text-xs text-slate-700">Quick account balances, transfers & recent clears</div>
                </div>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowSupportModal(false)}
                className="px-5 py-2 bg-[#0c2340] text-white font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BONUS MODAL */}
      {showBonusModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl p-6 sm:p-8 border border-slate-200 animate-in zoom-in-95 duration-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <UsBankLogo size="sm" variant="dark" />
              <button
                onClick={() => setShowBonusModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#da291c]">Limited-Time Checking Offer</span>
              <h3 className="text-xl font-black text-[#0c2340] mt-1">
                Score up to $450 with U.S. Bank Smartly® Checking
              </h3>
              <p className="text-slate-600 mt-2 leading-relaxed">
                Open a new U.S. Bank Smartly® Checking account online by November 15, 2026. Complete qualifying direct deposits totaling $3,000 or more within 90 days of account opening to earn your $450 cash reward.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> No monthly maintenance fee with qualifying activities
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Free mobile check deposit and Zelle payments
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Overdraft protection with zero transfer fees
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowBonusModal(false)}
                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowBonusModal(false);
                  openWizardFor('checking');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#005A9C] hover:bg-[#004578] text-white font-bold"
              >
                Open Checking & Claim Bonus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
