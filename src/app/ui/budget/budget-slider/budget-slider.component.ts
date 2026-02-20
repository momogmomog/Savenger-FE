import { Component, effect, OnInit, signal, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Budget } from '../../../api/budget/budget';
import { UiSwiperComponent } from '../../../shared/ui-swiper/ui-swiper.component';
import { BudgetSliderItemComponent } from './budget-slider-item.component';
import { BudgetSliderService } from './budget-slider.service';
import { BudgetService } from '../../../api/budget/budget.service';
import { STORAGE_CURRENT_BUDGET_ID } from '../../../shared/general.constants';
import { BudgetDetailsModal } from '../budget-details-modal/budget-details.modal';
import { BudgetDetailsModalPayload } from '../budget-details-modal/budget-details.modal.payload';
import { ModalService } from '../../../shared/modal/modal.service';
import { AutoUnsubComponent } from '../../../shared/util/auto-unsub.component';
import { UserService } from '../../../api/user/user.service';

@Component({
  selector: 'app-budget-slider',
  standalone: true,
  imports: [CommonModule, UiSwiperComponent, BudgetSliderItemComponent],
  template: `
    <div>
      <app-ui-swiper
        [items]="budgets()"
        [activeIndex]="activeSlideIndex()"
        [itemTemplate]="budgetCardTemplate"
        (swipe)="handleAccountSwipe($event.item)"
      >
      </app-ui-swiper>

      <ng-template #budgetCardTemplate let-item let-i="index">
        <app-budget-slider-item
          (detailsClicked)="onDetailsClick()"
          [budget]="item"
        ></app-budget-slider-item>
      </ng-template>
    </div>
  `,
})
export class BudgetSliderComponent
  extends AutoUnsubComponent
  implements OnInit
{
  budgets = this.budgetSliderService.fetchedBudgets;
  activeSlideIndex = signal<number>(0);

  currentBudget = this.budgetSliderService.currentBudget;

  constructor(
    private budgetSliderService: BudgetSliderService,
    private budgetService: BudgetService,
    private modalService: ModalService,
    private userService: UserService,
  ) {
    super();
    effect(() => {
      const targetBudget = this.budgetSliderService.currentBudget();
      if (targetBudget === BudgetSliderService.INITIAL_BUDGET) {
        return;
      }

      const currentList = untracked(this.budgets);
      const index = currentList.findIndex((b) => b.id === targetBudget.id);

      if (index >= 0) {
        this.activeSlideIndex.set(index);
      } else {
        const newList = this.budgetSliderService.addToBudgetList(targetBudget);
        this.activeSlideIndex.set(newList.length - 1);
      }
    });

    effect(() => {
      const list = this.budgets();
      const currentBudget = untracked(this.budgetSliderService.currentBudget);

      if (list.length === 0 || !this.budgetSliderService.isStorageInitialized())
        return;

      const foundIndex = list.findIndex((b) => b.id === currentBudget.id);

      if (foundIndex === -1) {
        void this.budgetSliderService.setBudget(list[0]);
      } else {
        this.activeSlideIndex.set(foundIndex);
      }
    });
  }

  async ngOnInit(): Promise<void> {
    this.sub = this.userService.currentUser$.subscribe(async (user) => {
      console.log(user);
      await this.initialize();
    });
  }

  private async initialize(): Promise<void> {
    await this.budgetSliderService.initializeFromStorage();
  }

  handleAccountSwipe(budget: Budget): void {
    localStorage.setItem(STORAGE_CURRENT_BUDGET_ID, budget.id + '');
    void this.budgetSliderService.setBudget(budget);
  }

  async onDetailsClick(): Promise<void> {
    const current = this.currentBudget();

    // TODO: consider removing edit options when called from here OR fetch budgets on change
    await this.modalService.open(
      BudgetDetailsModal,
      new BudgetDetailsModalPayload(current.id),
    );
  }
}
