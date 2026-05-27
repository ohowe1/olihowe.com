import { type SystemState } from '../system_state';
import { oneArgFileCompletions, resolvePath } from '../system';

import { textOutput, type CommandOutput } from '../command_output';

function touch(args: string[], systemState: SystemState): CommandOutput {
	if (args.length === 0) {
		return textOutput('touch: missing argument');
	}

	const target = args[0];

	const newFileName = target.split('/').pop();
	if (!newFileName) {
		return textOutput(`touch: invalid file name: ${target}`);
	}

	const parentPath = target.substring(0, target.length - newFileName.length);
	const parentNode = resolvePath(parentPath, systemState);

	if (!parentNode) {
		return textOutput(`touch: no such file or directory: ${parentPath}`);
	}

	if (parentNode.type !== 'directory' && parentNode.type !== 'root') {
		return textOutput(`touch: not a directory: ${parentPath}`);
	}

	const existingNode = parentNode.children.find((child) => child.name === newFileName);
	if (existingNode) {
		return textOutput(`touch: ${target}: file exists`);
	}

	const newFileNode = {
		name: newFileName,
		type: 'file' as const,
		children: [],
		content: '',
		parent: parentNode
	};

	parentNode.children.push(newFileNode);

	return textOutput('');
}

export default {
	description: 'Create a new file.',
	execute: touch,
	completions: oneArgFileCompletions
};
