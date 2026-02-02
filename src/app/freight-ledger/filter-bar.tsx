"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { X, Filter } from "lucide-react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { type DateRange } from "react-day-picker";
import { startOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export type FiltersState = {
  freightId: string;
  route: string;
  revenue: { min: string; max: string };
  expenses: { min: string; max: string };
  netProfit: { min: string; max: string };
  dateRange: DateRange | undefined;
};

type FilterBarProps = {
  onFilterChange: (filters: FiltersState) => void;
};

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const [freightId, setFreightId] = useState("");
  const [route, setRoute] = useState("");
  const [revenue, setRevenue] = useState({ min: "", max: "" });
  const [expenses, setExpenses] = useState({ min: "", max: "" });
  const [netProfit, setNetProfit] = useState({ min: "", max: "" });
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  useEffect(() => {
    onFilterChange({ freightId, route, revenue, expenses, netProfit, dateRange });
  }, [freightId, route, revenue, expenses, netProfit, dateRange, onFilterChange]);

  const clearFilters = () => {
    setFreightId("");
    setRoute("");
    setRevenue({ min: "", max: "" });
    setExpenses({ min: "", max: "" });
    setNetProfit({ min: "", max: "" });
    setDateRange(undefined);
  };

  const setPresetDateRange = (preset: 'today' | 'this-week' | 'this-month' | 'this-year') => {
    const now = new Date();
    switch (preset) {
      case 'today':
        setDateRange({ from: startOfDay(now), to: startOfDay(now) });
        break;
      case 'this-week':
        setDateRange({ from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) });
        break;
      case 'this-month':
        setDateRange({ from: startOfMonth(now), to: endOfMonth(now) });
        break;
      case 'this-year':
        setDateRange({ from: startOfYear(now), to: endOfYear(now) });
        break;
    }
  }

  return (
    <Card className="mb-4">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="filters">
          <AccordionTrigger className="p-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-4 pt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                <div>
                  <Label htmlFor="freight-id-search">Freight ID</Label>
                  <Input
                    id="freight-id-search"
                    placeholder="Search Freight ID..."
                    value={freightId}
                    onChange={(e) => setFreightId(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="route-search">Route</Label>
                  <Input
                    id="route-search"
                    placeholder="Search Origin/Destination..."
                    value={route}
                    onChange={(e) => setRoute(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <DateRangePicker date={dateRange} onDateChange={setDateRange} />
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => setPresetDateRange('today')}>Today</Button>
                    <Button variant="outline" size="sm" onClick={() => setPresetDateRange('this-week')}>This Week</Button>
                    <Button variant="outline" size="sm" onClick={() => setPresetDateRange('this-month')}>This Month</Button>
                    <Button variant="outline" size="sm" onClick={() => setPresetDateRange('this-year')}>This Year</Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
                <div>
                  <Label>Revenue</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input type="number" placeholder="Min" value={revenue.min} onChange={e => setRevenue(p => ({ ...p, min: e.target.value }))} />
                    <Input type="number" placeholder="Max" value={revenue.max} onChange={e => setRevenue(p => ({ ...p, max: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label>Expenses</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input type="number" placeholder="Min" value={expenses.min} onChange={e => setExpenses(p => ({ ...p, min: e.target.value }))} />
                    <Input type="number" placeholder="Max" value={expenses.max} onChange={e => setExpenses(p => ({ ...p, max: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label>Net Profit</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input type="number" placeholder="Min" value={netProfit.min} onChange={e => setNetProfit(p => ({ ...p, min: e.target.value }))} />
                    <Input type="number" placeholder="Max" value={netProfit.max} onChange={e => setNetProfit(p => ({ ...p, max: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button variant="ghost" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Clear All Filters
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
