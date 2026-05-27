import type { SystemState } from '../system_state';
import { textOutput, type CommandOutput } from '../command_output';

function export_(args: string[], systemState: SystemState): CommandOutput {
  let outputs = [];
  for (const arg of args) {
    let [key, value] = arg.split('=');

    if (key === undefined || value === undefined) {
      continue;
    }

    if (key in systemState.environmentVariables) {
      if (!systemState.environmentVariables[key].mutable) {
        outputs.push(`export: ${key}: variable is read-only`);
        continue;
      }
    }
    systemState.environmentVariables[key] = {
      value,
      mutable: true
    };
  }

  return textOutput(outputs.join('\n'));
}

export default {
  description: 'Set environment variables',
	execute: export_
};
