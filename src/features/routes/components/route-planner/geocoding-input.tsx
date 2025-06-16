// freight-frontend/src/features/routes/components/route-planner/geocoding-input.tsx

import React, { useState, useCallback, useRef, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSearchPlacesQuery } from "@/shared/api/geocodingSlice";
import { MapPin, Search, Navigation, X, Loader2, Building, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/shared/hooks/useDebounce";

interface Location {
	lat: number;
	lon: number;
	address: string;
	displayName?: string;
	type?: string;
	distance?: number;
	importance?: number;
	region?: string;
	country?: string;
}

interface GeocodingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	onLocationSelect: (location: Location) => void;
	initialCoordinates?: { lat: number; lon: number } | null;
	showCurrentLocationOption?: boolean;
}

export const GeocodingInput = forwardRef<HTMLInputElement, GeocodingInputProps>(
	(
		{
			onLocationSelect,
			initialCoordinates,
			showCurrentLocationOption = false,
			className,
			...props
		},
		ref
	) => {
		const [query, setQuery] = useState("");
		const [suggestions, setSuggestions] = useState<Location[]>([]);
		const [isOpen, setIsOpen] = useState(false);
		const [selectedIndex, setSelectedIndex] = useState(-1);
		const [isGettingLocation, setIsGettingLocation] = useState(false);
		const containerRef = useRef<HTMLDivElement>(null);
		const debouncedQuery = useDebounce(query, 400);

		const {
			data: searchResults,
			isLoading,
			error,
		} = useSearchPlacesQuery(
			{
				query: debouncedQuery,
				limit: 8,
			},
			{
				skip: debouncedQuery.length < 2,
			}
		);

		React.useEffect(() => {
			if (searchResults && searchResults.length > 0) {
				// Улучшенная обработка результатов поиска
				const locations: Location[] = searchResults.map((result: any) => ({
					lat: result.latitude || result.lat,
					lon: result.longitude || result.lon,
					address: result.name || result.display_name,
					displayName: result.description || result.display_name || result.name,
					type: result.type || "location",
					importance: result.importance || 0,
					region: result.region,
					country: result.country || "Россия",
				}));

				// Сортируем по важности и релевантности
				const sortedLocations = locations.sort((a, b) => {
					const aImportance = a.importance || 0;
					const bImportance = b.importance || 0;
					return bImportance - aImportance;
				});

				setSuggestions(sortedLocations);
				setIsOpen(true);
			} else if (debouncedQuery.length >= 2) {
				setSuggestions([]);
				setIsOpen(true);
			} else {
				setSuggestions([]);
				setIsOpen(false);
			}
		}, [searchResults, debouncedQuery]);

		const handleSelect = (location: Location) => {
			setQuery(location.address);
			onLocationSelect(location);
			setIsOpen(false);
			setSuggestions([]);
			setSelectedIndex(-1);
		};

		const handleCurrentLocation = async () => {
			if (!navigator.geolocation) {
				console.error("Геолокация не поддерживается");
				return;
			}

			setIsGettingLocation(true);
			try {
				const position = await new Promise<GeolocationPosition>((resolve, reject) => {
					navigator.geolocation.getCurrentPosition(resolve, reject, {
						enableHighAccuracy: true,
						timeout: 10000,
						maximumAge: 60000,
					});
				});

				// Пытаемся получить адрес через обратное геокодирование
				try {
					const reverseResponse = await fetch(
						`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&accept-language=ru`
					);

					if (reverseResponse.ok) {
						const reverseData = await reverseResponse.json();
						const address =
							reverseData.display_name ||
							`Координаты: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;

						const location: Location = {
							lat: position.coords.latitude,
							lon: position.coords.longitude,
							address: address,
							displayName: address,
							type: "current_location",
						};

						handleSelect(location);
					} else {
						// Fallback на координаты
						const location: Location = {
							lat: position.coords.latitude,
							lon: position.coords.longitude,
							address: `Текущее местоположение (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`,
							displayName: "Ваше текущее местоположение",
							type: "current_location",
						};

						handleSelect(location);
					}
				} catch (reverseError) {
					// Fallback на координаты при ошибке обратного геокодирования
					console.warn("Ошибка обратного геокодирования:", reverseError);
					const location: Location = {
						lat: position.coords.latitude,
						lon: position.coords.longitude,
						address: `Текущее местоположение (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`,
						displayName: "Ваше текущее местоположение",
						type: "current_location",
					};

					handleSelect(location);
				}
			} catch (error) {
				console.error("Ошибка получения геолокации:", error);
			} finally {
				setIsGettingLocation(false);
			}
		};

		const handleKeyDown = (e: React.KeyboardEvent) => {
			if (!isOpen || suggestions.length === 0) return;

			switch (e.key) {
				case "ArrowDown":
					e.preventDefault();
					setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
					break;
				case "ArrowUp":
					e.preventDefault();
					setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
					break;
				case "Enter":
					e.preventDefault();
					if (selectedIndex >= 0) {
						handleSelect(suggestions[selectedIndex]);
					}
					break;
				case "Escape":
					setIsOpen(false);
					setSelectedIndex(-1);
					break;
			}
		};

		const handleClear = () => {
			setQuery("");
			setSuggestions([]);
			setIsOpen(false);
			setSelectedIndex(-1);
		};

		const getLocationTypeIcon = (type?: string) => {
			switch (type) {
				case "city":
					return "🏙️";
				case "town":
					return "🏘️";
				case "village":
					return "🏡";
				case "road":
					return "🛣️";
				case "house":
					return "🏠";
				case "building":
					return "🏢";
				case "current_location":
					return "📍";
				default:
					return "📍";
			}
		};

		const getLocationTypeLabel = (type?: string) => {
			switch (type) {
				case "city":
					return "Город";
				case "town":
					return "Поселок";
				case "village":
					return "Деревня";
				case "road":
					return "Дорога";
				case "house":
					return "Дом";
				case "building":
					return "Здание";
				case "current_location":
					return "Местоположение";
				default:
					return "Место";
			}
		};

		// Закрытие при клике вне компонента
		React.useEffect(() => {
			const handleClickOutside = (event: MouseEvent) => {
				if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
					setIsOpen(false);
				}
			};

			document.addEventListener("mousedown", handleClickOutside);
			return () => {
				document.removeEventListener("mousedown", handleClickOutside);
			};
		}, []);

		return (
			<div ref={containerRef} className="relative w-full">
				<div className="relative">
					<div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
						{isLoading || isGettingLocation ? (
							<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
						) : (
							<Search className="h-4 w-4 text-muted-foreground" />
						)}
					</div>
					<Input
						ref={ref}
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onKeyDown={handleKeyDown}
						onFocus={() => {
							if (suggestions.length > 0) setIsOpen(true);
						}}
						className={cn("pl-10 pr-20", className)}
						{...props}
					/>
					<div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
						{showCurrentLocationOption && (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={handleCurrentLocation}
								disabled={isGettingLocation}
								className="h-6 w-6 p-0"
								title="Определить текущее местоположение"
							>
								<Navigation className="h-3 w-3" />
							</Button>
						)}
						{query && (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={handleClear}
								className="h-6 w-6 p-0"
							>
								<X className="h-4 w-4" />
							</Button>
						)}
					</div>
				</div>

				{isOpen && suggestions.length > 0 && (
					<Card className="absolute z-50 w-full mt-1 shadow-lg border-2 overflow-hidden">
						<div className="max-h-64 overflow-y-auto">
							{suggestions.map((location, index) => {
								const isSelected = selectedIndex === index;
								const addressParts = location.displayName?.split(", ") || [];
								const mainPart = addressParts[0] || location.address;
								const secondaryPart = addressParts.slice(1).join(", ");

								return (
									<div
										key={index}
										onClick={() => handleSelect(location)}
										onMouseEnter={() => setSelectedIndex(index)}
										className={cn(
											"px-4 py-3 cursor-pointer transition-all duration-200 border-b last:border-b-0",
											"hover:bg-accent hover:shadow-sm",
											isSelected && "bg-accent shadow-sm"
										)}
									>
										<div className="flex items-start gap-3">
											<div className="mt-1 text-lg flex-shrink-0">
												{getLocationTypeIcon(location.type)}
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-1">
													<span className="font-medium text-sm truncate">
														{mainPart}
													</span>
													<Badge
														variant="outline"
														className="text-xs shrink-0 px-2 py-0"
													>
														{getLocationTypeLabel(location.type)}
													</Badge>
													{location.importance &&
														location.importance > 0.5 && (
															<Badge
																variant="secondary"
																className="text-xs shrink-0 px-2 py-0"
															>
																Популярное
															</Badge>
														)}
												</div>
												{secondaryPart && (
													<p className="text-xs text-muted-foreground truncate">
														{secondaryPart}
													</p>
												)}
												{location.country && (
													<p className="text-xs text-muted-foreground/80 mt-1">
														{location.country}
													</p>
												)}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</Card>
				)}

				{isOpen && debouncedQuery.length >= 2 && suggestions.length === 0 && !isLoading && (
					<Card className="absolute z-50 w-full mt-1 shadow-lg">
						<div className="p-4 text-center text-sm text-muted-foreground">
							<MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
							<div>
								<p className="font-medium">Ничего не найдено</p>
								<p className="text-xs mt-1">
									Попробуйте изменить запрос или проверьте правильность написания
								</p>
							</div>
						</div>
					</Card>
				)}

				{error && (
					<Card className="absolute z-50 w-full mt-1 shadow-lg border-red-200">
						<div className="p-4 text-center text-sm text-red-600">
							<div className="flex items-center justify-center gap-2 mb-2">
								<X className="h-4 w-4" />
								<span className="font-medium">Ошибка поиска</span>
							</div>
							<p className="text-xs">Попробуйте повторить поиск позже</p>
						</div>
					</Card>
				)}
			</div>
		);
	}
);

GeocodingInput.displayName = "GeocodingInput";
