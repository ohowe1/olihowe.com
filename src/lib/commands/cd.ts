import { type SystemState } from '../system_state';
import {
	getFileNode,
	getFilePath,
	oneArgDirectoryCompletions,
	resolvePath
} from '../system_state_util';

function cd(args: string[], systemState: SystemState): string {
	if (args.length === 0) {
		return 'cd: missing argument';
	}

	const target = args[0];
	const newFileNode = resolvePath(target, systemState);

	if (!newFileNode) {
		return `cd: no such file or directory: ${target}`;
	}

	if (newFileNode.type !== 'directory' && newFileNode.type !== 'root') {
		return `cd: not a directory: ${target}`;
	}

	const newPath: string[] = getFilePath(newFileNode);
	systemState.currentDirectory = newPath;

	return '';
}

export default {
	description: "Set the shell's current directory.",
	execute: cd,
	completions: oneArgDirectoryCompletions
};
