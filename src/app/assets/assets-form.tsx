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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Asset } from "@/lib/types";

const assetTypes = ['Truck', 'Business Car'] as const;

const formSchema = z.object({
  type: z.enum(assetTypes),
  identifier: z.string().min(3, "Identifier must be at least 3 characters."),
  description: z.string().optional(),
});

type AssetFormValues = z.infer<typeof formSchema>;

type AssetFormProps = {
  onSubmit: (values: AssetFormValues & { id?: string }) => void;
  initialData?: Asset | null;
};

export function AssetForm({ onSubmit, initialData }: AssetFormProps) {
  const form = useForm<AssetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      type: "Truck",
      identifier: "",
      description: "",
    },
  });

  const handleFormSubmit = (values: AssetFormValues) => {
    onSubmit({ ...values, id: initialData?.id });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asset Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an asset type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {assetTypes.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Identifier</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Unit 101 or License Plate" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., 2022 Volvo VNL 760" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">{initialData ? 'Save Changes' : 'Add Asset'}</Button>
      </form>
    </Form>
  );
}
