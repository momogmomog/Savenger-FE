import { Component, OnInit } from '@angular/core';
import { ModalContentBaseComponent } from '../../../shared/modal/modals/modal-content-base.component';
import { CreateRevisionModalPayload } from './create-revision-modal.payload';
import { Revision } from '../../../api/revision/revision';

@Component({
  selector: 'app-create-revision-modal',
  templateUrl: './create-revision-modal.component.html',
  styleUrls: ['./create-revision-modal.component.scss'],
})
export class CreateRevisionModalComponent
  extends ModalContentBaseComponent<CreateRevisionModalPayload, Revision>
  implements OnInit
{
  constructor() {
    super();
  }

  ngOnInit(): void {}
}
