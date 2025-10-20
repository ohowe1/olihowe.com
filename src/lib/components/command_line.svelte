<script lang="ts">
	import type { Snippet } from 'svelte';

	const { children, timestamp }: { children: Snippet; timestamp: Date } = $props();
</script>

<div class="command-line">
	<span class="caret">›&nbsp;</span><span class="content">{@render children?.()}</span><span
		>[{timestamp.toLocaleTimeString([], {
			hour12: false,
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		})}]</span
	>
</div>

<style>
	.caret {
		user-select: none;
	}
	.content {
		flex-grow: 1;
	}
	.command-line {
		display: flex;
		align-items: center;
	}
</style>
