import { type SystemState } from '../system_state';
import { oneArgFileCompletions, resolvePath } from '../system_state_util';

function touch(args: string[], systemState: SystemState): string {
	if (args.length === 0) {
		return 'touch: missing argument';
	}

	const target = args[0];

	const newFileName = target.split('/').pop();
	if (!newFileName) {
		return `touch: invalid file name: ${target}`;
	}

	const parentPath = target.substring(0, target.length - newFileName.length);
	const parentNode = resolvePath(parentPath, systemState);

	if (!parentNode) {
		return `touch: no such file or directory: ${parentPath}`;
	}

	if (parentNode.type !== 'directory' && parentNode.type !== 'root') {
		return `touch: not a directory: ${parentPath}`;
	}

	const existingNode = parentNode.children.find((child) => child.name === newFileName);
	if (existingNode) {
		return `touch: ${target}: file exists`;
	}

	const newFileNode = {
		name: newFileName,
		type: 'file' as const,
		children: [],
    content: '',
		parent: parentNode
	};

	parentNode.children.push(newFileNode);

	return '';
}

export default {
	description: 'Create a new file.',
	execute: touch,
	completions: oneArgFileCompletions
};
