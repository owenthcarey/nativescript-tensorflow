import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { NativeScriptRouterModule } from '@nativescript/angular';
import { TrainingComponent } from './training.component';

export const routes: Routes = [
  {
    path: '',
    component: TrainingComponent,
  },
];

@NgModule({
  imports: [NativeScriptRouterModule.forChild(routes)],
})
export class TrainingRoutingModule {}
