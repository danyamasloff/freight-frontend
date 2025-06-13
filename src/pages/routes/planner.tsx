import React from "react";
import { RoutePlanner } from "@/features/routes/components/route-planner";
import { PageHeader } from "@/components/page-header";

export function RoutePlannerPage() {
	return (
		<div className="min-h-screen bg-background">
			<PageHeader
				title="Планировщик маршрутов"
				description="Рассчитайте оптимальный маршрут с учетом погоды и дорожных условий"
			/>
			<RoutePlanner />
		</div>
	);
}
