export const EMPLOYMENT_TYPES = [
  { value: "salaried", label: "Full-time salaried" },
  { value: "hourly", label: "Hourly / part-time" },
  { value: "self-employed", label: "Self-employed" },
  { value: "contract", label: "Contract / seasonal" },
  { value: "retired", label: "Retired / pension" },
  { value: "other", label: "Other" },
] as const;

export const CREDIT_SCORE_RANGES = [
  { value: "excellent", label: "Excellent (760+)" },
  { value: "good", label: "Good (700–759)" },
  { value: "fair", label: "Fair (650–699)" },
  { value: "building", label: "Building (600–649)" },
  { value: "poor", label: "Below 600" },
  { value: "unknown", label: "Not sure" },
] as const;

export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number]["value"];
export type CreditScoreRange = (typeof CREDIT_SCORE_RANGES)[number]["value"];

export type EligibilityInput = {
  annualIncome: number;
  applicants: 1 | 2;
  employmentType: EmploymentType;
  downPayment: number;
  monthlyDebts: number;
  creditScore: CreditScoreRange;
  firstTimeBuyer: boolean;
  ownsProperty: boolean;
  desiredPrice?: number;
};

export type EligibilityTier = "strong" | "moderate" | "limited";

export type EligibilityResult = {
  /** Comfortable budget (conservative ratios). */
  lowPrice: number;
  /** Stretch budget (maximum typical ratios). */
  highPrice: number;
  tier: EligibilityTier;
  /** Mortgage principal at the high end, including any default insurance premium. */
  estimatedMortgage: number;
  /** Monthly principal + interest at the contract rate, at the high end. */
  estimatedMonthlyPayment: number;
  downPaymentPercent: number;
  insurancePremium: number;
  contractRate: number;
  qualifyingRate: number;
  amortizationYears: number;
  /** Down payment required for the desired price (if one was entered). */
  desiredPriceCheck?: {
    price: number;
    withinRange: boolean;
    minimumDownPayment: number;
    hasEnoughDown: boolean;
  };
  notes: string[];
};
