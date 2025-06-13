import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Particle {
	id: number;
	x: number;
	y: number;
	size: number;
	opacity: number;
	duration: number;
	delay: number;
}

interface FloatingParticlesProps {
	count?: number;
	className?: string;
	color?: string;
	minSize?: number;
	maxSize?: number;
}

export function FloatingParticles({
	count = 50,
	className,
	color = "bg-slate-400/20",
	minSize = 1,
	maxSize = 3,
}: FloatingParticlesProps) {
	const [particles, setParticles] = useState<Particle[]>([]);

	useEffect(() => {
		const newParticles: Particle[] = [];

		for (let i = 0; i < count; i++) {
			newParticles.push({
				id: i,
				x: Math.random() * 100,
				y: Math.random() * 100,
				size: minSize + Math.random() * (maxSize - minSize),
				opacity: 0.1 + Math.random() * 0.4,
				duration: 3 + Math.random() * 4,
				delay: Math.random() * 2,
			});
		}

		setParticles(newParticles);
	}, [count, minSize, maxSize]);

	return (
		<div className={cn("absolute inset-0 pointer-events-none", className)}>
			{particles.map((particle) => (
				<div
					key={particle.id}
					className={cn("absolute rounded-full", color, "animate-pulse")}
					style={{
						left: `${particle.x}%`,
						top: `${particle.y}%`,
						width: `${particle.size}px`,
						height: `${particle.size}px`,
						opacity: particle.opacity,
						animationDuration: `${particle.duration}s`,
						animationDelay: `${particle.delay}s`,
						transform: "translate(-50%, -50%)",
					}}
				/>
			))}
		</div>
	);
}
