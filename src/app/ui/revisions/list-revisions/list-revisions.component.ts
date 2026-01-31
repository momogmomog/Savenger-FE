import { Component, OnInit } from '@angular/core';
import { BudgetSliderComponent } from '../../budget/budget-slider/budget-slider.component';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
  RefresherCustomEvent,
} from '@ionic/angular/standalone';
import { BudgetSliderService } from '../../budget/budget-slider/budget-slider.service';

@Component({
  selector: 'app-list-revisions',
  templateUrl: './list-revisions.component.html',
  styleUrls: ['./list-revisions.component.scss'],
  imports: [
    BudgetSliderComponent,
    IonButtons,
    IonContent,
    IonHeader,
    IonRefresher,
    IonRefresherContent,
    IonTitle,
    IonToolbar,
  ],
})
export class ListRevisionsComponent implements OnInit {
  budget = this.budgetSliderService.currentBudget;

  constructor(private budgetSliderService: BudgetSliderService) {}

  ngOnInit(): void {}

  async handleRefresh(event: RefresherCustomEvent): Promise<void> {
    void event.target.complete();
  }
}
