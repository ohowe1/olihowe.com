<script lang="ts">
	import { makeInitialSystemState } from '$lib/system_state';
	import {
		type CommandHistoryEntry,
		executeCommand,
		getCommandCompletions
	} from '$lib/command_parser';
	import CommandHeader from '$lib/components/command_header.svelte';
	import { currentDirectoryPath } from '$lib/system';
	import { onMount, tick } from 'svelte';
	import CommandEntry from '$lib/components/command_entry.svelte';
	import CommandLine from '$lib/components/command_line.svelte';

	export type InitialCommand = {
		command: string;
		forcedResult?: string;
	};

	type ShellContentProps = {
		/**
		 * Commands to auto-run on mount
		 */
		initialCommands?: InitialCommand[];

		/**
		 * Whether to instantly run initial commands without typing animation and just have them in the DOM
		 */
		instantInitialCommands?: boolean;

		/**
		 * Delay between each character when typing (ms)
		 */
		typeDelay?: number;

		/**
		 * Delay between commands (ms)
		 */
		commandDelay?: number;

		/**
		 * Delay after typing before executing (ms)
		 */
		executeDelay?: number;

		/**
		 * Placeholder text for the command input when it's enabled and no command has been run yet
		 */
		commandHint?: string;
	};

	let {
		initialCommands = [],
		typeDelay = 50,
		commandDelay = 500,
		executeDelay = 300,
		instantInitialCommands = false,
		commandHint = 'Type command here. help for help'
	}: ShellContentProps = $props();

	let commandInput: string = $state('');
	let inputElement: HTMLInputElement;

	let currentCompletions: string[] | null = null;
	let completionsIndex: number = 0;

	let inputDisabled: boolean = $state(instantInitialCommands ? false : true);
	let userRanCommand: boolean = $state(false);
	let skipTyping = false;

	const executeCommandAndUpdateState = (command: string) => {
		const result = executeCommand(command, currentTime, systemState);
		// Update current directory in case it changed
		currentDirectory = currentDirectoryPath(systemState, true);
		currentTime = new Date();
		return result;
	};

	const systemState = makeInitialSystemState();
	let currentDirectory = $state(currentDirectoryPath(systemState, true));
	let currentTime = $state(new Date());
	let commandHistory = $state<CommandHistoryEntry[]>(
		instantInitialCommands
			? initialCommands.map((cmd) => {
					const result =
						cmd.forcedResult !== undefined
							? {
									command: cmd.command,
									directory: currentDirectory,
									output: cmd.forcedResult,
									timestamp: new Date()
								}
							: executeCommandAndUpdateState(cmd.command);
					return result;
				})
			: []
	);

	const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

	onMount(async () => {
		if (instantInitialCommands) {
			inputDisabled = false;
			return;
		}
		// reset command history on mount to let the typewriter do its thing
		commandHistory = [];

		const sleepIfNotSkipping = async (ms: number) => {
			if (!skipTyping) {
				await sleep(ms);
			}
		};

		for (const cmd of initialCommands) {
			await sleepIfNotSkipping(commandDelay);
			for (const char of cmd.command) {
				commandInput += char;
				await sleepIfNotSkipping(typeDelay);
			}
			await sleepIfNotSkipping(executeDelay);

			const result =
				cmd.forcedResult !== undefined
					? {
							command: cmd.command,
							directory: currentDirectory,
							output: cmd.forcedResult,
							timestamp: new Date()
						}
					: executeCommandAndUpdateState(commandInput);

			commandInput = '';
			commandHistory.push(result);
			tick().then(() => window.scrollTo(0, document.body.scrollHeight));
		}

		inputDisabled = false;
	});

	const executeAndResetCommand = (userRan: boolean) => {
		const result = executeCommandAndUpdateState(commandInput);
		commandHistory.push(result);

		if (userRan) {
			userRanCommand = true;

			// @ts-ignore
			if (window.umami) {
				// @ts-ignore
				window.umami.track('command', { command: commandInput });
			}
		}
		commandInput = '';
		resetCompletions();

		tick().then(() => window.scrollTo(0, document.body.scrollHeight));
	};

	const resetCompletions = () => {
		currentCompletions = null;
		completionsIndex = 0;
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (inputDisabled) {
			if (event.key === ' ') {
				event.preventDefault();
				skipTyping = true;
			}
			return;
		}
		if (event.ctrlKey || event.metaKey || event.altKey) {
			return;
		}

		// the only key that is valid both when the input is focused and not is Tab
		if (event.key === 'Tab') {
			event.preventDefault();

			if (currentCompletions === null) {
				currentCompletions = getCommandCompletions(commandInput, systemState);
				completionsIndex = 0;
			} else {
				completionsIndex = (completionsIndex + 1) % currentCompletions.length;
			}

			if (currentCompletions.length > completionsIndex) {
				commandInput = currentCompletions[completionsIndex];
			}
		}

		if (document.activeElement === inputElement) {
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

			resetCompletions();
		}
	};
</script>

<svelte:window onkeydown={handleKeyDown} />

<main>
	{#each commandHistory as entry (entry.timestamp.getTime() + entry.command)}
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
				placeholder={!inputDisabled && !userRanCommand ? commandHint : undefined}
				disabled={inputDisabled}
				bind:value={commandInput}
				bind:this={inputElement}
				oninput={resetCompletions}
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
