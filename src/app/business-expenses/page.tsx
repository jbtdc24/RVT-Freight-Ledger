"use client";

import { useState, useMemo } from 'react';
import { useData } from "@/lib/data-context";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Truck, Users, Plus, Search, Calendar as CalendarIcon, DollarSign, BarChart3, ChevronLeft, ChevronRight, PieChart as PieChartIcon, BarChart2, Clock, Edit2, Trash2 } from "lucide-react";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { StandaloneExpense, ExpenseCategory } from "@/lib/types";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { type DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Pie, PieChart, Cell } from "recharts";

const expenseCategories: ExpenseCategory[] = ['Maintenance', 'Fuel', 'Repairs', 'Tolls', 'Scale Ticket', 'Other'];

const chartConfig = {
    amount: {
        label: "Amount",
        color: "hsl(var(--destructive))",
    },
    truck: { label: "Truck", color: "#ef4444" },
    office: { label: "Office", color: "#3b82f6" },
    driver: { label: "Driver", color: "#10b981" },
};

export default function BusinessExpensesPage() {
    const { expenses, setExpenses, assets, drivers, deleteItem } = useData();
    const [editingId, setEditingId] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState("truck");
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // New Expense State
    const [newExpense, setNewExpense] = useState({
        amount: "",
        description: "",
        category: "Other" as ExpenseCategory,
        date: format(new Date(), "yyyy-MM-dd"),
        assetId: "",
        driverId: "",
        id: ""
    });

    // Filter Logic
    const filteredExpenses = useMemo(() => {
        return expenses.filter(e => {
            if (e.isDeleted) return false;

            // 1. Search
            const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.amount.toString().includes(searchTerm);
            if (!matchesSearch) return false;

            // 2. Tab Filter
            if (activeTab === 'truck' && !e.assetId) return false;
            if (activeTab === 'driver' && !e.driverId) return false;
            if (activeTab === 'office' && (e.assetId || e.driverId)) return false;

            // 3. Date Range
            if (dateRange?.from) {
                const expenseDate = new Date(e.date);
                const start = startOfDay(dateRange.from);
                const end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
                if (!isWithinInterval(expenseDate, { start, end })) return false;
            }

            return true;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [expenses, activeTab, searchTerm, dateRange]);

    const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
    const paginatedExpenses = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredExpenses.slice(start, start + itemsPerPage);
    }, [filteredExpenses, currentPage]);

    // Reset pagination when filters change
    useMemo(() => {
        setCurrentPage(1);
    }, [activeTab, searchTerm, dateRange]);

    // --- Clean Summary Logic (Standalone Only) ---
    const summaryData = useMemo(() => {
        let total = 0;
        let count = 0;
        let truckSub = 0;
        let officeSub = 0;
        let driverSub = 0;
        const categories: Record<string, number> = {};

        expenses.forEach(e => {
            if (e.isDeleted) return;
            if (dateRange?.from) {
                const d = new Date(e.date);
                const start = startOfDay(dateRange.from);
                const end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
                if (!isWithinInterval(d, { start, end })) return;
            }

            total += e.amount;
            count += 1;
            categories[e.category] = (categories[e.category] || 0) + e.amount;

            if (e.assetId) truckSub += e.amount;
            else if (e.driverId) driverSub += e.amount;
            else officeSub += e.amount;
        });

        const topCatEntry = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];

        return {
            total,
            count,
            truckSub,
            officeSub,
            driverSub,
            topCategory: topCatEntry ? topCatEntry[0] : "N/A",
            topCategoryAmount: topCatEntry ? topCatEntry[1] : 0
        };
    }, [expenses, dateRange]);

    const chartData = useMemo(() => {
        const data: Record<string, number> = {};
        filteredExpenses.forEach(e => {
            const key = activeTab === 'truck' && e.assetName ? e.assetName :
                activeTab === 'driver' && e.driverName ? e.driverName :
                    e.category;
            data[key] = (data[key] || 0) + e.amount;
        });
        return Object.entries(data).map(([name, amount]) => ({
            name,
            amount
        })).sort((a, b) => b.amount - a.amount).slice(0, 5);
    }, [filteredExpenses, activeTab]);

    const handleSave = () => {
        const amount = parseFloat(newExpense.amount);
        if (isNaN(amount) || amount <= 0) return;

        // Validation based on tab
        if (activeTab === 'truck' && !newExpense.assetId) return; // Must select asset
        if (activeTab === 'driver' && !newExpense.driverId) return; // Must select driver

        if (editingId) {
            // UPDATE
            setExpenses(prev => prev.map(e => e.id === editingId ? {
                ...e,
                category: newExpense.category,
                description: newExpense.description,
                amount: amount,
                date: new Date(newExpense.date).toISOString(),
                assetId: activeTab === 'truck' ? newExpense.assetId : undefined,
                assetName: activeTab === 'truck' ? assets.find(a => a.id === newExpense.assetId)?.identifier : undefined,
                driverId: activeTab === 'driver' ? newExpense.driverId : undefined,
                driverName: activeTab === 'driver' ? drivers.find(d => d.id === newExpense.driverId)?.name : undefined,
            } : e));
        } else {
            // CREATE
            const expense: StandaloneExpense = {
                id: Math.random().toString(36).substr(2, 9),
                category: newExpense.category,
                description: newExpense.description || (activeTab === 'truck' ? 'Truck Expense' : activeTab === 'driver' ? 'Driver Expense' : 'Office Expense'),
                amount: amount,
                date: new Date(newExpense.date).toISOString(),
                assetId: activeTab === 'truck' ? newExpense.assetId : undefined,
                assetName: activeTab === 'truck' ? assets.find(a => a.id === newExpense.assetId)?.identifier : undefined,
                driverId: activeTab === 'driver' ? newExpense.driverId : undefined,
                driverName: activeTab === 'driver' ? drivers.find(d => d.id === newExpense.driverId)?.name : undefined,
                comments: [
                    {
                        id: Math.random().toString(36).substr(2, 9),
                        text: "Expense created via Business Expenses tab.",
                        author: "System",
                        timestamp: new Date().toISOString(),
                        type: 'system'
                    }
                ]
            };
            setExpenses(prev => [...prev, expense]);
        }

        setIsDialogOpen(false);
        setEditingId(null);

        // Reset form
        setNewExpense({
            amount: "",
            description: "",
            category: "Other",
            date: format(new Date(), "yyyy-MM-dd"),
            assetId: "",
            driverId: "",
            id: ""
        });
    };

    const handleEdit = (expense: StandaloneExpense) => {
        setEditingId(expense.id);
        setNewExpense({
            amount: expense.amount.toString(),
            description: expense.description,
            category: expense.category,
            date: format(new Date(expense.date), "yyyy-MM-dd"),
            assetId: expense.assetId || "",
            driverId: expense.driverId || "",
            id: expense.id
        });
        setIsDialogOpen(true);
    };

    const openDialog = () => {
        setEditingId(null);
        setNewExpense({
            amount: "",
            description: "",
            category: activeTab === 'truck' ? 'Fuel' : 'Other', // meaningful default
            date: format(new Date(), "yyyy-MM-dd"),
            assetId: "",
            driverId: "",
            id: ""
        });
        setIsDialogOpen(true);
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    return (
        <>
            <PageHeader title="Business Expenses">
                <p className="text-muted-foreground">Manage overhead costs for trucks, office, and drivers.</p>
            </PageHeader>

            <div className="flex flex-col gap-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <TabsList className="grid w-full max-w-[650px] grid-cols-3">
                            <TabsTrigger value="truck" className="flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                Truck expenses ( by assets )
                            </TabsTrigger>
                            <TabsTrigger value="office" className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                Office expenses
                            </TabsTrigger>
                            <TabsTrigger value="driver" className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Drivers expenses ( by Driver )
                            </TabsTrigger>
                        </TabsList>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="w-[240px]">
                                <DateRangePicker date={dateRange} onDateChange={setDateRange} />
                            </div>
                            <div className="relative w-[200px]">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button onClick={openDialog} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add Expense
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3 mb-8">
                        {/* TOTAL OVERHEAD */}
                        <Card className="glass-card flex flex-col justify-center border-l-4 border-l-destructive">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Business Overhead</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold tracking-tight text-destructive">{formatCurrency(summaryData.total)}</div>
                                <p className="text-[10px] text-muted-foreground mt-1">Across {summaryData.count} standalone entries</p>
                            </CardContent>
                        </Card>

                        {/* BREAKDOWN CARD */}
                        <Card className="glass-card flex flex-col justify-center">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Type Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-muted-foreground">Trucks</span>
                                    <span className="font-bold">{formatCurrency(summaryData.truckSub)}</span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-muted-foreground">Drivers</span>
                                    <span className="font-bold">{formatCurrency(summaryData.driverSub)}</span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-muted-foreground">Office</span>
                                    <span className="font-bold">{formatCurrency(summaryData.officeSub)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* TOP CATEGORY CARD */}
                        <Card className="glass-card flex flex-col justify-center border-r-4 border-r-orange-500">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Highest Category</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold tracking-tight text-orange-500">{summaryData.topCategory}</div>
                                <p className="text-[10px] text-muted-foreground mt-1">{formatCurrency(summaryData.topCategoryAmount)} spent</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="bg-muted/30 rounded-xl p-4 mb-6 flex justify-between items-center border border-white/5">
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{activeTab} expenses subtotal</p>
                            <div className="text-2xl font-bold text-destructive">
                                {formatCurrency(filteredExpenses.reduce((sum, e) => sum + e.amount, 0))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-muted-foreground">
                            Showing {paginatedExpenses.length} of {filteredExpenses.length} entries
                        </p>
                    </div>

                    {/* SHARED TABLE COMPONENT FOR ALL TABS */}
                    <Card className="glass-card">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-white/5">
                                        <TableHead className="w-[150px]">Date</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Category</TableHead>
                                        {activeTab === 'truck' && <TableHead>Asset</TableHead>}
                                        {activeTab === 'driver' && <TableHead>Driver</TableHead>}
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedExpenses.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                No expenses found matching your criteria.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedExpenses.map((expense) => (
                                            <TableRow key={expense.id} className="hover:bg-muted/50 border-white/5">
                                                <TableCell className="font-mono text-xs text-muted-foreground">
                                                    {format(new Date(expense.date), "MMM d, yyyy")}
                                                </TableCell>
                                                <TableCell className="font-medium text-foreground">{expense.description}</TableCell>
                                                <TableCell>
                                                    <span className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-wider">
                                                        {expense.category}
                                                    </span>
                                                </TableCell>
                                                {activeTab === 'truck' && (
                                                    <TableCell className="text-muted-foreground">{expense.assetName || "Unassigned"}</TableCell>
                                                )}
                                                {activeTab === 'driver' && (
                                                    <TableCell className="text-muted-foreground">{expense.driverName || "Unassigned"}</TableCell>
                                                )}
                                                <TableCell className="text-right font-mono text-destructive font-bold">
                                                    -{formatCurrency(expense.amount)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2 text-muted-foreground">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 hover:text-primary transition-colors"
                                                            onClick={() => handleEdit(expense)}
                                                        >
                                                            <Edit2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 hover:text-destructive transition-colors"
                                                            onClick={() => {
                                                                if (window.confirm("Move this business overhead expense to the Recycle Bin?")) {
                                                                    deleteItem('expense', expense.id);
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 p-4 border-t border-white/5">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 glass"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <Button
                                            key={i + 1}
                                            variant={currentPage === i + 1 ? "default" : "outline"}
                                            size="icon"
                                            className={cn(
                                                "h-8 w-8 text-xs font-bold transition-all duration-300",
                                                currentPage === i + 1 ? "shadow-[0_0_10px_rgba(var(--primary),0.3)]" : "glass"
                                            )}
                                            onClick={() => setCurrentPage(i + 1)}
                                        >
                                            {i + 1}
                                        </Button>
                                    ))}
                                </div>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 glass"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </Card>
                </Tabs>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add {activeTab === 'truck' ? 'Truck' : activeTab === 'office' ? 'Office' : 'Driver'} Expense</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Amount</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-8"
                                        placeholder="0.00"
                                        type="number"
                                        value={newExpense.amount}
                                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-8"
                                        type="date"
                                        value={newExpense.date}
                                        onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                                value={newExpense.category}
                                onValueChange={(v) => setNewExpense({ ...newExpense, category: v as ExpenseCategory })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {expenseCategories.map(c => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {activeTab === 'truck' && (
                            <div className="space-y-2">
                                <Label>Select Asset</Label>
                                <Select
                                    value={newExpense.assetId}
                                    onValueChange={(v) => setNewExpense({ ...newExpense, assetId: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Which truck?" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {assets.map(a => (
                                            <SelectItem key={a.id} value={a.id}>{a.identifier} ({a.type})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {activeTab === 'driver' && (
                            <div className="space-y-2">
                                <Label>Select Driver</Label>
                                <Select
                                    value={newExpense.driverId}
                                    onValueChange={(v) => setNewExpense({ ...newExpense, driverId: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Which driver?" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {drivers.map(d => (
                                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                                placeholder="Details..."
                                value={newExpense.description}
                                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={
                            !newExpense.amount ||
                            (activeTab === 'truck' && !newExpense.assetId) ||
                            (activeTab === 'driver' && !newExpense.driverId)
                        }>Save Expense</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
