"use client";

import { useState, useMemo } from "react";
import { PlusCircle, FileText, Trash2, Link as LinkIcon, Calendar, Truck, User, Search, Filter, PieChart, BarChart, Receipt, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/lib/data-context";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ExpenseCategory, StandaloneExpense, Freight } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";

import { DateRangePicker } from "@/components/ui/date-range-picker";
import { type DateRange } from "react-day-picker";
import { isWithinInterval, startOfDay, endOfDay } from "date-fns";

const expenseCategories: ExpenseCategory[] = ['Fuel', 'Tolls', 'Scale Ticket', 'Maintenance', 'Repairs', 'Other'];

export default function ExpensesPage() {
  const { freight, setFreight, expenses, setExpenses, drivers, assets, deleteItem } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSource, setEditingSource] = useState<'freight' | 'standalone' | null>(null);
  const [editComment, setEditComment] = useState("");

  const [newExpense, setNewExpense] = useState<{
    amount: string;
    description: string;
    category: ExpenseCategory;
    date: string;
    linkType: 'none' | 'freight' | 'driver' | 'asset';
    linkId: string;
  }>({
    amount: "",
    description: "",
    category: "Fuel",
    date: new Date().toISOString().split('T')[0],
    linkType: "none",
    linkId: "",
  });

  const formatCurrency = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

  // Combine both sources of expenses: Embedded (Freight) & Standalone
  const allExpenses = useMemo(() => {
    const combined: Array<{
      id: string;
      source: 'freight' | 'standalone';
      date: Date;
      category: string;
      description: string;
      amount: number;
      linkedTo: string;
      raw: any;
    }> = [];

    // 1. Add Freight Expenses
    freight.forEach(f => {
      if (f.isDeleted) return;
      if (f.expenses && Array.isArray(f.expenses)) {
        f.expenses.forEach(exp => {
          combined.push({
            id: exp.id,
            source: 'freight',
            date: exp.date ? new Date(exp.date) : new Date(f.date), // Use expense date or fallback to load date
            category: exp.category,
            description: exp.description,
            amount: exp.amount,
            linkedTo: `Load #${f.freightId}`,
            raw: { ...exp, freightId: f.id }
          });
        });
      }
    });

    // 2. Add Standalone Expenses
    expenses?.forEach(e => {
      if (e.isDeleted) return;
      let linkLabel = "Unlinked";
      if (e.driverName) linkLabel = `Driver: ${e.driverName}`;
      if (e.assetName) linkLabel = `Asset: ${e.assetName}`;

      combined.push({
        id: e.id,
        source: 'standalone',
        date: new Date(e.date),
        category: e.category,
        description: e.description,
        amount: e.amount,
        linkedTo: linkLabel,
        raw: e
      });
    });

    return combined.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [freight, expenses]);

  const filteredExpenses = useMemo(() => {
    return allExpenses.filter(e => {
      const matchesSearch =
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.linkedTo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === "all" || e.category === categoryFilter;

      let matchesDate = true;
      if (dateRange?.from) {
        const expenseDate = new Date(e.date);
        const start = startOfDay(dateRange.from);
        const end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
        matchesDate = isWithinInterval(expenseDate, { start, end });
      }

      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [allExpenses, searchTerm, categoryFilter, dateRange]);

  const handleSaveExpense = () => {
    const amount = parseFloat(newExpense.amount);
    if (!amount || !newExpense.description) return;

    if (newExpense.linkType === 'freight' && newExpense.linkId) {
      // Add to existing Freight
      setFreight(prev => prev.map(f => {
        if (f.id === newExpense.linkId) {
          // If editing, find and replace. If new, append.
          const existingExpIndex = editingId ? f.expenses.findIndex(e => e.id === editingId) : -1;

          let updatedExpenses = [...f.expenses];
          let commentsToAdd = [];

          if (existingExpIndex >= 0) {
            // Edit existing
            updatedExpenses[existingExpIndex] = {
              ...updatedExpenses[existingExpIndex],
              category: newExpense.category,
              description: newExpense.description,
              amount: amount,
              date: new Date(newExpense.date).toISOString()
            };
            // Add comment to Freight
            commentsToAdd.push({
              id: Math.random().toString(36).substr(2, 9),
              text: `Expense '${newExpense.description}' updated: ${editComment}`,
              author: "User",
              timestamp: new Date().toISOString(),
              type: 'manual' as const
            });
          } else {
            // Create new
            updatedExpenses.push({
              id: Math.random().toString(36).substr(2, 9),
              category: newExpense.category,
              description: newExpense.description,
              amount: amount,
              date: new Date(newExpense.date).toISOString()
            });
            // Add creation log
            commentsToAdd.push({
              id: Math.random().toString(36).substr(2, 9),
              text: `Expense '${newExpense.description}' ($${formatCurrency(amount)}) added.`,
              author: "System",
              timestamp: new Date().toISOString(),
              type: 'system' as const
            });
          }

          const newTotal = updatedExpenses.reduce((sum, e) => sum + e.amount, 0);

          return {
            ...f,
            expenses: updatedExpenses,
            comments: commentsToAdd.length > 0 ? [...commentsToAdd, ...(f.comments || [])] : f.comments,
            // Recalculate totals
            totalExpenses: newTotal,
            netProfit: f.ownerAmount - newTotal
          };
        }
        return f;
      }));
    } else {
      // Add or Update Standalone Expenses
      if (editingId) {
        setExpenses(prev => prev.map(e => {
          if (e.id === editingId) {
            return {
              ...e,
              category: newExpense.category,
              description: newExpense.description,
              amount: amount,
              date: new Date(newExpense.date).toISOString(),
              comments: [
                {
                  id: Math.random().toString(36).substr(2, 9),
                  text: `Updated: ${editComment}`,
                  author: "User",
                  timestamp: new Date().toISOString(),
                  type: 'manual' as const
                },
                ...(e.comments || [])
              ]
            };
          }
          return e;
        }));
      } else {
        const standalone: StandaloneExpense = {
          id: Math.random().toString(36).substr(2, 9),
          category: newExpense.category,
          description: newExpense.description,
          amount: amount,
          date: new Date(newExpense.date).toISOString(),
          comments: [
            {
              id: Math.random().toString(36).substr(2, 9),
              text: `Expense created.`,
              author: "System",
              timestamp: new Date().toISOString(),
              type: 'system' as const
            }
          ]
        };

        if (newExpense.linkType === 'driver') {
          const drv = drivers.find(d => d.id === newExpense.linkId);
          standalone.driverId = drv?.id;
          standalone.driverName = drv?.name;
        } else if (newExpense.linkType === 'asset') {
          const ast = assets.find(a => a.id === newExpense.linkId);
          standalone.assetId = ast?.id;
          standalone.assetName = ast?.identifier;
        }

        setExpenses(prev => [standalone, ...prev]);
      }
    }

    setIsDialogOpen(false);
    setNewExpense({
      amount: "",
      description: "",
      category: "Fuel",
      date: new Date().toISOString().split('T')[0],
      linkType: "none",
      linkId: "",
    });
  };

  const handleDelete = (id: string, source: 'freight' | 'standalone', raw: any) => {
    if (source === 'standalone') {
      deleteItem('expense', id);
    } else {
      // Modify the freight to remove the expense
      // raw.freightId contains the parent freight ID
      setFreight(prev => prev.map(f => {
        if (f.id === raw.freightId) {
          const newExpenses = f.expenses.filter(e => e.id !== id);
          const newTotalExpenses = newExpenses.reduce((sum, e) => sum + e.amount, 0);
          const newNetProfit = f.ownerAmount - newTotalExpenses;
          return {
            ...f,
            expenses: newExpenses,
            totalExpenses: newTotalExpenses,
            netProfit: newNetProfit
          };
        }
        return f;
      }));
    }
  };

  const handleEditClick = (expense: typeof allExpenses[0]) => {
    setEditingId(expense.id);
    setEditingSource(expense.source);
    setNewExpense({
      amount: expense.amount.toString(),
      description: expense.description,
      category: expense.category as ExpenseCategory,
      date: format(expense.date, "yyyy-MM-dd"),
      linkType: expense.source === 'freight' ? 'freight' : (expense.raw.driverId ? 'driver' : (expense.raw.assetId ? 'asset' : 'none')),
      linkId: expense.source === 'freight' ? expense.raw.freightId : (expense.raw.driverId || expense.raw.assetId || ''),
    });
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card className="glass-card relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(filteredExpenses.reduce((sum, e) => sum + e.amount, 0))}</div>
            <p className="text-xs text-muted-foreground mt-1">Across {filteredExpenses.length} entries</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 h-1 bg-destructive w-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
        </Card>

        {/* Load-Linked vs Overhead */}
        <Card className="glass-card relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Breakdown</CardTitle>
            <PieChart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Load-Linked</span>
                <span className="font-bold">{formatCurrency(filteredExpenses.filter(e => e.source === 'freight').reduce((sum, e) => sum + e.amount, 0))}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Overhead (Standalone)</span>
                <span className="font-bold">{formatCurrency(filteredExpenses.filter(e => e.source === 'standalone').reduce((sum, e) => sum + e.amount, 0))}</span>
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 h-1 bg-primary w-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
        </Card>

        {/* Top Category */}
        <Card className="glass-card relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Top Category</CardTitle>
            <BarChart className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            {(() => {
              const totals = filteredExpenses.reduce((acc, curr) => {
                acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
                return acc;
              }, {} as Record<string, number>);
              const topCat = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
              return topCat ? (
                <>
                  <div className="text-2xl font-bold text-orange-400">{topCat[0]}</div>
                  <p className="text-xs text-muted-foreground mt-1">{formatCurrency(topCat[1])} total spent</p>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">No data</div>
              );
            })()}
          </CardContent>
          <div className="absolute bottom-0 left-0 h-1 bg-orange-500 w-full shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
        </Card>
      </div>

      <PageHeader title="Load Expenses">
        <Button onClick={() => {
          setEditingId(null);
          setEditingSource(null);
          setNewExpense({
            amount: "",
            description: "",
            category: "Fuel",
            date: new Date().toISOString().split('T')[0],
            linkType: "none",
            linkId: "",
          });
          setIsDialogOpen(true);
        }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Log Expense
        </Button>
      </PageHeader>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-[240px]">
          <DateRangePicker date={dateRange} onDateChange={setDateRange} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <SelectValue placeholder="Category" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {expenseCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="glass-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Linked To</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No expenses found.
                </TableCell>
              </TableRow>
            ) : (
              filteredExpenses.map((exp) => (
                <TableRow key={exp.id} className="group hover:bg-white/5">
                  <TableCell className="font-mono text-xs">{format(exp.date, "MM/dd/yyyy")}</TableCell>
                  <TableCell className="font-medium">{exp.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] bg-white/5 hover:bg-white/10">{exp.category}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {exp.source === 'freight' ? <Truck className="h-3 w-3" /> : exp.linkedTo.includes('Driver') ? <User className="h-3 w-3" /> : exp.linkedTo !== 'Unlinked' ? <Truck className="h-3 w-3" /> : <LinkIcon className="h-3 w-3 opacity-50" />}
                      {exp.linkedTo}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-destructive">
                    -{formatCurrency(exp.amount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(exp)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(exp.id, exp.source, exp.raw)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setEditingId(null);
          setEditingSource(null);
          setEditComment(""); // Reset comment
        }
        setIsDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Expense' : 'Log New Expense'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update expense details. A reason is required for tracking.' : 'Record a new expense. Link it to a load to deduct from its profit.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    className="pl-7"
                    placeholder="0.00"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={newExpense.category} onValueChange={(v: ExpenseCategory) => setNewExpense({ ...newExpense, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="e.g. 50 Gallons at Love's"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              />
            </div>

            <div className="space-y-2 pt-2 border-t">
              <Label className="flex items-center gap-2"><LinkIcon className="h-3 w-3" /> Link To (Optional)</Label>
              <Select
                value={newExpense.linkType}
                onValueChange={(v: any) => setNewExpense({ ...newExpense, linkType: v, linkId: '' })}
                disabled={!!editingId} // Prevent re-linking on edit for simplicity (avoids complex migration logic)
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (General Expense)</SelectItem>
                  <SelectItem value="freight">Load / Freight</SelectItem>
                  <SelectItem value="asset">Truck / Asset</SelectItem>
                  <SelectItem value="driver">Driver</SelectItem>
                </SelectContent>
              </Select>
              {editingId && <p className="text-[10px] text-muted-foreground italic">Linking cannot be changed during edit.</p>}
            </div>

            {newExpense.linkType !== 'none' && (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                <Label>Select {newExpense.linkType === 'freight' ? 'Load' : newExpense.linkType === 'asset' ? 'Vehicle' : 'Driver'}</Label>
                <Select
                  value={newExpense.linkId}
                  onValueChange={(v) => setNewExpense({ ...newExpense, linkId: v })}
                  disabled={!!editingId} // Prevent re-linking
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Search..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {newExpense.linkType === 'freight' && freight.filter(f => !f.isDeleted).slice(0, 50).map(f => (
                      <SelectItem key={f.id} value={f.id}>#{f.freightId} - {f.origin} to {f.destination}</SelectItem>
                    ))}
                    {newExpense.linkType === 'asset' && assets.filter(a => !a.isDeleted).map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.identifier}</SelectItem>
                    ))}
                    {newExpense.linkType === 'driver' && drivers.filter(d => !d.isDeleted).map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* MANDATORY COMMENT FOR EDITS */}
            {editingId && (
              <div className="space-y-2 pt-2 border-t bg-muted/20 p-3 rounded-lg border-l-4 border-l-primary">
                <Label className="flex items-center gap-2 text-primary font-bold">Reason for Change <span className="text-destructive">*</span></Label>
                <Textarea
                  placeholder="Why are you editing this expense?"
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  className="bg-background/50"
                />
                <p className="text-[10px] text-muted-foreground">This note will be saved to the activity log.</p>
              </div>
            )}

          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveExpense} disabled={!!editingId && !editComment.trim()}>
              {editingId ? 'Update Expense' : 'Save Expense'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
