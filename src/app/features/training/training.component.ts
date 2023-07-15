import { Component } from '@angular/core';
import { RouterExtensions } from '@nativescript/angular';

@Component({
  moduleId: module.id,
  selector: 'ns-training',
  templateUrl: 'training.component.html',
  styleUrls: ['training.component.css'],
})
export class TrainingComponent {
  experiments = [
    { name: 'Image Classification from Scratch', route: 'experiment1' },
    { name: 'Simple MNIST Convnet', route: 'vision/mnist-convnet' },
    {
      name: 'Image Classification via Fine-Tuning with EfficientNet',
      route: 'vision/image-classification-efficientnet-fine-tuning',
    },
    {
      name: 'Image Classification with Vision Transformer',
      route: 'vision/image-classification-with-vision-transformer',
    },
    {
      name: 'Image Classification Using BigTransfer (BiT)',
      route: 'vision/bit',
    },
    {
      name: 'Classification Using Attention-Based Deep Multiple Instance Learning (MIL)',
      route: 'vision/attention-mil-classification',
    },
  ];

  constructor(private routerExtensions: RouterExtensions) {}

  onItemTap(args: any) {
    console.log('Item tapped at index', args.index);
    const tappedExperimentItem = this.experiments[args.index];
    this.routerExtensions.navigate([
      { outlets: { trainingTab: ['training', tappedExperimentItem.route] } },
    ]);
  }
}
