"use client";

import { useState } from "react";
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
import type { Freight, Driver, Asset } from "@/lib/types";
import { PlusCircle, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";

const expenseCategories = ["Maintenance", "Fuel", "Repairs", "Other"] as const;

const expenseSchema = z.object({
  id: z.string().optional(),
  category: z.enum(expenseCategories),
  description: z.string().min(3, "Description must be at least 3 characters."),
  amount: z.coerce.number().positive("Amount must be a positive number."),
});

const commentSchema = z.object({
  id: z.string(),
  text: z.string(),
  author: z.string(),
  timestamp: z.string(),
  type: z.enum(['manual', 'system']),
});

const formSchema = z.object({
  date: z.date({ required_error: "A date is required." }),
  freightId: z.string().min(2, "Freight ID must be at least 2 characters."),
  driverId: z.string({ required_error: "Driver is required." }).min(1, "Driver is required."),
  assetId: z.string().optional(),
  origin: z.string().min(2, "Origin is required."),
  destination: z.string().min(2, "Destination is required."),
  distance: z.coerce.number().positive("Distance must be a positive number."),
  weight: z.coerce.number().positive("Weight must be a positive number."),
  lineHaul: z.coerce.number().positive("Line Haul must be a positive number."),
  fuelSurcharge: z.coerce.number().min(0, "Fuel Surcharge cannot be negative."),
  loading: z.coerce.number().min(0, "Loading charge cannot be negative.").optional().default(0),
  unloading: z.coerce.number().min(0, "Unloading charge cannot be negative.").optional().default(0),
  accessorials: z.coerce.number().min(0, "Accessorials cannot be negative."),
  ownerPercentage: z.coerce.number().min(0).max(100).default(100),
  expenses: z.array(expenseSchema).optional(),
  comments: z.array(commentSchema).optional(),
});

type FreightFormValues = z.infer<typeof formSchema>;

type FreightFormProps = {
  onSubmit: (values: Omit<Freight, "id"> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  initialData?: Freight | null;
  drivers: Driver[];
  assets: Asset[];
};

export function FreightForm({ onSubmit, onDelete, initialData, drivers, assets }: FreightFormProps) {
  const [newComment, setNewComment] = useState("");

  const form = useForm<FreightFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      date: new Date(initialData.date),
      expenses: initialData.expenses || [],
      ownerPercentage: initialData.ownerPercentage ?? 100,
      comments: initialData.comments || [],
    } : {
      freightId: "",
      date: new Date(),
      origin: "",
      destination: "",
      distance: 0,
      weight: 0,
      driverId: undefined,
      assetId: undefined,
      lineHaul: 0,
      fuelSurcharge: 0,
      loading: 0,
      unloading: 0,
      accessorials: 0,
      ownerPercentage: 100,
      expenses: [],
      comments: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "expenses",
  });

  // Need to use watch/setValue for comments since it's not a simple input field
  const comments = form.watch("comments") || [];

  const addComment = () => {
    if (!newComment.trim()) return;

    const comment: z.infer<typeof commentSchema> = {
      id: Math.random().toString(36).substr(2, 9),
      text: newComment,
      author: "User", // Hardcoded for now
      timestamp: new Date().toISOString(),
      type: 'manual'
    };

    form.setValue("comments", [comment, ...comments]);
    setNewComment("");
  };

  function handleFormSubmit(values: FreightFormValues) {
    const ownerAmount = (values.lineHaul || 0) * (values.ownerPercentage / 100);
    const revenue = ownerAmount + (values.fuelSurcharge || 0) + (values.accessorials || 0) + (values.loading || 0) + (values.unloading || 0);
    const totalExpenses = (values.expenses || []).reduce((sum, exp) => sum + exp.amount, 0);
    const netProfit = revenue - totalExpenses;

    const processedExpenses = (values.expenses || []).map(exp => ({ ...exp, id: exp.id || `exp-${Date.now()}-${Math.random()}` }));

    // Calculate Diff (only if editing)
    let changeLog = "Load created.";
    let hasChanges = false;

    if (initialData) {
      const changes: string[] = [];
      const formatValue = (field: keyof FreightFormValues, val: any) => {
        if (val === undefined || val === null) return 'N/A';
        if (val instanceof Date) return val.toLocaleDateString();

        const currencyFields = ['lineHaul', 'fuelSurcharge', 'loading', 'unloading', 'accessorials'];
        if (currencyFields.includes(field)) return `$${Number(val).toFixed(2)}`;

        if (field === 'weight') return `${val} lbs`;
        if (field === 'distance') return `${val} mi`;
        if (field === 'ownerPercentage') return `${val}%`;

        return val;
      };

      const compare = (field: keyof FreightFormValues, label: string) => {
        const val1 = initialData[field as keyof Freight];
        const val2 = values[field];

        if (val1 instanceof Date && val2 instanceof Date) {
          if (val1.getTime() !== val2.getTime()) {
            changes.push(`${label} changed (${formatValue(field, val1)} -> ${formatValue(field, val2)})`);
          }
        } else if (val1 !== val2) {
          // Handle 0 vs undefined/null equality usually treated as change? 
          // Let's be strict: if initial is 0 and new is 0, no change.
          // If initial is undefined(0) and new is 0, no change.
          const v1 = val1 ?? 0;
          const v2 = val2 ?? 0;

          // For strings/numbers
          if (v1 != v2) {
            changes.push(`${label} changed (${formatValue(field, val1)} -> ${formatValue(field, val2)})`);
          }
        }
      };

      if (initialData.freightId !== values.freightId) changes.push(`ID changed (${initialData.freightId} -> ${values.freightId})`);

      // Date
      const d1 = new Date(initialData.date);
      const d2 = values.date;
      if (d1.getTime() !== d2.getTime()) changes.push(`Date changed (${d1.toLocaleDateString()} -> ${d2.toLocaleDateString()})`);

      compare('origin', 'Origin');
      compare('destination', 'Destination');
      compare('distance', 'Distance');
      compare('weight', 'Weight');

      // Driver/Asset Lookups
      if (initialData.driverId !== values.driverId) {
        const oldD = drivers.find(d => d.id === initialData.driverId)?.name || "None";
        const newD = drivers.find(d => d.id === values.driverId)?.name || "None";
        changes.push(`Driver changed (${oldD} -> ${newD})`);
      }
      if (initialData.assetId !== values.assetId) {
        const oldA = assets.find(a => a.id === initialData.assetId)?.identifier || "None";
        const newA = assets.find(a => a.id === values.assetId)?.identifier || "None";
        changes.push(`Truck changed (${oldA} -> ${newA})`);
      }

      compare('lineHaul', 'Line Haul');
      compare('ownerPercentage', 'Split');
      compare('fuelSurcharge', 'Fuel Surcharge');
      compare('accessorials', 'Accessorials');
      compare('loading', 'Loading');
      compare('unloading', 'Unloading');

      if (changes.length > 0) {
        hasChanges = true;
        changeLog = "Updates: " + changes.join(", ");
      }

      // Deep check expenses
      const oldExpenses = initialData.expenses || [];
      const newExpenses = processedExpenses;
      const expenseChanges: string[] = [];

      // Check for removed
      oldExpenses.forEach(oldExp => {
        if (!newExpenses.find(ne => ne.id === oldExp.id)) {
          expenseChanges.push(`Removed ${oldExp.category} ($${oldExp.amount})`);
        }
      });

      // Check for added or modified
      newExpenses.forEach(newExp => {
        const oldExp = oldExpenses.find(oe => oe.id === newExp.id);
        if (!oldExp) {
          expenseChanges.push(`Added ${newExp.category} ($${newExp.amount})`);
        } else {
          // Modified?
          if (oldExp.amount !== newExp.amount) {
            expenseChanges.push(`${newExp.category} adjusted ($${oldExp.amount} -> $${newExp.amount})`);
          } else if (oldExp.category !== newExp.category) {
            expenseChanges.push(`Expense category changed (${oldExp.category} -> ${newExp.category})`);
          } else if (oldExp.description !== newExp.description) {
            expenseChanges.push(`${newExp.category} desc updated`);
          }
        }
      });

      if (expenseChanges.length > 0) {
        hasChanges = true;
        if (changeLog === "Load updated." || changeLog === "Load created.") {
          changeLog = "Expenses: " + expenseChanges.join(", ");
        } else {
          changeLog += "; Expenses: " + expenseChanges.join(", ");
        }
      }
    }

    // Enforce Comment on Update
    // Check if a manual comment was added in this session OR is currently in the input
    // We can infer "added in this session" by checking if values.comments has more items than initialData.comments
    const initialCommentCount = initialData?.comments?.length || 0;
    const currentCommentCount = values.comments?.length || 0;
    const hasAddedComment = currentCommentCount > initialCommentCount;

    if (initialData && hasChanges && !hasAddedComment && !newComment.trim()) {
      alert("You must add a comment explaining your changes before saving.");
      return; // Block submission
    }

    // Capture the pending comment if user typed but didn't click Add
    let finalComments = [...(values.comments || [])];
    if (newComment.trim()) {
      const manualComment: z.infer<typeof commentSchema> = {
        id: Math.random().toString(36).substr(2, 9),
        text: newComment,
        author: "User",
        timestamp: new Date().toISOString(),
        type: 'manual'
      };
      finalComments.unshift(manualComment); // Add to top
      setNewComment("");
    }

    // Add system log
    const systemLog: z.infer<typeof commentSchema> = {
      id: Math.random().toString(36).substr(2, 9),
      text: changeLog,
      author: "System",
      timestamp: new Date().toISOString(),
      type: 'system'
    };
    finalComments.unshift(systemLog);

    onSubmit({
      ...values,
      expenses: processedExpenses,
      comments: finalComments,
      revenue: (values.lineHaul || 0) + (values.fuelSurcharge || 0) + (values.accessorials || 0) + (values.loading || 0) + (values.unloading || 0), // Full gross revenue
      totalExpenses,
      netProfit, // Adjusted net profit (your take-home)
      ownerAmount,
      driverName: drivers.find(d => d.id === values.driverId)?.name,
      assetName: assets.find(a => a.id === values.assetId)?.identifier,
      id: initialData?.id
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          <FormField
            control={form.control}
            name="freightId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Freight ID</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., #12345" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Load Date</FormLabel>
                <FormControl>
                  <DatePicker date={field.value} onDateChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="driverId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Driver</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a driver" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {drivers.map(driver => (
                      <SelectItem key={driver.id} value={driver.id}>{driver.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="assetId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asset (Truck)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a truck" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {assets.map(asset => (
                      <SelectItem key={asset.id} value={asset.id}>{asset.identifier}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-6 items-start">
          <FormField
            control={form.control}
            name="origin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Origin</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Dallas, TX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="destination"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Miami, FL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-6 items-start">
          <FormField
            control={form.control}
            name="distance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Distance (miles)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (lbs)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
              <FormField
                control={form.control}
                name="fuelSurcharge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuel Surcharge</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="$" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="accessorials"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Accessorials</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="$" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
              <FormField
                control={form.control}
                name="loading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loading</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="$" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unloading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unloading</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="$" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
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
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 items-start p-2 border rounded-md">
                <FormField
                  control={form.control}
                  name={`expenses.${index}.category`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {expenseCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`expenses.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`expenses.${index}.amount`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Amount</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="$" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="mt-1">
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <span className="sr-only">Remove Expense</span>
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ category: "Other", description: "", amount: 0 })}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Comments & Signature Log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Add a comment or note..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addComment(); } }}
                />
              </div>
              <Button type="button" variant="secondary" onClick={addComment}>Ad Note</Button>
            </div>

            <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2">
              {comments.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No activity logged.</p>}
              {comments.map((comment) => (
                <div key={comment.id} className="flex flex-col gap-1 p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary">{comment.author}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(comment.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-white/80">{comment.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          {initialData && onDelete && (
            <Button
              type="button"
              variant="destructive"
              className="flex-1"
              onClick={() => onDelete(initialData.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Load
            </Button>
          )}
          <Button type="submit" className={initialData && onDelete ? "flex-[2]" : "w-full"}>
            {initialData ? "Save Changes" : "Add Load"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
