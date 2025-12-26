import {
  SelectOption,
  SelectOptionKvp,
} from '../../shared/form-controls/select/select.option';
import {
  BUDGET_RECURRENCES,
  BudgetRecurrenceType,
} from '../budget/budget.recurrence';

export class SelectOptions {
  public static budgetRecurrenceOptions(): SelectOption[] {
    return [new SelectOptionKvp('Choose one', null)].concat(
      ...Object.keys(BudgetRecurrenceType).map(
        // (ent) => new SelectOptionKey(ent),
        (ent) =>
          new SelectOptionKvp(
            ent,
            BUDGET_RECURRENCES[ent as BudgetRecurrenceType],
          ),
      ),
    );
  }
}
