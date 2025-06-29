import { Component, OnInit } from '@angular/core';
import { DialogContentBaseComponent } from '../dialog-content-base.component';
import { Observable } from 'rxjs';
import { NgIf } from '@angular/common';
import { WrappedResponse } from '../../../util/field-error-wrapper';

@Component({
  standalone: true,
  template: `
    <div class="p-2">
      <h3>{{ message }}</h3>
    </div>

    <div *ngIf="!payload.isSuccess">
      <p>
        Request trace id:
        <strong>{{ payload.errorResp?.data?.requestTraceId }}</strong>
      </p>
    </div>

    <div class="p-2" *ngIf="payload.isSuccess">
      <p>
        Request trace id:
        <strong>{{ payload.response.requestTraceId }}</strong>
      </p>
    </div>

    <button class="btn btn-outline-dark" (click)="showData()">View Data</button>

    <hr *ngIf="dataToView" />
    <div class="pt-2" style="max-height: 450px; overflow-y: auto">
      <pre>{{ dataToView }}</pre>
    </div>

    <div class="d-flex flex-wrap justify-content-center">
      <div class="p-2">
        <button (click)="close(undefined)" class="btn btn-dark">Close</button>
      </div>
    </div>
  `,
  imports: [NgIf],
})
export class RequestResultDialogComponent
  extends DialogContentBaseComponent<WrappedResponse<any>>
  implements OnInit
{
  constructor() {
    super();
  }

  message!: string;
  dataToView!: string;

  ngOnInit(): void {
    if (this.payload.isSuccess) {
      this.message = 'Operation succeeded!';
    } else {
      // const beesStatusCode = this.payload.r
      // this.message = `Operation failed with ${beesStatusCode || this.payload.errorResp?.status}`;
    }
  }

  getIcon(): Observable<string> {
    if (this.payload.isSuccess) {
      return this.checkIcon();
    }
    return this.warningTriangleIcon();
  }

  showData(): void {
    if (this.payload.isSuccess) {
      this.dataToView = JSON.stringify(this.payload.response, null, 2);
    } else {
      this.dataToView = JSON.stringify(this.payload.errors, null, 2);
    }
  }
}
