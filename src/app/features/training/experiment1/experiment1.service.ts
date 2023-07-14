import { Injectable } from '@angular/core';
import {
  File,
  Folder,
  ImageAsset,
  ImageSource,
  knownFolders,
  path,
} from '@nativescript/core';
import { Zip } from '@nativescript/zip';
import {
  Downloader,
  DownloadEventData,
  ProgressEventData,
} from '@triniwiz/nativescript-downloader';
import { TensorflowBaseService } from '~/app/core/services/tensorflow.base-service';
import * as tf from '@tensorflow/tfjs';
import {
  layers,
  sequential,
  Tensor,
  tensor2d,
  tensor3d,
  tensor4d,
  train,
} from '@tensorflow/tfjs';

@Injectable({
  providedIn: 'root',
})
export class Experiment1Service extends TensorflowBaseService {
  downloadAndUnzipDataset() {
    const tempFolder = knownFolders.temp();
    const zipFile = path.join(tempFolder.path, 'kagglecatsanddogs_5340.zip');
    const datasetFolder = path.join(tempFolder.path, 'PetImages');
    if (File.exists(zipFile)) {
      console.log('Zip file already exists. Skipping download...');
      this.unzipDataset(zipFile, datasetFolder);
    } else {
      console.log('Downloading dataset...');
      const downloader = new Downloader();
      const datasetDownloadId = downloader.createDownload({
        url: 'https://download.microsoft.com/download/3/E/1/3E1C3F21-ECDB-4869-8368-6DEBA77B919F/kagglecatsanddogs_5340.zip',
        path: tempFolder.path,
        fileName: 'kagglecatsanddogs_5340.zip',
      });
      downloader
        .start(datasetDownloadId, (progressData: ProgressEventData) => {
          console.log(`Download progress: ${progressData.value}%`);
        })
        .then((completed: DownloadEventData) => {
          console.log('Download complete.');
          this.unzipDataset(zipFile, datasetFolder);
        })
        .catch((error) => {
          console.error('Error during download: ', error);
        });
    }
  }

  unzipDataset(zipFile, datasetFolder) {
    console.log('Unzipping...');
    Zip.unzip({
      archive: zipFile,
      directory: datasetFolder,
      onProgress: (percent) => {
        console.log(`Unzip progress: ${percent}%`);
      },
    })
      .then(() => {
        console.log('Unzipping complete.');
      })
      .catch((error) => {
        console.error('Error during unzipping: ', error);
      });
  }

  async loadAndPreprocessImages() {
    const tempFolder = knownFolders.temp();
    const datasetFolder = path.join(tempFolder.path, 'PetImages');

    // Get all the files inside the Dog and Cat folders
    const dogFolder = Folder.fromPath(path.join(datasetFolder, 'Dog'));
    const dogImages = dogFolder
      .getEntitiesSync()
      .filter((entity) => entity instanceof File && entity.extension === '.jpg')
      .map((file) => file.path);

    const catFolder = Folder.fromPath(path.join(datasetFolder, 'Cat'));
    const catImages = catFolder
      .getEntitiesSync()
      .filter((entity) => entity instanceof File && entity.extension === '.jpg')
      .map((file) => file.path);

    // Now that we have all the file paths, let's load, decode and preprocess them:
    const allImages = dogImages.concat(catImages);
    const allLabels = new Array(dogImages.length)
      .fill([0]) // 0 for dog
      .concat(new Array(catImages.length).fill([1])); // 1 for cat

    const imageTensors = [];
    for (let imagePath of allImages) {
      const imageAsset = new ImageAsset(imagePath);
      const imageSource = await ImageSource.fromAsset(imageAsset);
      const imageTensor = await this.imageSourceToTensor(imageSource);
      imageTensors.push(imageTensor);
    }

    // Convert labels into one-hot encoded tensors
    const labelTensors = allLabels.map((label) => tf.tensor1d(label, 'int32'));

    // Now we have all our image tensors and labels ready to be converted into a tf.data.Dataset
    const imageDataset = tf.data.array(imageTensors).batch(32);
    const labelDataset = tf.data.array(labelTensors).batch(32);

    return tf.data.zip({ xs: imageDataset, ys: labelDataset });
  }

  async imageSourceToTensor(imageSource: ImageSource): Promise<Tensor> {
    // Get bitmap for both android and ios
    let bmp;
    if (isAndroid) {
      bmp = imageSource.android;
    } else {
      bmp = imageSource.ios;
    }
    const pixels = [];
    for (let i = 0; i < bmp.height; i++) {
      for (let j = 0; j < bmp.width; j++) {
        const pixel = bmp.getPixel(j, i);
        pixels.push([
          (pixel & 0xff0000) >> 16, // red
          (pixel & 0x00ff00) >> 8, // green
          pixel & 0x0000ff, // blue
        ]);
      }
    }
    // Convert pixel data to a tensor
    return tensor3d(pixels, [bmp.height, bmp.width, 3]).div(255);
  }

  buildModel() {
    const model = sequential();
    model.add(
      layers.conv2d({
        inputShape: [180, 180, 3],
        filters: 32,
        kernelSize: 3,
        activation: 'relu',
      })
    );
    model.add(layers.rescaling({ scale: 1 / 255, offset: 0 }));
    model.add(layers.maxPooling2d({ poolSize: 2 }));
    model.add(
      layers.conv2d({ filters: 64, kernelSize: 3, activation: 'relu' })
    );
    model.add(layers.maxPooling2d({ poolSize: 2 }));
    model.add(
      layers.conv2d({ filters: 128, kernelSize: 3, activation: 'relu' })
    );
    model.add(layers.maxPooling2d({ poolSize: 2 }));
    model.add(layers.flatten());
    model.add(layers.dense({ units: 64, activation: 'relu' }));
    model.add(layers.dense({ units: 1, activation: 'sigmoid' }));
    return model;
  }

  trainModel(model, dataset) {
    model.compile({
      optimizer: train.adam(1e-3),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy'],
    });
    model.fitDataset(dataset, { epochs: 10, batchSize: 32 });
  }

  async runInference(model, imagePath) {
    const imageAsset = new ImageAsset(imagePath);
    const imageSource = await ImageSource.fromAsset(imageAsset);
    const imageTensor = await this.imageSourceToTensor(imageSource);
    const prediction = model.predict(imageTensor.expandDims(0)) as Tensor; // make sure it's a 4D tensor
    const score = prediction.dataSync()[0];
    console.log(
      `This image is ${(1 - score) * 100}% cat and ${score * 100}% dog.`
    );
  }

  async main() {
    console.log('Starting the process...');

    console.log('Downloading and unzipping the dataset...');
    this.downloadAndUnzipDataset();

    console.log('Loading and preprocessing the images...');
    const dataset = await this.loadAndPreprocessImages();
    console.log('Finished loading and preprocessing the images.');

    console.log('Building the model...');
    const model = this.buildModel();
    console.log('Finished building the model.');

    console.log('Training the model...');
    this.trainModel(model, dataset);
    console.log('Finished training the model.');

    console.log('Running inference...');
    await this.runInference(model, 'PetImages/Cat/6779.jpg');
    console.log('Finished running inference.');

    console.log('Finished the process!');
  }
}
