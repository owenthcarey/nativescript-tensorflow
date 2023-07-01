import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { Canvas } from '@nativescript/canvas';
import { NativeScriptModule } from '@nativescript/angular';
import { registerElement } from '@nativescript/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from '~/app/home/home.component';
import {
  NativeScriptMaterialBottomNavigationModule
} from '@nativescript-community/ui-material-bottom-navigation/angular';

registerElement('Canvas', () => Canvas);

@NgModule({
  bootstrap: [AppComponent],
  imports: [NativeScriptModule, AppRoutingModule, NativeScriptMaterialBottomNavigationModule],
  declarations: [AppComponent, HomeComponent],
  providers: [],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AppModule {}
