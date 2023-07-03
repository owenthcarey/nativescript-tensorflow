import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule } from '@nativescript/angular';
import { TrainingRoutingModule } from './training-routing.module';
import { TrainingComponent } from './training.component';
import { CollectionViewModule } from '@nativescript-community/ui-collectionview/angular';
import { Experiment1Component } from './experiment1/experiment1.component';
import { NativeScriptMaterialSliderModule } from '@nativescript-community/ui-material-slider/angular';
import { NativeScriptMaterialCardViewModule } from '@nativescript-community/ui-material-cardview/angular';
import { NativeScriptMaterialButtonModule } from '@nativescript-community/ui-material-button/angular';

@NgModule({
  imports: [
    NativeScriptCommonModule,
    TrainingRoutingModule,
    CollectionViewModule,
    NativeScriptMaterialSliderModule,
    NativeScriptMaterialCardViewModule,
    NativeScriptMaterialButtonModule,
  ],
  declarations: [Experiment1Component, TrainingComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class TrainingModule {}
