<script lang="ts">
	let { execute }: { execute: (command: string) => void } = $props();
</script>

<div class="asciimation-container">
	<iframe
		src="https://sites.olihowe.com/asciimation-web/nofooter.html?color=%23acb1bd"
		title="Asciimation"
		class="asciimation-iframe"
		frameborder="0"
		allowfullscreen
	></iframe>
</div>

<style>
	.asciimation-container {
		margin: 0.5rem 0;
		max-width: 607px;
		width: 100%;
		aspect-ratio: 607 / 315;
		border: 1px solid #3b4048;
		border-radius: 6px;
		overflow: hidden;
		background-color: #1e1e24;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}

	.asciimation-iframe {
		width: 100%;
		height: 100%;
		display: block;
	}
</style>
