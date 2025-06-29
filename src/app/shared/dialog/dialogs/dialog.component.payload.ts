import { Type } from '@angular/core';
import { DialogContentBaseComponent } from './dialog-content-base.component';

export class DialogComponentPayload {
  constructor(
    public readonly title: string,
    public readonly contentComponentType: Type<DialogContentBaseComponent<any>>,
    public readonly contentPayload: any,
  ) {}
}
