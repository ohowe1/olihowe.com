import { type SystemState } from '../system_state';
import { currentDirectoryPath } from '../system';

function pwd(args: string[], systemState: SystemState): string {
	return currentDirectoryPath(systemState);
}

export default {
	description: 'Print the current working directory.',
	execute: pwd
};
