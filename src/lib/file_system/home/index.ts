import type { FileSystemNodeInput } from '$lib/system_state';
import description from './description.txt?raw';
import change_log from './change_log';
import Sites from '../../components/files/Sites.txt.svelte';
import Asciimation from '../../components/files/Asciimation.anim.svelte';
import E80 from '../../components/files/E80.txt.svelte';

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
							content: Sites
						},
						{
							name: 'asciimation.anim',
							type: 'file',
							content: Asciimation
						},
						{
							name: 'e80.txt',
							type: 'file',
							content: E80
						}
					]
				},
			]
		}
	]
};

export default home;
