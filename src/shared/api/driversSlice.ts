import { apiSlice } from './apiSlice';
import type {
    DriverDetailBackendDto,
    DriverSummaryBackendDto,
    GeoPointDto
} from '@/shared/types/backend-sync';
import { DrivingStatusEnum } from '@/shared/types/backend-sync';

// Функции трансформации для совместимости с существующим кодом
const transformDriverDetail = (driver: DriverDetailBackendDto): any => {
    return {
        id: driver.id,
        firstName: driver.firstName,
        lastName: driver.lastName,
        middleName: driver.middleName,
        birthDate: driver.birthDate,
        licenseNumber: driver.licenseNumber,
        licenseIssueDate: driver.licenseIssueDate,
        licenseExpiryDate: driver.licenseExpiryDate,
        licenseCategories: driver.licenseCategories,
        phoneNumber: driver.phoneNumber,
        email: driver.email,
        drivingExperienceYears: driver.drivingExperienceYears,
        hasDangerousGoodsCertificate: driver.hasDangerousGoodsCertificate,
        dangerousGoodsCertificateExpiry: driver.dangerousGoodsCertificateExpiry,
        hasInternationalTransportationPermit: driver.hasInternationalTransportationPermit,
        hourlyRate: driver.hourlyRate,
        perKilometerRate: driver.perKilometerRate,
        fuelConsumptionLper100km: driver.fuelConsumptionLper100km,
        tollRatePerKm: driver.tollRatePerKm,
        currentDrivingStatus: driver.currentDrivingStatus,
        currentStatusStartTime: driver.currentStatusStartTime,
        dailyDrivingMinutesToday: driver.dailyDrivingMinutesToday,
        continuousDrivingMinutes: driver.continuousDrivingMinutes,
        weeklyDrivingMinutes: driver.weeklyDrivingMinutes,
        currentLocation: driver.currentLocation,
        createdAt: driver.createdAt,
        updatedAt: driver.updatedAt,
    };
};

const transformDriverSummary = (driver: DriverSummaryBackendDto): any => {
    return {
        id: driver.id,
        firstName: driver.firstName,
        lastName: driver.lastName,
        middleName: driver.middleName,
        licenseNumber: driver.licenseNumber,
        phoneNumber: driver.phoneNumber,
        drivingExperienceYears: driver.drivingExperienceYears,
        currentDrivingStatus: driver.currentDrivingStatus,
        currentLocation: driver.currentLocation,
    };
};

// Функция для трансформации данных Frontend в Backend формат
const transformToBackendDriver = (frontendDriver: any): Partial<DriverDetailBackendDto> => {
    return {
        id: frontendDriver.id,
        firstName: frontendDriver.firstName,
        lastName: frontendDriver.lastName,
        middleName: frontendDriver.middleName,
        birthDate: frontendDriver.birthDate,
        licenseNumber: frontendDriver.licenseNumber,
        licenseIssueDate: frontendDriver.licenseIssueDate,
        licenseExpiryDate: frontendDriver.licenseExpiryDate,
        licenseCategories: frontendDriver.licenseCategories,
        phoneNumber: frontendDriver.phoneNumber,
        email: frontendDriver.email,
        drivingExperienceYears: frontendDriver.drivingExperienceYears,
        hasDangerousGoodsCertificate: frontendDriver.hasDangerousGoodsCertificate || false,
        dangerousGoodsCertificateExpiry: frontendDriver.dangerousGoodsCertificateExpiry,
        hasInternationalTransportationPermit: frontendDriver.hasInternationalTransportationPermit || false,
        hourlyRate: frontendDriver.hourlyRate,
        perKilometerRate: frontendDriver.perKilometerRate,
        fuelConsumptionLper100km: frontendDriver.fuelConsumptionLper100km,
        tollRatePerKm: frontendDriver.tollRatePerKm,
        currentDrivingStatus: frontendDriver.currentDrivingStatus || DrivingStatusEnum.OFF_DUTY,
        currentStatusStartTime: frontendDriver.currentStatusStartTime,
        dailyDrivingMinutesToday: frontendDriver.dailyDrivingMinutesToday || 0,
        continuousDrivingMinutes: frontendDriver.continuousDrivingMinutes || 0,
        weeklyDrivingMinutes: frontendDriver.weeklyDrivingMinutes || 0,
        currentLocation: frontendDriver.currentLocation,
    };
};

