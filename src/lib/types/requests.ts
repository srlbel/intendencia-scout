export type ItemStatus = 'disponible' | 'prestado' | 'desconocido';
export type RequestItemStatus = 'pendiente' | 'aceptado' | 'rechazado';

export type RequestRow = {
	id: string;
	purpose: string;
	requestedAt: string;
	reviewedAt: string | null;
	userId: string;
	userName: string;
	pendiente: number;
	aceptado: number;
	rechazado: number;
};

export type AvailableItem = {
	id: string;
	sku: string;
	name: string;
	location: string;
	imageUrl: string | null;
};

export type RequestDetail = {
	id: string;
	userId: string;
	purpose: string;
	description: string | null;
	requestedAt: string;
	reviewedAt: string | null;
	user: { id: string; name: string; email: string };
	items: {
		id: string;
		status: RequestItemStatus;
		reviewedAt: string | null;
		reviewer: { id: string; name: string } | null;
		item: { id: string; sku: string; name: string; location: string; status: ItemStatus };
	}[];
};
