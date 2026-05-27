import { type SystemState } from '../system_state';
import { fileCompletions, oneArgDirectoryCompletions, resolvePath } from '../system';

import { textOutput, type CommandOutput } from '../command_output';

function mkdir(args: string[], systemState: SystemState): CommandOutput {
	if (args.length === 0) {
		return textOutput('mkdir: missing argument');
	}

	const target = args[0];

	const newDirectoryName = target.split('/').pop();
	if (!newDirectoryName) {
		return textOutput(`mkdir: invalid directory name: ${target}`);
	}

	const parentPath = target.substring(0, target.length - newDirectoryName.length);
	const parentNode = resolvePath(parentPath, systemState);

	if (!parentNode) {
		return textOutput(`mkdir: no such file or directory: ${parentPath}`);
	}

	if (parentNode.type !== 'directory' && parentNode.type !== 'root') {
		return textOutput(`mkdir: not a directory: ${parentPath}`);
	}

	const existingNode = parentNode.children.find((child) => child.name === newDirectoryName);
	if (existingNode) {
		return textOutput(`mkdir: ${target}: file exists`);
	}

	const newFileNode = {
		name: newDirectoryName,
		type: 'directory' as const,
		children: [],
		parent: parentNode
	};

	parentNode.children.push(newFileNode);

	return textOutput('');
}

export default {
	description: 'Create a new directory.',
	execute: mkdir,
	completions: oneArgDirectoryCompletions
};
