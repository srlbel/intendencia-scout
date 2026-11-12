import { json } from '@sveltejs/kit';
import { and, asc, count, desc, eq, isNotNull, isNull, lt } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import { history, item, request, requestItem, user } from '#lib/server/db/schema.ts';
import { requireUser } from '#lib/server/api.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	const me = requireUser(locals);
	const now = new Date();

	if (me.role === 'admin') {
		const [statusRows, overdue, [pending], recent] = await Promise.all([
			db.select({ status: item.status, total: count() }).from(item).groupBy(item.status),

			db
				.select({
					historyId: history.id,
					itemId: item.id,
					itemName: item.name,
					sku: item.sku,
					userName: user.name,
					borrowedAt: history.borrowedAt,
					returnExpectedAt: history.returnExpectedAt
				})
				.from(history)
				.innerJoin(item, eq(item.id, history.itemId))
				.innerJoin(user, eq(user.id, history.userId))
				.where(
					and(
						isNull(history.returnedAt),
						isNotNull(history.borrowedAt),
						lt(history.returnExpectedAt, now)
					)
				)
				.orderBy(asc(history.returnExpectedAt))
				.limit(10),

			db.select({ total: count() }).from(requestItem).where(eq(requestItem.status, 'pendiente')),

			db
				.select({
					id: request.id,
					purpose: request.purpose,
					requestedAt: request.requestedAt,
					reviewedAt: request.reviewedAt,
					userName: user.name
				})
				.from(request)
				.innerJoin(user, eq(user.id, request.userId))
				.orderBy(desc(request.requestedAt))
				.limit(5)
		]);

		const byStatus = Object.fromEntries(statusRows.map((r) => [r.status, r.total]));
		return json({
			role: 'admin',
			items: {
				disponible: byStatus.disponible ?? 0,
				prestado: byStatus.prestado ?? 0,
				desconocido: byStatus.desconocido ?? 0
			},
			pendingRequestItems: pending.total,
			overdue,
			recentRequests: recent
		});
	}

	const [activeLoans, myRequests] = await Promise.all([
		db
			.select({
				historyId: history.id,
				itemName: item.name,
				sku: item.sku,
				borrowedAt: history.borrowedAt,
				returnExpectedAt: history.returnExpectedAt
			})
			.from(history)
			.innerJoin(item, eq(item.id, history.itemId))
			.where(
				and(eq(history.userId, me.id), isNull(history.returnedAt), isNotNull(history.borrowedAt))
			)
			.orderBy(asc(history.returnExpectedAt)),

		db
			.select({ status: requestItem.status, total: count() })
			.from(requestItem)
			.innerJoin(request, eq(request.id, requestItem.requestId))
			.where(eq(request.userId, me.id))
			.groupBy(requestItem.status)
	]);

	return json({
		role: 'user',
		activeLoans: activeLoans.map((l) => ({
			...l,
			overdue: !!l.returnExpectedAt && l.returnExpectedAt < now
		})),
		requests: Object.fromEntries(myRequests.map((r) => [r.status, r.total]))
	});
};
