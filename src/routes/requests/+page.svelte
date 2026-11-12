<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.ts';
	import * as Table from '#lib/components/ui/table/index.ts';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import { Button } from '#lib/components/ui/button/index.ts';
	import { formatDate } from '#lib/format.ts';
	import type { RequestRow } from '#lib/types/requests.ts';

	let { data } = $props();

	const isAdmin = $derived(data.user?.role === 'admin');
	let onlyPending = $state(false);

	const rows = $derived(
		onlyPending ? data.requests.filter((r: RequestRow) => r.pendiente > 0) : data.requests
	);

	function summary(r: RequestRow) {
		if (r.pendiente > 0) return { label: 'Pendiente', variant: 'default' as const };
		if (r.aceptado > 0 && r.rechazado > 0) return { label: 'Parcial', variant: 'secondary' as const };
		if (r.aceptado > 0) return { label: 'Aceptada', variant: 'secondary' as const };
		return { label: 'Rechazada', variant: 'destructive' as const };
	}
</script>

<div class="grid gap-6">
	<div class="flex items-center justify-between gap-2">
		<h1 class="text-2xl font-semibold">{isAdmin ? 'Solicitudes' : 'Mis solicitudes'}</h1>
		<div class="flex gap-2">
			<Button
				variant={onlyPending ? 'default' : 'outline'}
				size="sm"
				onclick={() => (onlyPending = !onlyPending)}
			>
				Solo pendientes
			</Button>
			<Button href="/requests/new" size="sm">Nueva solicitud</Button>
		</div>
	</div>

	<Card.Root>
		<Card.Content class="pt-6">
			{#if rows.length === 0}
				<p class="py-6 text-center text-sm text-muted-foreground">No hay solicitudes.</p>
			{:else}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							{#if isAdmin}<Table.Head>Usuario</Table.Head>{/if}
							<Table.Head>Propósito</Table.Head>
							<Table.Head>Fecha</Table.Head>
							<Table.Head>Ítems</Table.Head>
							<Table.Head class="text-right">Estado</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each rows as r (r.id)}
							{@const s = summary(r)}
							<Table.Row>
								{#if isAdmin}<Table.Cell>{r.userName}</Table.Cell>{/if}
								<Table.Cell class="max-w-xs truncate">
									<a href="/requests/{r.id}" class="font-medium hover:underline">{r.purpose}</a>
								</Table.Cell>
								<Table.Cell>{formatDate(r.requestedAt)}</Table.Cell>
								<Table.Cell class="text-xs text-muted-foreground">
									{r.pendiente} pend. · {r.aceptado} acept. · {r.rechazado} rech.
								</Table.Cell>
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
