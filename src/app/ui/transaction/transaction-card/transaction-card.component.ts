import { Component, computed, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { IonIcon, IonItem, IonLabel, IonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  layersOutline,
  repeatOutline,
  swapHorizontalOutline,
} from 'ionicons/icons';
import { Transaction } from '../../../api/transaction/transaction';
import { TransactionBasicDto } from '../../../api/transaction/dto/transaction-basic.dto';
import { TransactionUtils } from '../../../shared/util/transaction-utils';
import { ObjectUtils } from '../../../shared/util/object-utils';

export type TransactionCardItem = TransactionBasicDto & Partial<Transaction>;

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
          {{ displayTitle() }}
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

        @if (hasBadgesOrTags()) {
          <div class="transaction-card-tags">
            @if (isRecurring()) {
              <span class="transaction-indicator-pill recurring">
                <ion-icon name="repeat-outline"></ion-icon>
                <span>Recurring</span>
              </span>
            }

            @if (isPrepayment()) {
              <span class="transaction-indicator-pill prepayment">
                <ion-icon name="layers-outline"></ion-icon>
                <span>Prepayment</span>
              </span>
            }

            @if (isDebt()) {
              <span
                class="transaction-indicator-pill debt"
                [ngClass]="transaction().type"
              >
                <ion-icon name="swap-horizontal-outline"></ion-icon>
                <span>{{ debtLabel() }}</span>
              </span>
            }

            @if (transaction().tags; as tags) {
              @for (tag of tags; track tag.id) {
                <span class="transaction-tag-pill">{{ tag.tagName }}</span>
              }
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
        @if (transaction().revised) {
          <span class="recurring-auto-badge">REVISED</span>
        }
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
export class TransactionCardComponent<
  T extends TransactionCardItem = TransactionCardItem,
> {
  protected readonly TransactionUtils = TransactionUtils;

  transaction = input.required<T>();
  categoryName = input<string | undefined>(undefined);
  onClick = output<T>();

  isRecurring = computed(
    () => !ObjectUtils.isNil(this.transaction().recurringTransactionId),
  );

  isPrepayment = computed(
    () => !ObjectUtils.isNil(this.transaction().prepaymentId),
  );

  isDebt = computed(() => !ObjectUtils.isNil(this.transaction().debtId));

  debtLabel = computed(() =>
    TransactionUtils.getDebtLabel(this.transaction().type),
  );

  displayTitle = computed(() => {
    const catName = this.categoryName();
    if (catName) {
      return catName;
    }
    if (this.isDebt()) {
      return this.debtLabel();
    }
    return this.transaction().type;
  });

  hasBadgesOrTags = computed(() => {
    const tags = this.transaction().tags;
    return (
      this.isRecurring() ||
      this.isPrepayment() ||
      this.isDebt() ||
      (tags !== undefined && tags.length > 0)
    );
  });

  constructor() {
    addIcons({
      repeatOutline,
      layersOutline,
      swapHorizontalOutline,
    });
  }
}
