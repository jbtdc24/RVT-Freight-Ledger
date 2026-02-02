"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
    date: Date | undefined;
    onDateChange: (date: Date | undefined) => void;
    className?: string;
    placeholder?: string;
}

export function DatePicker({ date, onDateChange, className, placeholder = "Pick a date" }: DatePickerProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal glass-card border-white/10 hover:border-primary/50 transition-colors",
                        !date && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                    {date ? format(date, "PPP") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-white/10 glass-card" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={onDateChange}
                    initialFocus
                    className="bg-background/95 backdrop-blur-xl"
                />
                <div className="p-3 border-t border-white/5 flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-[10px] uppercase font-bold tracking-wider hover:text-primary"
                        onClick={() => onDateChange(new Date())}
                    >
                        Today
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-[10px] uppercase font-bold tracking-wider hover:text-destructive"
                        onClick={() => onDateChange(undefined)}
                    >
                        Clear
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
