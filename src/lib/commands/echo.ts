import type { SystemState } from '../system_state';
import { textOutput, type CommandOutput } from '../command_output';

function echo(args: string[], systemState: SystemState): CommandOutput {
	const output = args;

	return textOutput(output.join(' '));
}

export default {
	description: 'Output to the terminal.',
	execute: echo
};
