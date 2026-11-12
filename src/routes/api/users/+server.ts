import { json } from '@sveltejs/kit';
import { asc } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import { user } from '#lib/server/db/schema.ts';
import { requireAdmin } from '#lib/server/api.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	requireAdmin(locals);
	const rows = await db
		.select({ id: user.id, name: user.name, email: user.email })
		.from(user)
		.orderBy(asc(user.name));
	return json(rows);
};
