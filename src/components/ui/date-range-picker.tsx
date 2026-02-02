"use client"

import * as React from "react"
import { Calendar as CalendarIcon, ArrowRight } from "lucide-react"
import { format, subDays, subMonths, startOfMonth, startOfQuarter } from "date-fns"
import { type DateRange } from "react-day-picker"

import { cn, parseFlexibleDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
}

export function DateRangePicker({
  className,
  date,
  onDateChange
}: DateRangePickerProps) {
  const [internalRange, setInternalRange] = React.useState<DateRange | undefined>(date);
  const [isOpen, setIsOpen] = React.useState(false);

  const [fromText, setFromText] = React.useState("");
  const [toText, setToText] = React.useState("");

  const isEditingFrom = React.useRef(false);
  const isEditingTo = React.useRef(false);

  // Sync internal range when dialog opens or prop changes
  React.useEffect(() => {
    if (isOpen) {
      setInternalRange(date);
      setFromText(date?.from ? format(date.from, "MM/dd/yyyy") : "");
      setToText(date?.to ? format(date.to, "MM/dd/yyyy") : "");
    }
  }, [isOpen, date]);

  // Sync text inputs when internalRange changes (e.g. from Calendar pick)
  React.useEffect(() => {
    if (!isEditingFrom.current) {
      setFromText(internalRange?.from ? format(internalRange.from, "MM/dd/yyyy") : "");
    }
    if (!isEditingTo.current) {
      setToText(internalRange?.to ? format(internalRange.to, "MM/dd/yyyy") : "");
    }
  }, [internalRange]);

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFromText(val);
    const parsed = parseFlexibleDate(val);
    if (parsed) {
      setInternalRange(prev => ({ from: parsed, to: prev?.to }));
    }
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setToText(val);
    const parsed = parseFlexibleDate(val);
    if (parsed) {
      setInternalRange(prev => ({ from: prev?.from, to: parsed }));
    }
  };

  const handleBlurFrom = () => {
    isEditingFrom.current = false;
    if (internalRange?.from) {
      setFromText(format(internalRange.from, "MM/dd/yyyy"));
    }
  };

  const handleBlurTo = () => {
    isEditingTo.current = false;
    if (internalRange?.to) {
      setToText(format(internalRange.to, "MM/dd/yyyy"));
    }
  };

  const presets = [
    { label: 'Last 30 days', range: { from: subDays(new Date(), 30), to: new Date() } },
    { label: 'Last 2 months', range: { from: subMonths(new Date(), 2), to: new Date() } },
    { label: 'Last 3 months', range: { from: subMonths(new Date(), 3), to: new Date() } },
    { label: 'Last 12 months', range: { from: subMonths(new Date(), 12), to: new Date() } },
    { label: 'Month to date', range: { from: startOfMonth(new Date()), to: new Date() } },
    { label: 'Quarter to date', range: { from: startOfQuarter(new Date()), to: new Date() } },
  ];

  const handleApply = () => {
    onDateChange(internalRange);
    setIsOpen(false);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal glass-card border-white/10 hover:border-primary/50 transition-all h-10",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "MM/dd/yyyy")} - {format(date.to, "MM/dd/yyyy")}
                </>
              ) : (
                format(date.from, "MM/dd/yyyy")
              )
            ) : (
              <span>Select Date Range</span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-none w-auto p-0 border-white/10 bg-[#0B0E14] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden scale-110">
          <div className="flex divide-x divide-white/5">
            {/* Sidebar */}
            <div className="w-[180px] p-4 flex flex-col gap-1 bg-[#0F1219]">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setInternalRange(p.range)}
                  className={cn(
                    "text-left px-3 py-2.5 text-[13px] rounded-md transition-colors",
                    (internalRange?.from?.getTime() === p.range.from.getTime() && internalRange?.to?.getTime() === p.range.to.getTime())
                      ? "text-white bg-white/10 font-medium"
                      : "text-white/40 hover:text-white/60 hover:bg-white/5"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Calendars */}
            <div className="p-8">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={internalRange?.from || new Date()}
                selected={internalRange}
                onSelect={setInternalRange}
                numberOfMonths={2}
              />

              {/* Footer Actions */}
              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="bg-white/5 border border-white/10 rounded-md px-4 py-2 text-[13px] text-white/90 font-mono w-[120px] text-center border-white/40 focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/20"
                    placeholder="MM/DD/YYYY"
                    value={fromText}
                    onChange={handleFromChange}
                    onFocus={() => isEditingFrom.current = true}
                    onBlur={handleBlurFrom}
                  />
                  <ArrowRight className="h-4 w-4 text-white/20" />
                  <input
                    type="text"
                    className="bg-white/5 border border-white/10 rounded-md px-4 py-2 text-[13px] text-white/90 font-mono w-[120px] text-center border-white/40 focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/20"
                    placeholder="MM/DD/YYYY"
                    value={toText}
                    onChange={handleToChange}
                    onFocus={() => isEditingTo.current = true}
                    onBlur={handleBlurTo}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10 px-6 h-10 text-[13px] font-medium"
                    onClick={() => setInternalRange(undefined)}
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
                    Apply dates
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
