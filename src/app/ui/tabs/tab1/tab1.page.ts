import { Component } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { ModalService } from '../../../shared/modal/modal.service';
import { RrulePickerModal } from '../../../shared/components/rrule-picker/rrule-picker.modal';
import { RrulePickerModalPayload } from '../../../shared/components/rrule-picker/rrule-picker.modal.payload';
import { ShellType } from '../../../shared/modal/shells/modal-shell.types';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton],
})
export class Tab1Page {
  constructor(private modalService: ModalService) {}

  async openRrulePicker(): Promise<void> {
    const resp = await this.modalService.openAndWait(
      RrulePickerModal,
      RrulePickerModalPayload.empty(),
      {
        shellType: ShellType.HEADER,
        title: 'Configure Recurrence',
      },
    );

    resp.ifConfirmed((rrule) => {
      if (rrule) {
        console.log(rrule.toString());
        alert(rrule.toText());
      }
    });
  }
}
