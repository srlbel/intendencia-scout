import { error, json } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import { history, item, user } from '#lib/server/db/schema.ts';
import { requireAdmin } from '#lib/server/api.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, params }) => {
	requireAdmin(locals);
	const exists = await db.query.item.findFirst({ where: eq(item.id, params.id), columns: { id: true } });
	if (!exists) error(404, 'Item not found');

	const rows = await db
		.select({
			id: history.id,
			borrowedAt: history.borrowedAt,
			returnExpectedAt: history.returnExpectedAt,
			returnedAt: history.returnedAt,
			userId: user.id,
			userName: user.name,
			userEmail: user.email
		})
		.from(history)
		.innerJoin(user, eq(user.id, history.userId))
		.where(eq(history.itemId, params.id))
		.orderBy(desc(history.createdOn));
	return json(rows);
};
