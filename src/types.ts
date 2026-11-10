export interface NgoConfig {
  ngoName: string;
  themeTitle: string;
  themeMonth: string;
  themeDescription: string;
  upiId: string;
  bankAccount: string;
  ifscCode: string;
  bankName: string;
  qrCodeUrl?: string;
  googleAppsScriptUrl?: string;
  hasGoogleAppsScriptUrl?: boolean;
}

export interface MonthlyImpactPoint {
  month: string;
  amount: number;
}

export interface LedgerSummary {
  allTimeTotal: number;
  currentMonthTotal: number;
  contributionsCount: number;
  monthlyImpact: MonthlyImpactPoint[];
  activeMonthName?: string;
}

export interface ExtractionResult {
  amount: number;
  currency: string;
  transactionId?: string;
  timestamp: string;
  message: string;
  driveFileUrl?: string;
}

export type DonationStep = 1 | 2 | 3 | 4;
