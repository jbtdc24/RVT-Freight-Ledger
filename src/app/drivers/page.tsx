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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingDriver ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
            <DialogDescription>
              {editingDriver ? 'Edit the driver details.' : 'Enter the details for the new driver.'}
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
              <TableHead>Pay Type</TableHead>
              <TableHead>Pay Rate</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeDrivers.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{item.payType}</Badge>
                </TableCell>
                <TableCell>{formatPayRate(item)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)} className="h-8 w-8">
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
