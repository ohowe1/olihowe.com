import type { FileSystemNodeInput } from '$lib/system_state';
import description from './description.txt?raw';
import sites from './projects/sites.txt.html?raw';
import asciimation from './projects/asciimation.anim.html?raw';
import change_log from './change_log';

const home: FileSystemNodeInput = {
	name: 'home',
	type: 'directory',
	children: [
		{
			name: 'oli',
			type: 'directory',
			children: [
				change_log,
				{
					name: 'description.txt',
					type: 'file',
					content: description
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
				},
				{
					name: 'ily',
					type: 'directory',
					children: [
						{
							name: 'site.txt',
							type: 'file',
							content: '<a href="https://ily.olihowe.com">click to site</a>'
						}
					],
					hidden: true
				}
			]
		}
	]
};

export default home;
