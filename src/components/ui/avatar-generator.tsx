import { useMemo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AvatarGeneratorProps {
	firstName?: string;
	lastName?: string;
	className?: string;
	size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
	sm: "h-8 w-8 text-xs",
	md: "h-10 w-10 text-sm",
	lg: "h-12 w-12 text-base",
	xl: "h-16 w-16 text-lg",
};

const colorCombinations = [
	"bg-red-500 text-white",
	"bg-blue-500 text-white",
	"bg-green-500 text-white",
	"bg-yellow-500 text-black",
	"bg-purple-500 text-white",
	"bg-pink-500 text-white",
	"bg-indigo-500 text-white",
	"bg-teal-500 text-white",
	"bg-orange-500 text-white",
	"bg-cyan-500 text-white",
	"bg-emerald-500 text-white",
	"bg-rose-500 text-white",
	"bg-violet-500 text-white",
	"bg-amber-500 text-black",
	"bg-lime-500 text-black",
	"bg-sky-500 text-white",
];

export function AvatarGenerator({
	firstName = "",
	lastName = "",
	className = "",
	size = "md",
}: AvatarGeneratorProps) {
	const { initials, colorClass } = useMemo(() => {
		// Генерируем инициалы
		const firstInitial = firstName.charAt(0).toUpperCase();
		const lastInitial = lastName.charAt(0).toUpperCase();
		const initials = firstInitial + lastInitial;

		// Генерируем цвет на основе имени и фамилии
		const nameString = (firstName + lastName).toLowerCase();
		let hash = 0;
		for (let i = 0; i < nameString.length; i++) {
			hash = nameString.charCodeAt(i) + ((hash << 5) - hash);
		}
		const colorIndex = Math.abs(hash) % colorCombinations.length;
		const colorClass = colorCombinations[colorIndex];

		return { initials, colorClass };
	}, [firstName, lastName]);

	return (
		<Avatar className={`${sizeClasses[size]} ${className}`}>
			<AvatarFallback className={colorClass}>{initials || "??"}</AvatarFallback>
		</Avatar>
	);
}
