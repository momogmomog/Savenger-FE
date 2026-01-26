import { Component, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { IonIcon, IonItem, IonLabel, IonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowDownCircle, arrowUpCircle, swapHorizontal } from 'ionicons/icons';
import { TransactionType } from '../../../api/transaction/transaction.type';
import { Transaction } from '../../../api/transaction/transaction';

@Component({
  selector: 'app-transaction-card',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    IonItem,
    IonLabel,
    IonIcon,
    IonText,
  ],
  template: `
    <ion-item
      (click)="onClick.emit(transaction())"
      lines="full"
      [detail]="false"
      [button]="true"
    >
      <div slot="start" class="transaction-icon" [ngClass]="transaction().type">
        <ion-icon [name]="getIcon(transaction().type)"></ion-icon>
      </div>

      <ion-label>
        <h3 class="font-bold">
          {{ categoryName() || transaction().type }}
        </h3>

        <p class="sub-text">
          <span>{{ transaction().dateCreated | date: 'mediumDate' }}</span>

          @if (transaction().comment) {
            <span class="separator">•</span>
            <span class="comment-preview">{{ transaction().comment }}</span>
          }
        </p>

        @if (transaction().tags && transaction().tags.length > 0) {
          <div class="tags-row">
            @for (tag of transaction().tags; track tag.id) {
              <span class="tag-pill">{{ tag.tagName }}</span>
            }
          </div>
        }
      </ion-label>

      <div slot="end" class="amount-container">
        <ion-text [color]="getColor(transaction().type)" class="amount-text">
          {{ getSign(transaction().type) }}{{ transaction().amount | currency }}
        </ion-text>
      </div>
    </ion-item>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .transaction-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        background: var(--ion-color-light);
        color: var(--ion-color-medium);

        &.EXPENSE {
          background: rgba(var(--ion-color-danger-rgb), 0.1);
          color: var(--ion-color-danger);
        }
        &.INCOME {
          background: rgba(var(--ion-color-success-rgb), 0.1);
          color: var(--ion-color-success);
        }
        &.COMPENSATE {
          background: rgba(var(--ion-color-primary-rgb), 0.1);
          color: var(--ion-color-primary);
        }
      }
      .font-bold {
        font-weight: 600;
        font-size: 1rem;
        margin-bottom: 2px;
      }

      .sub-text {
        font-size: 0.8rem;
        color: var(--ion-color-medium);
        display: flex;
        align-items: center;
        overflow: hidden;
      }

      .separator {
        margin: 0 4px;
      }

      .comment-preview {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-style: italic;
        opacity: 0.8;
      }

      .tags-row {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 6px;
      }

      .tag-pill {
        font-size: 0.7rem;
        background-color: var(--ion-color-step-150, #333);
        color: var(--ion-text-color, #fff);
        padding: 2px 8px;
        border-radius: 4px;
        opacity: 0.9;
        white-space: nowrap;
      }

      .amount-text {
        font-weight: 700;
        font-size: 1rem;
        white-space: nowrap;
      }
    `,
  ],
})
export class TransactionCardComponent {
  transaction = input.required<Transaction>();
  categoryName = input<string | undefined>(undefined);
  onClick = output<Transaction>();

  constructor() {
    addIcons({ arrowDownCircle, arrowUpCircle, swapHorizontal });
  }

  getIcon(type: TransactionType): string {
    switch (type) {
      case TransactionType.INCOME:
        return 'arrow-down-circle';
      case TransactionType.EXPENSE:
        return 'arrow-up-circle';
      default:
        return 'swap-horizontal';
    }
  }

  getColor(type: TransactionType): string {
    switch (type) {
      case TransactionType.INCOME:
        return 'success';
      case TransactionType.EXPENSE:
        return 'dark'; // Or 'danger' if you prefer red for expense text
      default:
        return 'medium';
    }
  }

  getSign(type: TransactionType): string {
    return type === TransactionType.EXPENSE ? '-' : '+';
  }
}
