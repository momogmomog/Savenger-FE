import { ModalContentBaseComponent } from '../../shared/modal/modals/modal-content-base.component';
import { Budget } from '../../api/budget/budget';
import { Component, signal } from '@angular/core';
import { CategoryService } from '../../api/category/category.service';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { ShowLoader } from '../../shared/loader/show.loader.decorator';
import { FieldError } from '../../shared/field-error/field-error';
import { CreateCategoryPayload } from '../../api/category/create-category.payload';
import { CategoryFormComponent } from './category-form/category-form.component';

@Component({
  template: ` <app-loader loaderName="catLoader"></app-loader>
    <app-category-form
      [budgetId]="payload().id"
      [errors]="errors()"
      (formSubmitted)="onFormSubmit($event)"
    ></app-category-form>`,
  imports: [LoaderComponent, CategoryFormComponent],
})
export class CreateCategoryModal extends ModalContentBaseComponent<
  Budget,
  boolean
> {
  errors = signal<FieldError[]>([]);

  constructor(private categoryService: CategoryService) {
    super();
  }

  @ShowLoader({ name: 'catLoader' })
  async onFormSubmit(payload: CreateCategoryPayload): Promise<void> {
    this.errors.set([]);

    const resp = await this.categoryService.create(payload);
    if (resp.isSuccess) {
      void this.close(true);
      return;
    }
  }
}
