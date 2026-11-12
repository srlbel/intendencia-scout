import { error, json } from '@sveltejs/kit';
import { and, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '#lib/server/db/index.ts';
import { history, item, request, requestItem } from '#lib/server/db/schema.ts';
import { parseBody, requireAdmin, requireUser } from '#lib/server/api.ts';
import type { RequestHandler } from './$types';

// View: owner or admin
export const GET: RequestHandler = async ({ locals, params }) => {
	const me = requireUser(locals);

	const row = await db.query.request.findFirst({
		where: eq(request.id, params.id),
		with: {
			user: { columns: { id: true, name: true, email: true } },
			items: {
				with: {
					item: true,
					reviewer: { columns: { id: true, name: true } }
				}
			}
		}
	});

	// 404 for both cases so users can't probe other people's request IDs
	if (!row || (me.role !== 'admin' && row.userId !== me.id)) error(404, 'Request not found');
	return json(row);
};

const reviewSchema = z.object({
	decisions: z
		.array(
			z.discriminatedUnion('status', [
				z.object({ requestItemId: z.string(), status: z.literal('rechazado') }),
				z.object({
					requestItemId: z.string(),
					status: z.literal('aceptado'),
					returnExpectedAt: z.coerce.date()
				})
			])
		)
		.min(1)
});

// Approve / reject individual items (admin only)
export const PATCH: RequestHandler = async ({ locals, params, request: req }) => {
	const admin = requireAdmin(locals);
	const { decisions } = await parseBody(req, reviewSchema);
	const now = new Date();

	const parent = await db.query.request.findFirst({ where: eq(request.id, params.id) });
	if (!parent) error(404, 'Request not found');

	await db.transaction(async (tx) => {
		for (const d of decisions) {
			// Only pending items of THIS request can be reviewed
			const [ri] = await tx
				.select()
				.from(requestItem)
				.where(
					and(
						eq(requestItem.id, d.requestItemId),
						eq(requestItem.requestId, params.id),
						eq(requestItem.status, 'pendiente')
					)
				);
			if (!ri) error(409, `Request item ${d.requestItemId} is not pending`);

			if (d.status === 'aceptado') {
				const [claimed] = await tx
					.update(item)
					.set({ status: 'prestado' })
					.where(and(eq(item.id, ri.itemId), eq(item.status, 'disponible')))
					.returning();
				if (!claimed) error(409, `Item ${ri.itemId} is no longer available`);

				await tx.insert(history).values({
					itemId: ri.itemId,
					userId: parent.userId,
					borrowedAt: now,
					returnExpectedAt: d.returnExpectedAt
				});
			}

			await tx
				.update(requestItem)
				.set({ status: d.status, reviewedAt: now, reviewedBy: admin.id })
				.where(eq(requestItem.id, ri.id));
		}

		// Close the request once nothing is pending
		const stillPending = await tx
			.select({ id: requestItem.id })
			.from(requestItem)
			.where(and(eq(requestItem.requestId, params.id), eq(requestItem.status, 'pendiente')))
			.limit(1);
		if (!stillPending.length) {
			await tx.update(request).set({ reviewedAt: now }).where(eq(request.id, params.id));
		}
	});

	return json({ ok: true });
};
