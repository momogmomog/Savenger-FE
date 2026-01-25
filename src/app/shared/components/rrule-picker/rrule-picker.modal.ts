import { Component, effect, signal, untracked } from '@angular/core';
import { ModalContentBaseComponent } from '../../modal/modals/modal-content-base.component';
import { RrulePickerModalPayload } from './rrule-picker.modal.payload';
import { RRule } from 'rrule';
import { RrulePickerComponent } from './rrule-picker.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormUtil } from '../../util/forms.util';
import { ObjectUtils } from '../../util/object-utils';
import { ActionSheetController, IonButton } from '@ionic/angular/standalone';

@Component({
  template: `
    <ng-container [formGroup]="formGroup()">
      <app-rrule-picker
        [formControlName]="formControlName()"
      ></app-rrule-picker>
    </ng-container>

    <div class="ion-margin-top ion-text-end">
      <ion-button size="small" color="secondary" (click)="pickPresets()"
        >Presets</ion-button
      >
      <ion-button size="small" (click)="closeWithRRule()">Close</ion-button>
    </div>
  `,
  imports: [RrulePickerComponent, ReactiveFormsModule, IonButton],
})
export class RrulePickerModal extends ModalContentBaseComponent<
  RrulePickerModalPayload,
  RRule
> {
  formGroup = signal<FormGroup>(
    new FormGroup({
      recurringRule: FormUtil.requiredString(),
    }),
  );

  formControlName = signal<string>('recurringRule');

  constructor(private actionSheetCtrl: ActionSheetController) {
    super();

    effect(() => {
      const payload = this.payload();

      if (payload.formGroup) {
        this.formGroup.set(payload.formGroup);
        this.formControlName.set(payload.formControlName!);
      } else if (!ObjectUtils.isNil(payload.existingRrule)) {
        untracked<FormGroup>(this.formGroup).patchValue({
          recurringRule: payload.existingRrule,
        });
      }
    });
  }

  closeWithRRule(): void {
    const rrule = this.formGroup().controls[this.formControlName()].value;
    if (ObjectUtils.isNil(rrule)) {
      void this.dismiss();
      return;
    }
    void this.dismiss(RRule.fromString(rrule));
  }

  async pickPresets(): Promise<void> {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Recurrence presets',
      buttons: [
        {
          text: 'Every month on the 10th',
          handler: (): void => {
            this.formGroup().controls[this.formControlName()].setValue(
              'FREQ=MONTHLY;INTERVAL=1;BYMONTHDAY=10',
            );
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
          data: { action: 'cancel' },
        },
      ],
    });
    await actionSheet.present();
  }
}
