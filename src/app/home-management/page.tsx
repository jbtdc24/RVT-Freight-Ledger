"use client";

import { useState, useMemo } from "react";
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
import { Progress } from "@/components/ui/progress";
import {
    Home, TrendingUp, TrendingDown, Calendar, Wallet, HandCoins, Plus, CheckCircle2,
    Clock, Trash2, Edit2, DollarSign, ShoppingCart, Car, Film, Zap, Heart,
    GraduationCap, Utensils, Briefcase, Gift, PiggyBank, CreditCard, MoreHorizontal,
    ArrowUpCircle, ArrowDownCircle
} from "lucide-react";
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

// Transaction Types
type TransactionType = 'income' | 'expense';

type Transaction = {
    id: string;
    type: TransactionType;
    amount: number;
    category: string;
    description: string;
    date: string;
};

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

type Budget = {
    category: string;
    limit: number;
};

// Category definitions
const incomeCategories = [
    { value: "salary", label: "Salary", icon: Briefcase },
    { value: "freelance", label: "Freelance", icon: DollarSign },
    { value: "business", label: "Business", icon: TrendingUp },
    { value: "investments", label: "Investments", icon: PiggyBank },
    { value: "gifts", label: "Gifts", icon: Gift },
    { value: "other_income", label: "Other", icon: MoreHorizontal },
];

const expenseCategories = [
    { value: "food", label: "Food & Dining", icon: Utensils },
    { value: "transportation", label: "Transportation", icon: Car },
    { value: "shopping", label: "Shopping", icon: ShoppingCart },
    { value: "entertainment", label: "Entertainment", icon: Film },
    { value: "bills", label: "Bills & Utilities", icon: Zap },
    { value: "healthcare", label: "Healthcare", icon: Heart },
    { value: "education", label: "Education", icon: GraduationCap },
    { value: "personal", label: "Personal Care", icon: Heart },
    { value: "other_expense", label: "Other", icon: MoreHorizontal },
];

const receivableCategories = ["Rent", "Invoice", "Loan Repayment", "Refund", "Salary", "Gift", "Other"];

