/**
 * Utility to generate realistic sample UPI payment receipt images
 * via HTML5 Canvas for instant testing of Gemini Vision OCR
 */

export interface SampleReceipt {
  id: string;
  name: string;
  amount: number;
  appName: string;
  color: string;
  txnId: string;
}

export const SAMPLE_RECEIPTS: SampleReceipt[] = [
  {
    id: 'sample-phonepe-2500',
    name: 'PhonePe - ₹2,500 Dana Offering',
    amount: 2500,
    appName: 'PhonePe',
    color: '#5F259F',
    txnId: 'T2611100945231984210',
  },
  {
    id: 'sample-gpay-1008',
    name: 'Google Pay - ₹1,008 Sacred Alms',
    amount: 1008,
    appName: 'Google Pay',
    color: '#1A73E8',
    txnId: 'CICAgOCJ_vPnAQ',
  },
  {
    id: 'sample-paytm-5000',
    name: 'Paytm - ₹5,000 Monastery Care',
    amount: 5000,
    appName: 'Paytm UPI',
    color: '#00BAF2',
    txnId: 'PTM992847102941',
  },
];

/**
 * Creates a realistic payment screenshot data URL
 */
export function generateReceiptCanvasDataUrl(sample: SampleReceipt, recipientName: string, upiId: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 850;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 600, 850);

  // App Header Bar
  ctx.fillStyle = sample.color;
  ctx.fillRect(0, 0, 600, 110);

  // App title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px -apple-system, sans-serif';
  ctx.fillText(sample.appName, 40, 65);

  ctx.font = '16px -apple-system, sans-serif';
  ctx.fillText('Payment Successful', 400, 65);

  // Success Checkmark Circle
  ctx.beginPath();
  ctx.arc(300, 200, 48, 0, Math.PI * 2);
  ctx.fillStyle = '#059669'; // Green checkmark circle
  ctx.fill();

  // White Checkmark Icon
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(280, 200);
  ctx.lineTo(295, 215);
  ctx.lineTo(325, 185);
  ctx.stroke();

  // "Paid to" text
  ctx.fillStyle = '#6B7280';
  ctx.font = '18px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Paid to', 300, 280);

  // Recipient Name
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 22px -apple-system, sans-serif';
  ctx.fillText(recipientName.length > 30 ? recipientName.slice(0, 30) + '...' : recipientName, 300, 315);

  // Recipient UPI ID
  ctx.fillStyle = '#4B5563';
  ctx.font = '16px -apple-system, monospace';
  ctx.fillText(upiId, 300, 345);

  // Big Bold Amount (Key OCR Target for Gemini)
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 54px -apple-system, sans-serif';
  ctx.fillText(`₹${sample.amount.toLocaleString('en-IN')}`, 300, 430);

  // Divider
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(50, 480);
  ctx.lineTo(550, 480);
  ctx.stroke();

  // Transaction Details Table
  ctx.textAlign = 'left';
  const leftX = 60;
  const rightX = 540;

  const rows = [
    { label: 'UPI Transaction ID', val: sample.txnId },
    { label: 'Google Transaction Ref', val: 'UPI/' + sample.txnId.slice(-10) },
    { label: 'Payment Mode', val: 'UPI Direct Bank Transfer' },
    { label: 'Date & Time', val: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
    { label: 'Debited From', val: '•••• 4920' },
    { label: 'Status', val: 'COMPLETED / SUCCESS' },
  ];

  let currentY = 525;
  rows.forEach((row) => {
    ctx.fillStyle = '#6B7280';
    ctx.font = '16px -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(row.label, leftX, currentY);

    ctx.fillStyle = row.label === 'Status' ? '#059669' : '#1F2937';
    ctx.font = row.label === 'Status' ? 'bold 16px -apple-system, sans-serif' : '500 16px -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(row.val, rightX, currentY);

    currentY += 42;
  });

  // Footer note
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '13px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('This screenshot is an authentic receipt for the Sangha Dana Circle.', 300, 810);

  return canvas.toDataURL('image/jpeg', 0.95);
}
