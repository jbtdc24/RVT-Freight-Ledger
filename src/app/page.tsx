"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Truck, ShieldCheck, BarChart4 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RvtLogo } from "@/components/icons";

export default function LandingPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background selection:bg-primary/30">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg">
                            <RvtLogo className="h-6 w-6 text-primary" />
                        </div>
                        <span className="font-headline text-lg font-bold tracking-tight">RVT Accounting</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            Sign In
                        </Link>
                        <Button asChild className="rounded-full shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                            <Link href="/login?mode=signup">Get Started</Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 pt-16">
                {/* Hero Section */}
                <section className="relative overflow-hidden py-24 lg:py-32">
                    {/* Background effects */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-50 -z-10 animate-pulse" />

                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tighter mb-6 bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                            Smart Freight Management <br className="hidden md:block" />
                            <span className="text-primary">Built for Owner-Operators</span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                            Track loads, manage expenses, calcuate line-haul percentages, and monitor your true profit margins in real-time. Stop using spreadsheets and start running your trucking business like a pro.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button size="lg" className="rounded-full w-full sm:w-auto text-base" asChild>
                                <Link href="/login?mode=signup">
                                    Start Your Free Trial <ArrowRight className="ml-2 w-4 h-4" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="rounded-full w-full sm:w-auto text-base glass" asChild>
                                <Link href="#features">See How It Works</Link>
                            </Button>
                        </div>

                        {/* Minimal Dashboard Preview / Graphic */}
                        <div className="mt-20 mx-auto max-w-5xl rounded-2xl border border-white/10 bg-black/40 shadow-2xl overflow-hidden glass">
                            <img
                                src="https://images.unsplash.com/photo-1519003722811-9237c1d3298a?q=80&w=2670&auto=format&fit=crop"
                                alt="Trucking Dashboard Preview"
                                className="w-full h-auto opacity-70 border-b border-white/5"
                            />
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-24 bg-card/50">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold font-headline mb-4">Everything You Need on the Road</h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Designed specifically for the trucking industry to handle the headaches of back-office management.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {/* Feature 1 */}
                            <div className="glass-card p-8 flex flex-col items-start hover:-translate-y-2 transition-transform duration-300">
                                <div className="p-3 bg-primary/20 rounded-xl mb-6 text-primary">
                                    <Truck className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Load Tracking</h3>
                                <p className="text-muted-foreground">Log your loads, deadhead miles, and instantly calculate broker fees vs. your true line-haul pay.</p>
                            </div>
                            {/* Feature 2 */}
                            <div className="glass-card p-8 flex flex-col items-start hover:-translate-y-2 transition-transform duration-300">
                                <div className="p-3 bg-accent/20 rounded-xl mb-6 text-accent">
                                    <BarChart4 className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Profit Analytics</h3>
                                <p className="text-muted-foreground">Beautiful charts show your revenue versus expenses, helping you identify your most profitable routes.</p>
                            </div>
                            {/* Feature 3 */}
                            <div className="glass-card p-8 flex flex-col items-start hover:-translate-y-2 transition-transform duration-300">
                                <div className="p-3 bg-success/20 rounded-xl mb-6 text-success">
                                    <ShieldCheck className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Secure Storage</h3>
                                <p className="text-muted-foreground">All your data is securely isolated in the cloud. Access your ledger from anywhere, anytime.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section className="py-24">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold font-headline mb-4">Simple, Transparent Pricing</h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Choose the plan that fits your operation size.</p>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

                            {/* Free Tier */}
                            <div className="glass-card p-8 border-white/5 flex flex-col">
                                <div className="mb-8">
                                    <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Basic</span>
                                    <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                                        $0<span className="text-xl text-muted-foreground font-medium ml-1">/mo</span>
                                    </div>
                                    <p className="mt-4 text-sm text-muted-foreground">For owner-operators just starting out.</p>
                                </div>
                                <ul className="space-y-4 mb-8 flex-1">
                                    {["Up to 10 active loads/month", "Basic expense tracking", "Standard dashboard viewing", "Community support"].map((feature) => (
                                        <li key={feature} className="flex flex-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                                            <span className="text-sm text-muted-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button variant="outline" className="w-full glass" asChild>
                                    <Link href="/login?mode=signup">Start for Free</Link>
                                </Button>
                            </div>

                            {/* Pro Tier */}
                            <div className="glass-card relative p-8 border-primary/50 shadow-[0_0_30px_rgba(var(--primary),0.15)] flex flex-col scale-105 z-10">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest py-1 px-4 rounded-full">
                                    Most Popular
                                </div>
                                <div className="mb-8 mt-4">
                                    <span className="text-sm font-medium uppercase tracking-wider text-primary">Pro</span>
                                    <div className="mt-4 flex items-baseline text-5xl font-extrabold text-white">
                                        $19.99<span className="text-xl text-muted-foreground font-medium ml-1">/mo</span>
                                    </div>
                                    <p className="mt-4 text-sm text-muted-foreground">For established owner-operators.</p>
                                </div>
                                <ul className="space-y-4 mb-8 flex-1">
                                    {["Unlimited active loads", "Advanced Line-haul calculator", "File uploads (Receipts, BOLs)", "CSV Data Export", "Basic profit analytics"].map((feature) => (
                                        <li key={feature} className="flex flex-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                                            <span className="text-sm text-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button className="w-full" asChild>
                                    <Link href="/login?mode=signup">Upgrade to Pro</Link>
                                </Button>
                            </div>

                            {/* Fleet Tier */}
                            <div className="glass-card p-8 border-white/5 flex flex-col">
                                <div className="mb-8">
                                    <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Fleet</span>
                                    <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                                        $49.99<span className="text-xl text-muted-foreground font-medium ml-1">/mo</span>
                                    </div>
                                    <p className="mt-4 text-sm text-muted-foreground">For small fleets and dispatchers.</p>
                                </div>
                                <ul className="space-y-4 mb-8 flex-1">
                                    {["Everything in Pro", "Multi-truck tracking", "Driver management", "P&L Statements per truck", "Priority 24/7 support"].map((feature) => (
                                        <li key={feature} className="flex flex-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                                            <span className="text-sm text-muted-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button variant="outline" className="w-full glass" asChild>
                                    <Link href="/login?mode=signup">Contact Sales</Link>
                                </Button>
                            </div>

                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 bg-card/30 py-12">
                <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-muted-foreground text-sm">
                    <div className="flex items-center gap-2 mb-4 md:mb-0">
                        <RvtLogo className="h-5 w-5" />
                        <span>&copy; {new Date().getFullYear()} RVT Accounting. All rights reserved.</span>
                    </div>
                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
                        <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
                        <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
