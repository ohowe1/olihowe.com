import { type SystemState } from '../system_state';
import { fileCompletions, oneArgFileCompletions, resolvePath } from '../system_state_util';

function cat(args: string[], systemState: SystemState): string {
	if (args.length === 0) {
		return 'cat: missing argument';
	}

	const target = args[0];

	const newFileNode = resolvePath(target, systemState);

	if (!newFileNode) {
		return `cat: no such file or directory: ${target}`;
	}

	if (newFileNode.type !== 'file') {
		return `cat: not a file: ${target}`;
	}

	return newFileNode.content;
}

export default {
	description: 'Display the contents of a file.',
	execute: cat,
	completions: oneArgFileCompletions
};
