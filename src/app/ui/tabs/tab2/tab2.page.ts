import { Component, OnInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { BudgetSliderService } from '../../budget/budget-slider/budget-slider.service';
import { BudgetSliderComponent } from '../../budget/budget-slider/budget-slider.component';

@Component({
  selector: 'app-tab2',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, BudgetSliderComponent],
  templateUrl: './tab2.page.html',
})
export class Tab2Page implements OnInit {
  constructor(private budgetSliderService: BudgetSliderService) {}

  budget = this.budgetSliderService.currentBudget;

  async ngOnInit(): Promise<void> {}
}
