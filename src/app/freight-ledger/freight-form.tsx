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
import { PlusCircle, Trash2, MapPin, Truck, Phone, User, FileText, Package } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const expenseCategories = ["Maintenance", "Fuel", "Repairs", "Tolls", "Scale Ticket", "Other"] as const;

const expenseSchema = z.object({
  id: z.string().optional(),
  category: z.enum(expenseCategories),
  description: z.string().min(3, "Description must be at least 3 characters."),
  amount: z.coerce.number().positive("Amount must be a positive number."),
  isDeleted: z.boolean().optional(),
  deletedAt: z.string().optional(),
  loadId: z.string().optional(),
  loadNumber: z.string().optional(),
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

  comments: z.array(commentSchema).optional(),
  expenses: z.array(expenseSchema).optional(),
});

type FreightFormValues = z.infer<typeof formSchema>;

export type FreightFormHandle = {
  isDirty: () => boolean;
  submit: () => void;
};

interface FreightFormProps {
  onSubmit: (values: Omit<Freight, "id"> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  initialData?: Freight | null;
  drivers: Driver[];
  assets: Asset[];
}

const FreightForm = forwardRef<FreightFormHandle, FreightFormProps>(({ onSubmit, onDelete, initialData, drivers, assets }, ref) => {
  const [newComment, setNewComment] = useState("");
  const [activeTab, setActiveTab] = useState("details");

  const form = useForm<FreightFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      date: initialData.date ? new Date(initialData.date) : new Date(),
      expenses: initialData.expenses || [],
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

  // Subscribe to isDirty to ensure updates
  const { isDirty } = form.formState;

  // Debug logging
  // console.log("FreightForm Render - isDirty:", isDirty, "NewComment:", newComment);

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        date: initialData.date ? new Date(initialData.date) : new Date(),
        expenses: initialData.expenses || [],
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
        expenses: [],
        comments: [],
        status: 'Draft',
      });
      setNewComment("");
      setActiveTab("details");
    }
  }, [initialData, form]);

  useImperativeHandle(ref, () => ({
    isDirty: () => form.formState.isDirty || newComment.length > 0,
    submit: () => {
      setActiveTab("logs");
      setTimeout(() => {
        const commentInput = document.getElementById('comment-input');
        if (commentInput) commentInput.focus();
      }, 100);
    }
  }));

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "expenses",
  });

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
    const totalExpenses = (values.expenses || []).filter(exp => !exp.isDeleted).reduce((sum, exp) => sum + exp.amount, 0);
    const netProfit = ownerAmount - totalExpenses;

    const processedExpenses = (values.expenses || []).map(exp => ({ ...exp, id: exp.id || `exp-${Date.now()}-${Math.random()}` }));

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
      setActiveTab("logs");
      return;
    }
    // Enforce initial note for NEW loads
    if (!initialData && !hasNewCommentInInput) {
      form.setError("comments", { type: "manual", message: "Please add an initial note." });
      setActiveTab("logs");
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

    // Cast values to Freight (loose cast due to form values shape match)
    const submissionData: any = {
      ...values,
      expenses: processedExpenses,
      comments: finalComments,
      revenue: (values.lineHaul || 0) + (values.fuelSurcharge || 0) + (values.accessorials || 0) + (values.loading || 0) + (values.unloading || 0),
      totalExpenses,
      netProfit,
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
    // Find the first error and switch to that tab
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const firstError = errorKeys[0];
      // Map field to tab
      const detailFields = ['agencyName', 'postingCode', 'contactName', 'contactPhone', 'contactEmail', 'contactFax', 'operatingEntity', 'freightId', 'freightBillNumber', 'customerReferenceNumber', 'status', 'date', 'driverId', 'assetId'];
      const routeFields = ['origin', 'destination', 'distance', 'pickup', 'drop', 'weight', 'commodity', 'pieces', 'dimensions', 'nmfcCode', 'freightClass', 'temperatureControl', 'trailerNumber', 'equipmentType', 'hazardousMaterial', 'bcoSpecialInstructions'];
      const financialFields = ['lineHaul', 'fuelSurcharge', 'loading', 'unloading', 'accessorials', 'ownerPercentage', 'expenses'];

      if (detailFields.includes(firstError)) {
        setActiveTab('details');
      } else if (routeFields.includes(firstError)) {
        setActiveTab('route');
      } else if (financialFields.includes(firstError)) {
        setActiveTab('financials');
      } else {
        setActiveTab('logs');
      }

      // Show alert with error summary
      const errorMessages = errorKeys.map(key => `${key}: ${errors[key]?.message || 'Invalid'}`).join('\n');
      alert(`Please fix the following errors:\n\n${errorMessages}`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit, handleFormError)} className="space-y-6">

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Load Details</TabsTrigger>
            <TabsTrigger value="route">Route & Cargo</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
            <TabsTrigger value="logs">Logs & Notes</TabsTrigger>
          </TabsList>

          {/* TAB 1: LOAD DETAILS (Header, IDs, Contact) */}
          <TabsContent value="details" className="space-y-6 mt-4">
            {/* Status Section - FIRST */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-bold text-primary">Current Load Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 text-lg font-medium border-primary/30 bg-background/50">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Draft" className="font-medium">Draft / Pending</SelectItem>
                        <SelectItem value="For Pickup" className="font-medium text-blue-400">For Pickup</SelectItem>
                        <SelectItem value="In Route" className="font-medium text-yellow-400">In Route</SelectItem>
                        <SelectItem value="Delivered" className="font-medium text-green-400">Delivered</SelectItem>
                        <SelectItem value="Cancelled" className="font-medium text-red-400">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            {/* Header Info */}
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" /> Agency & Contact</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField control={form.control} name="agencyName" render={({ field }) => (
                  <FormItem><FormLabel>Agency Name</FormLabel><FormControl><Input placeholder="e.g. Rob Johnston - TPN" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="contactName" render={({ field }) => (
                  <FormItem><FormLabel>Contact Name</FormLabel><FormControl><Input placeholder="e.g. Jenn Peterson" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="contactPhone" render={({ field }) => (
                  <FormItem><FormLabel>Contact Phone</FormLabel><FormControl><Input placeholder="(555) 555-5555" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="contactEmail" render={({ field }) => (
                  <FormItem><FormLabel>Contact Email</FormLabel><FormControl><Input placeholder="email@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="contactFax" render={({ field }) => (
                  <FormItem><FormLabel>Contact Fax</FormLabel><FormControl><Input placeholder="(555) 555-5555" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="postingCode" render={({ field }) => (
                  <FormItem><FormLabel>Posting Code</FormLabel><FormControl><Input placeholder="e.g. TPO" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="operatingEntity" render={({ field }) => (
                  <FormItem><FormLabel>Operating Entity</FormLabel><FormControl><Input placeholder="e.g. Landstar Ranger Inc" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> Identification</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="freightId" render={({ field }) => (
                    <FormItem><FormLabel>Load # (ID)</FormLabel><FormControl><Input placeholder="e.g. EL9100100" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="freightBillNumber" render={({ field }) => (
                    <FormItem><FormLabel>Freight Bill #</FormLabel><FormControl><Input placeholder="e.g. 1419829" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="customerReferenceNumber" render={({ field }) => (
                    <FormItem><FormLabel>Customer Ref #</FormLabel><FormControl><Input placeholder="e.g. S028166" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Truck className="h-4 w-4" /> Assignment</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem><FormLabel>Date</FormLabel><FormControl><DatePicker date={field.value} onDateChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="driverId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Driver</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger></FormControl>
                        <SelectContent>{drivers.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="assetId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Truck / Asset</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select truck" /></SelectTrigger></FormControl>
                        <SelectContent>{assets.map(a => <SelectItem key={a.id} value={a.id}>{a.identifier}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 2: ROUTE & CARGO */}
          <TabsContent value="route" className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ORIGIN */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Origin (Pickup)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="origin" render={({ field }) => (
                    <FormItem><FormLabel>City, State</FormLabel><FormControl><Input placeholder="e.g. Chicago, IL" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="pickup.companyName" render={({ field }) => (
                    <FormItem><FormLabel>Company Name</FormLabel><FormControl><Input placeholder="Shipper Name" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="pickup.address" render={({ field }) => (
                    <FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="Street Address" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-2">
                    <FormField control={form.control} name="pickup.appointmentTime" render={({ field }) => (
                      <FormItem><FormLabel>Target Time</FormLabel><FormControl><Input placeholder="14:00" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="pickup.appointmentNumber" render={({ field }) => (
                      <FormItem><FormLabel>Appt #</FormLabel><FormControl><Input placeholder="#" {...field} /></FormControl></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="pickup.notes" render={({ field }) => (
                    <FormItem><FormLabel>Stop Notes</FormLabel><FormControl><Textarea className="min-h-[60px]" placeholder="Pickup instructions..." {...field} /></FormControl></FormItem>
                  )} />
                </CardContent>
              </Card>

              {/* DESTINATION */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-destructive" /> Destination (Drop)</span>
                    <FormField control={form.control} name="distance" render={({ field }) => (
                      <FormItem className="space-y-0"><FormControl><div className="relative w-24"><Input className="h-8 text-right pr-8" placeholder="Miles" {...field} /><span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">mi</span></div></FormControl></FormItem>
                    )} />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="destination" render={({ field }) => (
                    <FormItem><FormLabel>City, State</FormLabel><FormControl><Input placeholder="e.g. Dallas, TX" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="drop.companyName" render={({ field }) => (
                    <FormItem><FormLabel>Company Name</FormLabel><FormControl><Input placeholder="Consignee Name" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="drop.address" render={({ field }) => (
                    <FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="Street Address" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-2">
                    <FormField control={form.control} name="drop.appointmentTime" render={({ field }) => (
                      <FormItem><FormLabel>Target Time</FormLabel><FormControl><Input placeholder="08:00 - 12:00" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="drop.appointmentNumber" render={({ field }) => (
                      <FormItem><FormLabel>Appt #</FormLabel><FormControl><Input placeholder="#" {...field} /></FormControl></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="drop.notes" render={({ field }) => (
                    <FormItem><FormLabel>Stop Notes</FormLabel><FormControl><Textarea className="min-h-[60px]" placeholder="Unload instructions..." {...field} /></FormControl></FormItem>
                  )} />
                </CardContent>
              </Card>
            </div>

            {/* CARGO & EQUIPMENT */}
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Package className="h-4 w-4" /> Cargo & Equipment</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  <FormField control={form.control} name="commodity" render={({ field }) => (
                    <FormItem className="md:col-span-2"><FormLabel>Commodity / Item Description</FormLabel><FormControl><Input placeholder="e.g. CONSUMER GOODS" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="weight" render={({ field }) => (
                    <FormItem><FormLabel>Weight (lbs)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField control={form.control} name="pieces" render={({ field }) => (
                    <FormItem><FormLabel>Pieces / Qty</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="dimensions" render={({ field }) => (
                    <FormItem><FormLabel>Dims (LxWxH)</FormLabel><FormControl><Input placeholder="e.g. 40x48x96" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="nmfcCode" render={({ field }) => (
                    <FormItem><FormLabel>NMFC</FormLabel><FormControl><Input placeholder="NMFC" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="freightClass" render={({ field }) => (
                    <FormItem><FormLabel>Class</FormLabel><FormControl><Input placeholder="e.g. 70.0" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="temperatureControl" render={({ field }) => (
                    <FormItem><FormLabel>Temp</FormLabel><FormControl><Input placeholder="e.g. -10 F" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="trailerNumber" render={({ field }) => (
                    <FormItem><FormLabel>Trailer #</FormLabel><FormControl><Input placeholder="e.g. 672677" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="equipmentType" render={({ field }) => (
                    <FormItem><FormLabel>Equip Type</FormLabel><FormControl><Input placeholder="e.g. VANL" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <div className="mt-4 flex items-center space-x-2 border p-3 rounded-md bg-muted/20">
                  <FormField control={form.control} name="hazardousMaterial" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Hazardous Materials (HazMat)</FormLabel>
                      </div>
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="bcoSpecialInstructions" render={({ field }) => (
                  <FormItem className="mt-4"><FormLabel>BCO Special Instructions</FormLabel><FormControl><Textarea placeholder="Special requirements..." {...field} /></FormControl></FormItem>
                )} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: FINANCIALS */}
          <TabsContent value="financials" className="space-y-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                  <FormField
                    control={form.control}
                    name="lineHaul"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Line Haul</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input type="number" className="pl-7" placeholder="0.00" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ownerPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Our Split (%)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type="number" className="pr-12" placeholder="100" {...field} />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                          </div>
                        </FormControl>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Your share: <span className="font-bold text-primary">
                            ${((form.watch('lineHaul') || 0) * ((field.value || 0) / 100)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
                  <FormField control={form.control} name="fuelSurcharge" render={({ field }) => (
                    <FormItem><FormLabel>Fuel Surcharge</FormLabel><FormControl><Input type="number" placeholder="$" {...field} /></FormControl><FormMessage /></FormItem>
                  )}
                  />
                  <FormField control={form.control} name="accessorials" render={({ field }) => (
                    <FormItem><FormLabel>Other Accessorials</FormLabel><FormControl><Input type="number" placeholder="$" {...field} /></FormControl><FormMessage /></FormItem>
                  )}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
                  <FormField control={form.control} name="loading" render={({ field }) => (
                    <FormItem><FormLabel>Loading</FormLabel><FormControl><Input type="number" placeholder="$" {...field} /></FormControl><FormMessage /></FormItem>
                  )}
                  />
                  <FormField control={form.control} name="unloading" render={({ field }) => (
                    <FormItem><FormLabel>Unloading</FormLabel><FormControl><Input type="number" placeholder="$" {...field} /></FormControl><FormMessage /></FormItem>
                  )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Load Expenses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {fields.map((field, index) => {
                  const isDeleted = form.watch(`expenses.${index}.isDeleted`);

                  if (isDeleted) {
                    return (
                      <div key={field.id} className="hidden">
                        <input type="hidden" {...form.register(`expenses.${index}.id`)} />
                        <input type="hidden" {...form.register(`expenses.${index}.category`)} />
                        <input type="hidden" {...form.register(`expenses.${index}.description`)} />
                        <input type="hidden" {...form.register(`expenses.${index}.amount`)} />
                        <input type="hidden" {...form.register(`expenses.${index}.isDeleted`)} />
                        <input type="hidden" {...form.register(`expenses.${index}.deletedAt`)} />
                        <input type="hidden" {...form.register(`expenses.${index}.loadId`)} />
                        <input type="hidden" {...form.register(`expenses.${index}.loadNumber`)} />
                      </div>
                    );
                  }

                  return (
                    <div key={field.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 items-start p-2 border rounded-md">
                      <FormField control={form.control} name={`expenses.${index}.category`} render={({ field }) => (
                        <FormItem><FormLabel className="sr-only">Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger></FormControl><SelectContent>{expenseCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                      )}
                      />
                      <FormField control={form.control} name={`expenses.${index}.description`} render={({ field }) => (
                        <FormItem><FormLabel className="sr-only">Description</FormLabel><FormControl><Input placeholder="Description" {...field} /></FormControl><FormMessage /></FormItem>
                      )}
                      />
                      <FormField control={form.control} name={`expenses.${index}.amount`} render={({ field }) => (
                        <FormItem><FormLabel className="sr-only">Amount</FormLabel><FormControl><Input type="number" placeholder="$" {...field} /></FormControl><FormMessage /></FormItem>
                      )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (window.confirm("Delete this expense line? It will be moved to the Recycle Bin.")) {
                            const expenseId = form.getValues(`expenses.${index}.id`);
                            if (expenseId) {
                              form.setValue(`expenses.${index}.isDeleted`, true);
                              form.setValue(`expenses.${index}.deletedAt`, new Date().toISOString());
                              form.setValue(`expenses.${index}.loadId`, initialData?.id);
                              form.setValue(`expenses.${index}.loadNumber`, initialData?.freightId || "");
                            } else {
                              remove(index);
                            }
                          }
                        }}
                        className="mt-1"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  );
                })}
                <Button type="button" variant="outline" size="sm" onClick={() => append({ category: "Other", description: "", amount: 0, isDeleted: false })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: LOGS & NOTES */}
          <TabsContent value="logs" className="space-y-6 mt-4">
            <Card id="comment-section" className={form.formState.errors.comments ? "border-destructive" : ""}>
              <CardHeader>
                <CardTitle className="text-base">Comments & Signature Log</CardTitle>
                {form.formState.errors.comments && (
                  <p className="text-sm font-medium text-destructive mt-1">{form.formState.errors.comments.message}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      id="comment-input"
                      placeholder="Add a comment or note..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addComment(); } }}
                    />
                  </div>
                  <Button type="button" variant="secondary" onClick={addComment}>Add Note</Button>
                </div>

                <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2">
                  {comments.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No activity logged.</p>}
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex flex-col gap-1 p-3 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary">{comment.author}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(comment.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-foreground">{comment.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              {initialData && onDelete && (
                <Button type="button" variant="destructive" className="flex-1" onClick={() => onDelete(initialData.id)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Load
                </Button>
              )}
              <Button type="submit" className={initialData && onDelete ? "flex-[2]" : "w-full"}>
                {initialData ? "Save Changes" : "Add Load"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
});

FreightForm.displayName = "FreightForm";

export { FreightForm };
