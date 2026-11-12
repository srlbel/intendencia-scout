import { error, json } from '@sveltejs/kit';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import { history, item } from '#lib/server/db/schema.ts';
import { requireAdmin } from '#lib/server/api.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, params }) => {
	requireAdmin(locals);

	const [closed] = await db
		.update(history)
		.set({ returnedAt: new Date() })
		.where(and(eq(history.itemId, params.id), isNull(history.returnedAt)))
		.returning();
	if (!closed) error(409, 'Item has no open loan');

	await db.update(item).set({ status: 'disponible' }).where(eq(item.id, params.id));
	return json(closed);
};
