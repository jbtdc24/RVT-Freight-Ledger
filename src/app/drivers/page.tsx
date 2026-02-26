"use client";

import { useState } from "react";
import { PlusCircle, Pencil, FileCheck, MessageSquare, Image as ImageIcon, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
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
import type { Driver } from "@/lib/types";
import { DriverForm } from "./drivers-form";
import { Badge } from "@/components/ui/badge";

export default function DriversPage() {
  const { drivers, setDrivers, deleteItem } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  const handleOpenDialog = (driver?: Driver) => {
    setEditingDriver(driver || null);
    setIsDialogOpen(true);
  };

  const handleSaveDriver = (values: any) => {
    if (editingDriver) {
      setDrivers(prev => prev.map(d => d.id === editingDriver.id ? { ...d, ...values } : d));
    } else {
      const newDriver = { ...values, id: Math.random().toString(36).substr(2, 9) };
      setDrivers(prev => [newDriver, ...prev]);
    }
    setIsDialogOpen(false);
    setEditingDriver(null);
  };

  const handleDeleteDriver = (id: string) => {
    deleteItem('driver', id);
    setIsDialogOpen(false);
    setEditingDriver(null);
  };

  const activeDrivers = drivers;

  const formatPayRate = (driver: Driver) => {
    if (driver.payType === 'per-mile') {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(driver.payRate) + '/mile';
    }
    return `${driver.payRate}% of revenue`;
  }

  return (
    <>
      <PageHeader title="Drivers">
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Driver
        </Button>
      </PageHeader>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setEditingDriver(null);
        }
        setIsDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{editingDriver ? 'Edit Driver Profile' : 'Add New Driver'}</DialogTitle>
            <DialogDescription>
              {editingDriver ? 'Update identification and driver records.' : 'Create a new driver profile with ID and records.'}
            </DialogDescription>
          </DialogHeader>
          <DriverForm onSubmit={handleSaveDriver} onDelete={handleDeleteDriver} initialData={editingDriver} />
        </DialogContent>
      </Dialog>

      <Card>
        <Table>
          {!activeDrivers.length && <TableCaption>No drivers added yet.</TableCaption>}
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Pay Details</TableHead>
              <TableHead>Identification</TableHead>
              <TableHead>Records</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeDrivers.map((item) => (
              <TableRow
                key={item.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors group"
                onClick={() => handleOpenDialog(item)}
              >
                <TableCell className="font-semibold text-foreground">{item.name}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{formatPayRate(item)}</span>
                    <Badge variant="outline" className="w-fit text-[10px] uppercase font-black px-1.5 py-0">{item.payType}</Badge>
                  </div>
                </TableCell>
                <TableCell>
                  {item.idImages && item.idImages.length > 0 ? (
                    <div className="flex items-center gap-2 text-success">
                      <div className="flex -space-x-4 overflow-hidden">
                        {item.idImages.slice(0, 3).map((img, idx) => (
                          <div key={idx} className="inline-block h-8 w-12 rounded bg-background border-2 border-background overflow-hidden shadow-sm">
                            <img src={img} alt="ID" className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {item.idImages.length > 3 && (
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted border-2 border-background text-[10px] font-black">
                            +{item.idImages.length - 3}
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className="text-success border-success/20 bg-success/5 gap-1">
                        <FileCheck className="h-3 w-3" /> {item.idImages.length} Docs
                      </Badge>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground/50">
                      <div className="h-8 w-12 rounded bg-muted/10 border border-dashed border-muted-foreground/10 flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 opacity-20" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">Missing ID</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground/50" />
                    <span className="text-sm font-medium">{(item.comments?.length || 0)}</span>
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
                    <span className="sr-only">Edit Driver</span>
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
