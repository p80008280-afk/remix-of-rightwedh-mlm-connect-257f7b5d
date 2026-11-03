// One ID activation (or repurchase) keeps an ID active for 30 days.
export const ACTIVATION_DAYS = 30;

export type ActivationInfo = {
  active: boolean;
  daysLeft: number;
  until: Date | null;
};

export function activationInfo(
  isActive: boolean,
  activeUntil: string | null | undefined,
  now: Date = new Date(),
): ActivationInfo {
  const until = activeUntil ? new Date(activeUntil) : null;
  if (!isActive || !until || until.getTime() <= now.getTime()) {
    return { active: false, daysLeft: 0, until };
  }
  const daysLeft = Math.ceil((until.getTime() - now.getTime()) / 86_400_000);
  return { active: true, daysLeft, until };
}

export function formatDate(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
