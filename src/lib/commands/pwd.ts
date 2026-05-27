import { type SystemState } from '../system_state';
import { currentDirectoryPath } from '../system';
import { textOutput, type CommandOutput } from '../command_output';

function pwd(args: string[], systemState: SystemState): CommandOutput {
	return textOutput(currentDirectoryPath(systemState));
}

export default {
	description: 'Print the current working directory.',
	execute: pwd
};
