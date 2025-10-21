<script lang="ts">
	import ShellPage from '$lib/components/shell_page.svelte';

	const initialCommands = [
		{
			command: 'echo $NAME'
		},
		{
			command: 'cat description.txt'
		},
		{
			command: 'echo $EMAIL'
		},
		{
			command: 'echo $GITHUB'
		},
		{
			command: 'echo $LINKEDIN'
		}
	];
</script>

<svelte:head>
	<title>Oliver Howe</title>
	<meta
		name="description"
		content="Portfolio website for Oliver Howe, a computer engineering student at Harvey Mudd College"
	/>
</svelte:head>

<ShellPage {initialCommands} />
