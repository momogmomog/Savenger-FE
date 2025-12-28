import { Component, input, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import {
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCardContent,
  IonProgressBar,
  IonBadge,
  IonItem,
  IonLabel,
  IonRow,
  IonCol,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, alertCircleOutline } from 'ionicons/icons';

// Define the interface inline or import it
export interface Budget {
  id: number;
  budgetName: string;
  recurringRule: string;
  dateStarted: string;
  dueDate: string;
  active: boolean;
  balance: number;
  budgetCap: number;
  autoRevise: boolean;
  ownerId: number;
}

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
    IonProgressBar,
    IonBadge,
    IonItem,
    IonLabel,
    IonRow,
    IonCol,
    IonIcon,
  ],
  templateUrl: './budget-card.component.html',
  styles: [
    `
      ion-card {
        cursor: pointer;
        margin-bottom: 16px;
        border-radius: 16px;
      }
      .budget-meta {
        font-size: 0.9em;
        color: var(--ion-color-medium);
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .amount-display {
        font-weight: 700;
        font-size: 1.2em;
      }
    `,
  ],
})
export class BudgetCardComponent {
  // Signal Input
  budget = input.required<Budget>();

  // Computed value for progress bar (0 to 1 scale)
  usageProgress = computed(() => {
    const b = this.budget();
    if (!b.budgetCap || b.budgetCap === 0) return 0;
    // Assuming balance increases as you spend.
    // TODO: Replace balance with spent amount
    return Math.min(b.balance / b.budgetCap, 1);
  });

  // Computed color based on usage
  progressColor = computed(() => {
    const progress = this.usageProgress();
    if (progress > 0.9) return 'danger'; // Red if near cap
    if (progress > 0.7) return 'warning'; // Yellow if getting close
    return 'primary'; // Blue/Green otherwise
  });

  constructor() {
    addIcons({ calendarOutline, alertCircleOutline });
  }
}
