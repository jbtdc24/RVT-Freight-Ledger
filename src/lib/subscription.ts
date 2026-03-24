export type SubscriptionTier = "Free" | "Pro" | "Fleet";

export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing" | "paused";

export type Subscription = {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  trialEnd?: string;
};

// Feature flags by tier
export const featureLimits: Record<SubscriptionTier, {
  maxTrucks: number;
  maxDrivers: number;
  features: string[];
}> = {
  Free: {
    maxTrucks: 2,
    maxDrivers: 3,
    features: [
      "freight-ledger",
      "expense-tracking",
      "basic-reports",
      "email-support",
    ],
  },
  Pro: {
    maxTrucks: Infinity,
    maxDrivers: Infinity,
    features: [
      "freight-ledger",
      "expense-tracking",
      "advanced-reports",
      "ifta-reporting",
      "maintenance-tracking",
      "driver-settlements",
      "documents",
      "priority-support",
    ],
  },
  Fleet: {
    maxTrucks: Infinity,
    maxDrivers: Infinity,
    features: [
      "freight-ledger",
      "expense-tracking",
      "advanced-reports",
      "ifta-reporting",
      "maintenance-tracking",
      "driver-settlements",
      "documents",
      "driver-app",
      "gps-tracking",
      "route-optimization",
      "api-access",
      "white-label",
      "dedicated-support",
    ],
  },
};

// Check if user has access to a feature
export function hasFeatureAccess(
  tier: SubscriptionTier,
  feature: string
): boolean {
  return featureLimits[tier].features.includes(feature);
}

// Check if user can add more trucks
export function canAddTruck(tier: SubscriptionTier, currentCount: number): boolean {
  return currentCount < featureLimits[tier].maxTrucks;
}

// Check if user can add more drivers
export function canAddDriver(tier: SubscriptionTier, currentCount: number): boolean {
  return currentCount < featureLimits[tier].maxDrivers;
}

// Get upgrade message
export function getUpgradeMessage(
  tier: SubscriptionTier,
  limit: "trucks" | "drivers" | "feature"
): string {
  if (tier === "Free") {
    return `Upgrade to Pro to unlock unlimited ${limit === "feature" ? "this feature" : limit}.`;
  }
  if (tier === "Pro" && limit === "feature") {
    return "Upgrade to Fleet to unlock this feature.";
  }
  return "Contact sales for enterprise options.";
}