export default function HomeManagementPage() {
    const [activeTab, setActiveTab] = useState("overview");

    // Transactions State
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
    const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
    const [transactionForm, setTransactionForm] = useState({
        type: "expense" as TransactionType,
        amount: "",
        category: "",
        description: "",
        date: format(new Date(), "yyyy-MM-dd"),
    });

    // Receivables State
    const [receivables, setReceivables] = useState<Receivable[]>([]);
    const [isReceivableDialogOpen, setIsReceivableDialogOpen] = useState(false);
    const [editingReceivableId, setEditingReceivableId] = useState<string | null>(null);
    const [receivableForm, setReceivableForm] = useState({
        source: "",
        description: "",
        amount: "",
        dueDate: format(new Date(), "yyyy-MM-dd"),
        category: "Other",
    });

    // Budgets State
    const [budgets, setBudgets] = useState<Budget[]>([
        { category: "food", limit: 500 },
        { category: "transportation", limit: 300 },
        { category: "entertainment", limit: 200 },
    ]);
    const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
    const [budgetForm, setBudgetForm] = useState({ category: "", limit: "" });

    const currentMonth = format(new Date(), "MMMM yyyy");
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

    // Calculate monthly totals
    const monthlyStats = useMemo(() => {
        const thisMonthTransactions = transactions.filter(t => {
            const date = new Date(t.date);
            return isWithinInterval(date, { start: monthStart, end: monthEnd });
        });

        const income = thisMonthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expenses = thisMonthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const expensesByCategory = thisMonthTransactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);

        return {
            income,
            expenses,
            balance: income - expenses,
            expensesByCategory,
            transactionCount: thisMonthTransactions.length,
        };
    }, [transactions, monthStart, monthEnd]);

    const pendingReceivables = receivables.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0);
    const paidReceivables = receivables.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0);

    // Transaction handlers
    const resetTransactionForm = () => {
        setTransactionForm({
            type: "expense",
            amount: "",
            category: "",
            description: "",
            date: format(new Date(), "yyyy-MM-dd"),
        });
        setEditingTransactionId(null);
    };

    const handleSaveTransaction = () => {
        const amount = parseFloat(transactionForm.amount);
        if (!amount || amount <= 0 || !transactionForm.category || !transactionForm.description.trim()) {
            alert("Please fill in all fields with valid values.");
            return;
        }

        if (editingTransactionId) {
            setTransactions(prev => prev.map(t => t.id === editingTransactionId ? {
                ...t,
                type: transactionForm.type,
                amount,
                category: transactionForm.category,
                description: transactionForm.description,
                date: new Date(transactionForm.date).toISOString(),
            } : t));
        } else {
            setTransactions(prev => [{
                id: Math.random().toString(36).substr(2, 9),
                type: transactionForm.type,
                amount,
                category: transactionForm.category,
                description: transactionForm.description,
                date: new Date(transactionForm.date).toISOString(),
            }, ...prev]);
        }

        resetTransactionForm();
        setIsTransactionDialogOpen(false);
    };

    const handleEditTransaction = (transaction: Transaction) => {
        setEditingTransactionId(transaction.id);
        setTransactionForm({
            type: transaction.type,
            amount: transaction.amount.toString(),
            category: transaction.category,
            description: transaction.description,
            date: format(new Date(transaction.date), "yyyy-MM-dd"),
        });
        setIsTransactionDialogOpen(true);
    };

    const handleDeleteTransaction = (id: string) => {
        if (window.confirm("Delete this transaction?")) {
            setTransactions(prev => prev.filter(t => t.id !== id));
        }
    };

    // Receivable handlers
    const resetReceivableForm = () => {
        setReceivableForm({
            source: "",
            description: "",
            amount: "",
            dueDate: format(new Date(), "yyyy-MM-dd"),
            category: "Other",
        });
        setEditingReceivableId(null);
    };

    const handleSaveReceivable = () => {
        const amount = parseFloat(receivableForm.amount);
        if (!receivableForm.source || isNaN(amount) || amount <= 0) {
            alert("Please fill in all required fields.");
            return;
        }

        if (editingReceivableId) {
            setReceivables(prev => prev.map(r => r.id === editingReceivableId ? {
                ...r,
                source: receivableForm.source,
                description: receivableForm.description,
                amount,
                dueDate: new Date(receivableForm.dueDate).toISOString(),
                category: receivableForm.category,
            } : r));
        } else {
            setReceivables(prev => [{
                id: Math.random().toString(36).substr(2, 9),
                source: receivableForm.source,
                description: receivableForm.description,
                amount,
                dueDate: new Date(receivableForm.dueDate).toISOString(),
                status: 'pending',
                category: receivableForm.category,
            }, ...prev]);
        }

        resetReceivableForm();
        setIsReceivableDialogOpen(false);
    };

    const handleMarkReceivablePaid = (id: string) => {
        setReceivables(prev => prev.map(r => r.id === id ? {
            ...r,
            status: 'paid',
            paidDate: new Date().toISOString(),
        } : r));
    };

    const handleDeleteReceivable = (id: string) => {
        if (window.confirm("Delete this receivable?")) {
            setReceivables(prev => prev.filter(r => r.id !== id));
        }
    };

    // Budget handlers
    const handleSaveBudget = () => {
        const limit = parseFloat(budgetForm.limit);
        if (!budgetForm.category || isNaN(limit) || limit <= 0) {
            alert("Please enter a valid category and limit.");
            return;
        }

        setBudgets(prev => {
            const existing = prev.findIndex(b => b.category === budgetForm.category);
            if (existing >= 0) {
                const updated = [...prev];
                updated[existing] = { category: budgetForm.category, limit };
                return updated;
            }
            return [...prev, { category: budgetForm.category, limit }];
        });

        setBudgetForm({ category: "", limit: "" });
        setIsBudgetDialogOpen(false);
    };

    const getCategoryLabel = (value: string) => {
        const all = [...incomeCategories, ...expenseCategories];
        return all.find(c => c.value === value)?.label || value;
    };

    const getCategoryIcon = (value: string, type: TransactionType) => {
        const categories = type === 'income' ? incomeCategories : expenseCategories;
        const cat = categories.find(c => c.value === value);
        return cat?.icon || MoreHorizontal;
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
                <TabsList className="grid w-full max-w-lg grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="budgets">Budgets</TabsTrigger>
                    <TabsTrigger value="receivables">Receivables</TabsTrigger>
                </TabsList>

                {/* ==================== OVERVIEW TAB ==================== */}
                <TabsContent value="overview" className="space-y-6 mt-6">
                    {/* Summary Cards */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="glass border-0">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Income</CardTitle>
                                <ArrowUpCircle className="h-5 w-5 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-500">{formatCurrency(monthlyStats.income)}</div>
                                <p className="text-xs text-muted-foreground mt-1">This month</p>
                            </CardContent>
                        </Card>

                        <Card className="glass border-0">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Expenses</CardTitle>
                                <ArrowDownCircle className="h-5 w-5 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-500">{formatCurrency(monthlyStats.expenses)}</div>
                                <p className="text-xs text-muted-foreground mt-1">This month</p>
                            </CardContent>
                        </Card>

                        <Card className="glass border-0">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Balance</CardTitle>
                                <Wallet className="h-5 w-5 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${monthlyStats.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {formatCurrency(monthlyStats.balance)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Income - Expenses</p>
                            </CardContent>
                        </Card>

                        <Card className="glass border-0">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                                <CreditCard className="h-5 w-5 text-amber-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-amber-500">{formatCurrency(pendingReceivables)}</div>
                                <p className="text-xs text-muted-foreground mt-1">Receivables</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Spending Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingDown className="h-5 w-5 text-red-500" />
                                Spending by Category
                            </CardTitle>
                            <CardDescription>Your expenses this month broken down by category</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {Object.keys(monthlyStats.expensesByCategory).length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No expenses recorded this month. Start tracking!</p>
                            ) : (
                                <div className="space-y-4">
                                    {Object.entries(monthlyStats.expensesByCategory)
                                        .sort((a, b) => b[1] - a[1])
                                        .map(([category, amount]) => {
                                            const budget = budgets.find(b => b.category === category);
                                            const percentage = budget ? (amount / budget.limit) * 100 : 0;
                                            const Icon = getCategoryIcon(category, 'expense');

                                            return (
                                                <div key={category} className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Icon className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">{getCategoryLabel(category)}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="font-bold text-red-500">{formatCurrency(amount)}</span>
                                                            {budget && (
                                                                <span className="text-xs text-muted-foreground ml-2">
                                                                    / {formatCurrency(budget.limit)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {budget && (
                                                        <Progress
                                                            value={Math.min(percentage, 100)}
                                                            className={`h-2 ${percentage > 100 ? '[&>div]:bg-red-500' : percentage > 80 ? '[&>div]:bg-amber-500' : '[&>div]:bg-green-500'}`}
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Transactions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {transactions.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No transactions yet. Add your first one!</p>
                            ) : (
                                <div className="space-y-3">
                                    {transactions.slice(0, 5).map(t => {
                                        const Icon = getCategoryIcon(t.category, t.type);
                                        return (
                                            <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                                        <Icon className={`h-4 w-4 ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{t.description}</p>
                                                        <p className="text-xs text-muted-foreground">{getCategoryLabel(t.category)} • {format(new Date(t.date), "MMM d")}</p>
                                                    </div>
                                                </div>
                                                <span className={`font-bold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ==================== TRANSACTIONS TAB ==================== */}
                <TabsContent value="transactions" className="space-y-6 mt-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">All Transactions</h2>
                        <Dialog open={isTransactionDialogOpen} onOpenChange={(open) => { setIsTransactionDialogOpen(open); if (!open) resetTransactionForm(); }}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Transaction
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{editingTransactionId ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
                                    <DialogDescription>Record income or expense</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    {/* Transaction Type Toggle */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            type="button"
                                            variant={transactionForm.type === 'income' ? 'default' : 'outline'}
                                            className={transactionForm.type === 'income' ? 'bg-green-500 hover:bg-green-600' : ''}
                                            onClick={() => setTransactionForm(prev => ({ ...prev, type: 'income', category: '' }))}
                                        >
                                            <ArrowUpCircle className="mr-2 h-4 w-4" />
                                            Income
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={transactionForm.type === 'expense' ? 'default' : 'outline'}
                                            className={transactionForm.type === 'expense' ? 'bg-red-500 hover:bg-red-600' : ''}
                                            onClick={() => setTransactionForm(prev => ({ ...prev, type: 'expense', category: '' }))}
                                        >
                                            <ArrowDownCircle className="mr-2 h-4 w-4" />
                                            Expense
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Date</Label>
                                            <Input
                                                type="date"
                                                value={transactionForm.date}
                                                onChange={(e) => setTransactionForm(prev => ({ ...prev, date: e.target.value }))}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Amount *</Label>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                value={transactionForm.amount}
                                                onChange={(e) => setTransactionForm(prev => ({ ...prev, amount: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Category *</Label>
                                        <Select
                                            value={transactionForm.category}
                                            onValueChange={(value) => setTransactionForm(prev => ({ ...prev, category: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(transactionForm.type === 'income' ? incomeCategories : expenseCategories).map(cat => (
                                                    <SelectItem key={cat.value} value={cat.value}>
                                                        <div className="flex items-center gap-2">
                                                            <cat.icon className="h-4 w-4" />
                                                            {cat.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Description *</Label>
                                        <Input
                                            placeholder="What was this for?"
                                            value={transactionForm.description}
                                            onChange={(e) => setTransactionForm(prev => ({ ...prev, description: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => { setIsTransactionDialogOpen(false); resetTransactionForm(); }}>Cancel</Button>
                                    <Button onClick={handleSaveTransaction}>{editingTransactionId ? "Update" : "Add"}</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            {transactions.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-medium">No transactions yet</p>
                                    <p className="text-sm">Start tracking your income and expenses!</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.map((t) => {
                                            const Icon = getCategoryIcon(t.category, t.type);
                                            return (
                                                <TableRow key={t.id}>
                                                    <TableCell className="text-muted-foreground">
                                                        {format(new Date(t.date), "MMM d, yyyy")}
                                                    </TableCell>
                                                    <TableCell className="font-medium">{t.description}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="gap-1">
                                                            <Icon className="h-3 w-3" />
                                                            {getCategoryLabel(t.category)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className={`text-right font-bold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button variant="ghost" size="sm" onClick={() => handleEditTransaction(t)}>
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteTransaction(t.id)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ==================== BUDGETS TAB ==================== */}
                <TabsContent value="budgets" className="space-y-6 mt-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Monthly Budgets</h2>
                        <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Set Budget
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Set Category Budget</DialogTitle>
                                    <DialogDescription>Set a monthly spending limit for a category</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label>Category</Label>
                                        <Select value={budgetForm.category} onValueChange={(v) => setBudgetForm(prev => ({ ...prev, category: v }))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {expenseCategories.map(cat => (
                                                    <SelectItem key={cat.value} value={cat.value}>
                                                        <div className="flex items-center gap-2">
                                                            <cat.icon className="h-4 w-4" />
                                                            {cat.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Monthly Limit ($)</Label>
                                        <Input
                                            type="number"
                                            placeholder="500"
                                            value={budgetForm.limit}
                                            onChange={(e) => setBudgetForm(prev => ({ ...prev, limit: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsBudgetDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={handleSaveBudget}>Save Budget</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {budgets.map(budget => {
                            const spent = monthlyStats.expensesByCategory[budget.category] || 0;
                            const percentage = (spent / budget.limit) * 100;
                            const remaining = budget.limit - spent;
                            const Icon = getCategoryIcon(budget.category, 'expense');

                            return (
                                <Card key={budget.category} className={percentage > 100 ? 'border-red-500/50' : ''}>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center justify-between text-base">
                                            <div className="flex items-center gap-2">
                                                <Icon className="h-4 w-4" />
                                                {getCategoryLabel(budget.category)}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setBudgets(prev => prev.filter(b => b.category !== budget.category))}
                                            >
                                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Spent</span>
                                            <span className={`font-bold ${percentage > 100 ? 'text-red-500' : ''}`}>
                                                {formatCurrency(spent)} / {formatCurrency(budget.limit)}
                                            </span>
                                        </div>
                                        <Progress
                                            value={Math.min(percentage, 100)}
                                            className={`h-3 ${percentage > 100 ? '[&>div]:bg-red-500' : percentage > 80 ? '[&>div]:bg-amber-500' : '[&>div]:bg-green-500'}`}
                                        />
                                        <p className={`text-sm ${remaining >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {remaining >= 0 ? `${formatCurrency(remaining)} remaining` : `${formatCurrency(Math.abs(remaining))} over budget!`}
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {budgets.length === 0 && (
                            <Card className="col-span-full">
                                <CardContent className="text-center py-12 text-muted-foreground">
                                    <PiggyBank className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-medium">No budgets set</p>
                                    <p className="text-sm">Set spending limits to track your habits!</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                {/* ==================== RECEIVABLES TAB ==================== */}
                <TabsContent value="receivables" className="space-y-6 mt-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Money Owed to You</h2>
                        <Dialog open={isReceivableDialogOpen} onOpenChange={(open) => { setIsReceivableDialogOpen(open); if (!open) resetReceivableForm(); }}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Receivable
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{editingReceivableId ? "Edit Receivable" : "Add Receivable"}</DialogTitle>
                                    <DialogDescription>Track money owed to you</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label>From (Source) *</Label>
                                        <Input
                                            placeholder="e.g., John Doe, Client Name"
                                            value={receivableForm.source}
                                            onChange={(e) => setReceivableForm(prev => ({ ...prev, source: e.target.value }))}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Category</Label>
                                        <Select value={receivableForm.category} onValueChange={(v) => setReceivableForm(prev => ({ ...prev, category: v }))}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {receivableCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Description</Label>
                                        <Input
                                            placeholder="Optional notes"
                                            value={receivableForm.description}
                                            onChange={(e) => setReceivableForm(prev => ({ ...prev, description: e.target.value }))}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Amount *</Label>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                value={receivableForm.amount}
                                                onChange={(e) => setReceivableForm(prev => ({ ...prev, amount: e.target.value }))}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Due Date</Label>
                                            <Input
                                                type="date"
                                                value={receivableForm.dueDate}
                                                onChange={(e) => setReceivableForm(prev => ({ ...prev, dueDate: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => { setIsReceivableDialogOpen(false); resetReceivableForm(); }}>Cancel</Button>
                                    <Button onClick={handleSaveReceivable}>{editingReceivableId ? "Update" : "Add"}</Button>
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
                                <div className="text-2xl font-bold text-amber-500">{formatCurrency(pendingReceivables)}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {receivables.filter(r => r.status === 'pending').length} items
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="glass border-0">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Collected</CardTitle>
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-500">{formatCurrency(paidReceivables)}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {receivables.filter(r => r.status === 'paid').length} items
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            {receivables.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <HandCoins className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-medium">No receivables</p>
                                    <p className="text-sm">Track money that others owe you!</p>
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
                                        {receivables.map((r) => (
                                            <TableRow key={r.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{r.source}</div>
                                                        {r.description && <div className="text-xs text-muted-foreground">{r.description}</div>}
                                                    </div>
                                                </TableCell>
                                                <TableCell><Badge variant="outline">{r.category}</Badge></TableCell>
                                                <TableCell className="text-muted-foreground">{format(new Date(r.dueDate), "MMM d, yyyy")}</TableCell>
                                                <TableCell>{getStatusBadge(r.status)}</TableCell>
                                                <TableCell className="text-right font-bold text-green-500">+{formatCurrency(r.amount)}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        {r.status === 'pending' && (
                                                            <Button variant="ghost" size="sm" className="text-green-500" onClick={() => handleMarkReceivablePaid(r.id)}>
                                                                <CheckCircle2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteReceivable(r.id)}>
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
