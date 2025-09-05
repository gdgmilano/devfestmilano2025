import { Storage, UploadOptions } from '@google-cloud/storage';
import { spawnSync } from 'child_process';
import * as functions from 'firebase-functions';
import { storage } from 'firebase-functions';
import fs from 'fs';
import os from 'os';
import path from 'path';

const mkdirp = (path: string) => fs.promises.mkdir(path, { recursive: true });

const gcs = new Storage();

export const optimizeImages2025 = storage.object().onFinalize((object) => {
  const { contentType, name } = object;
  
  // Exit if this is triggered on a file that is not an image.
  if (!contentType.startsWith('image/')) {
    functions.logger.log('This is not an image.');
    return null;
  }

  // Process all images and move them to 2025 folder
  functions.logger.log(`Processing image: ${name}`);
  return optimizeImage(object);
});

async function optimizeImage(object) {
  // File and directory paths.
  const filePath = object.name;
  const tempLocalFile = path.join(os.tmpdir(), filePath);
  const tempLocalDir = path.dirname(tempLocalFile);

  // Cloud Storage files.
  const bucket = gcs.bucket(object.bucket);
  const file = bucket.file(filePath);

  const [metadata] = await file.getMetadata();
  if (metadata.metadata && metadata.metadata.optimized) {
    functions.logger.log('Image has been already optimized');
    return null;
  }

  await mkdirp(tempLocalDir);
  await file.download({ destination: tempLocalFile });
  functions.logger.log('The file has been downloaded to', tempLocalFile);

  // Generate a thumbnail using ImageMagick.
  spawnSync('convert', [
    tempLocalFile,
    '-strip',
    '-interlace',
    'Plane',
    '-quality',
    '82',
    tempLocalFile,
  ]);
  functions.logger.log('Optimized image created at', tempLocalFile);

  // Ensure the file is in the 2025 folder
  const destinationPath = filePath.startsWith('2025/') ? filePath : `2025/${filePath}`;
  
  // Uploading the Optimized image to the 2025 folder.
  const destination = bucket.file(destinationPath);
  const options: UploadOptions = {
    destination,
    metadata: {
      metadata: {
        optimized: 'true',
        originalPath: filePath,
      },
    },
  };
  const [newFile] = await bucket.upload(tempLocalFile, options);
  await newFile.makePublic();
  functions.logger.log(`Optimized image uploaded to Storage at ${destinationPath}`);
  
  // If the original file was not in the 2025 folder, delete it
  if (!filePath.startsWith('2025/')) {
    await file.delete();
    functions.logger.log(`Original file ${filePath} deleted, moved to ${destinationPath}`);
  }
  
  // Once the image has been uploaded delete the local files to free up disk space.
  return Promise.all([fs.unlinkSync(tempLocalFile)]);
}
