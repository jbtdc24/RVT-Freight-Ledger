"use client";

import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { Freight, Driver, Asset } from "@/lib/types";
import { PlusCircle, Trash2, MapPin, Truck, Phone, User, FileText, Package, ArrowRight, Wallet, PenTool, X, CalendarDays, MessageSquare, Pencil } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const expenseSchema = z.object({
  id: z.string(),
  category: z.string().min(1, "Category is required."),
  description: z.string().min(1, "Description is required."),
  amount: z.coerce.number().min(0, "Amount must be positive."),
});

const commentSchema = z.object({
  id: z.string(),
  text: z.string(),
  author: z.string(),
  timestamp: z.string(),
  type: z.enum(['manual', 'system']),
});

const stopDetailSchema = z.object({
  companyName: z.string().optional(),
  address: z.string().optional(),
  cityStateZip: z.string().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  appointmentTime: z.string().optional(),
  appointmentNumber: z.string().optional(),
  notes: z.string().optional(),
});

const formSchema = z.object({
  // Header / Agency
  agencyName: z.string().optional(),
  postingCode: z.string().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().optional(),
  contactFax: z.string().optional(),
  operatingEntity: z.string().optional(),

  // Identifiers
  freightId: z.string().min(2, "Load # is required."),
  freightBillNumber: z.string().optional(),
  customerReferenceNumber: z.string().optional(),

  // Status
  status: z.enum(['Draft', 'For Pickup', 'In Route', 'Delivered', 'Cancelled']).default('Draft'),

  // General
  date: z.date({ required_error: "A date is required." }),
  driverId: z.string({ required_error: "Driver is required." }).min(1, "Driver is required."),
  assetId: z.string().optional(),

  // Route
  origin: z.string().min(2, "Origin is required."),
  destination: z.string().min(2, "Destination is required."),
  distance: z.coerce.number().positive("Distance must be a positive number."),
  pickup: stopDetailSchema.optional(),
  drop: stopDetailSchema.optional(),

  // Cargo & Equipment
  weight: z.coerce.number().positive("Weight must be a positive number."),
  commodity: z.string().optional(),
  pieces: z.coerce.number().optional(),
  dimensions: z.string().optional(),
  nmfcCode: z.string().optional(),
  freightClass: z.string().optional(),
  temperatureControl: z.string().optional(),
  trailerNumber: z.string().optional(),
  equipmentType: z.string().optional(),
  hazardousMaterial: z.boolean().default(false),
  bcoSpecialInstructions: z.string().optional(),

  // Financials
  lineHaul: z.coerce.number().positive("Line Haul must be a positive number."),
  fuelSurcharge: z.coerce.number().min(0, "Fuel Surcharge cannot be negative."),
  loading: z.coerce.number().min(0, "Loading charge cannot be negative.").optional().default(0),
  unloading: z.coerce.number().min(0, "Unloading charge cannot be negative.").optional().default(0),
  accessorials: z.coerce.number().min(0, "Accessorials cannot be negative.").optional().default(0),
  ownerPercentage: z.coerce.number().min(0).max(100).default(100),
  expenses: z.array(expenseSchema).optional().default([]),
  comments: z.array(commentSchema).optional(),

});

type FreightFormValues = z.infer<typeof formSchema>;

export type FreightFormHandle = {
  isDirty: () => boolean;
  submit: () => void;
};

