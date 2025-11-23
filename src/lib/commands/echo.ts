import type { SystemState } from '../system_state';

function echo(args: string[], systemState: SystemState): string {
	const output = args;

	return output.join(' ');
}

export default {
	description: 'Output to the terminal.',
	execute: echo
};
