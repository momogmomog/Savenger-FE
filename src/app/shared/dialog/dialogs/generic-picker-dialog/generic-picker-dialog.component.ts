import { Component } from '@angular/core';
import { DialogContentBaseComponent } from '../dialog-content-base.component';
import { GenericPickerOption } from './generic-picker.option';
import { Observable } from 'rxjs';
import { DialogService } from '../../dialog.service';
import { GenericPickerResponseImpl } from './generic-picker-response.impl';
import { NgForOf, NgIf } from '@angular/common';
import { CheckboxComponent } from '../../../form-controls/checkbox/checkbox.component';

@Component({
  standalone: true,
  templateUrl: './generic-picker-dialog.component.html',
  imports: [NgIf, NgForOf, CheckboxComponent],
})
export class GenericPickerDialogComponent extends DialogContentBaseComponent<
  GenericPickerOption<any>[]
> {
  selectedObjs: Map<number, GenericPickerOption<any>> = new Map<
    number,
    GenericPickerOption<any>
  >();
  selectAll = false;

  constructor(private dialogService: DialogService) {
    super();
  }

  getIcon(): Observable<string> {
    return super.noIcon();
  }

  showObjDetails(opt: GenericPickerOption<any>): void {
    this.dialogService.openShowCodeDialog(
      JSON.stringify(opt.obj, null, 2),
      `Details for ${opt.displayName}`,
    );
  }

  onOptionSelect(
    selected: boolean,
    ind: number,
    opt: GenericPickerOption<any>,
  ): void {
    if (selected) {
      this.selectedObjs.set(ind, opt);
    } else {
      this.selectedObjs.delete(ind);
    }
  }

  onSelectAllChange(selectAll: boolean): void {
    if (selectAll) {
      this.selectedObjs.clear();
    }

    this.selectAll = selectAll;
  }

  getSelectionNumber(): number {
    if (this.selectAll) {
      return this.payload.length;
    }

    return this.selectedObjs.size;
  }

  async closeWithSelection(): Promise<void> {
    if (!this.selectAll) {
      this.close(
        new GenericPickerResponseImpl<GenericPickerOption<any>>(
          Array.from(this.selectedObjs.values()).map((opt) => opt.obj),
        ),
      );
      return;
    }

    this.close(
      new GenericPickerResponseImpl<GenericPickerOption<any>>(
        this.payload.map((opt) => opt.obj),
      ),
    );
  }
}
