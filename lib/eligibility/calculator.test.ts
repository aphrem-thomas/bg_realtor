import { describe, expect, it } from "vitest";
import { financeConfig } from "@/config/finance";
import { calculateEligibility, minimumDownPayment, monthlyPayment } from "./calculator";
import type { EligibilityInput } from "./types";

const base: EligibilityInput = {
  annualIncome: 150_000,
  applicants: 2,
  employmentType: "salaried",
  downPayment: 100_000,
  monthlyDebts: 500,
  creditScore: "good",
  firstTimeBuyer: false,
  ownsProperty: false,
};

describe("minimumDownPayment", () => {
  it("applies 5% up to $500k", () => {
    expect(minimumDownPayment(400_000)).toBe(20_000);
  });
  it("applies 10% on the portion above $500k", () => {
    expect(minimumDownPayment(800_000)).toBe(25_000 + 30_000);
  });
  it("requires 20% at or above the insured cap", () => {
    expect(minimumDownPayment(financeConfig.downPayment.insuredPriceCap)).toBe(300_000);
  });
});

describe("monthlyPayment", () => {
  it("matches a known Canadian mortgage payment (semi-annual compounding)", () => {
    // $500,000 at 5% over 25 years ≈ $2,908.02 / month
    expect(monthlyPayment(500_000, 5, 25)).toBeCloseTo(2908.02, 0);
  });
  it("is zero for no principal", () => {
    expect(monthlyPayment(0, 5, 25)).toBe(0);
  });
});

describe("calculateEligibility", () => {
  it("produces an ordered, positive range for a typical household", () => {
    const result = calculateEligibility(base);
    expect(result.highPrice).toBeGreaterThan(400_000);
    expect(result.lowPrice).toBeGreaterThan(0);
    expect(result.lowPrice).toBeLessThanOrEqual(result.highPrice);
    expect(result.qualifyingRate).toBeGreaterThanOrEqual(financeConfig.stressTestFloor);
  });

  it("never exceeds what the down payment allows", () => {
    const result = calculateEligibility({ ...base, annualIncome: 1_000_000, downPayment: 30_000 });
    expect(minimumDownPayment(result.highPrice)).toBeLessThanOrEqual(30_000);
  });

  it("reduces the range when debts increase", () => {
    const lowDebt = calculateEligibility(base);
    const highDebt = calculateEligibility({ ...base, monthlyDebts: 2_500 });
    expect(highDebt.highPrice).toBeLessThan(lowDebt.highPrice);
  });

  it("flags limited eligibility when nothing qualifies", () => {
    const result = calculateEligibility({ ...base, annualIncome: 20_000, monthlyDebts: 1_500, downPayment: 5_000 });
    expect(result.highPrice).toBe(0);
    expect(result.tier).toBe("limited");
    expect(result.notes.length).toBeGreaterThan(0);
  });

  it("checks a desired price", () => {
    const result = calculateEligibility({ ...base, desiredPrice: 3_000_000 });
    expect(result.desiredPriceCheck?.withinRange).toBe(false);
    expect(result.desiredPriceCheck?.hasEnoughDown).toBe(false);
  });
});
