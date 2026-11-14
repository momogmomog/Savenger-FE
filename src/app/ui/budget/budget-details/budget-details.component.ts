import {
  Component,
  computed,
  inject,
  model,
  OnInit,
  output,
  signal,
} from '@angular/core';
import {
  CommonModule,
  CurrencyPipe,
  DatePipe,
  PercentPipe,
} from '@angular/common';
import {
  ActionSheetController,
  IonAvatar,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonProgressBar,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  alertCircleOutline,
  arrowBack,
  arrowDownCircleOutline,
  arrowUpCircleOutline,
  calendarOutline,
  checkmarkCircleOutline,
  chevronDownOutline,
  createOutline,
  ellipsisVertical,
  folderOpenOutline,
  pencilOutline,
  peopleOutline,
  personAddOutline,
  pricetagsOutline,
  stopCircleOutline,
  swapHorizontalOutline,
  trashOutline,
  walletOutline,
} from 'ionicons/icons';
import { BudgetStatistics } from '../../../api/budget/budget.statistics';
import { ModalService } from '../../../shared/modal/modal.service';
import { ManageParticipantsModal } from '../manage-participants/manage-participants.modal';
import { ShellType } from '../../../shared/modal/shells/modal-shell.types';
import { Category } from '../../../api/category/category';
import { CategoryService } from '../../../api/category/category.service';
import { CreateCategoryModal } from '../../category/create-category.modal';
import { TagService } from '../../../api/tag/tag.service';
import { Tag } from '../../../api/tag/tag';
import { CreateTagModal } from '../../tag/create-tag.modal';
import { TransactionType } from '../../../api/transaction/transaction.type';
import { TransactionUtils } from '../../../shared/util/transaction-utils';
import { Debt } from '../../../api/debt/debt';
import { DebtService } from '../../../api/debt/debt.service';
import { DebtQuery, DebtQueryImpl } from '../../../api/debt/debt.query';
import { PaginatedListState } from '../../../shared/util/paginated-list.state';
import {
  CreateDebtModal,
  CreateDebtModalPayload,
} from '../../debt/create-debt-modal/create-debt.modal';
import {
  DebtDetailsModal,
  DebtDetailsModalPayload,
} from '../../debt/debt-details-modal/debt-details.modal';
import { ObjectUtils } from '../../../shared/util/object-utils';
import { RRuleUtils } from '../../../shared/util/rrule-utils';

export enum BudgetDetailsSectionTab {
  CATEGORIES = 'CATEGORIES',
  TAGS = 'TAGS',
  PARTICIPANTS = 'PARTICIPANTS',
}

@Component({
  selector: 'app-budget-details',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    PercentPipe,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonProgressBar,
    IonNote,
    IonLabel,
    IonItem,
    IonList,
    IonBadge,
    IonAvatar,
    IonSegment,
    IonSegmentButton,
    IonSpinner,
  ],
  templateUrl: './budget-details.component.html',
  styleUrls: ['./budget-details.component.scss'],
})
export class BudgetDetailsPage implements OnInit {
  private actionSheetCtrl = inject(ActionSheetController);
  private modalService = inject(ModalService);
  private categoryService = inject(CategoryService);
  private tagService = inject(TagService);
  private debtService = inject(DebtService);

  protected readonly TransactionType = TransactionType;
  protected readonly TransactionUtils = TransactionUtils;
  protected readonly BudgetDetailsSectionTab = BudgetDetailsSectionTab;

  stats = model.required<BudgetStatistics>();
  protected categories = model<Category[]>([]);
  protected tags = model<Tag[]>([]);

  selectedTab = signal<BudgetDetailsSectionTab>(
    BudgetDetailsSectionTab.CATEGORIES,
  );
  isLoadingDebts = signal<boolean>(false);
  totalDebtsCount = signal<number>(0);

  debtPagination = new PaginatedListState<Debt>();
  debts = this.debtPagination.items;
  hasNextDebtPage = this.debtPagination.hasNextPage;
  private debtQuery: DebtQuery = new DebtQueryImpl();

  navigateAway = output<void>();
  editTriggered = output<void>();
  budgetUpdated = output<void>();
  refreshRequested = output<void>();

  usagePercentage = computed(() => {
    return TransactionUtils.getUtilizationPercentage(
      this.stats().expensesAmount,
      this.stats().budget.budgetCap,
    );
  });

  healthColor = computed(() => {
    return TransactionUtils.getUtilizationGradient(
      this.stats().expensesAmount,
      this.stats().budget.budgetCap,
    );
  });

  pendingTransactions = computed(() => {
    return this.stats().balance - this.stats().realBalance;
  });

  humanReadableRule = computed(() => {
    return (
      RRuleUtils.toHumanReadableText(this.stats().budget.recurringRule) ||
      this.stats().budget.recurringRule
    );
  });

  constructor() {
    addIcons({
      arrowBack,
      ellipsisVertical,
      walletOutline,
      peopleOutline,
      pencilOutline,
      createOutline,
      stopCircleOutline,
      trashOutline,
      personAddOutline,
      folderOpenOutline,
      pricetagsOutline,
      swapHorizontalOutline,
      addCircleOutline,
      calendarOutline,
      alertCircleOutline,
      arrowDownCircleOutline,
      arrowUpCircleOutline,
      checkmarkCircleOutline,
      chevronDownOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.loadCategories(),
      this.loadTags(),
      this.loadDebts(),
    ]);
  }

