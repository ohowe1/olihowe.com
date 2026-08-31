import { type FileSystemNode, type SystemState } from '../system_state';
import { allArgsFileCompletions, getFileNode, getFilePath, resolvePath } from '../system';

import { textOutput, type CommandOutput } from '../command_output';

function mv(args: string[], systemState: SystemState): CommandOutput {
	if (args.length < 2) {
		return textOutput('mv: missing argument');
	}

	const source = args[0];
	const destination = args[1];

	const sourceNode = resolvePath(source, systemState);
	if (!sourceNode) {
		return textOutput(`mv: no such file or directory: ${source}`);
	}

	if (sourceNode.type === 'root') {
		return textOutput(`mv: cannot move root directory`);
	}

	const destinationNode = resolvePath(destination, systemState);
	if (!destinationNode) {
		return textOutput(`mv: no such file or directory: ${destination}`);
	}

	if (destinationNode.type !== 'directory' && destinationNode.type !== 'root') {
		return textOutput(`mv: not a directory: ${destination}`);
	}

	// Make sure we're not moving a directory into itself
	let destinationParent: FileSystemNode | null = destinationNode;
	while (destinationParent) {
		if (destinationParent === sourceNode) {
			return textOutput(`mv: cannot move a directory into itself: ${destination}`);
		}

		destinationParent = destinationParent.parent;
	}

	// Get a reference to the current directory node from the current directory string array so we can update that string array if it was moved
	const currentDirectoryNode = getFileNode(systemState.currentDirectory, systemState);

	if (!currentDirectoryNode) {
		return textOutput(`mv: current directory does not exist. this should never happen`);
	}

	// If a file with the same name already exists in the destination, remove it so we overwrite
	destinationNode.children = destinationNode.children.filter(
		(child) => child.name !== sourceNode.name
	);

	// remove from old parent and add to new parent
	const parent = sourceNode.parent;
	parent.children = parent.children.filter((child) => child.name !== sourceNode.name);

	sourceNode.parent = destinationNode;
	destinationNode.children.push(sourceNode);

	// if we moved the current directory, update the current directory path to reflect the new location
	systemState.currentDirectory = getFilePath(currentDirectoryNode);

	return textOutput('');
}

export default {
	description: 'Move or rename a file or directory.',
	execute: mv,
	completions: allArgsFileCompletions
};
