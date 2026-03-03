import type { FileSystemNodeInput } from '$lib/system_state';

import old from './old.txt?raw';
import dec_8_25 from './dec_8_25.txt?raw';
import mar_2_26 from './mar_2_26.txt?raw';

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
      name: 'dec_8_25.txt',
      type: 'file',
      content: dec_8_25
    },
    {
      name: 'mar_2_26.txt',
      type: 'file',
      content: mar_2_26
    }
	]
};

export default change_log;
