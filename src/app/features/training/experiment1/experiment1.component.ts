import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterExtensions } from '@nativescript/angular';
import {
  Application,
  AndroidApplication,
  AndroidActivityBackPressedEventData,
} from '@nativescript/core';
import { Canvas } from '@nativescript/canvas';
import { Experiment1Service } from './experiment1.service';

@Component({
  moduleId: module.id,
  selector: 'ns-experiment1',
  templateUrl: 'experiment1.component.html',
})
export class Experiment1Component implements OnInit, OnDestroy {
  constructor(
    private experiment1Service: Experiment1Service,
    private routerExtensions: RouterExtensions
  ) {}

  ngOnInit() {
    if (Application.android) {
      Application.android.on(
        AndroidApplication.activityBackPressedEvent,
        (data: AndroidActivityBackPressedEventData) => {
          // Cancel the default back-button behavior
          data.cancel = true;
          // Use RouterExtensions to navigate back
          this.routerExtensions.back();
        }
      );
    }
  }

  ngOnDestroy() {
    if (Application.android) {
      // Remove the event when the component is destroyed
      Application.android.off(AndroidApplication.activityBackPressedEvent);
    }
  }

  async onCanvasReady(args) {
    console.log('onCanvasReady()');
    const canvas = args.object as Canvas;
    const webGLRenderingContext = canvas.getContext(
      'webgl2'
    ) as unknown as WebGLRenderingContext;
    await this.experiment1Service.init(webGLRenderingContext);
    this.experiment1Service.multiplyMatrices();
  }
}
