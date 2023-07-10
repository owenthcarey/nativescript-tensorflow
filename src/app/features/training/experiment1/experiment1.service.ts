import { Injectable } from '@angular/core';
import { io } from '@tensorflow/tfjs-core';
import * as tf from '@tensorflow/tfjs';
import { File, Http, knownFolders, path } from '@nativescript/core';
import {
  GPGPUContext,
  MathBackendWebGL,
  setWebGLContext,
} from '@tensorflow/tfjs-backend-webgl';
import { Zip } from '@nativescript/zip';

@Injectable({
  providedIn: 'root',
})
export class Experiment1Service {
  async init(webGLRenderingContext: WebGLRenderingContext) {
    try {
      // Register back end.
      tf.registerBackend('custom-webgl', async () => {
        setWebGLContext(2, webGLRenderingContext);
        const customGPGPUContext = new GPGPUContext();
        return new MathBackendWebGL(customGPGPUContext);
      });

      // Register kernels.
      const kernels = tf.getKernelsForBackend('webgl');
      kernels.forEach((kernelConfig) => {
        const newKernelConfig = Object.assign({}, kernelConfig, {
          backendName: 'custom-webgl',
        });
        tf.registerKernel(newKernelConfig);
      });

      // Set back end and platform.
      await tf.setBackend('custom-webgl');
      tf.setPlatform('nativescript', new NativescriptPlatform());
      await tf.ready();
      console.log('TensorFlow.js is ready with back end:', tf.getBackend());
    } catch (error) {
      console.error('Failed to set the back end to custom-webgl:', error);
    }
  }

  multiplyMatrices() {
    const a = tf.tensor2d([
      [1, 2],
      [3, 4],
    ]);
    const b = tf.tensor2d([
      [5, 6],
      [7, 8],
    ]);
    const result = tf.matMul(a, b);
    console.log('Matrix multiplication result:', result);
    result.array().then((array) => {
      console.log('Matrix multiplication result:', array);
    });
    a.dispose();
    b.dispose();
    result.dispose();
  }

  async getting_started_tutorial() {
    // https://www.tensorflow.org/js/tutorials

    // Create a simple model.
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 1, inputShape: [1] }));

    // Prepare the model for training: Specify the loss and the optimizer.
    model.compile({
      loss: 'meanSquaredError',
      optimizer: 'sgd',
      metrics: ['mae'], // added mean absolute error to metrics
    });

    // Generate some synthetic data for training. (y = 2x - 1)
    const xs = tf.tensor2d([-1, 0, 1, 2, 3, 4], [6, 1]);
    const ys = tf.tensor2d([-3, -1, 1, 3, 5, 7], [6, 1]);

    // Split the data into training and validation sets.
    // Here we use the first 4 examples for training and the last 2 for validation.
    const trainXs = xs.slice([0, 0], [4, -1]);
    const trainYs = ys.slice([0, 0], [4, -1]);
    const valXs = xs.slice([4, 0], [-1, -1]);
    const valYs = ys.slice([4, 0], [-1, -1]);

    // Define the onEpochEnd callback to print the loss
    const onEpochEnd = (epoch, logs) => {
      console.log(
        `Epoch ${epoch}: loss = ${logs.loss}, val_loss = ${logs.val_loss}, mae = ${logs.mae}, val_mae = ${logs.val_mae}`
      );
    };

    // Train the model using the data.
    await model.fit(trainXs, trainYs, {
      epochs: 250,
      validationData: [valXs, valYs],
      callbacks: { onEpochEnd },
    });
  }

  downloadAndUnzipDataset() {
    let tempFolder = knownFolders.temp();
    let zipFile = path.join(tempFolder.path, 'kagglecatsanddogs_5340.zip');
    let datasetFolder = path.join(tempFolder.path, 'PetImages');

    console.log('Downloading dataset...');
    Http.getFile(
      'https://download.microsoft.com/download/3/E/1/3E1C3F21-ECDB-4869-8368-6DEBA77B919F/kagglecatsanddogs_5340.zip',
      zipFile
    )
      .then((file) => {
        console.log('Download complete. Unzipping...');

        Zip.unzip({
          archive: zipFile,
          directory: datasetFolder,
          onProgress: (percent) => {
            console.log(`Unzip progress: ${percent}`);
          },
        })
          .then(() => {
            console.log('Unzipping complete.');
          })
          .catch((error) => {
            console.error('Error during unzipping: ', error);
          });
      })
      .catch((error) => {
        console.error('Error during download: ', error);
      });
  }
}

export class NativescriptPlatform implements tf.Platform {
  fetch(
    path: string,
    requestInits?: RequestInit,
    options?: tf.io.RequestDetails
  ): Promise<Response> {
    return fetch(path, requestInits);
  }

  now(): number {
    return performance.now();
  }

  encode(text: string, encoding: string): Uint8Array {
    return new (TextEncoder as any)(encoding).encode(text);
  }

  decode(bytes: Uint8Array, encoding: string): string {
    return new (TextDecoder as any)(encoding).decode(bytes);
  }

  setTimeoutCustom?(functionRef: Function, delay: number): void {
    setTimeout(functionRef, delay);
  }

  isTypedArray(
    a: unknown
  ): a is Uint8Array | Float32Array | Int32Array | Uint8ClampedArray {
    return (
      a instanceof Float32Array ||
      a instanceof Int32Array ||
      a instanceof Uint8Array ||
      a instanceof Uint8ClampedArray
    );
  }
}

class NativescriptStorageHandler implements io.IOHandler {
  constructor(protected readonly modelPath: string) {}

  async save(modelArtifacts: io.ModelArtifacts): Promise<io.SaveResult> {
    const localModelFile = File.fromPath(this.modelPath);
    await localModelFile.writeText(JSON.stringify(modelArtifacts));
    return {
      modelArtifactsInfo: modelArtifacts.modelTopology
        ? {
            dateSaved: new Date(),
            modelTopologyType: 'JSON',
          }
        : null,
    };
  }

  async load(): Promise<io.ModelArtifacts> {
    console.time('slowRead');
    const localModelFile = File.fromPath(this.modelPath);
    const modelArtifactsJSON = await localModelFile.readText();
    if (!modelArtifactsJSON) {
      throw new Error(`Cannot find model at ${this.modelPath}`);
    }
    const result = JSON.parse(modelArtifactsJSON) as io.ModelArtifacts;
    console.timeEnd('slowRead');
    return result;
  }
}
