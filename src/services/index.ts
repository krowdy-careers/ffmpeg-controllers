import {videoController} from './controller/video.controller';


const main = async () => {
  try {
    const data = await videoController.executeProcess('.mp4');
    console.log('🚀 ~ este es el resultado de nuestro trabajo de hoy', data);
  } catch (error) {
    throw error;
  }
};


main()
    .then((result)=>{
      console.log(result);
    })
    .catch((error)=>{
      console.log(`este es el error ===>`, error);
    });
