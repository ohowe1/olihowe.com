<script lang="ts">
	import ShellPage from '$lib/components/shell_page.svelte';
	import { page } from '$app/state';
	import type { InitialCommand } from '$lib/components/shell_content.svelte';

	// Generate error message based on status code
	const errorMessage = page.status === 404 
		? '404: Page not found' 
		: `${page.status}: ${page.error?.message || 'An error occurred'}`;

	const initialCommands: InitialCommand[] = [{command: `curl -I ${page.url.href}`, forcedResult: errorMessage}, {command: 'echo $HOMEPAGE'}];
</script>

<svelte:head>
	<title>{errorMessage} - Oliver Howe</title>
</svelte:head>

<ShellPage {initialCommands} />
