import { Component } from '@angular/core';
import { UiSwiperComponent } from '../../../shared/ui-swiper/ui-swiper.component';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { BudgetSliderItemComponent } from '../../budget/budget-slider-item/budget-slider-item.component'; // Update path

// Define your interface
export interface Budget {
  id: number;
  budgetName: string;
  budgetCap: number;
}

@Component({
  selector: 'app-tab2',
  standalone: true,
  imports: [
    UiSwiperComponent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    BudgetSliderItemComponent,
    /* Ionic Modules */
  ],
  templateUrl: './tab2.page.html',
})
export class Tab2Page {
  // Your data
  budgets: Budget[] = [
    { id: 1, budgetName: 'Personal', budgetCap: 500 },
    { id: 2, budgetName: 'Business', budgetCap: 1200 },
    { id: 3, budgetName: 'Savings', budgetCap: 3000 },
  ];

  // The simplified handler
  handleAccountSwipe(event: { index: number; item: Budget }): void {
    console.log('Active Index:', event.index);
    console.log('Active Budget Object:', event.item); // Access .name, .amount directly!

    // Example: Update a signal or variable based on the active card
    // this.selectedBudget = event.item;
  }
}
