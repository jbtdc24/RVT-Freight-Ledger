"use client";

import { useState } from "react";
import { PlusCircle, Pencil } from "lucide-react";
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
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { initialAssets } from "@/lib/data";
import type { Asset } from "@/lib/types";
import { AssetForm } from "./assets-form";
import { Badge } from "@/components/ui/badge";

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const handleSaveAsset = (assetData: Omit<Asset, 'id'> & { id?: string }) => {
    if (assetData.id) {
        setAssets(prev => prev.map(a => a.id === assetData.id ? ({ ...a, ...assetData } as Asset) : a));
    } else {
        const newAsset = { ...assetData, id: `ast-${Date.now()}` };
        setAssets(prev => [newAsset, ...prev]);
    }
    setIsDialogOpen(false);
    setEditingAsset(null);
  };

  const handleOpenDialog = (asset: Asset | null) => {
    setEditingAsset(asset);
    setIsDialogOpen(true);
  }
  
  return (
    <>
      <PageHeader title="Asset Management">
        <Button onClick={() => handleOpenDialog(null)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Manual Entry
        </Button>
      </PageHeader>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setEditingAsset(null);
        }
        setIsDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingAsset ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
            <DialogDescription>
              {editingAsset ? 'Edit the details for the asset.' : 'Enter the details for the new business asset.'}
            </DialogDescription>
          </DialogHeader>
          <AssetForm onSubmit={handleSaveAsset} initialData={editingAsset} />
        </DialogContent>
      </Dialog>
      
      <Card>
        <Table>
          {!assets.length && <TableCaption>No assets added yet.</TableCaption>}
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Identifier</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                    <Badge variant="outline">{item.type}</Badge>
                </TableCell>
                <TableCell className="font-medium">{item.identifier}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)} className="h-8 w-8">
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
