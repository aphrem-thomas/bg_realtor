import { financeConfig, type FinanceConfig } from "@/config/finance";
import type { EligibilityInput, EligibilityResult, EligibilityTier } from "./types";

/**
 * Home affordability ESTIMATE based on common Canadian qualification rules:
 *
 *  - Stress test: qualify at max(contract rate + 2%, 5.25%)
 *  - GDS (housing costs ÷ gross income) and TDS (housing + debts ÷ income) limits
 *  - Minimum down payment tiers and mortgage default insurance premiums
 *  - Canadian mortgages compound semi-annually
 *
 * This is NOT a pre-approval. Lenders consider far more (credit history,
 * income verification, property type, etc.). The UI must say so.
 */

type Ratios = { gds: number; tds: number };

/** Monthly payment for a Canadian (semi-annually compounded) fixed-rate mortgage. */
export function monthlyPayment(principal: number, annualRatePercent: number, years: number): number {
  if (principal <= 0) return 0;
  const monthlyRate = Math.pow(1 + annualRatePercent / 100 / 2, 1 / 6) - 1;
  const n = years * 12;
  if (monthlyRate === 0) return principal / n;
  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n));
}

/** Minimum down payment required for a purchase price. */
export function minimumDownPayment(price: number, config: FinanceConfig = financeConfig): number {
  const dp = config.downPayment;
  if (price >= dp.insuredPriceCap) return price * dp.uninsuredRate;
  if (price <= dp.firstTierLimit) return price * dp.firstTierRate;
  return dp.firstTierLimit * dp.firstTierRate + (price - dp.firstTierLimit) * dp.secondTierRate;
}

export function insurancePremiumRate(downPercent: number, config: FinanceConfig = financeConfig): number {
  if (downPercent >= config.downPayment.uninsuredRate) return 0;
  return config.insurancePremiums.find((tier) => downPercent >= tier.minDownPercent)?.premium ?? 0;
}

export function qualifyingRate(config: FinanceConfig = financeConfig): number {
  return Math.max(config.contractRate + config.stressTestBuffer, config.stressTestFloor);
}

type Scenario = {
  price: number;
  loan: number;
  premium: number;
  amortization: number;
  downPercent: number;
};

/** Structure the mortgage for a price, or null if the down payment is insufficient. */
function scenarioFor(price: number, input: EligibilityInput, config: FinanceConfig): Scenario | null {
  const down = Math.min(input.downPayment, price);
  const downPercent = down / price;
  if (down < minimumDownPayment(price, config) - 0.5) return null;

  const insured = downPercent < config.downPayment.uninsuredRate;
  const amortization =
    insured && input.firstTimeBuyer ? config.firstTimeBuyerInsuredAmortizationYears : config.amortizationYears;
  let premiumRate = insurancePremiumRate(downPercent, config);
  if (insured && amortization > 25) premiumRate += config.extendedAmortizationPremiumSurcharge / 100;

  const base = price - down;
  const premium = base * premiumRate;
  return { price, loan: base + premium, premium, amortization, downPercent };
}

function affordable(scenario: Scenario, input: EligibilityInput, ratios: Ratios, config: FinanceConfig): boolean {
  const monthlyIncome = input.annualIncome / 12;
  if (monthlyIncome <= 0) return false;
  const payment = monthlyPayment(scenario.loan, qualifyingRate(config), scenario.amortization);
  const housing = payment + (scenario.price * config.annualPropertyTaxRate) / 12 + config.monthlyHeating;
  return housing / monthlyIncome <= ratios.gds && (housing + input.monthlyDebts) / monthlyIncome <= ratios.tds;
}

/** Highest price (on the configured step grid) that satisfies both down-payment and ratio rules. */
function maxAffordablePrice(input: EligibilityInput, ratios: Ratios, config: FinanceConfig): Scenario | null {
  let best: Scenario | null = null;
  // A linear scan is used because affordability is not monotonic around the
  // 20% down threshold (insurance premiums disappear). ~5k iterations: trivial.
  for (let price = config.priceStep; price <= config.maxPurchasePrice; price += config.priceStep) {
    const scenario = scenarioFor(price, input, config);
    if (scenario && affordable(scenario, input, ratios, config)) best = scenario;
  }
  return best;
}

