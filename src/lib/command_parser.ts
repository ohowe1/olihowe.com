import cd from './commands/cd';
import echo from './commands/echo';
import pwd from './commands/pwd';
import ls from './commands/ls';
import cat from './commands/cat';
import { type SystemState } from './system_state';
import { currentDirectoryPath, resolvePath } from './system';
import rm from './commands/rm';
import mkdir from './commands/mkdir';
import touch from './commands/touch';
import mv from './commands/mv';
import export_ from './commands/export';
import { sanitize } from './util';
import { type CommandOutput, textOutput } from './command_output';

import MultiOutput from './components/outputs/MultiOutput.svelte';

export type Command = {
	execute: (args: string[], systemState: SystemState) => CommandOutput;
	completions?: (tokens: string[], systemState: SystemState) => string[];
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
	output: CommandOutput;
	timestamp: Date;
};

const commands: Record<string, Command> = {
	'': {
		description: 'No command entered.',
		execute: () => textOutput(''),
		hide: true
	},
	help: {
		description: 'List available commands.',
		execute: (_args: string[], _systemState: SystemState): CommandOutput => {
			const commandList = Object.entries(commands)
				.filter(([, cmd]) => !cmd.hide)
				.map(([name, cmd]) => `${name}: ${cmd.description}`)
				.join('\n');
			return textOutput(`Available commands:\n${commandList}`);
		}
	},
	cd,
	echo,
	pwd,
	ls,
	cat,
	rm,
	mkdir,
	touch,
	mv,
	"export": export_
};

function remakeTokens(tokens: string[][]): string {
	// This is kind of hacky and bad
	let result = '';
	for (let i = 0; i < tokens.length; i++) {
		if (i > 0) {
			result += '; ';
		}
		for (let j = 0; j < tokens[i].length; j++) {
			if (j > 0) {
				result += ' ';
			}

			if (tokens[i][j].includes(' ')) {
				result += `"${tokens[i][j]}"`;
			} else {
				result += tokens[i][j];
			}
		}
	}

	return result;
}

export function getCommandCompletions(input: string, systemState: SystemState): string[] {
	const tokens = splitIntoCommandTokens(input, true);
	const lastCommand = tokens[tokens.length - 1];

	const lastToken = lastCommand[lastCommand.length - 1];

	let options: string[] = [];
	if (lastCommand.length <= 1) {
		// Suggest command names
		options = Object.keys(commands).filter(
			(cmd) => !commands[cmd].hide && cmd.startsWith(lastToken)
		);
		options.sort();
	} else {
		// Suggest arguments for the specific command
		const command = commands[lastCommand[0]];

		if (command && command.completions) {
			options = command.completions(lastCommand.slice(1), systemState);
		}
	}
	const fullCompletions = [];
	for (const option of options) {
		fullCompletions.push(
			remakeTokens([...tokens.slice(0, -1), [...lastCommand.slice(0, -1), option]])
		);
	}

	return fullCompletions;
}

function splitIntoCommandTokens(input: string, pushIncomplete: boolean = false): string[][] {
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

	if (inQuotes && !pushIncomplete) {
		throw new Error('syntax error: unmatched quotes');
	}

	if (pushIncomplete || currentToken.length > 0) {
		currentCommand.push(currentToken);
	}

	if (pushIncomplete || currentCommand.length > 0) {
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
				throw new Error('syntax error: unexpected token `\\n`');
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
	output: CommandOutput,
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

	const newContent = output.rawValue;

	if (redirection.type === 'overwrite') {
		fileNode.content = newContent;
	} else {
		if (typeof fileNode.content === 'string' && typeof newContent === 'string') {
			fileNode.content += newContent;
		} else {
			const contentsA = fileNode.content === ''
				? []
				: (Array.isArray(fileNode.content) ? fileNode.content : [fileNode.content]);
			const contentsB = Array.isArray(newContent) ? newContent : [newContent];
			fileNode.content = [...contentsA, ...contentsB];
		}
	}
}

export function executeCommand(
	input: string,
	headerTime: Date,
	systemState: SystemState
): CommandHistoryEntry {
	const directory = currentDirectoryPath(systemState, true);

	try {
		const commandsTokens = splitIntoCommandTokens(input);
		if (commandsTokens.length === 0) {
			return {
				command: input,
				directory,
				output: textOutput(''),
				timestamp: headerTime
			};
		}

		let parsedCommands: CommandParserCommand[] = [];
		for (const tokens of commandsTokens) {
			parsedCommands.push(parseCommandTokens(tokens, systemState));
		}

		let stdOuts: CommandOutput[] = [];
		for (const cmd of parsedCommands) {
			const command = commands[cmd.commandName];
			if (!command) {
				stdOuts.push(textOutput(`oli-shell: command not found: ${cmd.commandName}`));
				continue;
			}

			let output: CommandOutput;
			try {
				output = command.execute(cmd.args, systemState);
			} catch (error) {
				stdOuts.push(textOutput(`oli-shell: ${(error as Error).message}`));
				continue;
			}

			if (cmd.fileRedirects.length > 0) {
				for (const redirection of cmd.fileRedirects) {
					try {
						redirectToFile(redirection, output, systemState);
					} catch (error) {
						stdOuts.push(textOutput(`oli-shell: ${(error as Error).message}`));
						break;
					}
				}
			} else {
				stdOuts.push(output);
			}
		}

		let finalOutput: CommandOutput;
		if (stdOuts.length === 0) {
			finalOutput = textOutput('');
		} else if (stdOuts.length === 1) {
			finalOutput = stdOuts[0];
		} else {
			finalOutput = {
				uiComponent: MultiOutput,
				props: { outputs: stdOuts },
				rawValue: stdOuts.map((o) => o.rawValue)
			};
		}

		return {
			command: input,
			directory,
			output: finalOutput,
			timestamp: headerTime
		};
	} catch (error) {
		return {
			command: input,
			directory,
			output: textOutput(`oli-shell: ${(error as Error).message}`),
			timestamp: headerTime
		};
	}
}
