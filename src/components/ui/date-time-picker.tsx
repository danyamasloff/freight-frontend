"use client";

import * as React from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { motion } from "framer-motion";
import { CalendarIcon, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateTimePickerProps {
	value?: string;
	onChange?: (value: string) => void;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
}

export function DateTimePicker({
	value,
	onChange,
	placeholder = "Выберите дату и время",
	className,
	disabled = false,
}: DateTimePickerProps) {
	const [isOpen, setIsOpen] = React.useState(false);
	const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(() => {
		return value ? new Date(value) : undefined;
	});
	const [timeValue, setTimeValue] = React.useState(() => {
		if (value) {
			const date = new Date(value);
			return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
		}
		return "09:00";
	});

	React.useEffect(() => {
		if (value) {
			const date = new Date(value);
			setSelectedDate(date);
			setTimeValue(
				`${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
			);
		}
	}, [value]);

	const handleDateSelect = (date: Date | undefined) => {
		if (date) {
			setSelectedDate(date);
			// Сохраняем текущее время при изменении даты
			const [hours, minutes] = timeValue.split(":").map(Number);
			const newDateTime = new Date(date);
			newDateTime.setHours(hours, minutes, 0, 0);

			onChange?.(newDateTime.toISOString().slice(0, 16));
		}
	};

	const handleTimeChange = (newTime: string) => {
		setTimeValue(newTime);
		if (selectedDate) {
			const [hours, minutes] = newTime.split(":").map(Number);
			const newDateTime = new Date(selectedDate);
			newDateTime.setHours(hours, minutes, 0, 0);

			onChange?.(newDateTime.toISOString().slice(0, 16));
		}
	};

	const formattedValue = selectedDate
		? `${format(selectedDate, "d MMMM yyyy", { locale: ru })}, ${timeValue}`
		: undefined;

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					disabled={disabled}
					className={cn(
						"w-full justify-start text-left font-normal border-orange-200 focus:border-orange-500 focus:ring-orange-500 hover:border-orange-300 transition-all duration-200",
						!selectedDate && "text-muted-foreground",
						"group relative overflow-hidden",
						className
					)}
				>
					<motion.div
						className="flex items-center gap-3 w-full"
						whileHover={{ scale: 1.01 }}
						transition={{ duration: 0.2 }}
					>
						<div className="p-1 rounded bg-orange-100 dark:bg-orange-500/20 group-hover:bg-orange-200 dark:group-hover:bg-orange-500/30 transition-colors">
							<CalendarIcon className="h-4 w-4 text-orange-500" />
						</div>
						<div className="flex-1 text-left">
							{formattedValue ? (
								<span className="text-foreground font-medium">
									{formattedValue}
								</span>
							) : (
								<span className="text-muted-foreground">{placeholder}</span>
							)}
						</div>
					</motion.div>

					{/* Decorative gradient */}
					<div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-auto p-0 shadow-xl border-orange-200 dark:border-orange-500/30"
				align="start"
			>
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -10 }}
					transition={{ duration: 0.2 }}
					className="bg-white dark:bg-slate-900"
				>
					<div className="p-4 border-b border-orange-100 dark:border-orange-500/20 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/10">
						<div className="flex items-center gap-2">
							<CalendarIcon className="h-4 w-4 text-orange-500" />
							<span className="font-medium text-orange-900 dark:text-orange-100">
								Выбор даты и времени
							</span>
						</div>
					</div>

					<Calendar
						mode="single"
						selected={selectedDate}
						onSelect={handleDateSelect}
						initialFocus
						className="border-0"
						locale={ru}
					/>

					<div className="p-4 border-t border-orange-100 dark:border-orange-500/20 bg-gradient-to-r from-orange-50/50 to-amber-50/50 dark:from-orange-500/5 dark:to-amber-500/5">
						<div className="space-y-2">
							<Label className="text-sm font-medium flex items-center gap-2 text-orange-900 dark:text-orange-100">
								<Clock className="h-3 w-3" />
								Время
							</Label>
							<Input
								type="time"
								value={timeValue}
								onChange={(e) => handleTimeChange(e.target.value)}
								className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
							/>
						</div>

						<div className="flex gap-2 mt-4">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setIsOpen(false)}
								className="flex-1 border-orange-200 text-orange-700 hover:bg-orange-50"
							>
								Отмена
							</Button>
							<Button
								size="sm"
								onClick={() => setIsOpen(false)}
								className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
								disabled={!selectedDate}
							>
								Выбрать
							</Button>
						</div>
					</div>
				</motion.div>
			</PopoverContent>
		</Popover>
	);
}
