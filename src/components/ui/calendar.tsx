"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    startOfWeek,
    endOfWeek,
} from "date-fns"
import { ptBR } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = {
    mode?: "single" | "range" | "default" | "multiple"
    selected?: Date
    onSelect?: (date: Date | undefined) => void
    className?: string
    classNames?: any
    showOutsideDays?: boolean
    bookedDays?: Date[]
    [key: string]: any
}

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    mode = "single",
    selected,
    onSelect,
    bookedDays = [],
    ...props
}: CalendarProps) {
    const [currentMonth, setCurrentMonth] = React.useState(new Date())

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    })

    const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"]

    const handleDateClick = (day: Date) => {
        if (onSelect) {
            onSelect(day)
        }
    }

    return (
        <div className={cn("p-3", className)}>
            <div className="flex items-center justify-between space-y-4 mb-4">
                <div className="space-y-1">
                    <h4 className="text-sm font-medium capitalize">
                        {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                    </h4>
                </div>
                <div className="flex items-center space-x-1">
                    <button
                        type="button"
                        onClick={prevMonth}
                        className={cn(
                            buttonVariants({ variant: "outline" }),
                            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                        )}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={nextMonth}
                        className={cn(
                            buttonVariants({ variant: "outline" }),
                            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                        )}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day, i) => (
                    <div
                        key={i}
                        className="text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] flex justify-center items-center h-9"
                    >
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 w-full">
                {calendarDays.map((day, dayIdx) => {
                    const isSelected = selected ? isSameDay(day, selected) : false
                    const isToday = isSameDay(day, new Date())
                    const isOutside = !isSameMonth(day, monthStart)
                    const isBooked = bookedDays.some(bookedDay => isSameDay(day, bookedDay))

                    if (isOutside && !showOutsideDays) return <div key={day.toString()} />

                    return (
                        <button
                            type="button"
                            key={day.toString()}
                            onClick={() => handleDateClick(day)}
                            className={cn(
                                buttonVariants({ variant: "ghost" }),
                                "h-9 w-9 p-0 font-normal aria-selected:opacity-100 flex flex-col justify-center items-center rounded-md relative",
                                isOutside && "text-muted-foreground opacity-50",
                                isSelected && (classNames?.day_selected || "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground"),
                                !isSelected && isToday && (classNames?.day_today || "bg-accent text-accent-foreground")
                            )}
                        >
                            <time dateTime={format(day, "yyyy-MM-dd")}>
                                {format(day, "d")}
                            </time>
                            {isBooked && (
                                <div className={cn(
                                    "absolute bottom-1 h-1 w-1 rounded-full",
                                    isSelected ? "bg-black" : "bg-yellow-500"
                                )} />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
