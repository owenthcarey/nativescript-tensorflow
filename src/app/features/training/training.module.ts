import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule } from '@nativescript/angular';
import { TrainingRoutingModule } from './training-routing.module';
import { TrainingComponent } from './training.component';
import { CollectionViewModule } from '@nativescript-community/ui-collectionview/angular';

@NgModule({
  imports: [
    NativeScriptCommonModule,
    TrainingRoutingModule,
    CollectionViewModule,
  ],
  declarations: [TrainingComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class TrainingModule {}
