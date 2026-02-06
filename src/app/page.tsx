"use client";

import { useState, useMemo } from 'react';
import { DollarSign, Wrench, Wallet, Trash2, MessageSquare, AlertTriangle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { PageHeader } from '@/components/page-header';
import type { Freight } from '@/lib/types';
import { useData } from "@/lib/data-context";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts";
import { format, subDays, subWeeks, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay, endOfDay, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, isWithinInterval } from "date-fns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { type DateRange } from "react-day-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--destructive))",
  },
  profit: {
    label: "Net Profit",
    color: "hsl(var(--success))",
  },
};

export default function DashboardPage() {
  const { freight } = useData();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'custom'>('week');
  const [customRange, setCustomRange] = useState<DateRange | undefined>(undefined);
  const [activityFilter, setActivityFilter] = useState<'week' | 'month' | 'year' | 'all'>('week');
  const [showInvalidLoads, setShowInvalidLoads] = useState(false);

  const activeFreight = useMemo(() => freight.filter(item => !item.isDeleted), [freight]);
  const validFreight = useMemo(() => activeFreight.filter(f => f.driverName && f.comments && f.comments.length > 0), [activeFreight]);

  const filteredFreight = useMemo(() => {
    let start: Date, end: Date;
    const now = new Date();

    if (timeRange === 'week') {
      start = startOfDay(subDays(now, 6));
      end = endOfDay(now);
    } else if (timeRange === 'month') {
      start = startOfMonth(now);
      end = endOfMonth(now);
    } else if (timeRange === 'year') {
      start = startOfMonth(subMonths(now, 5));
      end = endOfMonth(now);
    } else if (timeRange === 'custom' && customRange?.from && customRange?.to) {
      start = startOfDay(customRange.from);
      end = endOfDay(customRange.to);
    } else {
      return activeFreight; // No filter
    }

    return activeFreight.filter(f => {
      // Exclude invalid loads from calculation
      if (!f.driverName || !f.comments || f.comments.length === 0) return false;

      const d = new Date(f.date);
      return isWithinInterval(d, { start, end });
    });
  }, [activeFreight, timeRange, customRange]);

  /* --- Helper for Consistent Math --- */
  const calculateOwnerRevenue = (item: Freight) => {
    // ownerAmount now includes surcharges as per the updated data rules
    return item.ownerAmount ?? 0;
  };

  const totalGrossRevenue = useMemo(() =>
    filteredFreight.reduce((sum, item) => sum + item.revenue, 0),
    [filteredFreight]
  );

  const totalOwnerRevenue = useMemo(() =>
    filteredFreight.reduce((sum, item) => sum + calculateOwnerRevenue(item), 0),
    [filteredFreight]
  );

  const totalExpenses = useMemo(() =>
    filteredFreight.reduce((sum, item) => sum + item.totalExpenses, 0),
    [filteredFreight]
  );

  // We recalculate netProfit from the consistent revenue/expenses to ensure (Rev - Exp = Profit) is always visually true,
  // rather than relying on the item.netProfit field which might drift if data source logic changes.
  const netProfit = useMemo(() =>
    filteredFreight.reduce((sum, item) => sum + (calculateOwnerRevenue(item) - item.totalExpenses), 0),
    [filteredFreight]
  );

  const totalExpenseItems = useMemo(() =>
    filteredFreight.reduce((sum, item) => sum + item.expenses.length, 0),
    [filteredFreight]
  );

  const chartData = useMemo(() => {
    const labels: { label: string; range: [Date, Date]; fullDate: string }[] = [];
    const now = new Date();

    if (timeRange === 'week') {
      for (let i = 6; i >= 0; i--) {
        const d = subDays(now, i);
        labels.push({ label: format(d, 'EEE'), range: [startOfDay(d), endOfDay(d)], fullDate: format(d, 'MMMM do, yyyy') });
      }
    } else if (timeRange === 'month') {
      const start = startOfMonth(now);
      const end = endOfMonth(now);
      const weeks = eachWeekOfInterval({ start, end });
      weeks.forEach((w, i) => {
        const ws = startOfWeek(w);
        const we = endOfWeek(w);
        labels.push({ label: `W${i + 1}`, range: [ws, we], fullDate: `${format(ws, 'MMM d')} - ${format(we, 'MMM d, yyyy')}` });
      });
    } else if (timeRange === 'year') {
      for (let i = 5; i >= 0; i--) {
        const d = subMonths(now, i);
        labels.push({ label: format(d, 'MMM'), range: [startOfMonth(d), endOfMonth(d)], fullDate: format(d, 'MMMM yyyy') });
      }
    } else if (timeRange === 'custom' && customRange?.from && customRange?.to) {
      const days = eachDayOfInterval({ start: customRange.from, end: customRange.to });
      if (days.length <= 14) {
        days.forEach(d => labels.push({ label: format(d, 'MMM d'), range: [startOfDay(d), endOfDay(d)], fullDate: format(d, 'MMMM d, yyyy') }));
      } else if (days.length <= 60) {
        const weeks = eachWeekOfInterval({ start: customRange.from, end: customRange.to });
        weeks.forEach((w, i) => {
          const ws = startOfWeek(w);
          const we = endOfWeek(w);
          labels.push({ label: `W${i + 1}`, range: [ws, we], fullDate: `${format(ws, 'MMM d')} - ${format(we, 'MMM d, yyyy')}` });
        });
      } else {
        const months = eachMonthOfInterval({ start: customRange.from, end: customRange.to });
        months.forEach(m => labels.push({ label: format(m, 'MMM'), range: [startOfMonth(m), endOfMonth(m)], fullDate: format(m, 'MMMM yyyy') }));
      }
    }

    return labels.map(item => {
      const monthFreight = validFreight.filter(f => {
        const d = new Date(f.date);
        return d >= item.range[0] && d <= item.range[1];
      });

      const revenue = monthFreight.reduce((sum, f) => sum + calculateOwnerRevenue(f), 0);
      const expenses = monthFreight.reduce((sum, f) => sum + f.totalExpenses, 0);
      const profit = revenue - expenses;

      return { name: item.label, date: item.fullDate, revenue, expenses, profit };
    });
  }, [validFreight, timeRange, customRange]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  }

  const invalidLoads = useMemo(() => activeFreight.filter(f => !f.driverName || !f.comments || f.comments.length === 0), [activeFreight]);

  return (
    <>
      <PageHeader title="Welcome back, Alex">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {timeRange === 'custom' && (
            <DateRangePicker
              date={customRange}
              onDateChange={setCustomRange}
              className="w-[280px]"
            />
          )}
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)} className="w-[300px]">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
              <TabsTrigger value="custom">Range</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </PageHeader>

      {invalidLoads.length > 0 && (
        <div className="mb-6">
          <Alert variant="destructive" className="border-destructive/50 bg-destructive/10 cursor-pointer hover:bg-destructive/20 transition-colors" onClick={() => setShowInvalidLoads(true)}>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Action Required: {invalidLoads.length} Invalid Load{invalidLoads.length > 1 ? 's' : ''} Detected</AlertTitle>
            <AlertDescription className="text-xs opacity-90">
              Some loads are missing required information (Driver or Comments) and are excluded from financial stats. Click here to review and fix them.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* INVALID LOADS DIALOG */}
      <Dialog open={showInvalidLoads} onOpenChange={setShowInvalidLoads}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Invalid Loads ({invalidLoads.length})
            </DialogTitle>
            <DialogDescription>
              The following loads are incomplete. Click on any item to open it in the editor and fix the missing details.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 mt-4">
            {invalidLoads.map(load => (
              <Link href={`/freight-ledger?edit=${load.id}`} key={load.id} onClick={() => setShowInvalidLoads(false)}>
                <div className="p-4 rounded-lg bg-muted/50 border border-destructive/20 hover:bg-destructive/5 hover:border-destructive/50 transition-all cursor-pointer group mb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-sm flex items-center gap-2">
                        {load.freightId}
                        <Badge variant="outline" className="text-[10px] font-mono">{format(new Date(load.date), 'MM/dd/yyyy')}</Badge>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {load.origin} <ArrowRight className="inline h-3 w-3" /> {load.destination}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatCurrency(load.revenue)}</p>
                      <p className="text-[10px] text-destructive font-semibold">
                        {(!load.driverName) ? 'Missing Driver' : (!load.comments || load.comments.length === 0) ? 'Missing Comments' : 'Incomplete'}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="glass-card overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign className="h-24 w-24 text-primary" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Your Take-home</CardTitle>
            <div className="p-2 bg-primary/20 rounded-lg">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold tracking-tight ${totalOwnerRevenue >= 0 ? 'text-white' : 'text-destructive'}`}>{formatCurrency(totalOwnerRevenue)}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-success text-xs font-medium">Gross: {formatCurrency(totalGrossRevenue)}</span>
              <p className="text-xs text-muted-foreground italic truncate">from {filteredFreight.length} loads</p>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 h-1 bg-primary w-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
        </Card>

        <Card className="glass-card overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wrench className="h-24 w-24 text-destructive" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Expenses</CardTitle>
            <div className="p-2 bg-destructive/20 rounded-lg">
              <Wrench className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{formatCurrency(totalExpenses)}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-destructive text-xs font-medium">-2.1%</span>
              <p className="text-xs text-muted-foreground italic truncate">across {totalExpenseItems} items</p>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 h-1 bg-destructive w-full shadow-[0_0_10px_rgba(var(--destructive),0.5)]" />
        </Card>

        <Card className="glass-card overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="h-24 w-24 text-success" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Net Profit (After Split)</CardTitle>
            <div className="p-2 bg-success/20 rounded-lg">
              <Wallet className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold tracking-tight ${netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(netProfit)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-muted-foreground italic truncate">Total after all expenses</p>
            </div>
          </CardContent>
          <div className={`absolute bottom-0 left-0 h-1 w-full shadow-[0_0_10px_rgba(var(--success),0.5)] ${netProfit >= 0 ? 'bg-success' : 'bg-destructive'}`} />
        </Card>
      </div>

      <div className="grid gap-6">
        <Card className="glass-card border-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Financial Overview</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Trend analysis for the selected period.</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20">
                <div className="w-2 h-2 rounded-full bg-primary" /> Revenue
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-destructive/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-destructive border border-destructive/20">
                <div className="w-2 h-2 rounded-full bg-destructive" /> Expenses
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-success/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-success border border-success/20">
                <div className="w-2 h-2 rounded-full bg-success" /> Profit
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[400px] pt-4">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-expenses)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-expenses)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-profit)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-profit)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis
                  dataKey="name"
                  stroke="currentColor"
                  opacity={0.5}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="currentColor"
                  opacity={0.5}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: number) => `$${value}`}
                />
                <ChartTooltip
                  cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                  labelFormatter={(label, payload) => payload[0]?.payload?.date || label}
                  content={<ChartTooltipContent
                    indicator="dot"
                    labelFormatter={(label) => label}
                    formatter={(value, name) => {
                      // Map the internal dataKey (revenue/expenses/profit) to readable labels
                      let label = name;
                      if (name === 'revenue') label = 'Revenue';
                      if (name === 'expenses') label = 'Expenses';
                      if (name === 'profit') label = 'Net Profit';

                      return (
                        <div className="flex min-w-[130px] items-center text-xs text-muted-foreground">
                          {label}
                          <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                            {formatCurrency(value as number)}
                          </div>
                        </div>
                      )
                    }}
                  />}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  animationDuration={1500}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="var(--color-expenses)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorExpenses)"
                  animationDuration={1800}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="var(--color-profit)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                  animationDuration={2000}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card className="glass-card border-none">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-4">
            <CardTitle className="text-xl">Recent Activity</CardTitle>
            <div className="flex bg-white/5 rounded-lg p-1 gap-1 self-end sm:self-auto">
              {(['week', 'month', 'year', 'all'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setActivityFilter(range)}
                  className={cn(
                    "px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
                    activityFilter === range ? "bg-primary text-black shadow-sm" : "text-white/40 hover:text-white hover:bg-white/5"
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {(() => {
                const transactions: any[] = [];

                // 1. Add normal freight revenue
                activeFreight.forEach(item => {
                  transactions.push({
                    id: `rev-${item.id}`,
                    loadId: item.id,
                    type: 'revenue',
                    title: `Freight #${item.freightId} - ${item.origin} to ${item.destination}`,
                    date: new Date(item.date),
                    amount: item.revenue,
                    status: 'Completed',
                    link: '/freight-ledger',
                    icon: <DollarSign className="h-4 w-4" />,
                    color: 'success'
                  });

                  // 2. Add individual expenses from each load
                  item.expenses.forEach(exp => {
                    transactions.push({
                      id: `exp-${exp.id}`,
                      loadId: item.id,
                      type: 'expense',
                      title: `${exp.category}: ${exp.description} (Load #${item.freightId})`,
                      date: new Date(item.date),
                      amount: -exp.amount,
                      status: 'Paid',
                      link: '/freight-ledger',
                      icon: <Wrench className="h-4 w-4" />,
                      color: 'destructive'
                    });
                  });
                });

                // 3. Add deletions
                freight.filter(f => f.isDeleted).forEach(item => {
                  transactions.push({
                    id: `del-${item.id}`,
                    type: 'deletion',
                    title: `DELETED: Load #${item.freightId}`,
                    date: item.deletedAt ? new Date(item.deletedAt) : new Date(),
                    amount: 0,
                    status: 'Removed',
                    link: '/recycle-bin',
                    icon: <Trash2 className="h-4 w-4" />,
                    color: 'muted'
                  });
                });

                // 4. Add comments & updates
                activeFreight.forEach(item => {
                  if (item.comments) {
                    item.comments.forEach(comment => {
                      transactions.push({
                        id: `com-${comment.id}`,
                        loadId: item.id,
                        type: 'update',
                        title: `${comment.type === 'system' ? 'System' : 'Note'}: ${comment.text}`,
                        date: new Date(comment.timestamp),
                        amount: 0,
                        status: comment.author,
                        link: '/freight-ledger',
                        icon: <MessageSquare className="h-4 w-4" />,
                        color: 'info'
                      });
                    });
                  }
                });

                // Filter by date based on activityFilter
                let cutoff = new Date(0); // Epoch default (all)
                const now = new Date();
                if (activityFilter === 'week') cutoff = subDays(now, 7);
                if (activityFilter === 'month') cutoff = subDays(now, 30);
                if (activityFilter === 'year') cutoff = subDays(now, 365);

                const filtered = transactions.filter(t => t.date >= cutoff);

                // Sort by date descending and take top 500
                const recent = filtered
                  .sort((a, b) => b.date.getTime() - a.date.getTime())
                  .slice(0, 500);

                if (recent.length === 0) {
                  return <div className="flex flex-col items-center justify-center py-8 text-muted-foreground opacity-50 space-y-2">
                    <p className="text-sm">No activity found in this range.</p>
                  </div>;
                }

                return (
                  <div className="max-h-[500px] overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {recent.map((item) => (
                      <Link href={`${item.link}${item.loadId ? `?edit=${item.loadId}` : ''}`} key={item.id}>
                        <div className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-all active:scale-[0.98]">
                          {/* Items Content */}
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "p-2 rounded-full",
                              item.color === 'success' ? "bg-success/20 text-success" :
                                item.color === 'destructive' ? "bg-destructive/20 text-destructive" :
                                  item.color === 'info' ? "bg-blue-500/20 text-blue-400" :
                                    "bg-white/10 text-white/40"
                            )}>
                              {item.icon}
                            </div>
                            <div className="flex flex-col max-w-[200px] sm:max-w-[300px]">
                              <span className="text-sm font-bold group-hover:text-primary transition-colors truncate" title={item.title}>{item.title}</span>
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{format(item.date, 'MMM dd, yyyy • HH:mm')}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className={cn(
                              "text-sm font-bold",
                              item.amount > 0 ? "text-success" :
                                item.amount < 0 ? "text-destructive" : "text-white/20"
                            )}>
                              {item.amount !== 0 ? (item.amount > 0 ? '+' : '') + formatCurrency(item.amount) : '---'}
                            </span>
                            <span className="text-[10px] py-0.5 px-2 bg-white/5 rounded-full text-white/40 font-medium">{item.status}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                );
              })()}
            </div>
            <Link href="/freight-ledger">
              <Button variant="ghost" className="w-full mt-6 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-primary hover:bg-white/5">
                View All Activity
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
