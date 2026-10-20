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
  AlertCircle,
  Building2,
  CheckCircle2,
  Phone,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Customer, Account } from '../types/banking.ts';
import { api } from '../services/api.ts';
import { SportsPromoSection } from './SportsPromoSection.tsx';

interface PublicHomePageProps {
  onLoginSuccess: (customer: Customer, accounts: Account[]) => void;
  initialShowLogin?: boolean;
}

interface SolutionDetail {
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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.login(identifier, password, rememberMe);
      onLoginSuccess(res.customer, res.accounts);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your Customer ID and Password.');
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
      title: 'Credit cards',
      tagline: 'U.S. Bank Altitude® Go Visa Signature® Card',
      desc: 'Earn rewards, cash back, or low introductory APRs with cards designed for your lifestyle.',
      icon: CreditCard,
      highlight: 'Earn up to 4% Cash Back',
      rateOrReward: '4X points on dining, 2X on groceries and gas, 1X on all other purchases',
      feeInfo: '$0 Annual Fee • 0% Intro APR for 15 billing cycles',
      features: [
        '20,000 bonus points after spending $1,000 in first 90 days ($200 value)',
        '$15 annual streaming credit on Spotify, Netflix, or Apple Music',
        'Contactless tap to pay with zero fraud liability protection',
        'Complimentary credit score monitoring with TransUnion® VantageScore®',
      ],
    },
    {
      title: 'Checking',
      tagline: 'U.S. Bank Smartly® Checking',
      desc: 'Simple, modern accounts with zero hidden fees and intuitive mobile money management tools.',
      icon: Wallet,
      highlight: 'Earn up to $450 Bonus',
      rateOrReward: 'Score up to $450 with qualifying direct deposit activities',
      feeInfo: '$0 Monthly Maintenance Fee with qualifying balance or recurring deposit',
      features: [
        'Fast online application with instant account number issuance',
        'Zelle® integration for instantaneous peer-to-peer transfers',
        'Real-time automated fraud alerts and biometric debit card controls',
        'Fee waivers at thousands of partner ATMs nationwide',
      ],
    },
    {
      title: 'Savings',
      tagline: 'U.S. Bank Elite Standard & High-Yield Savings',
      desc: 'Grow your wealth with competitive interest rates and FDIC insurance protection.',
      icon: PiggyBank,
      highlight: 'Up to 4.25% APY',
      rateOrReward: 'Earn up to 4.25% Annual Percentage Yield',
      feeInfo: '$0 Monthly Fee when linked with U.S. Bank Smartly® Checking',
      features: [
        'Automated recurring deposit schedules to accelerate wealth building',
        'FDIC insured up to legal limits of $250,000 per depositor',
        'Real-time interest accrual and automated monthly crediting',
        'No lock-in period; withdraw or transfer anytime without penalty',
      ],
    },
    {
      title: 'CDs',
      tagline: 'Certificate of Deposit Fixed Return Specials',
      desc: 'Lock in guaranteed high returns with our fixed-rate Certificate of Deposit accounts.',
      icon: BadgeDollarSign,
      highlight: 'Special 4.50% APY Rate',
      rateOrReward: '4.50% APY on 7-Month and 11-Month Special Term CDs',
      feeInfo: 'Guaranteed fixed rate for the entire maturity duration',
      features: [
        'Guaranteed return unaffected by market volatility',
        'Minimum opening deposit of $500',
        'Automatic rollover renewal notification 30 days prior to maturity',
        'Eligible for IRA retirement portfolio tax advantages',
      ],
    },
    {
      title: 'Mortgage',
      tagline: 'Conventional, FHA, VA & Jumbo Home Loans',
      desc: 'Purchase your dream home or refinance with dedicated lending specialists in your city.',
      icon: Home,
      highlight: 'Competitive Fixed Rates',
      rateOrReward: 'Fixed and adjustable rate terms with custom down payment programs',
      feeInfo: 'Exclusive closing cost credits for existing relationship customers',
      features: [
        'Instant online pre-approval letters to submit with your purchase offers',
        'Dedicated personal loan officer throughout underwriting and closing',
        'Rate lock guarantee options while your application is processed',
        'First-time homebuyer assistance and down payment grant counseling',
      ],
    },
    {
      title: 'Investing',
      tagline: 'U.S. Bancorp Investments & Private Wealth Advisory',
      desc: 'Build your long-term portfolio with private wealth management advisors and automated tools.',
      icon: TrendingUp,
      highlight: 'Personalized Strategies',
      rateOrReward: 'Bespoke portfolio management, retirement planning & estate guidance',
      feeInfo: 'Transparent advisory fee structures tailored to portfolio tier',
      features: [
        'Dedicated CERTIFIED FINANCIAL PLANNER™ (CFP®) advisory team',
        'Diversified asset allocation spanning equities, fixed income & private equity',
        'Tax-loss harvesting and estate wealth preservation frameworks',
        'Unified view inside your U.S. Bank digital banking dashboard',
      ],
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
      {/* Utility Top Bar */}
      <div className="bg-slate-100 border-b border-slate-200 text-xs py-2 px-4 sm:px-8 hidden md:flex items-center justify-between text-slate-600">
        <div className="flex items-center gap-6">
          <span className="font-bold text-[#0c2340] border-b-2 border-[#da291c] pb-0.5">Personal</span>
          <span className="hover:text-slate-900 cursor-pointer transition-colors" onClick={() => setShowLoginModal(true)}>Business</span>
          <span className="hover:text-slate-900 cursor-pointer transition-colors" onClick={() => setShowLoginModal(true)}>Wealth Management</span>
          <span className="hover:text-slate-900 cursor-pointer transition-colors" onClick={() => setShowLoginModal(true)}>Commercial</span>
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

      {/* Main Header / Navbar */}
      <header className="flex justify-between items-center py-4 px-4 sm:px-8 bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-5 sm:gap-6">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-slate-700 hover:text-[#0c2340] p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            title="Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Exact U.S. Bank logo mark */}
          <div className="flex items-center font-extrabold text-2xl tracking-[-0.5px] text-[#0c2340] select-none cursor-pointer">
            <span
              style={{ backgroundColor: '#da291c', color: 'white', padding: '2px 7px', borderRadius: '4px', marginRight: '3px' }}
              className="text-base font-black uppercase tracking-tight"
            >
              us
            </span>
            <span>bank</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowLoginModal(true)}
            className="text-[#1d4ed8] hover:text-[#0c2340] font-bold text-sm sm:text-base px-3.5 sm:px-4 py-2 rounded-lg hover:bg-blue-50/60 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Lock className="w-4 h-4 text-[#1d4ed8]" />
            Log in
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex">
          <div className="w-80 max-w-[85vw] bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center font-extrabold text-xl tracking-tight text-[#0c2340]">
                  <span
                    style={{ backgroundColor: '#da291c', color: 'white', padding: '2px 6px', borderRadius: '4px', marginRight: '2px' }}
                    className="text-sm font-black"
                  >
                    us
                  </span>
                  <span>bank</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 text-sm font-semibold text-slate-800">
                <div className="p-2.5 rounded-lg bg-blue-50 text-[#0c2340] font-bold">Personal Banking</div>
                <button
                  onClick={() => { setMobileMenuOpen(false); setActiveProduct(solutions[0]); }}
                  className="w-full text-left p-2.5 hover:bg-slate-50 rounded-lg"
                >
                  Credit Cards
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); setActiveProduct(solutions[1]); }}
                  className="w-full text-left p-2.5 hover:bg-slate-50 rounded-lg"
                >
                  Checking Accounts
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); setActiveProduct(solutions[2]); }}
                  className="w-full text-left p-2.5 hover:bg-slate-50 rounded-lg"
                >
                  Savings & CDs
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); setActiveProduct(solutions[4]); }}
                  className="w-full text-left p-2.5 hover:bg-slate-50 rounded-lg"
                >
                  Mortgage & Lending
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); setActiveProduct(solutions[5]); }}
                  className="w-full text-left p-2.5 hover:bg-slate-50 rounded-lg"
                >
                  Wealth Management
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); setShowLocationsModal(true); }}
                  className="w-full text-left p-2.5 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-[#da291c]" /> Find Branch / ATM
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 space-y-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowLoginModal(true);
                }}
                className="w-full py-3 rounded-xl bg-[#0c2340] hover:bg-[#133a6f] text-white font-bold text-sm shadow-md transition-colors"
              >
                Sign In to Account
              </button>
              <div className="text-center text-xs text-slate-500 font-mono">
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
              Personal Banking
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Score up to $450 with U.S. Bank Smartly® Checking
            </h1>
            <p className="text-base sm:text-lg text-slate-200 opacity-95 leading-relaxed max-w-xl">
              Open a new U.S. Bank Smartly® Checking account and complete required activities. Terms and limitations apply.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => setShowBonusModal(true)}
                className="bg-white hover:bg-slate-100 text-[#0c2340] font-extrabold px-8 py-3.5 rounded-lg text-sm sm:text-base transition-colors shadow-lg cursor-pointer"
              >
                Earn your bonus
              </button>
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-transparent hover:bg-white/10 text-white border-2 border-white/60 hover:border-white font-bold px-7 py-3 rounded-lg text-sm sm:text-base transition-colors cursor-pointer"
              >
                Existing customer sign in
              </button>
            </div>
          </div>

          {/* Hero visual card */}
          <div className="hidden lg:block shrink-0 w-80 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#da291c] text-white flex items-center justify-center font-bold text-xs">
                USB
              </div>
              <div>
                <div className="text-xs font-bold text-white uppercase tracking-wider">Special Promotion</div>
                <div className="text-[11px] text-blue-200">Checking Relationship</div>
              </div>
            </div>
            <div className="text-3xl font-black text-white font-mono">$450 BONUS</div>
            <p className="text-xs text-slate-200 mt-2">
              Qualify with recurring direct deposits and enroll in modern digital banking tools.
            </p>
            <div className="mt-4 pt-4 border-t border-white/10 text-xs text-blue-200 flex items-center justify-between">
              <span>Member FDIC</span>
              <span className="font-bold text-white">Offer Active</span>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Grid Section */}
      <section style={{ backgroundColor: '#f4f6f9' }} className="py-14 sm:py-20 px-6 sm:px-10 lg:px-16">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <div className="relative inline-block mb-3">
              <h2 className="text-xs uppercase tracking-widest font-extrabold text-slate-500">
                Solutions designed to work for you
              </h2>
              <div className="w-10 h-0.5 bg-[#da291c] mt-1.5"></div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-[#0c2340] tracking-tight">
              Banking products tailored to your financial goals
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveProduct(item)}
                  className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group"
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

                    <h3 className="text-xl font-extrabold text-[#0c2340] group-hover:text-[#1d4ed8] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{item.desc}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#1d4ed8]">
                    <span>View product features & rates</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sports Partnership & Youth Athletics Community Section */}
      <section className="py-14 sm:py-20 px-6 sm:px-10 lg:px-16 bg-white border-t border-slate-200">
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

      {/* Promo / Offer Section */}
      <section className="py-14 sm:py-20 px-6 sm:px-10 lg:px-16 bg-slate-50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Promo Card */}
          <div
            style={{ backgroundColor: '#0c2340' }}
            className="text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 bg-white/10 px-3 py-1 rounded-full">
                Digital Security Guarantee
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-4 leading-tight">
                Manage your money with complete confidence
              </h2>
              <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                Enjoy 24/7 fraud monitoring, zero liability protection, biometrics-secured transfers, and instant account notifications.
              </p>
            </div>

            <div className="pt-8">
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-white hover:bg-slate-100 text-[#0c2340] font-extrabold px-6 py-3 rounded-lg text-sm transition-colors shadow-md cursor-pointer"
              >
                Sign in to your portal
              </button>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-6 sm:pl-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0c2340] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#0c2340]">256-Bit TLS End-to-End Encryption</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Bank-grade security protocols defend every session and protect all transaction records.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0c2340] flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-[#0c2340]" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#0c2340]">Member FDIC Protection</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Your deposits are insured up to the maximum allowable federal limit of $250,000 per depositor.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0c2340] flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5 text-[#0c2340]" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#0c2340]">24/7 Dedicated Client Concierge</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Speak directly with banking specialists and relationship managers whenever you need assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#0c2340] text-white py-12 px-6 sm:px-10 lg:px-16 border-t border-[#133a6f] text-xs">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex items-center font-extrabold text-2xl tracking-tight text-white">
              <span
                style={{ backgroundColor: '#da291c', color: 'white', padding: '2px 7px', borderRadius: '4px', marginRight: '3px' }}
                className="text-base font-black"
              >
                us
              </span>
              <span>bank</span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-slate-300">
              <span className="hover:text-white cursor-pointer" onClick={() => setShowSupportModal(true)}>Privacy & Security</span>
              <span className="hover:text-white cursor-pointer" onClick={() => setShowSupportModal(true)}>Terms of Use</span>
              <span className="hover:text-white cursor-pointer" onClick={() => setShowSupportModal(true)}>Accessibility</span>
              <span className="hover:text-white cursor-pointer" onClick={() => setShowLocationsModal(true)}>Routing Transit: 091000022</span>
            </div>
          </div>

          <div className="space-y-2 text-slate-400 text-[11px] leading-relaxed">
            <p>
              © 2026 U.S. Bank National Association. Deposit products offered by U.S. Bank National Association. Member FDIC. Equal Housing Lender.
            </p>
            <p>
              Investment and insurance products and services including annuities are: NOT A DEPOSIT • NOT FDIC INSURED • MAY LOSE VALUE • NOT BANK GUARANTEED • NOT INSURED BY ANY FEDERAL GOVERNMENT AGENCY.
            </p>
          </div>
        </div>
      </footer>

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-8 border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center font-extrabold text-xl text-[#0c2340]">
                <span
                  style={{ backgroundColor: '#da291c', color: 'white', padding: '2px 6px', borderRadius: '4px', marginRight: '2px' }}
                  className="text-xs font-black"
                >
                  us
                </span>
                <span>bank</span>
              </div>
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
                    <span>Encrypted Session</span>
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
                  setActiveProduct(null);
                  setShowLoginModal(true);
                }}
                className="px-5 py-2.5 bg-[#0c2340] hover:bg-[#133a6f] text-white font-bold rounded-xl shadow-xs"
              >
                Apply Online & Sign In
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
                  <div className="font-mono text-xs text-[#1d4ed8] font-bold">1-800-USBANKS (1-800-872-2657)</div>
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
              <div className="flex items-center font-extrabold text-xl text-[#0c2340]">
                <span
                  style={{ backgroundColor: '#da291c', color: 'white', padding: '2px 6px', borderRadius: '4px', marginRight: '2px' }}
                  className="text-xs font-black"
                >
                  us
                </span>
                <span>bank</span>
              </div>
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
                  setShowLoginModal(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#0c2340] hover:bg-[#133a6f] text-white font-bold"
              >
                Sign In to Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
