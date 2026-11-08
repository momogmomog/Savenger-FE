import { Component, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { IonIcon, IonItem, IonLabel, IonText } from '@ionic/angular/standalone';
import { Transaction } from '../../../api/transaction/transaction';
import { TransactionUtils } from '../../../shared/util/transaction-utils';

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
        <ion-icon
          [name]="TransactionUtils.getIcon(transaction().type)"
        ></ion-icon>
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
        <ion-text
          [color]="TransactionUtils.getColor(transaction().type)"
          class="amount-text"
        >
          {{ TransactionUtils.getSign(transaction().type)
          }}{{ transaction().amount | currency }}
        </ion-text>
      </div>
    </ion-item>
  `,
  styles: [
    `
      :host {
        display: block;
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
    `,
  ],
})
export class TransactionCardComponent {
  protected readonly TransactionUtils = TransactionUtils;

  transaction = input.required<Transaction>();
  categoryName = input<string | undefined>(undefined);
  onClick = output<Transaction>();
}
