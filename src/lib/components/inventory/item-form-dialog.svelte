<script lang="ts">
	import * as Dialog from '#lib/components/ui/dialog/index.ts';
	import { Button } from '#lib/components/ui/button/index.ts';
	import { Input } from '#lib/components/ui/input/index.ts';
	import { Label } from '#lib/components/ui/label/index.ts';
	import { Textarea } from '#lib/components/ui/textarea/index.ts';
	import type { Item } from '#lib/types/inventory.ts';

	let {
		open = $bindable(false),
		item = null,
		onsaved
	}: { open?: boolean; item?: Item | null; onsaved?: () => void } = $props();

	let form = $state({
		sku: '',
		name: '',
		location: '',
		imageUrl: '',
		observations: '',
		status: 'disponible'
	});
	let error = $state('');
	let loading = $state(false);

	// Reset the form every time the dialog opens
	$effect(() => {
		if (!open) return;
		form = {
			sku: item?.sku ?? '',
			name: item?.name ?? '',
			location: item?.location ?? '',
			imageUrl: item?.imageUrl ?? '',
			observations: item?.observations ?? '',
			status: item?.status ?? 'disponible'
		};
		error = '';
	});

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		error = '';

		const payload: Record<string, unknown> = {
			sku: form.sku,
			name: form.name,
			location: form.location,
			imageUrl: form.imageUrl.trim() || null,
			observations: form.observations.trim() || null
		};
		// A loaned item changes status only through the return flow
		if (item && item.status !== 'prestado') payload.status = form.status;

		const res = await fetch(item ? `/api/inventory/${item.id}` : '/api/inventory', {
			method: item ? 'PATCH' : 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(payload)
		});
		loading = false;

		if (!res.ok) {
			const body = await res.json().catch(() => null);
			return (error = body?.message ?? 'No se pudo guardar');
		}
		open = false;
		onsaved?.();
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-lg">
		<Dialog.Header>
			<Dialog.Title>{item ? 'Editar ítem' : 'Nuevo ítem'}</Dialog.Title>
		</Dialog.Header>

		<form onsubmit={submit} class="grid gap-4">
			<div class="grid grid-cols-2 gap-4">
				<div class="grid gap-2">
					<Label for="sku">SKU</Label>
					<Input id="sku" bind:value={form.sku} required />
				</div>
				<div class="grid gap-2">
					<Label for="name">Nombre</Label>
					<Input id="name" bind:value={form.name} required />
				</div>
			</div>

			<div class="grid gap-2">
				<Label for="location">Ubicación</Label>
				<Input id="location" bind:value={form.location} required />
			</div>

			<div class="grid gap-2">
				<Label for="imageUrl">URL de imagen (opcional)</Label>
				<Input id="imageUrl" type="url" bind:value={form.imageUrl} />
			</div>

			<div class="grid gap-2">
				<Label for="observations">Observaciones (opcional)</Label>
				<Textarea id="observations" rows={3} bind:value={form.observations} />
			</div>

			{#if item}
				<div class="grid gap-2">
					<Label for="status">Estado</Label>
					<select
						id="status"
						bind:value={form.status}
						disabled={item.status === 'prestado'}
						class="h-9 rounded-md border bg-transparent px-3 text-sm disabled:opacity-50"
					>
						{#if item.status === 'prestado'}
							<option value="prestado">prestado</option>
						{:else}
							<option value="disponible">disponible</option>
							<option value="desconocido">desconocido</option>
						{/if}
					</select>
					{#if item.status === 'prestado'}
						<p class="text-xs text-muted-foreground">
							Para cambiar el estado, registra la devolución primero.
						</p>
					{/if}
				</div>
			{/if}

			{#if error}<p class="text-sm text-destructive">{error}</p>{/if}

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (open = false)}>Cancelar</Button>
				<Button type="submit" disabled={loading}>Guardar</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
