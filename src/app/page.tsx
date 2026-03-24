"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RvtLogo } from "@/components/icons";
import {
  Truck,
  MapPin,
  FileText,
  Wallet,
  BarChart3,
  Check,
  ArrowRight,
  Star,
} from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Dispatch Management",
    description: "Assign loads, track drivers, and manage your fleet in real-time",
  },
  {
    icon: MapPin,
    title: "Route Optimization",
    description: "AI-powered routing to save fuel and reduce delivery times",
  },
  {
    icon: FileText,
    title: "IFTA Reporting",
    description: "Automated fuel tax calculations and quarterly reports",
  },
  {
    icon: Wallet,
    title: "Driver Settlements",
    description: "Calculate pay, track expenses, and manage settlements",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Revenue per mile, profitability reports, and insights",
  },
  {
    icon: Check,
    title: "Maintenance Tracking",
    description: "Schedule maintenance and track vehicle health",
  },
];

const testimonials = [
  {
    quote: "RVT Accounting cut our dispatch time in half. The IFTA reporting alone saves us hours every quarter.",
    author: "Mike Johnson",
    role: "Fleet Owner, 15 trucks",
  },
  {
    quote: "Best investment for our trucking business. The driver settlement feature is a game changer.",
    author: "Sarah Chen",
    role: "Operations Manager",
  },
  {
    quote: "Finally, software built for truckers by truckers. Simple, powerful, and affordable.",
    author: "Robert Davis",
    role: "Owner-Operator",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <RvtLogo className="h-6 w-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-bold leading-none">RVT</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Accounting</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Testimonials
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/login?mode=signup">
              <Button size="sm">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              🚛 Built for Truckers, by Truckers
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Run Your Fleet Like a
              <span className="text-primary"> Pro</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              All-in-one dispatch, IFTA reporting, driver settlements, and fleet management. 
              Start free and scale as you grow.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login?mode=signup">
                <Button size="lg" className="gap-2">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline">
                  View Pricing
                </Button>
              </Link>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              No credit card required. 14-day free trial.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10K+", label: "Active Users" },
              { value: "50K+", label: "Loads Dispatched" },
              { value: "$2M+", label: "Revenue Tracked" },
              { value: "99.9%", label: "Uptime" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4">
              Features
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything You Need to Run Your Fleet
            </h2>
            <p className="text-muted-foreground">
              From dispatch to settlements, we've got you covered with powerful, easy-to-use tools.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="glass-card group hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white/[0.02]">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4">
              Testimonials
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Loved by Fleet Owners
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.author} className="glass-card">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-medium">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="glass-card border-primary/20">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Ready to streamline your fleet?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of trucking companies already using RVT Accounting to run their operations.
              </p>
              <Link href="/login?mode=signup">
                <Button size="lg" className="gap-2">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <RvtLogo className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold">RVT Accounting</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 RVT Accounting. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
