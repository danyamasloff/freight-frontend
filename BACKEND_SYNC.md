# Синхронизация Frontend и Backend TruckNavigator

Данный документ описывает синхронизацию между Frontend (React/TypeScript) и Backend (Spring Boot) проектами.

## ✅ Выполненные изменения

### 1. Исправление критических ошибок сборки

- ✅ Исправлен импорт `CreateRoutePage` → `RoutePlanner` в `weather-route-demo-page.tsx`
- ✅ Проект теперь собирается без ошибок

### 2. Синхронизация типов данных

- ✅ Создан файл `src/shared/types/backend-sync.ts` с типами, точно соответствующими Backend DTO
- ✅ Все поля названы одинаково между Frontend и Backend
- ✅ Добавлены функции трансформации данных между форматами

### 3. Обновление API слайсов

- ✅ **Routes API**: Полная синхронизация с `RouteController.java`
- ✅ **Vehicles API**: Синхронизация с `VehicleController.java`
- ✅ **Drivers API**: Синхронизация с `DriverController.java`
- ✅ Правильные endpoints и методы HTTP

### 4. Конфигурация API

- ✅ Создан `src/shared/config/api-config.ts` с настройками, синхронизированными с `application.properties`
- ✅ Обновлен базовый `apiSlice.ts` с retry логикой и обработкой ошибок
- ✅ Добавлены utility функции для работы с API

## 🔧 Настройки окружения

### Frontend (.env файл)

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api

# External API Keys
VITE_OPENWEATHER_API_KEY=93296d4b0fc0ba3000fd7c5e9eef3290
VITE_GRAPHHOPPER_API_KEY=d4c33e81-6eeb-4af4-a7d3-30760756bab6

# App Configuration
VITE_APP_NAME=TruckNavigator
VITE_APP_VERSION=1.0.0

# Map Configuration
VITE_DEFAULT_MAP_CENTER_LAT=55.7558
VITE_DEFAULT_MAP_CENTER_LNG=37.6176
VITE_DEFAULT_MAP_ZOOM=10
```

### Backend (application.properties)

```properties
# Server Configuration
server.port=8080

# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5433/truckdb
spring.datasource.username=postgres
spring.datasource.password=${POSTGRES_PASSWORD:TruckNavDB_S3cur3!}

# API Keys (синхронизированы с Frontend)
graphhopper.api.key=${GRAPHHOPPER_API_KEY:d4c33e81-6eeb-4af4-a7d3-30760756bab6}
weather.api.key=${OPENWEATHER_API_KEY:93296d4b0fc0ba3000fd7c5e9eef3290}

