import { Component, OnInit, signal } from '@angular/core';
import { UiSwiperComponent } from '../../../shared/ui-swiper/ui-swiper.component';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { BudgetSliderItemComponent } from '../../budget/budget-slider-item/budget-slider-item.component';
import { BudgetQuery, BudgetQueryImpl } from '../../../api/budget/budget.query';
import { BudgetService } from '../../../api/budget/budget.service';
import { Budget } from '../../../api/budget/budget';

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
export class Tab2Page implements OnInit {
  private budgetQuery: BudgetQuery = new BudgetQueryImpl();
  budgets = signal<Budget[]>([]);

  constructor(private budgetService: BudgetService) {}

  async ngOnInit(): Promise<void> {
    const resp = await this.budgetService.search(this.budgetQuery);
    this.budgets.set(resp.response.content);
  }

  // The simplified handler
  handleAccountSwipe(event: { index: number; item: Budget }): void {
    console.log('Active Index:', event.index);
    console.log('Active Budget Object:', event.item); // Access .name, .amount directly!

    // Example: Update a signal or variable based on the active card
    // this.selectedBudget = event.item;
  }
}
