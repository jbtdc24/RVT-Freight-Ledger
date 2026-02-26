"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { useAuthContext } from "@/lib/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { User, Settings2, Briefcase, Database, Save, Activity, Trash2 } from "lucide-react";

export default function SettingsPage() {
    const { user, userData } = useAuthContext();
    const [loading, setLoading] = useState(false);

    // Dummy state for preferences to show UI
    const [preferences, setPreferences] = useState({
        currency: "USD",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        dateFormat: "MM/DD/YYYY",
        theme: "system",
        lineHaulPercent: "65"
    });

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 500); // Simulate save
    };

    return (
        <div className="space-y-6">
            <PageHeader title="Platform Settings">
                <Button onClick={handleSave} disabled={loading} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                </Button>
            </PageHeader>

            <Tabs defaultValue="account" className="w-full">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Navigation Sidebar */}
                    <Card className="w-full md:w-64 h-fit bg-card/50 backdrop-blur-xl border-white/10 shrink-0">
                        <TabsList className="flex flex-col h-auto bg-transparent p-2 gap-1 w-full items-stretch">
                            <TabsTrigger value="account" className="justify-start gap-3 h-11 px-4 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                                <User className="h-4 w-4" /> Account Details
                            </TabsTrigger>
                            <TabsTrigger value="preferences" className="justify-start gap-3 h-11 px-4 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                                <Settings2 className="h-4 w-4" /> Preferences
                            </TabsTrigger>
                            <TabsTrigger value="business" className="justify-start gap-3 h-11 px-4 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                                <Briefcase className="h-4 w-4" /> Business Config
                            </TabsTrigger>
                            <TabsTrigger value="archive" className="justify-start gap-3 h-11 px-4 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                                <Database className="h-4 w-4" /> Archive Management
                            </TabsTrigger>
                        </TabsList>
                    </Card>

                    {/* Content Area */}
                    <div className="flex-1">
                        {/* ACCOUNT DETAILS */}
                        <TabsContent value="account" className="mt-0">
                            <Card className="glass-card">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                        <CardTitle className="tracking-widest uppercase text-xs font-black text-muted-foreground">Account Information</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Manage your personal information and subscription details.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Display Name</Label>
                                            <Input defaultValue={user?.displayName || ""} disabled />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email Address</Label>
                                            <Input defaultValue={user?.email || ""} disabled />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Subscription Tier</Label>
                                            <Input defaultValue={userData?.subscriptionTier || "FREE"} disabled className="uppercase font-bold text-primary" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Account ID</Label>
                                            <Input defaultValue={user?.uid || ""} disabled className="font-mono text-xs" />
                                        </div>
                                    </div>

                                    {userData?.subscriptionTier === 'free' && (
                                        <div className="mt-4 p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <div>
                                                <h4 className="font-bold text-sm">Upgrade to Pro</h4>
                                                <p className="text-xs text-muted-foreground mt-1">Get more features and remove limits by upgrading your plan.</p>
                                            </div>
                                            <Button variant="default" className="shrink-0 w-full sm:w-auto">View Plans</Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* PREFERENCES */}
                        <TabsContent value="preferences" className="mt-0 space-y-6">
                            <Card className="glass-card">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                        <CardTitle className="tracking-widest uppercase text-xs font-black text-muted-foreground">Regional & Localization</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Time Zone</Label>
                                            <Select value={preferences.timeZone} onValueChange={(v) => setPreferences({ ...preferences, timeZone: v })}>
                                                <SelectTrigger>
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
                                                <SelectTrigger>
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
                                                <SelectTrigger>
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
                                </CardContent>
                            </Card>

                            <Card className="glass-card">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                        <CardTitle className="tracking-widest uppercase text-xs font-black text-muted-foreground">Personalization</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-3 border rounded-xl bg-muted/20">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Dark Mode</Label>
                                            <p className="text-xs text-muted-foreground">Enforce dark mode globally across the application.</p>
                                        </div>
                                        <Switch defaultChecked={true} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* BUSINESS CONFIG */}
                        <TabsContent value="business" className="mt-0">
                            <Card className="glass-card">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                        <CardTitle className="tracking-widest uppercase text-xs font-black text-muted-foreground">Default Financials</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2 max-w-sm">
                                        <Label>Default Owner / Driver Share (%)</Label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                value={preferences.lineHaulPercent}
                                                onChange={(e) => setPreferences({ ...preferences, lineHaulPercent: e.target.value })}
                                            />
                                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground text-sm">
                                                %
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            This percentage is automatically applied when calculating your share of line haul revenue for new freight entries.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ARCHIVE MANAGEMENT */}
                        <TabsContent value="archive" className="mt-0">
                            <Card className="glass-card border-orange-500/20">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-orange-500" />
                                        <CardTitle className="tracking-widest uppercase text-xs font-black text-orange-500/70">Data Recovery</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Restore deleted records or permanently purge them from the system.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl bg-muted/10">
                                        <Activity className="h-8 w-8 text-muted-foreground/30 mb-3" />
                                        <p className="text-sm font-semibold text-muted-foreground">Archive is Empty</p>
                                        <p className="text-xs text-muted-foreground/60 text-center max-w-sm mt-1">
                                            Records deleted over 30 days ago are automatically purged. Currently, there are no items available for recovery.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="glass-card mt-6 border-destructive/20 border-t-4 border-t-destructive">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="tracking-widest uppercase text-xs font-black text-destructive text-shadow-sm">Danger Zone</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-xl bg-destructive/5">
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-sm text-foreground">Delete Account</h4>
                                            <p className="text-xs text-muted-foreground">Permanently delete your account and all associated data.</p>
                                        </div>
                                        <Button variant="destructive" size="sm" className="gap-2">
                                            <Trash2 className="h-4 w-4" />
                                            Delete Account
                                        </Button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 border border-yellow-500/20 rounded-xl bg-yellow-500/5">
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-sm text-foreground">Export Data to CSV</h4>
                                            <p className="text-xs text-muted-foreground">Download a copy of all your freight records and expenses.</p>
                                        </div>
                                        <Button variant="outline" size="sm" className="gap-2 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10 border-yellow-500/20">
                                            <Database className="h-4 w-4" />
                                            Export CSV
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </div>
            </Tabs>
        </div>
    );
}
