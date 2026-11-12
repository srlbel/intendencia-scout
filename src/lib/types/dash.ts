// Dates arrive as ISO strings because the data crosses JSON
export type AdminDashData = {
	role: 'admin';
	items: { disponible: number; prestado: number; desconocido: number };
	pendingRequestItems: number;
	overdue: {
		historyId: string;
		itemId: string;
		itemName: string;
		sku: string;
		userName: string;
		borrowedAt: string | null;
		returnExpectedAt: string | null;
	}[];
	recentRequests: {
		id: string;
		purpose: string;
		requestedAt: string;
		reviewedAt: string | null;
		userName: string;
	}[];
};

export type UserDashData = {
	role: 'user';
	activeLoans: {
		historyId: string;
		itemName: string;
		sku: string;
		borrowedAt: string | null;
		returnExpectedAt: string | null;
		overdue: boolean;
	}[];
	requests: Partial<Record<'pendiente' | 'aceptado' | 'rechazado', number>>;
};

export type DashData = AdminDashData | UserDashData;
