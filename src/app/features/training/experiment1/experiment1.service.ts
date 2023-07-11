import { Injectable } from '@angular/core';
import {
  File,
  knownFolders,
  Image,
  ImageAsset,
  ImageSource,
  path,
} from '@nativescript/core';
import { Zip } from '@nativescript/zip';
import {
  Downloader,
  ProgressEventData,
  DownloadEventData,
} from '@triniwiz/nativescript-downloader';
import { TensorflowBaseService } from '~/app/core/services/tensorflow.base-service';
import {
  Tensor,
  tensor4d,
  util,
  sequential,
  layers,
  train,
  tensor3d,
  tensor2d,
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

    let dogImages = [];
    let catImages = [];

    // Here you will need to provide a way to get all the files inside the Dog and Cat folders
    // This can be achieved using NativeScript's `Folder` and `File` APIs

    // pseudo code
    // const dogFolder = Folder.fromPath(path.join(datasetFolder, 'Dog'));
    // dogImages = dogFolder.getEntitiesSync().filter(entity => entity.extension === '.jpg');

    // do the same for catImages

    // Now that we have all the file paths, let's load, decode and preprocess them:
    const allImages = dogImages.concat(catImages);
    const allLabels = new Array(dogImages.length)
      .fill(0)
      .concat(new Array(catImages.length).fill(1)); // 0 for dog, 1 for cat

    const imageTensors = [];
    for (let imagePath of allImages) {
      const imageAsset = new ImageAsset(imagePath);
      const imageSource = await ImageSource.fromAsset(imageAsset);
      const imageTensor = tensor3d(imageSource.toTensor());
      imageTensors.push(imageTensor);
    }

    // Now we have all our image tensors and labels ready to be converted into a tf.data.Dataset
    const imageDataset = tensor4d(imageTensors);
    const labelDataset = tensor2d(allLabels, [allLabels.length, 1]); // make sure the label is a 2D tensor
    const dataset = util.zipDataset([imageDataset, labelDataset]);

    return dataset;
  }

  buildModel() {
    const model = sequential();
    model.add(layers.rescaling({ scale: 1 / 255, offset: 0 }));
    model.add(
      layers.conv2d({
        inputShape: [180, 180, 3],
        filters: 32,
        kernelSize: 3,
        activation: 'relu',
      })
    );
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
    model.add(layers.dense({ units: 1, activation: 'sigmoid' })); // binary output
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
    const imageTensor = tensor3d(imageSource.toTensor());
    const prediction = model.predict(imageTensor.expandDims(0)) as Tensor; // make sure it's a 4D tensor
    const score = prediction.dataSync()[0];
    console.log(
      `This image is ${(1 - score) * 100}% cat and ${score * 100}% dog.`
    );
  }

  async main() {
    this.downloadAndUnzipDataset();
    const dataset = await this.loadAndPreprocessImages();
    const model = this.buildModel();
    this.trainModel(model, dataset);
    await this.runInference(model, 'PetImages/Cat/6779.jpg');
  }
}
