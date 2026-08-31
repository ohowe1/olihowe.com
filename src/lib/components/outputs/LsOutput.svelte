<script lang="ts">
	import type { FileSystemNode } from '$lib/system_state';

	let {
		children,
		execute
	}: {
		children: FileSystemNode[];
		execute: (command: string) => Promise<void>;
	} = $props();

	const handleItemClick = (node: FileSystemNode) => {
		if (node.type === 'directory') {
			execute(`cd ${node.name}`).then(() => {
				execute('ls');
			});
		} else if (node.type === 'file') {
			execute(`cat ${node.name}`);
		}
	};
</script>

<div class="ls-output">
	{#each children as child}
		{#if !child.hidden}
			<button type="button" class="ls-item {child.type}" onclick={() => handleItemClick(child)}
				>{child.name}</button
			>{' '}
		{/if}
	{/each}
</div>

<style>
	.ls-output {
		display: inline;
	}

	.ls-item {
		background: none;
		border: none;
		padding: 0;
		margin: 0;
		cursor: pointer;
		outline: none;
		display: inline;
		transition: all 0.15s ease-in-out;
	}

	.ls-item:hover {
		text-decoration: underline;
	}

	.directory {
		color: var(--blue);
	}

	.file {
		color: var(--white);
	}
</style>
