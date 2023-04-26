import {
  platformNativeScript,
  runNativeScriptAngularApp,
} from '@nativescript/angular';

import { AppModule } from './app/app.module';

require('@nativescript/canvas-polyfill');

runNativeScriptAngularApp({
  appModuleBootstrap: () => platformNativeScript().bootstrapModule(AppModule),
});
