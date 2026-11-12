import { error } from '@sveltejs/kit';
import type { RequestRow } from '#lib/types/requests.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const res = await fetch('/api/requests');
	if (!res.ok) error(res.status, 'No se pudieron cargar las solicitudes');
	return { requests: (await res.json()) as RequestRow[] };
};
