<script lang="ts">
	let { text }: { text: string } = $props();
</script>

<span class="text-output">{@html text}</span>

<style>
	.text-output {
		white-space: pre-wrap;
	}
</style>
