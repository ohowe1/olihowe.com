import type { FileSystemNodeInput } from '$lib/system_state';

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
					content:
						'I am currently studying engineering at Harvey Mudd College and expecting to graduate in 2028. This past summer, I was an intern at NASA Jet Propulsion Laboratory in Pasadena CA in the RF Electronics Group working on radar hardware test automation.'
				},
				{
					name: 'change_log.txt',
					type: 'file',
					content:
						"Most recently I added more bash accurate command parsing and support to create new files/add content to them using > and >>\n\nI recently added tab completion to the shell (activate by pressing Tab).\n\nFor the future, I really need to add more content/project descriptions/photos etc. I\'m also interested to add more commands and flesh out the tab completion more."
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
};

export default home;
