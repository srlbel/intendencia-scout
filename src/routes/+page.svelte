<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '#lib/auth-client.ts';
	import { Button } from '#lib/components/ui/button/index.ts';
	import { Input } from '#lib/components/ui/input/index.ts';
	import { Label } from '#lib/components/ui/label/index.ts';
	import * as Card from '#lib/components/ui/card/index.ts';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		error = '';
		const { error: err } = await authClient.signIn.email({ email, password });
		loading = false;
		if (err) return (error = err.message ?? 'No se pudo iniciar sesión');
		await goto('/dash', { invalidateAll: true });
	}
</script>

<main class="grid min-h-screen place-items-center p-4">
	<Card.Root class="w-full max-w-sm">
		<Card.Header><Card.Title>Iniciar sesión</Card.Title></Card.Header>
		<form onsubmit={submit}>
			<Card.Content class="grid gap-4">
				<div class="grid gap-2">
					<Label for="email">Correo</Label>
					<Input id="email" type="email" bind:value={email} required />
				</div>
				<div class="grid gap-2">
					<Label for="password">Contraseña</Label>
					<Input id="password" type="password" bind:value={password} required />
				</div>
				{#if error}<p class="text-sm text-destructive">{error}</p>{/if}
			</Card.Content>
			<Card.Footer class="flex-col gap-2">
				<Button type="submit" class="w-full" disabled={loading}>Entrar</Button>
			</Card.Footer>
		</form>
	</Card.Root>
</main>