# JWT Configuration
app.jwt.secret=${JWT_SECRET:TruckNavigatorSecretKey567890123456789012345678901234567890}
app.jwt.expiration-ms=${JWT_EXPIRATION_MS:86400000}
app.jwt.refresh-expiration-ms=${JWT_REFRESH_EXPIRATION_MS:604800000}
```

## 📋 Соответствие API Endpoints

### Routes (Маршруты)

| Frontend                   | Backend                        | Метод | Описание                    |
| -------------------------- | ------------------------------ | ----- | --------------------------- |
| `/routes`                  | `/api/routes`                  | GET   | Получить все маршруты       |
| `/routes/{id}`             | `/api/routes/{id}`             | GET   | Получить маршрут по ID      |
| `/routes/calculate`        | `/api/routes/calculate`        | POST  | Рассчитать маршрут          |
| `/routes/plan`             | `/api/routes/plan`             | GET   | Планирование по координатам |
| `/routes/plan-by-name`     | `/api/routes/plan-by-name`     | GET   | Планирование по названиям   |
| `/routes/find-place`       | `/api/routes/find-place`       | GET   | Поиск мест                  |
| `/routes/weather-forecast` | `/api/routes/weather-forecast` | POST  | Прогноз погоды              |
| `/routes/weather-hazards`  | `/api/routes/weather-hazards`  | POST  | Погодные предупреждения     |

### Vehicles (Транспортные средства)

| Frontend                    | Backend                         | Метод | Описание                 |
| --------------------------- | ------------------------------- | ----- | ------------------------ |
| `/vehicles`                 | `/api/vehicles`                 | GET   | Получить все ТС          |
| `/vehicles/{id}`            | `/api/vehicles/{id}`            | GET   | Получить ТС по ID        |
| `/vehicles`                 | `/api/vehicles`                 | POST  | Создать ТС               |
| `/vehicles/{id}`            | `/api/vehicles/{id}`            | PUT   | Обновить ТС              |
| `/vehicles/{id}/fuel-level` | `/api/vehicles/{id}/fuel-level` | PUT   | Обновить уровень топлива |
| `/vehicles/{id}/odometer`   | `/api/vehicles/{id}/odometer`   | PUT   | Обновить пробег          |

### Drivers (Водители)

| Frontend                 | Backend                      | Метод | Описание                |
| ------------------------ | ---------------------------- | ----- | ----------------------- |
| `/drivers`               | `/api/drivers`               | GET   | Получить всех водителей |
| `/drivers/{id}`          | `/api/drivers/{id}`          | GET   | Получить водителя по ID |
| `/drivers`               | `/api/drivers`               | POST  | Создать водителя        |
| `/drivers/{id}`          | `/api/drivers/{id}`          | PUT   | Обновить водителя       |
| `/drivers/{id}/status`   | `/api/drivers/{id}/status`   | PUT   | Обновить статус         |
| `/drivers/{id}/location` | `/api/drivers/{id}/location` | PUT   | Обновить местоположение |

## 📊 Типы данных (DTO синхронизация)

### RouteRequestDto

```typescript
// Frontend (backend-sync.ts)
interface RouteRequestDto {
	startLat: number;
	startLon: number;
	endLat: number;
	endLon: number;
	vehicleId?: number;
	driverId?: number;
	cargoId?: number;
	departureTime?: string; // ISO string
	// ... другие поля
}
```

```java
// Backend (RouteRequestDto.java)
public class RouteRequestDto {
    private double startLat;
    private double startLon;
    private double endLat;
    private double endLon;
    private Long vehicleId;
    private Long driverId;
    private Long cargoId;
    private LocalDateTime departureTime;
    // ... другие поля
}
```

### VehicleDetailDto

```typescript
// Frontend
interface VehicleDetailBackendDto {
	id: number;
	registrationNumber: string; // licensePlate на Frontend
	manufacturer: string; // brand на Frontend
	model: string;
	productionYear: number; // year на Frontend
	fuelCapacityLitres: number; // fuelTankCapacityL на Frontend
	// ... другие поля
}
```

```java
// Backend
public class VehicleDetailDto {
    private Long id;
    private String registrationNumber;
    private String manufacturer;
    private String model;
    private Integer productionYear;
    private Integer fuelCapacityLitres;
    // ... другие поля
}
```

## 🔄 Функции трансформации

Созданы функции для преобразования данных между Frontend и Backend форматами:

### Маршруты

```typescript
export const transformToBackendRouteRequest = (
	frontendRequest: Partial<RouteRequestDto>
): RouteRequestDto => {
	return {
		...frontendRequest,
		startLat: frontendRequest.startLat || 0,
		startLon: frontendRequest.startLon || 0,
		endLat: frontendRequest.endLat || 0,
		endLon: frontendRequest.endLon || 0,
		profile: frontendRequest.profile || "driving",
		calcPoints: frontendRequest.calcPoints ?? true,
		instructions: frontendRequest.instructions ?? true,
		pointsEncoded: frontendRequest.pointsEncoded ?? false,
	};
};
```

### Транспортные средства

```typescript
const transformVehicleDetail = (vehicle: VehicleDetailBackendDto): any => {
	return {
		id: vehicle.id,
		licensePlate: vehicle.registrationNumber,
		brand: vehicle.manufacturer,
		model: vehicle.model,
		year: vehicle.productionYear,
		fuelTankCapacityL: vehicle.fuelCapacityLitres,
		// ... другие поля
	};
};
```

## 🚀 Запуск проектов

### Backend

```bash
cd truck-navigator-backend
./mvnw spring-boot:run
```

Backend будет доступен на `http://localhost:8080`

### Frontend

```bash
cd freight-frontend
bun run dev
```

Frontend будет доступен на `http://localhost:3000`

### Proxy настройка

В `vite.config.ts` настроен proxy для API:

```typescript
server: {
    port: 3000,
    proxy: {
        '/api': {
            target: 'http://localhost:8080',
            changeOrigin: true,
            secure: false,
        },
    },
}
```

## ⚠️ Известные ограничения

1. **Статусы ТС**: Backend не имеет поля `status` в VehicleDetailDto, на Frontend добавляется значение по умолчанию
2. **Геолокация**: Backend использует `lat/lng`, Frontend - `lat/lon`, есть трансформация
3. **Единицы измерения**: Backend возвращает расстояние в км, время в минутах, Frontend может требовать другие единицы

## 🔍 Отладка

### Логирование API запросов

В консоли браузера отображается:

- Отправляемые запросы
- Получаемые ответы
- Ошибки API с подробностями
- Retry попытки

### Проверка соединения

1. Убедитесь, что Backend запущен на `localhost:8080`
2. Проверьте, что база данных PostgreSQL доступна
3. Убедитесь, что API ключи корректны
4. Проверьте CORS настройки

## 📝 TODO

- [ ] Добавить обработку статусов ТС на Backend
- [ ] Синхронизировать поля геолокации
- [ ] Добавить валидацию данных на Frontend
- [ ] Создать unit тесты для функций трансформации
- [ ] Добавить TypeScript типы для всех ответов API

## 🆘 Поддержка

При возникновении проблем с синхронизацией:

1. Проверьте консоль браузера на ошибки
2. Проверьте логи Backend в терминале
3. Убедитесь, что версии API соответствуют документации
4. Проверьте переменные окружения
