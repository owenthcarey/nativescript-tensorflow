import {
  platformNativeScript,
  runNativeScriptAngularApp,
} from '@nativescript/angular';

import { AppModule } from './app/app.module';
import { install } from '@nativescript-community/ui-chart';

require('@nativescript/canvas-polyfill');

runNativeScriptAngularApp({
  appModuleBootstrap: () => platformNativeScript().bootstrapModule(AppModule),
});

// For ui-chart gestures to work, make sure to add the following code block
// inside main application file
install();
