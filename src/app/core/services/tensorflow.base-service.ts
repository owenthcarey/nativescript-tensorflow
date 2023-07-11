import * as tf from '@tensorflow/tfjs';
import {
  GPGPUContext,
  MathBackendWebGL,
  setWebGLContext,
} from '@tensorflow/tfjs-backend-webgl';
import { io } from '@tensorflow/tfjs-core';
import { File } from '@nativescript/core';

export abstract class TensorflowBaseService {
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
