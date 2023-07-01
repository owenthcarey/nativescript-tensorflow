import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { NativeScriptRouterModule } from '@nativescript/angular';
import { CameraComponent } from './camera.component';

export const routes: Routes = [
  {
    path: '',
    component: CameraComponent,
  },
];

@NgModule({
  imports: [NativeScriptRouterModule.forChild(routes)],
})
export class CameraRoutingModule {}
