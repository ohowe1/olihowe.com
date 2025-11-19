import type { FileSystemNodeInput } from "$lib/system_state";
import home from "./home";

const root: FileSystemNodeInput = {
	name: '',
	type: 'root',
	children: [
		home
	]
};

export default root;
