import type { FileSystemNode, SystemState } from './system_state';

export function resolvePath(path: string, systemState: SystemState): FileSystemNode | null {
	let currentDirectory = systemState.currentDirectory.slice();
	if (path === '') {
		return getFileNode(currentDirectory, systemState);
	}

	const elements = path.split('/');
	if (elements[0] === '') {
		currentDirectory = [''];
		elements.shift();
	}

	return getFileNode([...currentDirectory, ...elements], systemState);
}

export function getFileNode(path: string[], systemState: SystemState): FileSystemNode | null {
	let current: FileSystemNode = systemState.fileSystem;
	for (let i = 0; i < path.length; i++) {
		const segment = path[i];
		if (current.type === 'file') {
			return null;
		}
		if (segment === '.' || segment === '') {
			continue;
		}
		if (segment === '..') {
			if (current.parent) {
				current = current.parent;
			} else {
				return null;
			}
			continue;
		}

		const next = current.children.find((child) => child.name === segment);
		if (!next) {
			return null;
		}
		current = next;
	}
	return current;
}

export function getFilePath(node: FileSystemNode): string[] {
	const path: string[] = [];
	let current: FileSystemNode | null = node;

	while (current && current.type !== 'root') {
		path.unshift(current.name);
		current = current.parent;
	}

	return path;
}

export function currentDirectoryPath(systemState: SystemState, replaceHome?: boolean): string {
	if (replaceHome) {
		const homePath = systemState.homeDirectory.join('/');

		if (systemState.currentDirectory.join('/').startsWith(homePath)) {
			const relativePath = systemState.currentDirectory
				.slice(systemState.homeDirectory.length)
				.join('/');
			return '~' + (relativePath ? '/' + relativePath : '');
		}
	}
	return '/' + systemState.currentDirectory.join('/');
}

export function fileCompletions(
	pathPrefix: string,
	systemState: SystemState,
	excludeFiles?: boolean
): string[] {
	const prefixIndex = pathPrefix.lastIndexOf('/');

	const prefix = prefixIndex === -1 ? pathPrefix : pathPrefix.substring(prefixIndex + 1);
	const dirPath = prefixIndex === -1 ? '' : pathPrefix.substring(0, prefixIndex + 1);

	const dirNode = resolvePath(dirPath, systemState);
	if (!dirNode || dirNode.type === 'file') {
		return [];
	}

	const candidates = dirNode.children
		.filter((child) => child.name.startsWith(prefix) && (!excludeFiles || child.type !== 'file'))
		.map((child) => dirPath + child.name + (child.type !== 'file' ? '/' : ''));

	candidates.sort();
	return candidates;
}

export function oneArgFileCompletions(
	args: string[],
	lastArgComplete: boolean,
	systemState: SystemState
): string[] {
	// Only complete the first argument
	if (args.length === 0 || (args.length === 1 && !lastArgComplete)) {
		const argPartial = lastArgComplete || args.length === 0 ? '' : args[0];

		return fileCompletions(argPartial, systemState);
	}

	return [];
}

export function oneArgDirectoryCompletions(
	args: string[],
	lastArgComplete: boolean,
	systemState: SystemState
): string[] {
	// Only complete the first argument
	if (args.length === 0 || (args.length === 1 && !lastArgComplete)) {
		const argPartial = lastArgComplete || args.length === 0 ? '' : args[0];

		return fileCompletions(argPartial, systemState, true);
	}

	return [];
}
