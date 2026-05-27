import { type SystemState } from '../system_state';
import { getFileNode, oneArgDirectoryCompletions, resolvePath } from '../system';
import { type CommandOutput, textOutput } from '../command_output';
import LsOutput from '../components/outputs/LsOutput.svelte';

function ls(args: string[], systemState: SystemState): CommandOutput {
	const fileNode = resolvePath(args[0] ?? "", systemState);

	if (!fileNode) {
		return textOutput(`ls: no such file or directory: ${args[0]}`);
	}

	if (fileNode.type === 'file') {
		return textOutput(fileNode.name);
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
