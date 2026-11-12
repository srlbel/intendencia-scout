import { error } from '@sveltejs/kit';
import type { Item } from '#lib/types/inventory.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const res = await fetch('/api/inventory');
	if (!res.ok) error(res.status, 'No se pudo cargar el inventario');
	return { items: (await res.json()) as Item[] };
};
