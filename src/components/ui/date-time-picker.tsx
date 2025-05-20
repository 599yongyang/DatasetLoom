'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zhCN } from 'date-fns/locale';

interface DateTimePickerProps {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
    fromDate?: Date;
    toDate?: Date;
}

export function DateTimePicker({
    date,
    setDate,
    className,
    placeholder = 'Pick a date and time',
    disabled = false,
    fromDate,
    toDate
}: DateTimePickerProps) {
    const [open, setOpen] = React.useState(false);

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (!selectedDate) return;

        // Keep the time part if it exists, otherwise set to current time
        const newDate = new Date(selectedDate);
        if (date) {
            date = new Date(date);
            newDate.setHours(date.getHours());
            newDate.setMinutes(date.getMinutes());
            newDate.setSeconds(0);
            newDate.setMilliseconds(0);
        }
        setDate(newDate);
    };

    const handleTimeChange = (timeValue: string) => {
        if (!date) return;

        const [hours, minutes] = timeValue.split(':').map(Number);
        const newDate = new Date(date);
        newDate.setHours(hours ?? 0, minutes);
        newDate.setSeconds(0);
        newDate.setMilliseconds(0);
        setDate(newDate);
    };

    const formatTime = (date: Date) => {
        return format(date, 'HH:mm');
    };

    // Generate time options
    const timeOptions = React.useMemo(() => {
        const times = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                times.push(timeString);
            }
        }
        return times;
    }, []);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        'w-full justify-start text-left font-normal',
                        !date && 'text-muted-foreground',
                        className
                    )}
                    disabled={disabled}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'yyyy-MM-dd HH:mm') : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        locale={zhCN}
                        // disabled={disabled}
                        fromDate={fromDate}
                        toDate={toDate}
                        initialFocus
                        disabled={[
                            { before: new Date() } // Dates before today
                        ]}
                    />
                </div>
                <div className="border-t border-border p-3">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Select
                            value={date ? formatTime(date) : undefined}
                            onValueChange={handleTimeChange}
                            disabled={!date}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent className="h-[200px]">
                                {timeOptions.map(time => (
                                    <SelectItem key={time} value={time}>
                                        {time}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
