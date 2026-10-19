import React, { useState } from 'react';
import {
  Trophy,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  MapPin,
  ShieldCheck,
  X,
  Send,
  Ticket,
  HeartHandshake,
  DollarSign,
  Gift,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SportsPromoSectionProps {
  variant?: 'banner-compact' | 'full-dashboard' | 'public-feature';
  onNavigateToTransfers?: () => void;
}

export const SportsPromoSection: React.FC<SportsPromoSectionProps> = ({
  variant = 'full-dashboard',
}) => {
  const [activeTab, setActiveTab] = useState<'youth' | 'nfl'>('youth');

  // Modals state
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [grantSubmitted, setGrantSubmitted] = useState(false);
  const [grantForm, setGrantForm] = useState({
    leagueName: 'Twin Cities Metro Youth Athletics',
    organizationType: 'Non-profit Youth Athletic Association',
    contactPerson: 'Justin Jefferson Community Coordinator',
    email: 'community@twincitiesyouthsports.org',
    city: 'Minneapolis',
    state: 'MN',
    requestedAmount: '$10,000',
    participantsCount: '180 youth athletes',
    programDescription: 'Providing full flag football equipment, uniforms, field rentals, and free Saturday clinic transportation for underserved youth.',
  });

  const [showClinicModal, setShowClinicModal] = useState(false);
  const [clinicSubmitted, setClinicSubmitted] = useState(false);
  const [clinicForm, setClinicForm] = useState({
    parentName: 'Justin Jefferson',
    childName: 'Jordan Jefferson',
    childAge: '10',
    location: 'U.S. Bank Stadium Indoor Fieldhouse (Minneapolis, MN)',
    sessionDate: 'Saturday, November 7, 2026 - 10:00 AM',
    position: 'Wide Receiver / Flag Defense',
  });

  const [showSweepstakesModal, setShowSweepstakesModal] = useState(false);
  const [sweepstakesSubmitted, setSweepstakesSubmitted] = useState(false);

  const [showPerksModal, setShowPerksModal] = useState(false);

  const handleGrantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGrantSubmitted(true);
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {}
  };

  const handleClinicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClinicSubmitted(true);
    try {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  const handleSweepstakesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSweepstakesSubmitted(true);
    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Main Promo Banner with Switcher */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Banner Top Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 sm:px-6 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('youth')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'youth'
                ? 'border-[#da291c] text-[#0c2340]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4 text-[#da291c]" />
            Youth Flag Football Community Grants
            <span className="text-[10px] font-extrabold bg-red-100 text-[#da291c] px-2 py-0.5 rounded-full">
              $2.8M Awarded
            </span>
          </button>

          <button
            onClick={() => setActiveTab('nfl')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'nfl'
                ? 'border-[#0c2340] text-[#0c2340]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Trophy className="w-4 h-4 text-[#0c2340]" />
            U.S. Bank Stadium VIP & Justin Jefferson Perks
            <span className="text-[10px] font-extrabold bg-blue-100 text-[#0c2340] px-2 py-0.5 rounded-full">
              Cardholder Exclusive
            </span>
          </button>
        </div>

        {/* Tab 1 Content: Youth Flag Football */}
        {activeTab === 'youth' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Visual Photography Column */}
            <div className="lg:col-span-5 relative min-h-[260px] sm:min-h-[320px] bg-slate-900 overflow-hidden">
              <img
                src="/flag_football_kids.jpg"
                alt="Youth flag football community clinic supported by U.S. Bank"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/30" />
              <div className="absolute top-4 left-4">
                <span className="bg-[#da291c] text-white text-[11px] font-extrabold uppercase px-3 py-1 rounded-full shadow-md tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> Community Impact
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white lg:hidden">
                <div className="text-xs font-semibold text-slate-200">Minnesota Youth Sports Initiative</div>
                <div className="text-base font-bold">Empowering Young Athletes On & Off the Field</div>
              </div>
            </div>

            {/* Information & Action Column */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between bg-white space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#da291c] uppercase tracking-wider">
                  <HeartHandshake className="w-4 h-4" />
                  <span>U.S. Bank Official Community Initiative</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#0c2340] tracking-tight leading-snug">
                  Justin Jefferson Youth Flag Football Camps & Equipment Grants
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Through our partnership with NFL star Justin Jefferson, U.S. Bank has committed $2.8 million to support local youth flag football leagues, providing official equipment, tournament travel grants, and interactive youth financial wellness clinics.
                </p>

                {/* Key Metrics / Highlights */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <div className="text-lg font-black text-[#0c2340] font-mono">142+</div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">Leagues Funded</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <div className="text-lg font-black text-[#da291c] font-mono">8,400+</div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">Kids Equipped</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <div className="text-lg font-black text-emerald-700 font-mono">100%</div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">Free Clinics</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowGrantModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#da291c] hover:bg-[#b82317] text-white font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Award className="w-4 h-4" /> Apply for Community Grant
                </button>
                <button
                  onClick={() => setShowClinicModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-[#0c2340]" /> Free Clinic Signup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2 Content: Justin Jefferson Gameday & VIP Perks */}
        {activeTab === 'nfl' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Visual Photography Column */}
            <div className="lg:col-span-5 relative min-h-[260px] sm:min-h-[320px] bg-slate-900 overflow-hidden">
              <img
                src="/justin_jefferson_hero.jpg"
                alt="NFL star Justin Jefferson celebrating at U.S. Bank Stadium"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/30" />
              <div className="absolute top-4 left-4">
                <span className="bg-[#0c2340] text-white text-[11px] font-extrabold uppercase px-3 py-1 rounded-full shadow-md tracking-wider flex items-center gap-1.5 border border-white/20">
                  <Trophy className="w-3 h-3 text-amber-400" /> NFL Partnership
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white lg:hidden">
                <div className="text-xs font-semibold text-slate-200">U.S. Bank Stadium • Minneapolis</div>
                <div className="text-base font-bold">Exclusive Gameday Perks & VIP Access</div>
              </div>
            </div>

            {/* Information & Action Column */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between bg-white space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0c2340] uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>U.S. Bank Cardholder Exclusive Benefits</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#0c2340] tracking-tight leading-snug">
                  VIP Gameday Experience at U.S. Bank Stadium
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  As a U.S. Bank Premium account holder, unlock exclusive perks when attending games at U.S. Bank Stadium: express entry through dedicated gates, 10% instant merchandise savings, and entry into monthly autographed memorabilia draws.
                </p>

                {/* Benefits List */}
                <div className="space-y-2 text-xs text-slate-700 pt-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>10% Discount:</strong> Present your U.S. Bank card at official stadium retail stores.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Express Entry Gate:</strong> Skip lines at Legacy Gate entrance with mobile banking pass.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Monthly Drawing:</strong> Automatic entry into VIP sideline passes and signed jerseys.</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowSweepstakesModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#0c2340] hover:bg-[#133a6f] text-white font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Ticket className="w-4 h-4 text-amber-400" /> Enter VIP Sideline Sweepstakes
                </button>
                <button
                  onClick={() => setShowPerksModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Gift className="w-4 h-4 text-[#da291c]" /> View All Cardholder Perks
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Responsive Interactive Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Community Grants */}
        <div
          onClick={() => setShowGrantModal(true)}
          className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="relative h-44 overflow-hidden bg-slate-100">
              <img
                src="/flag_football_kids.jpg"
                alt="Youth athletic grants"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3 bg-[#da291c] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                Up to $15,000 Grants
              </div>
            </div>
            <div className="p-5">
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#da291c] transition-colors">
                2026-2027 Youth Flag Football Grants
              </h4>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Funding for new equipment, field rentals, referee fees, and inclusive team gear for local youth programs.
              </p>
            </div>
          </div>
          <div className="px-5 pb-5 pt-2 flex items-center justify-between text-xs font-bold text-[#da291c]">
            <span>Submit Organization Application</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Justin Jefferson Clinic */}
        <div
          onClick={() => setShowClinicModal(true)}
          className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="relative h-44 overflow-hidden bg-slate-900">
              <img
                src="/justin_jefferson_hero.jpg"
                alt="Justin Jefferson coaching clinic"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3 bg-[#0c2340] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm border border-white/20">
                Youth Skill Camp
              </div>
            </div>
            <div className="p-5">
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#0c2340] transition-colors">
                Saturday Youth Skill & Leadership Clinic
              </h4>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Free hands-on drills, speed training, and sportsmanship workshops at U.S. Bank Stadium for kids ages 7-14.
              </p>
            </div>
          </div>
          <div className="px-5 pb-5 pt-2 flex items-center justify-between text-xs font-bold text-[#0c2340]">
            <span>Register Youth Participant</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Financial Wellness Playbook */}
        <div
          onClick={() => setShowPerksModal(true)}
          className="bg-gradient-to-br from-[#0c2340] to-[#133a6f] text-white rounded-2xl p-6 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center mb-4 border border-white/20">
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Financial Education</div>
            <h4 className="text-base font-black text-white mt-1 group-hover:text-amber-200 transition-colors">
              The Young Champion’s Money Playbook
            </h4>
            <p className="text-xs text-slate-200 mt-2 leading-relaxed">
              Created in collaboration with Justin Jefferson. Interactive modules teaching student athletes smart budgeting, saving, and wealth fundamentals.
            </p>
          </div>
          <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs font-bold text-white">
            <span>Explore Educational Modules</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* --- MODAL 1: Community Grant Application --- */}
      {showGrantModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#da291c] flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#0c2340]">Youth Flag Football Grant Application</h3>
                  <p className="text-xs text-slate-500">U.S. Bank Foundation Community Athletics Program</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowGrantModal(false);
                  setGrantSubmitted(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {grantSubmitted ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-black text-slate-900">Application Successfully Submitted</h4>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Thank you! Your application for <strong>{grantForm.requestedAmount}</strong> on behalf of <strong>{grantForm.leagueName}</strong> has been received by the U.S. Bank Community Impact Committee.
                </p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-600 max-w-xs mx-auto">
                  Grant Confirmation #: USB-GRANT-2026-8941
                </div>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setShowGrantModal(false);
                      setGrantSubmitted(false);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#0c2340] text-white text-xs font-bold hover:bg-[#133a6f]"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleGrantSubmit} className="mt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Organization / League Name</label>
                    <input
                      type="text"
                      required
                      value={grantForm.leagueName}
                      onChange={(e) => setGrantForm({ ...grantForm, leagueName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0c2340] outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Organization Type</label>
                    <select
                      value={grantForm.organizationType}
                      onChange={(e) => setGrantForm({ ...grantForm, organizationType: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0c2340] outline-none bg-white"
                    >
                      <option>Non-profit Youth Athletic Association</option>
                      <option>Public School Athletics Department</option>
                      <option>Community Parks & Recreation Board</option>
                      <option>Youth Flag Football League</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={grantForm.city}
                      onChange={(e) => setGrantForm({ ...grantForm, city: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0c2340] outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Grant Amount</label>
                    <select
                      value={grantForm.requestedAmount}
                      onChange={(e) => setGrantForm({ ...grantForm, requestedAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0c2340] outline-none bg-white"
                    >
                      <option>$2,500 (Equipment & Game Balls)</option>
                      <option>$5,000 (Team Uniforms & Flags)</option>
                      <option>$10,000 (Field Rental & Referee Sponsorship)</option>
                      <option>$15,000 (Full Season Community League Grant)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Athletes Served</label>
                    <input
                      type="text"
                      required
                      value={grantForm.participantsCount}
                      onChange={(e) => setGrantForm({ ...grantForm, participantsCount: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0c2340] outline-none"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="font-bold text-slate-700 block mb-1">Program Description & Equipment Needs</label>
                  <textarea
                    rows={3}
                    required
                    value={grantForm.programDescription}
                    onChange={(e) => setGrantForm({ ...grantForm, programDescription: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0c2340] outline-none"
                  />
                </div>

                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-[11px] text-[#0c2340] flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Grant recipients are evaluated by the U.S. Bank Foundation in collaboration with the Justin Jefferson Youth Foundation. Decisions are communicated within 14 business days.
                  </span>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowGrantModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#da291c] hover:bg-[#b82317] text-white text-xs font-bold shadow-sm"
                  >
                    Submit Grant Application
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL 2: Free Youth Clinic Registration --- */}
      {showClinicModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0c2340] flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#0c2340]">Youth Flag Football Clinic</h3>
                  <p className="text-xs text-slate-500">Free Youth Football Clinic with Justin Jefferson</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowClinicModal(false);
                  setClinicSubmitted(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {clinicSubmitted ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-black text-slate-900">Registration Confirmed!</h4>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  <strong>{clinicForm.childName}</strong> is registered for the <strong>{clinicForm.sessionDate}</strong> session at {clinicForm.location}. A confirmation email and digital pass have been dispatched.
                </p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-600 max-w-xs mx-auto">
                  Clinic Pass #: JJ-CAMP-2026-4421
                </div>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setShowClinicModal(false);
                      setClinicSubmitted(false);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#0c2340] text-white text-xs font-bold hover:bg-[#133a6f]"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleClinicSubmit} className="mt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Parent / Guardian Name</label>
                    <input
                      type="text"
                      required
                      value={clinicForm.parentName}
                      onChange={(e) => setClinicForm({ ...clinicForm, parentName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0c2340] outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Child Name</label>
                    <input
                      type="text"
                      required
                      value={clinicForm.childName}
                      onChange={(e) => setClinicForm({ ...clinicForm, childName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0c2340] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Child Age (Grades 2-8)</label>
                    <select
                      value={clinicForm.childAge}
                      onChange={(e) => setClinicForm({ ...clinicForm, childAge: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0c2340] outline-none bg-white"
                    >
                      <option>7 years old</option>
                      <option>8 years old</option>
                      <option>9 years old</option>
                      <option>10 years old</option>
                      <option>11 years old</option>
                      <option>12 years old</option>
                      <option>13 years old</option>
                      <option>14 years old</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Position Preference</label>
                    <select
                      value={clinicForm.position}
                      onChange={(e) => setClinicForm({ ...clinicForm, position: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0c2340] outline-none bg-white"
                    >
                      <option>Wide Receiver / Running Back</option>
                      <option>Quarterback / Flag Passer</option>
                      <option>Defensive Back / Safety</option>
                      <option>All-Around Skill Exploration</option>
                    </select>
                  </div>
                </div>

                <div className="text-xs">
                  <label className="font-bold text-slate-700 block mb-1">Location & Date</label>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium">
                    <div className="font-bold text-[#0c2340]">{clinicForm.location}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{clinicForm.sessionDate}</div>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-[11px] text-amber-900 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Each registered participant receives a complimentary U.S. Bank clinic t-shirt, official flag belt, and a signed commemorative card.
                  </span>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowClinicModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#0c2340] hover:bg-[#133a6f] text-white text-xs font-bold shadow-sm"
                  >
                    Confirm Free Registration
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL 3: VIP Sweepstakes Entry --- */}
      {showSweepstakesModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#0c2340]">VIP Sideline Sweepstakes</h3>
                  <p className="text-xs text-slate-500">U.S. Bank Stadium Experience</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSweepstakesModal(false);
                  setSweepstakesSubmitted(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {sweepstakesSubmitted ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-black text-slate-900">You Are Entered!</h4>
                <p className="text-xs text-slate-600">
                  Your entry has been confirmed for the upcoming home game VIP Sideline drawing and autographed Justin Jefferson jersey sweepstakes.
                </p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-700">
                  Entry Confirmation #: SWEEP-2026-JJ-998
                </div>
                <button
                  onClick={() => {
                    setShowSweepstakesModal(false);
                    setSweepstakesSubmitted(false);
                  }}
                  className="mt-3 px-6 py-2 rounded-xl bg-[#0c2340] text-white text-xs font-bold"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSweepstakesSubmit} className="mt-4 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="font-bold text-slate-900">Grand Prize Package Includes:</div>
                  <ul className="space-y-1.5 text-slate-600">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 2 VIP Club seats at U.S. Bank Stadium
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Pre-game sideline passes with field access
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Authenticated Justin Jefferson signed helmet
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> $250 gameday concessions statement credit
                    </li>
                  </ul>
                </div>

                <div className="text-xs text-slate-500">
                  Eligible for active U.S. Bank personal checking and credit card account holders in good standing. No purchase necessary.
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSweepstakesModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#0c2340] hover:bg-[#133a6f] text-white text-xs font-bold"
                  >
                    Enter Sweepstakes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL 4: All Cardholder Perks --- */}
      {showPerksModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#da291c] flex items-center justify-center font-bold">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#0c2340]">Cardholder Sports & Stadium Perks</h3>
                  <p className="text-xs text-slate-500">U.S. Bank National Association</p>
                </div>
              </div>
              <button
                onClick={() => setShowPerksModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#da291c]"></span>
                  10% Off Official Team Store Merchandise
                </div>
                <p className="text-slate-500 mt-1 leading-relaxed">
                  Automatic 10% discount applied at checkout when using your U.S. Bank debit or credit card at any U.S. Bank Stadium retail store.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0c2340]"></span>
                  Dedicated Express Entry Gate
                </div>
                <p className="text-slate-500 mt-1 leading-relaxed">
                  Avoid long concourse queues by using the U.S. Bank Cardholder Priority Lane located at the Legacy Gate entry.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Concession Rebates & In-App Mobile Ordering
                </div>
                <p className="text-slate-500 mt-1 leading-relaxed">
                  Earn 4X rewards points on all in-stadium food and beverage orders linked to your Smartly® Checking card.
                </p>
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <button
                onClick={() => setShowPerksModal(false)}
                className="px-6 py-2.5 rounded-xl bg-[#0c2340] text-white text-xs font-bold hover:bg-[#133a6f]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
