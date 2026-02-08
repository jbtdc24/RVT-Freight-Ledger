"use client";

import { useState, useMemo } from 'react';
import { useData } from "@/lib/data-context";
import { useActivity, ActivityItem } from "@/hooks/use-activity";
import { ArrowRight, DollarSign, Wrench, MessageSquare, Trash2, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from '@/components/page-header';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";

export default function ActivityPage() {
    const { freight, expenses } = useData();
    const allActivity = useActivity(freight, expenses);

    // State for Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<'all' | 'revenue' | 'expense' | 'update' | 'deletion'>('all');
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

    // State for Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Filter Logic
    const filteredActivity = useMemo(() => {
        return allActivity.filter(item => {
            // 1. Search Term
            const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());

            // 2. Type Filter
            const matchesType = typeFilter === 'all' || item.type === typeFilter;

            // 3. Date Range
            let matchesDate = true;
            if (dateRange?.from) {
                if (dateRange.to) {
                    const start = startOfDay(dateRange.from);
                    const end = endOfDay(dateRange.to);
                    matchesDate = isWithinInterval(item.date, { start, end });
                } else {
                    // Single date selection treated as that day
                    const start = startOfDay(dateRange.from);
                    const end = endOfDay(dateRange.from);
                    matchesDate = isWithinInterval(item.date, { start, end });
                }
            }

            return matchesSearch && matchesType && matchesDate;
        });
    }, [allActivity, searchTerm, typeFilter, dateRange]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredActivity.length / itemsPerPage);
    const paginatedActivity = filteredActivity.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getIcon = (type: ActivityItem['iconType']) => {
        switch (type) {
            case 'revenue': return <DollarSign className="h-4 w-4" />;
            case 'expense': return <Wrench className="h-4 w-4" />;
            case 'message': return <MessageSquare className="h-4 w-4" />;
            case 'delete': return <Trash2 className="h-4 w-4" />;
            default: return <DollarSign className="h-4 w-4" />;
        }
    };

    return (
        <>
            <PageHeader title="Activity Log">
                <p className="text-muted-foreground">A complete history of all changes, updates, and financial events.</p>
            </PageHeader>

            <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search activity..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    <Select value={typeFilter} onValueChange={(v: any) => { setTypeFilter(v); setCurrentPage(1); }}>
                        <SelectTrigger className="w-[180px]">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                <SelectValue placeholder="Filter by Type" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="revenue">Revenue</SelectItem>
                            <SelectItem value="expense">Expenses</SelectItem>
                            <SelectItem value="update">Updates/Notes</SelectItem>
                            <SelectItem value="deletion">Deletions</SelectItem>
                        </SelectContent>
                    </Select>
                    <DateRangePicker
                        date={dateRange}
                        onDateChange={(d) => { setDateRange(d); setCurrentPage(1); }}
                    />
                </div>
            </div>

            <Card className="glass-card">
                <CardContent className="pt-6">
                    <div className="space-y-6">
                        {paginatedActivity.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">No activity found matching your filters.</div>
                        ) : (
                            paginatedActivity.map((item) => (
                                <div key={item.id} className="flex items-start gap-4 group hover:bg-white/5 p-3 rounded-xl transition-colors">
                                    <div className={cn(
                                        "mt-1 w-10 h-10 rounded-full flex items-center justify-center border transition-colors shrink-0",
                                        item.color === 'success' && "bg-success/10 border-success/20 text-success group-hover:bg-success/20",
                                        item.color === 'destructive' && "bg-destructive/10 border-destructive/20 text-destructive group-hover:bg-destructive/20",
                                        item.color === 'warning' && "bg-warning/10 border-warning/20 text-warning group-hover:bg-warning/20",
                                        item.color === 'info' && "bg-blue-500/10 border-blue-500/20 text-blue-500 group-hover:bg-blue-500/20",
                                        item.color === 'muted' && "bg-muted/10 border-muted/20 text-muted-foreground group-hover:bg-muted/20"
                                    )}>
                                        {getIcon(item.iconType)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <Link href={item.link || '#'} className={cn(
                                                "text-sm font-medium text-foreground truncate hover:text-primary transition-colors",
                                                !item.link && "pointer-events-none hover:text-foreground"
                                            )}>
                                                {item.title}
                                            </Link>
                                            <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                                                {format(item.date, "MMM d, yyyy h:mm a")}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                                                    {item.status}
                                                </Badge>
                                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal uppercase tracking-wider text-muted-foreground">
                                                    {item.type}
                                                </Badge>
                                            </div>
                                            {item.amount !== 0 && (
                                                <span className={cn(
                                                    "text-sm font-bold font-mono",
                                                    item.amount > 0 ? "text-success" : "text-destructive"
                                                )}>
                                                    {item.amount > 0 ? "+" : ""}{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.amount)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8 pt-4 border-t border-white/5">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => setCurrentPage(page)}
                                        className={cn("w-8 h-8", currentPage === page && "pointer-events-none")}
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
