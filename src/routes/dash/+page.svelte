<script lang="ts">
	import AdminDash from '#lib/components/dash/admin-dash.svelte';
	import UserDash from '#lib/components/dash/user-dash.svelte';

	let { data } = $props();
</script>

<div class="grid gap-6">
	<h1 class="text-2xl font-semibold">Panel</h1>

	{#if data.dash.role === 'admin'}
		<AdminDash dash={data.dash} />
	{:else}
		<UserDash dash={data.dash} />
	{/if}
</div>
