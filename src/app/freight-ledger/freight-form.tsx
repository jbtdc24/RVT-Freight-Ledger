"use client";

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
import type { Freight, Driver } from "@/lib/types";
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

const formSchema = z.object({
  date: z.date({ required_error: "A date is required." }),
  freightId: z.string().min(2, "Freight ID must be at least 2 characters."),
  driverId: z.string().optional(),
  origin: z.string().min(2, "Origin is required."),
  destination: z.string().min(2, "Destination is required."),
  distance: z.coerce.number().positive("Distance must be a positive number."),
  weight: z.coerce.number().positive("Weight must be a positive number."),
  lineHaul: z.coerce.number().positive("Line Haul must be a positive number."),
  fuelSurcharge: z.coerce.number().min(0, "Fuel Surcharge cannot be negative."),
  loading: z.coerce.number().min(0, "Loading charge cannot be negative.").optional().default(0),
  unloading: z.coerce.number().min(0, "Unloading charge cannot be negative.").optional().default(0),
  accessorials: z.coerce.number().min(0, "Accessorials cannot be negative."),
  expenses: z.array(expenseSchema).optional(),
});

type FreightFormValues = z.infer<typeof formSchema>;

type FreightFormProps = {
  onSubmit: (values: Omit<Freight, "id"> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  initialData?: Freight | null;
  drivers: Driver[];
};

export function FreightForm({ onSubmit, onDelete, initialData, drivers }: FreightFormProps) {
  const form = useForm<FreightFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      date: new Date(initialData.date),
      expenses: initialData.expenses || [],
    } : {
      freightId: "",
      date: new Date(),
      origin: "",
      destination: "",
      distance: 0,
      weight: 0,
      driverId: undefined,
      lineHaul: 0,
      fuelSurcharge: 0,
      loading: 0,
      unloading: 0,
      accessorials: 0,
      expenses: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "expenses",
  });

  function handleFormSubmit(values: FreightFormValues) {
    const revenue = (values.lineHaul || 0) + (values.fuelSurcharge || 0) + (values.accessorials || 0) + (values.loading || 0) + (values.unloading || 0);
    const totalExpenses = (values.expenses || []).reduce((sum, exp) => sum + exp.amount, 0);
    const netProfit = revenue - totalExpenses;

    const processedExpenses = (values.expenses || []).map(exp => ({ ...exp, id: exp.id || `exp-${Date.now()}-${Math.random()}` }));
    const selectedDriver = drivers.find(d => d.id === values.driverId);

    onSubmit({
      ...values,
      expenses: processedExpenses,
      revenue,
      totalExpenses,
      netProfit,
      driverName: selectedDriver?.name,
      id: initialData?.id
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
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
                    {drivers.map(driver => <SelectItem key={driver.id} value={driver.id}>{driver.name}</SelectItem>)}
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
              <FormField
                control={form.control}
                name="lineHaul"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Line Haul</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="$" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
