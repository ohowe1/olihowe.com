<script lang="ts">
	import { makeInitialSystemState } from '$lib/system_state';
	import { type CommandHistoryEntry, executeCommand } from '$lib/command_parser';
	import CommandHeader from '$lib/components/command_header.svelte';
	import { currentDirectoryPath } from '$lib/system_state_util';
	import { onMount } from 'svelte';
	import CommandEntry from '$lib/components/command_entry.svelte';
	import CommandLine from '$lib/components/command_line.svelte';

	let commandInput: string = $state('');
	let inputElement: HTMLInputElement;

	let inputDisabled: boolean = $state(true);
	let firstRan: boolean = $state(false);
	let goFast = false;

	const systemState = makeInitialSystemState();
	let currentDirectory = $state(currentDirectoryPath(systemState, true));
	let currentTime = $state(new Date());
	let commandHistory = $state<CommandHistoryEntry[]>([]);

	const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

	onMount(async () => {
		// reset command history on mount to let the typewriter do its thing
		commandHistory = [];

		const commandsToRun = ['echo $NAME', 'cat description.txt', 'echo $GITHUB', 'echo $LINKEDIN'];

		const sleepIfNotFast = async (ms: number) => {
			if (!goFast) {
				await sleep(ms);
			}
		};

		for (const cmd of commandsToRun) {
			await sleepIfNotFast(500);
			for (const char of cmd) {
				commandInput += char;
				await sleepIfNotFast(50);
			}
			await sleepIfNotFast(300);
			executeAndResetCommand(false);
		}

		inputDisabled = false;
	});

	const executeAndResetCommand = (userRan: boolean) => {
		const result = executeCommand(commandInput, currentTime, systemState);
		commandHistory.push(result);

		commandInput = '';
		if (userRan) {
			firstRan = true;

			// @ts-ignore
			if (window.umami) {
				// @ts-ignore
				window.umami.track('command', { command: commandInput });
			}
		}
		// Update current directory in case it changed
		currentDirectory = currentDirectoryPath(systemState, true);
		currentTime = new Date();

		setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 0);
	};

	const handleKeyDown = async (event: KeyboardEvent) => {
		if (inputDisabled) {
			if (event.key === ' ') {
				event.preventDefault();
				goFast = true;
			}
			return;
		}
		if (document.activeElement === inputElement) {
			return;
		}
		if (event.ctrlKey || event.metaKey || event.altKey) {
			return;
		}
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			executeAndResetCommand(true);
			inputElement.focus();
		} else if (event.key.length === 1) {
			// only do it for normal keys
			event.preventDefault();
			inputElement.focus();
			commandInput += event.key;
		}
	};
</script>

<svelte:window onkeydown={handleKeyDown} />

<svelte:head>
	<title>Oliver Howe</title>
	<meta name="description" content="Portfolio website for Oliver Howe, a computer engineering student at Harvey Mudd College" />
</svelte:head>

<main>
	{#each commandHistory as entry}
		<CommandEntry
			command={entry.command}
			directory={entry.directory}
			output={entry.output}
			timestamp={entry.timestamp}
		/>
	{/each}

	<CommandHeader directory={currentDirectory} />
	<form
		onsubmit={(e) => {
			e.preventDefault();
			executeAndResetCommand(true);
		}}
	>
		<CommandLine timestamp={currentTime}>
			<input
				id="command-input"
				type="text"
				placeholder={!inputDisabled && !firstRan ? 'Type command here. help for help' : undefined}
				disabled={inputDisabled}
				bind:value={commandInput}
				bind:this={inputElement}
			/>
		</CommandLine>
	</form>
</main>

<style>
	#command-input {
		font-family: monospace;
		color: #acb1bd;
		background-color: transparent;
		border: none;
		outline: none;
		font-size: 16px;
		padding: 0px;
		margin: 0px;
		display: inline;
		width: 100%;
	}
</style>
