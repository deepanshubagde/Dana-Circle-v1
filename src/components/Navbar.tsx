import React from 'react';
import { Sparkles, Shield, Code2, Lock } from 'lucide-react';

interface NavbarProps {
  userEmail: string;
  onOpenAdmin: () => void;
  onOpenAppsScript: () => void;
  onScrollToContribute: () => void;
  isAdminUnlocked: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  userEmail,
  onOpenAdmin,
  onOpenAppsScript,
  onScrollToContribute,
  isAdminUnlocked,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-stone-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#FFF5EB] border border-[#FF9933]/30 flex items-center justify-center text-[#FF9933] shadow-xs">
            {/* Mindful Enso / Lotus motif */}
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current" strokeWidth="1.8">
              <path strokeLinecap="round" d="M12 3v4m0 10v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M3 12h4m10 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" opacity="0.3" />
              <circle cx="12" cy="12" r="5" stroke="#FF9933" strokeWidth="2" />
              <path d="M12 8c-1.5 2-1.5 6 0 8 1.5-2 1.5-6 0-8z" fill="#FF9933" opacity="0.75" />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-serif-sacred font-bold tracking-tight text-stone-900">
                Dana Circle
              </span>
              <span className="text-[10px] tracking-widest uppercase font-medium bg-[#FFF5EB] text-[#FF9933] px-2 py-0.5 rounded-full border border-[#FF9933]/20">
                Sangha Portal
              </span>
            </div>
            <p className="text-xs text-stone-500 font-normal">
              Mindful Giving & Collective Impact
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* User authenticated status (per requirements: assume user is authenticated) */}
          <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-stone-50 border border-stone-200/80 text-xs text-stone-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-stone-500 font-light">Signed in:</span>
            <span className="font-medium text-stone-800 truncate max-w-[170px]" title={userEmail}>
              {userEmail}
            </span>
          </div>

          {/* Apps Script Guide modal trigger */}
          <button
            onClick={onOpenAppsScript}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition border border-transparent hover:border-stone-200"
            title="View Google Apps Script Code.gs and Deployment Instructions"
          >
            <Code2 className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">Google Apps Script</span>
          </button>

          {/* Admin trigger */}
          <button
            onClick={onOpenAdmin}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              isAdminUnlocked
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50 border border-transparent hover:border-stone-200'
            }`}
            title="Open Admin Theme & Config Manager"
          >
            <Lock className="w-3.5 h-3.5 text-stone-500" />
            <span>Admin</span>
            {isAdminUnlocked && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            )}
          </button>

          {/* Main CTA button */}
          <button
            onClick={onScrollToContribute}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#FF9933] hover:bg-[#E68524] text-white shadow-xs hover:shadow transition transform active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-100" />
            <span>Contribute</span>
          </button>
        </div>
      </div>
    </header>
  );
};
