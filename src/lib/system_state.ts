import root from "./file_system/index";

export type FileNode = {
	name: string;
	type: 'file';
	content: string;
	parent: DirectoryNode | RootNode;
};

export type DirectoryNode = {
	name: string;
	type: 'directory';
	children: FileSystemNode[];
	parent: DirectoryNode | RootNode;
};

export type RootNode = {
	name: string;
	type: 'root';
	children: FileSystemNode[];
	parent: null;
};

export type FileSystemNode = FileNode | DirectoryNode | RootNode;

export type EnvironmentVariable = {
	value: string;
	mutable: boolean;
};

export type SystemState = {
	fileSystem: FileSystemNode;
	currentDirectory: string[];
	homeDirectory: string[];

	environmentVariables: Record<string, EnvironmentVariable>;
};

export type FileNodeInput = Omit<FileNode, 'parent'>;
export type DirectoryNodeInput = Omit<DirectoryNode, 'parent' | 'children'> & {
	children: FileSystemNodeInput[];
};
export type RootNodeInput = Omit<RootNode, 'parent' | 'children'> & {
	children: FileSystemNodeInput[];
};
export type FileSystemNodeInput = FileNodeInput | DirectoryNodeInput | RootNodeInput;

function makeInitialFileSystem(
	initialSystem: FileSystemNodeInput,
	parent: RootNode | DirectoryNode | null
): FileSystemNode {
	if (parent === null) {
		if (initialSystem.type === 'root') {
			const node: FileSystemNode = { ...initialSystem, children: [], parent };
			node.children = initialSystem.children.map((child) => makeInitialFileSystem(child, node));
			return node;
		}
		throw new Error('Only root node can have null parent');
	}

	if (initialSystem.type === 'file') {
		return { ...initialSystem, parent };
	} else if (initialSystem.type === 'directory') {
		const node: FileSystemNode = { ...initialSystem, children: [], parent };
		node.children = initialSystem.children.map((child) => makeInitialFileSystem(child, node));
		return node;
	} else {
		throw new Error('Root node must have null parent');
	}
}

export function makeInitialSystemState(): SystemState {
	return {
		fileSystem: makeInitialFileSystem(
			root,
			null
		),
		currentDirectory: ['home', 'oli'],
		homeDirectory: ['home', 'oli'],

		environmentVariables: {
			USER: { value: 'oli', mutable: false },
			HOME: { value: '/home/oli', mutable: false },
			SHELL: { value: '/bin/oli-shell', mutable: false },
			NAME: { value: 'Oliver Howe', mutable: true },
			HOMEPAGE: { value: '<a href="https://olihowe.com">https://olihowe.com</a>', mutable: true },
			WEBSITE: { value: '<a href="https://olihowe.com">https://olihowe.com</a>', mutable: true },
			EMAIL: { value: 'oliver @ this domain', mutable: true },
			GITHUB: {
				value: '<a href="https://github.com/ohowe1">https://github.com/ohowe1</a>',
				mutable: true
			},
			LINKEDIN: {
				value:
					'<a href="https://linkedin.com/in/oliver-howe">https://linkedin.com/in/oliver-howe</a>',
				mutable: true
			}
		}
	};
}
