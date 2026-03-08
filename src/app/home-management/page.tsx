"use client";

import { useState, useMemo, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Home, TrendingUp, TrendingDown, Calendar, Wallet, Plus,
    Trash2, Edit2, DollarSign, ShoppingCart, Car, Film, Zap, Heart,
    GraduationCap, Utensils, Briefcase, Gift, PiggyBank, MoreHorizontal,
    ArrowUpCircle, ArrowDownCircle, X, Search
} from "lucide-react";
import { format, startOfMonth, endOfMonth, isWithinInterval, startOfWeek, endOfWeek, startOfYear, endOfYear, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { type DateRange } from "react-day-picker";

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


import { useData } from "@/lib/data-context";
import { useAuthContext } from "@/lib/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

export default function HomeManagementPage() {
    const [activeTab, setActiveTab] = useState("overview");
    const {
        homeTransactions: transactions,
        userMetadata,
        saveHomeTransaction,
        deleteHomeTransaction,
        updateCustomCategories
    } = useData();
    const { user } = useAuthContext();
    const { toast } = useToast();

    // Transactions State logic
    const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
    const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
    const [transactionForm, setTransactionForm] = useState({
        type: "expense" as TransactionType,
        amount: "",
        category: "",
        description: "",
        date: format(new Date(), "yyyy-MM-dd"),
    });

    const customCategories = userMetadata?.customCategories?.home || { income: [], expense: [] };

    const removeCustomCategory = (type: string, cat: string) => {
        if (!window.confirm(`Delete custom category "${cat}"?`)) return;
        const updated = (customCategories[type] || []).filter(c => c !== cat);
        updateCustomCategories('home', type, updated);
    };


    // Filter State
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilterType, setDateFilterType] = useState<"week" | "month" | "year" | "range">("month");
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    const getCategoryLabel = (value: string) => {
        const all = [...incomeCategories, ...expenseCategories];
        return all.find(c => c.value === value)?.label || value;
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

    const filteredTransactions = useMemo(() => {
        let result = transactions;

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(t =>
                t.description.toLowerCase().includes(searchLower) ||
                t.category.toLowerCase().includes(searchLower) ||
                t.amount.toString().includes(searchLower) ||
                getCategoryLabel(t.category).toLowerCase().includes(searchLower)
            );
        }

        const now = new Date();
        let start: Date | undefined, end: Date | undefined;

        if (dateFilterType === 'week') {
            start = startOfWeek(now, { weekStartsOn: 1 });
            end = endOfWeek(now, { weekStartsOn: 1 });
        } else if (dateFilterType === 'month') {
            start = startOfMonth(now);
            end = endOfMonth(now);
        } else if (dateFilterType === 'year') {
            start = startOfYear(now);
            end = endOfYear(now);
        } else if (dateFilterType === 'range' && dateRange?.from) {
            start = startOfDay(dateRange.from);
            end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
        }

        if (start && end) {
            result = result.filter(t => {
                const d = new Date(t.date);
                return isWithinInterval(d, { start: start!, end: end! });
            });
        }

        return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, searchTerm, dateFilterType, dateRange]);


    const currentMonthLabel = useMemo(() => {
        if (dateFilterType === 'week') return "This Week";
        if (dateFilterType === 'month') return format(new Date(), "MMMM yyyy");
        if (dateFilterType === 'year') return format(new Date(), "yyyy");
        if (dateFilterType === 'range' && dateRange?.from) {
            if (dateRange.to) return `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`;
            return format(dateRange.from, "MMM d, yyyy");
        }
        return "All Time";
    }, [dateFilterType, dateRange]);

    // Calculate monthly totals based off FILTERED transactions
    const monthlyStats = useMemo(() => {
        const income = filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expenses = filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const expensesByCategory = filteredTransactions
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
            transactionCount: filteredTransactions.length,
        };
    }, [filteredTransactions]);

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

    const handleSaveTransaction = async () => {
        if (!user) {
            toast({
                title: "Authentication required",
                description: "Please sign in to save your transactions to the cloud.",
                variant: "destructive"
            });
            return;
        }

        const amount = parseFloat(transactionForm.amount);
        if (!amount || amount <= 0 || !transactionForm.category || !transactionForm.description.trim()) {
            toast({
                title: "Missing information",
                description: "Please fill in all fields with valid values.",
                variant: "destructive"
            });
            return;
        }

        const finalCategory = transactionForm.category.trim() || 'Other';
        const predefined = transactionForm.type === 'income' ? incomeCategories.map(c => c.value) : expenseCategories.map(c => c.value);
        const currentCustoms = customCategories[transactionForm.type] || [];

        try {
            if (!predefined.includes(finalCategory) && !currentCustoms.includes(finalCategory)) {
                await updateCustomCategories('home', transactionForm.type, [...currentCustoms, finalCategory]);
            }

            const transaction: Transaction = {
                id: editingTransactionId || Math.random().toString(36).substr(2, 9),
                type: transactionForm.type,
                amount,
                category: finalCategory,
                description: transactionForm.description,
                date: new Date(transactionForm.date).toISOString(),
            };

            await saveHomeTransaction(transaction);

            toast({
                title: editingTransactionId ? "Transaction updated" : "Transaction added",
                description: `Successfully saved ${transactionForm.description} for ${formatCurrency(amount)}.`
            });

            resetTransactionForm();
            setIsTransactionDialogOpen(false);
        } catch (error: any) {
            console.error("Failed to save transaction:", error);

            const errorMessage = error?.message || "Unknown error";
            const errorCode = error?.code || "no-code";

            toast({
                title: "Save failed",
                description: `Problem syncing with cloud (${errorCode}). ${errorMessage.substring(0, 50)}...`,
                variant: "destructive"
            });
        }
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
            deleteHomeTransaction(id);
        }
    };





    const getCategoryIcon = (value: string, type: TransactionType) => {
        const categories = type === 'income' ? incomeCategories : expenseCategories;
        const cat = categories.find(c => c.value === value);
        return cat?.icon || MoreHorizontal;
    };



    return (
        <div className="space-y-8">
            <PageHeader title="Home Management">
                <Badge variant="outline" className="text-sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    {currentMonthLabel}
                </Badge>
            </PageHeader>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search transactions..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-full w-full sm:w-auto overflow-x-auto">
                    {(['week', 'month', 'year', 'range'] as const).map(type => (
                        <Button
                            key={type}
                            variant={dateFilterType === type ? "default" : "ghost"}
                            size="sm"
                            className={cn("rounded-full capitalize", dateFilterType === type ? "shadow-sm" : "")}
                            onClick={() => setDateFilterType(type)}
                        >
                            {type}
                        </Button>
                    ))}
                    {dateFilterType === 'range' && (
                        <div className="ml-2">
                            <DateRangePicker date={dateRange} onDateChange={setDateRange} />
                        </div>
                    )}
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full max-w-[250px] grid-cols-2">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                </TabsList>

                {/* ==================== OVERVIEW TAB ==================== */}
                <TabsContent value="overview" className="space-y-6 mt-6">
                    {/* Summary Cards */}
                    <div className="grid gap-6 md:grid-cols-3">
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
                                                        </div>
                                                    </div>
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
                            {filteredTransactions.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No transactions found.</p>
                            ) : (
                                <div className="space-y-3">
                                    {filteredTransactions.slice(0, 5).map(t => {
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

                                    <div className="space-y-3">
                                        <Label>Category *</Label>
                                        <Input
                                            value={transactionForm.category}
                                            onChange={(e) => setTransactionForm({ ...transactionForm, category: e.target.value })}
                                            placeholder="Type or select a category below..."
                                        />
                                        <div className="flex flex-wrap gap-2">
                                            {(transactionForm.type === 'income' ? incomeCategories : expenseCategories)
                                                .filter(c => c.value !== 'other_income' && c.value !== 'other_expense')
                                                .map(c => (
                                                    <div
                                                        key={c.value}
                                                        onClick={() => setTransactionForm({ ...transactionForm, category: c.value })}
                                                        className={cn(
                                                            "px-3 py-1 flex items-center gap-1.5 text-[11px] font-semibold rounded-full cursor-pointer transition-colors border select-none",
                                                            transactionForm.category === c.value ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
                                                        )}
                                                    >
                                                        <c.icon className="h-3.5 w-3.5" />
                                                        {c.label}
                                                    </div>
                                                ))}
                                            {(customCategories[transactionForm.type] || []).map(c => (
                                                <div
                                                    key={c}
                                                    className={cn(
                                                        "flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold rounded-full cursor-pointer transition-colors border select-none group",
                                                        transactionForm.category === c ? "bg-primary/20 text-primary border-primary" : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                                                    )}
                                                    onClick={() => setTransactionForm({ ...transactionForm, category: c })}
                                                >
                                                    {c}
                                                    <X
                                                        className="h-3 w-3 text-muted-foreground group-hover:text-destructive transition-colors opacity-70 group-hover:opacity-100"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeCustomCategory(transactionForm.type, c);
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
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
                            {filteredTransactions.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-medium">No transactions found</p>
                                    <p className="text-sm">Adjust your filters or start tracking your income and expenses!</p>
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
                                        {filteredTransactions.map((t) => {
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


            </Tabs>
        </div>
    );
}
