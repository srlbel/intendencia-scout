import type { Component } from 'svelte';
import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
import ClipboardList from '@lucide/svelte/icons/clipboard-list';
import FilePlus from '@lucide/svelte/icons/file-plus';
import Package from '@lucide/svelte/icons/package';

export type Role = 'admin' | 'user';

export type NavItem = {
	label: string;
	href: string;
	icon: Component;
	roles: Role[];
};

export const navItems: NavItem[] = [
	{ label: 'Panel', href: '/dash', icon: LayoutDashboard, roles: ['admin', 'user'] },

	// Admin
	{ label: 'Solicitudes', href: '/requests', icon: ClipboardList, roles: ['admin'] },
	{ label: 'Inventario', href: '/inventory', icon: Package, roles: ['admin'] },

	// Normal user
	{ label: 'Mis solicitudes', href: '/requests', icon: ClipboardList, roles: ['user'] },
	{ label: 'Nueva solicitud', href: '/requests/new', icon: FilePlus, roles: ['user'] }
];

// `role` is nullable in the auth schema, so anything that isn't 'admin' is a normal user
export const roleOf = (role: string | null | undefined): Role => (role === 'admin' ? 'admin' : 'user');

export const itemsFor = (role: Role) => navItems.filter((i) => i.roles.includes(role));
