import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule } from '@nativescript/angular';
import { TrainingRoutingModule } from './training-routing.module';
import { TrainingComponent } from './training.component';
import { CollectionViewModule } from '@nativescript-community/ui-collectionview/angular';
import { Experiment1Component } from './experiment1/experiment1.component';

@NgModule({
  imports: [
    NativeScriptCommonModule,
    TrainingRoutingModule,
    CollectionViewModule,
  ],
  declarations: [Experiment1Component, TrainingComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class TrainingModule {}
