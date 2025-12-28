import { Component, OnInit, signal } from '@angular/core';
import { BudgetService } from '../../../api/budget/budget.service';
import { BudgetQuery, BudgetQueryImpl } from '../../../api/budget/budget.query';
import {
  ActionSheetController,
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonList,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { BudgetCardComponent } from '../budget-card/budget-card.component';
import { Budget } from '../../../api/budget/budget';
import { RefresherCustomEvent } from '@ionic/angular';
import { ModalService } from '../../../shared/modal/modal.service';
import { BudgetDetailsModal } from '../budget-details-modal/budget-details.modal';
import { BudgetDetailsModalPayload } from '../budget-details-modal/budget-details.modal.payload';
import { CreateBudgetModal } from '../create-budget-modal/create-budget.modal';
import { ShellType } from '../../../shared/modal/shells/modal-shell.types';
import { addIcons } from 'ionicons';
import { add, archive, ellipsisVertical } from 'ionicons/icons';
import { AppRoutingPath } from '../../../app-routing.path';
import { EditBudgetModal } from '../edit-budget-modal/edit-budget.modal';
import { EditBudgetPayload } from '../edit-budget-modal/edit-budget.payload';

@Component({
  selector: 'app-list-budgets',
  templateUrl: './list-budgets.component.html',
  styleUrls: ['./list-budgets.component.scss'],
  imports: [
    IonList,
    BudgetCardComponent,
    IonRefresher,
    IonRefresherContent,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonFab,
    IonFabButton,
    IonIcon,
    IonButton,
    IonButtons,
  ],
})
export class ListBudgetsComponent implements OnInit {
  private budgetQuery: BudgetQuery = new BudgetQueryImpl();
  budgets = signal<Budget[]>([]);

  constructor(
    private budgetService: BudgetService,
    private modalService: ModalService,
    private actionSheetCtrl: ActionSheetController,
  ) {
    addIcons({
      add,
      ellipsisVertical,
      archive,
    });
  }

  ngOnInit(): void {
    void this.updateFilters();
  }

  private async updateFilters(): Promise<void> {
    this.budgetQuery.page.pageNumber = 0;
    await this.fetchData();
  }

  private async fetchData(): Promise<void> {
    this.budgets.set([]);
    const budgets = await this.budgetService.search(this.budgetQuery);

    if (budgets.isSuccess) {
      this.budgets.set(budgets.response.content);
    }
  }

  protected navigateToDetails(id: number): void {
    void this.modalService.open(
      BudgetDetailsModal,
      new BudgetDetailsModalPayload(id),
    );
  }

  protected async handleRefresh($event: RefresherCustomEvent): Promise<void> {
    await this.updateFilters();
    void $event.target.complete();
  }

  protected async openCreateBudgetModal(): Promise<void> {
    const modal = await this.modalService.open(
      CreateBudgetModal,
      {},
      { shellType: ShellType.HEADER, title: '' },
    );

    const { data } = await modal.onDidDismiss<boolean>();
    if (data) {
      void this.updateFilters();
    }
  }

  protected async openEditBudgetModal(budget: Budget): Promise<void> {
    const modal = await this.modalService.open(
      EditBudgetModal,
      new EditBudgetPayload(budget.id),
      { shellType: ShellType.HEADER, title: '' },
    );

    const { data } = await modal.onDidDismiss<boolean>();
    if (data) {
      void this.updateFilters();
    }
  }

  async presentBudgetQueryActionSheet(): Promise<void> {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Search options',
      buttons: [
        {
          text: this.budgetQuery.active ? 'Show inactive' : 'Hide inactive',
          icon: 'archive',
          handler: (): void => {
            this.budgetQuery.active = !this.budgetQuery.active || null;
            void this.updateFilters();
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

  protected readonly routes = AppRoutingPath;
}
