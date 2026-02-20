import { ModalContentBaseComponent } from '../../shared/modal/modals/modal-content-base.component';
import { Budget } from '../../api/budget/budget';
import { Component, signal } from '@angular/core';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { ShowLoader } from '../../shared/loader/show.loader.decorator';
import { FieldError } from '../../shared/field-error/field-error';
import { TagFormComponent } from './tag-form/tag-form.component';
import { CreateTagPayload } from '../../api/tag/create-tag.payload';
import { TagService } from '../../api/tag/tag.service';

@Component({
  template: ` <app-loader loaderName="tagLoader"></app-loader>
    <app-tag-form
      [budgetId]="payload().id"
      [errors]="errors()"
      (formSubmitted)="onFormSubmit($event)"
    ></app-tag-form>`,
  imports: [LoaderComponent, TagFormComponent],
})
export class CreateTagModal extends ModalContentBaseComponent<Budget, boolean> {
  errors = signal<FieldError[]>([]);

  constructor(private tagService: TagService) {
    super();
  }

  @ShowLoader({ name: 'tagLoader' })
  async onFormSubmit(payload: CreateTagPayload): Promise<void> {
    this.errors.set([]);

    const resp = await this.tagService.create(payload);
    if (resp.isSuccess) {
      void this.close(true);
      return;
    }
  }
}
