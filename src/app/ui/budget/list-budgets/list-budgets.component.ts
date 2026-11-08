import { Component, OnInit } from '@angular/core';
import { BudgetService } from '../../../api/budget/budget.service';
import { BudgetQuery, BudgetQueryImpl } from '../../../api/budget/budget.query';
import {
  ActionSheetController,
  InfiniteScrollCustomEvent,
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonList,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
  RefresherCustomEvent,
} from '@ionic/angular/standalone';
import { BudgetCardComponent } from '../budget-card/budget-card.component';
import { Budget } from '../../../api/budget/budget';
import { ModalService } from '../../../shared/modal/modal.service';
import { BudgetDetailsModal } from '../budget-details-modal/budget-details.modal';
import { BudgetDetailsModalPayload } from '../budget-details-modal/budget-details.modal.payload';
import { CreateBudgetModal } from '../create-budget-modal/create-budget.modal';
import { ShellType } from '../../../shared/modal/shells/modal-shell.types';
import { addIcons } from 'ionicons';
import { add, archive, ellipsisVertical } from 'ionicons/icons';
import { EditBudgetModal } from '../edit-budget-modal/edit-budget.modal';
import { EditBudgetPayload } from '../edit-budget-modal/edit-budget.payload';
import { PaginatedListState } from '../../../shared/util/paginated-list.state';

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
    IonInfiniteScroll,
    IonInfiniteScrollContent,
  ],
})
export class ListBudgetsComponent implements OnInit {
  private budgetQuery: BudgetQuery = new BudgetQueryImpl();
  pagination = new PaginatedListState<Budget>();
  budgets = this.pagination.items;
  hasNextPage = this.pagination.hasNextPage;

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
    await this.pagination.reload(this.budgetQuery, () => this.fetchData());
  }

  private async fetchData(): Promise<void> {
    const budgets = await this.budgetService.search(this.budgetQuery);

    if (budgets.isSuccess) {
      this.pagination.appendPage(budgets.response, this.budgetQuery);
    }
  }

  protected async navigateToDetails(id: number): Promise<void> {
    const modal = await this.modalService.open(
      BudgetDetailsModal,
      new BudgetDetailsModalPayload(id),
    );

    const { data } = await modal.onWillDismiss<boolean>();
    if (data) {
      void this.updateFilters();
    }
  }

  protected async handleRefresh($event: RefresherCustomEvent): Promise<void> {
    await this.pagination.handleRefresh($event, () => this.updateFilters());
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

  async onIonInfinite(event: InfiniteScrollCustomEvent): Promise<void> {
    await this.pagination.loadMore(event, this.budgetQuery, () =>
      this.fetchData(),
    );
  }
}
