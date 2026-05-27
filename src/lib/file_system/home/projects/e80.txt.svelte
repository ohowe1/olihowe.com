<script lang="ts">
	let { execute }: { execute: (command: string) => void } = $props();
</script>

<span>
	For my experimental engineering class (E80) we built an autonomous vehicle that navigated the
	ocean surface with a sensor package that was lowered on a winch and collected data on the
	turbidity, temperature, and depth. The project involved mechanical design, circuit design, and
	software development.

	<enhanced:img src="$lib/assets/e80robot.jpeg" alt="E80 robot in the water" class="robot-image" />

	You can read my report <a href="/e80report.pdf" target="_blank">here</a>.
</span>

<style>
	.robot-image {
		width: 100%;
		max-width: 250px;
		height: auto;
		border-radius: 4px;
		display: block;
		margin: 1rem 0;
	}
</style>
