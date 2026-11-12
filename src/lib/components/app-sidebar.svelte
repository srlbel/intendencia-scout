<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import * as Sidebar from '#lib/components/ui/sidebar/index.ts';
	import { authClient } from '#lib/auth-client.ts';
	import { itemsFor, roleOf } from '#lib/nav.ts';
	import LogOut from '@lucide/svelte/icons/log-out';
	import Boxes from '@lucide/svelte/icons/boxes';

	let {
		user
	}: { user: { name: string; email: string; role?: string | null } } = $props();

	const role = $derived(roleOf(user.role));
	const items = $derived(itemsFor(role));

	const isActive = (href: string) =>
		page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);

	// /requests must not stay highlighted while on /requests/new
	const active = $derived(
		items.find((i) => i.href === page.url.pathname)?.href ??
			items
				.filter((i) => isActive(i.href))
				.sort((a, b) => b.href.length - a.href.length)[0]?.href
	);

	let signingOut = $state(false);
	const sidebar = Sidebar.useSidebar();

	async function signOut() {
		signingOut = true;
		await authClient.signOut();
		await goto('/', { invalidateAll: true });
		signingOut = false;
	}
</script>

<Sidebar.Root>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg" class="pointer-events-none">
					<div
						class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
					>
						<Boxes class="size-4" />
					</div>
					<div class="grid text-left text-sm leading-tight">
						<span class="truncate font-semibold">Inventario</span>
						<span class="truncate text-xs text-muted-foreground">
							{role === 'admin' ? 'Administrador' : 'Usuario'}
						</span>
					</div>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>

	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Navegación</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each items as item (item.href)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton isActive={active === item.href}>
								{#snippet child({ props })}
									<a
										{...props}
										href={item.href}
										onclick={() => sidebar.isMobile && sidebar.setOpenMobile(false)}
									>
										<item.icon />
										<span>{item.label}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>

	<Sidebar.Footer>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<div class="grid px-2 py-1.5 text-left text-sm leading-tight">
					<span class="truncate font-medium">{user.name}</span>
					<span class="truncate text-xs text-muted-foreground">{user.email}</span>
				</div>
			</Sidebar.MenuItem>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton onclick={signOut} disabled={signingOut}>
					<LogOut />
					<span>{signingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}</span>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>
</Sidebar.Root>
