import * as React from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DateTimePickerProps {
    date?: Date
    setDate: (date: Date | undefined) => void
    disabled?: boolean
}

export function DateTimePicker({
                                   date,
                                   setDate,
                                   disabled
                               }: DateTimePickerProps) {
    const [selectedDateTime, setSelectedDateTime] = React.useState<Date | undefined>(date)
    const [timeValue, setTimeValue] = React.useState<string>("")

    React.useEffect(() => {
        if (date) {
            setSelectedDateTime(date)
            setTimeValue(format(date, "HH:mm"))
        }
    }, [date])

    const handleDateSelect = (newDate: Date | undefined) => {
        if (newDate) {
            const [hours, minutes] = timeValue.split(":").map(Number)
            newDate.setHours(hours || 0, minutes || 0)
            setSelectedDateTime(newDate)
            setDate(newDate)
        } else {
            setSelectedDateTime(undefined)
            setDate(undefined)
        }
    }

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = e.target.value
        setTimeValue(time)

        if (selectedDateTime) {
            const [hours, minutes] = time.split(":").map(Number)
            const newDate = new Date(selectedDateTime)
            newDate.setHours(hours || 0, minutes || 0)
            setSelectedDateTime(newDate)
            setDate(newDate)
        }
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDateTime && "text-muted-foreground"
                    )}
                    disabled={disabled}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDateTime ? (
                        format(selectedDateTime, "dd.MM.yyyy HH:mm", { locale: ru })
                    ) : (
                        <span>Выберите дату и время</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={selectedDateTime}
                    onSelect={handleDateSelect}
                    initialFocus
                    locale={ru}
                />
                <div className="p-3 border-t">
                    <Label htmlFor="time">Время</Label>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Input
                            id="time"
                            type="time"
                            value={timeValue}
                            onChange={handleTimeChange}
                            className="w-full"
                        />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}