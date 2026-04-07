import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

const Calendar = React.forwardRef<
  HTMLDivElement,
  CalendarProps
>(({ className, classNames, showOutsideDays = true, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border dark:border-white/10",
      className
    )}
  >
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("w-full", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-slate-900 dark:text-white",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-8 w-8 bg-muted/50 hover:bg-muted dark:hover:bg-white/10 rounded-lg inline-flex items-center justify-center hover:scale-110 transition-all duration-200"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-slate-400 dark:text-slate-500 rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          "h-9 w-9 p-0 font-normal text-slate-900 dark:text-slate-300 aria-selected:opacity-100 hover:scale-110 transition-all duration-200 rounded-lg hover:bg-primary/10"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-lg shadow-md",
        day_today: "bg-slate-100 dark:bg-white/10 text-primary dark:text-white font-bold",
        day_outside:
          "day-outside text-slate-300 dark:text-slate-600 opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-slate-200 dark:text-slate-700 opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  </div>
));
Calendar.displayName = "Calendar";

export { Calendar };
