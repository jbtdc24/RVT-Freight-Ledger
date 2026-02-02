"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
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
      className={cn("p-0 font-sans", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 relative", // Add relative here
        month: "space-y-4",
        month_caption: "flex justify-center relative items-center mb-1", // Slightly reduced margin
        caption_label: "hidden",
        caption_dropdowns: "flex justify-center gap-1 z-20 mx-8", // Add horizontal margin to make space for arrows
        nav: "flex items-center absolute w-full justify-between z-10 px-1", // Absolute nav spanning full width
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 bg-transparent p-0 text-white opacity-50 hover:opacity-100 flex items-center justify-center rounded-full hover:bg-white/5"
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 bg-transparent p-0 text-white opacity-50 hover:opacity-100 flex items-center justify-center rounded-full hover:bg-white/5"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex mb-4",
        weekday: "text-white/40 w-10 font-bold text-[0.75rem] uppercase text-center",
        week: "flex w-full mt-1",
        day: cn(
          "h-10 w-10 p-0 font-medium transition-all rounded-md flex items-center justify-center relative hover:bg-white/5 cursor-pointer aria-selected:opacity-100"
        ),
        day_button: "h-full w-full",
        range_start: "bg-[#7EE1AD] text-black font-bold rounded-l-md hover:bg-[#7EE1AD] hover:text-black shadow-[0_0_20px_rgba(126,225,173,0.3)]",
        range_end: "bg-[#7EE1AD] text-black font-bold rounded-r-md hover:bg-[#7EE1AD] hover:text-black shadow-[0_0_20px_rgba(126,225,173,0.3)]",
        range_middle: "bg-white/10 text-white rounded-none hover:bg-white/20",
        selected: "bg-[#7EE1AD] text-black font-bold rounded-md hover:bg-[#7EE1AD] hover:text-black shadow-[0_0_20px_rgba(126,225,173,0.4)]",
        today: "text-[#7EE1AD] font-black underline decoration-2 underline-offset-4",
        outside: "text-white/10 opacity-50",
        disabled: "text-white/10 opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ ...props }) => {
          if (props.orientation === 'left') return <ChevronLeft className="h-5 w-5" />
          return <ChevronRight className="h-5 w-5" />
        },
        Dropdown: ({ value, onChange, options, ...props }) => {
          const selected = options?.find((option) => String(option.value) === String(value));
          const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            const changeEvent = {
              target: { value: e.target.value },
            } as React.ChangeEvent<HTMLSelectElement>;
            onChange?.(changeEvent);
          };
          return (
            <div className="relative inline-flex items-center cursor-pointer hover:bg-white/5 rounded-md">
              <select
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 appearance-none"
                value={value}
                onChange={handleChange}
              >
                {options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white uppercase tracking-wider pointer-events-none">
                {selected?.label || value}
                <ChevronDown className="h-3 w-3 text-white/40" />
              </div>
            </div>
          );
        },
      }}
      captionLayout="dropdown"
      fromYear={2020}
      toYear={2030}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
