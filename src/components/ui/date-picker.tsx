"use client"

import * as React from "react"
import { format, setMonth as fnsSetMonth, setYear as fnsSetYear, setDate as fnsSetDate, getDaysInMonth } from "date-fns"
import { Calendar as CalendarIcon, ChevronUp, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DatePickerProps {
    date: Date | undefined;
    onDateChange: (date: Date | undefined) => void;
    className?: string;
    placeholder?: string;
}

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

export function DatePicker({ date, onDateChange, className, placeholder = "Pick a date" }: DatePickerProps) {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - 50 + i);

    const activeDate = date || new Date();
    const selectedMonth = activeDate.getMonth();
    const selectedYear = activeDate.getFullYear();
    const selectedDay = activeDate.getDate();

    const daysInMonth = getDaysInMonth(activeDate);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const updateDate = (newMonth: number, newDay: number, newYear: number) => {
        const d = new Date(newYear, newMonth, 1);
        const maxDays = getDaysInMonth(d);
        const finalDay = Math.min(newDay, maxDays);
        onDateChange(new Date(newYear, newMonth, finalDay));
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal glass-card border-white/10 hover:border-primary/50 transition-all active:scale-[0.98]",
                        !date && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                    {date ? format(date, "MMMM dd, yyyy") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0 border-white/10 bg-black/90 backdrop-blur-2xl rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden" align="start" sideOffset={12}>
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Select Date</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[9px] font-black uppercase tracking-tighter text-primary bg-primary/10 hover:bg-primary/20"
                        onClick={() => onDateChange(new Date())}
                    >
                        Today
                    </Button>
                </div>

                <div className="flex h-[240px] relative">
                    {/* Centered Selection Indicator */}
                    <div className="absolute top-1/2 left-0 w-full h-10 -translate-y-1/2 bg-primary/10 pointer-events-none border-y border-primary/20 z-0" />

                    {/* Month Picker */}
                    <div className="flex-1 flex flex-col relative z-10 border-r border-white/5">
                        <ScrollArea className="h-full">
                            <div className="py-[100px] px-2">
                                {months.map((m, i) => (
                                    <button
                                        key={m}
                                        onClick={() => updateDate(i, selectedDay, selectedYear)}
                                        className={cn(
                                            "w-full py-2 px-1 text-xs font-bold transition-all rounded-md text-center mb-1",
                                            selectedMonth === i
                                                ? "text-primary scale-110"
                                                : "text-white/40 hover:text-white/60"
                                        )}
                                    >
                                        {m.substring(0, 3)}
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Day Picker */}
                    <div className="w-16 flex flex-col relative z-10 border-r border-white/5">
                        <ScrollArea className="h-full">
                            <div className="py-[100px] px-2">
                                {days.map((d) => (
                                    <button
                                        key={d}
                                        onClick={() => updateDate(selectedMonth, d, selectedYear)}
                                        className={cn(
                                            "w-full py-2 text-xs font-bold transition-all rounded-md text-center mb-1",
                                            selectedDay === d
                                                ? "text-primary scale-110"
                                                : "text-white/40 hover:text-white/60"
                                        )}
                                    >
                                        {d.toString().padStart(2, '0')}
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Year Picker */}
                    <div className="w-20 flex flex-col relative z-10">
                        <ScrollArea className="h-full">
                            <div className="py-[100px] px-2">
                                {years.map((y) => (
                                    <button
                                        key={y}
                                        onClick={() => updateDate(selectedMonth, selectedDay, y)}
                                        className={cn(
                                            "w-full py-2 text-xs font-bold transition-all rounded-md text-center mb-1",
                                            selectedYear === y
                                                ? "text-primary scale-110"
                                                : "text-white/40 hover:text-white/60"
                                        )}
                                    >
                                        {y}
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>

                <div className="p-2 border-t border-white/5 bg-white/5 flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 h-8 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white"
                        onClick={() => onDateChange(undefined)}
                    >
                        Clear
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
