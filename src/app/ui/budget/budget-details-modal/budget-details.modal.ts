import { Component, model, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { ModalContentBaseComponent } from '../../../shared/modal/modals/modal-content-base.component';
import {
  ShellConfigHeader,
  ShellType,
} from '../../../shared/modal/shells/modal-shell.types';
import { BudgetService } from '../../../api/budget/budget.service';
import { BudgetDetailsModalPayload } from './budget-details.modal.payload';
import { BudgetStatistics } from '../../../api/budget/budget.statistics';
import { BudgetDetailsPage } from '../budget-details/budget-details.component';
import { LoaderComponent } from '../../../shared/loader/loader.component';
import { ShowLoader } from '../../../shared/loader/show.loader.decorator';
import { ModalService } from '../../../shared/modal/modal.service';
import { EditBudgetModal } from '../edit-budget-modal/edit-budget.modal';
import { EditBudgetPayload } from '../edit-budget-modal/edit-budget.payload';

@Component({
  selector: 'app-create-budget-modal',
  template: `
    <app-loader loaderName="budgetDetailsLoader"></app-loader>
    @if (statistics(); as stats) {
      <app-budget-details
        (editTriggered)="openEditBudgetModal()"
        (budgetUpdated)="setDismissalData(true)"
        (navigateAway)="dismiss()"
        [stats]="stats"
      ></app-budget-details>
    }
  `,
  imports: [FormsModule, BudgetDetailsPage, LoaderComponent],
})
export class BudgetDetailsModal
  extends ModalContentBaseComponent<BudgetDetailsModalPayload, boolean>
  implements OnInit
{
  statistics = model<BudgetStatistics>();

  constructor(
    private modalCtrl: ModalController,
    private modalService: ModalService,
    private budgetService: BudgetService,
  ) {
    super();
  }

  async ngOnInit(): Promise<void> {
    await this.loadStatistic();
  }

  @ShowLoader({ name: 'budgetDetailsLoader' })
  private async loadStatistic(): Promise<void> {
    this.statistics.set(undefined);

    const resp = await this.budgetService.getStatistics(
      this.payload().budgetId,
    );
    if (!resp.isSuccess) {
      console.log(resp);
      await this.dismiss();
      return;
    }

    const stats = resp.response;
    this.statistics.set(stats);

    queueMicrotask(() => {
      const cfg = this.shellConfig() as ShellConfigHeader;
      cfg.title = `Details for ${stats.budget.budgetName}`;
      cfg.showCloseButton = true;
    });
  }

  protected async openEditBudgetModal(): Promise<void> {
    const modal = await this.modalService.open(
      EditBudgetModal,
      new EditBudgetPayload(this.payload().budgetId),
      { shellType: ShellType.HEADER, title: '' },
    );

    const { data } = await modal.onDidDismiss<boolean>();
    if (data) {
      void this.loadStatistic();
      this.setDismissalData(true);
    }
  }
}
