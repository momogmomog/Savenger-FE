import { Component, inject, OnInit } from '@angular/core';
import {
  IonFab,
  IonFabButton,
  IonIcon,
  IonRouterOutlet,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { AppRoutingPath } from '../../../app-routing.path';
import { AutoUnsubComponent } from '../../../shared/util/auto-unsub.component';
import { CreateBudgetModal } from '../create-budget-modal/create-budget.modal';
import { ModalService } from '../../../shared/modal/modal.service';
import { ShellType } from '../../../shared/modal/shells/modal-shell.types';

@Component({
  selector: 'app-budget-page',
  templateUrl: './budget-page.component.html',
  styleUrls: ['./budget-page.component.scss'],
  imports: [IonRouterOutlet, IonFab, IonFabButton, IonIcon],
})
export class BudgetPageComponent extends AutoUnsubComponent implements OnInit {
  routes = AppRoutingPath;
  private modal = inject(ModalService);

  constructor() {
    super();
    addIcons({
      add,
    });
  }

  ngOnInit(): void {}

  protected async openCreateBudgetModal(): Promise<void> {
    void this.modal.open(
      CreateBudgetModal,
      {},
      { shellType: ShellType.HEADER, title: '' },
    );
  }
}
