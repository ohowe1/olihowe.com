<script lang="ts">
	import ShellPage from '$lib/components/shell_page.svelte';
	import { page } from '$app/state';
	import type { InitialCommand } from '$lib/components/shell_content.svelte';
	import { building } from '$app/environment';

	let pageUrl = 'https://olihowe.com/404';
	// In the case that they have noscript, it will use the prerendered URL so switch that
	if (building) {
		pageUrl = page.url.href;
	}

	const initialCommands: InitialCommand[] = [
		{ command: `curl -I ${pageUrl}`, forcedResult: 'HTTP/2 404: Page Not Found' },
		{ command: 'echo $HOMEPAGE' }
	];
</script>

<svelte:head>
	<title>404 Not Found - Oliver Howe</title>
</svelte:head>

<ShellPage {initialCommands} />
