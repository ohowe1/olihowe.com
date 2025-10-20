<script lang="ts">
	import CommandHeader from './command_header.svelte';
	import CommandLine from './command_line.svelte';

	const {
		command,
		directory,
		output,
		timestamp: date
	}: { command: string; directory: string; output: string; timestamp: Date } = $props();
</script>

<div class="command-entry">
	<CommandHeader {directory} />
	<CommandLine timestamp={date}>{command}</CommandLine>
	<div class="output">
		{@html output}
	</div>
</div>

<style>
	.command-entry {
		margin-bottom: 0.4rem;
	}

	.output {
		white-space: pre-wrap;
	}
</style>
