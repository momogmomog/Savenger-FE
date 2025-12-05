import { Component, EnvironmentInjector, inject } from '@angular/core';
import {
  IonIcon,
  IonLabel,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  barChartOutline,
  ellipse,
  person,
  personOutline,
  square,
  swapHorizontalOutline,
  timerOutline,
  triangle,
  walletOutline,
} from 'ionicons/icons';
import { AppRoutingPath } from '../../../app-routing.path';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);

  Routes = AppRoutingPath;

  constructor() {
    addIcons({
      triangle,
      ellipse,
      square,
      personOutline,
      person,
      barChartOutline,
      swapHorizontalOutline,
      walletOutline,
      timerOutline,
    });
  }
}
