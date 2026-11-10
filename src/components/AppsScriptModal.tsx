import React, { useState } from 'react';
import { GOOGLE_APPS_SCRIPT_CODE } from '../utils/googleAppsScriptCode';
import {
  X,
  Code2,
  Copy,
  Check,
  Download,
  FileSpreadsheet,
  HardDrive,
  ExternalLink,
  Sparkles,
  Layers
} from 'lucide-react';

interface AppsScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppsScriptModal: React.FC<AppsScriptModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'guide' | 'export'>('code');

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadCode = () => {
    const blob = new Blob([GOOGLE_APPS_SCRIPT_CODE], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Code.gs';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 text-left">
        
        {/* Modal Header */}
        <div className="bg-white border-b border-stone-100 p-5 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FFF5EB] border border-[#FF9933]/30 flex items-center justify-center text-[#FF9933]">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-sacred font-bold text-stone-900 text-lg">
                Google Apps Script (Code.gs) & Architecture
              </h3>
              <p className="text-xs text-stone-500 font-light">
                Handles doPost webhook, Google Drive receipt saving, Gemini Vision OCR, and Sangha ledger
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-100 px-6 bg-stone-50/50 shrink-0">
          <button
            onClick={() => setActiveTab('code')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'code'
                ? 'border-[#FF9933] text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            1. Code.gs (Ready to Deploy)
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'guide'
                ? 'border-[#FF9933] text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            2. Apps Script Setup Guide
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'export'
                ? 'border-[#FF9933] text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            3. Pure HTML / Cloudflare Pages Export
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-stone-500 text-xs">
                  Copy and paste this into your Google Apps Script project editor:
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleDownloadCode}
                    className="px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-medium transition flex items-center space-x-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Code.gs</span>
                  </button>
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 rounded-lg bg-[#FF9933] hover:bg-[#E68524] text-white text-xs font-medium transition flex items-center space-x-1 shadow-2xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy Code.gs'}</span>
                  </button>
                </div>
              </div>

              {/* Code display block */}
              <div className="relative rounded-2xl bg-stone-900 text-stone-100 p-4 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[460px] border border-stone-800">
                <pre>{GOOGLE_APPS_SCRIPT_CODE}</pre>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-6 max-w-2xl">
              <div className="p-4 rounded-2xl bg-[#FFF9F2] border border-[#FF9933]/20 space-y-1">
                <h4 className="font-semibold text-stone-900 text-sm flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-[#FF9933]" />
                  <span>3-Minute Google Apps Script & Ledger Setup</span>
                </h4>
                <p className="text-stone-600 font-light">
                  Follow these simple steps to link this portal directly to your own Google Drive and Sangha ledger.
                </p>
              </div>

              <ol className="space-y-4 text-stone-700 text-xs leading-relaxed list-decimal list-inside">
                <li className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <strong className="text-stone-900">Step 1: Create a Ledger Spreadsheet</strong>
                  <p className="text-stone-500 mt-1 pl-4">
                    Open <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-[#FF9933] underline">sheets.new</a> and name it <code className="bg-white px-1 py-0.5 rounded border border-stone-200">Dana Circle Ledger</code>.
                  </p>
                </li>

                <li className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <strong className="text-stone-900">Step 2: Open Apps Script Editor</strong>
                  <p className="text-stone-500 mt-1 pl-4">
                    Inside the spreadsheet, click the top menu: <strong className="text-stone-800">Extensions &gt; Apps Script</strong>.
                  </p>
                </li>

                <li className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <strong className="text-stone-900">Step 3: Paste Code.gs</strong>
                  <p className="text-stone-500 mt-1 pl-4">
                    Delete any existing template in <code className="bg-white px-1 py-0.5 rounded border border-stone-200">Code.gs</code>, paste the code from Tab 1, and press <kbd className="bg-white px-1.5 py-0.5 rounded border text-[10px]">Ctrl+S</kbd> to save.
                  </p>
                </li>

                <li className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <strong className="text-stone-900">Step 4: Set Gemini API Key in Script Properties</strong>
                  <p className="text-stone-500 mt-1 pl-4">
                    In Apps Script left sidebar, click <strong>Project Settings (gear icon)</strong> &gt; Scroll to <strong>Script Properties</strong> &gt; Add:
                    <br />
                    Property: <code className="font-mono text-stone-900 font-bold">GEMINI_API_KEY</code> = Your Gemini API key from Google AI Studio.
                    <br />
                    (Optional) Property: <code className="font-mono text-stone-900 font-bold">DRIVE_FOLDER_ID</code> = Google Drive folder ID where receipts should be stored.
                  </p>
                </li>

                <li className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <strong className="text-stone-900">Step 5: Deploy as Web App</strong>
                  <p className="text-stone-500 mt-1 pl-4">
                    Click top right: <strong>Deploy &gt; New deployment</strong> &gt; Select type: <strong>Web app</strong>.
                    <br />
                    - Execute as: <strong>Me</strong>
                    <br />
                    - Who has access: <strong>Anyone</strong> (critical for browser upload webhook).
                    <br />
                    Click <strong>Deploy</strong> and copy the generated Web App URL.
                  </p>
                </li>

                <li className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <strong className="text-stone-900">Step 6: Paste into Dana Circle Admin Panel</strong>
                  <p className="text-stone-500 mt-1 pl-4">
                    Open the Dana Circle Admin panel (?admin=true), paste your Web App URL into <strong>Google Apps Script Webhook</strong>, and click <strong>Test Webhook</strong>!
                  </p>
                </li>
              </ol>

              {/* Sheet Columns Preview */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="font-semibold text-stone-800 text-xs">
                  Automated Ledger Tabs Created:
                </span>
                <div className="space-y-1.5 text-stone-600 text-[11px]">
                  <div>
                    <strong className="text-stone-800">1. "Donation Ledger":</strong> [Timestamp] | [User Email] | [Month/Theme] | [Extracted Amount] | [Drive File URL]
                  </div>
                  <div>
                    <strong className="text-stone-800">2. "Config":</strong> [NGO Name] | [Theme Title] | [Month] | [Description] | [UPI ID] | [Bank Account] | [IFSC Code] | [Bank Name] | [QR Code URL]
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4 max-w-2xl text-stone-700">
              <div className="p-4 rounded-2xl bg-[#FFF9F2] border border-[#FF9933]/20 space-y-1">
                <h4 className="font-semibold text-stone-900 text-sm flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-[#FF9933]" />
                  <span>Cloudflare Pages & GitHub Pages Deployment</span>
                </h4>
                <p className="text-stone-600 font-light">
                  The Dana Circle frontend requires zero build servers if you prefer hosting it as a pure standalone static HTML/JS file directly talking to your Google Apps Script backend!
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <h5 className="font-semibold text-stone-900">
                  Architecture Overview:
                </h5>
                <p className="text-stone-600 text-xs leading-relaxed">
                  • <strong>Hosting:</strong> Cloudflare Pages or GitHub Pages (free, global edge CDN).
                  <br />
                  • <strong>Backend & Database:</strong> Google Apps Script connected to cloud ledger and Google Drive (for receipt storage).
                  <br />
                  • <strong>AI Engine:</strong> Gemini Vision API (for OCR on payment receipts).
                  <br />
                  • <strong>No SQL / Mongo:</strong> 100% serverless, zero maintenance, free tier forever.
                </p>
              </div>

              <div className="pt-2 flex justify-start">
                <a
                  href="/standalone-portal.html"
                  download="index.html"
                  className="px-5 py-2.5 rounded-xl bg-[#FF9933] hover:bg-[#E68524] text-white font-medium text-xs shadow-xs transition flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Standalone index.html for Cloudflare Pages</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-stone-100 flex justify-end shrink-0 bg-stone-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-medium transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
