import { Component, model, OnInit } from '@angular/core';
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
import { BudgetSliderService } from '../budget-slider/budget-slider.service';

@Component({
  selector: 'app-create-budget-modal',
  template: `
    <app-loader loaderName="budgetDetailsLoader"></app-loader>
    @if (statistics(); as stats) {
      <app-budget-details
        (editTriggered)="openEditBudgetModal()"
        (budgetUpdated)="onBudgetUpdated()"
        (refreshRequested)="onRefreshRequested()"
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
    private modalService: ModalService,
    private budgetService: BudgetService,
    private budgetSliderService: BudgetSliderService,
  ) {
    super();
  }

  async ngOnInit(): Promise<void> {
    await this.loadStatistic();
  }

  @ShowLoader({ name: 'budgetDetailsLoader' })
  private async loadStatistic(): Promise<void> {
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

  protected onBudgetUpdated(): void {
    this.setDismissalData(true);
    void this.refreshSliderIfNeeded();
  }

  protected async onRefreshRequested(): Promise<void> {
    this.setDismissalData(true);
    await this.loadStatistic();
    await this.refreshSliderIfNeeded();
  }

  private async refreshSliderIfNeeded(): Promise<void> {
    const currentSliderBudgetId = this.budgetSliderService.currentBudget().id;
    if (currentSliderBudgetId > 0) {
      await this.budgetSliderService.refreshStatistic(currentSliderBudgetId);
    }
  }

  protected async openEditBudgetModal(): Promise<void> {
    const modal = await this.modalService.open(
      EditBudgetModal,
      new EditBudgetPayload(this.payload().budgetId),
      { shellType: ShellType.HEADER, title: '' },
    );

    const { data } = await modal.onDidDismiss<boolean>();
    if (data) {
      await this.onRefreshRequested();
    }
  }
}
