import { Component, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import {
  IonBadge,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonIcon,
  IonRow,
  IonButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  calendarOutline,
  pencilOutline,
} from 'ionicons/icons';
import { Budget } from '../../../api/budget/budget';
import { TransactionUtils } from '../../../shared/util/transaction-utils';

@Component({
  selector: 'app-budget-card',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonBadge,
    IonRow,
    IonCol,
    IonIcon,
    IonButton,
  ],
  templateUrl: './budget-card.component.html',
  styleUrls: ['../../../../theme/budget.scss'],
  styles: [
    `
      ion-card {
        cursor: pointer;
        margin-bottom: 16px;
        border-radius: var(--card-border-radius-md, 16px);
      }
      .budget-stat-label {
        margin-bottom: 4px;
      }
      .balance-value {
        font-weight: 800;
        font-size: 1.2em;
        color: var(--ion-text-color, var(--ion-color-dark));
      }
      .cap-value {
        font-weight: 600;
        font-size: 1.2em;
        color: var(--ion-color-medium-shade);
      }
      .budget-meta {
        font-size: 0.85em;
        color: var(--ion-color-medium);
        display: flex;
        align-items: center;
        gap: 6px;
      }
    `,
  ],
})
export class BudgetCardComponent {
  protected readonly TransactionUtils = TransactionUtils;
  budget = input.required<Budget>();
  editTriggered = output<Budget>();

  constructor() {
    addIcons({ calendarOutline, alertCircleOutline, pencilOutline });
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    this.editTriggered.emit(this.budget());
  }
}
