import {GPGPUContext, MathBackendWebGL} from '@tensorflow/tfjs-backend-webgl';
import {Injectable} from '@angular/core';
import * as tf from '@tensorflow/tfjs';

@Injectable({
  providedIn: 'root',
})
export class TensorflowService {
  async init(webGLRenderingContext: WebGLRenderingContext) {
    try {
      tf.registerBackend('custom-webgl', () => {
        const customGPGPUContext = new GPGPUContext(webGLRenderingContext);
        return new MathBackendWebGL(customGPGPUContext);
      });
      await tf.setBackend('custom-webgl');
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
    result.array().then(array => {
      console.log('Matrix multiplication result:', array);
    });
    a.dispose();
    b.dispose();
    result.dispose();
  }
}
