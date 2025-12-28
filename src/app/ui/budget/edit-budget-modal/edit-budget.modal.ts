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
import { EditBudgetPayload } from './edit-budget.payload';
import { Budget } from '../../../api/budget/budget';

@Component({
  selector: 'app-edit-budget-modal',
  templateUrl: './edit-budget.modal.html',
  styleUrls: ['./edit-budget.modal.scss'],
  imports: [IonContent, FormsModule, BudgetFormComponent, LoaderComponent],
})
export class EditBudgetModal
  extends ModalContentBaseComponent<EditBudgetPayload, any>
  implements OnInit
{
  errors = model<FieldError[]>([]);
  budget = model<Budget>();

  constructor(
    private modalCtrl: ModalController,
    private budgetService: BudgetService,
  ) {
    super();
  }

  async ngOnInit(): Promise<void> {
    const resp = await this.budgetService.get(this.payload().budgetId);
    if (!resp.isSuccess) {
      console.log(resp);
      this.cancel();
      return;
    }

    this.budget.set(resp.response);

    queueMicrotask(() => {
      const cfg = this.shellConfig() as ShellConfigHeader;
      cfg.title = `Update ${resp.response.budgetName}`;
      cfg.showCloseButton = true;
    });
  }

  name!: string;

  cancel(): void {
    void this.modalCtrl.dismiss(null, 'cancel');
  }

  @ShowLoader({ name: 'editBudgetLoader' })
  protected async onFormSubmit(payload: CreateBudgetPayload): Promise<void> {
    this.errors.set([]);

    const resp = await this.budgetService.edit(this.budget()!.id, payload);
    this.errors.set(resp.errors);
    if (resp.isSuccess) {
      void this.close(true);
    }
  }
}
