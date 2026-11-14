import { Component, effect, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  IonButton,
  IonChip,
  IonContent,
  IonIcon,
  IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, walletOutline } from 'ionicons/icons';
import { ModalContentBaseComponent } from '../../../shared/modal/modals/modal-content-base.component';
import { Debt } from '../../../api/debt/debt';
import { PayDebtPayload } from '../../../api/debt/pay-debt.payload';
import { DebtService } from '../../../api/debt/debt.service';
import { Formified, FormUtil } from '../../../shared/util/forms.util';
import { FieldError } from '../../../shared/field-error/field-error';
import { ErrorMessageComponent } from '../../../shared/field-error/error-message/error-message.component';
import { LoaderComponent } from '../../../shared/loader/loader.component';
import { ShowLoader } from '../../../shared/loader/show.loader.decorator';
import { InputComponent } from '../../../shared/form-controls/input/input.component';
import { ShellConfigHeader } from '../../../shared/modal/shells/modal-shell.types';

export class PayDebtModalPayload {
  constructor(public readonly debt: Debt) {}
}

@Component({
  selector: 'app-pay-debt-modal',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    ReactiveFormsModule,
    IonContent,
    IonButton,
    IonIcon,
    IonChip,
    IonLabel,
    LoaderComponent,
    ErrorMessageComponent,
    InputComponent,
  ],
  styleUrls: ['../../../../theme/budget.scss'],
  styles: [
    `
      .quick-amounts-row {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 8px;
      }
    `,
  ],
  template: `
    <ion-content class="ion-padding">
      <app-loader loaderName="payDebtLoader"></app-loader>

      <div class="debt-modal-banner">
        <div>
          <div class="budget-stat-label">Debt Relation</div>
          <div class="font-bold text-dark">
            {{ lenderName() }} lends to {{ receiverName() }}
          </div>
        </div>
        <div class="ion-text-end">
          <div class="budget-stat-label">Outstanding Debt</div>
          <div class="font-bold text-expense">
            {{ payload().debt.amount | currency }}
          </div>
        </div>
      </div>

      <form #payForm [formGroup]="form" (ngSubmit)="onFormSubmit()">
        <app-field-error [errors]="errors()" fieldName=""></app-field-error>

        <div class="ion-margin-top">
          <app-input
            formControlName="amount"
            label="Amount to Pay"
            type="number"
            placeholder="0.00"
          ></app-input>
          <app-field-error
            [errors]="errors()"
            fieldName="amount"
          ></app-field-error>
        </div>

        @if (payload().debt.amount > 0) {
          <div class="quick-amounts-row">
            <ion-chip
              outline="true"
              color="primary"
              (click)="setPercentage(0.25)"
            >
              <ion-label>25%</ion-label>
            </ion-chip>
            <ion-chip
              outline="true"
              color="primary"
              (click)="setPercentage(0.5)"
            >
              <ion-label>50%</ion-label>
            </ion-chip>
            <ion-chip
              outline="true"
              color="primary"
              (click)="setPercentage(0.75)"
            >
              <ion-label>75%</ion-label>
            </ion-chip>
            <ion-chip outline="true" color="success" (click)="setPercentage(1)">
              <ion-label
                >Full ({{ payload().debt.amount | currency }})</ion-label
              >
            </ion-chip>
          </div>
        }

        <div class="ion-margin-top">
          <ion-button
            [form]="payForm"
            type="submit"
            expand="block"
            shape="round"
            color="primary"
            [disabled]="!form.valid"
          >
            <ion-icon slot="start" name="checkmark-circle-outline"></ion-icon>
            Confirm Payment
          </ion-button>
        </div>
      </form>
    </ion-content>
  `,
})
export class PayDebtModal
  extends ModalContentBaseComponent<PayDebtModalPayload, Debt | null>
  implements OnInit
{
  form: Formified<PayDebtPayload>;
  errors = signal<FieldError[]>([]);

  constructor(private debtService: DebtService) {
    super();
    addIcons({ checkmarkCircleOutline, walletOutline });

    this.form = new FormGroup({
      amount: FormUtil.requiredNumber(),
    });

    effect(() => {
      const debt = this.payload().debt;
      this.form.patchValue({
        amount: debt.amount,
      });
    });
  }

  ngOnInit(): void {
    queueMicrotask(() => {
      const cfg = this.shellConfig() as ShellConfigHeader;
      cfg.title = 'Pay Debt';
      cfg.showCloseButton = true;
    });
  }

  receiverName(): string {
    const d = this.payload().debt;
    return d.receiverBudget?.budgetName || `Budget #${d.receiverBudgetId}`;
  }

  lenderName(): string {
    const d = this.payload().debt;
    return d.lenderBudget?.budgetName || `Budget #${d.lenderBudgetId}`;
  }

  setPercentage(ratio: number): void {
    const total = this.payload().debt.amount;
    const val =
      ratio === 1
        ? total
        : Math.round((total * ratio + Number.EPSILON) * 100) / 100;
    this.form.patchValue({ amount: val });
  }

  @ShowLoader({ name: 'payDebtLoader' })
  async onFormSubmit(): Promise<void> {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errors.set([]);
    const payload = this.form.getRawValue();
    const resp = await this.debtService.pay(this.payload().debt.id, payload);
    this.errors.set(resp.errors);

    if (resp.isSuccess) {
      await this.close(resp.response);
    }
  }
}
