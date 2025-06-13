import React from "react";
import { cn } from "@/shared/lib/utils";

interface PageHeaderProps {
	className?: string;
	title: string;
	description?: string;
	children?: React.ReactNode;
}

export function PageHeader({ className, title, description, children }: PageHeaderProps) {
	return (
		<div className={cn("flex flex-col gap-4 pb-6 border-b border-border/50", className)}>
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div className="space-y-1">
					<h1 className="text-2xl font-bold tracking-tight">{title}</h1>
					{description && <p className="text-muted-foreground">{description}</p>}
				</div>
				{children && <div className="flex items-center gap-2">{children}</div>}
			</div>
		</div>
	);
}
