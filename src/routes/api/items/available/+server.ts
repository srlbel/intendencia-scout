import { json } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import { item } from '#lib/server/db/schema.ts';
import { requireUser } from '#lib/server/api.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	requireUser(locals);
	const rows = await db
		.select({
			id: item.id,
			sku: item.sku,
			name: item.name,
			location: item.location,
			imageUrl: item.imageUrl
		})
		.from(item)
		.where(eq(item.status, 'disponible'))
		.orderBy(asc(item.name));
	return json(rows);
};
