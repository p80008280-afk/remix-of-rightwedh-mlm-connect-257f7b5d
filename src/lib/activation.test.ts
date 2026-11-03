import { describe, expect, it } from "vitest";
import { activationInfo } from "./activation";

const now = new Date("2026-11-03T04:00:00Z");

describe("30-day ID activation", () => {
  it("shows 30 days left right after activation", () => {
    const until = new Date(now.getTime() + 30 * 86_400_000).toISOString();
    expect(activationInfo(true, until, now)).toMatchObject({ active: true, daysLeft: 30 });
  });

  it("is inactive once 30 days have passed", () => {
    const until = new Date(now.getTime() - 1000).toISOString();
    expect(activationInfo(true, until, now).active).toBe(false);
  });

  it("is inactive when never activated", () => {
    expect(activationInfo(false, null, now)).toMatchObject({ active: false, daysLeft: 0 });
  });
});
