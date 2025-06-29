import { Component, OnInit } from '@angular/core';
import { DialogContentBaseComponent } from '../dialog-content-base.component';
import { Observable } from 'rxjs';
import { ShowCodePayload } from './show-code-payload.model';

@Component({
  standalone: true,
  template: `
    <div class="dialog-content-container">
      <div class="p-2" style="max-height: 450px; overflow-y: auto">
        <pre>{{ code }}</pre>
      </div>

      <div class="d-flex flex-wrap justify-content-end">
        <div class="p-2">
          <button (click)="close(false)" class="btn">Close</button>
        </div>
        <div class="p-2">
          <button class="btn btn-success" (click)="copy()">Copy</button>
        </div>
      </div>
    </div>
  `,
})
export class ShowCodeDialogComponent
  extends DialogContentBaseComponent<ShowCodePayload>
  implements OnInit
{
  constructor() {
    super();
  }

  code!: string;

  ngOnInit(): void {
    this.code = this.payload.code;
  }

  copy(): void {
    navigator.clipboard.writeText(this.code);
  }

  getIcon(): Observable<string> {
    return this.noIcon();
  }
}
