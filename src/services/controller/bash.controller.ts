/* eslint-disable require-jsdoc */
import {spawn} from 'child_process';

// ls -la folder
class BashController {
  formatArguments(args:string) {
    if (args.length > 0) {
      return args.split(' ');
    }
    return [];
  }
  execCommand(command: string, args: string = '') {
    const processToExecute = spawn(
        command,
        this.formatArguments(args),
        {
          shell: true,
        },
    );

    processToExecute.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    processToExecute.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    processToExecute.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });
  }
}

const batchController = new BashController();

export {
  batchController,
};
