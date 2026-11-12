import { error } from '@sveltejs/kit';
import type { DashData } from '#lib/types/dash.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const res = await fetch('/api/dash');
	if (!res.ok) error(res.status, 'No se pudo cargar el panel');
	return { dash: (await res.json()) as DashData };
};
