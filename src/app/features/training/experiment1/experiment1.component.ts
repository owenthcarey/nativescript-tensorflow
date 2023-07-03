import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterExtensions } from '@nativescript/angular';
import {
  Application,
  AndroidApplication,
  AndroidActivityBackPressedEventData,
} from '@nativescript/core';
import { Canvas } from '@nativescript/canvas';
import { Experiment1Service } from './experiment1.service';
import { LineChart } from '@nativescript-community/ui-chart/charts/LineChart';
import { LineDataSet } from '@nativescript-community/ui-chart/data/LineDataSet';
import { LineData } from '@nativescript-community/ui-chart/data/LineData';

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

  onChartLoaded(args) {
    const chart = args.object as LineChart;
    chart.backgroundColor = 'white';

    // enable touch gestures
    chart.setTouchEnabled(true);

    chart.setDrawGridBackground(false);

    // enable scaling and dragging
    chart.setDragEnabled(true);
    chart.setScaleEnabled(true);

    // force pinch zoom along both axis
    chart.setPinchZoom(true);

    // disable dual axis (only use LEFT axis)
    chart.getAxisRight().setEnabled(false);

    const myData = new Array(500).fill(0).map((v, i) => ({
      index: i,
      value: Math.random() * 1,
    }));

    const sets = [];
    const set = new LineDataSet(myData, 'Legend Label', 'index', 'value');
    set.setColor('blue');
    sets.push(set);

    // Create a data object with the data sets
    const ld = new LineData(sets);

    // Set data
    chart.setData(ld);
  }
}
