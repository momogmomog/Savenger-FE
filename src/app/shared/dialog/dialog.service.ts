import { Injectable } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { firstValueFrom, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DialogContentBaseComponent } from './dialogs/dialog-content-base.component';
import { DialogComponent } from './dialogs/dialog.component';
import { DialogComponentPayload } from './dialogs/dialog.component.payload';
import { ShowCodeDialogComponent } from './dialogs/show-code-dialog/show-code-dialog.component';
import { ShowCodePayload } from './dialogs/show-code-dialog/show-code-payload.model';
import { ConfirmDialogPayload } from './dialogs/confirm-dialog/confirm-dialog-payload.model';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';
import { GenericPickerOption } from './dialogs/generic-picker-dialog/generic-picker.option';
import { GenericPickerDialogComponent } from './dialogs/generic-picker-dialog/generic-picker-dialog.component';
import { GenericPickerResponse } from './dialogs/generic-picker-dialog/generic-picker-response.impl';

@Injectable({ providedIn: 'root' })
export class DialogService {
  constructor(private matService: MatDialog) {}

  public open(
    component: ComponentType<DialogContentBaseComponent<any>>,
    title: string,
    dataPayload: any,
  ): MatDialogRef<DialogComponent> {
    return this.matService.open(DialogComponent, {
      data: new DialogComponentPayload(title, component, dataPayload),
      panelClass: 'custom-dialog-container',
    });
  }

  public openConfirmDialog(
    message: string,
    title?: string,
    confirmMessage?: string,
  ): Observable<boolean> {
    const dialogComponentMatDialogRef = this.open(
      ConfirmDialogComponent,
      title || 'Confirm',
      new ConfirmDialogPayload(message, confirmMessage),
    );

    return dialogComponentMatDialogRef
      .afterClosed()
      .pipe(map((value) => value || false));
  }

  public openShowCodeDialog(code: string, title?: string): Observable<void> {
    const dialogComponentMatDialogRef = this.open(
      ShowCodeDialogComponent,
      title || 'Review code',
      new ShowCodePayload(code),
    );

    return dialogComponentMatDialogRef.afterClosed();
  }

  public async openGenericMultiselect<T>(
    options: GenericPickerOption<T>[],
    title?: string,
  ): Promise<T[]> {
    const res: GenericPickerResponse<T> = await firstValueFrom(
      this.open(
        GenericPickerDialogComponent,
        title || 'Select Items',
        options,
      ).afterClosed(),
    );

    if (!res) {
      return await this.openGenericMultiselect(options, title);
    }

    return res.items;
  }
}
