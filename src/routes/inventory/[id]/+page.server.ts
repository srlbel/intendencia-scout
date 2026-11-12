import { error } from '@sveltejs/kit';
import type { HistoryRow, Item } from '#lib/types/inventory.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params }) => {
	const [itemRes, historyRes] = await Promise.all([
		fetch(`/api/inventory/${params.id}`),
		fetch(`/api/inventory/${params.id}/history`)
	]);

	if (!itemRes.ok) error(itemRes.status, itemRes.status === 404 ? 'Ítem no encontrado' : 'Error al cargar');
	if (!historyRes.ok) error(historyRes.status, 'No se pudo cargar el historial');

	return {
		item: (await itemRes.json()) as Item,
		history: (await historyRes.json()) as HistoryRow[]
	};
};
