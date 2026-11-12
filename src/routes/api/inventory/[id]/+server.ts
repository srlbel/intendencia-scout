import { error, json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '#lib/server/db/index.ts';
import { history, item } from '#lib/server/db/schema.ts';
import { parseBody, requireAdmin } from '#lib/server/api.ts';
import type { RequestHandler } from './$types';

const patchSchema = z
	.object({
		sku: z.string().trim().min(1),
		name: z.string().trim().min(1),
		location: z.string().trim().min(1),
		imageUrl: z.string().url().nullable(),
		observations: z.string().nullable(),
		status: z.enum(['disponible', 'prestado', 'desconocido'])
	})
	.partial();

export const GET: RequestHandler = async ({ locals, params }) => {
	requireAdmin(locals);
	const row = await db.query.item.findFirst({ where: eq(item.id, params.id) });
	if (!row) error(404, 'Item not found');
	return json(row);
};

export const PATCH: RequestHandler = async ({ locals, params, request }) => {
	requireAdmin(locals);
	const body = await parseBody(request, patchSchema);
	const [updated] = await db.update(item).set(body).where(eq(item.id, params.id)).returning();
	if (!updated) error(404, 'Item not found');
	return json(updated);
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	requireAdmin(locals);
	// history uses onDelete: restrict, so check first for a friendly error
	const used = await db.query.history.findFirst({ where: eq(history.itemId, params.id) });
	if (used) error(409, 'Item has history and cannot be deleted');
	const [deleted] = await db.delete(item).where(eq(item.id, params.id)).returning();
	if (!deleted) error(404, 'Item not found');
	return new Response(null, { status: 204 });
};
