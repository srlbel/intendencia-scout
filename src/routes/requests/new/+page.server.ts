import { error } from '@sveltejs/kit';
import type { AvailableItem } from '#lib/types/requests.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const res = await fetch('/api/items/available');
	if (!res.ok) error(res.status, 'No se pudieron cargar los ítems');
	return { items: (await res.json()) as AvailableItem[] };
};
