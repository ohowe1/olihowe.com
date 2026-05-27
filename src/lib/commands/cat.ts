import { type SystemState } from '../system_state';
import { fileCompletions, oneArgFileCompletions, resolvePath } from '../system';
import { type CommandOutput, textOutput } from '../command_output';
import FileContentRenderer from '../components/outputs/FileContentRenderer.svelte';

function cat(args: string[], systemState: SystemState): CommandOutput {
	if (args.length === 0) {
		return textOutput('cat: missing argument');
	}

	const target = args[0];

	const newFileNode = resolvePath(target, systemState);

	if (!newFileNode) {
		return textOutput(`cat: no such file or directory: ${target}`);
	}

	if (newFileNode.type !== 'file') {
		return textOutput(`cat: not a file: ${target}`);
	}

	return {
		uiComponent: FileContentRenderer,
		props: { content: newFileNode.content },
		rawValue: newFileNode.content
	};
}

export default {
	description: 'Display the contents of a file.',
	execute: cat,
	completions: oneArgFileCompletions
};
