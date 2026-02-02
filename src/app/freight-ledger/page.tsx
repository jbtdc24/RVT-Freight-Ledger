
"use client";

import { useState, Fragment, useMemo } from "react";
import { PlusCircle, ChevronDown, Pencil, Wallet, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { useData } from "@/lib/data-context";
import type { Freight, Driver } from "@/lib/types";
import { FreightForm } from "./freight-form";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { FilterBar, type FiltersState } from "./filter-bar";
import { isBefore, isAfter, startOfDay, endOfDay, format } from 'date-fns';

export default function FreightLedgerPage() {
  const { freight, setFreight, drivers } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFreight, setEditingFreight] = useState<Freight | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [filters, setFilters] = useState<FiltersState>({
    freightId: '',
    route: '',
    revenue: { min: '', max: '' },
    expenses: { min: '', max: '' },
    netProfit: { min: '', max: '' },
    dateRange: undefined,
  });

  const handleDeleteFreight = (id: string) => {
    setFreight(prev => prev.map(f =>
      f.id === id ? { ...f, isDeleted: true, deletedAt: new Date().toISOString() } : f
    ));
    setIsDialogOpen(false);
    setEditingFreight(null);
  };

  const handleSaveFreight = (freightData: Omit<Freight, 'id'> & { id?: string }) => {
    if (freightData.id) {
      setFreight(prev => prev.map(f => f.id === freightData.id ? ({ ...f, ...freightData } as Freight) : f));
    } else {
      const newFreight = { ...freightData, id: `frt-${Date.now()}` };
      setFreight(prev => [newFreight, ...prev]);
    }
    setIsDialogOpen(false);
    setEditingFreight(null);
  };

  const handleOpenDialog = (freightItem: Freight | null) => {
    setEditingFreight(freightItem);
    setIsDialogOpen(true);
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

  const handleRowClick = (id: string) => {
    setExpandedRow(prev => prev === id ? null : id);
  }

  const filteredFreight = useMemo(() => {
    return freight.filter(item => {
      if (item.isDeleted) return false;

      const { freightId, route, revenue, expenses, netProfit, dateRange } = filters;

      if (freightId && !item.freightId.toLowerCase().includes(freightId.toLowerCase())) {
        return false;
      }

      if (route) {
        const routeStr = `${item.origin} ${item.destination}`.toLowerCase();
        if (!routeStr.includes(route.toLowerCase())) {
          return false;
        }
      }

      if (dateRange?.from) {
        const itemDate = new Date(item.date);
        if (isBefore(itemDate, startOfDay(dateRange.from))) {
          return false;
        }
      }
      if (dateRange?.to) {
        const itemDate = new Date(item.date);
        if (isAfter(itemDate, endOfDay(dateRange.to))) {
          return false;
        }
      }

      const revenueMin = parseFloat(revenue.min);
      const revenueMax = parseFloat(revenue.max);
      if (!isNaN(revenueMin) && item.revenue < revenueMin) {
        return false;
      }
      if (!isNaN(revenueMax) && item.revenue > revenueMax) {
        return false;
      }

      const expensesMin = parseFloat(expenses.min);
      const expensesMax = parseFloat(expenses.max);
      if (!isNaN(expensesMin) && item.totalExpenses < expensesMin) {
        return false;
      }
      if (!isNaN(expensesMax) && item.totalExpenses > expensesMax) {
        return false;
      }

      const netProfitMin = parseFloat(netProfit.min);
      const netProfitMax = parseFloat(netProfit.max);
      if (!isNaN(netProfitMin) && item.netProfit < netProfitMin) {
        return false;
      }
      if (!isNaN(netProfitMax) && item.netProfit > netProfitMax) {
        return false;
      }

      return true;
    });
  }, [freight, filters]);

  return (
    <>
      <PageHeader title="Freight Ledger">
        <Button onClick={() => handleOpenDialog(null)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Manual Entry
        </Button>
      </PageHeader>

      <FilterBar onFilterChange={setFilters} />

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setEditingFreight(null);
        }
        setIsDialogOpen(open);
      }}>
        <DialogContent className="max-w-[90vw] md:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingFreight ? 'Edit Load' : 'Add New Load'}</DialogTitle>
            <DialogDescription>
              {editingFreight ? 'Edit the details for this load.' : 'Enter the details for the completed load.'}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[80vh] overflow-y-auto p-1">
            <FreightForm onSubmit={handleSaveFreight} onDelete={handleDeleteFreight} initialData={editingFreight} drivers={drivers} />
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <Table>
          <TableCaption>
            {
              freight.filter(f => !f.isDeleted).length === 0 ? "No freight entries yet."
                : filteredFreight.length === 0 ? "No freight entries match the current filters."
                  : `Displaying ${filteredFreight.length} of ${freight.filter(f => !f.isDeleted).length} loads.`
            }
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead>Freight ID</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Route</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Expenses</TableHead>
              <TableHead className="text-right">Net Profit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFreight.map((item) => (
              <Fragment key={item.id}>
                <TableRow onClick={() => handleRowClick(item.id)} className="cursor-pointer">
                  <TableCell>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", expandedRow === item.id && "rotate-180")} />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{format(item.date, 'MM/dd/yyyy')}</TableCell>
                  <TableCell className="font-medium">{item.freightId}</TableCell>
                  <TableCell>{item.driverName}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    {item.origin} <ArrowRight className="h-4 w-4 text-muted-foreground" /> {item.destination}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                  <TableCell className="text-right text-destructive">{formatCurrency(item.totalExpenses)}</TableCell>
                  <TableCell className={cn("text-right font-medium", item.netProfit >= 0 ? 'text-success' : 'text-destructive')}>
                    {formatCurrency(item.netProfit)}
                  </TableCell>
                </TableRow>
                {expandedRow === item.id && (
                  <TableRow>
                    <TableCell colSpan={8} className="p-0">
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/50">
                        <div>
                          <h3 className="text-lg font-headline mb-4">Financials</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div><p className="text-sm text-muted-foreground">Line Haul</p><p>{formatCurrency(item.lineHaul)}</p></div>
                            <div><p className="text-sm text-muted-foreground">Fuel Surcharge</p><p>{formatCurrency(item.fuelSurcharge)}</p></div>
                            <div><p className="text-sm text-muted-foreground">Loading</p><p>{formatCurrency(item.loading)}</p></div>
                            <div><p className="text-sm text-muted-foreground">Unloading</p><p>{formatCurrency(item.unloading)}</p></div>
                            <div><p className="text-sm text-muted-foreground">Accessorials</p><p>{formatCurrency(item.accessorials)}</p></div>
                            <div className="col-span-2 border-t pt-4 mt-2">
                              <div className="flex justify-between items-center font-bold">
                                <span>Total Revenue:</span>
                                <span>{formatCurrency(item.revenue)}</span>
                              </div>
                              <div className="flex justify-between items-center font-bold text-destructive">
                                <span>Total Expenses:</span>
                                <span>({formatCurrency(item.totalExpenses)})</span>
                              </div>
                              <div className={cn("flex justify-between items-center font-bold border-t mt-2 pt-2", item.netProfit >= 0 ? 'text-success' : 'text-destructive')}>
                                <span>Net Profit:</span>
                                <span>{formatCurrency(item.netProfit)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-headline mb-4 flex justify-between items-center">
                            <span>Expenses</span>
                            <Badge variant="destructive">{item.expenses.length} items</Badge>
                          </h3>
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {item.expenses.length > 0 ? item.expenses.map(exp => (
                              <div key={exp.id} className="flex justify-between items-center bg-background p-2 rounded-md">
                                <div>
                                  <p className="font-medium">{exp.description}</p>
                                  <p className="text-xs text-muted-foreground">{exp.category}</p>
                                </div>
                                <p className="font-semibold text-destructive">{formatCurrency(exp.amount)}</p>
                              </div>
                            )) : <p className="text-sm text-muted-foreground">No expenses logged for this load.</p>}
                          </div>
                        </div>
                        <div className="col-span-1 md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 border-t pt-6 mt-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Driver</p>
                            <p className="font-semibold">{item.driverName || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Distance</p>
                            <p className="font-semibold">{item.distance.toLocaleString()} mi</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Weight</p>
                            <p className="font-semibold">{item.weight.toLocaleString()} lbs</p>
                          </div>
                          <div className="md:col-start-4 flex justify-end items-center">
                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenDialog(item); }}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Load
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
