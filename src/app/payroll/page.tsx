"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useData } from '@/lib/data-context';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function PayrollPage() {
    const { drivers, freight } = useData();
    const activeDrivers = useMemo(() => drivers.filter(d => !d.isDeleted), [drivers]);
    const activeFreight = useMemo(() => freight.filter(f => !f.isDeleted), [freight]);

    const [selectedDriverId, setSelectedDriverId] = useState<string | undefined>(undefined);
    const [selectedLoadIds, setSelectedLoadIds] = useState<string[]>([]);
    const [calculatedPay, setCalculatedPay] = useState<number | null>(null);

    const selectedDriver = useMemo(() => activeDrivers.find(d => d.id === selectedDriverId), [activeDrivers, selectedDriverId]);

    const driverLoads = useMemo(() => {
        if (!selectedDriverId) return [];
        return activeFreight.filter(f => f.driverId === selectedDriverId);
    }, [activeFreight, selectedDriverId]);

    const handleSelectLoad = (loadId: string) => {
        setCalculatedPay(null);
        setSelectedLoadIds(prev =>
            prev.includes(loadId) ? prev.filter(id => id !== loadId) : [...prev, loadId]
        );
    };

    const calculatePay = () => {
        if (!selectedDriver) return;

        const loadsToPay = driverLoads.filter(load => selectedLoadIds.includes(load.id));
        let totalPay = 0;

        if (selectedDriver.payType === 'per-mile') {
            const totalDistance = loadsToPay.reduce((sum, load) => sum + load.distance, 0);
            totalPay = totalDistance * selectedDriver.payRate;
        } else if (selectedDriver.payType === 'percentage') {
            const totalRevenue = loadsToPay.reduce((sum, load) => sum + load.revenue, 0);
            totalPay = totalRevenue * (selectedDriver.payRate / 100);
        }

        setCalculatedPay(totalPay);
    };

    const formatCurrency = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

    return (
        <>
            <PageHeader title="Payroll Calculator" />
            <div className="grid gap-6 md:grid-cols-2 items-start">
                <Card>
                    <CardHeader>
                        <CardTitle>Calculate Driver Pay</CardTitle>
                        <CardDescription>Select a driver and the loads to include in the payroll calculation.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Select Driver</label>
                            <Select onValueChange={(val) => { setSelectedDriverId(val); setSelectedLoadIds([]); setCalculatedPay(null); }} value={selectedDriverId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a driver" />
                                </SelectTrigger>
                                <SelectContent>
                                    {activeDrivers.map(driver => (
                                        <SelectItem key={driver.id} value={driver.id}>{driver.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {selectedDriver && (
                            <p className="text-sm text-muted-foreground pt-2">
                                Pay Rate: {selectedDriver.payType === 'per-mile' ? `${formatCurrency(selectedDriver.payRate)}/mile` : `${selectedDriver.payRate}% of revenue`}
                            </p>
                        )}

                    </CardContent>
                    <CardFooter className="flex-col items-start gap-4">
                        <Button onClick={calculatePay} disabled={!selectedDriver || selectedLoadIds.length === 0} className="w-full">
                            Calculate Pay
                        </Button>
                        {calculatedPay !== null && (
                            <div className="text-2xl font-bold font-headline text-center w-full pt-4">
                                Total Pay: <span className="text-primary">{formatCurrency(calculatedPay)}</span>
                            </div>
                        )}
                    </CardFooter>
                </Card>

                <Card className="overflow-hidden">
                    <CardHeader>
                        <CardTitle>Completed Loads</CardTitle>
                        <CardDescription>
                            {selectedDriver ? `Showing loads for ${selectedDriver.name}. Select loads to calculate pay.` : 'Select a driver to see their loads.'}
                        </CardDescription>
                    </CardHeader>
                    <ScrollArea className="h-[400px]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Load</TableHead>
                                    <TableHead className="text-right">Revenue</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {driverLoads.length > 0 ? driverLoads.map(load => (
                                    <TableRow key={load.id}>
                                        <TableCell>
                                            <Checkbox
                                                id={`load-${load.id}`}
                                                checked={selectedLoadIds.includes(load.id)}
                                                onCheckedChange={() => handleSelectLoad(load.id)}
                                                aria-label={`Select load ${load.freightId}`}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <label htmlFor={`load-${load.id}`} className="block">{load.date.toLocaleDateString()}</label>
                                        </TableCell>
                                        <TableCell>
                                            <label htmlFor={`load-${load.id}`} className="block font-medium">{load.freightId}</label>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <label htmlFor={`load-${load.id}`} className="block">{formatCurrency(load.revenue)}</label>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            {selectedDriver ? 'No loads found for this driver.' : 'Please select a driver.'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </Card>
            </div>
        </>
    );
}
