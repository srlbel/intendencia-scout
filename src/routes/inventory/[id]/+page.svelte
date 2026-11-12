<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import * as Card from '#lib/components/ui/card/index.ts';
	import * as Table from '#lib/components/ui/table/index.ts';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import { Button } from '#lib/components/ui/button/index.ts';
	import ItemFormDialog from '#lib/components/inventory/item-form-dialog.svelte';
	import LendDialog from '#lib/components/inventory/lend-dialog.svelte';
	import { formatDate } from '#lib/format.ts';
	import type { HistoryRow } from '#lib/types/inventory.ts';

	let { data } = $props();

	const item = $derived(data.item);

	let formOpen = $state(false);
	let lendOpen = $state(false);
	let error = $state('');

	function loanState(h: HistoryRow) {
		if (h.returnedAt) return { label: 'Devuelto', variant: 'secondary' as const };
		if (h.returnExpectedAt && new Date(h.returnExpectedAt) < new Date())
			return { label: 'Vencido', variant: 'destructive' as const };
		return { label: 'En curso', variant: 'default' as const };
	}

	async function giveBack() {
		error = '';
		const res = await fetch(`/api/inventory/${item.id}/return`, { method: 'POST' });
		if (!res.ok) {
			const body = await res.json().catch(() => null);
			return (error = body?.message ?? 'No se pudo registrar la devolución');
		}
		await invalidateAll();
	}

	async function remove() {
		if (!confirm(`¿Eliminar "${item.name}"?`)) return;
		error = '';
		const res = await fetch(`/api/inventory/${item.id}`, { method: 'DELETE' });
		if (!res.ok) {
			const body = await res.json().catch(() => null);
			return (error = body?.message ?? 'No se pudo eliminar');
		}
		await goto('/inventory', { invalidateAll: true });
	}
</script>

<div class="grid max-w-5xl gap-6">
	<div>
		<Button href="/inventory" variant="ghost" size="sm" class="-ml-3">← Inventario</Button>
		<div class="flex flex-wrap items-center justify-between gap-2">
			<h1 class="text-2xl font-semibold">{item.name}</h1>
			<div class="flex gap-2">
				{#if item.status === 'disponible'}
					<Button size="sm" onclick={() => (lendOpen = true)}>Prestar</Button>
				{:else if item.status === 'prestado'}
					<Button size="sm" onclick={giveBack}>Registrar devolución</Button>
				{/if}
				<Button size="sm" variant="outline" onclick={() => (formOpen = true)}>Editar</Button>
				<Button size="sm" variant="destructive" onclick={remove}>Eliminar</Button>
			</div>
		</div>
		{#if error}<p class="mt-2 text-sm text-destructive">{error}</p>{/if}
	</div>

	<Card.Root>
		<Card.Content class="grid gap-4 pt-6 text-sm sm:grid-cols-[auto_1fr]">
			{#if item.imageUrl}
				<img
					src={item.imageUrl}
					alt={item.name}
					class="h-32 w-32 rounded-md border object-cover"
				/>
			{/if}
			<div class="grid content-start gap-3 sm:grid-cols-2">
				<div>
					<div class="text-muted-foreground">SKU</div>
					{item.sku}
				</div>
				<div>
					<div class="text-muted-foreground">Estado</div>
					<Badge class="capitalize" variant={item.status === 'disponible' ? 'secondary' : 'default'}>
						{item.status}
					</Badge>
				</div>
				<div>
					<div class="text-muted-foreground">Ubicación</div>
					{item.location}
				</div>
				<div>
					<div class="text-muted-foreground">Última actualización</div>
					{formatDate(item.updatedOn)}
				</div>
				{#if item.observations}
					<div class="sm:col-span-2">
						<div class="text-muted-foreground">Observaciones</div>
						{item.observations}
					</div>
				{/if}
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>Historial</Card.Title>
			<Card.Description>{data.history.length} préstamo(s)</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if data.history.length === 0}
				<p class="py-6 text-center text-sm text-muted-foreground">Este ítem nunca se ha prestado.</p>
			{:else}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Usuario</Table.Head>
							<Table.Head>Prestado</Table.Head>
							<Table.Head>Debía volver</Table.Head>
							<Table.Head>Devuelto</Table.Head>
							<Table.Head class="text-right">Estado</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.history as h (h.id)}
							{@const s = loanState(h)}
							<Table.Row>
								<Table.Cell>
									<span class="font-medium">{h.userName}</span>
									<div class="text-xs text-muted-foreground">{h.userEmail}</div>
								</Table.Cell>
								<Table.Cell>{formatDate(h.borrowedAt)}</Table.Cell>
								<Table.Cell>{formatDate(h.returnExpectedAt)}</Table.Cell>
								<Table.Cell>{formatDate(h.returnedAt)}</Table.Cell>
								<Table.Cell class="text-right">
									<Badge variant={s.variant}>{s.label}</Badge>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{/if}
		</Card.Content>
	</Card.Root>
</div>

<ItemFormDialog bind:open={formOpen} {item} onsaved={() => invalidateAll()} />
<LendDialog bind:open={lendOpen} {item} onsaved={() => invalidateAll()} />
