"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, TrendingUp, TrendingDown, DollarSign, Calendar, PiggyBank, CreditCard, Wallet, HandCoins, Plus, CheckCircle2, Clock, Trash2, Edit2 } from "lucide-react";
import { format } from "date-fns";

type Receivable = {
    id: string;
    source: string;
    description: string;
    amount: number;
    dueDate: string;
    status: 'pending' | 'paid' | 'overdue';
    paidDate?: string;
    category: string;
};

const categories = [
    "Rent",
    "Invoice",
    "Loan Repayment",
    "Refund",
    "Salary",
    "Gift",
    "Other"
];

export default function HomeManagementPage() {
    const [activeTab, setActiveTab] = useState("overview");
    const [receivables, setReceivables] = useState<Receivable[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        source: "",
        description: "",
        amount: "",
        dueDate: format(new Date(), "yyyy-MM-dd"),
        category: "Other",
    });

    const currentMonth = format(new Date(), "MMMM yyyy");

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

    // Receivables calculations
    const totalPending = receivables.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0);
    const totalPaid = receivables.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0);

    const resetForm = () => {
        setFormData({
            source: "",
            description: "",
            amount: "",
            dueDate: format(new Date(), "yyyy-MM-dd"),
            category: "Other",
        });
        setEditingId(null);
    };

    const handleSave = () => {
        const amount = parseFloat(formData.amount);
        if (!formData.source || isNaN(amount) || amount <= 0) {
            alert("Please fill in all required fields with valid values.");
            return;
        }

        if (editingId) {
            setReceivables(prev => prev.map(r => r.id === editingId ? {
                ...r,
                source: formData.source,
                description: formData.description,
                amount: amount,
                dueDate: new Date(formData.dueDate).toISOString(),
                category: formData.category,
            } : r));
        } else {
            const newReceivable: Receivable = {
                id: Math.random().toString(36).substr(2, 9),
                source: formData.source,
                description: formData.description,
                amount: amount,
                dueDate: new Date(formData.dueDate).toISOString(),
                status: 'pending',
                category: formData.category,
            };
            setReceivables(prev => [newReceivable, ...prev]);
        }

        resetForm();
        setIsDialogOpen(false);
    };

    const handleEdit = (receivable: Receivable) => {
        setEditingId(receivable.id);
        setFormData({
            source: receivable.source,
            description: receivable.description,
            amount: receivable.amount.toString(),
            dueDate: format(new Date(receivable.dueDate), "yyyy-MM-dd"),
            category: receivable.category,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Delete this receivable?")) {
            setReceivables(prev => prev.filter(r => r.id !== id));
        }
    };

    const handleMarkPaid = (id: string) => {
        setReceivables(prev => prev.map(r => r.id === id ? {
            ...r,
            status: 'paid',
            paidDate: new Date().toISOString(),
        } : r));
    };

    const getStatusBadge = (status: Receivable['status']) => {
        switch (status) {
            case 'paid':
                return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Paid</Badge>;
            case 'overdue':
                return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Overdue</Badge>;
            default:
                return <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">Pending</Badge>;
        }
    };

    return (
        <div className="space-y-8">
            <PageHeader title="Home Management">
                <Badge variant="outline" className="text-sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    {currentMonth}
                </Badge>
            </PageHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="receivables">Receivables</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-6 mt-6">
                    {/* Quick Stats */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="glass border-0">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
                                <TrendingUp className="h-5 w-5 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-500">{formatCurrency(totalPaid)}</div>
                                <p className="text-xs text-muted-foreground mt-1">Collected this period</p>
                            </CardContent>
                        </Card>

                        <Card className="glass border-0">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
                                <TrendingDown className="h-5 w-5 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-500">{formatCurrency(0)}</div>
                                <p className="text-xs text-muted-foreground mt-1">This period</p>
                            </CardContent>
                        </Card>

                        <Card className="glass border-0">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Net Balance</CardTitle>
                                <Wallet className="h-5 w-5 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-500">{formatCurrency(totalPaid)}</div>
                                <p className="text-xs text-muted-foreground mt-1">Income - Expenses</p>
                            </CardContent>
                        </Card>

                        <Card className="glass border-0">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Receivables</CardTitle>
                                <CreditCard className="h-5 w-5 text-amber-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-amber-500">{formatCurrency(totalPending)}</div>
                                <p className="text-xs text-muted-foreground mt-1">Awaiting payment</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Getting Started */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Home className="h-5 w-5 text-primary" />
                                Getting Started
                            </CardTitle>
                            <CardDescription>
                                Track your personal or household finances with this simple spending tracker.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="p-4 border rounded-lg bg-muted/30">
                                    <h3 className="font-semibold mb-2">📥 Add Receivables</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Go to the <strong>Receivables</strong> tab to manually add expected income,
                                        such as rent payments, invoices, or any money owed to you.
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg bg-muted/30">
                                    <h3 className="font-semibold mb-2">📊 Track Progress</h3>
                                    <p className="text-sm text-muted-foreground">
                                        View your financial overview here. As you add receivables and mark them as paid,
                                        your dashboard will update automatically.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* RECEIVABLES TAB */}
                <TabsContent value="receivables" className="space-y-6 mt-6">
                    {/* Add Button */}
                    <div className="flex justify-end">
                        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Receivable
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{editingId ? "Edit Receivable" : "Add New Receivable"}</DialogTitle>
                                    <DialogDescription>
                                        Track money that is owed to you.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="source">Source / From *</Label>
                                        <Input
                                            id="source"
                                            placeholder="e.g., Tenant Name, Client Name"
                                            value={formData.source}
                                            onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map(cat => (
                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Input
                                            id="description"
                                            placeholder="Optional notes"
                                            value={formData.description}
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="amount">Amount *</Label>
                                            <Input
                                                id="amount"
                                                type="number"
                                                placeholder="0.00"
                                                value={formData.amount}
                                                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="dueDate">Due Date</Label>
                                            <Input
                                                id="dueDate"
                                                type="date"
                                                value={formData.dueDate}
                                                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>Cancel</Button>
                                    <Button onClick={handleSave}>{editingId ? "Update" : "Add"} Receivable</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="glass border-0">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                                <Clock className="h-5 w-5 text-amber-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-amber-500">{formatCurrency(totalPending)}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {receivables.filter(r => r.status === 'pending').length} items awaiting payment
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="glass border-0">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Collected</CardTitle>
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-500">{formatCurrency(totalPaid)}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {receivables.filter(r => r.status === 'paid').length} items received
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Receivables Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HandCoins className="h-5 w-5 text-primary" />
                                All Receivables
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {receivables.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <HandCoins className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-medium">No receivables yet</p>
                                    <p className="text-sm">Click "Add Receivable" to start tracking money owed to you.</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Source</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Due Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {receivables.map((receivable) => (
                                            <TableRow key={receivable.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{receivable.source}</div>
                                                        {receivable.description && (
                                                            <div className="text-xs text-muted-foreground">{receivable.description}</div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{receivable.category}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        {format(new Date(receivable.dueDate), "MMM d, yyyy")}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(receivable.status)}</TableCell>
                                                <TableCell className="text-right font-bold text-green-500">
                                                    +{formatCurrency(receivable.amount)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        {receivable.status === 'pending' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-green-500 hover:bg-green-500/10"
                                                                onClick={() => handleMarkPaid(receivable.id)}
                                                            >
                                                                <CheckCircle2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEdit(receivable)}
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleDelete(receivable.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