interface FreightFormProps {
  onSubmit: (values: Omit<Freight, "id"> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  onCancel: () => void;
  initialData?: Freight | null;
  drivers: Driver[];
  assets: Asset[];
}

const FreightForm = forwardRef<FreightFormHandle, FreightFormProps>(({ onSubmit, onDelete, onCancel, initialData, drivers, assets }, ref) => {
  const [newComment, setNewComment] = useState("");

  const form = useForm<FreightFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      date: initialData.date ? new Date(initialData.date) : new Date(),

      expenses: (initialData.expenses || []).map(e => ({ ...e, amount: e.amount })),
      comments: initialData.comments || [],
    } : {
      date: new Date(),
      hazardousMaterial: false,
      loading: 0,
      unloading: 0,
      lineHaul: 0,
      fuelSurcharge: 0,
      accessorials: 0,
      ownerPercentage: 100, // Default to 100% split

      expenses: [],
      comments: [],
      status: 'Draft',
    },
  });

  const { fields: expenseFields, append: appendExpense, remove: removeExpense } = useFieldArray({
    control: form.control,
    name: "expenses",
  });

  // Subscribe to isDirty to ensure updates
  const { isDirty } = form.formState;

  // Debug logging
  // console.log("FreightForm Render - isDirty:", isDirty, "NewComment:", newComment);

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        date: initialData.date ? new Date(initialData.date) : new Date(),

        expenses: (initialData.expenses || []).map(e => ({ ...e, amount: e.amount })),
        comments: initialData.comments || [],
      });
    } else {
      form.reset({
        date: new Date(),
        hazardousMaterial: false,
        loading: 0,
        unloading: 0,
        lineHaul: 0,
        fuelSurcharge: 0,
        accessorials: 0,
        ownerPercentage: 100,

        comments: [],
        status: 'Draft',
      });
      setNewComment("");
    }
  }, [initialData, form]);

  useImperativeHandle(ref, () => ({
    isDirty: () => form.formState.isDirty || newComment.length > 0,
    submit: () => {
      form.handleSubmit(handleFormSubmit, handleFormError)();
    }
  }));



  const comments = form.watch("comments") || [];

  const addComment = () => {
    if (!newComment.trim()) return;

    const comment: z.infer<typeof commentSchema> = {
      id: Math.random().toString(36).substr(2, 9),
      text: newComment,
      author: "User",
      timestamp: new Date().toISOString(),
      type: 'manual'
    };

    form.setValue("comments", [comment, ...comments], { shouldDirty: true });
    setNewComment("");
  };

  function handleFormSubmit(values: FreightFormValues) {
    const ownerBase = (values.lineHaul || 0) * (values.ownerPercentage / 100);
    const ownerAmount = ownerBase + (values.fuelSurcharge || 0) + (values.accessorials || 0) + (values.loading || 0) + (values.unloading || 0);


    let changeLog = initialData ? "Load updated" : "Load created";
    let hasChanges = false;

    // Changes check strictly for status
    if (initialData) {
      if (initialData.status !== values.status) {
        changeLog = `Status changed: ${initialData.status} -> ${values.status}`;
        hasChanges = true;
      }
    }

    // Pending comment check - detect if user has added a comment via:
    // 1. Clicking "Add Note" button (which adds to values.comments)
    // 2. Typing in the input field (newComment has text)
    const initialCommentCount = initialData?.comments?.length || 0;
    const currentCommentCount = values.comments?.length || 0;
    const hasNewCommentInArray = currentCommentCount > initialCommentCount;
    const hasNewCommentInInput = newComment.trim().length > 0;
    const hasAnyNewComment = hasNewCommentInArray || hasNewCommentInInput;

    // Enforce Comment Requirement for EDITS
    if (initialData && !hasAnyNewComment) {
      form.setError("comments", { type: "manual", message: "PLEASE ADD A NOTE explaining changes." });
      return;
    }
    // Enforce initial note for NEW loads
    if (!initialData && !hasNewCommentInInput) {
      form.setError("comments", { type: "manual", message: "Please add an initial note." });
      return;
    }

    let finalComments = [...(values.comments || [])];
    if (newComment.trim()) {
      finalComments.unshift({
        id: Math.random().toString(36).substr(2, 9),
        text: newComment,
        author: "User",
        timestamp: new Date().toISOString(),
        type: 'manual'
      });
      setNewComment("");
    }

    finalComments.unshift({
      id: Math.random().toString(36).substr(2, 9),
      text: changeLog,
      author: "System",
      timestamp: new Date().toISOString(),
      type: 'system'
    });

    const totalExpenses = (values.expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);

    // Cast values to Freight (loose cast due to form values shape match)
    const submissionData: any = {
      ...values,
      expenses: values.expenses,
      comments: finalComments,
      revenue: (values.lineHaul || 0) + (values.fuelSurcharge || 0) + (values.accessorials || 0) + (values.loading || 0) + (values.unloading || 0),
      totalExpenses,
      netProfit: ownerAmount - totalExpenses,
      ownerAmount,
      driverName: drivers.find(d => d.id === values.driverId)?.name,
      assetName: assets.find(a => a.id === values.assetId)?.identifier,
      id: initialData?.id
    };

    onSubmit(submissionData);
  }

  // Handler for form validation errors
  const handleFormError = (errors: any) => {
    console.error("Form validation errors:", errors);
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      // Show alert with error summary
      const errorMessages = errorKeys.map(key => `${key}: ${errors[key]?.message || 'Invalid'}`).join('\n');
      alert(`Please fix the following errors:\n\n${errorMessages}`);
    }
  };

  // Watch values for the visual summary
  const watchAll = form.watch();
  const lineHaul = Number(watchAll.lineHaul) || 0;
  const split = Number(watchAll.ownerPercentage) || 0;
  const extras = (Number(watchAll.fuelSurcharge) || 0) + (Number(watchAll.accessorials) || 0) + (Number(watchAll.loading) || 0) + (Number(watchAll.unloading) || 0);
  const ownerShare = (lineHaul * (split / 100)) + extras;
  const brokerPay = lineHaul + extras;
  const totalLoadExpenses = (watchAll.expenses || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const loadNetProfit = ownerShare - totalLoadExpenses;

  const formatCurrency = (val: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit, handleFormError)} className="space-y-6 pb-20">
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-black tracking-tight text-foreground">
                Load <span className="text-primary">#{watchAll.freightId || "----"}</span>
              </h1>
              <div className="w-32">
                <FormField control={form.control} name="status" render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className={cn(
                        "h-7 text-[10px] font-black uppercase tracking-widest px-3 border-none shadow-sm",
                        field.value === 'Delivered' && "bg-success text-success-foreground",
                        field.value === 'Cancelled' && "bg-destructive text-destructive-foreground",
                        (field.value === 'In Route' || field.value === 'For Pickup') && "bg-blue-600 text-white",
                        field.value === 'Draft' && "bg-muted text-muted-foreground"
                      )}>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="For Pickup">For Pickup</SelectItem>
                      <SelectItem value="In Route">In Route</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>
            </div>

            <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-xl border border-muted-foreground/10">
              <CalendarDays className="h-4 w-4 text-muted-foreground ml-2" />
              <FormField control={form.control} name="date" render={({ field }) => (
                <div className="w-[180px]">
                  <DatePicker date={field.value} onDateChange={field.onChange} />
                </div>
              )} />
            </div>
          </div>
          <div className="flex items-center gap-3 text-lg text-muted-foreground font-semibold">
            <span className="text-foreground">{watchAll.origin || "Origin"}</span>
            <div className="h-[2px] w-8 bg-muted-foreground/20 rounded-full" />
            <ArrowRight className="h-4 w-4 text-primary" />
            <div className="h-[2px] w-8 bg-muted-foreground/20 rounded-full" />
            <span className="text-foreground">{watchAll.destination || "Destination"}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* COLUMN 1: LOGISTICS (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Route Details */}
            <Card className="shadow-sm border-muted/40 overflow-hidden ring-1 ring-black/5">
              <CardHeader className="py-2 bg-muted/20 border-b border-muted/30 flex flex-row items-center gap-2 space-y-0">
                <MapPin className="h-3 w-3 text-primary" />
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Route Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-primary/10">
                  <div className="relative">
                    <div className="absolute -left-[17px] top-1.5 h-2 w-2 rounded-full bg-blue-500 border border-background shadow-[0_0_0_4px_rgba(59,130,246,0.05)]" />
                    <FormField control={form.control} name="origin" render={({ field }) => (
                      <FormItem className="space-y-0.5">
                        <FormLabel className="text-[9px] uppercase font-black text-blue-500/70">Pickup</FormLabel>
                        <FormControl><Input className="h-8 text-sm font-semibold border-muted-foreground/20" placeholder="Origin" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[17px] top-1.5 h-2 w-2 rounded-full bg-orange-500 border border-background shadow-[0_0_0_4px_rgba(249,115,22,0.05)]" />
                    <FormField control={form.control} name="destination" render={({ field }) => (
                      <FormItem className="space-y-0.5">
                        <FormLabel className="text-[9px] uppercase font-black text-orange-500/70">Drop</FormLabel>
                        <FormControl><Input className="h-8 text-sm font-semibold border-muted-foreground/20" placeholder="Destination" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <FormField control={form.control} name="freightId" render={({ field }) => (
                    <FormItem className="space-y-0.5">
                      <FormLabel className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Load ID</FormLabel>
                      <FormControl><Input className="h-8 text-sm font-mono" {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="distance" render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Miles</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type="number" className="h-8 pr-8 text-sm font-semibold" {...field} />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-muted-foreground opacity-30">MI</span>
                        </div>
                      </FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="driverId" render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Driver</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                        <SelectContent>{drivers.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="assetId" render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Asset</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                        <SelectContent>{assets.map(a => <SelectItem key={a.id} value={a.id}>{a.identifier}</SelectItem>)}</SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                </div>
              </CardContent>
            </Card>

            {/* Cargo & Eqpt */}
            <Card className="shadow-sm border-muted/40 overflow-hidden ring-1 ring-black/5">
              <CardHeader className="py-2 bg-muted/20 border-b border-muted/30 flex flex-row items-center gap-2 space-y-0">
                <Package className="h-3 w-3 text-primary" />
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Cargo & Eqpt</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <FormField control={form.control} name="commodity" render={({ field }) => (
                  <FormItem className="space-y-0.5">
                    <FormLabel className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Commodity</FormLabel>
                    <FormControl><Input className="h-8 border-muted-foreground/20 text-sm" {...field} /></FormControl>
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="weight" render={({ field }) => (
                    <FormItem className="space-y-0.5">
                      <FormLabel className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Weight</FormLabel>
                      <FormControl><div className="relative"><Input type="number" className="h-8 pr-10 text-sm font-medium" {...field} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-muted-foreground opacity-30">LBS</span></div></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="equipmentType" render={({ field }) => (
                    <FormItem className="space-y-0.5">
                      <FormLabel className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Equip Type</FormLabel>
                      <FormControl><Input className="h-8 border-muted-foreground/20 text-sm font-medium" placeholder="VAN/REEFER" {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="trailerNumber" render={({ field }) => (
                    <FormItem className="space-y-0.5">
                      <FormLabel className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Trailer #</FormLabel>
                      <FormControl><Input className="h-8 border-muted-foreground/20 text-sm font-medium" {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="pieces" render={({ field }) => (
                    <FormItem className="space-y-0.5">
                      <FormLabel className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Pieces</FormLabel>
                      <FormControl><Input type="number" className="h-8 border-muted-foreground/20 text-sm font-medium" {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="dimensions" render={({ field }) => (
                    <FormItem className="space-y-0.5">
                      <FormLabel className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Dimensions</FormLabel>
                      <FormControl><Input className="h-8 border-muted-foreground/20 text-sm font-medium" placeholder="LxWxH" {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="nmfcCode" render={({ field }) => (
                    <FormItem className="space-y-0.5">
                      <FormLabel className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">NMFC Code</FormLabel>
                      <FormControl><Input className="h-8 border-muted-foreground/20 text-sm font-medium" {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="freightClass" render={({ field }) => (
                    <FormItem className="space-y-0.5">
                      <FormLabel className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Class</FormLabel>
                      <FormControl><Input className="h-8 border-muted-foreground/20 text-sm font-medium" {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="temperatureControl" render={({ field }) => (
                    <FormItem className="space-y-0.5">
                      <FormLabel className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Temp Control</FormLabel>
                      <FormControl><Input className="h-8 border-muted-foreground/20 text-sm font-medium" placeholder="e.g. 35F" {...field} /></FormControl>
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="hazardousMaterial" render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 bg-destructive/5">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-destructive">Hazardous Material (HAZMAT)</FormLabel>
                    </div>
                  </FormItem>
                )} />

                <FormField control={form.control} name="bcoSpecialInstructions" render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Special Instructions</FormLabel>
                    <FormControl><Textarea className="min-h-[60px] text-xs font-medium" {...field} /></FormControl>
                  </FormItem>
                )} />
              </CardContent>
            </Card>
          </div>

          {/* COLUMN 2: FINANCIALS (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="shadow-sm border-muted/40 overflow-hidden ring-1 ring-black/5">
              <CardHeader className="py-2 bg-muted/20 border-b border-muted/30 flex flex-row items-center gap-2 space-y-0">
                <Wallet className="h-3 w-3 text-primary" />
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Financial Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  <FormField control={form.control} name="lineHaul" render={({ field }) => (
                    <FormItem className="space-y-0.5">
                      <FormLabel className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Line Haul (LH)</FormLabel>
                      <FormControl><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span><Input type="number" className="h-9 pl-7 text-lg font-black border-primary/20 bg-primary/5 focus-visible:ring-primary" {...field} /></div></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="ownerPercentage" render={({ field }) => (
                    <FormItem className="space-y-0.5">
                      <FormLabel className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Our Split %</FormLabel>
                      <FormControl><div className="relative"><Input type="number" className="h-9 pr-7 text-lg font-black text-blue-600 border-blue-200 bg-blue-50/30" {...field} /><span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-blue-400 opacity-50">%</span></div></FormControl>
                      <p className="text-[9px] font-black text-blue-500/60 mt-0.5">Portion: <span className="underline">{formatCurrency(lineHaul * (field.value / 100))}</span></p>
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 pt-1">
                  <FormField control={form.control} name="fuelSurcharge" render={({ field }) => (
                    <FormItem className="space-y-0.5">
                      <FormLabel className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Fuel Surcharge</FormLabel>
                      <FormControl><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-xs">$</span><Input type="number" className="h-8 pl-6 text-sm font-semibold" {...field} /></div></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="loading" render={({ field }) => (
                    <FormItem className="space-y-0.5">
                      <FormLabel className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Loading</FormLabel>
                      <FormControl><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-xs">$</span><Input type="number" className="h-8 pl-6 text-sm font-semibold" {...field} /></div></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="unloading" render={({ field }) => (
                    <FormItem className="space-y-0.5">
                      <FormLabel className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Unloading</FormLabel>
                      <FormControl><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-xs">$</span><Input type="number" className="h-8 pl-6 text-sm font-semibold" {...field} /></div></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="accessorials" render={({ field }) => (
                    <FormItem className="space-y-0.5">
                      <FormLabel className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Accessorials</FormLabel>
                      <FormControl><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-xs">$</span><Input type="number" className="h-8 pl-6 text-sm font-semibold" {...field} /></div></FormControl>
                    </FormItem>
                  )} />
                </div>

                <div className="pt-4 border-t-2 border-dashed border-muted/80 space-y-2">
                  <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 px-1">
                    <span>Broker Bill:</span>
                    <span className="font-mono text-xs">{formatCurrency(brokerPay)}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-2 bg-blue-50/50 rounded-xl border border-blue-100/50">
                    <span className="text-[10px] font-black text-blue-700/70 uppercase tracking-widest">Gross Share</span>
                    <span className="text-base font-black text-blue-900 font-mono">{formatCurrency(ownerShare)}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-1.5 bg-destructive/5 rounded-xl border border-destructive/10">
                    <span className="text-[10px] font-black text-destructive/60 uppercase tracking-widest">Deductions</span>
                    <span className="text-base font-black text-destructive font-mono">({formatCurrency(totalLoadExpenses)})</span>
                  </div>
                  <div className={cn(
                    "flex justify-between items-center px-4 py-3 rounded-xl border-2 shadow-sm",
                    loadNetProfit >= 0 ? "bg-success/5 border-success/20" : "bg-destructive/5 border-destructive/20"
                  )}>
                    <span className="text-xs font-black uppercase tracking-[0.2em] opacity-50">Net Profit</span>
                    <span className={cn("text-2xl font-black font-mono", loadNetProfit >= 0 ? "text-success" : "text-destructive")}>
                      {formatCurrency(loadNetProfit)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reference */}
            <Card className="shadow-sm border-muted/40 overflow-hidden ring-1 ring-black/5">
              <CardHeader className="py-2 bg-muted/20 border-b border-muted/30 flex flex-row items-center gap-2 space-y-0">
                <PenTool className="h-3 w-3 text-primary" />
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Documentation</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                <FormField control={form.control} name="freightBillNumber" render={({ field }) => (
                  <FormItem className="space-y-0.5">
                    <FormLabel className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Bill #</FormLabel>
                    <FormControl><Input className="h-8 font-mono text-sm" {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="customerReferenceNumber" render={({ field }) => (
                  <FormItem className="space-y-0.5">
                    <FormLabel className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Ref #</FormLabel>
                    <FormControl><Input className="h-8 font-mono text-sm" {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="agencyName" render={({ field }) => (
                  <FormItem className="col-span-2 space-y-0.5">
                    <FormLabel className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Dispatch Agency</FormLabel>
                    <FormControl><Input className="h-8 text-sm" {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="contactName" render={({ field }) => (
                  <FormItem className="space-y-0.5">
                    <FormLabel className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Contact Name</FormLabel>
                    <FormControl><Input className="h-8 text-sm" {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="contactPhone" render={({ field }) => (
                  <FormItem className="space-y-0.5">
                    <FormLabel className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Phone</FormLabel>
                    <FormControl><Input className="h-8 text-sm" {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="contactFax" render={({ field }) => (
                  <FormItem className="space-y-0.5">
                    <FormLabel className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Fax</FormLabel>
                    <FormControl><Input className="h-8 text-sm" {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="contactEmail" render={({ field }) => (
                  <FormItem className="space-y-0.5">
                    <FormLabel className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Email</FormLabel>
                    <FormControl><Input className="h-8 text-sm" {...field} /></FormControl>
                  </FormItem>
                )} />
              </CardContent>
            </Card>
          </div>

          {/* COLUMN 3: SIDEBAR (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Expenses */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <div className="h-1 w-3 bg-destructive rounded-full" /> Expenses
                </h3>
                <Badge variant="destructive" className="rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-widest">
                  {expenseFields.length}
                </Badge>
              </div>
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                {expenseFields.map((field, index) => (
                  <div key={field.id} className="bg-background border border-muted/30 p-3 rounded-xl relative group hover:border-destructive/30 hover:shadow-md transition-all">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 mr-6">
                          <FormField control={form.control} name={`expenses.${index}.description`} render={({ field }) => (
                            <Input className="h-5 border-none bg-transparent p-0 text-[13px] font-black text-foreground placeholder-muted-foreground/30 focus-visible:ring-0" placeholder="Description..." {...field} />
                          )} />
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="h-5 w-5 rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all shadow-sm" onClick={() => removeExpense(index)}>
                          <X className="h-2.5 w-2.5" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-muted/20">
                        <FormField control={form.control} name={`expenses.${index}.category`} render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-5 text-[9px] font-black uppercase tracking-widest text-muted-foreground/70 border-none bg-transparent p-0 focus:ring-0 w-min hover:text-primary transition-colors">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {['Fuel', 'Tolls', 'Lumper', 'Parking', 'Scales', 'Maintenance', 'Other'].map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )} />

                        <div className="flex items-center gap-1 group/amt">
                          <span className="text-xs font-black text-destructive opacity-30">$</span>
                          <FormField control={form.control} name={`expenses.${index}.amount`} render={({ field }) => (
                            <Input type="number" className="h-7 w-24 border-none bg-destructive/5 rounded-lg px-2 text-right font-black text-destructive focus-visible:ring-destructive" {...field} />
                          )} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10 border-dashed border-2 bg-muted/5 hover:bg-primary/5 hover:border-primary/40 text-muted-foreground/60 hover:text-primary transition-all rounded-xl group flex items-center justify-center gap-2 py-2"
                  onClick={() => appendExpense({ id: Math.random().toString(36).substr(2, 9), category: "Other", description: "", amount: 0 })}
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="text-[9px] font-black uppercase tracking-widest">New Expense</span>
                </Button>
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <div className="h-1 w-3 bg-primary/40 rounded-full" /> Notes & Log
              </h3>
              <div className="bg-muted/10 border border-muted/30 rounded-2xl p-4 flex flex-col gap-4">
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {comments.length === 0 && (
                    <div className="text-center py-10 opacity-20">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">No history yet</p>
                    </div>
                  )}
                  {comments.map((comment) => (
                    <div key={comment.id} className={cn(
                      "p-3 rounded-xl text-xs border transition-all",
                      comment.type === 'system'
                        ? "bg-muted/30 border-muted/50 text-muted-foreground opacity-60"
                        : "bg-background border-border shadow-sm hover:shadow-md"
                    )}>
                      <div className="flex items-center justify-between mb-1.5 opacity-50">
                        <span className="font-black text-[9px] uppercase tracking-tighter">{comment.author}</span>
                        <span className="text-[8px] font-medium">{format(new Date(comment.timestamp), "MMM d, h:mm a")}</span>
                      </div>
                      <p className="leading-relaxed font-medium">{comment.text}</p>
                    </div>
                  ))}
                </div>

                <div className="relative group">
                  <Input
                    id="comment-input"
                    className="pr-12 bg-background h-10 border-muted-foreground/20 rounded-xl focus-visible:ring-primary shadow-sm text-[11px] font-medium"
                    placeholder="Log a update..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addComment(); } }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 px-2 transition-all"
                    onClick={addComment}
                  >
                    Post
                  </Button>
                </div>
                {form.formState.errors.comments && (
                  <p className="text-[9px] font-black text-destructive uppercase tracking-widest animate-pulse px-1">
                    {form.formState.errors.comments.message}
                  </p>
                )}
              </div>
            </div>

            {/* ACTION BUTTONS UNDER LOGS */}
            <div className="pt-4 mt-2 border-t border-muted/40 space-y-2">
              <Button
                type="submit"
                className="w-full h-10 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <div className="h-4 w-4 flex items-center justify-center">
                  <Pencil className="h-3 w-3" />
                </div>
                {initialData ? "Save Changes" : "Create Entry"}
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-full border-muted-foreground/20 hover:bg-muted font-black text-[10px] uppercase tracking-widest transition-all"
                  onClick={onCancel}
                >
                  Close
                </Button>

                {initialData && onDelete && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-9 rounded-full text-destructive hover:text-destructive hover:bg-destructive/5 font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                    onClick={() => {
                      if (confirm("Are you sure?")) {
                        onDelete(initialData.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

      </form>
    </Form >
  );
});

FreightForm.displayName = "FreightForm";

export { FreightForm };
