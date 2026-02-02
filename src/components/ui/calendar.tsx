"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-6 bg-black text-white rounded-xl shadow-2xl", className)}
      classNames={{
        months: "flex flex-col md:flex-row space-y-8 md:space-x-12 md:space-y-0",
        month: "space-y-6",
        caption: "flex flex-col items-start gap-1 relative mb-4",
        caption_label: "text-lg font-black tracking-tighter uppercase font-mono",
        caption_dropdowns: "flex justify-center gap-1",
        nav: "flex items-center gap-2 mb-4",
        nav_button: cn(
          "h-8 w-8 bg-transparent p-0 text-white/40 hover:text-white transition-all transform hover:scale-110"
        ),
        nav_button_previous: "absolute -left-10 top-20 z-10",
        nav_button_next: "absolute -left-10 top-28 z-10",
        table: "w-full border-collapse",
        head_row: "flex mb-4",
        head_cell: "text-white/30 rounded-md w-11 font-bold text-[0.7rem] uppercase tracking-widest text-center",
        row: "flex w-full mt-1",
        cell: "h-11 w-11 text-center text-sm p-0 relative transition-all duration-200",
        day: cn(
          "h-11 w-11 p-0 font-medium hover:text-primary transition-all rounded-none flex items-center justify-center relative group"
        ),
        day_selected: "bg-white !text-black font-black z-10 hover:bg-white hover:text-black",
        day_today: "after:content-[''] after:absolute after:bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full font-bold",
        day_outside: "text-white/10 opacity-50",
        day_disabled: "text-white/10 opacity-50",
        day_range_middle: "bg-white/10 !text-white rounded-none",
        day_range_start: "rounded-l-none bg-white !text-black font-black",
        day_range_end: "rounded-r-none bg-white !text-black font-black",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ ...props }) => {
          if (props.orientation === 'left') return <ChevronLeft className="h-5 w-5" />
          return <ChevronRight className="h-5 w-5" />
        }
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
