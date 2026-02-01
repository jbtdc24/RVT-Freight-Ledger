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
import { initialDrivers } from "@/lib/data";
import type { Driver } from "@/lib/types";
import { DriverForm } from "./drivers-form";
import { Badge } from "@/components/ui/badge";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  const handleSaveDriver = (driverData: Omit<Driver, 'id'> & { id?: string }) => {
    if (driverData.id) {
        setDrivers(prev => prev.map(d => d.id === driverData.id ? ({ ...d, ...driverData } as Driver) : d));
    } else {
        const newDriver = { ...driverData, id: `drv-${Date.now()}` };
        setDrivers(prev => [newDriver, ...prev]);
    }
    setIsDialogOpen(false);
    setEditingDriver(null);
  };

  const handleOpenDialog = (driver: Driver | null) => {
    setEditingDriver(driver);
    setIsDialogOpen(true);
  }

  const formatPayRate = (driver: Driver) => {
    if (driver.payType === 'per-mile') {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(driver.payRate) + '/mile';
    }
    return `${driver.payRate}% of revenue`;
  }
  
  return (
    <>
      <PageHeader title="Drivers">
        <Button onClick={() => handleOpenDialog(null)}>
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
          <DriverForm onSubmit={handleSaveDriver} initialData={editingDriver} />
        </DialogContent>
      </Dialog>
      
      <Card>
        <Table>
          {!drivers.length && <TableCaption>No drivers added yet.</TableCaption>}
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Pay Type</TableHead>
              <TableHead>Pay Rate</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.map((item) => (
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
