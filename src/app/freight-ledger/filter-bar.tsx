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
import { X, Filter, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { type DateRange } from "react-day-picker";
import { startOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export type FiltersState = {
  freightId: string;
  route: string;
  textSearch: string;
  revenue: { min: string; max: string };
  expenses: { min: string; max: string };
  netProfit: { min: string; max: string };
  dateRange: DateRange | undefined;
  dateFilterType: "week" | "month" | "year" | "range";
};

type FilterBarProps = {
  onFilterChange: (filters: FiltersState) => void;
};

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const [freightId, setFreightId] = useState("");
  const [route, setRoute] = useState("");
  const [textSearch, setTextSearch] = useState("");
  const [revenue, setRevenue] = useState({ min: "", max: "" });
  const [expenses, setExpenses] = useState({ min: "", max: "" });
  const [netProfit, setNetProfit] = useState({ min: "", max: "" });
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [dateFilterType, setDateFilterType] = useState<"week" | "month" | "year" | "range">("month");

  useEffect(() => {
    onFilterChange({ freightId, route, textSearch, revenue, expenses, netProfit, dateRange, dateFilterType });
  }, [freightId, route, textSearch, revenue, expenses, netProfit, dateRange, dateFilterType, onFilterChange]);

  const clearFilters = () => {
    setFreightId("");
    setRoute("");
    setTextSearch("");
    setRevenue({ min: "", max: "" });
    setExpenses({ min: "", max: "" });
    setNetProfit({ min: "", max: "" });
    setDateRange(undefined);
    setDateFilterType("month");
  };

  return (
    <div className="space-y-4 mb-4">
      <div className="flex justify-end gap-4">
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
            <div className="ml-2 w-[220px]">
              <DateRangePicker date={dateRange} onDateChange={setDateRange} />
            </div>
          )}
        </div>
      </div>

      <Card>
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
                  <div>
                    <Label htmlFor="text-search">General Search</Label>
                    <div className="relative mt-2">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="text-search"
                        placeholder="Search all freight..."
                        className="pl-9"
                        value={textSearch}
                        onChange={(e) => setTextSearch(e.target.value)}
                      />
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
    </div >
  );
}
