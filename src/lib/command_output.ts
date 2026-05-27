import type { Component } from 'svelte';
import type { FileContent } from './system_state';
import TextOutput from './components/outputs/TextOutput.svelte';

export type CommandOutput = {
	/**
	 * Svelte component used to render this output in the terminal UI
	 */
	uiComponent: Component<any>;

	/**
	 * Props passed to the uiComponent
	 */
	props: Record<string, any>;

	/**
	 * The raw content representation (string, component, or list) written to files on redirect
	 */
	rawValue: FileContent;
};

/**
 * Wraps plain text stdout into a CommandOutput object
 */
export function textOutput(text: string): CommandOutput {
	return {
		uiComponent: TextOutput,
		props: { text },
		rawValue: text
	};
}
