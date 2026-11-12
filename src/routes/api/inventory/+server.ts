import { json } from '@sveltejs/kit';
import { and, asc, eq, like, or } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '#lib/server/db/index.ts';
import { item } from '#lib/server/db/schema.ts';
import { parseBody, requireAdmin } from '#lib/server/api.ts';
import type { RequestHandler } from './$types';

const createSchema = z.object({
	sku: z.string().trim().min(1),
	name: z.string().trim().min(1),
	location: z.string().trim().min(1),
	imageUrl: z.string().url().nullish(),
	observations: z.string().nullish(),
	status: z.enum(['disponible', 'prestado', 'desconocido']).optional()
});

export const GET: RequestHandler = async ({ locals, url }) => {
	requireAdmin(locals);
	const q = url.searchParams.get('q')?.trim();
	const status = url.searchParams.get('status');

	const filters = [
		q ? or(like(item.name, `%${q}%`), like(item.sku, `%${q}%`)) : undefined,
		status === 'disponible' || status === 'prestado' || status === 'desconocido'
			? eq(item.status, status)
			: undefined
	];

	const rows = await db
		.select()
		.from(item)
		.where(and(...filters))
		.orderBy(asc(item.name));
	return json(rows);
};

export const POST: RequestHandler = async ({ locals, request }) => {
	requireAdmin(locals);
	const body = await parseBody(request, createSchema);
	try {
		const [created] = await db.insert(item).values(body).returning();
		return json(created, { status: 201 });
	} catch (e) {
		if (String(e).includes('UNIQUE')) return json({ message: 'SKU already exists' }, { status: 409 });
		throw e;
	}
};
