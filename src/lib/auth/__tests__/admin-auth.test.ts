import { describe, expect, it } from "vitest";
import { MAX_LOGIN_ATTEMPTS } from "@/lib/auth/admin-auth";

describe("admin auth constants", () => {
  it("locks after 5 attempts", () => {
    expect(MAX_LOGIN_ATTEMPTS).toBe(5);
  });
});
