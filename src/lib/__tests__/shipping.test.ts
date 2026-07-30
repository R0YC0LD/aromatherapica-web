import { describe, expect, it } from "vitest";
import { shippingCost, orderTotal, freeShippingAnnouncement } from "@/lib/shipping";

describe("shipping", () => {
  it("is always free when threshold is 0", () => {
    expect(shippingCost(1, { threshold: 0, fee: 99 })).toBe(0);
    expect(shippingCost(500, { threshold: 0, fee: 99 })).toBe(0);
    expect(freeShippingAnnouncement({ threshold: 0 })).toContain("ücretsiz");
  });

  it("uses admin-configured threshold and fee", () => {
    expect(shippingCost(999, { threshold: 1000, fee: 79 })).toBe(79);
    expect(shippingCost(1000, { threshold: 1000, fee: 79 })).toBe(0);
    expect(orderTotal(1000, { threshold: 1000, fee: 79 })).toBe(1000);
    expect(freeShippingAnnouncement({ threshold: 1500 })).toContain("1.500");
  });
});
