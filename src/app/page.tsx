"use client";

import { useState, useMemo } from 'react';
import { DollarSign, Wrench, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import type { Freight } from '@/lib/types';
import { useData } from "@/lib/data-context";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { format } from "date-fns";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--destructive))",
  },
};

export default function DashboardPage() {
  const { freight } = useData();

  const activeFreight = useMemo(() => freight.filter(item => !item.isDeleted), [freight]);

  const totalGrossRevenue = useMemo(() =>
    activeFreight.reduce((sum, item) => sum + item.revenue, 0),
    [activeFreight]
  );

  const totalOwnerRevenue = useMemo(() =>
    activeFreight.reduce((sum, item) => sum + (item.ownerAmount ?? item.revenue) + (item.fuelSurcharge || 0) + (item.loading || 0) + (item.unloading || 0) + (item.accessorials || 0), 0),
    [activeFreight]
  );

  const totalExpenses = useMemo(() =>
    activeFreight.reduce((sum, item) => sum + item.totalExpenses, 0),
    [activeFreight]
  );

  const netProfit = useMemo(() =>
    activeFreight.reduce((sum, item) => sum + (item.netProfit || 0), 0),
    [activeFreight]
  );

  const totalExpenseItems = useMemo(() =>
    activeFreight.reduce((sum, item) => sum + item.expenses.length, 0),
    [activeFreight]
  );

  const chartData = useMemo(() => {
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();

    // Generate the last 5 months relative to now
    const labels = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(format(d, 'MMM'));
    }

    return labels.map(month => {
      // Filter freight for this month (across any year for simplicity in this demo, or filter by year for precision)
      const monthFreight = activeFreight.filter(f => format(new Date(f.date), 'MMM') === month);

      const revenue = monthFreight.reduce((sum, item) =>
        sum + (item.ownerAmount ?? item.revenue) + (item.fuelSurcharge || 0) + (item.loading || 0) + (item.unloading || 0) + (item.accessorials || 0)
        , 0);

      const expenses = monthFreight.reduce((sum, item) => sum + item.totalExpenses, 0);

      return { name: month, revenue, expenses };
    });
  }, [activeFreight]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  }

  return (
    <>
      <PageHeader title="Welcome back, Alex" />
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
            <div className="text-3xl font-bold tracking-tight">{formatCurrency(totalOwnerRevenue)}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-success text-xs font-medium">Gross: {formatCurrency(totalGrossRevenue)}</span>
              <p className="text-xs text-muted-foreground italic truncate">from {activeFreight.length} loads</p>
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
            <CardTitle className="text-xl">Financial Overview</CardTitle>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full text-[10px] font-bold uppercase tracking-wider">
                <div className="w-2 h-2 rounded-full bg-primary" /> Revenue
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full text-[10px] font-bold uppercase tracking-wider">
                <div className="w-2 h-2 rounded-full bg-destructive" /> Expenses
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart accessibilityLayer data={chartData} margin={{ top: 20 }}>
                <XAxis
                  dataKey="name"
                  stroke="currentColor"
                  opacity={0.3}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="currentColor"
                  opacity={0.3}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: number) => `$${value / 1000}k`}
                />
                <ChartTooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  content={<ChartTooltipContent
                    formatter={(value) => formatCurrency(value as number)}
                    indicator="dot"
                  />}
                />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle className="text-xl">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {activeFreight.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-success/20 text-success">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold group-hover:text-primary transition-colors">Freight {item.freightId} - {item.origin} to {item.destination}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{format(item.date, 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-success">
                      +{formatCurrency(item.revenue)}
                    </span>
                    <span className="text-[10px] py-0.5 px-2 bg-muted rounded-full text-muted-foreground font-medium">Completed</span>
                  </div>
                </div>
              ))}
              {activeFreight.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No recent transactions.</p>
              )}
            </div>
            <Link href="/freight-ledger">
              <Button variant="ghost" className="w-full mt-6 text-xs text-muted-foreground hover:text-primary">
                View All Transactions
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
