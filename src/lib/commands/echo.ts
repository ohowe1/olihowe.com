import { sanitize } from '$lib/util';
import type { SystemState } from '../system_state';

function echo(args: string[], systemState: SystemState): string {
	const output = args;

	for (let i = 0; i < output.length; i++) {
		output[i] = sanitize(output[i]);
		if (output[i].startsWith('$')) {
			const varName = output[i].substring(1);
			const envVar = systemState.environmentVariables[varName];
			if (envVar) {
				output[i] = envVar.value;
			} else {
				output[i] = '';
			}
		}
	}

	return output.join(' ');
}

export default {
	description: 'Output to the terminal.',
	execute: echo
};
