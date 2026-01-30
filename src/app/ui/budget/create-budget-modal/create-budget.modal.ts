import { Component, model, OnInit } from '@angular/core';
import { IonContent, ModalController } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { ModalContentBaseComponent } from '../../../shared/modal/modals/modal-content-base.component';
import { ShellConfigHeader } from '../../../shared/modal/shells/modal-shell.types';
import { BudgetFormComponent } from '../budget-form/budget-form.component';
import { LoaderComponent } from '../../../shared/loader/loader.component';
import { FieldError } from '../../../shared/field-error/field-error';
import { CreateBudgetPayload } from '../../../api/budget/dto/create-budget.payload';
import { ShowLoader } from '../../../shared/loader/show.loader.decorator';
import { BudgetService } from '../../../api/budget/budget.service';
import { BudgetSliderService } from '../budget-slider/budget-slider.service';

@Component({
  selector: 'app-create-budget-modal',
  templateUrl: './create-budget.modal.html',
  styleUrls: ['./create-budget.modal.scss'],
  imports: [IonContent, FormsModule, BudgetFormComponent, LoaderComponent],
})
export class CreateBudgetModal
  extends ModalContentBaseComponent<any, any>
  implements OnInit
{
  errors = model<FieldError[]>([]);

  constructor(
    private modalCtrl: ModalController,
    private budgetService: BudgetService,
    private budgetSliderService: BudgetSliderService,
  ) {
    super();
  }

  ngOnInit(): void {
    queueMicrotask(() => {
      const cfg = this.shellConfig() as ShellConfigHeader;
      cfg.title = 'Create Budget';
      cfg.showCloseButton = true;
    });
  }

  name!: string;

  cancel(): void {
    void this.modalCtrl.dismiss(null, 'cancel');
  }

  @ShowLoader({ name: 'createBudgetLoader' })
  protected async onFormSubmit(payload: CreateBudgetPayload): Promise<void> {
    this.errors.set([]);

    const resp = await this.budgetService.create(payload);
    this.errors.set(resp.errors);
    if (resp.isSuccess) {
      this.budgetSliderService.setBudget(resp.response);
      void this.close(true);
    }
  }
}
