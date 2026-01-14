import {
  Component,
  effect,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { Budget } from '../../../api/budget/budget';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, walletOutline } from 'ionicons/icons';
import { BudgetSliderService } from './budget-slider.service';

@Component({
  selector: 'app-budget-slider-item',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon,
  ],
  templateUrl: './budget-slider-item.component.html',
  styleUrls: ['./budget-slider-item.component.scss'],
})
export class BudgetSliderItemComponent {
  budget = input.required<Budget>();
  detailsClicked = output<void>();

  currentBalance = signal<number>(0);

  constructor(private budgetSliderService: BudgetSliderService) {
    addIcons({ arrowForwardOutline, walletOutline });

    effect(() => {
      const stat = this.budgetSliderService.currentStatistic();
      const currentBudget = untracked(this.budget);

      if (currentBudget.id !== stat.budget.id) {
        return;
      }

      this.currentBalance.set(stat.realBalance);
    });
  }

  onDetailsClick(ev: Event): void {
    ev.stopPropagation();
    this.detailsClicked.emit();
  }
}
