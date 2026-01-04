import { Component, effect, OnInit, signal, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Budget } from '../../../api/budget/budget';
import { UiSwiperComponent } from '../../../shared/ui-swiper/ui-swiper.component';
import { BudgetSliderItemComponent } from './budget-slider-item.component';
import { BudgetSliderService } from './budget-slider.service';
import { BudgetQuery, BudgetQueryImpl } from '../../../api/budget/budget.query';
import { BudgetService } from '../../../api/budget/budget.service';
import { STORAGE_CURRENT_BUDGET_ID } from '../../../shared/general.constants';
import { BudgetDetailsModal } from '../budget-details-modal/budget-details.modal';
import { BudgetDetailsModalPayload } from '../budget-details-modal/budget-details.modal.payload';
import { ModalService } from '../../../shared/modal/modal.service';

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
export class BudgetSliderComponent implements OnInit {
  private budgetQuery: BudgetQuery = new BudgetQueryImpl();

  budgets = signal<Budget[]>([]);
  activeSlideIndex = signal<number>(0);

  currentBudget = this.budgetSliderService.currentBudget;

  // budget-slider.component.ts

  constructor(
    private budgetSliderService: BudgetSliderService,
    private budgetService: BudgetService,
    private modalService: ModalService,
  ) {
    effect(() => {
      const targetBudget = this.budgetSliderService.currentBudget();
      const currentList = untracked(this.budgets);

      const index = currentList.findIndex((b) => b.id === targetBudget.id);

      if (index >= 0) {
        this.activeSlideIndex.set(index);
      } else {
        const newList = [...currentList, targetBudget];
        this.budgets.set(newList);
        this.activeSlideIndex.set(newList.length - 1);
      }
    });

    effect(() => {
      const list = this.budgets();
      const currentBudget = untracked(this.budgetSliderService.currentBudget);

      if (list.length === 0) return;

      const foundIndex = list.findIndex((b) => b.id === currentBudget.id);

      if (foundIndex === -1) {
        this.budgetSliderService.setBudget(list[0]);
      } else {
        this.activeSlideIndex.set(foundIndex);
      }
    });
  }

  async ngOnInit(): Promise<void> {
    const resp = await this.budgetService.search(this.budgetQuery);
    const fetchedBudgets = resp.response.content;

    this.budgets.set(fetchedBudgets);
    this.initializeFromStorage(fetchedBudgets);
  }

  private initializeFromStorage(budgets: Budget[]): void {
    if (budgets.length === 0) return;

    const storedId = Number(localStorage.getItem(STORAGE_CURRENT_BUDGET_ID));
    const found = budgets.find((b) => b.id === storedId);

    if (found) {
      this.budgetSliderService.setBudget(found);
    } else {
      // Default to first if storage is invalid/empty
      this.budgetSliderService.setBudget(budgets[0]);
    }
  }

  handleAccountSwipe(budget: Budget): void {
    localStorage.setItem(STORAGE_CURRENT_BUDGET_ID, budget.id + '');
    this.budgetSliderService.setBudget(budget);
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
