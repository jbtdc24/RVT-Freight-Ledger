"use client";

import { useState } from "react";
import { useAuthContext } from "@/lib/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useData } from "@/lib/data-context";
import { featureLimits, hasFeatureAccess, SubscriptionTier } from "@/lib/subscription";
import { CreditCard, Crown, Truck, Users, Check, AlertCircle, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export default function BillingPage() {
  const { userData } = useAuthContext();
  const { assets, drivers } = useData();
  const [isLoading, setIsLoading] = useState(false);

  const tier = userData?.subscriptionTier || "Free";
  const limits = featureLimits[tier];

  const truckUsage = Math.min((assets.length / limits.maxTrucks) * 100, 100);
  const driverUsage = Math.min((drivers.length / limits.maxDrivers) * 100, 100);

  const features = [
    { id: "freight-ledger", name: "Freight Ledger", icon: Truck },
    { id: "expense-tracking", name: "Expense Tracking", icon: CreditCard },
    { id: "ifta-reporting", name: "IFTA Reporting", icon: Check },
    { id: "maintenance-tracking", name: "Maintenance Tracking", icon: Check },
    { id: "driver-settlements", name: "Driver Settlements", icon: Check },
    { id: "documents", name: "Document Management", icon: Check },
    { id: "driver-app", name: "Driver Mobile App", icon: Check },
    { id: "gps-tracking", name: "GPS Tracking", icon: Check },
    { id: "api-access", name: "API Access", icon: Check },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription, payment methods, and billing history
        </p>
      </div>

      {/* Current Plan */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Current Plan: {tier}</CardTitle>
                <CardDescription>
                  {tier === "Free" && "Basic features for getting started"}
                  {tier === "Pro" && "Full features for growing fleets"}
                  {tier === "Fleet" && "Enterprise features with priority support"}
                </CardDescription>
              </div>
            </div>
            <Badge variant={tier === "Free" ? "secondary" : "default"} className="text-lg px-4 py-1">
              {tier}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Usage */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Trucks</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {assets.length} / {limits.maxTrucks === Infinity ? "∞" : limits.maxTrucks}
                </span>
              </div>
              <Progress value={truckUsage} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Drivers</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {drivers.length} / {limits.maxDrivers === Infinity ? "∞" : limits.maxDrivers}
                </span>
              </div>
              <Progress value={driverUsage} className="h-2" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {tier === "Free" ? (
              <Button className="gap-2">
                Upgrade to Pro
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button variant="outline">Manage Subscription</Button>
                <Button variant="ghost" className="text-destructive">
                  Cancel Subscription
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Plan Features</CardTitle>
          <CardDescription>
            Features available with your {tier} plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature) => {
              const hasAccess = hasFeatureAccess(tier, feature.id);
              return (
                <div
                  key={feature.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    hasAccess
                      ? "border-white/10 bg-white/5"
                      : "border-white/5 bg-white/[0.02] opacity-50"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      hasAccess ? "bg-green-500/10" : "bg-gray-500/10"
                    }`}
                  >
                    <feature.icon
                      className={`h-4 w-4 ${
                        hasAccess ? "text-green-500" : "text-gray-500"
                      }`}
                    />
                  </div>
                  <span className="flex-1">{feature.name}</span>
                  {hasAccess ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      {tier !== "Free" && (
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Payment Method</CardTitle>
            </div>          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded" />
              <div className="flex-1">
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/25</p>
              </div>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
