import { sequence, type Handle } from '@sveltejs/kit/hooks';
import { building } from '$app/env';
import { auth } from '#lib/server/auth.ts';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { redirect } from '@sveltejs/kit';

const attachSession: Handle = async ({ event, resolve }) => {
	const data = await auth.api.getSession({ headers: event.request.headers });
	event.locals.session = data?.session ?? null;
	event.locals.user = data?.user ?? null;
	return resolve(event);
};

const authHandler: Handle = ({ event, resolve }) =>
	svelteKitHandler({ event, resolve, auth, building });

const adminOnly = ['/inventory', '/api/inventory'];
const isPublic = (p: string) => p === '/' || p.startsWith('/api/auth');

const guard: Handle = async ({ event, resolve }) => {
  const { pathname } = event.url;
  const { user } = event.locals;
  const isApi = pathname.startsWith("/api");

  if (!isPublic(pathname)) {
    if (!user) {
      return isApi ? Response.json({ message: 'Unauthorized' }, { status: 401 }) : redirect(303, "/")
    }

    if (adminOnly.some((p) => pathname.startsWith(p)) && user.role !== 'admin') {
      return isApi ? Response.json({ message: 'Forbidden' }, { status: 403 }) : redirect(303, "/dash")
    }
  }

  if (pathname == "/" && user) redirect(303, '/dash')
  return resolve(event);
}

export const handle = sequence(attachSession, guard, authHandler)
