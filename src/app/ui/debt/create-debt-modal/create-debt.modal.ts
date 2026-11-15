import { Component, effect, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { swapHorizontalOutline, walletOutline } from 'ionicons/icons';
import { ModalContentBaseComponent } from '../../../shared/modal/modals/modal-content-base.component';
import { Budget } from '../../../api/budget/budget';
import { CreateDebtPayload } from '../../../api/debt/create-debt.payload';
import { Debt } from '../../../api/debt/debt';
import { DebtService } from '../../../api/debt/debt.service';
import { Formified, FormUtil } from '../../../shared/util/forms.util';
import { FieldError } from '../../../shared/field-error/field-error';
import { ErrorMessageComponent } from '../../../shared/field-error/error-message/error-message.component';
import { LoaderComponent } from '../../../shared/loader/loader.component';
import { ShowLoader } from '../../../shared/loader/show.loader.decorator';
import { BudgetSelectControlComponent } from '../../budget/budget-select-control/budget-select-control.component';
import { InputComponent } from '../../../shared/form-controls/input/input.component';
import { ShellConfigHeader } from '../../../shared/modal/shells/modal-shell.types';

export class CreateDebtModalPayload {
  constructor(
    public readonly receiverBudget: Budget,
    public readonly defaultLenderBudgetId?: number,
    public readonly receiverRealBalance?: number,
  ) {}
}

@Component({
  selector: 'app-create-debt-modal',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    ReactiveFormsModule,
    IonContent,
    IonButton,
    IonIcon,
    LoaderComponent,
    ErrorMessageComponent,
    BudgetSelectControlComponent,
    InputComponent,
  ],
  styleUrls: ['../../../../theme/budget.scss'],
  template: `
    <ion-content class="ion-padding">
      <app-loader loaderName="createDebtLoader"></app-loader>

      <div class="debt-modal-banner">
        <div>
          <div class="budget-stat-label">Borrowing Into (Receiver)</div>
          <div class="font-bold text-dark">
            {{ payload().receiverBudget.budgetName }}
          </div>
        </div>
        <div class="ion-text-end">
          <div class="budget-stat-label">Available Balance</div>
          <div class="font-bold text-compensate">
            {{
              payload().receiverRealBalance ?? payload().receiverBudget.balance
                | currency
            }}
          </div>
        </div>
      </div>

      <form #debtForm [formGroup]="form" (ngSubmit)="onFormSubmit()">
        <app-field-error [errors]="errors()" fieldName=""></app-field-error>
        <app-field-error
          [errors]="errors()"
          fieldName="receiverBudgetId"
        ></app-field-error>

        <div class="ion-margin-top">
          <app-budget-select-control
            formControlName="lenderBudgetId"
            [label]="'Select Lender Budget'"
            [excludedBudgetIds]="[payload().receiverBudget.id]"
          ></app-budget-select-control>
          <app-field-error
            [errors]="errors()"
            fieldName="lenderBudgetId"
          ></app-field-error>
        </div>

        <div class="ion-margin-top">
          <app-input
            formControlName="debtAmount"
            label="Amount to Borrow"
            type="number"
            placeholder="0.00"
          ></app-input>
          <app-field-error
            [errors]="errors()"
            fieldName="debtAmount"
          ></app-field-error>
        </div>

        <div class="ion-margin-top">
          <ion-button
            [form]="debtForm"
            type="submit"
            expand="block"
            shape="round"
            [disabled]="!form.valid"
          >
            <ion-icon slot="start" name="swap-horizontal-outline"></ion-icon>
            Borrow Funds
          </ion-button>
        </div>
      </form>
    </ion-content>
  `,
})
export class CreateDebtModal
  extends ModalContentBaseComponent<CreateDebtModalPayload, Debt | null>
  implements OnInit
{
  form: Formified<CreateDebtPayload>;
  errors = signal<FieldError[]>([]);

  constructor(private debtService: DebtService) {
    super();
    addIcons({ swapHorizontalOutline, walletOutline });

    this.form = new FormGroup({
      receiverBudgetId: FormUtil.requiredNumber(),
      lenderBudgetId: FormUtil.requiredNumber(),
      debtAmount: FormUtil.requiredNumber(),
    });

    effect(() => {
      const p = this.payload();
      this.form.patchValue({
        receiverBudgetId: p.receiverBudget.id,
        lenderBudgetId: p.defaultLenderBudgetId ?? null!,
      });
    });
  }

  ngOnInit(): void {
    queueMicrotask(() => {
      const cfg = this.shellConfig() as ShellConfigHeader;
      cfg.title = 'Borrow Funds';
      cfg.showCloseButton = true;
    });
  }

  @ShowLoader({ name: 'createDebtLoader' })
  async onFormSubmit(): Promise<void> {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errors.set([]);
    const payload = this.form.getRawValue();
    const resp = await this.debtService.create(payload);
    this.errors.set(resp.errors);

    if (resp.isSuccess) {
      await this.close(resp.response);
    }
  }
}
