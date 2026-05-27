import { type SystemState } from '../system_state';
import {
	getFileNode,
	getFilePath,
	oneArgDirectoryCompletions,
	resolvePath
} from '../system';

import { textOutput, type CommandOutput } from '../command_output';

function cd(args: string[], systemState: SystemState): CommandOutput {
	if (args.length === 0) {
		return textOutput('cd: missing argument');
	}

	const target = args[0];
	const newFileNode = resolvePath(target, systemState);

	if (!newFileNode) {
		return textOutput(`cd: no such file or directory: ${target}`);
	}

	if (newFileNode.type !== 'directory' && newFileNode.type !== 'root') {
		return textOutput(`cd: not a directory: ${target}`);
	}

	const newPath: string[] = getFilePath(newFileNode);
	systemState.currentDirectory = newPath;

	return textOutput('');
}

export default {
	description: "Set the shell's current directory.",
	execute: cd,
	completions: oneArgDirectoryCompletions
};
