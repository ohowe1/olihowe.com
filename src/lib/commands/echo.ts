import { sanitize } from '$lib/util';
import type { SystemState } from '../system_state';

function echo(args: string[], systemState: SystemState): string {
	const output = args;

	// for (let i = 0; i < output.length; i++) {
	// 	output[i] = sanitize(output[i]);
	// }

	return output.join(' ');
}

export default {
	description: 'Output to the terminal.',
	execute: echo
};
