import type { FileSystemNode, SystemState } from './system_state';

export function resolvePath(path: string, systemState: SystemState): FileSystemNode | null {
	const elements = path.split('/');

	let currentDirectory = systemState.currentDirectory.slice();
	if (elements[0] === '~') {
		currentDirectory = systemState.homeDirectory.slice();
		elements.shift();
	} else if (elements[0] === '') {
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
