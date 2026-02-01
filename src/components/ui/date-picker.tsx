"use client"

import * as React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface DatePickerProps {
    date: Date | undefined;
    onDateChange: (date: Date | undefined) => void;
    className?: string;
}

const months = [
    { value: 0, label: "January" }, { value: 1, label: "February" }, { value: 2, label: "March" },
    { value: 3, label: "April" }, { value: 4, label: "May" }, { value: 5, label: "June" },
    { value: 6, label: "July" }, { value: 7, label: "August" }, { value: 8, label: "September" },
    { value: 9, label: "October" }, { value: 10, label: "November" }, { value: 11, label: "December" },
]

export function DatePicker({ date, onDateChange, className }: DatePickerProps) {
    const [year, setYear] = React.useState<number | undefined>(date?.getFullYear());
    const [month, setMonth] = React.useState<number | undefined>(date?.getMonth());
    const [day, setDay] = React.useState<number | undefined>(date?.getDate());

    React.useEffect(() => {
        setYear(date?.getFullYear());
        setMonth(date?.getMonth());
        setDay(date?.getDate());
    }, [date]);

    const daysInMonth = (y?: number, m?: number) => (y !== undefined && m !== undefined) ? new Date(y, m + 1, 0).getDate() : 31;

    const handleDateChange = (newYear?: number, newMonth?: number, newDay?: number) => {
        const y = newYear ?? year;
        const m = newMonth ?? month;
        const d = newDay ?? day;

        if (y !== undefined && m !== undefined && d !== undefined) {
            const maxDays = daysInMonth(y, m);
            const correctedDay = Math.min(d, maxDays);
            if (d !== correctedDay) {
                setDay(correctedDay);
            }
            onDateChange(new Date(y, m, correctedDay));
        } else {
             onDateChange(undefined);
        }
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 151 }, (_, i) => currentYear - 75 + i);
    const numDays = daysInMonth(year, month);
    const days = Array.from({ length: numDays }, (_, i) => i + 1);

    return (
        <div className={cn("flex gap-2", className)}>
            <Select onValueChange={(m) => { const newMonth = parseInt(m, 10); setMonth(newMonth); handleDateChange(year, newMonth, day); }} value={month?.toString()}>
                <SelectTrigger>
                    <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                    {months.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select onValueChange={(d) => { const newDay = parseInt(d, 10); setDay(newDay); handleDateChange(year, month, newDay); }} value={day?.toString()}>
                <SelectTrigger>
                    <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent>
                    {days.map(d => <SelectItem key={d} value={d.toString()}>{d}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select onValueChange={(y) => { const newYear = parseInt(y, 10); setYear(newYear); handleDateChange(newYear, month, day); }} value={year?.toString()}>
                <SelectTrigger>
                    <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                    {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
    )
}