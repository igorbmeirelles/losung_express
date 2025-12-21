import type { SignOptions } from "jsonwebtoken";

const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // fallback to 7 days

export function calculateSessionTtlSeconds(
  expiresIn: SignOptions["expiresIn"]
): number {
  if (typeof expiresIn === "number") {
    return expiresIn;
  }

  const match = /^(\d+)([smhd])$/i.exec(expiresIn ?? "");
  if (!match) {
    return DEFAULT_SESSION_TTL_SECONDS;
  }

  const value = Number(match[1]);
  const unit = match[2]!.toLowerCase();

  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 60 * 60;
    case "d":
      return value * 60 * 60 * 24;
    default:
      return DEFAULT_SESSION_TTL_SECONDS;
  }
}
