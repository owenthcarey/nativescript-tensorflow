import {Canvas} from '@nativescript/canvas';
import {Component} from '@angular/core'
import {TensorflowService} from '~/app/tensorflow.service';

@Component({
  selector: 'ns-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  constructor(private tensorflowService: TensorflowService) {
    console.log('constructor()');
  }

  async onCanvasReady(args) {
    console.log('onCanvasReady()');
    const canvas = args.object as Canvas;
    const webGLRenderingContext = canvas.getContext('webgl') as unknown as WebGLRenderingContext
    // await this.tensorflowService.init(webGLRenderingContext);
    this.tensorflowService.multiplyMatrices();
  }
}
