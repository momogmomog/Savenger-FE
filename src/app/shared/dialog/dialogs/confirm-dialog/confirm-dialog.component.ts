import { Component, OnInit } from '@angular/core';
import { DialogContentBaseComponent } from '../dialog-content-base.component';
import { ConfirmDialogPayload } from './confirm-dialog-payload.model';
import { Observable } from 'rxjs';

@Component({
  standalone: true,
  template: `
    <div class="p-2">
      <p>{{ message }}</p>
    </div>

    <div class="d-flex flex-wrap justify-content-center">
      <div class="p-2">
        <button (click)="close(false)" class="btn">Cancel</button>
      </div>
      <div class="p-2">
        <button (click)="close(true)" class="btn btn-dark">
          {{ confirmMessage }}
        </button>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent
  extends DialogContentBaseComponent<ConfirmDialogPayload>
  implements OnInit
{
  constructor() {
    super();
  }

  message!: string;
  confirmMessage!: string;

  ngOnInit(): void {
    this.message = this.payload.message;
    this.confirmMessage = this.payload.confirmMessage || 'Confirm';
  }

  getIcon(): Observable<string> {
    return this.warningTriangleIcon();
  }
}
