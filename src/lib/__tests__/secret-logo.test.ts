import { describe, expect, it } from "vitest";
import { registerSecretClick } from "@/components/SecretLogo";

describe("secret logo clicks", () => {
  it("triggers after 5 clicks within 3 seconds", () => {
    let stamps: number[] = [];
    const t0 = 1_000_000;
    for (let i = 0; i < 4; i++) {
      const r = registerSecretClick(stamps, t0 + i * 200);
      expect(r.triggered).toBe(false);
      stamps = r.next;
    }
    const fifth = registerSecretClick(stamps, t0 + 900);
    expect(fifth.triggered).toBe(true);
  });

  it("resets when window exceeded", () => {
    let stamps: number[] = [];
    const t0 = 1_000_000;
    stamps = registerSecretClick(stamps, t0).next;
    stamps = registerSecretClick(stamps, t0 + 100).next;
    const late = registerSecretClick(stamps, t0 + 4000);
    expect(late.triggered).toBe(false);
    expect(late.next).toHaveLength(1);
  });
});
