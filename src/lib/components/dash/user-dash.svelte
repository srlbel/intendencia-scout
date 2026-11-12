<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.ts';
	import * as Table from '#lib/components/ui/table/index.ts';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import { Button } from '#lib/components/ui/button/index.ts';
	import { formatDate } from '#lib/format.ts';
	import type { UserDashData } from '#lib/types/dash.ts';

	let { dash }: { dash: UserDashData } = $props();

	const stats = $derived([
		{ label: 'Pendientes', value: dash.requests.pendiente ?? 0 },
		{ label: 'Aceptados', value: dash.requests.aceptado ?? 0 },
		{ label: 'Rechazados', value: dash.requests.rechazado ?? 0 }
	]);
	const overdueCount = $derived(dash.activeLoans.filter((l) => l.overdue).length);
</script>

<section class="grid grid-cols-2 gap-4 sm:grid-cols-4">
	<Card.Root>
		<Card.Header class="pb-2">
			<Card.Description>Préstamos activos</Card.Description>
			<Card.Title class="text-3xl">{dash.activeLoans.length}</Card.Title>
		</Card.Header>
	</Card.Root>
	{#each stats as s}
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Description>{s.label}</Card.Description>
				<Card.Title class="text-3xl">{s.value}</Card.Title>
			</Card.Header>
		</Card.Root>
	{/each}
</section>

<Card.Root>
	<Card.Header class="flex-row items-center justify-between space-y-0">
		<div class="grid gap-1">
			<Card.Title>Mis préstamos</Card.Title>
			{#if overdueCount}
				<Card.Description class="text-destructive">
					Tienes {overdueCount} vencido{overdueCount > 1 ? 's' : ''}
				</Card.Description>
			{/if}
		</div>
		<Button href="/requests" variant="outline" size="sm">Ver solicitudes</Button>
	</Card.Header>
	<Card.Content>
		{#if dash.activeLoans.length === 0}
			<p class="py-6 text-center text-sm text-muted-foreground">No tienes ítems prestados.</p>
		{:else}
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Ítem</Table.Head>
						<Table.Head>Prestado</Table.Head>
						<Table.Head>Devolver el</Table.Head>
						<Table.Head class="text-right">Estado</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each dash.activeLoans as l (l.historyId)}
						<Table.Row>
							<Table.Cell>
								<span class="font-medium">{l.itemName}</span>
								<div class="text-xs text-muted-foreground">{l.sku}</div>
							</Table.Cell>
							<Table.Cell>{formatDate(l.borrowedAt)}</Table.Cell>
							<Table.Cell>{formatDate(l.returnExpectedAt)}</Table.Cell>
							<Table.Cell class="text-right">
								<Badge variant={l.overdue ? 'destructive' : 'secondary'}>
									{l.overdue ? 'Vencido' : 'En curso'}
								</Badge>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		{/if}
	</Card.Content>
</Card.Root>
