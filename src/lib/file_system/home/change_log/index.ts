import type { FileSystemNodeInput } from '$lib/system_state';

import old from './old.txt?raw';
import dec_8 from './dec_8.txt?raw';

const change_log: FileSystemNodeInput = {
	name: 'change_log',
	type: 'directory',
	children: [
    {
      name: 'old.txt',
      type: 'file',
      content: old
    },
    {
      name: 'dec_8.txt',
      type: 'file',
      content: dec_8
    }
	]
};

export default change_log;
