import type { FileSystemNodeInput } from '$lib/system_state';
import description from './description.txt?raw';
import changelog from './change_log.txt?raw';
import sites from './projects/sites.txt.html?raw';
import asciimation from './projects/asciimation.anim.html?raw';

const home: FileSystemNodeInput = {
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
					content: description
				},
				{
					name: 'change_log.txt',
					type: 'file',
					content: changelog
				},
				{
					name: 'projects',
					type: 'directory',
					children: [
						{
							name: 'sites.txt',
							type: 'file',
							content: sites
						},
						{
							name: 'asciimation.anim',
							type: 'file',
							content: asciimation
						}
					]
				}
			]
		}
	]
};

export default home;
