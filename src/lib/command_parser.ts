import cd from './commands/cd';
import echo from './commands/echo';
import pwd from './commands/pwd';
import ls from './commands/ls';
import cat from './commands/cat';
import { type SystemState } from './system_state';
import { currentDirectoryPath } from './system_state_util';
import rm from './commands/rm';

type Command = {
	execute: (args: string[], systemState: SystemState) => string;
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
		execute: (args: string[], systemState: SystemState): string => {
			const commandList = Object.entries(commands)
				.filter(([name, cmd]) => !cmd.hide)
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
	rm
};

function runCommand(commandName: string, args: string[], systemState: SystemState): string {
	const command = commands[commandName];
	if (!command) {
		return `oli-shell: command not found: ${commandName}`;
	}

	return command.execute(args, systemState);
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
