"use client";

import { useState, useMemo } from 'react';
import { DollarSign, Wrench, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from '@/components/page-header';
import type { Freight } from '@/lib/types';
import { useData } from "@/lib/data-context";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

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

  const totalRevenue = useMemo(() =>
    activeFreight.reduce((sum, item) => sum + item.revenue, 0),
    [activeFreight]
  );

  const totalExpenses = useMemo(() =>
    activeFreight.reduce((sum, item) => sum + item.totalExpenses, 0),
    [activeFreight]
  );

  const totalExpenseItems = useMemo(() =>
    activeFreight.reduce((sum, item) => sum + item.expenses.length, 0),
    [activeFreight]
  );

  const netProfit = totalRevenue - totalExpenses;

  const chartData = [
    { name: "Jan", revenue: 4500, expenses: 3200 },
    { name: "Feb", revenue: 5200, expenses: 3800 },
    { name: "Mar", revenue: 4800, expenses: 4100 },
    { name: "Apr", revenue: 6100, expenses: 4500 },
    { name: "May", revenue: totalRevenue, expenses: totalExpenses },
  ];

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
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Revenue</CardTitle>
            <div className="p-2 bg-primary/20 rounded-lg">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{formatCurrency(totalRevenue)}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-success text-xs font-medium">+8.5%</span>
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
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Net Profit</CardTitle>
            <div className="p-2 bg-success/20 rounded-lg">
              <Wallet className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold tracking-tight ${netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(netProfit)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-success text-xs font-medium">+15.2%</span>
              <p className="text-xs text-muted-foreground italic">Your bottom line</p>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 h-1 bg-success w-full shadow-[0_0_10px_rgba(var(--success),0.5)]" />
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
              {[
                { id: '1', date: 'May 12, 2024', desc: 'Freight #3053 - Dallas to Miami', amount: 4200.00, status: 'Completed', type: 'Income' },
                { id: '2', date: 'May 10, 2024', desc: 'Fuel Stop - Love\'s Dallas', amount: -450.25, status: 'Processed', type: 'Expense' },
                { id: '3', date: 'May 08, 2024', desc: 'Freight #3052 - Chicago to Dallas', amount: 3800.00, status: 'Completed', type: 'Income' },
              ].map((tx) => (
                <div key={tx.id} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${tx.type === 'Income' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                      {tx.type === 'Income' ? <DollarSign className="h-4 w-4" /> : <Wrench className="h-4 w-4" />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold group-hover:text-primary transition-colors">{tx.desc}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{tx.date}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-sm font-bold ${tx.type === 'Income' ? 'text-success' : ''}`}>
                      {tx.type === 'Income' ? '+' : ''}{formatCurrency(tx.amount)}
                    </span>
                    <span className="text-[10px] py-0.5 px-2 bg-muted rounded-full text-muted-foreground font-medium">{tx.status}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-6 text-xs text-muted-foreground hover:text-primary">
              View All Transactions
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
