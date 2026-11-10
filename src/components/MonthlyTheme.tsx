import React from 'react';
import { NgoConfig } from '../types';
import { Sparkles, Shield, ArrowDown, MapPin, Building2 } from 'lucide-react';

interface MonthlyThemeProps {
  config: NgoConfig;
  onContributeClick: () => void;
}

export const MonthlyTheme: React.FC<MonthlyThemeProps> = ({ config, onContributeClick }) => {
  return (
    <section className="py-8 bg-stone-50/70 border-y border-stone-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/90 shadow-xs relative overflow-hidden">
          {/* Subtle serene accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF9933]/40 via-[#FF9933] to-[#FF9933]/40"></div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl text-left">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full bg-[#FFF5EB] text-[#FF9933] border border-[#FF9933]/30">
                  {config.themeMonth || 'Current Month Cause'}
                </span>
                <span className="text-xs text-stone-600 font-medium flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-stone-500" />
                  {config.ngoName}
                </span>
              </div>

              {/* Cause Title */}
              <h2 className="text-2xl sm:text-3xl font-serif-sacred font-bold text-stone-900 leading-snug">
                {config.themeTitle}
              </h2>

              {/* Cause Description */}
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-light">
                {config.themeDescription}
              </p>

              {/* Direct Beneficiary & Verification Note */}
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-stone-600">
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-[#FF9933]" />
                  Verified Sangha NGO & Direct Bank Account
                </span>
                <span className="text-stone-300">•</span>
                <span>Zero platform commission or deductions</span>
              </div>
            </div>

            {/* Monkhood Saffron CTA Button */}
            <div className="shrink-0 w-full md:w-auto flex flex-col items-center sm:items-end">
              <button
                onClick={onContributeClick}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#FF9933] hover:bg-[#E68524] text-white font-medium text-base shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2 group"
              >
                <Sparkles className="w-5 h-5 text-amber-100 group-hover:rotate-12 transition-transform" />
                <span className="tracking-wide">Contribute Dana</span>
                <ArrowDown className="w-4 h-4 ml-1 group-hover:translate-y-0.5 transition-transform" />
              </button>
              <span className="text-[11px] text-stone-600 mt-2 text-center md:text-right">
                Direct UPI / Bank Transfer
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
