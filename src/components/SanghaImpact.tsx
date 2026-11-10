import React, { useState, useEffect } from 'react';
import { LedgerSummary } from '../types';
import {
  TrendingUp,
  Calendar,
  HeartHandshake,
  EyeOff,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUpRight,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';

interface SanghaImpactProps {
  summary: LedgerSummary;
  activeMonthName?: string;
}

type GraphTab = 'curve' | 'bars' | 'allocation';

export const SanghaImpact: React.FC<SanghaImpactProps> = ({
  summary,
  activeMonthName = 'November 2026',
}) => {
  const [filter, setFilter] = useState<'all' | 'month'>('all');
  const [displayAmount, setDisplayAmount] = useState<number>(summary.allTimeTotal);
  const [activeTab, setActiveTab] = useState<GraphTab>('curve');
  const [hoveredPoint, setHoveredPoint] = useState<{ month: string; amount: number; idx: number } | null>(null);

  const targetAmount = filter === 'all' ? summary.allTimeTotal : summary.currentMonthTotal;

  // Smooth number ticker animation when amount changes or filter flips
  useEffect(() => {
    let startTimestamp: number | null = null;
    const initial = displayAmount;
    const target = targetAmount;
    const duration = 800; // ms

    if (initial === target) return;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(initial + (target - initial) * eased);
      setDisplayAmount(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayAmount(target);
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [targetAmount]);

  // Data helpers for the graphical representation
  const data = summary.monthlyImpact;
  const maxMonthly = Math.max(...data.map((m) => m.amount), 90000);
  const minMonthly = Math.min(...data.map((m) => m.amount), 20000);

  // SVG Area Curve math coordinates
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingBottom = 40;
  const paddingTop = 30;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * chartWidth;
    const normalizedY = (d.amount - 20000) / (maxMonthly * 1.1 - 20000);
    const y = svgHeight - paddingBottom - normalizedY * chartHeight;
    return { x, y, ...d, idx: i };
  });

  // Generate smooth SVG Bézier path
  const generateSmoothPath = (pts: typeof points) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp1y = p0.y;
      const cp2x = p0.x + (p1.x - p0.x) / 2;
      const cp2y = p1.y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const linePath = generateSmoothPath(points);
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingBottom} L ${points[0].x} ${svgHeight - paddingBottom} Z`
    : '';

  // Calculate percentage growth from first recorded month
  const firstMonthAmt = data[0]?.amount || 1;
  const currentMonthAmt = data[data.length - 1]?.amount || 1;
  const growthPercent = Math.round(((currentMonthAmt - firstMonthAmt) / firstMonthAmt) * 100);

  // Cause Allocation breakdown data
  const allocations = [
    { name: 'Monastic Almsfood & Daily Meals', percent: 40, color: '#FF9933', desc: 'Warm wholesome meals for 48 dwelling monks' },
    { name: 'Medical Care & Herbal Alms', percent: 28, color: '#E68524', desc: 'Geriatric monastery medicines and clinics' },
    { name: 'Rain-Retreat Vassa Shelter Upkeep', percent: 20, color: '#FDBA74', desc: 'Solar roof leakproofing & kutis maintenance' },
    { name: 'Sacred Clean Water Filtration', percent: 12, color: '#FED7AA', desc: 'Borewell solar purification systems' },
  ];

  return (
    <section className="pt-8 pb-12 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        
        {/* Subtle Zen Kicker */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-stone-50 border border-stone-200 text-stone-600 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF9933] animate-pulse"></span>
          <span>Live Sangha Impact Ledger</span>
          <span className="text-stone-300">•</span>
          <span className="text-stone-500">Verified Ledger</span>
        </div>

        {/* GRAPHICAL REPRESENTATION OF SANGHA IMPACT */}
        <div className="rounded-3xl bg-white border border-stone-200/90 shadow-sm p-6 sm:p-7 mb-8 text-left transition-all">
          
          {/* Graph Header with Tabs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
            <div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-[#FF9933]" />
                <h3 className="text-xs uppercase tracking-wider font-bold text-stone-800">
                  Graphical Representation • Sangha Trajectory
                </h3>
              </div>
              <p className="text-xs text-stone-500 font-light mt-0.5">
                Real-time donation flow verified across Sangha ledger records
              </p>
            </div>

            {/* View Mode Tabs (Scrollable on small mobile screens) */}
            <div className="flex items-center space-x-1 bg-stone-100/80 p-1 rounded-xl text-xs overflow-x-auto max-w-full">
              <button
                onClick={() => setActiveTab('curve')}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1.5 shrink-0 ${
                  activeTab === 'curve'
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Continuous Growth Curve"
              >
                <LineChart className="w-3.5 h-3.5 text-[#FF9933]" />
                <span>Growth Curve</span>
              </button>

              <button
                onClick={() => setActiveTab('bars')}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1.5 shrink-0 ${
                  activeTab === 'bars'
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Monthly Breakdown"
              >
                <BarChart3 className="w-3.5 h-3.5 text-[#FF9933]" />
                <span>Monthly Bars</span>
              </button>

              <button
                onClick={() => setActiveTab('allocation')}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1.5 shrink-0 ${
                  activeTab === 'allocation'
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Fund Allocation Breakdown"
              >
                <PieChart className="w-3.5 h-3.5 text-[#FF9933]" />
                <span>Allocation</span>
              </button>
            </div>
          </div>

          {/* NUMBER SHOWING TOTAL AMOUNT OF DANA GIVEN SO FAR INSIDE THE GRAPHICAL REPRESENTATION */}
          <div className="my-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FFF5EB] via-[#FFF9F2] to-white border border-[#FF9933]/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#FF9933] flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FF9933]" />
                <span>Total Amount of Dana Given So Far</span>
              </span>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-2xl sm:text-3xl font-light text-[#FF9933]">₹</span>
                <span className="text-3xl sm:text-4xl font-bold font-serif-sacred text-stone-900 tracking-tight">
                  {summary.allTimeTotal.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-semibold text-stone-500 ml-1.5 uppercase">INR</span>
              </div>
              <p className="text-[11px] text-stone-500 font-light mt-0.5">
                100% direct bank & UPI offerings registered in the Sangha ledger
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:space-x-3 text-xs w-full md:w-auto">
              <div className="px-3 py-2 rounded-xl bg-white border border-stone-200/90 shadow-2xs text-center sm:text-left">
                <span className="text-[10px] uppercase tracking-wider text-stone-500 block font-medium">This Month</span>
                <span className="font-bold text-stone-900 text-sm">₹{summary.currentMonthTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-white border border-stone-200/90 shadow-2xs text-center sm:text-left">
                <span className="text-[10px] uppercase tracking-wider text-stone-500 block font-medium">Dana Acts</span>
                <span className="font-bold text-stone-900 text-sm">{summary.contributionsCount} offerings</span>
              </div>
            </div>
          </div>

          {/* VIEW 1: SVG SMOOTH AREA GROWTH CURVE */}
          {activeTab === 'curve' && (
            <div className="pt-6 pb-2">
              <div className="relative w-full overflow-hidden">
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full h-auto overflow-visible"
                >
                  <defs>
                    {/* Saffron area gradient */}
                    <linearGradient id="saffronAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF9933" stopOpacity="0.32" />
                      <stop offset="60%" stopColor="#FF9933" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#FF9933" stopOpacity="0.0" />
                    </linearGradient>

                    {/* Horizontal grid dash pattern */}
                    <linearGradient id="lineStrokeGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#E68524" />
                      <stop offset="100%" stopColor="#FF9933" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Guideline Marks */}
                  {[0.25, 0.5, 0.75, 1].map((ratio) => {
                    const y = svgHeight - paddingBottom - ratio * chartHeight;
                    const value = Math.round(20000 + ratio * (maxMonthly * 1.1 - 20000));
                    return (
                      <g key={ratio}>
                        <line
                          x1={paddingX}
                          y1={y}
                          x2={svgWidth - paddingX}
                          y2={y}
                          stroke="#F0EFEB"
                          strokeDasharray="4 4"
                          strokeWidth="1"
                        />
                        <text
                          x={paddingX - 8}
                          y={y + 3}
                          fontSize="9"
                          fill="#A8A29E"
                          textAnchor="end"
                          fontFamily="sans-serif"
                        >
                          ₹{(value / 1000).toFixed(0)}k
                        </text>
                      </g>
                    );
                  })}

                  {/* Shaded Area Fill */}
                  <path d={areaPath} fill="url(#saffronAreaGradient)" />

                  {/* Main Bézier Smooth Line */}
                  <path
                    d={linePath}
                    fill="none"
                    stroke="url(#lineStrokeGradient)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data Points on the Curve */}
                  {points.map((pt) => {
                    const isLast = pt.idx === points.length - 1;
                    const isHovered = hoveredPoint?.month === pt.month;

                    return (
                      <g
                        key={pt.month}
                        className="cursor-pointer transition-transform duration-200"
                        onMouseEnter={() => setHoveredPoint(pt)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      >
                        {/* Outer ping on the active / current month */}
                        {isLast && (
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="10"
                            fill="#FF9933"
                            opacity="0.25"
                            className="animate-ping"
                          />
                        )}

                        {/* Interactive circle */}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? 7 : isLast ? 6 : 4.5}
                          fill={isLast ? '#FF9933' : '#FFFFFF'}
                          stroke="#FF9933"
                          strokeWidth={isLast ? 2.5 : 2}
                        />

                        {/* Month X-Axis Label */}
                        <text
                          x={pt.x}
                          y={svgHeight - 14}
                          fontSize="11"
                          fontWeight={isLast ? '700' : '500'}
                          fill={isLast ? '#FF9933' : '#78716C'}
                          textAnchor="middle"
                          fontFamily="sans-serif"
                        >
                          {pt.month}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Floating Tooltip card */}
                {hoveredPoint && (
                  <div
                    className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all bg-stone-900 text-white rounded-xl py-1.5 px-3 shadow-lg text-xs"
                    style={{
                      left: `${(hoveredPoint.idx / (data.length - 1)) * 86 + 7}%`,
                      top: '25%',
                    }}
                  >
                    <div className="font-semibold">{hoveredPoint.month} Offering</div>
                    <div className="text-[#FF9933] font-bold text-sm">
                      ₹{hoveredPoint.amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                )}
              </div>

              {/* Graphical Insights Footer */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF9933]"></span>
                  <span className="text-stone-700 font-medium">Cumulative Sangha Dana Stream</span>
                  <span className="text-stone-300">•</span>
                  <span>June - {activeMonthName}</span>
                </div>
                <div className="text-[11px] text-stone-500 font-light">
                  Tip: Hover over data nodes to view verified sums
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: MONTHLY BARS BREAKDOWN */}
          {activeTab === 'bars' && (
            <div className="pt-6 pb-2">
              <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-48 px-2 border-b border-stone-200">
                {summary.monthlyImpact.map((item, idx) => {
                  const isCurrent = item.month === 'Nov' || idx === summary.monthlyImpact.length - 1;
                  const heightPercent = Math.max(14, Math.round((item.amount / maxMonthly) * 100));

                  return (
                    <div key={item.month} className="group relative flex flex-col items-center h-full justify-end">
                      {/* Amount above bar */}
                      <span className="text-[10px] sm:text-xs font-semibold text-stone-700 mb-1.5 transition-colors group-hover:text-[#FF9933]">
                        ₹{(item.amount / 1000).toFixed(0)}k
                      </span>

                      {/* Bar */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[48px] rounded-t-xl transition-all duration-700 ease-out flex items-start justify-center relative ${
                          isCurrent
                            ? 'bg-gradient-to-t from-[#E68524] to-[#FF9933] shadow-xs ring-2 ring-[#FF9933]/30'
                            : 'bg-stone-200 hover:bg-stone-300'
                        }`}
                      >
                        {isCurrent && (
                          <span className="w-2 h-2 mt-2 rounded-full bg-white animate-ping"></span>
                        )}
                      </div>

                      {/* Month Label */}
                      <span className={`mt-2.5 text-xs font-medium ${isCurrent ? 'text-[#FF9933] font-bold' : 'text-stone-600'}`}>
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 mt-4 pt-1">
                <span>Verified against authentic ledger records.</span>
                <span className="flex items-center space-x-1.5 mt-1 sm:mt-0 text-[#FF9933]">
                  <span className="w-2 h-2 rounded-full bg-[#FF9933]"></span>
                  <span className="font-semibold">Active Month ({activeMonthName})</span>
                </span>
              </div>
            </div>
          )}

          {/* VIEW 3: FUND ALLOCATION BREAKDOWN */}
          {activeTab === 'allocation' && (
            <div className="pt-6 pb-2 space-y-5">
              <div className="text-xs text-stone-600 font-light">
                Direct distribution of all Sangha offerings (100% direct with zero intermediary fees):
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allocations.map((alloc) => (
                  <div
                    key={alloc.name}
                    className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/80 flex items-start space-x-3.5"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 text-white"
                      style={{ backgroundColor: alloc.color }}
                    >
                      {alloc.percent}%
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-stone-900">{alloc.name}</h4>
                      <p className="text-[11px] text-stone-500 font-light leading-snug">
                        {alloc.desc}
                      </p>
                      {/* Mini progress track */}
                      <div className="w-full bg-stone-200 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${alloc.percent}%`, backgroundColor: alloc.color }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Privacy Note (Strict Requirement #2: Individual amounts must never be visible) */}
        <div className="inline-flex items-center space-x-2 text-xs text-stone-600 bg-white py-2 px-4 rounded-full border border-stone-200">
          <EyeOff className="w-3.5 h-3.5 text-stone-500" />
          <span>
            <strong>Sangha Privacy Principle:</strong> Individual donor amounts and identities are strictly private. Only aggregate communal impact is published.
          </span>
        </div>

      </div>
    </section>
  );
};
