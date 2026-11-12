<script lang="ts">
	import { invalidateAll, replaceState, afterNavigate } from '$app/navigation';
	import * as Card from '#lib/components/ui/card/index.ts';
	import * as Table from '#lib/components/ui/table/index.ts';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import { Button } from '#lib/components/ui/button/index.ts';
	import { Input } from '#lib/components/ui/input/index.ts';
	import ItemFormDialog from '#lib/components/inventory/item-form-dialog.svelte';
	import LendDialog from '#lib/components/inventory/lend-dialog.svelte';
	import { page } from "$app/state"
	import type { Item } from '#lib/types/inventory.ts';
    import { normalize } from '#lib/format.ts';

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	let search = $state(page.url.searchParams.get('q') ?? '');
	let status = $state(page.url.searchParams.get('status') ?? '');

	afterNavigate(() => {
		search = page.url.searchParams.get('q') ?? '';
		status = page.url.searchParams.get('status') ?? '';
	});

	function syncUrl() {
		const p = new URLSearchParams();
		if (search) p.set('q', search);
		if (status) p.set('status', status);
		const qs = p.toString();
		replaceState(qs ? `?${qs}` : page.url.pathname, page.state);
	}

	const filtered = $derived.by(() => {
		const q = normalize(search.trim());
		return data.items.filter(
			(i) =>
				(!status || i.status === status) &&
				(!q || normalize(i.name).includes(q) || normalize(i.sku).includes(q))
		);
	});

	let formOpen = $state(false);
	let editing = $state<Item | null>(null);
	let lendOpen = $state(false);
	let lendTarget = $state<Item | null>(null);
	let error = $state('');

	const filters = [
		{ value: '', label: 'Todos' },
		{ value: 'disponible', label: 'Disponibles' },
		{ value: 'prestado', label: 'Prestados' },
		{ value: 'desconocido', label: 'Desconocidos' }
	];

	function openCreate() {
		editing = null;
		formOpen = true;
	}
	function openEdit(i: Item) {
		editing = i;
		formOpen = true;
	}
	function openLend(i: Item) {
		lendTarget = i;
		lendOpen = true;
	}

	async function giveBack(i: Item) {
		error = '';
		const res = await fetch(`/api/inventory/${i.id}/return`, { method: 'POST' });
		if (!res.ok) {
			const body = await res.json().catch(() => null);
			return (error = body?.message ?? 'No se pudo registrar la devolución');
		}
		await invalidateAll();
	}

	const variant = (s: string) =>
		s === 'disponible' ? 'secondary' : s === 'prestado' ? 'default' : 'outline';
</script>

<div class="grid gap-6">
	<div class="flex items-center justify-between gap-2">
		<h1 class="text-2xl font-semibold">Inventario</h1>
		<Button size="sm" onclick={openCreate}>Nuevo ítem</Button>
	</div>

	<div class="flex flex-wrap items-center gap-2">
		<Input
			class="max-w-xs"
			placeholder="Buscar por nombre o SKU"
			bind:value={search}
			oninput={syncUrl}
		/>
		{#each filters as f}
		    {@const active = status == f.value}
			<Button
				size="default"
				variant={active ? 'default' : 'outline'}
				aria-pressed={active}
				class={active ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
				onclick={() => {
    				status = f.value;
    				syncUrl();
				}}
			>
				{f.label}
			</Button>
		{/each}
	</div>

	{#if error}<p class="text-sm text-destructive">{error}</p>{/if}

	<Card.Root>
		<Card.Content class="pt-6">
			{#if data.items.length === 0}
				<p class="py-6 text-center text-sm text-muted-foreground">No hay ítems.</p>
			{:else}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Ítem</Table.Head>
							<Table.Head>Ubicación</Table.Head>
							<Table.Head>Estado</Table.Head>
							<Table.Head class="text-right">Acciones</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each filtered as i (i.id)}
							<Table.Row>
								<Table.Cell>
									<a href="/inventory/{i.id}" class="font-medium hover:underline">{i.name}</a>
									<div class="text-xs text-muted-foreground">{i.sku}</div>
								</Table.Cell>
								<Table.Cell>{i.location}</Table.Cell>
								<Table.Cell>
									<Badge variant={variant(i.status)} class="capitalize">{i.status}</Badge>
								</Table.Cell>
								<Table.Cell class="text-right">
									<div class="flex justify-end gap-1">
										{#if i.status === 'disponible'}
											<Button size="sm" variant="outline" onclick={() => openLend(i)}>
												Prestar
											</Button>
										{:else if i.status === 'prestado'}
											<Button size="sm" variant="outline" onclick={() => giveBack(i)}>
												Devolver
											</Button>
										{/if}
										<Button size="sm" variant="ghost" onclick={() => openEdit(i)}>Editar</Button>
									</div>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{/if}
		</Card.Content>
	</Card.Root>
</div>

<ItemFormDialog bind:open={formOpen} item={editing} onsaved={() => invalidateAll()} />
<LendDialog bind:open={lendOpen} item={lendTarget} onsaved={() => invalidateAll()} />
