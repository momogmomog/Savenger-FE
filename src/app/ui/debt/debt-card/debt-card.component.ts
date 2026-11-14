import { Component, computed, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { IonIcon, IonItem, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowDownCircleOutline,
  arrowUpCircleOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import { Debt } from '../../../api/debt/debt';

@Component({
  selector: 'app-debt-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, IonItem, IonLabel, IonIcon],
  templateUrl: './debt-card.component.html',
  styleUrls: ['./debt-card.component.scss'],
})
export class DebtCardComponent {
  debt = input.required<Debt>();
  perspectiveBudgetId = input<number | null>(null);

  onClick = output<Debt>();

  isBorrower = computed(
    () => this.debt().receiverBudgetId === this.perspectiveBudgetId(),
  );

  isSettled = computed(() => (this.debt().amount || 0) <= 0);

  counterpartBudgetName = computed(() => {
    const d = this.debt();
    if (this.isBorrower()) {
      return d.lenderBudget?.budgetName || `Budget #${d.lenderBudgetId}`;
    }
    return d.receiverBudget?.budgetName || `Budget #${d.receiverBudgetId}`;
  });

  displayDate = computed(
    () => this.debt().updateDate || this.debt().createDate,
  );

  constructor() {
    addIcons({
      checkmarkCircleOutline,
      arrowDownCircleOutline,
      arrowUpCircleOutline,
    });
  }
}
