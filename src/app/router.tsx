// src/app/router.tsx

import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/widgets/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { LoginPage } from "@/pages/auth/login";
import { RegisterPage } from "@/pages/auth/register";
import { DashboardPage } from "@/pages/dashboard";
import {
	RoutesPage,
	RouteDetailPage,
	CreateRoutePage,
	RoutePlannerPage,
	RouteMapPage,
} from "@/pages/routes";
import { DriversPage, DriverDetailPage, CreateDriverPage, EditDriverPage } from "@/pages/drivers";
import { AnalyticsPage } from "@/pages/analytics";
import { CompliancePage } from "@/pages/compliance";
import {
	FleetPage,
	VehicleDetailsPage,
	CreateVehiclePage,
	EditVehiclePage,
} from "@/pages/fleet/exports";
import { CargoPage } from "@/pages/cargo/cargo-page";
import { CargoDetailPage } from "@/features/cargo/cargo-detail-page";
import { CreateCargoPage } from "@/pages/cargo/create-cargo";
import { EditCargoPage } from "@/pages/cargo/edit-cargo";
import { ROUTES } from "@/shared/constants";
import {
	NotFoundPage,
	ServerErrorPage,
	ForbiddenPage,
	NetworkErrorPage,
} from "@/components/error-pages";
import { WeatherRouteDemoPage } from "@/pages/weather";

export function AppRouter() {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route path="/register" element={<RegisterPage />} />

			<Route
				path="/"
				element={
					<ProtectedRoute>
						<Layout />
					</ProtectedRoute>
				}
			>
				<Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
				<Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />

				{/* Маршруты */}
				<Route path={ROUTES.ROUTES} element={<RoutesPage />} />
				<Route path={ROUTES.ROUTE_DETAILS} element={<RouteDetailPage />} />
				<Route path={ROUTES.ROUTE_CREATE} element={<CreateRoutePage />} />
				<Route path={ROUTES.ROUTE_PLANNER} element={<RoutePlannerPage />} />
				<Route path="routes/map" element={<RouteMapPage />} />

				{/* Водители */}
				<Route path={ROUTES.DRIVERS} element={<DriversPage />} />
				<Route path={ROUTES.DRIVER_DETAILS} element={<DriverDetailPage />} />
				<Route path={ROUTES.DRIVER_CREATE} element={<CreateDriverPage />} />
				<Route path={ROUTES.DRIVER_EDIT} element={<EditDriverPage />} />

				{/* Транспорт */}
				<Route path={ROUTES.FLEET} element={<FleetPage />} />
				<Route path={ROUTES.VEHICLE_DETAILS} element={<VehicleDetailsPage />} />
				<Route path={ROUTES.VEHICLE_CREATE} element={<CreateVehiclePage />} />
				<Route path={ROUTES.VEHICLE_EDIT} element={<EditVehiclePage />} />

				{/* Грузы */}
				<Route path={ROUTES.CARGO} element={<CargoPage />} />
				<Route path={ROUTES.CARGO_DETAILS} element={<CargoDetailPage />} />
				<Route path={ROUTES.CARGO_CREATE} element={<CreateCargoPage />} />
				<Route path={ROUTES.CARGO_EDIT} element={<EditCargoPage />} />

				{/* Аналитика */}
				<Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
				<Route path={ROUTES.COMPLIANCE} element={<CompliancePage />} />

				{/* Демо страницы */}
				<Route path={ROUTES.WEATHER_ROUTE_DEMO} element={<WeatherRouteDemoPage />} />
			</Route>

			{/* Страницы ошибок */}
			<Route path="/error/404" element={<NotFoundPage />} />
			<Route path="/error/500" element={<ServerErrorPage />} />
			<Route path="/error/403" element={<ForbiddenPage />} />
			<Route path="/error/network" element={<NetworkErrorPage />} />

			{/* Catch-all для 404 */}
			<Route path="*" element={<NotFoundPage />} />
		</Routes>
	);
}
