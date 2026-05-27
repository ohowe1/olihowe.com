<script lang="ts">
	import type { FileContent } from '$lib/system_state';
import FileContentRenderer from './FileContentRenderer.svelte';

	let {
		contents,
		execute
	}: {
		contents: FileContent[];
		execute: (command: string) => void;
	} = $props();
</script>

<div class="sequence-output">
	{#each contents as item}
		<FileContentRenderer content={item} {execute} />
	{/each}
</div>

<style>
	.sequence-output {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
</style>
