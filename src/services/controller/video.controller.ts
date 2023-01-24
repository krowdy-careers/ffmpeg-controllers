/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
import {spawn} from 'child_process';
import fs from 'fs';

const command = 'ffmpeg';

class VideoController {
  ffprobe(videoSrc: string) {}

  getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  generateAndGetOutputSrc(ext: string) {
    try {
      const fileNameRandom = this.getRandomInt(100000000, 25000000);
      return `${this.getDirectoryOfVideos()}/${fileNameRandom}${ext}`;
    } catch (error) {
      throw error;
    }
  }

  getDirectoryOfVideos() {
    try {
      const allKeys = __dirname.split('/');
      const getWithoutLastKey = __dirname
          .split('/')
          .slice(0, allKeys.length -1);
      return `${getWithoutLastKey.join('/')}/files`;
    } catch (error) {
      console.log('🚀 ~ file: video.controller.ts:29 ~ VideoController ~ getDirectoryOfVideos ~ error', error);
      throw error;
    }
  }


  async normalizeVideos({
    video1,
    video2,
    totalTime,
    ext,
  }:{
    video1: string;
    video2: string;
    totalTime: number;
     ext: string;
  }) {
    try {
      const outputVideo1 = this.generateAndGetOutputSrc(ext);

      const newVideoV1 = await this.make_cut({
        startTime: 0,
        endTime: totalTime,
        inputVideoSrc: video1,
        outputVideoSrc: outputVideo1,
      });


      const outputVideo2 = this.generateAndGetOutputSrc(ext);

      const newVideoV2 = await this.make_cut({
        startTime: 0,
        endTime: totalTime,
        inputVideoSrc: video2,
        outputVideoSrc: outputVideo2,
      });

      return {
        newVideoV1,
        newVideoV2,
      };
    } catch (error) {
      console.log('🚀 ~ file: video.controller.ts:79 ~ VideoController ~ error', error);
      throw error;
    }
  }

  async sanitizeVideoPromise(video: string, outputVideoSrc: string) {
    return new Promise((resolve, reject)=> {
      const args = [
        '-y',
        '-i',
        video,
        '-vcodec',
        'copy',
        '-acodec',
        'copy',
        '-r',
        '30',
        outputVideoSrc,
      ];
      const ffmpeg = spawn(
          command,
          args,
          {
            shell: true,
          });


      ffmpeg.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });

      ffmpeg.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
      });

      ffmpeg.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        resolve(`${code}`);
      });
    });
  }

  async sanitizeVideos(videos: any[], ext: string) {
    try {
      const outputs: string[] = [];

      for (const video of videos) {
        const outputVideoSanitize = this.generateAndGetOutputSrc(ext);

        await this.sanitizeVideoPromise(video?.video, outputVideoSanitize);
        outputs.push(outputVideoSanitize);
      }
      return outputs;
    } catch (error) {
      throw error;
    }
  }

  async executeProcess(ext: string) {
    try {
      const file1 = 'rossana.mp4';
      const file2 = 'christian.mp4';
      const dirPathOffiles = this.getDirectoryOfVideos();

      const outputsVideos = await this.normalizeVideos({
        video1: `${dirPathOffiles}/${file1}`,
        video2: `${dirPathOffiles}/${file2}`,
        totalTime: 8,
        ext,
      });

      const otputsSanitizeVideos = await this.sanitizeVideos([{
        video: outputsVideos?.newVideoV1,
      }, {
        video: outputsVideos?.newVideoV2,
      }], ext);

      const outputFinalVideo = this
          .generateAndGetOutputSrc(ext);


      await this.make_merge({
        videosSrc: {
          newVideoV1: otputsSanitizeVideos[0],
          newVideoV2: otputsSanitizeVideos[1],
        },
        outputFinalVideo,
      });

      fs.unlinkSync(outputsVideos?.newVideoV1);
      fs.unlinkSync(outputsVideos?.newVideoV2);
      fs.unlinkSync(otputsSanitizeVideos[0]);
      fs.unlinkSync(otputsSanitizeVideos[1]);

      return outputFinalVideo;
    } catch (error) {
      console.log('🚀 ~ executeProcess ~ error', `${error}`);
      throw error;
    }
  }

  async make_cup_promise(entryData: any) {
    return new Promise((resolve, reject)=> {
      const args = [
        '-y',
        '-i',
        entryData?.inputVideoSrc,
        '-threads',
        '4',
        '-ss',
        `${entryData?.startTime}`,
        '-to',
        `${entryData?.endTime}`,
        '-async 1',
        `${entryData?.outputVideoSrc}`,
      ];
      const ffmpeg = spawn(
          command,
          args,
          {
            shell: true,
          });


      ffmpeg.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });

      ffmpeg.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
      });

      ffmpeg.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        resolve(code);
      });
    });
  }

  async make_cut({
    startTime,
    endTime,
    inputVideoSrc,
    outputVideoSrc,
  }: {
    startTime: number;
    endTime: number;
    inputVideoSrc: string;
    outputVideoSrc: string;
  }) {
    const entryData = {
      startTime,
      endTime,
      inputVideoSrc,
      outputVideoSrc,
    };

    try {
      await this.make_cup_promise(entryData);
      return outputVideoSrc;
    } catch (error) {
      throw error;
    }
  }
  async make_merge_promise(entryData: any) {
    return new Promise((resolve, reject)=> {
      const args = `-i ${entryData?.video1} -i ${entryData.video2} -threads 4 -filter_complex "amix=inputs=2; [0:v] setpts=PTS-STARTPTS, scale=640x480 [base] ; [1:v] setpts=PTS-STARTPTS, scale=200x140 [lowerright]; [base][lowerright] overlay=shortest=1:x=440:y=340"`;

      const splitArgs: string[] = args.split(' ');
      const argsToEval: string[] = [
        '-y',
        ...(splitArgs || []),
        '-r',
        '30',
        `${entryData?.output}`,
        '-loglevel',
        'debug',
      ];
      const ffmpeg = spawn(
          command,
          argsToEval,
          {
            shell: true,
          });


      ffmpeg.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });

      ffmpeg.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
      });

      ffmpeg.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        resolve(`${code}`);
      });
    });
  }
  async make_merge({
    videosSrc,
    outputFinalVideo,
  }: {
    videosSrc: any
    outputFinalVideo: string
  }) {
    try {
      await this.make_merge_promise({
        video1: videosSrc?.newVideoV1,
        video2: videosSrc?.newVideoV2,
        output: outputFinalVideo,
      });
      return outputFinalVideo;
    } catch (error) {
      throw error;
    }
  }
  make_concat() {}
}

const videoController = new VideoController();

export {
  videoController,
};
