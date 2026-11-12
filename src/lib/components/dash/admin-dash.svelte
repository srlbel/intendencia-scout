<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.ts';
	import * as Table from '#lib/components/ui/table/index.ts';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import { formatDate, daysLate } from '#lib/format.ts';
	import type { AdminDashData } from '#lib/types/dash.ts';

	let { dash }: { dash: AdminDashData } = $props();

	const total = $derived(dash.items.disponible + dash.items.prestado + dash.items.desconocido);

	const stats = $derived([
		{ label: 'Total de ítems', value: total, href: '/inventory' },
		{ label: 'Disponibles', value: dash.items.disponible, href: '/inventory?status=disponible' },
		{ label: 'Prestados', value: dash.items.prestado, href: '/inventory?status=prestado' },
		{ label: 'Desconocidos', value: dash.items.desconocido, href: '/inventory?status=desconocido' }
	]);
</script>

<section class="grid grid-cols-2 gap-4 lg:grid-cols-5">
	{#each stats as s}
		<a href={s.href} class="contents">
			<Card.Root class="transition-colors hover:bg-muted/50">
				<Card.Header class="pb-2">
					<Card.Description>{s.label}</Card.Description>
					<Card.Title class="text-3xl">{s.value}</Card.Title>
				</Card.Header>
			</Card.Root>
		</a>
	{/each}

	<a href="/requests" class="contents">
		<Card.Root class="col-span-2 transition-colors hover:bg-muted/50 lg:col-span-1">
			<Card.Header class="pb-2">
				<Card.Description>Solicitudes pendientes</Card.Description>
				<Card.Title class="text-3xl">
					{dash.pendingRequestItems}
				</Card.Title>
			</Card.Header>
		</Card.Root>
	</a>
</section>

<Card.Root>
	<Card.Header>
		<Card.Title>Préstamos vencidos</Card.Title>
		<Card.Description>Los 10 más atrasados</Card.Description>
	</Card.Header>
	<Card.Content>
		{#if dash.overdue.length === 0}
			<p class="py-6 text-center text-sm text-muted-foreground">No hay préstamos vencidos 🎉</p>
		{:else}
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Ítem</Table.Head>
						<Table.Head>Usuario</Table.Head>
						<Table.Head>Prestado</Table.Head>
						<Table.Head>Debía volver</Table.Head>
						<Table.Head class="text-right">Atraso</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each dash.overdue as o (o.historyId)}
						<Table.Row>
							<Table.Cell>
								<a href="/inventory/{o.itemId}" class="font-medium hover:underline">{o.itemName}</a>
								<div class="text-xs text-muted-foreground">{o.sku}</div>
							</Table.Cell>
							<Table.Cell>{o.userName}</Table.Cell>
							<Table.Cell>{formatDate(o.borrowedAt)}</Table.Cell>
							<Table.Cell>{formatDate(o.returnExpectedAt)}</Table.Cell>
							<Table.Cell class="text-right">
								<Badge variant="destructive">{daysLate(o.returnExpectedAt)} d</Badge>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		{/if}
	</Card.Content>
</Card.Root>

<Card.Root>
	<Card.Header>
		<Card.Title>Solicitudes recientes</Card.Title>
	</Card.Header>
	<Card.Content>
		{#if dash.recentRequests.length === 0}
			<p class="py-6 text-center text-sm text-muted-foreground">Aún no hay solicitudes.</p>
		{:else}
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Usuario</Table.Head>
						<Table.Head>Propósito</Table.Head>
						<Table.Head>Fecha</Table.Head>
						<Table.Head class="text-right">Estado</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each dash.recentRequests as r (r.id)}
						<Table.Row>
							<Table.Cell>{r.userName}</Table.Cell>
							<Table.Cell class="max-w-xs truncate">
								<a href="/requests/{r.id}" class="hover:underline">{r.purpose}</a>
							</Table.Cell>
							<Table.Cell>{formatDate(r.requestedAt)}</Table.Cell>
							<Table.Cell class="text-right">
								<Badge variant={r.reviewedAt ? 'secondary' : 'default'}>
									{r.reviewedAt ? 'Revisada' : 'Pendiente'}
								</Badge>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		{/if}
	</Card.Content>
</Card.Root>
