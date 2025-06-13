import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2 } from "lucide-react";
import { useAutocompletePlaceQuery, type GeoLocationDto } from "@/shared/api/geocodingSlice";
import { useDebounce } from "use-debounce";

interface GeocodingInputProps {
	label: string;
	value?: string;
	onChange?: (value: string, coordinates?: { lat: number; lon: number }) => void;
	error?: string;
	placeholder?: string;
}

export const GeocodingInput = React.forwardRef<HTMLInputElement, GeocodingInputProps>(
	({ label, value, onChange, error, placeholder, ...props }, ref) => {
		const [inputValue, setInputValue] = useState(value || "");
		const [isOpen, setIsOpen] = useState(false);
		const [debouncedValue] = useDebounce(inputValue, 300);
		const dropdownRef = useRef<HTMLDivElement>(null);

		const { data: suggestions, isLoading } = useAutocompletePlaceQuery(debouncedValue, {
			skip: debouncedValue.length < 3,
		});

		useEffect(() => {
			setInputValue(value || "");
		}, [value]);

		useEffect(() => {
			const handleClickOutside = (event: MouseEvent) => {
				if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
					setIsOpen(false);
				}
			};

			document.addEventListener("mousedown", handleClickOutside);
			return () => document.removeEventListener("mousedown", handleClickOutside);
		}, []);

		const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const newValue = e.target.value;
			setInputValue(newValue);
			onChange?.(newValue);
			setIsOpen(newValue.length >= 3);
		};

		const handleSuggestionSelect = (suggestion: GeoLocationDto) => {
			setInputValue(suggestion.name);
			onChange?.(suggestion.name, {
				lat: suggestion.latitude,
				lon: suggestion.longitude,
			});
			setIsOpen(false);
		};

		return (
			<div className="relative">
				<Label className="flex items-center gap-2 mb-2">
					<MapPin className="w-4 h-4 text-muted-foreground" />
					{label}
				</Label>

				<div className="relative">
					<Input
						ref={ref}
						value={inputValue}
						onChange={handleInputChange}
						placeholder={placeholder || `Введите ${label.toLowerCase()}`}
						className={`pl-10 ${error ? "border-destructive" : ""}`}
						{...props}
					/>

					<MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />

					{isLoading && (
						<Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
					)}
				</div>

				{error && <p className="text-sm text-destructive mt-1">{error}</p>}

				{isOpen && suggestions && suggestions.length > 0 && (
					<div
						ref={dropdownRef}
						className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto"
					>
						{suggestions.map((suggestion: GeoLocationDto, index: number) => (
							<div
								key={suggestion.id || index}
								onClick={() => handleSuggestionSelect(suggestion)}
								className="px-4 py-3 cursor-pointer hover:bg-accent hover:text-accent-foreground border-b border-border last:border-b-0 transition-colors"
							>
								<div className="flex items-start gap-3">
									<MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
									<div className="min-w-0 flex-1">
										<div className="font-medium text-sm line-clamp-1">
											{suggestion.name}
										</div>
										<div className="text-xs text-muted-foreground mt-1">
											{suggestion.description &&
												suggestion.description !== suggestion.name && (
													<div>{suggestion.description}</div>
												)}
											<div>
												{suggestion.latitude.toFixed(4)},{" "}
												{suggestion.longitude.toFixed(4)}
											</div>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		);
	}
);

GeocodingInput.displayName = "GeocodingInput";
