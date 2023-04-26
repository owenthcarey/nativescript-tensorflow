import {Injectable} from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import {
  GPGPUContext,
  MathBackendWebGL,
  setWebGLContext,
} from '@tensorflow/tfjs-backend-webgl';

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
        const newKernelConfig
          = Object.assign({}, kernelConfig, {backendName: 'custom-webgl',});
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
    const a = tf.tensor2d([[1, 2], [3, 4]]);
    const b = tf.tensor2d([[5, 6], [7, 8]]);
    const result = tf.matMul(a, b);
    console.log('Matrix multiplication result:', result);
    result.array().then(array => {
      console.log('Matrix multiplication result:', array);
    });
    a.dispose();
    b.dispose();
    result.dispose();
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
}
