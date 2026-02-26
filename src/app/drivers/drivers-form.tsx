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
import { Trash2, Upload, MessageSquare, X, Calendar as CalendarIcon, Maximize2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Driver, LoadComment } from "@/lib/types";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

const payTypes = ['per-mile', 'percentage'] as const;

const commentSchema = z.object({
  id: z.string(),
  text: z.string(),
  author: z.string(),
  timestamp: z.string(),
  date: z.string().optional(),
  type: z.enum(['manual', 'system']),
});

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  payType: z.enum(payTypes),
  payRate: z.coerce.number().positive("Pay rate must be a positive number."),
  idImages: z.array(z.string()).optional().default([]),
  comments: z.array(commentSchema).optional().default([]),
});

type DriverFormValues = z.infer<typeof formSchema>;

type DriverFormProps = {
  onSubmit: (values: DriverFormValues & { id?: string }) => void;
  onDelete?: (id: string) => void;
  initialData?: Driver | null;
};

export function DriverForm({ onSubmit, initialData, onDelete }: DriverFormProps) {
  const [newComment, setNewComment] = useState("");
  const [commentDate, setCommentDate] = useState<Date | undefined>(new Date());
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const form = useForm<DriverFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      payType: initialData?.payType || "per-mile",
      payRate: initialData?.payRate || 0,
      idImages: initialData?.idImages || [],
      comments: initialData?.comments || [],
    },
  });

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = await Promise.all(
        Array.from(files).map(file => compressImage(file))
      );
      const currentImages = form.getValues("idImages") || [];
      form.setValue("idImages", [...currentImages, ...newImages], { shouldDirty: true });
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

  const handleFormSubmit = (values: DriverFormValues) => {
    let finalComments = [...(values.comments || [])];

    if (!initialData) {
      finalComments.unshift({
        id: Math.random().toString(36).substr(2, 9),
        text: "Driver profile created",
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

              {/* Identification Upload */}
              <div className="space-y-2">
                <FormLabel>Identification Documents ({watchedIdImages.length})</FormLabel>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {watchedIdImages.map((img, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-muted aspect-video bg-muted/20">
                      <img src={img} alt={`Driver ID ${idx + 1}`} className="w-full h-full object-cover" />
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
              <FormLabel>Driver Records & Comments</FormLabel>
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
                        placeholder="Add a comment to driver record..."
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
                  if (confirm("Are you sure you want to PERMANENTLY delete this driver? This action cannot be undone.")) {
                    onDelete(initialData.id);
                  }
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Driver
              </Button>
            )}
            <Button type="submit" className={initialData && onDelete ? "flex-[2] h-11" : "w-full h-11"}>
              {initialData ? 'Save Changes' : 'Add Driver Profile'}
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