  private async loadCategories(): Promise<void> {
    this.categories.set(
      await this.categoryService.fetchAllCategories(this.stats().budget.id),
    );
  }

  private async loadTags(): Promise<void> {
    this.tags.set(await this.tagService.fetchAllTags(this.stats().budget.id));
  }

  protected async loadDebts(): Promise<void> {
    this.debtQuery.budgetIds = [this.stats().budget.id];
    this.isLoadingDebts.set(true);
    try {
      await this.debtPagination.reload(this.debtQuery, () =>
        this.fetchDebtsPage(),
      );
    } finally {
      this.isLoadingDebts.set(false);
    }
  }

  private async fetchDebtsPage(): Promise<void> {
    const resp = await this.debtService.search(this.debtQuery);
    if (resp.isSuccess && resp.response) {
      this.totalDebtsCount.set(resp.response.page?.totalElements ?? 0);
      this.debtPagination.appendPage(resp.response, this.debtQuery);
    }
  }

  protected async loadMoreDebts(): Promise<void> {
    if (!this.hasNextDebtPage() || this.isLoadingDebts()) {
      return;
    }
    this.isLoadingDebts.set(true);
    try {
      this.debtQuery.page.pageNumber += 1;
      await this.fetchDebtsPage();
    } finally {
      this.isLoadingDebts.set(false);
    }
  }

  protected isBorrower(debt: Debt): boolean {
    return debt.receiverBudgetId === this.stats().budget.id;
  }

  protected isSettled(debt: Debt): boolean {
    return (debt.amount || 0) <= 0;
  }

  protected getCounterpartBudgetName(debt: Debt): string {
    if (this.isBorrower(debt)) {
      return debt.lenderBudget?.budgetName || `Budget #${debt.lenderBudgetId}`;
    }
    return (
      debt.receiverBudget?.budgetName || `Budget #${debt.receiverBudgetId}`
    );
  }

  protected async openBorrowFundsModal(): Promise<void> {
    const resp = await this.modalService.openAndWait(
      CreateDebtModal,
      new CreateDebtModalPayload(
        this.stats().budget,
        undefined,
        this.stats().realBalance,
      ),
      {
        shellType: ShellType.HEADER,
        title: 'Borrow Funds',
        showCloseButton: true,
      },
    );

    resp.ifConfirmed(async (createdDebt) => {
      if (!ObjectUtils.isNil(createdDebt?.id)) {
        await this.loadDebts();
        this.refreshRequested.emit();
      }
    });
  }

  protected async openDebtDetails(debt: Debt): Promise<void> {
    const resp = await this.modalService.openAndWait(
      DebtDetailsModal,
      new DebtDetailsModalPayload(debt.id, this.stats().budget.id, debt),
      { shellType: ShellType.BLANK },
    );

    if (!ObjectUtils.isNil(resp.result)) {
      await this.loadDebts();
      this.refreshRequested.emit();
    }
  }

  protected async openManageParticipantsModal(): Promise<void> {
    const modal = await this.modalService.open(
      ManageParticipantsModal,
      this.stats().budget,
      {
        shellType: ShellType.HEADER,
        title: `Manage Participants`,
        showCloseButton: true,
      },
    );

    const { data } = await modal.onDidDismiss();
    if (data) {
      this.stats.set({
        ...this.stats(),
        budget: data,
      });
      this.budgetUpdated.emit();
    }
  }

  protected async openAddCategoryModal(): Promise<void> {
    const reload = await this.modalService.openAndWait(
      CreateCategoryModal,
      this.stats().budget,
      {
        shellType: ShellType.HEADER,
        title: `Add Category`,
        showCloseButton: true,
      },
    );

    reload.ifConfirmed((confirmed) => {
      if (confirmed) {
        void this.loadCategories();
      }
    });
  }

  protected async openAddTagModal(): Promise<void> {
    const reload = await this.modalService.openAndWait(
      CreateTagModal,
      this.stats().budget,
      {
        shellType: ShellType.HEADER,
        title: `Add Tag`,
        showCloseButton: true,
      },
    );

    reload.ifConfirmed((confirmed) => {
      if (confirmed) {
        void this.loadTags();
      }
    });
  }

  protected onTabChange(event: CustomEvent): void {
    const val = event.detail.value as BudgetDetailsSectionTab;
    if (val) {
      this.selectedTab.set(val);
    }
  }

  async presentActionSheet(): Promise<void> {
    const actionSheet = await this.actionSheetCtrl.create({
      header: this.stats().budget.budgetName,
      buttons: [
        {
          text: 'Borrow Funds',
          icon: 'swap-horizontal-outline',
          handler: (): void => {
            void this.openBorrowFundsModal();
          },
        },
        {
          text: 'Edit Budget',
          icon: 'pencil-outline',
          handler: (): void => {
            this.editTriggered.emit();
          },
        },
        {
          text: 'Manage Participants',
          icon: 'person-add-outline',
          handler: (): void => {
            void this.openManageParticipantsModal();
          },
        },
        {
          text: 'Add Category',
          icon: 'folder-open-outline',
          handler: (): void => {
            void this.openAddCategoryModal();
          },
        },
        {
          text: 'Add Tag',
          icon: 'pricetags-outline',
          handler: (): void => {
            void this.openAddTagModal();
          },
        },
        {
          text: 'Delete',
          role: 'destructive',
          icon: 'trash-outline',
          handler: (): void => {
            alert('del');
            console.log('Delete clicked');
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

  protected onNavigate(): void {
    this.navigateAway.emit();
  }
}
