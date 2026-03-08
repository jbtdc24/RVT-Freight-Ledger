"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/lib/contexts/auth-context";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { User, Settings2, Briefcase, Database, Save, Activity, Trash2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import { useTheme } from "next-themes";

interface SettingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children?: React.ReactNode;
}

export function SettingsModal({ open, onOpenChange, children }: SettingsModalProps) {
    const { user, userData } = useAuthContext();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [isUpgrading, setIsUpgrading] = useState(false);

    const { theme, setTheme } = useTheme();

    // Preferences state to show UI
    const [preferences, setPreferences] = useState({
        currency: "USD",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        dateFormat: "MM/DD/YYYY",
        lineHaulPercent: userData?.defaultOwnerPercentage?.toString() || "65"
    });

    useEffect(() => {
        if (userData?.defaultOwnerPercentage) {
            setPreferences(prev => ({ ...prev, lineHaulPercent: userData.defaultOwnerPercentage.toString() }));
        }
    }, [userData]);

    const handleSave = async () => {
        setLoading(true);
        if (user) {
            try {
                const parsedPercent = Number(preferences.lineHaulPercent);
                await updateDoc(doc(db, "users", user.uid), {
                    themePreference: theme === 'dark' ? 'dark' : 'light',
                    defaultOwnerPercentage: isNaN(parsedPercent) ? 100 : parsedPercent
                });
                toast({
                    title: "Settings Saved",
                    description: "Your preferences have been updated successfully.",
                });
            } catch (err) {
                toast({
                    title: "Settings Save Failed",
                    description: "There was a problem saving your preferences.",
                    variant: "destructive"
                });
            }
        }
        setLoading(false);
    };

    const handleSimulatedUpgrade = async () => {
        if (!user) return;
        try {
            setIsUpgrading(true);
            // Simulate network delay for payment processing
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update user in Firestore to Pro
            await updateDoc(doc(db, "users", user.uid), {
                subscriptionTier: "Pro"
            });

            toast({
                title: "Upgrade Successful!",
                description: "Your account is now Pro. Thank you for subscribing.",
                variant: "default",
            });
            // The AuthContext onSnapshot should automatically detect this and trigger a re-render
            // with the new tier, but for immediate UI fallback if it's lagging:
            window.location.reload();
        } catch (error) {
            console.error(error);
            toast({
                title: "Upgrade Failed",
                description: "Could not process payment simulation.",
                variant: "destructive",
            });
        } finally {
            setIsUpgrading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {children && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-full glass-card p-0 gap-0 border-white/10">
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-border/50 bg-background/80 backdrop-blur-xl">
                    <DialogHeader className="p-0">
                        <DialogTitle className="text-xl font-headline font-bold">Platform Settings</DialogTitle>
                        <DialogDescription className="text-xs">
                            Manage your account preferences and financial configurations.
                        </DialogDescription>
                    </DialogHeader>
                    <Button onClick={handleSave} disabled={loading} className="gap-2 shrink-0">
                        <Save className="h-4 w-4" />
                        Save Changes
                    </Button>
                </div>

                <div className="p-6">
                    <Tabs defaultValue="account" className="w-full flex flex-col md:flex-row gap-6">
                        {/* Navigation Sidebar */}
                        <div className="w-full md:w-56 shrink-0">
                            <TabsList className="flex flex-col h-auto bg-transparent p-0 gap-1 w-full items-stretch">
                                <TabsTrigger value="account" className="justify-start gap-3 h-11 px-4 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 rounded-xl transition-all">
                                    <User className="h-4 w-4" /> Account Details
                                </TabsTrigger>
                                <TabsTrigger value="preferences" className="justify-start gap-3 h-11 px-4 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 rounded-xl transition-all">
                                    <Settings2 className="h-4 w-4" /> Preferences
                                </TabsTrigger>
                                <TabsTrigger value="business" className="justify-start gap-3 h-11 px-4 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 rounded-xl transition-all">
                                    <Briefcase className="h-4 w-4" /> Business Config
                                </TabsTrigger>
                                <TabsTrigger value="archive" className="justify-start gap-3 h-11 px-4 data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive border border-transparent data-[state=active]:border-destructive/20 rounded-xl transition-all">
                                    <Database className="h-4 w-4" /> Data & Archive
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 min-w-0">
                            {/* ACCOUNT DETAILS */}
                            <TabsContent value="account" className="mt-0 outline-none">
                                <Card className="bg-transparent border-0 shadow-none">
                                    <CardHeader className="px-0 pt-0">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-primary" />
                                            <CardTitle className="tracking-widest uppercase text-xs font-black text-muted-foreground">Account Information</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="px-0 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label>Display Name</Label>
                                                <Input defaultValue={user?.displayName || ""} disabled className="bg-muted/30" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Email Address</Label>
                                                <Input defaultValue={user?.email || ""} disabled className="bg-muted/30" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Subscription Tier</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input defaultValue={userData?.subscriptionTier || "Free"} disabled className="uppercase font-bold text-primary bg-primary/5 border-primary/20" />
                                                    {userData?.subscriptionTier === 'Pro' && (
                                                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Account ID</Label>
                                                <Input defaultValue={user?.uid || ""} disabled className="font-mono text-xs bg-muted/30" />
                                            </div>
                                        </div>

                                        {(userData?.subscriptionTier === 'Free' || !userData?.subscriptionTier) && (
                                            <div className="mt-8 p-6 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent flex flex-col items-start gap-4 shadow-[inset_0_0_20px_rgba(var(--primary),0.1)]">
                                                <div className="space-y-1 w-full">
                                                    <div className="flex items-center justify-between w-full">
                                                        <h4 className="font-bold text-lg text-primary">Upgrade to Pro</h4>
                                                        <span className="font-bold text-xl">$19.99<span className="text-sm text-muted-foreground">/mo</span></span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">Unlock unlimited active loads, advanced line-haul calculators, and AI Auto-Scan PDF receipts.</p>
                                                </div>
                                                <Button
                                                    onClick={handleSimulatedUpgrade}
                                                    disabled={isUpgrading}
                                                    className="w-full sm:w-auto shadow-[0_0_15px_rgba(var(--primary),0.3)] transition-all hover:scale-105"
                                                >
                                                    {isUpgrading ? "Processing Payment..." : "Simulate Payment & Upgrade"}
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* PREFERENCES */}
                            <TabsContent value="preferences" className="mt-0 space-y-8 outline-none">
                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                        <h3 className="tracking-widest uppercase text-xs font-black text-muted-foreground">Regional & Localization</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Time Zone</Label>
                                            <Select value={preferences.timeZone} onValueChange={(v) => setPreferences({ ...preferences, timeZone: v })}>
                                                <SelectTrigger className="bg-background/50">
                                                    <SelectValue placeholder="Select Timezone" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                                                        {Intl.DateTimeFormat().resolvedOptions().timeZone} (Auto-detected)
                                                    </SelectItem>
                                                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                                                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                                                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                                                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Date Format</Label>
                                            <Select value={preferences.dateFormat} onValueChange={(v) => setPreferences({ ...preferences, dateFormat: v })}>
                                                <SelectTrigger className="bg-background/50">
                                                    <SelectValue placeholder="Select Format" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US)</SelectItem>
                                                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (UK/EU)</SelectItem>
                                                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Currency Layout</Label>
                                            <Select value={preferences.currency} onValueChange={(v) => setPreferences({ ...preferences, currency: v })}>
                                                <SelectTrigger className="bg-background/50">
                                                    <SelectValue placeholder="Select Currency" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="USD">USD ($)</SelectItem>
                                                    <SelectItem value="EUR">EUR (€)</SelectItem>
                                                    <SelectItem value="GBP">GBP (£)</SelectItem>
                                                    <SelectItem value="CAD">CAD ($)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                        <h3 className="tracking-widest uppercase text-xs font-black text-muted-foreground">Personalization</h3>
                                    </div>
                                    <div className="flex items-center justify-between p-4 border rounded-xl bg-card/30">
                                        <div className="space-y-1">
                                            <Label className="text-base">Dark Mode UI</Label>
                                            <p className="text-xs text-muted-foreground">Enforce dark mode globally across the application.</p>
                                        </div>
                                        <Switch
                                            checked={theme === 'dark'}
                                            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                                        />
                                    </div>
                                </section>
                            </TabsContent>

                            {/* BUSINESS CONFIG */}
                            <TabsContent value="business" className="mt-0 outline-none">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                    <h3 className="tracking-widest uppercase text-xs font-black text-muted-foreground">Default Financials</h3>
                                </div>
                                <div className="space-y-2 max-w-sm">
                                    <Label>Default Owner / Driver Share (%)</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            className="bg-background/50 pr-8"
                                            value={preferences.lineHaulPercent}
                                            onChange={(e) => setPreferences({ ...preferences, lineHaulPercent: e.target.value })}
                                        />
                                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground text-sm font-bold">
                                            %
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                        This percentage is automatically applied when calculating your share of line haul revenue for new freight entries.
                                    </p>
                                </div>
                            </TabsContent>

                            {/* ARCHIVE MANAGEMENT */}
                            <TabsContent value="archive" className="mt-0 space-y-8 outline-none">
                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="h-2 w-2 rounded-full bg-orange-500" />
                                        <h3 className="tracking-widest uppercase text-xs font-black text-orange-500/80">Data Recovery</h3>
                                    </div>
                                    <div className="flex flex-col items-center justify-center py-12 px-6 border border-dashed border-border/50 rounded-xl bg-card/30">
                                        <Activity className="h-10 w-10 text-muted-foreground/20 mb-4" />
                                        <p className="text-sm font-semibold text-foreground">Archive is Empty</p>
                                        <p className="text-xs text-muted-foreground text-center max-w-sm mt-2 leading-relaxed">
                                            Records deleted over 30 days ago are automatically purged. Currently, there are no items available for recovery.
                                        </p>
                                    </div>
                                </section>

                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="h-2 w-2 rounded-full bg-destructive" />
                                        <h3 className="tracking-widest uppercase text-xs font-black text-destructive text-shadow-sm">Danger Zone</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 border border-yellow-500/20 rounded-xl bg-yellow-500/5 transition-colors hover:bg-yellow-500/10">
                                            <div className="space-y-1">
                                                <h4 className="font-bold text-sm text-foreground">Export Data to CSV</h4>
                                                <p className="text-xs text-muted-foreground">Download a local copy of all your freight records and expenses.</p>
                                            </div>
                                            <Button variant="outline" size="sm" className="gap-2 text-yellow-500 hover:text-yellow-600 border-yellow-500/30">
                                                <Database className="h-4 w-4" />
                                                Export CSV
                                            </Button>
                                        </div>
                                        <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-xl bg-destructive/5 transition-colors hover:bg-destructive/10">
                                            <div className="space-y-1">
                                                <h4 className="font-bold text-sm text-foreground">Delete Account</h4>
                                                <p className="text-xs text-muted-foreground">Permanently delete your account and all associated data in the cloud.</p>
                                            </div>
                                            <Button variant="destructive" size="sm" className="gap-2 shrink-0">
                                                <Trash2 className="h-4 w-4" />
                                                Delete Account
                                            </Button>
                                        </div>
                                    </div>
                                </section>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}