const roundDown = (value: number, to = 5_000) => Math.floor(value / to) * to;

export function calculateEligibility(input: EligibilityInput, config: FinanceConfig = financeConfig): EligibilityResult {
  const notes: string[] = [];

  let stretch: Ratios = config.ratios.maximum;
  const comfortable: Ratios = config.ratios.comfortable;

  if (input.creditScore === "poor") {
    stretch = comfortable;
    notes.push(
      "With a credit score below 600, most prime lenders and insurers will not approve a mortgage. Alternative lenders may, at higher rates — a mortgage professional can help you improve your options.",
    );
  } else if (input.creditScore === "building") {
    notes.push("A score between 600 and 679 can qualify for insured mortgages, but some lenders may offer fewer options or require more documentation.");
  } else if (input.creditScore === "unknown") {
    notes.push("Your credit score has a big impact on approval and rate. Checking it (free through Equifax or TransUnion) is a great next step.");
  }

  if (input.employmentType === "self-employed") {
    notes.push("Self-employed buyers are usually asked for two years of tax returns (Notices of Assessment). Lenders typically use your net declared income.");
  } else if (input.employmentType === "contract" || input.employmentType === "hourly") {
    notes.push("Lenders often average variable or contract income over two years, so your qualifying income may differ from this estimate.");
  }

  if (input.firstTimeBuyer) {
    notes.push(
      "As a first-time buyer you may be eligible for programs such as the First Home Savings Account (FHSA), the RRSP Home Buyers' Plan and the land transfer tax rebate.",
    );
  }
  if (input.ownsProperty) {
    notes.push("Equity in a property you already own could increase your down payment and your buying range.");
  }

  const high = maxAffordablePrice(input, stretch, config);
  const low = maxAffordablePrice(input, comfortable, config);

  const highPrice = high ? roundDown(high.price) : 0;
  const lowPrice = low ? roundDown(Math.min(low.price, high?.price ?? low.price)) : 0;

  if (!high) {
    notes.unshift(
      input.downPayment < 25_000
        ? "Based on the numbers entered, a larger down payment or lower monthly debts would be needed to qualify. A consultation can map out a realistic plan."
        : "Based on the numbers entered, your debt payments may be limiting your borrowing power. Paying down debts can quickly increase your range.",
    );
  }

  const debtRatio = input.annualIncome > 0 ? (input.monthlyDebts * 12) / input.annualIncome : 1;
  let tier: EligibilityTier = "moderate";
  if (!high || input.creditScore === "poor") tier = "limited";
  else if ((input.creditScore === "excellent" || input.creditScore === "good") && debtRatio < 0.1) tier = "strong";

  const scenario = high ?? scenarioFor(Math.max(input.downPayment, config.priceStep), input, config);
  let desiredPriceCheck: EligibilityResult["desiredPriceCheck"];
  if (input.desiredPrice && input.desiredPrice > 0) {
    const minimumDown = minimumDownPayment(input.desiredPrice, config);
    desiredPriceCheck = {
      price: input.desiredPrice,
      withinRange: highPrice > 0 && input.desiredPrice <= highPrice,
      minimumDownPayment: Math.ceil(minimumDown),
      hasEnoughDown: input.downPayment >= minimumDown,
    };
  }

  return {
    lowPrice,
    highPrice,
    tier,
    estimatedMortgage: high ? Math.round(high.loan) : 0,
    estimatedMonthlyPayment: high ? Math.round(monthlyPayment(high.loan, config.contractRate, high.amortization)) : 0,
    downPaymentPercent: high ? Math.round(high.downPercent * 1000) / 10 : 0,
    insurancePremium: high ? Math.round(high.premium) : 0,
    contractRate: config.contractRate,
    qualifyingRate: qualifyingRate(config),
    amortizationYears: scenario?.amortization ?? config.amortizationYears,
    desiredPriceCheck,
    notes,
  };
}
