import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { NativeScriptRouterModule } from '@nativescript/angular';

import { HomeComponent } from '~/app/home/home.component';

// const routes: Routes = [
//   { path: '', redirectTo: '/home', pathMatch: 'full' },
//   { path: 'home', component: HomeComponent },
// ];

const routes: Routes = [
  {
    path: '',
    redirectTo: '/training',
    pathMatch: 'full',
  },
  {
    path: 'camera',
    loadChildren: () =>
      import('./features/camera/camera.module').then((m) => m.CameraModule),
    outlet: 'cameraTab',
  },
  {
    path: 'training',
    loadChildren: () =>
      import('./features/training/training.module').then(
        (m) => m.TrainingModule
      ),
    outlet: 'trainingTab',
  },
];

@NgModule({
  imports: [NativeScriptRouterModule.forRoot(routes)],
  exports: [NativeScriptRouterModule],
})
export class AppRoutingModule {}
