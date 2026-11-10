import React, { useState, useEffect } from 'react';
import { NgoConfig } from '../types';
import { GOOGLE_APPS_SCRIPT_CODE } from '../utils/googleAppsScriptCode';
import {
  Lock,
  Unlock,
  Shield,
  ShieldAlert,
  Building2,
  Save,
  CheckCircle,
  AlertCircle,
  LogOut,
  X,
  FileSpreadsheet,
  Code2,
  Copy,
  Check,
  Download,
  KeyRound,
  ExternalLink
} from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: NgoConfig;
  onSaveConfig: (updatedConfig: NgoConfig, token?: string) => Promise<boolean>;
  isUnlocked: boolean;
  setIsUnlocked: (unlocked: boolean) => void;
  userEmail: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  isUnlocked,
  setIsUnlocked,
  userEmail,
}) => {
  const [adminEmail, setAdminEmail] = useState(userEmail || 'deepanshubagde@gmail.com');
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return sessionStorage.getItem('dana_admin_token');
  });

  const [activeTab, setActiveTab] = useState<'theme' | 'gas_code'>('theme');
  const [formData, setFormData] = useState<NgoConfig>({ ...config });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testStatus, setTestStatus] = useState<{ loading: boolean; message: string; ok?: boolean } | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    setFormData({ ...config });
  }, [config]);

  // Check existing session token on load
  useEffect(() => {
    const existingToken = sessionStorage.getItem('dana_admin_token');
    if (existingToken) {
      fetch('/api/admin/verify', {
        headers: { Authorization: `Bearer ${existingToken}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.authenticated) {
            setIsUnlocked(true);
            setAdminToken(existingToken);
          } else {
            sessionStorage.removeItem('dana_admin_token');
            setIsUnlocked(false);
            setAdminToken(null);
          }
        })
        .catch(() => {});
    }
  }, [setIsUnlocked]);

  if (!isOpen) return null;

  // Handle Admin Authentication
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail.trim(),
          passcode: passcode.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.token) {
        sessionStorage.setItem('dana_admin_token', data.token);
        setAdminToken(data.token);
        setIsUnlocked(true);
        setAuthError(null);
        setPasscode('');
      } else {
        setAuthError(data.error || 'Access denied: You do not have administrator permissions.');
      }
    } catch (err: any) {
      setAuthError('Connection error. Please retry.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle Admin Logout
  const handleAdminLogout = async () => {
    if (adminToken) {
      fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      }).catch(() => {});
    }
    sessionStorage.removeItem('dana_admin_token');
    setAdminToken(null);
    setIsUnlocked(false);
    setPasscode('');
    setAuthError(null);
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, qrCodeUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    const success = await onSaveConfig(formData, adminToken || undefined);
    setSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const testGasConnection = async () => {
    if (!formData.googleAppsScriptUrl) {
      setTestStatus({ loading: false, message: 'Please enter a Google Apps Script URL first.', ok: false });
      return;
    }

    setTestStatus({ loading: true, message: 'Testing Google Apps Script webhook...' });

    try {
      const res = await fetch('/api/test-gas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formData.googleAppsScriptUrl }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestStatus({ loading: false, message: 'Connected successfully to Google Apps Script!', ok: true });
      } else {
        setTestStatus({ loading: false, message: `Could not connect: ${data.error || 'Check deployment access permissions.'}`, ok: false });
      }
    } catch (err: any) {
      setTestStatus({ loading: false, message: `Connection error: ${err.message}`, ok: false });
    }
  };

  const handleCopyGasCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 text-left">
        
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-xs border-b border-stone-100 p-5 px-6 flex items-center justify-between z-10">
          <div className="flex items-center space-x-2.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isUnlocked ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-[#FFF5EB] text-[#FF9933] border border-[#FF9933]/30'
            }`}>
              {isUnlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-serif-sacred font-bold text-stone-900 text-lg">
                Admin Control Sanctuary
              </h3>
              <p className="text-xs text-stone-500 font-light">
                {isUnlocked ? 'Authenticated Administrator' : 'Restricted to authorized Sangha admins only'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isUnlocked && (
              <button
                onClick={handleAdminLogout}
                className="px-2.5 py-1 rounded-lg text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 transition flex items-center space-x-1"
                title="Lock & Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lock</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-50 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {!isUnlocked ? (
            /* SECURE ADMIN GATE: ONLY VISIBLE TO AUTHENTICATED ADMINS */
            <form onSubmit={handleAdminLogin} className="py-6 max-w-md mx-auto space-y-5">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 mx-auto rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-700 shadow-2xs">
                  <KeyRound className="w-6 h-6 text-[#FF9933]" />
                </div>
                <h4 className="text-lg font-serif-sacred font-bold text-stone-900">
                  Administrator Verification
                </h4>
                <p className="text-xs text-stone-500 font-light max-w-xs mx-auto">
                  This section is strictly restricted to designated administrators of the Dana Circle portal.
                </p>
              </div>

              {/* Admin Email Input */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-stone-700">
                  Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => {
                    setAdminEmail(e.target.value);
                    setAuthError(null);
                  }}
                  placeholder="admin@danacircle.org"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:border-[#FF9933] focus:ring-2 focus:ring-[#FF9933]/20 focus:outline-none"
                />
              </div>

              {/* Admin Passcode Input */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-stone-700">
                  Admin Passcode
                </label>
                <input
                  type="password"
                  required
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setAuthError(null);
                  }}
                  placeholder="Enter admin passcode (e.g. dana2025)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:border-[#FF9933] focus:ring-2 focus:ring-[#FF9933]/20 focus:outline-none"
                  autoFocus
                />
                <p className="text-[10px] text-stone-400 font-light">
                  Standard passcode: <code className="bg-stone-100 px-1 py-0.5 rounded text-[#FF9933] font-mono">dana2025</code> or <code className="bg-stone-100 px-1 py-0.5 rounded text-[#FF9933] font-mono">sangha</code>
                </p>
              </div>

              {/* Error Message */}
              {authError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-3 rounded-xl bg-[#FF9933] hover:bg-[#E68524] text-white text-xs font-semibold shadow-xs transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{isAuthenticating ? 'Verifying Admin Privileges...' : 'Authenticate as Admin'}</span>
              </button>

              <p className="text-[11px] text-stone-400 text-center font-light">
                Sangha Security: Non-admin visitors cannot access or view configuration.
              </p>
            </form>
          ) : (
            /* AUTHENTICATED ADMIN PAGE */
            <div className="space-y-5">
              
              {/* Authenticated Banner */}
              <div className="p-3 px-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
                <span className="flex items-center space-x-1.5 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Authorized Session: <strong>{adminEmail}</strong></span>
                </span>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Admin Active
                </span>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-stone-100 space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('theme')}
                  className={`py-2 px-3 text-xs font-semibold border-b-2 transition ${
                    activeTab === 'theme'
                      ? 'border-[#FF9933] text-stone-900'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Cause & Payment Setup
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('gas_code')}
                  className={`py-2 px-3 text-xs font-semibold border-b-2 transition flex items-center space-x-1 ${
                    activeTab === 'gas_code'
                      ? 'border-[#FF9933] text-stone-900'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Google Apps Script (Code.gs)</span>
                </button>
              </div>

              {activeTab === 'theme' ? (
                /* Theme Manager Form */
                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* Cause Details */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-stone-100 pb-2">
                      1. Current Month Cause (Step 1 Display)
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1">
                          NGO Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.ngoName}
                          onChange={(e) => setFormData({ ...formData, ngoName: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-900 focus:border-[#FF9933] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1">
                          Theme Month Label *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.themeMonth}
                          onChange={(e) => setFormData({ ...formData, themeMonth: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-900 focus:border-[#FF9933] focus:outline-none"
                          placeholder="e.g. November 2026"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        Theme Title (e.g. Child Welfare, Monastic Support) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.themeTitle}
                        onChange={(e) => setFormData({ ...formData, themeTitle: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-900 focus:border-[#FF9933] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        Description & Funds Allocation *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={formData.themeDescription}
                        onChange={(e) => setFormData({ ...formData, themeDescription: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-900 focus:border-[#FF9933] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-stone-100 pb-2">
                      2. Direct Payment Credentials
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1">
                          UPI ID *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.upiId}
                          onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-mono text-stone-900 focus:border-[#FF9933] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1">
                          Bank Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.bankName}
                          onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-900 focus:border-[#FF9933] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1">
                          Bank Account Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.bankAccount}
                          onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-mono text-stone-900 focus:border-[#FF9933] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1">
                          Bank IFSC Code *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.ifscCode}
                          onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-mono text-stone-900 focus:border-[#FF9933] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* QR Code Upload / Custom Image */}
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        Custom UPI QR Code Image (Optional - defaults to auto-generated SVG)
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleQrUpload}
                          className="text-xs text-stone-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200"
                        />
                        {formData.qrCodeUrl && (
                          <span className="text-[11px] text-emerald-600 font-medium flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" /> Custom QR active
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Google Apps Script Integration */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center space-x-1.5">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-[#FF9933]" />
                        <span>3. Google Apps Script Web App Webhook</span>
                      </h4>
                      <span className="text-[10px] text-stone-400">Sangha Ledger Sync</span>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        Deployed Google Apps Script Web App URL
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="url"
                          value={formData.googleAppsScriptUrl || ''}
                          onChange={(e) => setFormData({ ...formData, googleAppsScriptUrl: e.target.value })}
                          placeholder="https://script.google.com/macros/s/.../exec"
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-mono text-stone-900 focus:border-[#FF9933] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={testGasConnection}
                          disabled={!formData.googleAppsScriptUrl || (testStatus?.loading ?? false)}
                          className="shrink-0 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition disabled:opacity-50"
                        >
                          {testStatus?.loading ? 'Testing...' : 'Test Webhook'}
                        </button>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-1 font-light">
                        Every donation and config update is synced directly to your ledger tabs: "Donation Ledger" & "Config".
                      </p>
                    </div>

                    {testStatus && (
                      <div className={`p-2.5 rounded-xl text-xs flex items-center space-x-2 ${
                        testStatus.ok ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {testStatus.ok ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                        <span>{testStatus.message}</span>
                      </div>
                    )}
                  </div>

                  {/* Submit Buttons */}
                  <div className="pt-4 flex items-center justify-between border-t border-stone-100">
                    {saveSuccess ? (
                      <span className="text-xs text-emerald-600 font-semibold flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Portal config updated successfully!
                      </span>
                    ) : (
                      <span className="text-[11px] text-stone-400 font-light">
                        Overwrites Config row in ledger and updates dashboard
                      </span>
                    )}

                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-medium transition"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 rounded-xl bg-[#FF9933] hover:bg-[#E68524] text-white text-xs font-semibold shadow-xs transition flex items-center space-x-1.5 disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{saving ? 'Saving...' : 'Save & Overwrite Config'}</span>
                      </button>
                    </div>
                  </div>

                </form>
              ) : (
                /* Google Apps Script Code Tab */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-500 font-light">
                      Google Apps Script backend script (Code.gs) for Drive & Sangha Ledger:
                    </span>
                    <button
                      onClick={handleCopyGasCode}
                      className="px-3 py-1.5 rounded-xl bg-[#FF9933] hover:bg-[#E68524] text-white text-xs font-medium transition flex items-center space-x-1"
                    >
                      {codeCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{codeCopied ? 'Copied!' : 'Copy Code.gs'}</span>
                    </button>
                  </div>
                  <pre className="rounded-2xl bg-stone-900 text-stone-100 p-4 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[380px]">
                    {GOOGLE_APPS_SCRIPT_CODE}
                  </pre>
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
