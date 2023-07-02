import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { NativeScriptRouterModule } from '@nativescript/angular';
import { TrainingComponent } from './training.component';
import { Experiment1Component } from './experiment1/experiment1.component';

export const routes: Routes = [
  {
    path: '',
    component: TrainingComponent,
  },
  {
    path: 'experiment1',
    component: Experiment1Component,
  },
];

@NgModule({
  imports: [NativeScriptRouterModule.forChild(routes)],
})
export class TrainingRoutingModule {}
