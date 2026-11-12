<script lang="ts">
	import * as Dialog from '#lib/components/ui/dialog/index.ts';
	import { Button } from '#lib/components/ui/button/index.ts';
	import { Input } from '#lib/components/ui/input/index.ts';
	import { Label } from '#lib/components/ui/label/index.ts';
	import type { Item, UserOption } from '#lib/types/inventory.ts';

	let {
		open = $bindable(false),
		item = null,
		onsaved
	}: { open?: boolean; item?: Item | null; onsaved?: () => void } = $props();

	let users = $state<UserOption[]>([]);
	let userId = $state('');
	let dueDate = $state('');
	let error = $state('');
	let loading = $state(false);

	function defaultDue() {
		const d = new Date();
		d.setDate(d.getDate() + 7);
		return d.toISOString().slice(0, 10);
	}

	$effect(() => {
		if (!open) return;
		userId = '';
		dueDate = defaultDue();
		error = '';
		if (users.length === 0) {
			fetch('/api/users')
				.then((r) => (r.ok ? r.json() : []))
				.then((rows) => (users = rows));
		}
	});

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		if (!item) return;
		if (!userId) return (error = 'Elige un usuario');
		loading = true;
		error = '';

		const res = await fetch(`/api/inventory/${item.id}/lend`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				userId,
				returnExpectedAt: new Date(`${dueDate}T23:59:59`).toISOString()
			})
		});
		loading = false;

		if (!res.ok) {
			const body = await res.json().catch(() => null);
			return (error = body?.message ?? 'No se pudo registrar el préstamo');
		}
		open = false;
		onsaved?.();
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>Prestar ítem</Dialog.Title>
			<Dialog.Description>{item?.name} · {item?.sku}</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={submit} class="grid gap-4">
			<div class="grid gap-2">
				<Label for="lend-user">Usuario</Label>
				<select
					id="lend-user"
					bind:value={userId}
					required
					class="h-9 rounded-md border bg-transparent px-3 text-sm"
				>
					<option value="" disabled>Selecciona…</option>
					{#each users as u (u.id)}
						<option value={u.id}>{u.name} ({u.email})</option>
					{/each}
				</select>
			</div>

			<div class="grid gap-2">
				<Label for="lend-due">Fecha de devolución</Label>
				<Input id="lend-due" type="date" bind:value={dueDate} required />
			</div>

			{#if error}<p class="text-sm text-destructive">{error}</p>{/if}

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (open = false)}>Cancelar</Button>
				<Button type="submit" disabled={loading}>Prestar</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
