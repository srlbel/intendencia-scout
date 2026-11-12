import { ORIGIN, BETTER_AUTH_SECRET } from '$app/env/private';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { db } from '#lib/server/db/index.ts';
import { admin } from "better-auth/plugins"

export const auth = betterAuth({
	baseURL: ORIGIN,
	secret: BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'sqlite' }),
	emailAndPassword: {
    enabled: true,
		disableSignUp: true
	},
	plugins: [
    admin({
      defaultRole: 'user',
      adminRoles: ['admin']
		}),
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});
