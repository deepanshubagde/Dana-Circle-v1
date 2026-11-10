import React, { useState, useRef } from 'react';
import { NgoConfig, DonationStep, ExtractionResult } from '../types';
import { generateUpiQrSvg } from '../utils/qrCodeGenerator';
import { SAMPLE_RECEIPTS, generateReceiptCanvasDataUrl, SampleReceipt } from '../utils/sampleReceipts';
import {
  QrCode,
  Copy,
  Check,
  UploadCloud,
  FileText,
  Building2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Info,
  Maximize2,
  TrendingUp
} from 'lucide-react';

interface DonationFlowProps {
  config: NgoConfig;
  userEmail: string;
  onDonationRecorded: (amount: number) => void;
  targetRef?: React.RefObject<HTMLDivElement | null>;
}

export const DonationFlow: React.FC<DonationFlowProps> = ({
  config,
  userEmail,
  onDonationRecorded,
  targetRef,
}) => {
  const [currentStep, setCurrentStep] = useState<DonationStep>(1);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isDragging, setIsDragging] = useState(false);

  // AI Extraction state
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  // File processing helper
  const processFile = (file: File) => {
    if (!file) return;
    setSelectedFile(file);
    setExtractionError(null);
    setMimeType(file.type || 'image/jpeg');

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Sample receipt handler for instant demonstration
  const handleLoadSample = (sample: SampleReceipt) => {
    const dataUrl = generateReceiptCanvasDataUrl(sample, config.ngoName, config.upiId);
    setPreviewUrl(dataUrl);
    setMimeType('image/jpeg');
    setSelectedFile(new File(['sample'], `${sample.id}.jpg`, { type: 'image/jpeg' }));
    setExtractionError(null);
  };

  // Perform AI extraction with Gemini Vision
  const handleExtractProof = async () => {
    if (!previewUrl) {
      setExtractionError('Please select or upload a payment receipt screenshot.');
      return;
    }

    setIsExtracting(true);
    setExtractionError(null);
    setCurrentStep(4);

    try {
      // Send receipt to backend OCR endpoint
      const response = await fetch('/api/extract-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: previewUrl,
          mimeType: mimeType || 'image/jpeg',
          userEmail,
          monthTheme: config.themeTitle,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to extract payment amount.');
      }

      const result: ExtractionResult = {
        amount: data.amount,
        currency: data.currency || 'INR',
        transactionId: data.transactionId || `TXN${Date.now().toString().slice(-6)}`,
        timestamp: data.timestamp || new Date().toISOString(),
        message: data.message || `Thank you. Your act of Dana of ₹${data.amount.toLocaleString('en-IN')} has been recorded in the Sangha ledger.`,
        driveFileUrl: data.driveFileUrl,
      };

      setExtractionResult(result);
      // Immediately notify parent to tick community counter and graph upward
      onDonationRecorded(result.amount);
    } catch (err: any) {
      console.error('Extraction error:', err);
      setExtractionError(err.message || 'Unable to analyze payment receipt. Please retry.');
      // Return to step 3 so user can re-try
      setCurrentStep(3);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleResetFlow = () => {
    setCurrentStep(1);
    setSelectedFile(null);
    setPreviewUrl(null);
    setExtractionResult(null);
    setExtractionError(null);
  };

  // Generate SVG QR code string
  const upiSvg = generateUpiQrSvg(config.upiId, config.ngoName);

  return (
    <section id="contribute-flow" ref={targetRef} className="py-12 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center mb-8">
          <span className="text-[11px] uppercase tracking-widest font-semibold text-[#FF9933] bg-[#FFF5EB] px-3 py-1 rounded-full border border-[#FF9933]/20">
            Sacred Offering Journey
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif-sacred font-bold text-stone-900 mt-2">
            The Act of Dana
          </h2>
          <p className="text-stone-500 text-sm max-w-lg mx-auto mt-1 font-light">
            Give directly from your heart and your personal banking app. Our AI ledger ensures full transparency.
          </p>
        </div>

        {/* 4-STEP TOP PROGRESS BAR */}
        <div className="mb-10 px-2 sm:px-6">
          <div className="relative flex items-center justify-between">
            {/* Connecting Track Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-stone-200 z-0"></div>
            {/* Active Highlight Line */}
            <div
              className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-[#FF9933] transition-all duration-500 z-0"
              style={{
                width:
                  currentStep === 1
                    ? '0%'
                    : currentStep === 2
                    ? '33.3%'
                    : currentStep === 3
                    ? '66.6%'
                    : '100%',
              }}
            ></div>

            {/* Step 1 Indicator */}
            <div className="relative z-10 flex flex-col items-center">
              <button
                onClick={() => !isExtracting && setCurrentStep(1)}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  currentStep > 1
                    ? 'bg-[#FF9933] text-white shadow-xs'
                    : currentStep === 1
                    ? 'bg-[#FF9933] text-white ring-4 ring-[#FF9933]/20'
                    : 'bg-white border-2 border-stone-300 text-stone-500'
                }`}
              >
                {currentStep > 1 ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" /> : '1'}
              </button>
              <span className={`text-[10px] sm:text-xs mt-1.5 sm:mt-2 font-medium whitespace-nowrap ${currentStep >= 1 ? 'text-stone-900 font-semibold' : 'text-stone-400'}`}>
                <span className="inline sm:hidden">1. Cause</span>
                <span className="hidden sm:inline">1. Select Cause</span>
              </span>
            </div>

            {/* Step 2 Indicator */}
            <div className="relative z-10 flex flex-col items-center">
              <button
                onClick={() => !isExtracting && setCurrentStep(2)}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  currentStep > 2
                    ? 'bg-[#FF9933] text-white shadow-xs'
                    : currentStep === 2
                    ? 'bg-[#FF9933] text-white ring-4 ring-[#FF9933]/20'
                    : 'bg-white border-2 border-stone-300 text-stone-500'
                }`}
              >
                {currentStep > 2 ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" /> : '2'}
              </button>
              <span className={`text-[10px] sm:text-xs mt-1.5 sm:mt-2 font-medium whitespace-nowrap ${currentStep >= 2 ? 'text-stone-900 font-semibold' : 'text-stone-400'}`}>
                <span className="inline sm:hidden">2. Donate</span>
                <span className="hidden sm:inline">2. Make Donation</span>
              </span>
            </div>

            {/* Step 3 Indicator */}
            <div className="relative z-10 flex flex-col items-center">
              <button
                onClick={() => !isExtracting && setCurrentStep(3)}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  currentStep > 3
                    ? 'bg-[#FF9933] text-white shadow-xs'
                    : currentStep === 3
                    ? 'bg-[#FF9933] text-white ring-4 ring-[#FF9933]/20'
                    : 'bg-white border-2 border-stone-300 text-stone-500'
                }`}
              >
                {currentStep > 3 ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" /> : '3'}
              </button>
              <span className={`text-[10px] sm:text-xs mt-1.5 sm:mt-2 font-medium whitespace-nowrap ${currentStep >= 3 ? 'text-stone-900 font-semibold' : 'text-stone-400'}`}>
                <span className="inline sm:hidden">3. Proof</span>
                <span className="hidden sm:inline">3. Upload Proof</span>
              </span>
            </div>

            {/* Step 4 Indicator */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  currentStep === 4 && extractionResult
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/20'
                    : currentStep === 4
                    ? 'bg-[#FF9933] text-white animate-pulse'
                    : 'bg-white border-2 border-stone-300 text-stone-500'
                }`}
              >
                {currentStep === 4 && extractionResult ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" /> : '4'}
              </div>
              <span className={`text-[10px] sm:text-xs mt-1.5 sm:mt-2 font-medium whitespace-nowrap ${currentStep === 4 ? 'text-stone-900 font-semibold' : 'text-stone-400'}`}>
                <span className="inline sm:hidden">4. Blessing</span>
                <span className="hidden sm:inline">4. Sangha Blessing</span>
              </span>
            </div>
          </div>
        </div>

        {/* STEP 1: SELECT CAUSE (Active NGO Details) */}
        {currentStep === 1 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs">
            <div className="max-w-2xl mx-auto text-left space-y-6">
              
              <div className="border-b border-stone-100 pb-5">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#FF9933]">
                  Active Recipient NGO
                </span>
                <h3 className="text-2xl font-serif-sacred font-bold text-stone-900 mt-1">
                  {config.ngoName}
                </h3>
                <p className="text-stone-600 text-sm mt-2 font-light leading-relaxed">
                  {config.themeDescription}
                </p>
              </div>

              {/* Banking & UPI Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* UPI ID Card */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500">
                      Direct UPI ID
                    </span>
                    <p className="font-mono text-sm sm:text-base font-semibold text-stone-900 mt-0.5">
                      {config.upiId}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(config.upiId, 'upi')}
                    className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-[#FF9933] hover:border-[#FF9933] transition"
                    title="Copy UPI ID"
                  >
                    {copiedKey === 'upi' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Bank Name Card */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500">
                    Beneficiary Bank
                  </span>
                  <p className="text-sm font-semibold text-stone-900 mt-0.5 truncate" title={config.bankName}>
                    {config.bankName}
                  </p>
                </div>

                {/* Bank Account Number Card */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500">
                      Bank Account Number
                    </span>
                    <p className="font-mono text-sm sm:text-base font-semibold text-stone-900 mt-0.5">
                      {config.bankAccount}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(config.bankAccount, 'acc')}
                    className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-[#FF9933] hover:border-[#FF9933] transition"
                    title="Copy Account Number"
                  >
                    {copiedKey === 'acc' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* IFSC Code Card */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500">
                      Bank IFSC Code
                    </span>
                    <p className="font-mono text-sm sm:text-base font-semibold text-stone-900 mt-0.5">
                      {config.ifscCode}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(config.ifscCode, 'ifsc')}
                    className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-[#FF9933] hover:border-[#FF9933] transition"
                    title="Copy IFSC Code"
                  >
                    {copiedKey === 'ifsc' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* QR Code Teaser */}
              <div className="p-4 rounded-2xl bg-[#FFF9F2] border border-[#FF9933]/20 flex items-center space-x-4">
                <div className="w-14 h-14 bg-white rounded-xl p-1 border border-stone-200 shrink-0 flex items-center justify-center">
                  <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: upiSvg }} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-stone-900">
                    Instant UPI QR Code Available
                  </h4>
                  <p className="text-xs text-stone-600 font-light mt-0.5">
                    Works directly with PhonePe, Google Pay, Paytm, BHIM, CRED, and all Indian bank apps.
                  </p>
                </div>
              </div>

              {/* Step 1 Next Button */}
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#FF9933] hover:bg-[#E68524] text-white font-medium text-sm shadow-xs transition flex items-center justify-center space-x-2"
                >
                  <span>Proceed to Step 2: Make Donation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* STEP 2: MAKE DONATION (Static instruction text & QR Code) */}
        {currentStep === 2 && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/90 shadow-xs">
            <div className="max-w-2xl mx-auto text-center space-y-6">

              {/* STATIC INSTRUCTION TEXT PER REQUIREMENT #3 */}
              <div className="p-5 rounded-2xl bg-[#FFF9F2] border border-[#FF9933]/30 text-stone-800 text-sm sm:text-base font-normal leading-relaxed text-center">
                <p className="font-medium text-stone-900">
                  "Please scan this QR code or use the account details to make your contribution directly via your personal banking/UPI app. Take a screenshot of the successful payment."
                </p>
              </div>

              {/* Scannable UPI QR Code Card */}
              <div className="inline-block p-6 rounded-3xl bg-white border-2 border-stone-200/80 shadow-sm">
                <div className="w-56 h-56 mx-auto bg-white p-2 rounded-2xl border border-stone-100 shadow-inner flex items-center justify-center">
                  {config.qrCodeUrl ? (
                    <img
                      src={config.qrCodeUrl}
                      alt="UPI QR Code"
                      className="w-full h-full object-contain rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: upiSvg }} />
                  )}
                </div>

                <div className="mt-4 space-y-1">
                  <p className="text-xs uppercase tracking-wider text-stone-500 font-semibold">
                    UPI ID: <span className="font-mono text-stone-900 font-bold">{config.upiId}</span>
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Scan with Google Pay, PhonePe, Paytm, or Mobile Banking
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => handleCopy(config.upiId, 'step2_upi')}
                    className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-700 hover:border-[#FF9933] transition flex items-center space-x-1"
                  >
                    {copiedKey === 'step2_upi' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'step2_upi' ? 'UPI ID Copied' : 'Copy UPI ID'}</span>
                  </button>

                  <button
                    onClick={() => handleCopy(config.bankAccount, 'step2_acc')}
                    className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-700 hover:border-[#FF9933] transition flex items-center space-x-1"
                  >
                    {copiedKey === 'step2_acc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'step2_acc' ? 'Account Copied' : 'Copy Account'}</span>
                  </button>

                  {/* Direct Mobile UPI Link */}
                  <a
                    href={`upi://pay?pa=${encodeURIComponent(config.upiId.trim())}&pn=${encodeURIComponent(config.ngoName.trim())}&cu=INR`}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#FFF5EB] border border-[#FF9933]/40 text-[#FF9933] hover:bg-[#FF9933] hover:text-white text-xs font-semibold transition flex items-center justify-center space-x-1.5 shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Mobile UPI App</span>
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-medium transition flex items-center justify-center space-x-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Cause</span>
                </button>

                <button
                  onClick={() => setCurrentStep(3)}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#FF9933] hover:bg-[#E68524] text-white font-medium text-sm shadow-xs transition flex items-center justify-center space-x-2"
                >
                  <span>I Have Made the Contribution → Upload Proof</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* STEP 3: UPLOAD PROOF (Drag-and-Drop zone for .jpg, .png, .pdf) */}
        {currentStep === 3 && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/90 shadow-xs">
            <div className="max-w-2xl mx-auto space-y-6">

              <div className="text-center">
                <h3 className="text-xl font-serif-sacred font-bold text-stone-900">
                  Upload Payment Screenshot or Receipt
                </h3>
                <p className="text-stone-500 text-xs sm:text-sm mt-1 font-light">
                  Our Gemini Vision OCR will read the exact numerical INR amount and record it in the Sangha ledger.
                </p>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    processFile(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? 'border-[#FF9933] bg-[#FFF5EB]/50 scale-[1.01]'
                    : previewUrl
                    ? 'border-emerald-300 bg-stone-50/50'
                    : 'border-stone-200 hover:border-[#FF9933]/60 hover:bg-stone-50/70'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      processFile(e.target.files[0]);
                    }
                  }}
                />

                {previewUrl ? (
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-36 h-48 rounded-xl overflow-hidden border border-stone-200 shadow-sm bg-white flex items-center justify-center">
                      {mimeType.includes('pdf') ? (
                        <div className="flex flex-col items-center text-stone-500">
                          <FileText className="w-12 h-12 text-[#FF9933] mb-1" />
                          <span className="text-[11px] font-semibold">PDF Receipt</span>
                        </div>
                      ) : (
                        <img
                          src={previewUrl}
                          alt="Receipt Preview"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    <div className="text-xs">
                      <span className="font-medium text-stone-800">
                        {selectedFile?.name || 'receipt_screenshot.jpg'}
                      </span>
                      <p className="text-stone-400 text-[11px]">
                        Click or drag to replace with another receipt
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-[#FFF5EB] border border-[#FF9933]/30 flex items-center justify-center text-[#FF9933]">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-800">
                        Click to upload or drag & drop proof
                      </p>
                      <p className="text-xs text-stone-400 mt-1">
                        Accepts JPG, PNG, and PDF receipts (PhonePe, GPay, Paytm, etc.)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message if any */}
              {extractionError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                  <Info className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{extractionError}</span>
                </div>
              )}

              {/* Instant Test / Demo Receipts Bar */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-stone-700 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF9933]" />
                    <span>Quick Demo: Test with Sample UPI Receipts</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                    Instant Preview
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 font-light mb-3">
                  Don't have a real screenshot right now? Tap one of these realistic UPI receipts to test Gemini Vision OCR immediately:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {SAMPLE_RECEIPTS.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => handleLoadSample(sample)}
                      className="px-3 py-2 rounded-xl bg-white border border-stone-200 hover:border-[#FF9933] text-stone-800 hover:text-[#FF9933] text-xs font-medium text-left transition flex items-center justify-between group shadow-2xs"
                    >
                      <div>
                        <div className="text-[11px] text-stone-400 font-normal">{sample.appName}</div>
                        <div className="font-bold text-stone-800 group-hover:text-[#FF9933]">
                          ₹{sample.amount.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <span className="text-[11px] text-stone-400 group-hover:translate-x-0.5 transition-transform">
                        Select →
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation & Verify Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-medium transition flex items-center justify-center space-x-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to QR Code</span>
                </button>

                <button
                  onClick={handleExtractProof}
                  disabled={!previewUrl || isExtracting}
                  className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-medium text-sm transition flex items-center justify-center space-x-2 shadow-xs ${
                    previewUrl && !isExtracting
                      ? 'bg-[#FF9933] hover:bg-[#E68524] text-white cursor-pointer'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-100" />
                  <span>Verify with Gemini Vision OCR</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* STEP 4: AI EXTRACTION & SUCCESS (Massive Green Checkmark & Sangha Ledger update) */}
        {currentStep === 4 && (
          <div className="bg-white rounded-3xl p-6 sm:p-12 border border-stone-200/90 shadow-sm text-center">
            
            {/* Loading / Analyzing State */}
            {isExtracting ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-6">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-[#FF9933]/20 border-t-[#FF9933] animate-spin"></div>
                  <div className="w-12 h-12 rounded-full bg-[#FFF5EB] flex items-center justify-center text-[#FF9933]">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="text-lg font-serif-sacred font-bold text-stone-900">
                    Extracting Sacred Offering Proof...
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500 font-light">
                    Gemini Vision OCR is analyzing your payment receipt to extract the exact numerical INR amount and register it in the Sangha ledger.
                  </p>
                </div>
              </div>
            ) : extractionResult ? (
              
              /* SUCCESS STATE PER REQUIREMENT #3 */
              <div className="max-w-xl mx-auto space-y-8 animate-fadeIn">
                
                {/* MASSIVE GREEN CHECKMARK */}
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-emerald-50 border-4 border-emerald-500/20 flex items-center justify-center shadow-md">
                    {/* Subtle soothing green outer ring */}
                    <div className="absolute inset-0 rounded-full bg-emerald-400/10 animate-ping pointer-events-none"></div>
                    <CheckCircle2 className="w-16 h-16 sm:w-20 sm:h-20 text-emerald-600 stroke-[2.2]" />
                  </div>
                </div>

                {/* EXACT MANDATED COPY PER REQUIREMENT #3:
                    "Thank you. Your act of Dana of ₹[Amount] has been recorded in the Sangha ledger."
                */}
                <div className="space-y-3">
                  <span className="text-xs uppercase tracking-widest font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Offering Verified & Recorded
                  </span>

                  <h3 className="text-2xl sm:text-3xl font-serif-sacred font-bold text-stone-900 leading-snug">
                    Thank you. Your act of Dana of{' '}
                    <span className="text-emerald-700 font-extrabold underline decoration-emerald-300 decoration-4">
                      ₹{extractionResult.amount.toLocaleString('en-IN')}
                    </span>{' '}
                    has been recorded in the Sangha ledger.
                  </h3>

                  <p className="text-stone-500 text-xs sm:text-sm font-light">
                    May your generous intention bring peace, nourishment, and liberation to all beings.
                  </p>
                </div>

                {/* GRAPHICAL REPRESENTATION: LIVE SANGHA LEDGER TICK UPWARD */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#FFF9F2] to-white border border-[#FF9933]/30 text-left space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 flex items-center space-x-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-[#FF9933]" />
                      <span>Live Sangha Impact Graph Update</span>
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center">
                      <Sparkles className="w-3 h-3 mr-1" />
                      +₹{extractionResult.amount.toLocaleString('en-IN')} Ticked Upward
                    </span>
                  </div>

                  {/* Visual Bar Surge Track */}
                  <div className="relative pt-1">
                    <div className="flex mb-1.5 items-center justify-between text-xs">
                      <span className="text-stone-500 font-light">Offerings Stream</span>
                      <span className="text-[#FF9933] font-bold">Recorded in Sangha Ledger</span>
                    </div>
                    <div className="overflow-hidden h-2.5 text-xs flex rounded-full bg-stone-100 border border-stone-200">
                      <div
                        style={{ width: '100%' }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-[#E68524] via-[#FF9933] to-emerald-500 transition-all duration-1000 animate-pulse"
                      ></div>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-500 font-light flex items-center justify-between">
                    <span>Ledger Row Appended • Verified by Gemini Vision OCR</span>
                    <button
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="text-[#FF9933] font-medium hover:underline flex items-center"
                    >
                      Inspect Community Curve ↑
                    </button>
                  </p>
                </div>

                {/* Verified Transaction Details Card */}
                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 text-left space-y-2.5 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-stone-200/60">
                    <span className="text-stone-500">Verified Amount (OCR)</span>
                    <span className="font-bold text-stone-900 text-sm">
                      ₹{extractionResult.amount.toLocaleString('en-IN')} INR
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-stone-200/60">
                    <span className="text-stone-500">Beneficiary Cause</span>
                    <span className="font-medium text-stone-800 text-right truncate max-w-[240px]">
                      {config.themeTitle}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-stone-200/60">
                    <span className="text-stone-500">Transaction Ref</span>
                    <span className="font-mono text-stone-800 font-medium">
                      {extractionResult.transactionId}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-stone-200/60">
                    <span className="text-stone-500">Timestamp</span>
                    <span className="text-stone-800">
                      {new Date(extractionResult.timestamp).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-stone-500">Contributor Account</span>
                    <span className="text-stone-800 font-medium">{userEmail}</span>
                  </div>
                </div>

                {/* Reset & Finish CTAs */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleResetFlow}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium transition flex items-center justify-center space-x-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Make Another Offering</span>
                  </button>

                  <button
                    onClick={() => {
                      // Smooth scroll back to impact counter
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#FF9933] hover:bg-[#E68524] text-white text-xs font-semibold shadow-xs transition"
                  >
                    View Updated Community Impact
                  </button>
                </div>

              </div>
            ) : null}

          </div>
        )}

      </div>
    </section>
  );
};
