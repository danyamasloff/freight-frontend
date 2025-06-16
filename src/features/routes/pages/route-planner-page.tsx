// freight-frontend/src/pages/routes/planner.tsx

import React from "react";
import { RoutePlanner } from "@/features/routes/components/route-planner";
import { PageHeader } from "@/components/page-header";
import { Helmet } from "react-helmet-async";

export function RoutePlannerPage() {
	return (
		<>
			<Helmet>
				<title>Планировщик маршрутов | TruckNavigator</title>
				<meta
					name="description"
					content="Планирование маршрутов грузоперевозок с аналитикой и учетом погодных условий"
				/>
			</Helmet>

			<RoutePlanner />
		</>
	);
}

export default RoutePlannerPage;
