import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonAvatar,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonNote,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  closeOutline,
  personAddOutline,
  searchOutline,
} from 'ionicons/icons';
import { UserService } from '../../../api/user/user.service';
import { BudgetService } from '../../../api/budget/budget.service';
import { OtherUser } from '../../../api/user/user';
import { ModalContentBaseComponent } from '../../../shared/modal/modals/modal-content-base.component';
import { AddParticipantModalPayload } from './add-participant.modal.payload';
import { InputComponent } from '../../../shared/form-controls/input/input.component';
import { BudgetFull } from '../../../api/budget/budget';
import { ModalService } from '../../../shared/modal/modal.service';

@Component({
  selector: 'app-add-participant-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonButton,
    IonItem,
    IonIcon,
    IonSpinner,
    IonNote,
    IonAvatar,
    IonLabel,
    InputComponent,
  ],
  templateUrl: 'add-participant.modal.html',
  styles: [
    `
      .search-item {
        --border-radius: 8px;
      }
      .error-container {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px;
        background: var(--ion-color-danger-contrast);
        border: 1px solid var(--ion-color-danger);
        border-radius: 8px;
      }
      .found-user-card {
        border: 1px solid var(--ion-color-light-shade);
        border-radius: 12px;
        padding: 12px;
      }
      .user-item {
        --background: transparent;
        margin-bottom: 10px;
      }
    `,
  ],
})
export class AddParticipantModal extends ModalContentBaseComponent<
  AddParticipantModalPayload,
  BudgetFull
> {
  private modalService = inject(ModalService);
  private userService = inject(UserService);
  private budgetService = inject(BudgetService);

  searchQuery = '';
  isLoading = signal(false);
  isAdding = signal(false);
  errorMessage = signal<string | null>(null);
  foundUser = signal<OtherUser | null>(null);

  constructor() {
    super();
    addIcons({
      closeOutline,
      searchOutline,
      personAddOutline,
      alertCircleOutline,
    });
  }

  async searchUser(): Promise<void> {
    if (!this.searchQuery.trim()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.foundUser.set(null);

    try {
      const result = await this.userService.fetchOtherUser(this.searchQuery);

      if (!result.isSuccess) {
        console.log(result);
        this.errorMessage.set(result.errors[0]?.message || 'User not found');
        return;
      }

      const user = result.response;
      this.validateUser(user);
    } finally {
      this.isLoading.set(false);
    }
  }

  validateUser(user: OtherUser): void {
    if (this.budgetService.isOwner(this.payload().budget, user.id)) {
      this.errorMessage.set('This user is the owner of the budget.');
      return;
    }
    if (this.budgetService.isParticipant(this.payload().budget, user.id)) {
      this.errorMessage.set('This user is already a participant.');
      return;
    }

    this.foundUser.set(user);
  }

  async confirmAdd(): Promise<void> {
    const userToAdd = this.foundUser();
    if (!userToAdd) return;

    this.isAdding.set(true);

    const payload = {
      budgetId: this.payload().budget.id,
      participantId: userToAdd.id,
    };

    const result = await this.budgetService.assignParticipant(
      this.payload().budget.id,
      payload,
    );

    this.isAdding.set(false);

    if (result.isSuccess) {
      await this.modalService.showSuccess(
        `${userToAdd.username} added successfully`,
      );

      void this.close(result.response);
    } else {
      this.errorMessage.set(
        result.errors[0]?.message || 'Failed to add participant',
      );
    }
  }
}
