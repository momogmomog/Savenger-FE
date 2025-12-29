import { Component, inject, model, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AlertController,
  IonAvatar,
  IonButton,
  IonCard,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { peopleOutline, personAddOutline, trashOutline } from 'ionicons/icons';
import { AddParticipantModal } from '../add-participant/add-participant.modal';
import { BudgetFull } from '../../../api/budget/budget';
import { BudgetService } from '../../../api/budget/budget.service';
import { OtherUser } from '../../../api/user/user';
import { ModalService } from '../../../shared/modal/modal.service';
import { AddParticipantModalPayload } from '../add-participant/add-participant.modal.payload';
import { ShellType } from '../../../shared/modal/shells/modal-shell.types';
import { ModalContentBaseComponent } from '../../../shared/modal/modals/modal-content-base.component';

@Component({
  selector: 'app-manage-participants',
  standalone: true,
  imports: [
    CommonModule,
    IonList,
    IonItem,
    IonAvatar,
    IonLabel,
    IonButton,
    IonIcon,
    IonListHeader,
    IonCard,
  ],
  template: `
    <ion-card class="ion-padding">
      <ion-list lines="none">
        <ion-list-header>
          <ion-label>
            Current Participants ({{ budget().participants.length }})
          </ion-label>
          <ion-button fill="clear" size="small" (click)="openAddModal()">
            <ion-icon slot="start" name="person-add-outline"></ion-icon>
            Add
          </ion-button>
        </ion-list-header>

        @for (user of budget().participants; track user.id) {
          <ion-item class="participant-item">
            <ion-avatar slot="start">
              <img
                [src]="
                  'https://ui-avatars.com/api/?name=' +
                  user.username +
                  '&background=random'
                "
                alt="avatar"
              />
            </ion-avatar>

            <ion-label>
              <h2>{{ user.username }}</h2>
            </ion-label>

            <ion-button
              slot="end"
              fill="clear"
              color="danger"
              (click)="confirmRemove(user)"
            >
              <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
            </ion-button>
          </ion-item>
        } @empty {
          <div class="empty-state">
            <ion-icon name="people-outline" class="empty-icon"></ion-icon>
            <p>No participants yet.</p>
            <ion-button fill="outline" size="small" (click)="openAddModal()">
              Invite Someone
            </ion-button>
          </div>
        }
      </ion-list>
    </ion-card>
  `,
  styles: [
    `
      .participant-item {
        --padding-start: 0;
      }
      ion-list-header {
        padding-inline-start: 0;
        margin-bottom: 10px;
        font-weight: 700;
        font-size: 1.1em;
      }
      .empty-state {
        text-align: center;
        padding: 30px 10px;
        color: var(--ion-color-medium);
      }
      .empty-icon {
        font-size: 3rem;
        opacity: 0.5;
        margin-bottom: 10px;
      }
    `,
  ],
})
export class ManageParticipantsModal
  extends ModalContentBaseComponent<BudgetFull, BudgetFull>
  implements OnInit
{
  private budgetService = inject(BudgetService);
  private alertCtrl = inject(AlertController);
  private modalService = inject(ModalService);

  budget = model.required<BudgetFull>();

  constructor() {
    super();
    addIcons({ trashOutline, personAddOutline, peopleOutline });
  }

  ngOnInit(): void {
    this.budget.set(this.payload());
  }

  async openAddModal(): Promise<void> {
    const modal = await this.modalService.open(
      AddParticipantModal,
      new AddParticipantModalPayload(this.budget()),
      {
        shellType: ShellType.HEADER,
        title: 'Add participant',
      },
      {
        breakpoints: [0, 0.6, 0.9],
        initialBreakpoint: 0.6,
      },
    );

    const { data } = await modal.onWillDismiss();

    if (data) {
      this.budget.set(data);
      this.setDismissalData(data);
    }
  }

  async confirmRemove(user: OtherUser): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Remove Participant?',
      message: `Are you sure you want to remove ${user.username} from this budget?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Remove',
          role: 'destructive',
          handler: (): void => void this.removeParticipant(user),
        },
      ],
    });

    await alert.present();
  }

  private async removeParticipant(user: OtherUser): Promise<void> {
    const payload = {
      budgetId: this.budget().id,
      participantId: user.id,
    };

    const resp = await this.budgetService.unassignParticipant(
      this.budget().id,
      payload,
    );

    if (resp.isSuccess) {
      this.budget.set(resp.response);
      this.setDismissalData(resp.response);

      void this.modalService.showSuccess('Participant Removed!');
    } else {
      void this.modalService.showDangerToast(
        resp.errors[0]?.message || 'Could not remove participant',
      );
    }
  }
}
