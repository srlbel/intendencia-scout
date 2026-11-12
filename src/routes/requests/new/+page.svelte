<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Card from '#lib/components/ui/card/index.ts';
	import { Button } from '#lib/components/ui/button/index.ts';
	import { Input } from '#lib/components/ui/input/index.ts';
	import { Label } from '#lib/components/ui/label/index.ts';
	import { Textarea } from '#lib/components/ui/textarea/index.ts';
	import { Checkbox } from '#lib/components/ui/checkbox/index.ts';

	let { data } = $props();

	let purpose = $state('');
	let description = $state('');
	let search = $state('');
	let selected = $state<string[]>([]);
	let error = $state('');
	let loading = $state(false);

	const filtered = $derived(
		data.items.filter((i) => {
			const q = search.trim().toLowerCase();
			return !q || i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q);
		})
	);

	function toggle(id: string, on: boolean) {
		selected = on ? [...selected, id] : selected.filter((x) => x !== id);
	}

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		if (selected.length === 0) return (error = 'Selecciona al menos un ítem');
		loading = true;
		error = '';

		const res = await fetch('/api/requests', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				purpose,
				description: description || null,
				itemIds: selected
			})
		});
		loading = false;

		if (!res.ok) {
			const body = await res.json().catch(() => null);
			return (error = body?.message ?? 'No se pudo crear la solicitud');
		}
		const created = await res.json();
		await goto(`/requests/${created.id}`, { invalidateAll: true });
	}
</script>

<div class="grid max-w-5xl gap-6">
	<h1 class="text-2xl font-semibold">Nueva solicitud</h1>

	<form onsubmit={submit} class="grid gap-6">
		<Card.Root>
			<Card.Content class="grid gap-4 pt-6">
				<div class="grid gap-2">
					<Label for="purpose">Propósito</Label>
					<Input id="purpose" bind:value={purpose} required />
				</div>
				<div class="grid gap-2">
					<Label for="description">Descripción (opcional)</Label>
					<Textarea id="description" bind:value={description} rows={3} />
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Ítems disponibles</Card.Title>
				<Card.Description>{selected.length} seleccionado(s)</Card.Description>
			</Card.Header>
			<Card.Content class="grid gap-3">
				<Input placeholder="Buscar por nombre o SKU" bind:value={search} />

				<div class="grid max-h-96 gap-1 overflow-y-auto">
					{#each filtered as i (i.id)}
						<Label
							for="item-{i.id}"
							class="flex cursor-pointer items-center gap-3 rounded-md border p-3 hover:bg-muted/50"
						>
							<Checkbox
								id="item-{i.id}"
								checked={selected.includes(i.id)}
								onCheckedChange={(v) => toggle(i.id, v === true)}
							/>
							<div class="grid">
								<span class="font-medium">{i.name}</span>
								<span class="text-xs font-normal text-muted-foreground">
									{i.sku} · {i.location}
								</span>
							</div>
						</Label>
					{:else}
						<p class="py-6 text-center text-sm text-muted-foreground">
							No hay ítems disponibles.
						</p>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>

		{#if error}<p class="text-sm text-destructive">{error}</p>{/if}

		<div class="flex justify-end gap-2">
			<Button href="/requests" variant="outline">Cancelar</Button>
			<Button type="submit" disabled={loading}>Enviar solicitud</Button>
		</div>
	</form>
</div>
