import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterExtensions } from '@nativescript/angular';

@Component({
  selector: 'ns-app',
  templateUrl: './app.component.html',
})
export class AppComponent {
  constructor(
    private router: Router,
    private routerExtensions: RouterExtensions
  ) {}

  onSelectedIndexChanged(args: any) {
    console.log('onSelectedIndexChanged: ', args.newIndex);
    const selectedIndex = args.newIndex;
    switch (selectedIndex) {
      case 0:
        this.routerExtensions.navigate([
          { outlets: { trainingTab: ['training'] } },
        ]);
        break;
      case 1:
        this.routerExtensions.navigate([
          { outlets: { cameraTab: ['camera'] } },
        ]);
        break;
    }
  }
}
