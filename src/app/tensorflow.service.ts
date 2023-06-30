import { Injectable } from '@angular/core';
import { io } from '@tensorflow/tfjs-core';
import * as tf from '@tensorflow/tfjs';
import { File, Http, knownFolders } from '@nativescript/core';
import {
  GPGPUContext,
  MathBackendWebGL,
  setWebGLContext,
} from '@tensorflow/tfjs-backend-webgl';

// declare var __non_webpack_require__;

@Injectable({
  providedIn: 'root',
})
export class TensorflowService {
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
    model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });

    // Generate some synthetic data for training. (y = 2x - 1)
    const xs = tf.tensor2d([-1, 0, 1, 2, 3, 4], [6, 1]);
    const ys = tf.tensor2d([-3, -1, 1, 3, 5, 7], [6, 1]);

    // Define the onEpochEnd callback to print the loss
    const onEpochEnd = (epoch, logs) => {
      console.log(`Epoch ${epoch}: loss = ${logs.loss}`);
    };

    // Train the model using the data.
    await model.fit(xs, ys, {
      epochs: 250,
      callbacks: { onEpochEnd },
    });
  }

  async loadAndFineTuneModel(numEpochs = 10, batchSize = 32) {
    console.log('Loading model...');
    const model = await this.loadModel();
    console.log('Model loaded. Fine-tuning model...');
    const { images, labels } = await this.loadMnistData();
    console.log('MNIST data loaded. Fine-tuning model...');
    await this.fineTuneModel(model, images, labels, numEpochs, batchSize);
    console.log('Model fine-tuning completed.');
  }

  private async loadModel(): Promise<tf.LayersModel> {
    console.log('Loading base model...');
    const remoteModelUrl =
      'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json';
    const localModelFileName = 'mobilenet_v1_0.25_224_model.json';
    const documents = knownFolders.documents();
    const localModelFile = documents.getFile(localModelFileName);
    await Http.getString(remoteModelUrl).then(
      async (result: string) => {
        console.log('Model JSON contents:', result);
        await localModelFile.writeText(result);
      },
      (error) => {
        console.error('Error fetching model JSON:', error);
      }
    );
    const model = await tf.loadLayersModel(
      new NativescriptStorageHandler(localModelFile.path),
      {
        onProgress: (fraction) => {
          console.log(`Download progress: ${(fraction * 100).toFixed(2)}%`);
        },
      }
    );
    console.log(
      'Base model loaded. Truncating and creating new output layer...'
    );
    const layer = model.getLayer('conv_pw_13_relu');
    const truncatedModel = tf.model({
      inputs: model.inputs,
      outputs: layer.output,
    });
    const NUM_CLASSES = 10;
    const newOutputLayer = tf.layers.dense({
      units: NUM_CLASSES,
      activation: 'softmax',
      kernelInitializer: 'varianceScaling',
      useBias: true,
    });
    const globalAveragePoolingLayer = tf.layers.globalAveragePooling2d({});
    const pooledOutput = globalAveragePoolingLayer.apply(
      truncatedModel.output
    ) as tf.SymbolicTensor;
    const newOutput = newOutputLayer.apply(pooledOutput) as tf.SymbolicTensor;
    const fineTuningModel = tf.model({
      inputs: truncatedModel.inputs,
      outputs: newOutput,
    });
    console.log('Fine-tuning model compiled.');
    fineTuningModel.compile({
      optimizer: tf.train.adam(0.0001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });
    return fineTuningModel;
  }

  private async loadMnistData(): Promise<{
    images: tf.Tensor4D[];
    labels: tf.Tensor1D[];
  }> {
    console.log('Fetching MNIST data...');
    const trainImagesUrl =
      'http://yann.lecun.com/exdb/mnist/train-images-idx3-ubyte.gz';
    const trainLabelsUrl =
      'http://yann.lecun.com/exdb/mnist/train-labels-idx1-ubyte.gz';
    const [trainImagesResponse, trainLabelsResponse] = await Promise.all([
      fetch(trainImagesUrl),
      fetch(trainLabelsUrl),
    ]);
    const [trainImagesArrayBuffer, trainLabelsArrayBuffer] = await Promise.all([
      trainImagesResponse.arrayBuffer(),
      trainLabelsResponse.arrayBuffer(),
    ]);
    const trainImages = new Uint8Array(trainImagesArrayBuffer);
    const trainLabels = new Uint8Array(trainLabelsArrayBuffer);
    const numImages = 1000;
    const imageHeight = 28;
    const imageWidth = 28;
    const images = [];
    const labels = [];
    console.log('Processing MNIST data...');
    for (let i = 0; i < numImages; i++) {
      const image = tf.tidy(() => {
        const img = tf.tensor2d(
          trainImages.slice(
            i * imageHeight * imageWidth + 16,
            (i + 1) * imageHeight * imageWidth + 16
          ),
          [imageHeight, imageWidth],
          'int32'
        );
        const resizedImg = tf.image.resizeBilinear(
          img.as4D(1, imageHeight, imageWidth, 1),
          [224, 224]
        );
        const normalizedImg = tf
          .cast(resizedImg, 'float32')
          .div(tf.scalar(255));
        return normalizedImg.tile([1, 1, 1, 3]);
      });
      images.push(image);
      const label = tf.tidy(() => {
        const lbl = tf.scalar(trainLabels[i + 8], 'int32');
        return tf.oneHot(lbl, 10).reshape([1, 10]);
      });
      labels.push(label);
    }
    return { images, labels };
  }

  private async fineTuneModel(
    model: tf.LayersModel,
    images: tf.Tensor4D[],
    labels: tf.Tensor1D[],
    numEpochs = 10,
    batchSize = 32
  ) {
    const datasetSize = images.length;
    const numBatchesPerEpoch = Math.ceil(datasetSize / batchSize);
    console.log('Starting fine-tuning...');
    for (let epoch = 0; epoch < numEpochs; epoch++) {
      console.log(`Epoch ${epoch + 1} / ${numEpochs}`);
      const indices = tf.util.createShuffledIndices(datasetSize);
      const indicesArray = Array.from(indices);
      const shuffledImages = indicesArray.map((i) => images[i]);
      const shuffledLabels = indicesArray.map((i) => labels[i]);
      for (let batch = 0; batch < numBatchesPerEpoch; batch++) {
        const start = batch * batchSize;
        const end = Math.min(start + batchSize, datasetSize);
        const batchImages = tf.concat(shuffledImages.slice(start, end), 0);
        const batchLabels = tf.concat(shuffledLabels.slice(start, end), 0);
        console.log(`Batch ${batch + 1} / ${numBatchesPerEpoch}`);
        await model.fit(batchImages, batchLabels, { epochs: 1, batchSize });
        batchImages.dispose();
        batchLabels.dispose();
        console.log(`Batch ${batch + 1} / ${numBatchesPerEpoch}`);
      }
    }
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

  // async load(): Promise<io.ModelArtifacts> {
  //   console.time('fastRead');
  //   if (!File.exists(this.modelPath)) {
  //     throw new Error(`Cannot find model at ${this.modelPath}`);
  //   }
  //   const result = __non_webpack_require__(this.modelPath) as io.ModelArtifacts;
  //   console.timeEnd('fastRead');
  //   return result;
  // }

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
