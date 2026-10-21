import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  Car,
  Receipt,
  ShoppingCart,
  Utensils,
  Dumbbell,
  Plane,
  GraduationCap,
  Play,
  X,
  Lock,
  ArrowLeft,
  Smartphone,
  Maximize2,
  Tv,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Sparkles,
  PlusCircle,
  ShieldAlert,
  Building,
  DollarSign,
} from 'lucide-react';
import { Customer, Account, Transaction } from '../types/banking.ts';
import { api } from '../services/api.ts';

interface PlanAndTrackViewProps {
  customer?: Customer | null;
  accounts?: Account[];
  isAuthenticated?: boolean;
  onLoginClick?: () => void;
  onNavigateToTransfers?: () => void;
  onSelectTx?: (tx: Transaction) => void;
}

interface CategorySpending {
  id: string;
  name: string;
  amount: number;
  share: number;
  color: string;
  iconBg: string;
  iconColor: string;
  icon: any;
  transactions: Array<{
    name: string;
    date: string;
    amount: number;
  }>;
}

export const PlanAndTrackView: React.FC<PlanAndTrackViewProps> = ({
  customer,
  accounts = [],
  isAuthenticated = false,
  onLoginClick,
  onNavigateToTransfers,
  onSelectTx,
}) => {
  // Screen state: 'dashboard' = Screen 1 ("Plan & Track" Overview), 'spending-analytics' = Screen 2 (Detailed "Monthly Spending")
  const [activeScreen, setActiveScreen] = useState<'dashboard' | 'spending-analytics'>('dashboard');

  // Layout preview mode: mobile frame (410px) or responsive expanded
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(false);

  // Financial Scale Switcher:
  // 'wealth' = High-Net-Worth Live Ledger ($3.38M Tier: $82.5k/mo income, $30.6k/mo spending, $51.8k/mo surplus)
  // 'template' = Design Mockup Baseline ($2.5k Baseline: $2,500 income, $1,500 spending, $1,690 category total)
  const [wealthScaleMode, setWealthScaleMode] = useState<'wealth' | 'template'>('wealth');

  // Month selection filter
  const [selectedMonth, setSelectedMonth] = useState<string>('March');
  const [monthDropdownOpen, setMonthDropdownOpen] = useState<boolean>(false);

  // Donut Clockwise Animation Progress (0 to 1 over 800ms)
  const [donutDrawProgress, setDonutDrawProgress] = useState<number>(0);

  // Interactive selected/highlighted category on Donut Ring
  const [highlightedCategory, setHighlightedCategory] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Modals
  const [selectedCategory, setSelectedCategory] = useState<CategorySpending | null>(null);
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState<boolean>(false);
  const [showPlanningModal, setShowPlanningModal] = useState<boolean>(false);
  const [showCardModal, setShowCardModal] = useState<boolean>(false);
  const [showCashFlowModal, setShowCashFlowModal] = useState<boolean>(false);
  const [showBillsModal, setShowBillsModal] = useState<boolean>(false);
  const [showPartnershipModal, setShowPartnershipModal] = useState<boolean>(false);
  const [showPendingLedgerModal, setShowPendingLedgerModal] = useState<boolean>(false);
  const [showSimulateTxModal, setShowSimulateTxModal] = useState<boolean>(false);

  // Custom simulated transactions added by the user to demonstrate live tallying
  const [customSettledPurchases, setCustomSettledPurchases] = useState<
    Array<{ id: string; categoryId: string; name: string; amount: number; date: string }>
  >([]);

  // Simulation form input
  const [simName, setSimName] = useState('Whole Foods Market Groceries');
  const [simCategory, setSimCategory] = useState('food');
  const [simAmount, setSimAmount] = useState('45.00');

  // Live transaction tallying and pending status
  const [liveTransactions, setLiveTransactions] = useState<Transaction[]>([]);
  const [pendingHospitalBill, setPendingHospitalBill] = useState<{
    id: string;
    label: string;
    provider: string;
    amount: number;
    status: string;
  }>({
    id: 'TXN-300K-HOSP',
    label: 'Hospital Bill Payment',
    provider: 'Unspecified Healthcare Provider',
    amount: 300000.0,
    status: 'Pending Review',
  });

  // Touch & Swipe gesture handling for 3D Carousel
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isDragging = useRef<boolean>(false);
  const mouseStartX = useRef<number | null>(null);

  // Fetch live account status & pending transactions
  useEffect(() => {
    let isMounted = true;
    api
      .getAccountStatus()
      .then((statusData) => {
        if (!isMounted) return;
        if (statusData.pending_transactions && statusData.pending_transactions.length > 0) {
          const hosp = statusData.pending_transactions.find((t) => t.id === 'TXN-300K-HOSP');
          if (hosp) {
            setPendingHospitalBill({
              id: hosp.id,
              label: hosp.label,
              provider: hosp.provider,
              amount: Math.abs(hosp.amount),
              status: hosp.status,
            });
          }
        }
      })
      .catch((err) => {
        console.warn('Account status fetch note:', err);
      });

    api
      .getTransactions({ limit: 50 })
      .then((res) => {
        if (!isMounted) return;
        setLiveTransactions(res.data || []);
      })
      .catch((err) => {
        console.warn('Transactions fetch note:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Clockwise animation trigger: Upon viewing or swiping to "Monthly Spending", animate 0° to 360° over 800ms
  useEffect(() => {
    if (activeScreen === 'spending-analytics') {
      setDonutDrawProgress(0);
      const startTime = performance.now();
      const duration = 800; // 800ms exact requirement

      let animationFrameId: number;
      const animateRing = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDonutDrawProgress(eased);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animateRing);
        } else {
          setDonutDrawProgress(1);
        }
      };

      animationFrameId = requestAnimationFrame(animateRing);
      return () => cancelAnimationFrame(animationFrameId);
    } else {
      setDonutDrawProgress(0);
    }
  }, [activeScreen, selectedMonth, wealthScaleMode]);

  // Touch Handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Ensure horizontal gesture is intentional and exceeds vertical delta
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        setActiveScreen('spending-analytics');
      } else {
        setActiveScreen('dashboard');
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Mouse Drag support for desktop testing of swipe gesture
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('a')) return;
    isDragging.current = true;
    mouseStartX.current = e.clientX;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current || mouseStartX.current === null) return;
    const deltaX = e.clientX - mouseStartX.current;
    if (Math.abs(deltaX) > 60) {
      if (deltaX < 0) {
        setActiveScreen('spending-analytics');
      } else {
        setActiveScreen('dashboard');
      }
    }
    isDragging.current = false;
    mouseStartX.current = null;
  };

  // High-Net-Worth Wealth Tier Categories ($3.38M Checking Portfolio & $82.5k/mo Inflow)
  const wealthBaseCategories: CategorySpending[] = [
    {
      id: 'wealth-transfer',
      name: 'Wealth Allocation & Savings',
      amount: 20000.0,
      share: 65,
      color: '#2563EB', // Blue
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      icon: TrendingUp,
      transactions: [
        { name: 'US Bank High-Yield Savings Scheduled Allocation', date: 'Mar 16, 2026', amount: 20000.0 },
      ],
    },
    {
      id: 'housing',
      name: 'Luxury Residence & Utilities',
      amount: 6484.5,
      share: 21,
      color: '#10B981', // Emerald
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      icon: Receipt,
      transactions: [
        { name: 'Minneapolis Luxury Lofts Penthouse Lease', date: 'Mar 03, 2026', amount: 6200.0 },
        { name: 'Xcel Energy Executive Gas & Power', date: 'Mar 04, 2026', amount: 284.5 },
      ],
    },
    {
      id: 'aviation',
      name: 'Aviation & First-Class Travel',
      amount: 1420.8,
      share: 5,
      color: '#6366F1', // Indigo
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      icon: Plane,
      transactions: [
        { name: 'Delta Air Lines First Class MSP-LAX', date: 'Mar 20, 2026', amount: 1420.8 },
      ],
    },
    {
      id: 'dining-luxury',
      name: 'Fine Dining & Hospitality',
      amount: 700.6,
      share: 2,
      color: '#F59E0B', // Amber
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      icon: Utensils,
      transactions: [
        { name: 'Manny’s Steakhouse Client Hospitality', date: 'Mar 12, 2026', amount: 485.2 },
        { name: 'Bar La Grassa Culinary Dinner', date: 'Mar 22, 2026', amount: 215.4 },
      ],
    },
    {
      id: 'shopping-tech',
      name: 'Shopping & Technology',
      amount: 923.2,
      share: 3,
      color: '#EF4444', // Red
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      icon: ShoppingCart,
      transactions: [
        { name: 'Whole Foods Market Provisions', date: 'Mar 06, 2026', amount: 342.18 },
        { name: 'Apple Store Mall of America Equipment', date: 'Mar 18, 2026', amount: 249.99 },
        { name: 'Target Supercenter Supplies', date: 'Mar 10, 2026', amount: 189.64 },
        { name: 'Designer Retail Apparel', date: 'Mar 14, 2026', amount: 141.39 },
      ],
    },
    {
      id: 'fitness-tier',
      name: 'Executive Wellness & Equinox Club',
      amount: 640.0,
      share: 2,
      color: '#0284C7', // Sky
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-600',
      icon: Dumbbell,
      transactions: [
        { name: 'Equinox Gym & Spa Executive Membership', date: 'Mar 08, 2026', amount: 360.0 },
        { name: 'Sports Recovery & Cryotherapy', date: 'Mar 15, 2026', amount: 280.0 },
      ],
    },
    {
      id: 'auto-transport',
      name: 'Auto, Fuel & Concierge Transport',
      amount: 519.9,
      share: 2,
      color: '#8B5CF6', // Purple
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      icon: Car,
      transactions: [
        { name: 'US Bank ATM Concierge Cash Withdrawal', date: 'Mar 28, 2026', amount: 500.0 },
        { name: 'Shell Oil Premium Fuel Service', date: 'Mar 24, 2026', amount: 76.5 },
      ],
    },
  ];

  // Template Reference Mockup Categories (from initial design prompt spec)
  const templateBaseCategories: CategorySpending[] = [
    {
      id: 'auto',
      name: 'Auto & Transport',
      amount: 520.44,
      share: 20,
      color: '#2563EB',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      icon: Car,
      transactions: [
        { name: 'Shell Oil Express Auto Fuel', date: 'Mar 18, 2026', amount: 62.4 },
        { name: 'Metro Transit Monthly Pass', date: 'Mar 12, 2026', amount: 85.0 },
        { name: 'Tesla Supercharging Station', date: 'Mar 08, 2026', amount: 43.04 },
        { name: 'Twin Cities Parking Ramp', date: 'Mar 03, 2026', amount: 330.0 },
      ],
    },
    {
      id: 'bills',
      name: 'Bills & Utilities',
      amount: 478.0,
      share: 15,
      color: '#10B981',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      icon: Receipt,
      transactions: [
        { name: 'Xcel Energy Electricity', date: 'Mar 15, 2026', amount: 168.0 },
        { name: 'City Water & Waste Utility', date: 'Mar 11, 2026', amount: 92.5 },
        { name: 'CenterPoint Gas Heating', date: 'Mar 05, 2026', amount: 142.5 },
        { name: 'High-Speed Fiber Internet', date: 'Mar 02, 2026', amount: 75.0 },
      ],
    },
    {
      id: 'shopping',
      name: 'Shopping',
      amount: 470.0,
      share: 12,
      color: '#EF4444',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      icon: ShoppingCart,
      transactions: [
        { name: 'Target Supercenter Minneapolis', date: 'Mar 16, 2026', amount: 185.2 },
        { name: 'Amazon Prime Marketplace', date: 'Mar 10, 2026', amount: 142.8 },
        { name: 'Apple Store Mall of America', date: 'Mar 04, 2026', amount: 142.0 },
      ],
    },
    {
      id: 'food',
      name: 'Food & Dining',
      amount: 126.0,
      share: 10,
      color: '#F59E0B',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      icon: Utensils,
      transactions: [
        { name: 'Whole Foods Market', date: 'Mar 17, 2026', amount: 68.5 },
        { name: 'Spoon and Stable Restaurant', date: 'Mar 14, 2026', amount: 42.5 },
        { name: 'Caribou Coffee & Bagels', date: 'Mar 07, 2026', amount: 15.0 },
      ],
    },
    {
      id: 'health',
      name: 'Health & Fitness',
      amount: 120.0,
      share: 10,
      color: '#0284C7',
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-600',
      icon: Dumbbell,
      transactions: [
        { name: 'Lifetime Fitness Club Membership', date: 'Mar 01, 2026', amount: 95.0 },
        { name: 'Walgreens Pharmacy & Wellness', date: 'Mar 09, 2026', amount: 25.0 },
      ],
    },
    {
      id: 'travel',
      name: 'Travel',
      amount: 90.99,
      share: 6,
      color: '#6366F1',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      icon: Plane,
      transactions: [
        { name: 'Delta Air Lines Baggage & Seat Select', date: 'Mar 14, 2026', amount: 65.0 },
        { name: 'MSP Airport Express Parking', date: 'Mar 13, 2026', amount: 25.99 },
      ],
    },
    {
      id: 'education',
      name: 'Education',
      amount: 90.0,
      share: 5,
      color: '#8B5CF6',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      icon: GraduationCap,
      transactions: [
        { name: 'Coursera / Tech Learning Professional', date: 'Mar 06, 2026', amount: 49.0 },
        { name: 'Audiobook & Digital Publishing', date: 'Mar 03, 2026', amount: 41.0 },
      ],
    },
  ];

  // Active base selection depending on mode
  const currentBaseCategories = wealthScaleMode === 'wealth' ? wealthBaseCategories : templateBaseCategories;
  const addedPurchasesTotal = customSettledPurchases.reduce((acc, p) => acc + p.amount, 0);

  // Dynamic Tallying of Categories
  const categories: CategorySpending[] = currentBaseCategories.map((cat) => {
    const additionalTxs = customSettledPurchases.filter((p) => p.categoryId === cat.id);
    const addedAmount = additionalTxs.reduce((sum, item) => sum + item.amount, 0);
    const totalCatAmount = Math.round((cat.amount + addedAmount) * 100) / 100;

    return {
      ...cat,
      amount: totalCatAmount,
      transactions: [
        ...additionalTxs.map((t) => ({ name: t.name, date: t.date, amount: t.amount })),
        ...cat.transactions,
      ],
    };
  });

  const rawTotalCategorySpending = categories.reduce((acc, c) => acc + c.amount, 0);

  // Recalculate dynamic shares based on total spending
  categories.forEach((cat) => {
    cat.share = Math.max(1, Math.round((cat.amount / rawTotalCategorySpending) * 100));
  });

  // Dynamic Formulas for both Wealth ($3.38M) and Template ($2.5k) Modes
  const totalIncome = wealthScaleMode === 'wealth' ? 82500.0 : 2500.0;
  const baselineSpending = wealthScaleMode === 'wealth' ? 30689.0 : 1500.0;
  const cashFlowSpending = Math.round((baselineSpending + addedPurchasesTotal) * 100) / 100;
  const netCashFlow = Math.round((totalIncome - cashFlowSpending) * 100) / 100;
  const isNetPositive = netCashFlow >= 0;

  const totalMonthlySpending =
    wealthScaleMode === 'wealth'
      ? Math.round((30689.0 + addedPurchasesTotal) * 100) / 100
      : Math.round((1690.0 + addedPurchasesTotal) * 100) / 100;

  const cashFlowBadge =
    wealthScaleMode === 'wealth' ? '↑ $8,420.00 from previous month' : '↑ $343.00 from previous month';

  const spentTodayAmount =
    wealthScaleMode === 'wealth'
      ? Math.round((18450.0 + addedPurchasesTotal) * 100) / 100
      : Math.round((882.1 + addedPurchasesTotal) * 100) / 100;

  const spendingVarianceBadge =
    wealthScaleMode === 'wealth'
      ? '↑ $1,240.00 from previous month at this time'
      : '↑ $60.90 from previous month at this time';

  // Handler to simulate adding a live settled transaction
  const handleAddSimulatedTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(simAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const newTx = {
      id: `sim_${Date.now()}`,
      categoryId: simCategory,
      name: simName,
      amount: parsedAmount,
      date: `${selectedMonth} ${new Date().getDate()}, 2026`,
    };

    setCustomSettledPurchases((prev) => [newTx, ...prev]);
    setShowSimulateTxModal(false);
  };

  // Spending line chart points for 31 days (scaled per mode)
  const maxSpend = wealthScaleMode === 'wealth' ? 36000 : 1800;
  const currentMonthSpending =
    wealthScaleMode === 'wealth'
      ? [
          800, 1500, 7700, 8100, 8450, 8800, 9200, 9560, 9900, 10300, 11000, 11500, 12200, 13100,
          13900, 14800, 15600, 16800, 17500, spentTodayAmount,
        ]
      : [
          25, 48, 70, 95, 130, 165, 190, 230, 275, 320, 370, 420, 480, 530, 595, 660, 720, 785,
          840, spentTodayAmount,
        ];

  const previousMonthSpending =
    wealthScaleMode === 'wealth'
      ? [
          700, 1200, 7200, 7500, 7900, 8200, 8600, 8900, 9300, 9700, 10400, 10900, 11600, 12400,
          13100, 14000, 14700, 15900, 16600, 17210.0, 18200, 19500, 21000, 22400, 23800, 25200,
          26900, 28100, 29200, 30100, 31200,
        ]
      : [
          20, 35, 60, 80, 110, 140, 175, 205, 240, 280, 315, 360, 410, 460, 510, 570, 630, 690,
          755, 821.2, 880, 940, 1010, 1080, 1150, 1220, 1310, 1390, 1480, 1580, 1690,
        ];

  // SVG Chart Dimensions
  const svgWidth = 320;
  const svgHeight = 150;

  const getCoordinates = (day: number, amount: number) => {
    const x = ((day - 1) / 30) * (svgWidth - 20) + 10;
    const y = svgHeight - 20 - (amount / maxSpend) * (svgHeight - 40);
    return { x, y };
  };

  const currentPath = currentMonthSpending
    .map((val, idx) => {
      const { x, y } = getCoordinates(idx + 1, val);
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const prevPath = previousMonthSpending
    .map((val, idx) => {
      const { x, y } = getCoordinates(idx + 1, val);
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const prevAreaPath = `${prevPath} L ${((31 - 1) / 30) * (svgWidth - 20) + 10} ${svgHeight - 20} L 10 ${svgHeight - 20} Z`;
  const todayCoord = getCoordinates(20, spentTodayAmount);

  // Compute Donut Chart segments for SVG ring
  const donutRadius = 70;
  const circumference = 2 * Math.PI * donutRadius;
  let accumulatedPercent = 0;

  // Selected Category details for Donut center display when interactive tap happens
  const activeHighlightedCatObj = categories.find((c) => c.id === highlightedCategory);

  return (
    <div className="w-full flex flex-col items-center py-2 sm:py-6 bg-[#F8FAFC]">
      {/* Main Container */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl rounded-3xl border border-[#E2E8F0] shadow-sm bg-[#F8FAFC]"
      >
        {/* Mobile Phone Status Bar */}
        {deviceFrameMode && (
          <div className="bg-[#0C1B33] text-white pt-2.5 pb-1 px-7 flex items-center justify-between text-[11px] font-semibold select-none">
            <span>9:41</span>
            <div className="w-20 h-4 bg-slate-950 rounded-full mx-auto -mt-1 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
            </div>
            <div className="flex items-center gap-1.5">
              <span>5G</span>
              <div className="w-4 h-2 border border-white rounded-xs p-0.5">
                <div className="w-full h-full bg-white rounded-2xs"></div>
              </div>
            </div>
          </div>
        )}

        {/* 1. Header & Navigation Structure */}
        <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-30">
          <div className="px-5 py-3.5 flex items-center justify-between relative">
            {activeScreen === 'spending-analytics' ? (
              <button
                onClick={() => setActiveScreen('dashboard')}
                className="flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:text-blue-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Overview</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveScreen('spending-analytics')}
                className="flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:text-blue-800 transition-colors"
              >
                <span>Analytics</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* Brand Logo ("U.S. Bank") centered at top */}
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center font-extrabold text-xl tracking-tight text-[#0C1B33] select-none">
                <span
                  style={{
                    backgroundColor: '#DA291C',
                    color: 'white',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    marginRight: '3px',
                  }}
                  className="text-xs font-black uppercase tracking-tight"
                >
                  us
                </span>
                <span>bank</span>
              </div>
              <h1 className="text-xs font-bold text-slate-700 tracking-tight mt-0.5">
                Plan & track
              </h1>
            </div>

            {/* Right Header: Active Mode Dot & Navigation Switch */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400">
                {activeScreen === 'dashboard' ? '1/2' : '2/2'}
              </span>
              <div
                className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"
                title="System Online & Live Tally Active"
              ></div>
            </div>
          </div>

          {/* Pending Hospital Bill & Account Status Notification Banner */}
          <div className="bg-amber-50/90 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2 min-w-0">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
              <div className="truncate">
                <span className="font-extrabold text-amber-950">Pending Ledger: </span>
                <span className="font-medium text-amber-900">
                  {pendingHospitalBill.label} (-$
                  {pendingHospitalBill.amount.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}
                  ) • {pendingHospitalBill.provider}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowPendingLedgerModal(true)}
              className="text-[11px] font-bold text-amber-900 underline hover:text-amber-950 shrink-0 ml-2"
            >
              View hold details
            </button>
          </div>
        </header>

        {/* 3D CAROUSEL STAGE CONTAINER (300ms ease-in-out rotation curve matching standard native banking application animations) */}
        <div
          className="relative w-full overflow-hidden"
          style={{
            perspective: '1400px',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* SCREEN 1: "Plan & Track" Overview */}
          <div
            className={`w-full transition-all duration-300 ease-in-out ${
              activeScreen === 'dashboard'
                ? 'opacity-100 pointer-events-auto block'
                : 'opacity-0 pointer-events-none hidden'
            }`}
            style={{
              transform:
                activeScreen === 'dashboard'
                  ? 'rotateY(0deg) scale(1)'
                  : 'rotateY(-90deg) scale(0.95)',
              transformOrigin: 'left center',
              transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms ease-in-out',
            }}
          >
            <div className="p-4 sm:p-5 space-y-4">
              {/* Account Restriction Status Card */}
              {accounts.some((a) => a.status === 'Frozen' || a.restriction?.restriction_active) && (
                <div className="rounded-2xl bg-rose-50 border border-rose-300 p-3.5 flex items-start gap-3 shadow-2xs">
                  <Lock className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-extrabold text-rose-900">
                      <span>Account Inactive & Frozen</span>
                      <span className="text-[10px] bg-rose-200/80 text-rose-900 px-1.5 py-0.2 rounded font-bold">
                        Transfers Disabled
                      </span>
                    </div>
                    <p className="text-rose-800 leading-tight">
                      Account operations and transfers are completely deactivated per customer security instructions.
                    </p>
                  </div>
                </div>
              )}

              {/* A. Cash Flow Module */}
              <section className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#0C1B33] tracking-tight">
                      Cash flow
                    </h2>
                    <p className="text-xs font-semibold text-slate-500">
                      Current Month / {selectedMonth}
                    </p>
                  </div>
                  {/* Net Cash Balance prominent amount */}
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                      Net cash balance
                    </span>
                    <span
                      className={`text-2xl font-black tracking-tight ${
                        isNetPositive ? 'text-[#0C1B33]' : 'text-rose-600'
                      }`}
                    >
                      ${netCashFlow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Month-over-Month Comparison Badge */}
                <div className="flex items-center">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                    {cashFlowBadge}
                  </span>
                </div>

                {/* Status Banner: Light green background box reading "You've earned more than you've spent." */}
                {isNetPositive ? (
                  <div className="rounded-xl bg-[#DCFCE7] border border-emerald-200 p-3 flex items-center gap-2.5 text-emerald-950 font-bold text-xs sm:text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>You've earned more than you've spent.</span>
                  </div>
                ) : (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-center gap-2.5 text-amber-950 font-bold text-xs sm:text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>You've spent more than you've earned this period.</span>
                  </div>
                )}

                {/* Breakdown Grid: Income vs Spending */}
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                  <div className="bg-[#F8FAFC] rounded-xl p-3 border border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Income
                    </div>
                    <div className="text-lg font-extrabold text-slate-900">
                      ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                      {wealthScaleMode === 'wealth'
                        ? 'NFL Salary & Royalties'
                        : 'Payroll & Direct Deposits'}
                    </div>
                  </div>

                  <div className="bg-[#F8FAFC] rounded-xl p-3 border border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Spending
                    </div>
                    <div className="text-lg font-extrabold text-slate-900">
                      ${cashFlowSpending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                      {wealthScaleMode === 'wealth'
                        ? 'Debits, Transfers & Lifestyle'
                        : 'Debits & Purchases (Synced)'}
                    </div>
                  </div>
                </div>

                {/* Action Link: "Monitor your cash flow >" */}
                <div className="pt-1 flex items-center justify-between">
                  <button
                    onClick={() => setShowCashFlowModal(true)}
                    className="text-xs font-bold text-[#2563EB] hover:text-blue-800 transition-colors flex items-center gap-1 group py-1"
                  >
                    <span>Monitor your cash flow</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    onClick={() => setShowSimulateTxModal(true)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    <PlusCircle className="w-3 h-3 text-emerald-600" />
                    <span>Test live sync</span>
                  </button>
                </div>
              </section>

              {/* B. Spending Trends Module */}
              <section className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#0C1B33] tracking-tight">
                      Spending
                    </h2>
                    <p className="text-xs font-semibold text-slate-500">Current Month</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                      Total spent
                    </span>
                    <span className="text-2xl font-black text-[#0C1B33] tracking-tight">
                      ${spentTodayAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Variance Indicator */}
                <div className="flex items-center">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                    {spendingVarianceBadge}
                  </span>
                </div>

                {/* Chart Legend */}
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 pt-1">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 bg-[#0C1B33]"></span>
                      <span>Current month</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 bg-blue-300"></span>
                      <span>Previous month</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                    <span className="text-[10px] font-bold text-blue-700">Today (Day 20)</span>
                  </div>
                </div>

                {/* Area / Line Chart with X-axis 1 to 31 */}
                <div className="relative pt-2 pb-1 bg-slate-50/60 rounded-xl p-2 border border-slate-100">
                  <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="w-full h-36 overflow-visible"
                  >
                    <defs>
                      <linearGradient id="prevMonthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#EFF6FF" stopOpacity="0.05" />
                      </linearGradient>
                      <linearGradient id="currentMonthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal gridlines */}
                    {[0, maxSpend * 0.25, maxSpend * 0.5, maxSpend * 0.75].map((level) => {
                      const roundedLevel = Math.round(level);
                      const y = svgHeight - 20 - (roundedLevel / maxSpend) * (svgHeight - 40);
                      return (
                        <g key={roundedLevel}>
                          <line
                            x1="10"
                            y1={y}
                            x2={svgWidth - 10}
                            y2={y}
                            stroke="#E2E8F0"
                            strokeDasharray="3 3"
                          />
                          <text
                            x={svgWidth - 8}
                            y={y + 3}
                            fontSize="8"
                            fill="#94A3B8"
                            textAnchor="end"
                          >
                            ${roundedLevel >= 1000 ? `${(roundedLevel / 1000).toFixed(0)}k` : roundedLevel}
                          </text>
                        </g>
                      );
                    })}

                    {/* Previous month Area & Line */}
                    <path d={prevAreaPath} fill="url(#prevMonthGrad)" />
                    <path
                      d={prevPath}
                      fill="none"
                      stroke="#93C5FD"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Current month Line */}
                    <path
                      d={currentPath}
                      fill="none"
                      stroke="#0C1B33"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />

                    {/* Active dot indicator for "Today" */}
                    <circle
                      cx={todayCoord.x}
                      cy={todayCoord.y}
                      r="6"
                      fill="#2563EB"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      className="drop-shadow-md"
                    />
                    <circle
                      cx={todayCoord.x}
                      cy={todayCoord.y}
                      r="10"
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="1.5"
                      strokeOpacity="0.6"
                      className="animate-pulse"
                    />

                    {/* X-axis line */}
                    <line
                      x1="10"
                      y1={svgHeight - 20}
                      x2={svgWidth - 10}
                      y2={svgHeight - 20}
                      stroke="#CBD5E1"
                      strokeWidth="1"
                    />

                    {/* X-axis tick labels */}
                    {[1, 5, 10, 15, 20, 25, 31].map((day) => {
                      const x = ((day - 1) / 30) * (svgWidth - 20) + 10;
                      const isToday = day === 20;
                      return (
                        <g key={day}>
                          <line
                            x1={x}
                            y1={svgHeight - 20}
                            x2={x}
                            y2={svgHeight - 16}
                            stroke="#94A3B8"
                          />
                          <text
                            x={x}
                            y={svgHeight - 6}
                            fontSize="9"
                            fontWeight={isToday ? 'bold' : 'normal'}
                            fill={isToday ? '#2563EB' : '#64748B'}
                            textAnchor="middle"
                          >
                            {day}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {/* Today callout overlay */}
                  <div className="absolute top-3 left-4 bg-white/95 backdrop-blur-xs border border-slate-200 px-2.5 py-1 rounded-md text-[11px] shadow-xs">
                    <span className="text-slate-500 font-medium">As of today: </span>
                    <strong className="text-[#0C1B33] font-extrabold">
                      ${spentTodayAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                </div>

                {/* Action Link: "Track your spending trends >" */}
                <div className="pt-1 flex items-center justify-between">
                  <button
                    onClick={() => setActiveScreen('spending-analytics')}
                    className="text-xs font-bold text-[#2563EB] hover:text-blue-800 transition-colors flex items-center gap-1 group py-1"
                  >
                    <span>Track your spending trends</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => setActiveScreen('spending-analytics')}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1"
                  >
                    <span>Open Category Donut</span>
                    <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
                  </button>
                </div>
              </section>

              {/* C. Bills & Subscriptions Module */}
              <section className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-xs space-y-3.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#0C1B33] tracking-tight">
                      Bills & subscriptions
                    </h2>
                    <p className="text-xs font-semibold text-slate-500">
                      Current Month summary section
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                      Monthly total
                    </span>
                    <span className="text-lg font-extrabold text-[#0C1B33]">
                      {wealthScaleMode === 'wealth' ? '$6,480.50' : '$280.49'}
                    </span>
                  </div>
                </div>

                {/* Quick Bill Items summary */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-100 hover:bg-slate-100/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xs">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {wealthScaleMode === 'wealth'
                            ? 'Minneapolis Luxury Lofts Penthouse'
                            : 'Netflix Standard HD'}
                        </div>
                        <div className="text-[11px] text-slate-500">Auto-Debit • Due Nov 01</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      {wealthScaleMode === 'wealth' ? '$6,200.00' : '$19.99'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-100 hover:bg-slate-100/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xs">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Xcel Energy Power</div>
                        <div className="text-[11px] text-slate-500">
                          Electric & Heating • Due Oct 27
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      {wealthScaleMode === 'wealth' ? '$284.50' : '$142.50'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-100 hover:bg-slate-100/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          Verizon Wireless Family
                        </div>
                        <div className="text-[11px] text-slate-500">Mobile Plan • Due Nov 02</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900">$118.00</span>
                  </div>
                </div>

                {/* Action Link */}
                <div className="pt-1">
                  <button
                    onClick={() => setShowBillsModal(true)}
                    className="w-full sm:w-auto text-left text-xs font-bold text-[#2563EB] hover:text-blue-800 transition-colors flex items-center justify-between sm:justify-start gap-1 group py-1"
                  >
                    <span>Manage bills & subscriptions</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </section>

              {/* Developer Implementation Prompt: "Happening now" Section Header & Marketing Cards */}
              <div className="pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold tracking-tight text-[#0A192F]">Happening now</h2>
                  <span className="text-xs font-semibold text-slate-400">Featured stories</span>
                </div>

                {/* Promo Card 1 (Vacation Season) */}
                <div className="rounded-[16px] border border-slate-200 bg-[#F4F6FA] overflow-hidden shadow-xs hover:shadow-md transition-all group">
                  <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-slate-200">
                    <img
                      src="/vacation_pool.jpg"
                      alt="Vacation Season budgeting"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  </div>

                  <div className="p-4 sm:p-5 space-y-2">
                    <div className="text-xs uppercase font-bold text-purple-900/70 tracking-wider">
                      VACATION SEASON
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[#0A192F] leading-snug">
                      Smart ways to save and budget for your next trip.
                    </h3>
                    <div className="pt-2">
                      <button
                        onClick={() => setShowPlanningModal(true)}
                        className="text-[#2563EB] font-bold text-xs sm:text-sm hover:underline inline-flex items-center gap-1"
                      >
                        <span>Start planning</span>
                        <span>&gt;</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Promo Card 2 (Debit Card Redesign) */}
                <div className="rounded-[16px] border border-slate-200 bg-[#F4F6FA] overflow-hidden shadow-xs hover:shadow-md transition-all group">
                  <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-slate-200">
                    <img
                      src="/debit_card_tap.jpg"
                      alt="U.S. Bank Visa Debit card tap payment"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  </div>

                  <div className="p-4 sm:p-5 space-y-2">
                    <div className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                      FRESHLY FAMILIAR
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[#0A192F] leading-snug">
                      A fresh new look for the U.S. Bank Visa® Debit card.
                    </h3>
                    <div className="pt-2">
                      <button
                        onClick={() => setShowCardModal(true)}
                        className="text-[#2563EB] font-bold text-xs sm:text-sm hover:underline inline-flex items-center gap-1"
                      >
                        <span>See what's new</span>
                        <span>&gt;</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Video & Sponsorship Block */}
                <div className="rounded-[16px] border border-slate-200 bg-white overflow-hidden shadow-xs space-y-4 p-4 sm:p-5">
                  <div
                    onClick={() => setShowVideoModal(true)}
                    className="relative h-48 sm:h-56 w-full rounded-xl overflow-hidden cursor-pointer group bg-slate-900 select-none"
                  >
                    <img
                      src="/nfl_goalposts.jpg"
                      alt="Football goalposts stadium preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/95 text-[#0C1B33] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current translate-x-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowTranscriptModal(true)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline transition-colors"
                    >
                      View transcript
                    </button>
                  </div>

                  <div className="pt-2 flex flex-col items-center justify-center space-y-2">
                    <div className="flex items-center justify-center gap-5">
                      <div className="flex items-center font-extrabold text-2xl tracking-tight text-[#0C1B33] select-none">
                        <span
                          style={{
                            backgroundColor: '#DA291C',
                            color: 'white',
                            padding: '2px 7px',
                            borderRadius: '4px',
                            marginRight: '3px',
                          }}
                          className="text-sm font-black uppercase tracking-tight"
                        >
                          us
                        </span>
                        <span>bank</span>
                      </div>

                      <div className="w-px h-8 bg-slate-300"></div>

                      <div className="flex items-center gap-1.5 font-black text-slate-800 tracking-tighter">
                        <div className="w-7 h-8 rounded-b-xl border-2 border-[#0C1B33] bg-white flex flex-col items-center justify-center p-0.5 text-[8px] font-black text-[#0C1B33] shadow-2xs">
                          <span className="text-[#DA291C] leading-none">★</span>
                          <span className="font-extrabold text-[7px] tracking-tight">NFL</span>
                        </div>
                        <span className="text-xs font-extrabold text-[#0C1B33] tracking-wide">
                          NFL
                        </span>
                      </div>
                    </div>

                    <p className="text-center text-xs font-bold text-slate-600">
                      Proud Sponsor of the NFL
                    </p>

                    <div className="pt-1">
                      <button
                        onClick={() => setShowPartnershipModal(true)}
                        className="text-xs font-bold text-[#2563EB] hover:text-blue-800 transition-colors inline-flex items-center gap-1"
                      >
                        <span>Learn about our partnership</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Legal Disclaimer Box */}
                <div className="w-full rounded-xl bg-slate-50 border-2 border-slate-400 p-5 sm:p-6 shadow-2xs">
                  <p className="text-xs sm:text-sm font-bold text-[#0A192F] text-center leading-relaxed">
                    Mortgage, home equity and credit products are offered by U.S. Bank National
                    Association. Deposit products are offered by U.S. Bank National Association.
                    Member FDIC.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SCREEN 2: Detailed "Monthly Spending" Analytics View */}
          <div
            className={`w-full transition-all duration-300 ease-in-out ${
              activeScreen === 'spending-analytics'
                ? 'opacity-100 pointer-events-auto block'
                : 'opacity-0 pointer-events-none hidden'
            }`}
            style={{
              transform:
                activeScreen === 'spending-analytics'
                  ? 'rotateY(0deg) scale(1)'
                  : 'rotateY(90deg) scale(0.95)',
              transformOrigin: 'right center',
              transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms ease-in-out',
            }}
          >
            <div className="p-4 sm:p-5 space-y-4">
              {/* Top Bar with Time Filter Dropdown */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between relative">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#0C1B33] tracking-tight">
                      Monthly Spending
                    </h2>
                    <p className="text-xs font-semibold text-slate-500">
                      {wealthScaleMode === 'wealth'
                        ? 'High-Net-Worth Portfolio Breakdown'
                        : 'Category breakdown & analytics'}
                    </p>
                  </div>

                  {/* Time Filter Dropdown: "VIEW BY Month v" */}
                  <div className="relative">
                    <button
                      onClick={() => setMonthDropdownOpen(!monthDropdownOpen)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 transition-colors shadow-2xs"
                    >
                      <span>VIEW BY {selectedMonth}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    </button>

                    {monthDropdownOpen && (
                      <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                        {['March', 'February', 'January', 'October'].map((m) => (
                          <button
                            key={m}
                            onClick={() => {
                              setSelectedMonth(m);
                              setMonthDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 hover:bg-slate-50 font-semibold ${
                              selectedMonth === m
                                ? 'text-[#2563EB] bg-blue-50/50'
                                : 'text-slate-700'
                            }`}
                          >
                            {m} 2026
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Animated Donut Graph Header */}
                <div className="flex flex-col items-center justify-center pt-2 pb-2">
                  <div className="relative w-56 h-56 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
                      <circle
                        cx="100"
                        cy="100"
                        r={donutRadius}
                        fill="transparent"
                        stroke="#F1F5F9"
                        strokeWidth="20"
                      />

                      {/* Multi-colored Ring Chart Segments */}
                      {(() => {
                        accumulatedPercent = 0;
                        return categories.map((cat) => {
                          const segmentPercent = cat.share;
                          const animatedStrokeLength =
                            (segmentPercent / 100) * circumference * donutDrawProgress;
                          const strokeDasharray = `${animatedStrokeLength} ${circumference}`;
                          const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                          accumulatedPercent += segmentPercent;

                          const isHighlighted = highlightedCategory === cat.id;
                          const isHovered = hoveredCategory === cat.id;

                          return (
                            <circle
                              key={cat.id}
                              cx="100"
                              cy="100"
                              r={donutRadius}
                              fill="transparent"
                              stroke={cat.color}
                              strokeWidth={isHighlighted ? 26 : isHovered ? 23 : 20}
                              strokeDasharray={strokeDasharray}
                              strokeDashoffset={strokeDashoffset}
                              strokeLinecap="butt"
                              style={{
                                transformOrigin: '100px 100px',
                                transition: 'stroke-width 200ms ease, filter 200ms ease',
                                filter: isHighlighted
                                  ? `drop-shadow(0px 0px 6px ${cat.color})`
                                  : 'none',
                              }}
                              className={`cursor-pointer ${isHighlighted ? 'animate-pulse' : ''}`}
                              onMouseEnter={() => setHoveredCategory(cat.id)}
                              onMouseLeave={() => setHoveredCategory(null)}
                              onClick={() => {
                                setHighlightedCategory((prev) => (prev === cat.id ? null : cat.id));
                              }}
                            />
                          );
                        });
                      })()}
                    </svg>

                    {/* Center Display inside Donut Ring */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4 select-none">
                      {activeHighlightedCatObj ? (
                        <div className="animate-in fade-in zoom-in-90 duration-150">
                          <span
                            className="text-[10px] font-black uppercase tracking-wider block"
                            style={{ color: activeHighlightedCatObj.color }}
                          >
                            {activeHighlightedCatObj.name}
                          </span>
                          <span className="text-xl sm:text-2xl font-black text-[#0C1B33] tracking-tight mt-0.5 block">
                            ${activeHighlightedCatObj.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[11px] font-bold text-slate-500 mt-0.5 block">
                            {activeHighlightedCatObj.share}% of monthly spending
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase block">
                            MONTHLY SPENDING
                          </span>
                          <span className="text-2xl font-black text-[#0C1B33] tracking-tight mt-0.5 block">
                            ${totalMonthlySpending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[11px] font-bold text-slate-500 mt-0.5 block">
                            {selectedMonth} 2026
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-[11px] text-slate-500 font-medium text-center">
                      Tap any category below or ring segment to highlight & inspect transactions
                    </p>
                    {highlightedCategory && (
                      <button
                        onClick={() => setHighlightedCategory(null)}
                        className="text-[11px] font-bold text-[#2563EB] hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* B. Category Breakdown List */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-[#0C1B33] uppercase tracking-wide">
                    Category Breakdown
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">
                      {categories.length} Categories
                    </span>
                    <button
                      onClick={() => setShowSimulateTxModal(true)}
                      className="text-xs font-bold text-[#2563EB] hover:text-blue-800 flex items-center gap-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Add purchase</span>
                    </button>
                  </div>
                </div>

                {/* Category List */}
                <div className="divide-y divide-slate-100">
                  {categories.map((cat, index) => {
                    const Icon = cat.icon;
                    const isHighlighted = highlightedCategory === cat.id;
                    const isHovered = hoveredCategory === cat.id;

                    return (
                      <div
                        key={cat.id}
                        onClick={() => {
                          setHighlightedCategory((prev) => (prev === cat.id ? null : cat.id));
                          setSelectedCategory(cat);
                        }}
                        onMouseEnter={() => setHoveredCategory(cat.id)}
                        onMouseLeave={() => setHoveredCategory(null)}
                        className={`py-3 px-2 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          isHighlighted
                            ? 'bg-blue-50/70 ring-1 ring-blue-300 scale-[1.01]'
                            : isHovered
                              ? 'bg-slate-50 scale-[1.01]'
                              : 'hover:bg-slate-50/70'
                        }`}
                      >
                        {/* Left: Category Icon in Circle & Label */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className={`w-10 h-10 rounded-full ${cat.iconBg} ${cat.iconColor} flex items-center justify-center shrink-0 shadow-2xs ${
                              isHighlighted ? 'scale-110 ring-2 ring-blue-500' : ''
                            } transition-transform`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs sm:text-sm font-bold text-slate-900 truncate flex items-center gap-1.5">
                                <span>
                                  {index + 1}. {cat.name}
                                </span>
                                {isHighlighted && (
                                  <span className="text-[10px] bg-blue-600 text-white font-black px-1.5 py-0.2 rounded-full">
                                    Active
                                  </span>
                                )}
                              </span>
                              <span className="text-xs sm:text-sm font-extrabold text-[#0C1B33] ml-2">
                                ${cat.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </span>
                            </div>

                            {/* Percentage bar & Share */}
                            <div className="flex items-center gap-2 mt-1.5">
                              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${Math.min(100, cat.share * 1.5)}%`,
                                    backgroundColor: cat.color,
                                  }}
                                ></div>
                              </div>
                              <span className="text-[11px] font-bold text-slate-500 shrink-0">
                                {cat.share}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Chevron */}
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Total & Screen Rotation Link back to Screen 1 */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveScreen('dashboard')}
                    className="text-xs font-bold text-[#2563EB] hover:text-blue-800 transition-colors inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Plan & track overview</span>
                  </button>

                  <div className="text-xs font-extrabold text-[#0C1B33] bg-slate-100 px-3 py-1.5 rounded-xl">
                    Total Category Spending: $
                    {totalMonthlySpending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Legal Disclaimer Box on Analytics Screen */}
              <div className="w-full rounded-xl bg-slate-50 border-2 border-slate-400 p-4 shadow-2xs">
                <p className="text-xs font-bold text-[#0A192F] text-center leading-relaxed">
                  Mortgage, home equity and credit products are offered by U.S. Bank National
                  Association. Deposit products are offered by U.S. Bank National Association. Member
                  FDIC.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Bottom Navigation Dots & Quick Switcher */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => setActiveScreen('dashboard')}
            className={`text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
              activeScreen === 'dashboard'
                ? 'bg-blue-50 text-[#2563EB]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Screen 1: Overview</span>
          </button>

          <div className="flex items-center gap-1.5">
            <span
              onClick={() => setActiveScreen('dashboard')}
              className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all ${
                activeScreen === 'dashboard' ? 'bg-[#2563EB] w-5' : 'bg-slate-300'
              }`}
            ></span>
            <span
              onClick={() => setActiveScreen('spending-analytics')}
              className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all ${
                activeScreen === 'spending-analytics' ? 'bg-[#2563EB] w-5' : 'bg-slate-300'
              }`}
            ></span>
          </div>

          <button
            onClick={() => setActiveScreen('spending-analytics')}
            className={`text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
              activeScreen === 'spending-analytics'
                ? 'bg-blue-50 text-[#2563EB]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Screen 2: Breakdown</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* MODAL 1: Category Transactions Detail Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full ${selectedCategory.iconBg} ${selectedCategory.iconColor} flex items-center justify-center`}
                >
                  <selectedCategory.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedCategory.name}</h3>
                  <p className="text-xs text-slate-500">
                    Total: ${selectedCategory.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({selectedCategory.share}% of monthly spending)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Settled Transactions in this category
              </div>

              <div className="divide-y divide-slate-100 space-y-1 max-h-64 overflow-y-auto pr-1">
                {selectedCategory.transactions.map((t, idx) => (
                  <div key={idx} className="pt-2 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{t.name}</div>
                      <div className="text-slate-400 text-[11px]">{t.date}</div>
                    </div>
                    <span className="font-extrabold text-slate-900">
                      -${t.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="px-4 py-1.5 bg-[#0C1B33] hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Pending Ledger & Hospital Bill Details Modal */}
      {showPendingLedgerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-amber-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Pending Ledger & Account Status
                  </h3>
                  <p className="text-xs text-amber-900 font-semibold">
                    1 Pending Transaction Requiring Verification
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPendingLedgerModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 text-xs text-slate-700">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-amber-950 text-sm">
                    {pendingHospitalBill.label}
                  </span>
                  <span className="font-black text-rose-700 text-sm">
                    -$
                    {pendingHospitalBill.amount.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-amber-900 pt-1 border-t border-amber-200/60">
                  <div>
                    <span className="text-slate-500 block">Healthcare Provider:</span>
                    <strong className="text-slate-900">{pendingHospitalBill.provider}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Ledger Status:</span>
                    <strong className="text-amber-800">{pendingHospitalBill.status}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Transaction ID:</span>
                    <span className="font-mono">{pendingHospitalBill.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Posting Effect:</span>
                    <span>Deducted from Available Balance only</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900">Accounting & Cash Flow Rules:</div>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>
                    <strong>Pending Review Segregation:</strong> This $300,000.00 charge is pending
                    provider verification and does not distort monthly category spending rings or
                    cash flow metrics until officially settled.
                  </li>
                  <li>
                    <strong>Account Status Impact:</strong> Outgoing transfers are restricted while
                    identity and provider settlement confirmation is completed.
                  </li>
                </ul>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowPendingLedgerModal(false)}
                  className="px-4 py-1.5 bg-[#0C1B33] text-white font-bold text-xs rounded-xl"
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Simulate Live Settled Transaction */}
      {showSimulateTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-blue-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Live Transaction Tally Sync</h3>
                  <p className="text-xs text-slate-500">
                    Add a settled debit to watch live tallying
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSimulateTxModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSimulatedTransaction} className="p-4 sm:p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Merchant / Purchase Description
                </label>
                <input
                  type="text"
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Spending Category
                  </label>
                  <select
                    value={simCategory}
                    onChange={(e) => setSimCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium bg-white"
                  >
                    {wealthScaleMode === 'wealth' ? (
                      <>
                        <option value="wealth-transfer">Wealth Allocation & Savings</option>
                        <option value="housing">Luxury Residence & Utilities</option>
                        <option value="aviation">Aviation & First-Class Travel</option>
                        <option value="dining-luxury">Fine Dining & Hospitality</option>
                        <option value="shopping-tech">Shopping & Technology</option>
                        <option value="fitness-tier">Executive Wellness & Equinox Club</option>
                        <option value="auto-transport">Auto, Fuel & Concierge Transport</option>
                      </>
                    ) : (
                      <>
                        <option value="auto">Auto & Transport</option>
                        <option value="bills">Bills & Utilities</option>
                        <option value="shopping">Shopping</option>
                        <option value="food">Food & Dining</option>
                        <option value="health">Health & Fitness</option>
                        <option value="travel">Travel</option>
                        <option value="education">Education</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Debit Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={simAmount}
                    onChange={(e) => setSimAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                    required
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                Adding this purchase immediately updates:
                <br />
                • Monthly Spending Total & Category Share
                <br />
                • Cash Flow Spending & Net Cash Flow formula
                <br />• Today's Spending curve in the trends chart
              </p>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSimulateTxModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Post Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Video Player & Stadium Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 text-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-700">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-red-500 fill-current" />
                <span className="text-sm font-bold">U.S. Bank & NFL: Championing Communities</span>
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video bg-black flex items-center justify-center">
              <img
                src="/nfl_goalposts.jpg"
                alt="NFL Video playback"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-white text-[#0C1B33] flex items-center justify-center shadow-lg animate-pulse">
                  <Play className="w-8 h-8 fill-current translate-x-0.5" />
                </div>
                <p className="text-xs text-slate-300 max-w-sm">
                  Broadcast Feature: Empowering youth sports, community athletics, and financial
                  education across America.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-900 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  setShowVideoModal(false);
                  setShowTranscriptModal(true);
                }}
                className="text-blue-400 hover:underline font-semibold"
              >
                Read full video transcript
              </button>
              <button
                onClick={() => setShowVideoModal(false)}
                className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 font-bold"
              >
                Close Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Video Transcript Modal */}
      {showTranscriptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Video Transcript</h3>
                <p className="text-xs text-slate-500">
                  Official Partnership Video: Proud Sponsor of the NFL
                </p>
              </div>
              <button
                onClick={() => setShowTranscriptModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-3 text-xs text-slate-700 leading-relaxed max-h-96 overflow-y-auto">
              <p>
                <strong>[Narrator]:</strong> Every touchdown starts with preparation. Every season
                begins with a game plan.
              </p>
              <p>
                <strong>[Narrator]:</strong> At U.S. Bank, we believe the same is true for your
                financial life. From daily budgeting to saving for your family's future, having the
                right teammate makes all the difference.
              </p>
              <p>
                <strong>[Narrator]:</strong> As the Proud Sponsor of the NFL, we're investing in
                grassroots youth athletic clinics, empowering community leagues, and providing smart
                digital tools like 'Plan & Track' that help everyday Americans reach their financial
                end zone.
              </p>
              <p>
                <strong>[Onscreen Graphic]:</strong> U.S. Bank • Proud Sponsor of the NFL •
                Mortgage, home equity, and credit products offered by U.S. Bank National Association.
                Member FDIC.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowTranscriptModal(false)}
                className="px-4 py-1.5 bg-[#0C1B33] text-white font-bold text-xs rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Vacation Planning Modal */}
      {showPlanningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] font-black text-purple-900/70 uppercase tracking-wider block">
                  VACATION SEASON BUDGETING
                </span>
                <h3 className="text-sm font-bold text-slate-900">Plan Your Next Trip</h3>
              </div>
              <button
                onClick={() => setShowPlanningModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-3 text-xs text-slate-700">
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-purple-950 font-medium">
                Set up automated savings buckets in your U.S. Bank checking or savings account
                dedicated specifically for travel!
              </div>

              <div className="space-y-2">
                <div className="font-bold text-slate-900">Recommended Vacation Milestones:</div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                  <span>Flights & Transit Budget</span>
                  <strong className="text-slate-900">
                    {wealthScaleMode === 'wealth' ? '$8,500.00' : '$650.00'}
                  </strong>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                  <span>Resort & Accommodation</span>
                  <strong className="text-slate-900">
                    {wealthScaleMode === 'wealth' ? '$18,000.00' : '$1,200.00'}
                  </strong>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                  <span>Dining & Excursions</span>
                  <strong className="text-slate-900">
                    {wealthScaleMode === 'wealth' ? '$6,500.00' : '$450.00'}
                  </strong>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setShowPlanningModal(false)}
                  className="px-4 py-1.5 bg-[#2563EB] text-white font-bold text-xs rounded-xl"
                >
                  Create Trip Budget
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Debit Card Features Modal */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                  FRESHLY FAMILIAR
                </span>
                <h3 className="text-sm font-bold text-slate-900">U.S. Bank Visa® Debit Card</h3>
              </div>
              <button
                onClick={() => setShowCardModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-3 text-xs text-slate-700">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                <CreditCard className="w-6 h-6 text-blue-600 shrink-0" />
                <div className="text-blue-950 font-medium">
                  Enjoy contactless tap-to-pay, zero liability fraud protection, and instant digital
                  card issuance right in your mobile wallet.
                </div>
              </div>

              <ul className="space-y-1.5 list-disc list-inside text-slate-600">
                <li>Made with 85% recycled ocean-bound plastic</li>
                <li>Instant lock and unlock control in the mobile app</li>
                <li>Real-time transaction push alerts</li>
                <li>Zero liability protection against unauthorized charges</li>
              </ul>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowCardModal(false)}
                  className="px-4 py-1.5 bg-[#0C1B33] text-white font-bold text-xs rounded-xl"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: Cash Flow Deep Dive */}
      {showCashFlowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Cash Flow Monitor</h3>
                <p className="text-xs text-slate-500">Month of {selectedMonth} 2026</p>
              </div>
              <button
                onClick={() => setShowCashFlowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-3 text-xs text-slate-700">
              <div
                className={`p-3 rounded-xl font-bold border ${
                  isNetPositive
                    ? 'bg-[#DCFCE7] text-emerald-950 border-emerald-200'
                    : 'bg-amber-50 text-amber-950 border-amber-200'
                }`}
              >
                {isNetPositive
                  ? `Positive Cash Flow (+$${netCashFlow.toLocaleString('en-US', { minimumFractionDigits: 2 })}). Your net cash surplus rate is ${((netCashFlow / totalIncome) * 100).toFixed(1)}% of total income!`
                  : `Net Deficit (-$${Math.abs(netCashFlow).toLocaleString('en-US', { minimumFractionDigits: 2 })}). Spending exceeded incoming deposits.`}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                  <span className="font-semibold text-slate-600">Total Inflows (Income)</span>
                  <span className="font-extrabold text-emerald-700">
                    +${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                  <span className="font-semibold text-slate-600">Total Outflows (Spending)</span>
                  <span className="font-extrabold text-slate-900">
                    -${cashFlowSpending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50 border border-blue-100">
                  <span className="font-bold text-blue-900">Net Cash Balance</span>
                  <span className="font-black text-blue-900">
                    {isNetPositive ? '+' : '-'}${Math.abs(netCashFlow).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowCashFlowModal(false)}
                  className="px-4 py-1.5 bg-[#0C1B33] text-white font-bold text-xs rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: Bills and Subscriptions Manager */}
      {showBillsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Bills & Subscriptions</h3>
                <p className="text-xs text-slate-500">Upcoming automated payments</p>
              </div>
              <button
                onClick={() => setShowBillsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-3 text-xs text-slate-700">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <div className="font-bold text-slate-900">
                      {wealthScaleMode === 'wealth'
                        ? 'Minneapolis Luxury Lofts Penthouse'
                        : 'Netflix Standard HD'}
                    </div>
                    <div className="text-[11px] text-slate-500">Auto-Debit • Scheduled</div>
                  </div>
                  <strong className="text-slate-900">
                    {wealthScaleMode === 'wealth' ? '$6,200.00' : '$19.99'}
                  </strong>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <div className="font-bold text-slate-900">Xcel Energy Power</div>
                    <div className="text-[11px] text-slate-500">Due Oct 27 • Scheduled</div>
                  </div>
                  <strong className="text-slate-900">
                    {wealthScaleMode === 'wealth' ? '$284.50' : '$142.50'}
                  </strong>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <div className="font-bold text-slate-900">Verizon Wireless</div>
                    <div className="text-[11px] text-slate-500">Due Nov 02 • Auto-Pay Active</div>
                  </div>
                  <strong className="text-slate-900">$118.00</strong>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-100 text-[11px] font-medium">
                ✓ All upcoming recurring bills are fully covered by your current checking balance.
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowBillsModal(false)}
                  className="px-4 py-1.5 bg-[#0C1B33] text-white font-bold text-xs rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: Partnership Details Modal */}
      {showPartnershipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#DA291C] text-white flex items-center justify-center font-bold text-[10px]">
                  US
                </div>
                <h3 className="text-sm font-bold text-slate-900">U.S. Bank & NFL Partnership</h3>
              </div>
              <button
                onClick={() => setShowPartnershipModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-3 text-xs text-slate-700">
              <p className="leading-relaxed">
                As the Proud Sponsor of the NFL, U.S. Bank is dedicated to creating positive impact
                on and off the field. Through youth sports grants, financial literacy workshops, and
                exclusive game-day experiences for cardholders, our partnership brings football fans
                and communities together.
              </p>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-[#0C1B33]">Cardholder Perks:</div>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>20% discount on official NFLShop.com merchandise</li>
                  <li>Exclusive pre-sale access to regular season & playoff tickets</li>
                  <li>Free entry to youth skills & flag football training clinics</li>
                </ul>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowPartnershipModal(false)}
                  className="px-4 py-1.5 bg-[#0C1B33] text-white font-bold text-xs rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
