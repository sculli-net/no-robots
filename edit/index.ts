import pc from 'picocolors'
import prompts from 'prompts';

import { updateMetadata } from './update-metadata'


export const makeEdits = async () => {
  
  const { proceed } = await prompts({
    type: 'confirm',
    name: 'proceed',
    message: 
      `The '${pc.bold(pc.blue(`no-robots`))}' library is currently incomplete and only really helpful immediately after initializing a project.\r
It only works for the next.js app router & will replace your robots.tsx file if you have one.\r
Are you sure you want to continue?`,
    });

    if (!proceed) { 
      console.log('No files changed.')
      process.exit(1)
    }

    await updateMetadata().then(()=>console.log("Written 2 files!"));


}


