"use client";

import { useData } from "@/lib/data-context";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Trash2, Truck, Users, Box, DollarSign, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

import { initialFreight, initialAssets, initialDrivers, initialExpenses } from "@/lib/data";

export default function RecycleBinPage() {
    const {
        freight, assets, drivers, expenses,
        setFreight, setAssets, setDrivers, setExpenses,
        restoreItem, permanentlyDeleteItem,
        restoreLoadExpense, permanentlyDeleteLoadExpense
    } = useData();

    const handleResetData = () => {
        if (window.confirm("This will delete all current data and reset to demo records. Continue?")) {
            localStorage.removeItem('rvt_freight_v7');
            localStorage.removeItem('rvt_assets_v7');
            localStorage.removeItem('rvt_drivers_v7');
            localStorage.removeItem('rvt_expenses_v4');
            setFreight(initialFreight);
            setAssets(initialAssets);
            setDrivers(initialDrivers);
            setExpenses(initialExpenses);
            window.location.reload();
        }
    };

    const deletedFreight = freight.filter(f => f.isDeleted);
    const deletedAssets = assets.filter(a => a.isDeleted);
    const deletedDrivers = drivers.filter(d => d.isDeleted);
    const deletedBusinessExpenses = (expenses || []).filter(e => e.isDeleted);
    const deletedLoadExpenses = freight
        .filter(f => !f.isDeleted)
        .flatMap(f =>
            (f.expenses || [])
                .filter(e => e.isDeleted)
                .map(e => ({ ...e, parentLoadId: f.id, parentLoadNumber: f.freightId }))
        );

    const formatCurrency = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

    return (
        <div className="space-y-8">
            <PageHeader title="Recycle Bin">
                <Button variant="outline" size="sm" onClick={handleResetData} className="text-muted-foreground hover:text-destructive">
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Reset to Demo Data
                </Button>
            </PageHeader>

            {/* Deleted Loads */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-primary" />
                        <CardTitle>Deleted Loads</CardTitle>
                    </div>
                    <Badge variant="outline">{deletedFreight.length} items</Badge>
                </CardHeader>
                <CardContent>
                    {deletedFreight.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">No deleted loads.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Freight ID</TableHead>
                                    <TableHead>Deleted At</TableHead>
                                    <TableHead>Route</TableHead>
                                    <TableHead className="text-right">Revenue</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {deletedFreight.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.freightId}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {item.deletedAt ? format(new Date(item.deletedAt), 'MMM d, p') : 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-sm">{item.origin} → {item.destination}</TableCell>
                                        <TableCell className="text-right font-medium">{formatCurrency(item.revenue)}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => restoreItem('freight', item.id)}>
                                                <RefreshCcw className="mr-2 h-4 w-4" />
                                                Restore
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => {
                                                if (window.confirm("PERMANENTLY erase this Load? This cannot be undone.")) {
                                                    permanentlyDeleteItem('freight', item.id);
                                                }
                                            }}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Deleted Assets */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Box className="h-5 w-5 text-primary" />
                        <CardTitle>Deleted Assets</CardTitle>
                    </div>
                    <Badge variant="outline">{deletedAssets.length} items</Badge>
                </CardHeader>
                <CardContent>
                    {deletedAssets.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">No deleted assets.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Identifier</TableHead>
                                    <TableHead>Deleted At</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {deletedAssets.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.identifier}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {item.deletedAt ? format(new Date(item.deletedAt), 'MMM d, p') : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{item.type}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => restoreItem('asset', item.id)}>
                                                <RefreshCcw className="mr-2 h-4 w-4" />
                                                Restore
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => {
                                                if (window.confirm("PERMANENTLY erase this Asset? This cannot be undone.")) {
                                                    permanentlyDeleteItem('asset', item.id);
                                                }
                                            }}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Deleted Drivers */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        <CardTitle>Deleted Drivers</CardTitle>
                    </div>
                    <Badge variant="outline">{deletedDrivers.length} items</Badge>
                </CardHeader>
                <CardContent>
                    {deletedDrivers.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">No deleted drivers.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Deleted At</TableHead>
                                    <TableHead>Pay Info</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {deletedDrivers.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {item.deletedAt ? format(new Date(item.deletedAt), 'MMM d, p') : 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {item.payType === 'per-mile' ? `$${item.payRate}/mile` : `${item.payRate}% of rev`}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => restoreItem('driver', item.id)}>
                                                <RefreshCcw className="mr-2 h-4 w-4" />
                                                Restore
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => {
                                                if (window.confirm("PERMANENTLY erase this Driver? This cannot be undone.")) {
                                                    permanentlyDeleteItem('driver', item.id);
                                                }
                                            }}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Deleted Business Expenses */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <CardTitle>Deleted Business Expenses</CardTitle>
                    </div>
                    <Badge variant="outline">{deletedBusinessExpenses.length} items</Badge>
                </CardHeader>
                <CardContent>
                    {deletedBusinessExpenses.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">No deleted business expenses.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Deleted At</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {deletedBusinessExpenses.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium text-xs">{item.category}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {item.deletedAt ? format(new Date(item.deletedAt), 'MMM d, p') : 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-sm">{item.description}</TableCell>
                                        <TableCell className="text-right font-medium text-destructive">-{formatCurrency(item.amount)}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => restoreItem('expense', item.id)}>
                                                <RefreshCcw className="mr-2 h-4 w-4" />
                                                Restore
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => {
                                                if (window.confirm("PERMANENTLY erase this Business Expense? This cannot be undone.")) {
                                                    permanentlyDeleteItem('expense', item.id);
                                                }
                                            }}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Deleted Load Expenses */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <CardTitle>Deleted Load Expenses</CardTitle>
                    </div>
                    <Badge variant="outline">{deletedLoadExpenses.length} items</Badge>
                </CardHeader>
                <CardContent>
                    {deletedLoadExpenses.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">No deleted load expenses.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Load #</TableHead>
                                    <TableHead>Deleted At</TableHead>
                                    <TableHead>Category / Desc</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {deletedLoadExpenses.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-bold text-xs text-primary">{item.parentLoadNumber}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {item.deletedAt ? format(new Date(item.deletedAt), 'MMM d, p') : 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            <span className="font-medium text-xs uppercase text-muted-foreground mr-2">{item.category}:</span>
                                            {item.description}
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-destructive">-{formatCurrency(item.amount)}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => restoreLoadExpense(item.parentLoadId, item.id)}>
                                                <RefreshCcw className="mr-2 h-4 w-4" />
                                                Restore
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => {
                                                if (window.confirm("PERMANENTLY erase this Load Expense? This cannot be undone.")) {
                                                    permanentlyDeleteLoadExpense(item.parentLoadId, item.id);
                                                }
                                            }}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
