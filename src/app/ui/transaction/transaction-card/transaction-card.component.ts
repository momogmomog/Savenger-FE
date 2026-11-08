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
      <div
        slot="start"
        class="transaction-type-icon"
        [ngClass]="transaction().type"
      >
        <ion-icon
          [name]="TransactionUtils.getIcon(transaction().type)"
        ></ion-icon>
      </div>

      <ion-label>
        <h3 class="transaction-category-title">
          {{ categoryName() || transaction().type }}
        </h3>

        <p class="transaction-card-meta">
          <span>{{ transaction().dateCreated | date: 'mediumDate' }}</span>

          @if (transaction().comment) {
            <span class="meta-separator">•</span>
            <span class="meta-comment-preview">{{
              transaction().comment
            }}</span>
          }
        </p>

        @if (transaction().tags && transaction().tags.length > 0) {
          <div class="transaction-card-tags">
            @for (tag of transaction().tags; track tag.id) {
              <span class="transaction-tag-pill">{{ tag.tagName }}</span>
            }
          </div>
        }
      </ion-label>

      <div slot="end" class="transaction-card-amount-col">
        <ion-text
          [color]="TransactionUtils.getColor(transaction().type)"
          class="transaction-card-amount"
        >
          {{ TransactionUtils.getSign(transaction().type)
          }}{{ transaction().amount | currency }}
        </ion-text>
      </div>
    </ion-item>
  `,
  styleUrls: ['../../../../theme/transaction-card.scss'],
  styles: [
    `
      :host {
        display: block;
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
