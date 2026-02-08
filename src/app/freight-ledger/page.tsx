

"use client";

import { useState, Fragment, useMemo, useEffect, useRef } from "react";
import { PlusCircle, Pencil, Wallet, ArrowRight, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MessageSquare, PenTool, X, MapPin } from "lucide-react";
import { useSearchParams } from "next/navigation";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Card } from "@/components/ui/card";
import { useData } from "@/lib/data-context";
import type { Freight, Driver } from "@/lib/types";
import { FreightForm } from "./freight-form";
import { StatusDialog } from "@/components/status-dialog";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { FilterBar, type FiltersState } from "./filter-bar";
import { isBefore, isAfter, startOfDay, endOfDay, format } from 'date-fns';

const ITEMS_PER_PAGE = 12;

export default function FreightLedgerPage() {
  const { freight, setFreight, drivers, assets, deleteItem } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFreight, setEditingFreight] = useState<Freight | null>(null);

  // New state for viewing freight details (View Mode)
  const [viewingFreight, setViewingFreight] = useState<Freight | null>(null);
  const [statusFreight, setStatusFreight] = useState<Freight | null>(null);
  const formRef = useRef<{ isDirty: () => boolean, submit: () => void } | null>(null);
  const [showDiscardAlert, setShowDiscardAlert] = useState(false);


  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FiltersState>({
    freightId: '',
    route: '',
    textSearch: '',
    revenue: { min: '', max: '' },
    expenses: { min: '', max: '' },
    netProfit: { min: '', max: '' },
    dateRange: undefined,
  });

  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  useEffect(() => {
    if (editId) {
      const itemToEdit = freight.find(f => f.id === editId);
      if (itemToEdit) {
        // Only open if we aren't already editing it (prevents loop if logic matches)
        // Actually, setEditingFreight is idempotent, but we need to ensure we don't clear it immediately.
        handleOpenDialog(itemToEdit);
      }
    }
  }, [editId, freight]);

  const clearEditParam = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('edit');
    window.history.replaceState(null, '', `?${params.toString()}`);
  }

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleOpenDialog = (freight?: Freight) => {
    setEditingFreight(freight || null);
    setIsDialogOpen(true);
  };

  const handleSaveFreight = (values: Omit<Freight, "id"> & { id?: string }) => {
    if (values.id) {
      setFreight(prev => prev.map(f => f.id === values.id ? { ...f, ...values } : f));
    } else {
      const newFreight: Freight = {
        ...values,
        id: Math.random().toString(36).substr(2, 9),
      } as Freight;
      setFreight(prev => [newFreight, ...prev]);
    }
    setIsDialogOpen(false);
    setEditingFreight(null);
    clearEditParam();
  };

  const handleDeleteFreight = (id: string) => {
    deleteItem('freight', id);
    setIsDialogOpen(false);
    setEditingFreight(null);
  };

  const handleUpdateStatus = (id: string, newStatus: Freight['status'], comment: string) => {
    setFreight(prev => prev.map(f => {
      if (f.id === id) {
        // Create change comment
        const statusComment = {
          id: Math.random().toString(36).substr(2, 9),
          text: `Status changed: ${f.status} -> ${newStatus}`,
          author: "System",
          timestamp: new Date().toISOString(),
          type: 'system' as const
        };

        // Create user note comment
        const userComment = {
          id: Math.random().toString(36).substr(2, 9),
          text: comment,
          author: "User",
          timestamp: new Date().toISOString(),
          type: 'manual' as const
        };

        const currentComments = f.comments || [];

        return {
          ...f,
          status: newStatus,
          comments: [userComment, statusComment, ...currentComments]
        };
      }
      return f;
    }));
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

  const handleRowClick = (item: Freight) => {
    const isInvalid = !item.driverName || !item.comments || item.comments.length === 0;
    if (isInvalid) {
      // Direct user to fix the issue
      handleOpenDialog(item);
    } else {
      setViewingFreight(item);
    }
  }

  const filteredFreight = useMemo(() => {
    return freight.filter(item => {
      if (item.isDeleted) return false;

      const { freightId, route, textSearch, revenue, expenses, netProfit, dateRange } = filters;

      if (freightId && !item.freightId.toLowerCase().includes(freightId.toLowerCase())) {
        return false;
      }

      if (route) {
        const routeStr = `${item.origin} ${item.destination}`.toLowerCase();
        if (!routeStr.includes(route.toLowerCase())) {
          return false;
        }
      }

      if (textSearch) {
        const searchStr = textSearch.toLowerCase();
        const matches =
          (item.driverName && item.driverName.toLowerCase().includes(searchStr)) ||
          (item.agencyName && item.agencyName.toLowerCase().includes(searchStr)) ||
          (item.contactName && item.contactName.toLowerCase().includes(searchStr)) ||
          (item.commodity && item.commodity.toLowerCase().includes(searchStr)) ||
          (item.assetName && item.assetName.toLowerCase().includes(searchStr)) ||
          (item.freightBillNumber && item.freightBillNumber.toLowerCase().includes(searchStr));

        if (!matches) return false;
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
    }).sort((a, b) => {
      // Logic for "Invalid" loads: Missing Driver OR Missing Comments
      const isInvalidA = !a.driverName || !a.comments || a.comments.length === 0;
      const isInvalidB = !b.driverName || !b.comments || b.comments.length === 0;

      // Prioritize invalid loads
      if (isInvalidA && !isInvalidB) return -1;
      if (!isInvalidA && isInvalidB) return 1;

      // Secondary sort: Date descending (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [freight, filters]);

  const totalPages = Math.ceil(filteredFreight.length / ITEMS_PER_PAGE);
  const paginatedFreight = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredFreight.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredFreight, currentPage]);

  return (
    <>
      <PageHeader title="Freight Ledger">
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Manual Entry
        </Button>
      </PageHeader>

      <FilterBar onFilterChange={setFilters} />

      {/* EDIT / CREATE DIALOG */}
      {/* EDIT / CREATE DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          // Attempting to close
          if (formRef.current && formRef.current.isDirty()) {
            setShowDiscardAlert(true);
          } else {
            setIsDialogOpen(false);
            setEditingFreight(null);
            clearEditParam();
          }
        } else {
          setIsDialogOpen(true);
        }
      }}>
        <DialogContent
          // Hide default Radix close button so we can control it completely
          className="max-w-[95vw] md:max-w-5xl lg:max-w-6xl [&>button.absolute]:hidden"
          onInteractOutside={(e) => {
            if (formRef.current && formRef.current.isDirty()) {
              e.preventDefault();
              setShowDiscardAlert(true);
            }
          }}
          onEscapeKeyDown={(e) => {
            if (formRef.current && formRef.current.isDirty()) {
              e.preventDefault();
              setShowDiscardAlert(true);
            }
          }}
        >
          {/* Custom Close Button */}
          <button
            onClick={() => {
              // Check dirty state
              if (formRef.current && formRef.current.isDirty()) {
                setShowDiscardAlert(true);
              } else {
                setIsDialogOpen(false);
                setEditingFreight(null);
                clearEditParam();
              }
            }}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>

          <DialogHeader>
            <DialogTitle>{editingFreight ? 'Edit Load' : 'Add New Load'}</DialogTitle>
            <DialogDescription>
              {editingFreight ? 'Edit the details for this load.' : 'Enter the details for the completed load.'}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[80vh] overflow-y-auto p-1">
            <FreightForm
              ref={formRef}
              onSubmit={handleSaveFreight}
              onDelete={handleDeleteFreight}
              initialData={editingFreight}
              drivers={drivers}
              assets={assets}
            />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDiscardAlert} onOpenChange={setShowDiscardAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Do you want to save them before closing?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => {
              // Prevent default behavior to ensure we handle the close order manually if needed
              // But generally clean state updates are fine.
              // The issue "freeze" often happens if the Dialog closes while an overlay is active.
              e.stopPropagation();
              setShowDiscardAlert(false);

              // Allow a tiny tick for the Alert to close before nuking the parent dialog
              setTimeout(() => {
                setIsDialogOpen(false);
                setEditingFreight(null);
                clearEditParam();
              }, 50);
            }}>Discard Changes</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => {
              e.stopPropagation();
              setShowDiscardAlert(false);
              if (formRef.current) {
                // Submit initiates Save, which will eventually close the dialog via handleSaveFreight
                formRef.current.submit();
              }
            }}>Save Changes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <StatusDialog
        isOpen={!!statusFreight}
        onClose={() => setStatusFreight(null)}
        freight={statusFreight}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* VIEW DETAILS DIALOG */}
      <Dialog open={!!viewingFreight} onOpenChange={(open) => !open && setViewingFreight(null)}>
        <DialogContent className="max-w-[98vw] md:max-w-7xl lg:max-w-[95vw] overflow-hidden flex flex-col max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center justify-between pr-8">
              <DialogTitle className="text-xl flex items-center gap-2">
                Load #{viewingFreight?.freightId}
                <Badge variant="outline" className="font-mono">{viewingFreight && format(new Date(viewingFreight.date), 'MM/dd/yyyy')}</Badge>
                {viewingFreight?.postingCode && <Badge variant="secondary">{viewingFreight.postingCode}</Badge>}
                <Badge variant={viewingFreight?.status === 'Delivered' ? 'default' : viewingFreight?.status === 'Cancelled' ? 'destructive' : 'outline'}>{viewingFreight?.status}</Badge>
              </DialogTitle>
            </div>
            <DialogDescription>
              {viewingFreight?.origin} <ArrowRight className="inline h-3 w-3" /> {viewingFreight?.destination}
            </DialogDescription>
          </DialogHeader>

          {viewingFreight && (
            <div className="flex-1 overflow-y-auto pr-2">
              {/* PRIMARY INFO GRID */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 p-1 mb-6">

                {/* COL 1: ROUTE & CARGO */}
                <div className="space-y-6">
                  {/* Route Details */}
                  <div className="bg-muted/30 p-4 rounded-xl border space-y-4">
                    <h3 className="font-headline text-lg flex items-center gap-2"><MapPin className="h-4 w-4" /> Route Details</h3>

                    {/* PICKUP */}
                    <div className="pl-3 border-l-2 border-primary/50 relative">
                      <div className="absolute -left-[5px] top-0 h-2 w-2 rounded-full bg-primary" />
                      <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Pickup (Stop 1)</p>
                      <p className="font-semibold">{viewingFreight.pickup?.companyName || viewingFreight.origin}</p>
                      {viewingFreight.pickup?.address && <p className="text-sm text-muted-foreground">{viewingFreight.pickup.address}, {viewingFreight.pickup.cityStateZip}</p>}
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        {viewingFreight.pickup?.appointmentTime && <span><span className="font-semibold text-foreground">Time:</span> {viewingFreight.pickup.appointmentTime}</span>}
                        {viewingFreight.pickup?.appointmentNumber && <span><span className="font-semibold text-foreground">Appt #:</span> {viewingFreight.pickup.appointmentNumber}</span>}
                      </div>
                      {viewingFreight.pickup?.notes && <p className="text-xs italic mt-1 text-muted-foreground">"{viewingFreight.pickup.notes}"</p>}
                    </div>

                    {/* DROP */}
                    <div className="pl-3 border-l-2 border-orange-500/50 relative">
                      <div className="absolute -left-[5px] top-0 h-2 w-2 rounded-full bg-orange-500" />
                      <p className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">Drop (Stop 2)</p>
                      <p className="font-semibold">{viewingFreight.drop?.companyName || viewingFreight.destination}</p>
                      {viewingFreight.drop?.address && <p className="text-sm text-muted-foreground">{viewingFreight.drop.address}, {viewingFreight.drop.cityStateZip}</p>}
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        {viewingFreight.drop?.appointmentTime && <span><span className="font-semibold text-foreground">Time:</span> {viewingFreight.drop.appointmentTime}</span>}
                        {viewingFreight.drop?.appointmentNumber && <span><span className="font-semibold text-foreground">Appt #:</span> {viewingFreight.drop.appointmentNumber}</span>}
                      </div>
                      {viewingFreight.drop?.notes && <p className="text-xs italic mt-1 text-muted-foreground">"{viewingFreight.drop.notes}"</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t text-sm">
                      <div><p className="text-muted-foreground text-xs">Distance</p><p className="font-medium">{viewingFreight.distance.toLocaleString()} mi</p></div>
                      <div><p className="text-muted-foreground text-xs">Weight</p><p className="font-medium">{viewingFreight.weight.toLocaleString()} lbs</p></div>
                      {viewingFreight.driverName && <div><p className="text-muted-foreground text-xs">Driver</p><p className="font-medium">{viewingFreight.driverName}</p></div>}
                      {viewingFreight.assetName && <div><p className="text-muted-foreground text-xs">Truck</p><p className="font-medium">{viewingFreight.assetName}</p></div>}
                    </div>
                  </div>

                  {/* Cargo & Equip */}
                  <div className="bg-muted/30 p-4 rounded-xl border space-y-3 text-sm">
                    <h3 className="font-headline text-lg flex items-center gap-2"><Wallet className="h-4 w-4" /> Cargo & Eqpt</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground">Commodity</p>
                        <p className="font-medium">{viewingFreight.commodity || 'N/A'}</p>
                      </div>
                      <div><p className="text-xs text-muted-foreground">Trailer #</p><p className="font-medium">{viewingFreight.trailerNumber || 'N/A'}</p></div>
                      <div><p className="text-xs text-muted-foreground">Type</p><p className="font-medium">{viewingFreight.equipmentType || 'N/A'}</p></div>
                      <div><p className="text-xs text-muted-foreground">Pieces</p><p className="font-medium">{viewingFreight.pieces || '-'}</p></div>
                      <div><p className="text-xs text-muted-foreground">Dims</p><p className="font-medium">{viewingFreight.dimensions || '-'}</p></div>
                      <div><p className="text-xs text-muted-foreground">NMFC</p><p className="font-medium">{viewingFreight.nmfcCode || '-'}</p></div>
                      <div><p className="text-xs text-muted-foreground">Class</p><p className="font-medium">{viewingFreight.freightClass || '-'}</p></div>
                      {viewingFreight.temperatureControl && <div className="col-span-2"><p className="text-xs text-muted-foreground">Temp Control</p><p className="font-medium">{viewingFreight.temperatureControl}</p></div>}
                      {viewingFreight.hazardousMaterial && <div className="col-span-2 text-destructive font-bold flex items-center gap-2">⚠️ HAZARDOUS MATERIAL</div>}
                    </div>
                  </div>
                </div>

                {/* COL 2: FINANCIALS & ID */}
                <div className="space-y-6">
                  {/* Financial Breakdown */}
                  <div className="bg-muted/30 p-4 rounded-xl border space-y-4">
                    <h3 className="font-headline text-lg flex items-center gap-2">
                      <Wallet className="h-4 w-4" /> Financials
                    </h3>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                      <div><p className="text-muted-foreground">Line Haul</p><p className="font-medium text-base">{formatCurrency(viewingFreight.lineHaul)}</p></div>
                      <div>
                        <p className="text-muted-foreground">Our Share of LH ({viewingFreight.ownerPercentage}%)</p>
                        <p className="font-bold text-primary text-base">{formatCurrency(viewingFreight.lineHaul * (viewingFreight.ownerPercentage / 100))}</p>
                      </div>

                      {viewingFreight.fuelSurcharge > 0 && <div><p className="text-muted-foreground">Fuel Surcharge (100%)</p><p className="font-medium">{formatCurrency(viewingFreight.fuelSurcharge)}</p></div>}
                      {viewingFreight.loading > 0 && <div><p className="text-muted-foreground">Loading (100%)</p><p className="font-medium">{formatCurrency(viewingFreight.loading)}</p></div>}
                      {viewingFreight.unloading > 0 && <div><p className="text-muted-foreground">Unloading (100%)</p><p className="font-medium">{formatCurrency(viewingFreight.unloading)}</p></div>}
                      {viewingFreight.accessorials > 0 && <div><p className="text-muted-foreground">Accessorials (100%)</p><p className="font-medium">{formatCurrency(viewingFreight.accessorials)}</p></div>}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Gross Revenue (Broker Pay):</span>
                        <span>{formatCurrency(viewingFreight.revenue)}</span>
                      </div>
                      <div className="flex justify-between items-center font-bold text-sm">
                        <span>Your Total Share:</span>
                        <span>{formatCurrency(viewingFreight.ownerAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center font-bold text-destructive text-sm">
                        <span>Total Expenses:</span>
                        <span>({formatCurrency(viewingFreight.totalExpenses)})</span>
                      </div>
                      <div className={cn("flex justify-between items-center font-bold text-lg border-t pt-2 mt-2", viewingFreight.netProfit >= 0 ? 'text-success' : 'text-destructive')}>
                        <span>Net Profit:</span>
                        <span>{formatCurrency(viewingFreight.netProfit)}</span>
                      </div>
                    </div>
                  </div>

                  {/* ID & Agency */}
                  <div className="bg-muted/30 p-4 rounded-xl border space-y-3 text-sm">
                    <h3 className="font-headline text-lg flex items-center gap-2"><PenTool className="h-4 w-4" /> Reference & Contact</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div><p className="text-xs text-muted-foreground">Freight Bill #</p><p className="font-medium font-mono">{viewingFreight.freightBillNumber || 'N/A'}</p></div>
                      <div><p className="text-xs text-muted-foreground">Cust Ref #</p><p className="font-medium font-mono">{viewingFreight.customerReferenceNumber || 'N/A'}</p></div>
                      <div className="col-span-2 pt-2 border-t mt-2">
                        <p className="text-xs text-muted-foreground">Agency</p>
                        <p className="font-medium">{viewingFreight.agencyName || 'N/A'}</p>
                      </div>
                      <div><p className="text-xs text-muted-foreground">Contact</p><p className="font-medium truncate">{viewingFreight.contactName || 'N/A'}</p></div>
                      <div><p className="text-xs text-muted-foreground">Phone</p><p className="font-medium">{viewingFreight.contactPhone || 'N/A'}</p></div>
                      <div><p className="text-xs text-muted-foreground">Fax</p><p className="font-medium">{viewingFreight.contactFax || 'N/A'}</p></div>
                      <div className="col-span-2"><p className="text-xs text-muted-foreground">Email</p><p className="font-medium truncate">{viewingFreight.contactEmail || 'N/A'}</p></div>
                    </div>
                  </div>
                </div>

                {/* COL 3: LOGS & EXPENSES */}
                <div className="space-y-6">
                  {/* Expenses */}
                  <div>
                    <h3 className="font-headline text-lg mb-3 flex items-center justify-between">
                      <span>Expenses</span>
                      <Badge variant={viewingFreight.expenses.length > 0 ? "destructive" : "outline"}>{viewingFreight.expenses.length} items</Badge>
                    </h3>
                    <div className="bg-muted/30 rounded-xl border overflow-hidden max-h-[200px] overflow-y-auto">
                      {viewingFreight.expenses.length > 0 ? (
                        <div className="divide-y">
                          {viewingFreight.expenses.map(exp => (
                            <div key={exp.id} className="flex justify-between items-center p-3 hover:bg-white/5">
                              <div>
                                <p className="font-medium text-sm">{exp.description}</p>
                                <p className="text-xs text-muted-foreground">{exp.category}</p>
                              </div>
                              <p className="font-semibold text-destructive text-sm">{formatCurrency(exp.amount)}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-muted-foreground text-sm">No expenses logged.</div>
                      )}
                    </div>
                  </div>

                  {/* Comments */}
                  <div>
                    <h3 className="font-headline text-lg mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" /> Comments
                    </h3>
                    <div className="bg-muted/30 rounded-xl border overflow-hidden max-h-[200px] overflow-y-auto">
                      {viewingFreight.comments && viewingFreight.comments.length > 0 ? (
                        <div className="divide-y">
                          {viewingFreight.comments.filter(c => c.type !== 'system').map(comment => (
                            <div key={comment.id} className="p-3 text-sm">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-xs">{comment.author}</span>
                                <span className="text-[10px] text-muted-foreground">{format(new Date(comment.timestamp), 'MMM d, h:mm a')}</span>
                              </div>
                              <p className="text-muted-foreground">{comment.text}</p>
                            </div>
                          ))}
                          {viewingFreight.comments.filter(c => c.type !== 'system').length === 0 && <div className="p-4 text-center text-xs text-muted-foreground">No manual notes.</div>}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-muted-foreground text-sm">No comments.</div>
                      )}
                    </div>
                  </div>

                  {/* Instructions Block */}
                  {viewingFreight.bcoSpecialInstructions && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg">
                      <p className="text-xs font-bold text-yellow-500 uppercase tracking-wider mb-1">Special Instructions</p>
                      <p className="text-sm">{viewingFreight.bcoSpecialInstructions}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="flex justify-end pt-6 border-t mt-4 gap-4">
                <Button variant="outline" onClick={() => setViewingFreight(null)}>Close</Button>
                <Button onClick={() => {
                  setViewingFreight(null);
                  handleOpenDialog(viewingFreight);
                }}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit Load
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <Table>
          <TableCaption>
            {
              freight.filter(f => !f.isDeleted).length === 0 ? "No freight entries yet."
                : filteredFreight.length === 0 ? "No freight entries match the current filters."
                  : `Displaying ${paginatedFreight.length} of ${filteredFreight.length} matched loads (Total: ${freight.filter(f => !f.isDeleted).length})`
            }
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead>Freight ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Route</TableHead>
              <TableHead className="text-right">RPM</TableHead>
              <TableHead className="text-right">Distance</TableHead>
              <TableHead className="text-right">Weight</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Expenses</TableHead>
              <TableHead className="text-right">Net Profit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedFreight.map((item) => {
              const rpm = item.distance > 0 ? item.revenue / item.distance : 0;
              const isInvalid = !item.driverName || !item.comments || item.comments.length === 0;

              return (
                <Fragment key={item.id}>
                  <TableRow
                    onClick={() => handleRowClick(item)}
                    className={cn(
                      "cursor-pointer hover:bg-muted/50 transition-colors group",
                      isInvalid && "bg-destructive/10 hover:bg-destructive/20 border-l-4 border-l-destructive"
                    )}
                  >
                    <TableCell>
                      {isInvalid && (
                        <span className="text-[10px] font-bold text-destructive uppercase tracking-wider bg-destructive/10 border border-destructive/20 px-1 py-0.5 rounded">
                          Invalid
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{format(item.date, 'MM/dd/yyyy')}</TableCell>
                    <TableCell className="font-medium">
                      {item.freightId}
                      {item.agencyName && <div className="text-[10px] text-muted-foreground font-normal truncate max-w-[100px]" title={item.agencyName}>{item.agencyName}</div>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "text-[10px] uppercase tracking-wider font-bold",
                        item.status === 'Delivered' && "bg-success/10 text-success border-success/20",
                        item.status === 'Cancelled' && "bg-destructive/10 text-destructive border-destructive/20",
                        (item.status === 'In Route' || item.status === 'For Pickup') && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                        item.status === 'Draft' && "text-muted-foreground"
                      )}>
                        {item.status}
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-5 text-[10px] ml-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => {
                        e.stopPropagation();
                        setStatusFreight(item);
                      }}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div>{item.driverName}</div>
                      <div className="text-xs text-muted-foreground">{item.assetName}</div>
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <div className="flex items-center gap-2 truncate">
                        <span className="truncate" title={item.origin}>{item.origin}</span> <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" /> <span className="truncate" title={item.destination}>{item.destination}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-muted-foreground">
                      {formatCurrency(rpm)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {item.distance.toLocaleString()} <span className="text-xs">mi</span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {item.weight.toLocaleString()} <span className="text-xs">lbs</span>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                    <TableCell className="text-right text-destructive">{formatCurrency(item.totalExpenses)}</TableCell>
                    <TableCell className={cn("text-right font-medium", item.netProfit >= 0 ? 'text-success' : 'text-destructive')}>
                      {formatCurrency(item.netProfit)}
                    </TableCell>
                  </TableRow>
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
        {filteredFreight.length > 0 && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="flex-1 text-sm text-muted-foreground">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredFreight.length)} of {filteredFreight.length} entries
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
