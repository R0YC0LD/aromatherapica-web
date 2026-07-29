import { describe, expect, it } from "vitest";
import { FREE_SHIPPING_THRESHOLD, shippingCost, orderTotal } from "@/lib/shipping";

describe("shipping", () => {
  it("applies free shipping at 100000 TL", () => {
    expect(FREE_SHIPPING_THRESHOLD).toBe(100000);
    expect(shippingCost(99999)).toBeGreaterThan(0);
    expect(shippingCost(100000)).toBe(0);
    expect(orderTotal(100000)).toBe(100000);
  });
});
