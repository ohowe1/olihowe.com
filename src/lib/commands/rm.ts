import type { FileSystemNode, SystemState } from '$lib/system_state';
import { getFileNode, getFilePath, resolvePath } from '$lib/system_state_util';

function rm(args: string[], systemState: SystemState): string {
	if (args.length === 0) {
		return 'rm: missing argument';
	}

	let removingFile = true;
	if (args[0].startsWith('-')) {
		const flags = args[0].slice(1).split('');
		for (const flag of flags) {
			if (flag === 'r') {
				removingFile = false;
			} else if (flag === 'f') {
				continue;
			} else {
				return `rm: invalid option -- '${flag}'`;
			}
		}

		args.shift();
	}

	if (args.length === 0) {
		return 'rm: missing argument';
	}

	const target = args[0];

	let fileNode = resolvePath(target, systemState);

	if (!fileNode) {
		return `rm: no such file or directory: ${target}`;
	}

	if (fileNode.type === 'root') {
		return `rm: cannot remove root directory`;
	}
	if (removingFile && fileNode.type !== 'file') {
		return `rm: '${target}': is a directory`;
	}
	if (!removingFile && fileNode.type !== 'directory') {
		return `rm: not a directory: ${target}`;
	}

	const parent = fileNode.parent;
	// remove from parent's children
	parent.children = parent.children.filter((child: FileSystemNode) => child.name !== fileNode.name);

	// if we removed the current directory, move to parent
	if (!getFileNode(systemState.currentDirectory, systemState)) {
		systemState.currentDirectory = getFilePath(parent);
	}

	return '';
}

export default {
	description: 'Remove a file or directory.',
	execute: rm
};
