/**
 * Assumptions used by the affordability ("eligibility") estimator.
 *
 * These are deliberately simple, Canadian-market defaults. They are NOT a
 * lender's underwriting rules. Review them periodically (rates change!) and
 * adjust to match the realtor's preferred mortgage partner.
 */
export const financeConfig = {
  /** Typical 5-year fixed contract rate, in percent. Update regularly. */
  contractRate: 4.49,
  /** Federal stress test: qualify at max(contract + buffer, floor). */
  stressTestBuffer: 2,
  stressTestFloor: 5.25,

  /** Debt-service ratio limits, as fractions of gross monthly income. */
  ratios: {
    /** Upper end of the range — typical insured maximums (GDS 39% / TDS 44%). */
    maximum: { gds: 0.39, tds: 0.44 },
    /** Lower end of the range — a more comfortable budget. */
    comfortable: { gds: 0.32, tds: 0.4 },
  },

  /** Amortization in years. First-time buyers may access 30 years on insured mortgages. */
  amortizationYears: 25,
  firstTimeBuyerInsuredAmortizationYears: 30,
  /** Extra insurance premium (percentage points) charged for 30-year insured amortization. */
  extendedAmortizationPremiumSurcharge: 0.2,

  /** Minimum down payment tiers (insured mortgages). */
  downPayment: {
    firstTierLimit: 500_000,
    firstTierRate: 0.05,
    secondTierRate: 0.1,
    /** Purchase price at/above which 20% down is required (insured mortgage cap). */
    insuredPriceCap: 1_500_000,
    uninsuredRate: 0.2,
  },

  /** Mortgage default insurance premiums by down-payment percentage. */
  insurancePremiums: [
    { minDownPercent: 0.15, premium: 0.028 },
    { minDownPercent: 0.1, premium: 0.031 },
    { minDownPercent: 0.05, premium: 0.04 },
  ],

  /** Estimated carrying costs included in the housing (GDS) calculation. */
  annualPropertyTaxRate: 0.011,
  monthlyHeating: 150,

  /** Search bounds for the solver. */
  maxPurchasePrice: 5_000_000,
  priceStep: 1_000,
} as const;

export type FinanceConfig = typeof financeConfig;
