"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { format, subDays, subMonths, startOfToday, startOfYesterday, getDaysInMonth, startOfMonth, startOfQuarter } from "date-fns"
import { type DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
}

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]

export function DateRangePicker({
  className,
  date,
  onDateChange
}: DateRangePickerProps) {
  const [activeTab, setActiveTab] = React.useState<'from' | 'to'>('from');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  const fromDate = date?.from || new Date();
  const toDate = date?.to || new Date();

  const updatePart = (part: 'from' | 'to', newMonth: number, newDay: number, newYear: number) => {
    const d = new Date(newYear, newMonth, 1);
    const maxDays = getDaysInMonth(d);
    const finalDay = Math.min(newDay, maxDays);
    const newDateObj = new Date(newYear, newMonth, finalDay);

    if (part === 'from') {
      onDateChange({ from: newDateObj, to: date?.to });
    } else {
      onDateChange({ from: date?.from, to: newDateObj });
    }
  };

  const getActiveData = () => {
    const d = activeTab === 'from' ? fromDate : toDate;
    return {
      month: d.getMonth(),
      day: d.getDate(),
      year: d.getFullYear(),
      daysInMonth: getDaysInMonth(d)
    };
  };

  const active = getActiveData();

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal glass-card border-white/10 hover:border-primary/50 transition-all",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "MMM dd, yyyy")} - {format(date.to, "MMM dd, yyyy")}
                </>
              ) : (
                format(date.from, "MMM dd, yyyy")
              )
            ) : (
              <span>Select Date Range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[420px] p-0 border-white/10 bg-black/90 backdrop-blur-2xl rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.8)]" align="start" sideOffset={12}>
          <div className="flex flex-col md:flex-row divide-x divide-white/5">
            {/* Sidebar Shortcuts */}
            <div className="w-[160px] p-4 flex flex-col gap-1 bg-white/5">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 px-3 mb-2">Preset Filters</p>
              {[
                { label: 'Last 30 days', range: { from: subDays(new Date(), 30), to: new Date() } },
                { label: 'Last 2 months', range: { from: subMonths(new Date(), 2), to: new Date() } },
                { label: 'Last 3 months', range: { from: subMonths(new Date(), 3), to: new Date() } },
                { label: 'Last 12 months', range: { from: subMonths(new Date(), 12), to: new Date() } },
                { label: 'Month to date', range: { from: startOfMonth(new Date()), to: new Date() } },
                { label: 'Quarter to date', range: { from: startOfQuarter(new Date()), to: new Date() } },
              ].map((btn) => (
                <Button
                  key={btn.label}
                  variant="ghost"
                  size="sm"
                  className="justify-start text-[11px] font-medium text-white/40 hover:text-white hover:bg-white/5 transition-all py-1 h-8"
                  onClick={() => onDateChange(btn.range)}
                >
                  {btn.label}
                </Button>
              ))}
            </div>

            {/* Main Selection Area */}
            <div className="flex-1 flex flex-col">
              <div className="flex p-3 bg-white/5 border-b border-white/5 gap-2">
                <button
                  onClick={() => setActiveTab('from')}
                  className={cn(
                    "flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === 'from' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]" : "text-white/40 hover:text-white/60 hover:bg-white/5"
                  )}
                >
                  From: {format(fromDate, "MMM dd")}
                </button>
                <button
                  onClick={() => setActiveTab('to')}
                  className={cn(
                    "flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === 'to' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]" : "text-white/40 hover:text-white/60 hover:bg-white/5"
                  )}
                >
                  To: {format(toDate, "MMM dd")}
                </button>
              </div>

              <div className="flex h-[260px] relative">
                <div className="absolute top-1/2 left-0 w-full h-12 -translate-y-1/2 bg-primary/5 pointer-events-none border-y border-primary/10" />

                {/* Month */}
                <div className="flex-1 border-r border-white/5">
                  <ScrollArea className="h-full">
                    <div className="py-[110px] px-2 flex flex-col gap-1">
                      {months.map((m, i) => (
                        <button
                          key={m}
                          onClick={() => updatePart(activeTab, i, active.day, active.year)}
                          className={cn(
                            "w-full py-3 text-xs font-black transition-all rounded-xl",
                            active.month === i ? "text-primary scale-125 translate-x-1" : "text-white/20 hover:text-white/40"
                          )}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Day */}
                <div className="w-16 border-r border-white/5">
                  <ScrollArea className="h-full">
                    <div className="py-[110px] px-2 flex flex-col gap-1">
                      {Array.from({ length: active.daysInMonth }, (_, i) => i + 1).map((d) => (
                        <button
                          key={d}
                          onClick={() => updatePart(activeTab, active.month, d, active.year)}
                          className={cn(
                            "w-full py-3 text-xs font-black transition-all rounded-xl",
                            active.day === d ? "text-primary scale-125" : "text-white/20 hover:text-white/40"
                          )}
                        >
                          {d.toString().padStart(2, '0')}
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Year */}
                <div className="w-20">
                  <ScrollArea className="h-full">
                    <div className="py-[110px] px-2 flex flex-col gap-1">
                      {years.map((y) => (
                        <button
                          key={y}
                          onClick={() => updatePart(activeTab, active.month, active.day, y)}
                          className={cn(
                            "w-full py-3 text-xs font-black transition-all rounded-xl",
                            active.year === y ? "text-primary scale-125 -translate-x-1" : "text-white/20 hover:text-white/40"
                          )}
                        >
                          {y}
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              <div className="p-3 bg-white/5 border-t border-white/5 flex gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 h-10 rounded-2xl"
                  onClick={() => onDateChange(undefined)}
                >
                  Reset Range
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
