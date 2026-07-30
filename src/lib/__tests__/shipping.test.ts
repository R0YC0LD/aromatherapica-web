import { describe, expect, it } from "vitest";
import { FREE_SHIPPING_THRESHOLD, shippingCost, orderTotal } from "@/lib/shipping";

describe("shipping", () => {
  it("is always free via Ticimax shipping voucher", () => {
    expect(FREE_SHIPPING_THRESHOLD).toBe(0);
    expect(shippingCost(0)).toBe(0);
    expect(shippingCost(1)).toBe(0);
    expect(shippingCost(99999)).toBe(0);
    expect(orderTotal(250)).toBe(250);
  });
});
