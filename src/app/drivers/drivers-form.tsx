"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Driver } from "@/lib/types";

const payTypes = ['per-mile', 'percentage'] as const;

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  payType: z.enum(payTypes),
  payRate: z.coerce.number().positive("Pay rate must be a positive number."),
});

type DriverFormValues = z.infer<typeof formSchema>;

type DriverFormProps = {
  onSubmit: (values: DriverFormValues & { id?: string }) => void;
  initialData?: Driver | null;
};

export function DriverForm({ onSubmit, initialData }: DriverFormProps) {
  const form = useForm<DriverFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      payType: "per-mile",
      payRate: 0,
    },
  });

  const handleFormSubmit = (values: DriverFormValues) => {
    onSubmit({ ...values, id: initialData?.id });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Driver Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="payType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Pay Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="per-mile" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Per Mile
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="percentage" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Percentage
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="payRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pay Rate ({form.watch('payType') === 'per-mile' ? '$/mile' : '% of revenue'})</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">{initialData ? 'Save Changes' : 'Add Driver'}</Button>
      </form>
    </Form>
  );
}
