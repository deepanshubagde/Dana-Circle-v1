/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { SanghaImpact } from './components/SanghaImpact';
import { MonthlyTheme } from './components/MonthlyTheme';
import { DonationFlow } from './components/DonationFlow';
import { AdminPanel } from './components/AdminPanel';
import { AppsScriptModal } from './components/AppsScriptModal';
import { NgoConfig, LedgerSummary } from './types';
import { Lock } from 'lucide-react';

const DEFAULT_CONFIG: NgoConfig = {
  ngoName: 'Maha Bodhi Dana Trust & Forest Hermitage',
  themeTitle: 'Monastic Support & Rain-Retreat Vassa Care',
  themeMonth: 'November 2026',
  themeDescription: 'Providing wholesome almsfood, essential medicines, and solar rain-shelter repairs for 48 dwelling monks and silent meditators in rural Bodh Gaya.',
  upiId: 'danacircle@icici',
  bankAccount: '9240100843219',
  ifscCode: 'ICIC0000924',
  bankName: 'ICICI Bank (Bodh Gaya Sacred Sanctuary Branch)',
  qrCodeUrl: '',
  googleAppsScriptUrl: '',
};

const DEFAULT_SUMMARY: LedgerSummary = {
  allTimeTotal: 345750,
  currentMonthTotal: 71000,
  contributionsCount: 143,
  monthlyImpact: [
    { month: 'Jun', amount: 38200 },
    { month: 'Jul', amount: 45000 },
    { month: 'Aug', amount: 52100 },
    { month: 'Sep', amount: 61400 },
    { month: 'Oct', amount: 78050 },
    { month: 'Nov', amount: 71000 },
  ],
  activeMonthName: 'November 2026',
};

export default function App() {
  const [config, setConfig] = useState<NgoConfig>(DEFAULT_CONFIG);
  const [summary, setSummary] = useState<LedgerSummary>(DEFAULT_SUMMARY);
  const [userEmail] = useState<string>('deepanshubagde@gmail.com');
  const [adminOpen, setAdminOpen] = useState<boolean>(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [appsScriptOpen, setAppsScriptOpen] = useState<boolean>(false);

  const contributeFlowRef = useRef<HTMLDivElement>(null);

  // Check URL query parameters for ?admin=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setAdminOpen(true);
    }
  }, []);

  // Fetch initial config and ledger data
  const fetchData = async () => {
    try {
      const [cfgRes, ledgerRes] = await Promise.all([
        fetch('/api/config').catch(() => null),
        fetch('/api/ledger').catch(() => null),
      ]);

      if (cfgRes && cfgRes.ok) {
        const cfgData = await cfgRes.json();
        if (cfgData.success && cfgData.config) {
          setConfig(cfgData.config);
        }
      }

      if (ledgerRes && ledgerRes.ok) {
        const ledgerData = await ledgerRes.json();
        if (ledgerData.success) {
          setSummary({
            allTimeTotal: ledgerData.allTimeTotal,
            currentMonthTotal: ledgerData.currentMonthTotal,
            contributionsCount: ledgerData.contributionsCount,
            monthlyImpact: ledgerData.monthlyImpact,
            activeMonthName: ledgerData.activeMonthName || 'November 2026',
          });
        }
      }
    } catch (e) {
      console.warn('Initial data load notice:', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Triggered when Gemini Vision OCR successfully extracts and records a payment
  const handleDonationRecorded = (amount: number) => {
    // 1. Instantly tick the community counter & monthly graph upward!
    setSummary((prev) => {
      const newAllTime = prev.allTimeTotal + amount;
      const newCurrentMonth = prev.currentMonthTotal + amount;
      const updatedMonthly = prev.monthlyImpact.map((item, idx) => {
        if (idx === prev.monthlyImpact.length - 1 || item.month === 'Nov') {
          return { ...item, amount: item.amount + amount };
        }
        return item;
      });

      return {
        ...prev,
        allTimeTotal: newAllTime,
        currentMonthTotal: newCurrentMonth,
        contributionsCount: prev.contributionsCount + 1,
        monthlyImpact: updatedMonthly,
      };
    });

    // 2. Background re-sync with server
    setTimeout(() => {
      fetch('/api/ledger')
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            setSummary((prev) => ({
              ...prev,
              allTimeTotal: data.allTimeTotal,
              currentMonthTotal: data.currentMonthTotal,
              contributionsCount: data.contributionsCount,
              monthlyImpact: data.monthlyImpact,
            }));
          }
        })
        .catch(() => {});
    }, 1500);
  };

  // Save admin config
  const handleSaveConfig = async (newCfg: NgoConfig, token?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          passcode: 'dana2025',
          config: newCfg,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConfig((prev) => ({ ...prev, ...newCfg }));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Config save error:', err);
      setConfig((prev) => ({ ...prev, ...newCfg }));
      return true;
    }
  };

  const scrollToContribute = () => {
    if (contributeFlowRef.current) {
      contributeFlowRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-stone-700 flex flex-col justify-between selection:bg-[#FFF5EB] selection:text-[#FF9933] relative">
      
      {/* Small Minimalist Button for Admin Access (Header Removed) */}
      <div className="absolute top-4 right-4 z-40">
        <button
          onClick={() => setAdminOpen(true)}
          className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-xs border border-stone-200/90 text-stone-500 hover:text-stone-900 hover:border-stone-400 shadow-2xs transition flex items-center space-x-1.5 text-xs font-medium cursor-pointer"
          title="Admin Access"
        >
          <Lock className="w-3 h-3 text-stone-400" />
          <span className="text-[11px] font-medium">Admin</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 pb-16 pt-2">
        
        {/* 1. Live Sangha Impact Counter & Dynamic Visual Graph with Total Dana Display */}
        <SanghaImpact
          summary={summary}
          activeMonthName={config.themeMonth}
        />

        {/* 2. Monthly Charitable Cause Theme Card */}
        <MonthlyTheme
          config={config}
          onContributeClick={scrollToContribute}
        />

        {/* 3. The 4-Step Donation Flow with Top Progress Bar & AI Extraction */}
        <DonationFlow
          config={config}
          userEmail={userEmail}
          onDonationRecorded={handleDonationRecorded}
          targetRef={contributeFlowRef}
        />

      </main>

      {/* Admin Panel Modal (Restricted & Only Visible to Authenticated Admins) */}
      <AdminPanel
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        isUnlocked={isAdminUnlocked}
        setIsUnlocked={setIsAdminUnlocked}
        userEmail={userEmail}
      />

      {/* Google Apps Script & Deployment Modal (available when triggered) */}
      <AppsScriptModal
        isOpen={appsScriptOpen}
        onClose={() => setAppsScriptOpen(false)}
      />

    </div>
  );
}
