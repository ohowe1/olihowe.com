<script lang="ts">
	import type { CommandOutput } from '$lib/command_output';

	let {
		outputs,
		execute
	}: {
		outputs: CommandOutput[];
		execute: (command: string) => void;
	} = $props();
</script>

<div class="multi-output">
	{#each outputs as output}
		<div class="sub-output">
			<output.uiComponent {...output.props} {execute} />
		</div>
	{/each}
</div>

<style>
	.multi-output {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.sub-output {
		display: contents;
	}
</style>
