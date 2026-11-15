import { Component, model, OnInit, signal } from '@angular/core';
import { ModalContentBaseComponent } from '../../../shared/modal/modals/modal-content-base.component';
import { Debt } from '../../../api/debt/debt';
import { DebtService } from '../../../api/debt/debt.service';
import { ModalService } from '../../../shared/modal/modal.service';
import { LoaderComponent } from '../../../shared/loader/loader.component';
import { ShowLoader } from '../../../shared/loader/show.loader.decorator';
import { DebtDetailsComponent } from '../debt-details/debt-details.component';
import {
  PayDebtModal,
  PayDebtModalPayload,
} from '../pay-debt-modal/pay-debt.modal';
import {
  CreateDebtModal,
  CreateDebtModalPayload,
} from '../create-debt-modal/create-debt.modal';
import { ShellType } from '../../../shared/modal/shells/modal-shell.types';
import { ObjectUtils } from '../../../shared/util/object-utils';
import { BudgetSliderService } from '../../budget/budget-slider/budget-slider.service';
import { Budget, EmptyBudget } from '../../../api/budget/budget';
import { BudgetService } from '../../../api/budget/budget.service';
import { BudgetStatistics } from '../../../api/budget/budget.statistics';

export class DebtDetailsModalPayload {
  constructor(
    public readonly debtId: number,
    public readonly perspectiveBudgetId?: number,
    public readonly initialDebt?: Debt,
  ) {}
}

@Component({
  selector: 'app-debt-details-modal',
  standalone: true,
  imports: [LoaderComponent, DebtDetailsComponent],
  template: `
    <app-loader loaderName="debtDetailsLoader"></app-loader>

    @if (debt(); as d) {
      <app-debt-details
        [debt]="d"
        [receiverStats]="receiverStats()"
        [lenderStats]="lenderStats()"
        [perspectiveBudgetId]="payload().perspectiveBudgetId ?? null"
        [transactionsReloadTrigger]="transactionsReloadTrigger()"
        (navigateAway)="dismiss()"
        (payTriggered)="onPay()"
        (borrowMoreTriggered)="onBorrowMore()"
        (transactionsUpdated)="onTransactionsUpdated()"
      ></app-debt-details>
    }
  `,
})
export class DebtDetailsModal
  extends ModalContentBaseComponent<DebtDetailsModalPayload, Debt | null>
  implements OnInit
{
  debt = model<Debt>();
  receiverStats = signal<BudgetStatistics | null>(null);
  lenderStats = signal<BudgetStatistics | null>(null);
  transactionsReloadTrigger = signal<number>(0);

  constructor(
    private debtService: DebtService,
    private budgetService: BudgetService,
    private modalService: ModalService,
    private budgetSliderService: BudgetSliderService,
  ) {
    super();
  }

  async ngOnInit(): Promise<void> {
    if (this.payload().initialDebt) {
      this.debt.set(this.payload().initialDebt);
    }
    await this.loadDebt();
  }

  @ShowLoader({ name: 'debtDetailsLoader' })
  async loadDebt(): Promise<void> {
    const resp = await this.debtService.get(this.payload().debtId);
    if (!resp.isSuccess || !resp.response) {
      await this.modalService.showDangerToast('Failed to load debt details');
      await this.dismiss();
      return;
    }

    const loadedDebt = resp.response;
    this.debt.set(loadedDebt);
    await this.loadBudgetStatistics(loadedDebt);
  }

  private async loadBudgetStatistics(d: Debt): Promise<void> {
    const [receiverResp, lenderResp] = await Promise.all([
      this.budgetService.getStatistics(d.receiverBudgetId),
      this.budgetService.getStatistics(d.lenderBudgetId),
    ]);

    if (receiverResp.isSuccess && receiverResp.response) {
      this.receiverStats.set(receiverResp.response);
    }
    if (lenderResp.isSuccess && lenderResp.response) {
      this.lenderStats.set(lenderResp.response);
    }
  }

  async onPay(): Promise<void> {
    const currentDebt = this.debt();
    if (!currentDebt) {
      return;
    }

    const resp = await this.modalService.openAndWait(
      PayDebtModal,
      new PayDebtModalPayload(currentDebt),
      { shellType: ShellType.HEADER, title: 'Pay Debt' },
    );

    resp.ifConfirmed(async (updated) => {
      if (!ObjectUtils.isNil(updated?.id)) {
        await this.loadDebt();
        this.setDismissalData(this.debt()!);
        this.transactionsReloadTrigger.update((v) => v + 1);
        await this.refreshCurrentSliderStatsIfNeeded();
      }
    });
  }

  async onBorrowMore(): Promise<void> {
    const currentDebt = this.debt();
    if (!currentDebt) {
      return;
    }

    const receiverBudget: Budget = this.receiverStats()?.budget ||
      currentDebt.receiverBudget ||
      this.budgetSliderService
        .fetchedBudgets()
        .find((b) => b.id === currentDebt.receiverBudgetId) || {
        ...new EmptyBudget(),
        id: currentDebt.receiverBudgetId,
        budgetName: `Budget #${currentDebt.receiverBudgetId}`,
      };

    const resp = await this.modalService.openAndWait(
      CreateDebtModal,
      new CreateDebtModalPayload(
        receiverBudget,
        currentDebt.lenderBudgetId,
        this.receiverStats()?.realBalance,
      ),
      { shellType: ShellType.HEADER, title: 'Borrow Funds' },
    );

    resp.ifConfirmed(async (updated) => {
      if (!ObjectUtils.isNil(updated?.id)) {
        await this.loadDebt();
        this.setDismissalData(this.debt()!);
        this.transactionsReloadTrigger.update((v) => v + 1);
        await this.refreshCurrentSliderStatsIfNeeded();
      }
    });
  }

  async onTransactionsUpdated(): Promise<void> {
    await this.loadDebt();
    if (this.debt()) {
      this.setDismissalData(this.debt()!);
    }
    await this.refreshCurrentSliderStatsIfNeeded();
  }

  private async refreshCurrentSliderStatsIfNeeded(): Promise<void> {
    const d = this.debt();
    const currentSliderBudgetId = this.budgetSliderService.currentBudget().id;
    if (
      d &&
      (d.receiverBudgetId === currentSliderBudgetId ||
        d.lenderBudgetId === currentSliderBudgetId)
    ) {
      await this.budgetSliderService.refreshStatistic(currentSliderBudgetId);
    }
  }
}
