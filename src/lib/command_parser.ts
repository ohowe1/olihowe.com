import cd from './commands/cd';
import echo from './commands/echo';
import pwd from './commands/pwd';
import ls from './commands/ls';
import cat from './commands/cat';
import { type SystemState } from './system_state';
import { currentDirectoryPath, resolvePath } from './system_state_util';
import rm from './commands/rm';
import mkdir from './commands/mkdir';
import touch from './commands/touch';
import { sanitize } from './util';

type Command = {
	execute: (args: string[], systemState: SystemState) => string;
	completions?: (args: string[], lastArgComplete: boolean, systemState: SystemState) => string[];
	description: string;
	hide?: boolean;
};

type FileRedirection = {
	type: 'overwrite' | 'append';
	filename: string;
};

type CommandParserCommand = {
	commandName: string;
	args: string[];
	fileRedirects: FileRedirection[];
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
	mkdir,
	touch
};

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

function splitIntoCommandTokens(input: string): string[][] {
	const splitCommands: string[][] = [];
	let currentCommand: string[] = [];
	let currentToken = '';
	let inQuotes = false;

	for (const char of input) {
		if (char === '"') {
			inQuotes = !inQuotes;
		} else if (!inQuotes && (char === ' ' || char === ';')) {
			if (currentToken) {
				currentCommand.push(currentToken);
				currentToken = '';
			}

			if (char === ';' && currentCommand.length > 0) {
				splitCommands.push(currentCommand);
				currentCommand = [];
			}
		} else {
			currentToken += char;
		}
	}
	if (currentToken.length > 0) {
		currentCommand.push(currentToken);
	}

	if (currentCommand.length > 0) {
		splitCommands.push(currentCommand);
	}

	return splitCommands;
}

function expandToken(token: string, systemState: SystemState): string {
	// Sanitize the token first to handle escape sequences
	token = sanitize(token);

	let expanded = '';

	let i = 0;
	if (token[0] === '~') {
		expanded += '/' + systemState.homeDirectory.join('/');
		i = 1;
	}

	let varName = '';
	let inVar = false;
	for (; i < token.length; i++) {
		if (token[i] === '$') {
			varName = '';
			inVar = true;
			continue;
		}

		if (inVar) {
			if (/^\w+$/.test(token[i])) {
				varName += token[i];
				continue;
			} else {
				const envVar = systemState.environmentVariables[varName];
				if (envVar) {
					expanded += envVar.value;
				}
				inVar = false;
			}
			continue;
		}

		expanded += token[i];
	}
	if (inVar) {
		const envVar = systemState.environmentVariables[varName];
		if (envVar) {
			expanded += envVar.value;
		}
	}

	return expanded;
}

function parseCommandTokens(tokens: string[], system_state: SystemState): CommandParserCommand {
	if (tokens.length === 0) {
		return {
			commandName: '',
			args: [],
			fileRedirects: []
		};
	}
	const commandName = tokens[0];
	const args: string[] = [];
	const fileRedirects: FileRedirection[] = [];

	for (let i = 1; i < tokens.length; i++) {
		if (tokens[i] == '>' || tokens[i] == '>>') {
			if (i + 1 >= tokens.length) {
				throw new Error('syntax error near unexpected token `\\n`');
			}
			const filename = expandToken(tokens[i + 1], system_state);

			fileRedirects.push({ type: tokens[i] == '>' ? 'overwrite' : 'append', filename });
			i++;
		} else {
			args.push(expandToken(tokens[i], system_state));
		}
	}

	return {
		commandName,
		args,
		fileRedirects
	};
}

function redirectToFile(
	redirection: FileRedirection,
	output: string,
	systemState: SystemState
): void {
	let fileNode = resolvePath(redirection.filename, systemState);

	if (!fileNode) {
		const newFileName = redirection.filename.split('/').pop();
		if (!newFileName) {
			throw new Error(`invalid file name: ${redirection.filename}`);
		}

		const parentPath = redirection.filename.substring(
			0,
			redirection.filename.length - newFileName.length
		);
		const parentNode = resolvePath(parentPath, systemState);

		if (!parentNode) {
			throw new Error(`no such file or directory: ${parentPath}`);
		}

		if (parentNode.type !== 'directory' && parentNode.type !== 'root') {
			throw new Error(`not a directory: ${parentPath}`);
		}

		const newFileNode = {
			name: newFileName,
			type: 'file' as const,
			children: [],
			content: '',
			parent: parentNode
		};

		parentNode.children.push(newFileNode);

		fileNode = newFileNode;
	}

	if (fileNode.type !== 'file') {
		throw new Error(`is a directory: ${redirection.filename}`);
	}

	if (redirection.type === 'overwrite') {
		fileNode.content = output;
	} else {
		fileNode.content += output;
	}
}

export function executeCommand(
	input: string,
	headerTime: Date,
	systemState: SystemState
): CommandHistoryEntry {
	const directory = currentDirectoryPath(systemState, true);

	const commandsTokens = splitIntoCommandTokens(input);
	if (commandsTokens.length === 0) {
		return {
			command: input,
			directory,
			output: '',
			timestamp: headerTime
		};
	}

	let parsedCommands: CommandParserCommand[] = [];
	try {
		for (const tokens of commandsTokens) {
			parsedCommands.push(parseCommandTokens(tokens, systemState));
		}
	} catch (error) {
		return {
			command: input,
			directory,
			output: `oli-shell: ${(error as Error).message}`,
			timestamp: headerTime
		};
	}

	let stdOuts: string[] = [];
	for (const cmd of parsedCommands) {
		const command = commands[cmd.commandName];
		if (!command) {
			stdOuts.push(`oli-shell: command not found: ${cmd.commandName}`);
			continue;
		}

		const output = command.execute(cmd.args, systemState);

		if (cmd.fileRedirects.length > 0) {
			for (const redirection of cmd.fileRedirects) {
				try {
					redirectToFile(redirection, output, systemState);
				} catch (error) {
					stdOuts.push(`oli-shell: ${(error as Error).message}`);
					break;
				}
			}
		} else {
			stdOuts.push(output);
		}
	}

	return {
		command: input,
		directory,
		output: stdOuts.join('\n'),
		timestamp: headerTime
	};
}
