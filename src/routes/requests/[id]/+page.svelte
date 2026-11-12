<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import * as Card from '#lib/components/ui/card/index.ts';
	import * as Table from '#lib/components/ui/table/index.ts';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import { Button } from '#lib/components/ui/button/index.ts';
	import { Input } from '#lib/components/ui/input/index.ts';
	import { formatDate } from '#lib/format.ts';

	let { data } = $props();

	const req = $derived(data.req);
	const isAdmin = $derived(data.user?.role === 'admin');
	const pendingItems = $derived(req.items.filter((i) => i.status === 'pendiente'));
	const canReview = $derived(isAdmin && pendingItems.length > 0);

	type Choice = 'aceptado' | 'rechazado';
	let choices = $state<Record<string, Choice | undefined>>({});
	let dueDate = $state(defaultDue());
	let error = $state('');
	let loading = $state(false);

	const chosen = $derived(pendingItems.filter((i) => choices[i.id]));
	const needsDate = $derived(chosen.some((i) => choices[i.id] === 'aceptado'));

	function defaultDue() {
		const d = new Date();
		d.setDate(d.getDate() + 7);
		return d.toISOString().slice(0, 10);
	}

	function setAll(c: Choice) {
		for (const i of pendingItems) choices[i.id] = c;
	}

	const variantOf = (s: string) =>
		s === 'aceptado' ? 'secondary' : s === 'rechazado' ? 'destructive' : 'default';

	async function submit() {
		error = '';
		if (chosen.length === 0) return (error = 'Elige una decisión para al menos un ítem');
		if (needsDate && !dueDate) return (error = 'Indica la fecha de devolución');

		// End of the chosen day in the admin's local time
		const returnExpectedAt = new Date(`${dueDate}T23:59:59`).toISOString();

		loading = true;
		const res = await fetch(`/api/requests/${req.id}`, {
			method: 'PATCH',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				decisions: chosen.map((i) =>
					choices[i.id] === 'aceptado'
						? { requestItemId: i.id, status: 'aceptado', returnExpectedAt }
						: { requestItemId: i.id, status: 'rechazado' }
				)
			})
		});
		loading = false;

		if (!res.ok) {
			const body = await res.json().catch(() => null);
			return (error = body?.message ?? 'No se pudo guardar la revisión');
		}
		choices = {};
		await invalidateAll();
	}
</script>

<div class="grid max-w-5xl gap-6">
	<div>
		<Button href="/requests" variant="ghost" size="sm" class="-ml-3">← Solicitudes</Button>
		<h1 class="text-2xl font-semibold">{req.purpose}</h1>
	</div>

	<Card.Root>
		<Card.Content class="grid gap-3 pt-6 text-sm sm:grid-cols-2">
			<div>
				<div class="text-muted-foreground">Solicitante</div>
				{req.user.name} <span class="text-muted-foreground">({req.user.email})</span>
			</div>
			<div>
				<div class="text-muted-foreground">Fecha</div>
				{formatDate(req.requestedAt)}
			</div>
			<div>
				<div class="text-muted-foreground">Revisada</div>
				{formatDate(req.reviewedAt)}
			</div>
			{#if req.description}
				<div class="sm:col-span-2">
					<div class="text-muted-foreground">Descripción</div>
					{req.description}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex-row items-center justify-between space-y-0">
			<Card.Title>Ítems solicitados</Card.Title>
			{#if canReview}
				<div class="flex gap-2">
					<Button variant="outline" size="sm" onclick={() => setAll('aceptado')}>
						Aceptar todos
					</Button>
					<Button variant="outline" size="sm" onclick={() => setAll('rechazado')}>
						Rechazar todos
					</Button>
				</div>
			{/if}
		</Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Ítem</Table.Head>
						<Table.Head>Ubicación</Table.Head>
						<Table.Head class="text-right">{canReview ? 'Decisión' : 'Estado'}</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each req.items as ri (ri.id)}
						{@const reviewing = canReview && ri.status === 'pendiente'}
						<Table.Row>
							<Table.Cell>
								<span class="font-medium">{ri.item.name}</span>
								<div class="text-xs text-muted-foreground">{ri.item.sku}</div>
								{#if reviewing && ri.item.status !== 'disponible'}
									<div class="text-xs text-destructive">
										Ya no está disponible ({ri.item.status}), no se puede aceptar.
									</div>
								{/if}
							</Table.Cell>
							<Table.Cell>{ri.item.location}</Table.Cell>
							<Table.Cell class="text-right">
								{#if reviewing}
									<div class="flex justify-end gap-1">
										<Button
											size="sm"
											variant={choices[ri.id] === 'aceptado' ? 'default' : 'outline'}
											disabled={ri.item.status !== 'disponible'}
											onclick={() => (choices[ri.id] = 'aceptado')}
										>
											Aceptar
										</Button>
										<Button
											size="sm"
											variant={choices[ri.id] === 'rechazado' ? 'destructive' : 'outline'}
											onclick={() => (choices[ri.id] = 'rechazado')}
										>
											Rechazar
										</Button>
									</div>
								{:else}
									<Badge variant={variantOf(ri.status)}>{ri.status}</Badge>
									{#if ri.reviewer}
										<div class="mt-1 text-xs text-muted-foreground">
											{ri.reviewer.name} · {formatDate(ri.reviewedAt)}
										</div>
									{/if}
								{/if}
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>

		{#if canReview}
			<Card.Footer class="flex flex-wrap items-end justify-between gap-4 border-t pt-6">
				{#if needsDate}
					<div class="grid gap-2">
						<label for="due" class="text-sm font-medium">Fecha de devolución</label>
						<Input id="due" type="date" bind:value={dueDate} class="w-44" />
					</div>
				{:else}
					<span></span>
				{/if}
				<div class="grid justify-items-end gap-2">
					{#if error}<p class="text-sm text-destructive">{error}</p>{/if}
					<Button onclick={submit} disabled={loading}>Guardar revisión</Button>
				</div>
			</Card.Footer>
		{/if}
	</Card.Root>
</div>
