import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/widgets/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { LoginPage } from '@/pages/auth/login'
import { DashboardPage } from '@/pages/dashboard'
import { RoutesPage } from '@/pages/routes'
import { RouteDetailsPage } from '@/pages/routes/route-details'
import { CreateRoutePage } from '@/pages/routes/create-route'
import { DriversPage } from '@/pages/drivers'
import { DriverDetailsPage } from '@/pages/drivers/driver-details'
import { AnalyticsPage } from '@/pages/analytics'
import { CompliancePage } from '@/pages/compliance'
import { FleetPage } from '@/pages/fleet'
import { VehicleDetailsPage } from '@/pages/fleet/vehicle-details'
import { CargoPage } from '@/pages/cargo'
import { ROUTES } from '@/shared/constants'

export function AppRouter() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            }>
                <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
                <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
                <Route path={ROUTES.ROUTES} element={<RoutesPage />} />
                <Route path={ROUTES.ROUTE_DETAILS} element={<RouteDetailsPage />} />
                <Route path={ROUTES.ROUTE_CREATE} element={<CreateRoutePage />} />
                <Route path={ROUTES.DRIVERS} element={<DriversPage />} />
                <Route path={ROUTES.DRIVER_DETAILS} element={<DriverDetailsPage />} />
                <Route path={ROUTES.FLEET} element={<FleetPage />} />
                <Route path={ROUTES.TRUCK_DETAILS} element={<VehicleDetailsPage />} />
                <Route path="/cargo" element={<CargoPage />} />
                <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
                <Route path={ROUTES.COMPLIANCE} element={<CompliancePage />} />
            </Route>
        </Routes>
    )
}