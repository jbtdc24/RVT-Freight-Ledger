"use client";

import { useState } from "react";
import { PlusCircle, Pencil, MessageSquare, Image as ImageIcon, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
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
import type { Asset } from "@/lib/types";
import { AssetForm } from "./assets-form";
import { Badge } from "@/components/ui/badge";

export default function AssetsPage() {
  const { assets, setAssets, deleteItem } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const handleOpenDialog = (asset?: Asset) => {
    setEditingAsset(asset || null);
    setIsDialogOpen(true);
  };

  const handleSaveAsset = (values: any) => {
    if (editingAsset) {
      setAssets(prev => prev.map(a => a.id === editingAsset.id ? { ...a, ...values } : a));
    } else {
      const newAsset = { ...values, id: Math.random().toString(36).substr(2, 9) };
      setAssets(prev => [newAsset, ...prev]);
    }
    setIsDialogOpen(false);
    setEditingAsset(null);
  };

  const handleDeleteAsset = (id: string) => {
    deleteItem('asset', id);
    setIsDialogOpen(false);
    setEditingAsset(null);
  };

  const activeAssets = assets;

  return (
    <>
      <PageHeader title="Assets & Equipment">
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Asset
        </Button>
      </PageHeader>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setEditingAsset(null);
        }
        setIsDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{editingAsset ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
            <DialogDescription>
              {editingAsset ? 'Update asset details, images and records.' : 'Enter the details for the new business asset.'}
            </DialogDescription>
          </DialogHeader>
          <AssetForm onSubmit={handleSaveAsset} onDelete={handleDeleteAsset} initialData={editingAsset} />
        </DialogContent>
      </Dialog>

      <Card>
        <Table>
          {!activeAssets.length && <TableCaption>No assets added yet.</TableCaption>}
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Images</TableHead>
              <TableHead>Records</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeAssets.map((item) => (
              <TableRow
                key={item.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors group"
                onClick={() => handleOpenDialog(item)}
              >
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-foreground">{item.identifier}</span>
                    <span className="text-xs text-muted-foreground line-clamp-1">{item.description}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest">{item.type}</Badge>
                </TableCell>
                <TableCell>
                  {item.idImages && item.idImages.length > 0 ? (
                    <div className="flex items-center gap-2 text-success">
                      <div className="flex -space-x-4 overflow-hidden">
                        {item.idImages.slice(0, 3).map((img, idx) => (
                          <div key={idx} className="inline-block h-8 w-12 rounded bg-background border-2 border-background overflow-hidden shadow-sm">
                            <img src={img} alt="Asset" className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {item.idImages.length > 3 && (
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted border-2 border-background text-[10px] font-black">
                            +{item.idImages.length - 3}
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className="text-success border-success/20 bg-success/5 gap-1">
                        <FileCheck className="h-3 w-3" /> {item.idImages.length}
                      </Badge>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground/30">
                      <ImageIcon className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">No Photos</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                    <MessageSquare className="h-3.5 w-3.5 text-primary" />
                    <span className="text-sm font-bold">{(item.comments?.length || 0)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                    onClick={(e) => { e.stopPropagation(); handleOpenDialog(item); }}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit Asset</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
