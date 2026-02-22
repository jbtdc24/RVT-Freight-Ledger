"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn, parseFlexibleDate } from "@/lib/utils"
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

    const [dateText, setDateText] = React.useState("");
    const isEditing = React.useRef(false);

    React.useEffect(() => {
        if (isOpen) {
            setInternalDate(date);
            setDateText(date ? format(date, "MM/dd/yyyy") : "");
        }
    }, [isOpen, date]);

    React.useEffect(() => {
        if (!isEditing.current) {
            setDateText(internalDate ? format(internalDate, "MM/dd/yyyy") : "");
        }
    }, [internalDate]);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setDateText(val);
        const parsed = parseFlexibleDate(val);
        if (parsed) {
            setInternalDate(parsed);
        }
    };

    const handleBlur = () => {
        isEditing.current = false;
        if (internalDate) {
            setDateText(format(internalDate, "MM/dd/yyyy"));
        }
    };

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
                        "w-full justify-start text-left font-normal border-input hover:border-primary/50 transition-all h-10 bg-background hover:bg-accent hover:text-accent-foreground",
                        !date && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                    {date ? format(date, "MM/dd/yyyy") : <span>{placeholder}</span>}
                </Button>
            </DialogTrigger>
            <DialogContent className="w-auto p-0 border-border bg-popover rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden scale-110">
                <div className="p-8">
                    <Calendar
                        mode="single"
                        selected={internalDate}
                        onSelect={setInternalDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                        classNames={{
                            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                            day_today: "bg-accent text-accent-foreground",
                            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground"
                        }}
                    />

                    <div className="mt-8 pt-6 border-t border-border flex items-center justify-between gap-8">
                        <input
                            type="text"
                            className="bg-background border border-input rounded-md px-4 py-2 text-[13px] text-foreground font-mono w-[140px] text-center focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground"
                            placeholder="MM/DD/YYYY"
                            value={dateText}
                            onChange={handleTextChange}
                            onFocus={() => isEditing.current = true}
                            onBlur={handleBlur}
                        />
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
                                className="text-muted-foreground hover:text-foreground hover:bg-muted px-6 h-10 text-[13px] font-medium"
                                onClick={() => setIsOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 px-8 rounded-md text-[13px]"
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
