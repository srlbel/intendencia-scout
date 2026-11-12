import { error, json } from '@sveltejs/kit';
import { desc, eq, inArray, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '#lib/server/db/index.ts';
import { item, request, requestItem, user } from '#lib/server/db/schema.ts';
import { parseBody, requireUser } from '#lib/server/api.ts';
import type { RequestHandler } from './$types';

const createSchema = z.object({
	purpose: z.string().trim().min(1),
	description: z.string().trim().nullish(),
	itemIds: z.array(z.string()).min(1).max(50)
});

// Admin → all requests. User → only their own.
export const GET: RequestHandler = async ({ locals }) => {
  const me = requireUser(locals);

  const count = (s: 'pendiente' | 'aceptado' | 'rechazado') =>
		sql<number>`coalesce(sum(${requestItem.status} = ${s}), 0)`.mapWith(Number);

	const rows = await db
			.select({
				id: request.id,
				purpose: request.purpose,
				requestedAt: request.requestedAt,
				reviewedAt: request.reviewedAt,
				userId: user.id,
				userName: user.name,
				pendiente: count('pendiente'),
				aceptado: count('aceptado'),
				rechazado: count('rechazado')
			})
			.from(request)
			.innerJoin(user, eq(user.id, request.userId))
			.leftJoin(requestItem, eq(requestItem.requestId, request.id))
			.where(me.role === 'admin' ? undefined : eq(request.userId, me.id))
			.groupBy(request.id, user.id)
			.orderBy(desc(request.requestedAt));

	return Response.json(rows);
};

export const POST: RequestHandler = async ({ locals, request: req }) => {
	const me = requireUser(locals);
	const body = await parseBody(req, createSchema);
	const ids = [...new Set(body.itemIds)];

	const found = await db.select({ id: item.id, status: item.status }).from(item).where(inArray(item.id, ids));
	if (found.length !== ids.length) error(400, 'Some items do not exist');
	if (found.some((i) => i.status !== 'disponible')) error(409, 'Some items are not available');

	const created = await db.transaction(async (tx) => {
		const [r] = await tx
			.insert(request)
			.values({ userId: me.id, purpose: body.purpose, description: body.description })
			.returning();
		await tx.insert(requestItem).values(ids.map((itemId) => ({ requestId: r.id, itemId })));
		return r;
	});

	return json(created, { status: 201 });
};
