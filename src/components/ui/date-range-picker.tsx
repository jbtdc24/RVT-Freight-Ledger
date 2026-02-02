"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { format, subDays, startOfToday, startOfYesterday } from "date-fns"
import { type DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
}

export function DateRangePicker({
  className,
  date,
  onDateChange
}: DateRangePickerProps) {

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal glass-card border-white/10 hover:border-primary/50 transition-colors",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-white/10 glass-card" align="start">
          <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-white/5">
            <div className="p-3 flex flex-col gap-2 min-w-[140px] bg-muted/20">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 mb-1">Quick Select</p>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => onDateChange({ from: startOfToday(), to: startOfToday() })}
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => onDateChange({ from: startOfYesterday(), to: startOfYesterday() })}
              >
                Yesterday
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => onDateChange({ from: subDays(new Date(), 7), to: new Date() })}
              >
                Last 7 Days
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => onDateChange({ from: subDays(new Date(), 30), to: new Date() })}
              >
                Last 30 Days
              </Button>
              <div className="mt-auto pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-[10px] uppercase font-bold tracking-wider text-destructive hover:bg-destructive/10"
                  onClick={() => onDateChange(undefined)}
                >
                  Clear Range
                </Button>
              </div>
            </div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={onDateChange}
              numberOfMonths={2}
              className="bg-background/95 backdrop-blur-xl"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
