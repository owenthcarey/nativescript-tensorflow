import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule } from '@nativescript/angular';
import { CameraRoutingModule } from './camera-routing.module';
import { CameraComponent } from './camera.component';
import { CollectionViewModule } from '@nativescript-community/ui-collectionview/angular';
import { NativeScriptMaterialSliderModule } from '@nativescript-community/ui-material-slider/angular';

@NgModule({
  imports: [
    NativeScriptCommonModule,
    CameraRoutingModule,
    CollectionViewModule,
    NativeScriptMaterialSliderModule,
  ],
  declarations: [CameraComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class CameraModule {}
