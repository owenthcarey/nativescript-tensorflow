# TensorFlow.js Integration with NativeScript

This project demonstrates how to integrate **TensorFlow.js** with **NativeScript**, enabling GPU-accelerated execution of TensorFlow.js models within a NativeScript application. This project is inspired by the official [TensorFlow.js React Native tutorial](https://www.tensorflow.org/js/tutorials/applications/react_native) and extends it to work with NativeScript.

## Features

- **Custom WebGL Backend**: Utilize a custom WebGL backend for TensorFlow.js within NativeScript.
- **Platform Adaptation**: Custom platform handler for NativeScript to handle TensorFlow.js-specific operations.
- **Model Training & Inference**: Includes examples of loading, fine-tuning, and running inference with TensorFlow.js models.
- **Real-time Image Processing**: Real-time image processing using TensorFlow.js and NativeScript.

## Prerequisites

To work with this project, you need the following installed:

- Node.js
- NativeScript CLI

## Getting Started

### Installation

Clone the repository and navigate to the project directory:

```bash
git clone https://github.com/owenthcarey/nativescript-tensorflow.git
cd nativescript-tensorflow
```

Install dependencies:

```bash
npm install
```

### Running the Project

To run the project on an emulator or physical device:

```bash
ns run android
ns run ios
```

### Key Code Snippets

- **Custom WebGL Backend Registration**: The code registers a custom WebGL backend and platform for TensorFlow.js within NativeScript:

  ```typescript
  await tf.setBackend('custom-webgl');
  tf.setPlatform('nativescript', new NativescriptPlatform());
  ```

- **Model Loading & Fine-Tuning**: The service class handles loading and fine-tuning a pre-trained model:

  ```typescript
  const model = await tf.loadLayersModel('path-to-your-model');
  await this.fineTuneModel(model, images, labels, numEpochs, batchSize);
  ```

- **Real-time Image Processing**: The project includes functionality to process images in real-time for inference:

  ```typescript
  const prediction = model.predict(imageTensor.expandDims(0)) as tf.Tensor;
  console.log(`Prediction: ${prediction.dataSync()[0]}`);
  ```
