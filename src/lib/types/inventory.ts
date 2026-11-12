export type ItemStatus = 'disponible' | 'prestado' | 'desconocido';

export type Item = {
	id: string;
	sku: string;
	name: string;
	imageUrl: string | null;
	location: string;
	status: ItemStatus;
	observations: string | null;
	createdOn: string;
	updatedOn: string;
};

export type HistoryRow = {
	id: string;
	borrowedAt: string | null;
	returnExpectedAt: string | null;
	returnedAt: string | null;
	userId: string;
	userName: string;
	userEmail: string;
};

export type UserOption = { id: string; name: string; email: string };
