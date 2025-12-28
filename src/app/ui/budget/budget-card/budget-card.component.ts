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
  styles: [
    `
      ion-card {
        cursor: pointer;
        margin-bottom: 16px;
        border-radius: 16px;
      }
      .stat-label {
        font-size: 0.75em;
        text-transform: uppercase;
        color: var(--ion-color-medium);
        letter-spacing: 0.5px;
        margin-bottom: 4px;
      }
      .balance-value {
        font-weight: 800;
        font-size: 1.2em;
        color: var(--ion-color-dark);
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
