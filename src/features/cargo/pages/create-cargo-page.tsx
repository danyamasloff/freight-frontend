import { Link } from "react-router-dom";
import { ArrowLeft, Package, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CargoForm } from "@/features/cargo/components/cargo-form";

export function CreateCargoPage() {
	return (
		<div className="container py-8">
			<div className="flex items-center mb-6 text-muted-foreground">
				<Button variant="link" asChild className="p-0">
					<Link to="/cargo">Грузы</Link>
				</Button>
				<ChevronRight className="h-4 w-4 mx-2" />
				<span className="text-foreground font-medium">Создание груза</span>
			</div>

			<div className="flex justify-between items-center mb-8">
				<div>
					<h1 className="text-2xl font-bold tracking-tight flex items-center">
						<Package className="h-6 w-6 mr-2" />
						Создание нового груза
					</h1>
					<p className="text-muted-foreground mt-1">
						Заполните информацию о грузе для создания записи в системе
					</p>
				</div>
				<Button variant="outline" asChild>
					<Link to="/cargo">
						<ArrowLeft className="mr-2 h-4 w-4" /> Вернуться к списку
					</Link>
				</Button>
			</div>

			<div className="max-w-4xl mx-auto">
				<CargoForm />
			</div>
		</div>
	);
}

export default CreateCargoPage;
