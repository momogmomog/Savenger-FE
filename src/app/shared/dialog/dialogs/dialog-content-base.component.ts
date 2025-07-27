import { Component } from '@angular/core';
import { DialogComponent } from './dialog.component';
import { Observable } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  template: '',
})
export abstract class DialogContentBaseComponent<TData> {
  payload!: TData;
  dialogRef!: MatDialogRef<DialogComponent>;
  setTitle!: (title: string) => void;

  close(result: any): void {
    this.dialogRef.close(result);
  }

  abstract getIcon(): Observable<string>;

  noIcon(): Observable<string> {
    return new Observable<string>((subscriber) => subscriber.next());
  }

  checkIcon(): Observable<string> {
    return new Observable<string>((subscriber) =>
      subscriber.next('fa fa-check'),
    );
  }

  gearIcon(): Observable<string> {
    return new Observable<string>((subscriber) =>
      subscriber.next('fa-solid fa-gear'),
    );
  }

  warningTriangleIcon(): Observable<string> {
    return new Observable<string>((subscriber) =>
      subscriber.next('fa fa-exclamation-triangle'),
    );
  }
}
