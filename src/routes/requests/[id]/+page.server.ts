import { error } from '@sveltejs/kit';
import type { RequestDetail } from '#lib/types/requests.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params }) => {
	const res = await fetch(`/api/requests/${params.id}`);
	if (!res.ok) error(res.status, res.status === 404 ? 'Solicitud no encontrada' : 'Error al cargar');
	return { req: (await res.json()) as RequestDetail };
};
