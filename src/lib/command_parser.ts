import cd from './commands/cd';
import echo from './commands/echo';
import pwd from './commands/pwd';
import ls from './commands/ls';
import cat from './commands/cat';
import { type SystemState } from './system_state';
import { currentDirectoryPath } from './system_state_util';
import rm from './commands/rm';
import mkdir from './commands/mkdir';

type Command = {
	execute: (args: string[], systemState: SystemState) => string;
	completions?: (args: string[], lastArgComplete: boolean, systemState: SystemState) => string[];
	description: string;
	hide?: boolean;
};

export type CommandHistoryEntry = {
	command: string;
	directory: string;
	output: string;
	timestamp: Date;
};

const commands: Record<string, Command> = {
	'': {
		description: 'No command entered.',
		execute: () => '',
		hide: true
	},
	help: {
		description: 'List available commands.',
		execute: (_args: string[], _systemState: SystemState): string => {
			const commandList = Object.entries(commands)
				.filter(([, cmd]) => !cmd.hide)
				.map(([name, cmd]) => `${name}: ${cmd.description}`)
				.join('\n');
			return `Available commands:\n${commandList}`;
		}
	},
	cd,
	echo,
	pwd,
	ls,
	cat,
	rm,
	mkdir
};

function runCommand(commandName: string, args: string[], systemState: SystemState): string {
	const command = commands[commandName];
	if (!command) {
		return `oli-shell: command not found: ${commandName}`;
	}

	return command.execute(args, systemState);
}

export function getCommandCompletions(input: string, systemState: SystemState): string[] {
	const tokens = input.trim().split(' ');
	const lastTokenComplete = input.endsWith(' ');
	const commandName = tokens[0];
	const args = tokens.slice(1);

	if (tokens.length === 1 && !lastTokenComplete) {
		// Suggest command names
		let result = Object.keys(commands).filter(
			(cmd) => !commands[cmd].hide && cmd.startsWith(commandName)
		);
		result.sort();

		return result;
	} else {
		// Suggest arguments for the specific command
		const command = commands[commandName];
		if (command && command.completions) {
			const commandResults = command.completions(
				args,
				lastTokenComplete && tokens.length > 1,
				systemState
			);

			for (let i = 0; i < commandResults.length; i++) {
				commandResults[i] = commandName + ' ' + commandResults[i];
			}

			return commandResults;
		}
	}

	return [];
}

export function executeCommand(
	input: string,
	headerTime: Date,
	systemState: SystemState
): CommandHistoryEntry {
	const directory = currentDirectoryPath(systemState, true);

	const tokens = input.trim().split(' ');

	const commandName = tokens[0];
	const args = tokens.slice(1);

	const output = runCommand(commandName, args, systemState);

	return {
		command: input,
		directory,
		output,
		timestamp: headerTime
	};
}
