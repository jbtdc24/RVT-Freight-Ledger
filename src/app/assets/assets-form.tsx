import { useState } from "react";
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
import { Trash2, Upload, MessageSquare, X, Calendar as CalendarIcon, Maximize2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import type { Asset, LoadComment } from "@/lib/types";

const assetTypes = ['Truck', 'Business Car'] as const;

const commentSchema = z.object({
  id: z.string(),
  text: z.string(),
  author: z.string(),
  timestamp: z.string(),
  date: z.string().optional(),
  type: z.enum(['manual', 'system']),
});

const formSchema = z.object({
  type: z.enum(assetTypes),
  identifier: z.string().min(3, "Identifier must be at least 3 characters."),
  description: z.string().optional(),
  idImages: z.array(z.string()).optional().default([]),
  comments: z.array(commentSchema).optional().default([]),
});

type AssetFormValues = z.infer<typeof formSchema>;

type AssetFormProps = {
  onSubmit: (values: AssetFormValues & { id?: string }) => void;
  onDelete?: (id: string) => void;
  initialData?: Asset | null;
};

export function AssetForm({ onSubmit, initialData, onDelete }: AssetFormProps) {
  const [newComment, setNewComment] = useState("");
  const [commentDate, setCommentDate] = useState<Date | undefined>(new Date());
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: initialData?.type || "Truck",
      identifier: initialData?.identifier || "",
      description: initialData?.description || "",
      idImages: initialData?.idImages || [],
      comments: initialData?.comments || [],
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const currentImages = form.getValues("idImages") || [];
          form.setValue("idImages", [...currentImages, reader.result as string], { shouldDirty: true });
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    const currentImages = form.getValues("idImages") || [];
    form.setValue("idImages", currentImages.filter((_, i) => i !== index), { shouldDirty: true });
  };

  const addComment = () => {
    if (!newComment.trim()) return;

    const comment: LoadComment = {
      id: Math.random().toString(36).substr(2, 9),
      text: newComment,
      author: "User",
      timestamp: new Date().toISOString(),
      date: commentDate ? commentDate.toISOString() : undefined,
      type: 'manual'
    };

    const currentComments = form.getValues("comments") || [];
    form.setValue("comments", [comment, ...currentComments], { shouldDirty: true });
    setNewComment("");
  };

  const handleFormSubmit = (values: AssetFormValues) => {
    let finalComments = [...(values.comments || [])];

    if (!initialData) {
      finalComments.unshift({
        id: Math.random().toString(36).substr(2, 9),
        text: `${values.type} asset created`,
        author: "System",
        timestamp: new Date().toISOString(),
        type: 'system'
      });
    }

    onSubmit({ ...values, comments: finalComments, id: initialData?.id });
  };

  const watchedIdImages = form.watch("idImages") || [];
  const comments = form.watch("comments") || [];

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
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
                      <Textarea placeholder="e.g., 2022 Volvo VNL 760" className="min-h-[80px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Asset Images Upload */}
              <div className="space-y-2">
                <FormLabel>Asset Images ({watchedIdImages.length})</FormLabel>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {watchedIdImages.map((img, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-muted aspect-video bg-muted/20">
                      <img src={img} alt={`Asset Image ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white hover:bg-white/20"
                          onClick={() => setSelectedImage(img)}
                        >
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white bg-destructive/80 hover:bg-destructive"
                          onClick={() => removeImage(idx)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-muted rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center justify-center py-2">
                      <Upload className="w-6 h-6 mb-1 text-muted-foreground" />
                      <p className="text-[10px] text-muted-foreground font-medium">Add Image</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                  </label>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="space-y-4">
              <FormLabel>Asset Records & Comments</FormLabel>
              <Card className="shadow-none border-muted/40">
                <CardContent className="p-3 space-y-3">
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    {comments.length === 0 && (
                      <div className="text-center py-8 opacity-20">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-xs font-bold uppercase tracking-widest">No records yet</p>
                      </div>
                    )}
                    {comments.map((comment) => (
                      <div key={comment.id} className={cn(
                        "p-2.5 rounded-lg text-xs border transition-all",
                        comment.type === 'system'
                          ? "bg-muted/30 border-muted/50 text-muted-foreground opacity-70"
                          : "bg-background border-border shadow-sm"
                      )}>
                        <div className="flex items-center justify-between mb-1 opacity-50">
                          <div className="flex flex-col">
                            <span className="font-black text-[10px] uppercase tracking-tighter">{comment.author}</span>
                            {comment.date && (
                              <span className="text-[9px] font-bold text-primary">Event: {format(new Date(comment.date), "MMM d, yyyy")}</span>
                            )}
                          </div>
                          <span className="text-[9px] font-medium">{format(new Date(comment.timestamp), "MMM d, h:mm a")}</span>
                        </div>
                        <p className="leading-relaxed font-medium">{comment.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 mt-2 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <DatePicker date={commentDate} onDateChange={setCommentDate} />
                      </div>
                    </div>
                    <div className="relative group">
                      <Textarea
                        placeholder="Add a comment to asset record..."
                        className="min-h-[80px] pr-12 text-sm resize-none"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute bottom-2 right-2 h-8 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 px-3 transition-all"
                        onClick={addComment}
                      >
                        Post
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            {initialData && onDelete && (
              <Button
                type="button"
                variant="destructive"
                className="flex-1 h-11"
                onClick={() => {
                  if (confirm("Are you sure you want to PERMANENTLY delete this asset? This action cannot be undone.")) {
                    onDelete(initialData.id);
                  }
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Asset
              </Button>
            )}
            <Button type="submit" className={initialData && onDelete ? "flex-[2] h-11" : "w-full h-11"}>
              {initialData ? 'Save Changes' : 'Add Asset'}
            </Button>
          </div>
        </form>
      </Form>

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-transparent shadow-none">
          <div className="relative w-full h-full flex items-center justify-center">
            <img src={selectedImage || ''} alt="Enlarged" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/80 rounded-full"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
