import { error } from "@sveltejs/kit";
import type { ZodType, z } from 'zod';

export function requireUser(locals: App.Locals) {
  if (!locals.user) error(401, 'Unauthorized');
  return locals.user;
}

export function requireAdmin(locals: App.Locals) {
  const user = requireUser(locals)
  if (user.role != "admin") error(401, 'Unathorize')
  return user;
}

export async function parseBody<T extends ZodType>(request: Request, schema: T): Promise<z.infer<T>> {
  const raw = await request.json().catch(() => error(401, "Invalid JSON"));
  const result = schema.safeParse(raw);
  if (!result.success) error(401, result.error?.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '));
  return result.data;
}
