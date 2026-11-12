<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';
    import { ModeWatcher } from 'mode-watcher';
    import * as Sidebar from "#lib/components/ui/sidebar/index.ts";
    import AppSidebar from '#lib/components/app-sidebar.svelte';

	let { data, children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />

{#if data.user}
	<Sidebar.Provider>
		<AppSidebar user={data.user} />
		<Sidebar.Inset>
			<header class="flex h-14 items-center gap-2 border-b px-4">
				<Sidebar.Trigger />
			</header>
			<main class="flex-1 p-4 md:p-6 lg:p-8">
				{@render children()}
			</main>
		</Sidebar.Inset>
	</Sidebar.Provider>
{:else}
	{@render children()}
{/if}
