import { useState } from "react";
import { Check, Truck, Building2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    icon: Truck,
    description: "Perfect for owner-operators",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "Up to 2 trucks",
      "Up to 3 drivers",
      "Basic dispatch",
      "Freight ledger",
      "Expense tracking",
      "Email support",
    ],
    notIncluded: [
      "IFTA reporting",
      "Maintenance tracking",
      "Driver mobile app",
      "API access",
      "Priority support",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    icon: Building2,
    description: "For growing fleets",
    monthlyPrice: 49,
    yearlyPrice: 39,
    features: [
      "Unlimited trucks",
      "Unlimited drivers",
      "Advanced dispatch",
      "IFTA fuel tax reporting",
      "Maintenance tracking",
      "Driver settlements",
      "Document management",
      "Priority email support",
    ],
    notIncluded: [
      "Driver mobile app",
      "API access",
      "Dedicated account manager",
    ],
    cta: "Start 14-Day Trial",
    popular: true,
  },
  {
    name: "Fleet",
    icon: Crown,
    description: "For enterprise operations",
    monthlyPrice: 99,
    yearlyPrice: 79,
    features: [
      "Everything in Pro",
      "Driver mobile app",
      "GPS tracking integration",
      "Route optimization",
      "API access",
      "Custom integrations",
      "White-label option",
      "24/7 phone support",
      "Dedicated account manager",
    ],
    notIncluded: [],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              Simple, Transparent Pricing
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Choose Your Plan
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Start free, upgrade as you grow. No hidden fees, cancel anytime.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={cn("text-sm", !isYearly && "text-muted-foreground")}>
                Monthly
              </span>
              <Switch checked={isYearly} onCheckedChange={setIsYearly} />
              <span className={cn("text-sm", isYearly && "text-muted-foreground")}>
                Yearly
              </span>
              {isYearly && (
                <Badge variant="outline" className="text-green-500 border-green-500">
                  Save 20%
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "relative flex flex-col",
                plan.popular && "border-primary shadow-lg shadow-primary/10"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <plan.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>{plan.name}</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">
                      ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  {isYearly && plan.monthlyPrice > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Billed annually (${plan.yearlyPrice * 12}/year)
                    </p>
                  )}
                </div>

                <Button
                  className="w-full mb-6"
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>

                <div className="space-y-4 flex-1">
                  <div>
                    <p className="text-sm font-medium mb-3">What's included:</p>
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.notIncluded.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-3 text-muted-foreground">
                        Not included:
                      </p>
                      <ul className="space-y-2">
                        {plan.notIncluded.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <span className="h-4 w-4 shrink-0 flex items-center justify-center">
                              ×
                            </span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-20">
          <h2 className="text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                q: "Can I change plans anytime?",
                a: "Yes, you can upgrade or downgrade at any time. Changes take effect immediately.",
              },
              {
                q: "Is there a free trial?",
                a: "Yes, Pro and Fleet plans include a 14-day free trial. No credit card required.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, ACH transfers, and PayPal.",
              },
              {
                q: "Do you offer refunds?",
                a: "Yes, we offer a 30-day money-back guarantee for all paid plans.",
              },
            ].map((faq) => (
              <div key={faq.q}>
                <h3 className="font-medium mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-20">
          <p className="text-muted-foreground mb-4">
            Have questions? We're here to help.
          </p>
          <Button variant="outline" size="lg">
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
}
