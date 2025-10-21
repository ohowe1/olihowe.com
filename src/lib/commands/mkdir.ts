import { type SystemState } from '../system_state';
import { resolvePath } from '../system_state_util';

function mkdir(args: string[], systemState: SystemState): string {
	if (args.length === 0) {
		return 'mkdir: missing argument';
	}

	const target = args[0];

  const newDirectoryName = target.split('/').pop();
  if (!newDirectoryName) {
    return `mkdir: invalid directory name: ${target}`;
  }

  const parentPath = target.substring(0, target.length - newDirectoryName.length);
  console.log(newDirectoryName)
  console.log('Parent path:', parentPath);

	const parentNode = resolvePath(parentPath, systemState);
  console.log(parentNode)

	if (!parentNode) {
		return `mkdir: no such file or directory: ${parentPath}`;
	}

	if (parentNode.type !== 'directory' && parentNode.type !== 'root') {
		return `mkdir: not a directory: ${parentPath}`;
	}

  const existingNode = parentNode.children.find((child) => child.name === newDirectoryName);
  if (existingNode) {
    return `mkdir: ${target}: file exists`;
  }
  
  const newFileNode = {
    name: newDirectoryName,
    type: 'directory' as const,
    children: [],
    parent: parentNode,
  };

  parentNode.children.push(newFileNode);

	return "";
}

export default {
	description: 'Create a new directory.',
	execute: mkdir
};
