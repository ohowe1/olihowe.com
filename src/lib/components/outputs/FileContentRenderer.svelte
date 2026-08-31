<script lang="ts">
	import type { FileContent } from '$lib/system_state';
	import TextOutput from './TextOutput.svelte';
	import SequenceOutput from './SequenceOutput.svelte';

	let {
		content,
		execute
	}: {
		content: FileContent;
		execute: (command: string) => Promise<void>;
	} = $props();

	let ContentComponent = $derived(content as any);
</script>

{#if typeof content === 'string'}
	<TextOutput text={content} />
{:else if Array.isArray(content)}
	<SequenceOutput contents={content} {execute} />
{:else}
	<ContentComponent {execute} />
{/if}
