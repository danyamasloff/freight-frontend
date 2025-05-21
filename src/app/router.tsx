import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/widgets/layout';
import { ProtectedRoute } from '@/components/protected-route';
import { LoginPage } from '@/pages/auth/login';
import { RegisterPage } from '@/pages/auth/register';
import { DashboardPage } from '@/pages/dashboard';
import { RoutesPage, RouteDetailsPage, CreateRoutePage } from '@/pages/routes';
import {
    DriversPage,
    DriverDetailsPage,
    CreateDriverPage,
    EditDriverPage,
    DriverRtoAnalysisPage,
    DriverPerformancePage
} from '@/pages/drivers';
import { AnalyticsPage } from '@/pages/analytics';
import { CompliancePage } from '@/pages/compliance';
import { FleetPage, VehicleDetailsPage } from '@/pages/fleet';
import { CargoPage, CargoDetailPage, CreateCargoPage, EditCargoPage } from '@/pages/cargo';
import { ROUTES } from '@/shared/constants';

export function AppRouter() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            }>
                <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
                <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />

                {/* Маршруты */}
                <Route path={ROUTES.ROUTES} element={<RoutesPage />} />
                <Route path={ROUTES.ROUTE_DETAILS} element={<RouteDetailsPage />} />
                <Route path={ROUTES.ROUTE_CREATE} element={<CreateRoutePage />} />

                {/* Водители */}
                <Route path={ROUTES.DRIVERS} element={<DriversPage />} />
                <Route path={ROUTES.DRIVER_DETAILS} element={<DriverDetailsPage />} />
                <Route path={ROUTES.DRIVER_CREATE} element={<CreateDriverPage />} />
                <Route path={ROUTES.DRIVER_EDIT} element={<EditDriverPage />} />
                <Route path={ROUTES.DRIVER_RTO_ANALYSIS} element={<DriverRtoAnalysisPage />} />
                <Route path={ROUTES.DRIVER_PERFORMANCE} element={<DriverPerformancePage />} />

                {/* Транспорт */}
                <Route path={ROUTES.FLEET} element={<FleetPage />} />
                <Route path={ROUTES.TRUCK_DETAILS} element={<VehicleDetailsPage />} />

                {/* Грузы */}
                <Route path={ROUTES.CARGO} element={<CargoPage />} />
                <Route path={ROUTES.CARGO_DETAILS} element={<CargoDetailPage />} />
                <Route path={ROUTES.CARGO_CREATE} element={<CreateCargoPage />} />
                <Route path={ROUTES.CARGO_EDIT} element={<EditCargoPage />} />

                {/* Аналитика */}
                <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
                <Route path={ROUTES.COMPLIANCE} element={<CompliancePage />} />
            </Route>
        </Routes>
    );
}