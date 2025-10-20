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

type FileNodeInput = Omit<FileNode, 'parent'>;
type DirectoryNodeInput = Omit<DirectoryNode, 'parent' | 'children'> & {
	children: FileSystemNodeInput[];
};
type RootNodeInput = Omit<RootNode, 'parent' | 'children'> & {
	children: FileSystemNodeInput[];
};
type FileSystemNodeInput = FileNodeInput | DirectoryNodeInput | RootNodeInput;

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
			{
				name: '',
				type: 'root',
				children: [
					{
						name: 'home',
						type: 'directory',
						children: [
							{
								name: 'oli',
								type: 'directory',
								children: [
									{
										name: 'description.txt',
										type: 'file',
										content:
											'I am currently studying engineering at Harvey Mudd College and expecting to graduate in 2028. This past summer, I was an intern at NASA Jet Propulsion Laboratory in Pasadena CA in the RF Electronics Group working on radar hardware test automation.'
									},
									{
										name: 'projects',
										type: 'directory',
										children: [
											{
												name: 'sites.txt',
												type: 'file',
												content:
													'Some of my projects are hosted on my site site: <a href="https://sites.olihowe.com/">https://sites.olihowe.com/</a>'
											}
										]
									}
								]
							}
						]
					}
				]
			},
			null
		),
		currentDirectory: ['home', 'oli'],
		homeDirectory: ['home', 'oli'],

		environmentVariables: {
			USER: { value: 'oli', mutable: false },
			HOME: { value: '/home/oli', mutable: false },
			SHELL: { value: '/bin/oli-shell', mutable: false },
			NAME: { value: 'Oliver Howe', mutable: true },
			WEBSITE: { value: '<a href="https://olihowe.com">https://olihowe.com</a>', mutable: true },
			EMAIL: { value: '<a href="mailto:oliver@olihowe.com">oliver@olihowe.com</a>', mutable: true },
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
