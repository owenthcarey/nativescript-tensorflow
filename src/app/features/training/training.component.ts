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
    { name: 'Experiment 1', route: 'experiment1' },
    { name: 'Experiment 2', route: 'experiment2' },
    { name: 'Experiment 3', route: 'experiment3' },
    { name: 'Experiment 4', route: 'experiment4' },
    { name: 'Experiment 5', route: 'experiment5' },
    { name: 'Experiment 6', route: 'experiment6' },
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
