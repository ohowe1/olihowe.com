<script lang="ts">
	import ShellContent, { type InitialCommand } from './shell_content.svelte';

	type ShellPageProps = {
		/**
		 * Commands to auto-run on mount
		 */
		initialCommands?: InitialCommand[];
	};

	let {
		initialCommands = [],
	}: ShellPageProps = $props();
</script>

<noscript>
  <ShellContent {initialCommands} instantInitialCommands={true} commandHint="Please enable JavaScript to get this site to work" />
  <style>
    .script-content {
      display: none;
    }
  </style>
</noscript>

<div class="script-content">
	<ShellContent {initialCommands} />
</div>
