import { Component, model, OnInit } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { ModalContentBaseComponent } from '../../../shared/modal/modals/modal-content-base.component';
import { CreatePrepaymentModalPayload } from './create-prepayment.modal.payload';
import { Prepayment } from '../../../api/prepayment/prepayment';
import { FieldError } from '../../../shared/field-error/field-error';
import { PrepaymentService } from '../../../api/prepayment/prepayment.service';
import { ShellConfigHeader } from '../../../shared/modal/shells/modal-shell.types';
import { ShowLoader } from '../../../shared/loader/show.loader.decorator';
import { CreatePrepaymentPayload } from '../../../api/prepayment/create-prepayment.payload';
import { LoaderComponent } from '../../../shared/loader/loader.component';
import { PrepaymentFormComponent } from '../prepayment-form/prepayment-form.component';

@Component({
  selector: 'app-create-prepayment-modal',
  template: `
    <ion-content>
      <app-loader loaderName="createPrepaymentLoader"></app-loader>
      <app-prepayment-form
        [errors]="errors()"
        [budgetId]="payload().budgetId"
        (formSubmitted)="onFormSubmit($event)"
      ></app-prepayment-form>
    </ion-content>
  `,
  imports: [IonContent, LoaderComponent, PrepaymentFormComponent],
})
export class CreatePrepaymentModal
  extends ModalContentBaseComponent<
    CreatePrepaymentModalPayload,
    Prepayment | null
  >
  implements OnInit
{
  errors = model<FieldError[]>([]);

  constructor(private prepaymentService: PrepaymentService) {
    super();
  }

  ngOnInit(): void {
    queueMicrotask(() => {
      const cfg = this.shellConfig() as ShellConfigHeader;
      cfg.title = 'Create Prepayment';
      cfg.showCloseButton = true;
    });
  }

  @ShowLoader({ name: 'createPrepaymentLoader' })
  async onFormSubmit(payload: CreatePrepaymentPayload): Promise<void> {
    this.errors.set([]);
    const resp = await this.prepaymentService.create(payload);
    this.errors.set(resp.errors);

    if (resp.isSuccess) {
      void this.close(resp.response);
    }
  }
}
