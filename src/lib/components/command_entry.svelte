<script lang="ts">
	import CommandHeader from './command_header.svelte';
	import CommandLine from './command_line.svelte';
	import type { CommandOutput } from '$lib/command_output';

	const {
		command,
		directory,
		output,
		timestamp: date,
		execute
	}: {
		command: string;
		directory: string;
		output: CommandOutput;
		timestamp: Date;
		execute: (command: string) => Promise<void>;
	} = $props();
</script>

<div class="command-entry">
	<CommandHeader {directory} />
	<CommandLine timestamp={date}>{command}</CommandLine>
	<div class="output">
		<output.uiComponent {...output.props} {execute} />
	</div>
</div>

<style>
	.command-entry {
		margin-bottom: 0.4rem;
	}

</style>
