import { type SystemState } from '../system_state';
import { getFileNode, oneArgDirectoryCompletions } from '../system';

function ls(args: string[], systemState: SystemState): string {
	const currentDir = systemState.currentDirectory;
	const fileNode = getFileNode(currentDir, systemState);

	if (!fileNode || (fileNode.type !== 'directory' && fileNode.type !== 'root')) {
		return 'ls: cannot access directory';
	}

	return fileNode.children.map((child) => child.name).join(' ');
}

export default {
	description: 'List directory contents.',
	execute: ls,
	completions: oneArgDirectoryCompletions
};
