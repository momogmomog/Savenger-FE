import { Component } from '@angular/core';
import { UiSwiperComponent } from '../../../shared/ui-swiper/ui-swiper.component';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone'; // Update path

// Define your interface
export interface Budget {
  id: number;
  name: string;
  amount: number;
}

@Component({
  selector: 'app-tab2',
  standalone: true,
  imports: [
    UiSwiperComponent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent /* Ionic Modules */,
  ],
  templateUrl: './tab2.page.html',
})
export class Tab2Page {
  // Your data
  budgets: Budget[] = [
    { id: 1, name: 'Personal', amount: 500 },
    { id: 2, name: 'Business', amount: 1200 },
    { id: 3, name: 'Savings', amount: 3000 },
  ];

  // The simplified handler
  handleAccountSwipe(event: { index: number; item: Budget }): void {
    console.log('Active Index:', event.index);
    console.log('Active Budget Object:', event.item); // Access .name, .amount directly!

    // Example: Update a signal or variable based on the active card
    // this.selectedBudget = event.item;
  }
}
