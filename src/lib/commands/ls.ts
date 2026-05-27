import { type SystemState } from '../system_state';
import { getFileNode, oneArgDirectoryCompletions } from '../system';
import { type CommandOutput, textOutput } from '../command_output';
import LsOutput from '../components/outputs/LsOutput.svelte';

function ls(args: string[], systemState: SystemState): CommandOutput {
	const currentDir = systemState.currentDirectory;
	const fileNode = getFileNode(currentDir, systemState);

	if (!fileNode || (fileNode.type !== 'directory' && fileNode.type !== 'root')) {
		return textOutput('ls: cannot access directory');
	}

	const visibleChildren = fileNode.children.filter((child) => !child.hidden);
	const stringValue = visibleChildren.map((child) => child.name).join(' ');

	return {
		uiComponent: LsOutput,
		props: { children: fileNode.children },
		rawValue: stringValue
	};
}

export default {
	description: 'List directory contents.',
	execute: ls,
	completions: oneArgDirectoryCompletions
};
