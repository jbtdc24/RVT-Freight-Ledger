"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"

interface DatePickerProps {
    date: Date | undefined;
    onDateChange: (date: Date | undefined) => void;
    className?: string;
    placeholder?: string;
}

export function DatePicker({ date, onDateChange, className, placeholder = "Pick a date" }: DatePickerProps) {
    const [internalDate, setInternalDate] = React.useState<Date | undefined>(date);
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
        if (isOpen) {
            setInternalDate(date);
        }
    }, [isOpen, date]);

    const handleApply = () => {
        onDateChange(internalDate);
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal glass-card border-white/10 hover:border-primary/50 transition-all h-10",
                        !date && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                    {date ? format(date, "dd/MM/yyyy") : <span>{placeholder}</span>}
                </Button>
            </DialogTrigger>
            <DialogContent className="w-auto p-0 border-white/10 bg-[#0B0E14] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden scale-110" sideOffset={0}>
                <div className="p-8">
                    <Calendar
                        mode="single"
                        selected={internalDate}
                        onSelect={setInternalDate}
                        initialFocus
                    />

                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between gap-8">
                        <div className="bg-white/5 border border-white/10 rounded-md px-4 py-2 text-[13px] text-white/60 font-mono w-[140px] text-center border-white/40">
                            {internalDate ? format(internalDate, "dd/MM/yyyy") : "DD/MM/YYYY"}
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                className="text-destructive hover:bg-destructive/10 px-6 h-10 text-[13px] font-medium"
                                onClick={() => setInternalDate(undefined)}
                            >
                                Clear
                            </Button>
                            <Button
                                variant="ghost"
                                className="text-white/40 hover:text-white hover:bg-white/5 px-6 h-10 text-[13px] font-medium"
                                onClick={() => setIsOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-[#7EE1AD] hover:bg-[#6CD09C] text-black font-bold h-10 px-8 rounded-md text-[13px]"
                                onClick={handleApply}
                            >
                                Apply
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
