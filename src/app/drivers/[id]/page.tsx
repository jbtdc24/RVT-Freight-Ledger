"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/lib/data-context";
import { DriverForm } from "../drivers-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function DriverDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { drivers, setDrivers, deleteItem } = useData();

    const driver = drivers.find(d => d.id === id);

    if (!driver) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <h2 className="text-2xl font-bold text-muted-foreground">Driver not found</h2>
                <Button onClick={() => router.push('/drivers')}>Back to Drivers</Button>
            </div>
        );
    }

    const handleSaveDriver = (values: any) => {
        setDrivers(prev => prev.map(d => d.id === id ? { ...d, ...values } : d));
        router.push('/drivers');
    };

    const handleDeleteDriver = (id: string) => {
        deleteItem('driver', id);
        router.push('/drivers');
    };

    return (
        <div className="space-y-6">
            <PageHeader title={driver.name}>
                <Button variant="outline" size="sm" onClick={() => router.push('/drivers')}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to List
                </Button>
            </PageHeader>

            <Card className="p-6">
                <DriverForm
                    onSubmit={handleSaveDriver}
                    onDelete={handleDeleteDriver}
                    initialData={driver}
                />
            </Card>
        </div>
    );
}
