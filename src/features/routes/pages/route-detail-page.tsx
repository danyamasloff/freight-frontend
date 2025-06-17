import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/constants";
import {
	ArrowLeft,
	Edit,
	Route,
	MapPin,
	Clock,
	Truck,
	User,
	Package,
	Fuel,
	DollarSign,
	AlertTriangle,
	Timer,
	Calendar,
	Navigation,
	Gauge,
	TrendingUp,
	Shield,
	Eye,
	Car,
	Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useGetRouteQuery } from "@/shared/api/routesSlice";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const MOCK_ROUTE = {
	id: 1,
	name: "Москва - Санкт-Петербург",
	startAddress: "Москва, Красная площадь, 1",
	endAddress: "Санкт-Петербург, Дворцовая площадь, 2",
	distance: 635,
	duration: 480,
	status: "PLANNED" as const,
	createdAt: "2024-01-15T10:00:00Z",
	vehicleId: 1,
	driverId: 1,
	vehicle: {
		registrationNumber: "А123МР77",
		manufacturer: "Mercedes-Benz",
		model: "Actros",
	},
	driver: {
		firstName: "Иван",
		lastName: "Иванов",
	},
};

export const RouteDetailPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const getStatusColor = (status: string) => {
		switch (status) {
			case "COMPLETED":
				return "default";
			case "IN_PROGRESS":
				return "secondary";
			default:
				return "outline";
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case "COMPLETED":
				return "Завершен";
			case "IN_PROGRESS":
				return "В пути";
			case "PLANNED":
				return "Запланирован";
			default:
				return status;
		}
	};

	const formatDuration = (minutes: number) => {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return `${hours}ч ${mins}мин`;
	};

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="outline" size="icon" onClick={() => navigate("/routes")}>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<h1 className="text-3xl font-bold">{MOCK_ROUTE.name}</h1>
				<Badge variant={getStatusColor(MOCK_ROUTE.status)}>
					{getStatusText(MOCK_ROUTE.status)}
				</Badge>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Route className="h-5 w-5 text-orange-600" />
								Информация о маршруте
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<p className="text-sm text-muted-foreground">
										Начальный адрес:
									</p>
									<p className="font-medium">{MOCK_ROUTE.startAddress}</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Конечный адрес:</p>
									<p className="font-medium">{MOCK_ROUTE.endAddress}</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Расстояние:</p>
									<p className="text-xl font-bold">
										{Math.round(MOCK_ROUTE.distance)} км
									</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Время в пути:</p>
									<p className="text-xl font-bold">
										{formatDuration(MOCK_ROUTE.duration)}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Truck className="h-5 w-5 text-orange-600" />
								Транспортное средство
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<p className="font-medium">
									{MOCK_ROUTE.vehicle.manufacturer} {MOCK_ROUTE.vehicle.model}
								</p>
								<p className="text-sm text-muted-foreground">
									{MOCK_ROUTE.vehicle.registrationNumber}
								</p>
							</div>
						</CardContent>
					</Card>

					{MOCK_ROUTE.driver && (
						<Card>
							<CardHeader>
								<CardTitle>Водитель</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="font-medium">
									{MOCK_ROUTE.driver.firstName} {MOCK_ROUTE.driver.lastName}
								</p>
							</CardContent>
						</Card>
					)}

					<Card>
						<CardHeader>
							<CardTitle>Действия</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<Button
								variant="outline"
								className="w-full"
								onClick={() => navigate(ROUTES.ROUTE_EDIT.replace(":id", id!))}
							>
								<Edit className="h-4 w-4 mr-2" />
								Редактировать
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default RouteDetailPage;
