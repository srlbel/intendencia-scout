import { error, json } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '#lib/server/db/index.ts';
import { history, item } from '#lib/server/db/schema.ts';
import { parseBody, requireAdmin } from '#lib/server/api.ts';
import type { RequestHandler } from './$types';

const schema = z.object({
	userId: z.string().min(1),
	returnExpectedAt: z.coerce.date()
});

export const POST: RequestHandler = async ({ locals, params, request }) => {
	requireAdmin(locals);
	const body = await parseBody(request, schema);

	// Atomic claim: only flips the status if the item is currently available
	const [claimed] = await db
		.update(item)
		.set({ status: 'prestado' })
		.where(and(eq(item.id, params.id), eq(item.status, 'disponible')))
		.returning();
	if (!claimed) error(409, 'Item is not available');

	const [row] = await db
		.insert(history)
		.values({
			itemId: params.id,
			userId: body.userId,
			borrowedAt: new Date(),
			returnExpectedAt: body.returnExpectedAt
		})
		.returning();
	return json(row, { status: 201 });
};