export const driversSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // === CRUD операции (синхронизированы с Backend) ===
        getDrivers: builder.query<any[], void>({
            query: () => '/drivers',
            providesTags: ['Driver'],
            transformResponse: (response: DriverSummaryBackendDto[]) => 
                response.map(transformDriverSummary),
        }),
        getDriver: builder.query<any, number>({
            query: (id) => `/drivers/${id}`,
            providesTags: (result, error, id) => [{ type: 'Driver', id }],
            transformResponse: (response: DriverDetailBackendDto) => 
                transformDriverDetail(response),
        }),
        createDriver: builder.mutation<any, Partial<any>>({
            query: (driverData) => ({
                url: '/drivers',
                method: 'POST',
                body: transformToBackendDriver(driverData),
            }),
            invalidatesTags: ['Driver', 'Notification'],
            transformResponse: (response: DriverDetailBackendDto) => 
                transformDriverDetail(response),
        }),
        updateDriver: builder.mutation<any, { id: number; data: Partial<any> }>({
            query: ({ id, data }) => ({
                url: `/drivers/${id}`,
                method: 'PUT',
                body: transformToBackendDriver({ ...data, id }),
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Driver', id }],
            transformResponse: (response: DriverDetailBackendDto) => 
                transformDriverDetail(response),
        }),
        deleteDriver: builder.mutation<void, number>({
            query: (id) => ({
                url: `/drivers/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Driver'],
        }),

        // === Специальные операции для водителей ===
        updateDrivingStatus: builder.mutation<any, { 
            id: number; 
            status: DrivingStatusEnum;
            location?: GeoPointDto;
        }>({
            query: ({ id, status, location }) => ({
                url: `/drivers/${id}/status`,
                method: 'PUT',
                body: { status, location },
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Driver', id }],
            transformResponse: (response: DriverDetailBackendDto) => 
                transformDriverDetail(response),
        }),

        updateLocation: builder.mutation<any, { 
            id: number; 
            location: GeoPointDto;
        }>({
            query: ({ id, location }) => ({
                url: `/drivers/${id}/location`,
                method: 'PUT',
                body: location,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Driver', id }],
            transformResponse: (response: DriverDetailBackendDto) => 
                transformDriverDetail(response),
        }),

        // === Получение водителей по статусу ===
        getDriversByStatus: builder.query<any[], DrivingStatusEnum>({
            query: (status) => `/drivers/status/${status}`,
            providesTags: ['Driver'],
            transformResponse: (response: DriverSummaryBackendDto[]) => 
                response.map(transformDriverSummary),
        }),

        // === Получение доступных водителей ===
        getAvailableDrivers: builder.query<any[], void>({
            query: () => '/drivers/available',
            providesTags: ['Driver'],
            transformResponse: (response: DriverSummaryBackendDto[]) => 
                response.map(transformDriverSummary),
        }),

        // === Получение доступных водителей для назначения на маршрут ===
        getAvailableDriversForRoute: builder.query<any[], { excludeRouteId?: number }>({
            query: ({ excludeRouteId }) => {
                const params = new URLSearchParams();
                if (excludeRouteId) {
                    params.append('excludeRouteId', excludeRouteId.toString());
                }
                return `/drivers/available-for-route?${params}`;
            },
            providesTags: ['Driver'],
            transformResponse: (response: DriverSummaryBackendDto[]) => 
                response.map((driver) => ({
                    ...transformDriverSummary(driver),
                    isAvailable: true,
                    assignedRouteId: null,
                    reasonUnavailable: null
                })),
        }),

        // === Получение всех водителей с информацией о доступности ===
        getDriversWithAvailability: builder.query<any[], { forRouteId?: number }>({
            query: ({ forRouteId }) => {
                const params = new URLSearchParams();
                if (forRouteId) {
                    params.append('forRouteId', forRouteId.toString());
                }
                return `/drivers/with-availability?${params}`;
            },
            providesTags: ['Driver'],
            transformResponse: (response: any[]) => 
                response.map((driver) => ({
                    ...transformDriverSummary(driver),
                    isAvailable: driver.currentDrivingStatus === 'AVAILABILITY' || driver.currentDrivingStatus === 'OFF_DUTY',
                    assignedRouteId: driver.assignedRouteId || null,
                    reasonUnavailable: driver.assignedRouteId ? `занят маршрутом №${driver.assignedRouteId}` : 
                                     driver.currentDrivingStatus === 'DRIVING' ? 'в рейсе' :
                                     driver.currentDrivingStatus === 'REST_BREAK' ? 'на отдыхе' :
                                     driver.currentDrivingStatus === 'DAILY_REST' ? 'суточный отдых' : null
                })),
        }),

        // === Упрощенное обновление статуса водителя ===
        updateDriverStatus: builder.mutation<any, { 
            driverId: number; 
            status: any;
            timestamp?: string;
        }>({
            query: ({ driverId, status }) => ({
                url: `/drivers/${driverId}/status`,
                method: 'PUT',
                body: { status },
            }),
            invalidatesTags: (result, error, { driverId }) => [{ type: 'Driver', id: driverId }],
        }),

        // === Анализ времени отдыха для маршрута ===
        analyzeRouteRestTime: builder.mutation<any, { 
            driverId: number; 
            route: any;
            departureTime: string;
        }>({
            query: ({ driverId, route, departureTime }) => ({
                url: `/drivers/${driverId}/rest-time-analysis`,
                method: 'POST',
                body: { 
                    routeId: route.id,
                    departureTime,
                    currentLocation: route.startLocation
                },
            }),
        }),
    }),
});

export const {
    useGetDriversQuery,
    useGetDriverQuery,
    useCreateDriverMutation,
    useUpdateDriverMutation,
    useDeleteDriverMutation,
    useUpdateDrivingStatusMutation,
    useUpdateLocationMutation,
    useGetDriversByStatusQuery,
    useGetAvailableDriversQuery,
    useGetAvailableDriversForRouteQuery,
    useGetDriversWithAvailabilityQuery,
    useUpdateDriverStatusMutation,
    useAnalyzeRouteRestTimeMutation,
} = driversSlice;